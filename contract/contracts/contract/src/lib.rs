#![no_std]

#[cfg(test)]
mod test;

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env, String, Vec};

// ===== Error Types =====

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum EscrowError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    NotAuthorized = 3,
    EscrowNotFound = 4,
    MilestoneNotFound = 5,
    InvalidStatus = 6,
    InvalidMilestoneStatus = 7,
    InvalidAmount = 8,
    InvalidMilestoneSum = 9,
    SplitAmountMismatch = 10,
    EscrowAlreadyCancelled = 11,
    ZeroMilestones = 12,
}

// ===== Data Types =====

#[contracttype]
pub enum DataKey {
    Admin,
    NextEscrowId,
    Escrow(u64),
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum MilestoneStatus {
    Pending,
    Submitted,
    Approved,
    Disputed,
    Resolved,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum EscrowStatus {
    Funded,
    InDevelopment,
    Completed,
    Disputed,
    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct MilestoneInput {
    pub title: String,
    pub amount: i128,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Milestone {
    pub index: u32,
    pub title: String,
    pub amount: i128,
    pub status: MilestoneStatus,
    pub proof_cid: String,
    pub dispute_reason_cid: String,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Escrow {
    pub id: u64,
    pub depositor: Address,
    pub beneficiary: Address,
    pub arbiter: Address,
    pub token: Address,
    pub total_amount: i128,
    pub released_amount: i128,
    pub status: EscrowStatus,
    pub milestones: Vec<Milestone>,
    pub created_at: u64,
    pub title: String,
}

// ===== Storage Helpers =====

const INSTANCE_THRESHOLD: u32 = 172_800;
const INSTANCE_BUMP_AMOUNT: u32 = 518_400;
const PERSISTENT_THRESHOLD: u32 = 518_400;
const PERSISTENT_BUMP_AMOUNT: u32 = 1_555_200;

fn extend_instance_ttl(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_THRESHOLD, INSTANCE_BUMP_AMOUNT);
}

fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&DataKey::Admin, admin);
    extend_instance_ttl(env);
}

fn get_next_escrow_id(env: &Env) -> u64 {
    extend_instance_ttl(env);
    env.storage()
        .instance()
        .get(&DataKey::NextEscrowId)
        .unwrap_or(1)
}

fn increment_escrow_id(env: &Env) -> u64 {
    let current = get_next_escrow_id(env);
    env.storage()
        .instance()
        .set(&DataKey::NextEscrowId, &(current + 1));
    extend_instance_ttl(env);
    current
}

fn load_escrow(env: &Env, id: u64) -> Result<Escrow, EscrowError> {
    let key = DataKey::Escrow(id);
    if let Some(escrow) = env.storage().persistent().get::<_, Escrow>(&key) {
        env.storage()
            .persistent()
            .extend_ttl(&key, PERSISTENT_THRESHOLD, PERSISTENT_BUMP_AMOUNT);
        Ok(escrow)
    } else {
        Err(EscrowError::EscrowNotFound)
    }
}

fn save_escrow(env: &Env, escrow: &Escrow) {
    let key = DataKey::Escrow(escrow.id);
    env.storage().persistent().set(&key, escrow);
    env.storage()
        .persistent()
        .extend_ttl(&key, PERSISTENT_THRESHOLD, PERSISTENT_BUMP_AMOUNT);
}

// ===== Event Helpers =====

fn emit_escrow_created(
    env: &Env,
    escrow_id: u64,
    depositor: &Address,
    beneficiary: &Address,
    total_amount: i128,
) {
    env.events().publish(
        (symbol_short!("escrow"), symbol_short!("created")),
        (escrow_id, depositor.clone(), beneficiary.clone(), total_amount),
    );
}

fn emit_milestone_submitted(
    env: &Env,
    escrow_id: u64,
    milestone_index: u32,
    proof_cid: &String,
) {
    env.events().publish(
        (symbol_short!("milestone"), symbol_short!("submit")),
        (escrow_id, milestone_index, proof_cid.clone()),
    );
}

fn emit_milestone_approved(
    env: &Env,
    escrow_id: u64,
    milestone_index: u32,
    amount: i128,
) {
    env.events().publish(
        (symbol_short!("milestone"), symbol_short!("approve")),
        (escrow_id, milestone_index, amount),
    );
}

fn emit_dispute_opened(
    env: &Env,
    escrow_id: u64,
    milestone_index: u32,
    reason_cid: &String,
) {
    env.events().publish(
        (symbol_short!("dispute"), symbol_short!("opened")),
        (escrow_id, milestone_index, reason_cid.clone()),
    );
}

fn emit_dispute_resolved(
    env: &Env,
    escrow_id: u64,
    milestone_index: u32,
    beneficiary_payout: i128,
    depositor_refund: i128,
) {
    env.events().publish(
        (symbol_short!("dispute"), symbol_short!("resolved")),
        (escrow_id, milestone_index, beneficiary_payout, depositor_refund),
    );
}

fn emit_escrow_cancelled(env: &Env, escrow_id: u64, refunded_amount: i128) {
    env.events().publish(
        (symbol_short!("escrow"), symbol_short!("cancel")),
        (escrow_id, refunded_amount),
    );
}

// ===== Contract =====

#[contract]
pub struct MilestoneEscrowContract;

#[contractimpl]
impl MilestoneEscrowContract {
    pub fn initialize(env: Env, admin: Address) -> Result<(), EscrowError> {
        admin.require_auth();
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(EscrowError::AlreadyInitialized);
        }
        set_admin(&env, &admin);
        Ok(())
    }

    pub fn create_escrow(
        env: Env,
        depositor: Address,
        beneficiary: Address,
        arbiter: Address,
        token: Address,
        title: String,
        milestones_input: Vec<MilestoneInput>,
    ) -> Result<u64, EscrowError> {
        depositor.require_auth();

        if milestones_input.is_empty() {
            return Err(EscrowError::ZeroMilestones);
        }

        let mut total_amount: i128 = 0;
        let mut milestones: Vec<Milestone> = Vec::new(&env);

        for (i, item) in milestones_input.iter().enumerate() {
            if item.amount <= 0 {
                return Err(EscrowError::InvalidAmount);
            }
            total_amount = total_amount
                .checked_add(item.amount)
                .ok_or(EscrowError::InvalidAmount)?;

            milestones.push_back(Milestone {
                index: i as u32,
                title: item.title.clone(),
                amount: item.amount,
                status: MilestoneStatus::Pending,
                proof_cid: String::from_str(&env, ""),
                dispute_reason_cid: String::from_str(&env, ""),
            });
        }

        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&depositor, &env.current_contract_address(), &total_amount);

        let escrow_id = increment_escrow_id(&env);

        let escrow = Escrow {
            id: escrow_id,
            depositor: depositor.clone(),
            beneficiary: beneficiary.clone(),
            arbiter: arbiter.clone(),
            token: token.clone(),
            total_amount,
            released_amount: 0,
            status: EscrowStatus::Funded,
            milestones,
            created_at: env.ledger().timestamp(),
            title,
        };

        save_escrow(&env, &escrow);
        emit_escrow_created(&env, escrow_id, &depositor, &beneficiary, total_amount);

        Ok(escrow_id)
    }

    pub fn submit_milestone_work(
        env: Env,
        escrow_id: u64,
        milestone_index: u32,
        proof_cid: String,
    ) -> Result<(), EscrowError> {
        let mut escrow = load_escrow(&env, escrow_id)?;
        escrow.beneficiary.require_auth();

        if escrow.status == EscrowStatus::Cancelled {
            return Err(EscrowError::EscrowAlreadyCancelled);
        }

        let mut milestone = escrow
            .milestones
            .get(milestone_index)
            .ok_or(EscrowError::MilestoneNotFound)?;

        if milestone.status == MilestoneStatus::Approved
            || milestone.status == MilestoneStatus::Resolved
        {
            return Err(EscrowError::InvalidMilestoneStatus);
        }

        milestone.proof_cid = proof_cid.clone();
        milestone.status = MilestoneStatus::Submitted;
        escrow.milestones.set(milestone_index, milestone);
        escrow.status = EscrowStatus::InDevelopment;

        save_escrow(&env, &escrow);
        emit_milestone_submitted(&env, escrow_id, milestone_index, &proof_cid);

        Ok(())
    }

    pub fn approve_milestone(
        env: Env,
        caller: Address,
        escrow_id: u64,
        milestone_index: u32,
    ) -> Result<(), EscrowError> {
        caller.require_auth();
        let mut escrow = load_escrow(&env, escrow_id)?;

        if caller != escrow.depositor && caller != escrow.arbiter {
            return Err(EscrowError::NotAuthorized);
        }

        if escrow.status == EscrowStatus::Cancelled {
            return Err(EscrowError::EscrowAlreadyCancelled);
        }

        let mut milestone = escrow
            .milestones
            .get(milestone_index)
            .ok_or(EscrowError::MilestoneNotFound)?;

        if milestone.status == MilestoneStatus::Approved
            || milestone.status == MilestoneStatus::Resolved
        {
            return Err(EscrowError::InvalidMilestoneStatus);
        }

        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(
            &env.current_contract_address(),
            &escrow.beneficiary,
            &milestone.amount,
        );

        milestone.status = MilestoneStatus::Approved;
        escrow.released_amount = escrow
            .released_amount
            .checked_add(milestone.amount)
            .ok_or(EscrowError::InvalidAmount)?;

        let amount = milestone.amount;
        escrow.milestones.set(milestone_index, milestone);

        let mut all_completed = true;
        for m in escrow.milestones.iter() {
            if m.status != MilestoneStatus::Approved && m.status != MilestoneStatus::Resolved {
                all_completed = false;
                break;
            }
        }

        if all_completed {
            escrow.status = EscrowStatus::Completed;
        }

        save_escrow(&env, &escrow);
        emit_milestone_approved(&env, escrow_id, milestone_index, amount);

        Ok(())
    }

    pub fn dispute_milestone(
        env: Env,
        caller: Address,
        escrow_id: u64,
        milestone_index: u32,
        reason_cid: String,
    ) -> Result<(), EscrowError> {
        caller.require_auth();
        let mut escrow = load_escrow(&env, escrow_id)?;

        if caller != escrow.depositor && caller != escrow.beneficiary {
            return Err(EscrowError::NotAuthorized);
        }

        if escrow.status == EscrowStatus::Cancelled {
            return Err(EscrowError::EscrowAlreadyCancelled);
        }

        let mut milestone = escrow
            .milestones
            .get(milestone_index)
            .ok_or(EscrowError::MilestoneNotFound)?;

        if milestone.status == MilestoneStatus::Approved
            || milestone.status == MilestoneStatus::Resolved
        {
            return Err(EscrowError::InvalidMilestoneStatus);
        }

        milestone.status = MilestoneStatus::Disputed;
        milestone.dispute_reason_cid = reason_cid.clone();
        escrow.milestones.set(milestone_index, milestone);
        escrow.status = EscrowStatus::Disputed;

        save_escrow(&env, &escrow);
        emit_dispute_opened(&env, escrow_id, milestone_index, &reason_cid);

        Ok(())
    }

    pub fn resolve_dispute(
        env: Env,
        escrow_id: u64,
        milestone_index: u32,
        beneficiary_amount: i128,
        depositor_amount: i128,
    ) -> Result<(), EscrowError> {
        let mut escrow = load_escrow(&env, escrow_id)?;
        escrow.arbiter.require_auth();

        let mut milestone = escrow
            .milestones
            .get(milestone_index)
            .ok_or(EscrowError::MilestoneNotFound)?;

        if milestone.status != MilestoneStatus::Disputed {
            return Err(EscrowError::InvalidMilestoneStatus);
        }

        if beneficiary_amount < 0 || depositor_amount < 0 {
            return Err(EscrowError::InvalidAmount);
        }

        if beneficiary_amount + depositor_amount != milestone.amount {
            return Err(EscrowError::SplitAmountMismatch);
        }

        let token_client = token::Client::new(&env, &escrow.token);

        if beneficiary_amount > 0 {
            token_client.transfer(
                &env.current_contract_address(),
                &escrow.beneficiary,
                &beneficiary_amount,
            );
        }

        if depositor_amount > 0 {
            token_client.transfer(
                &env.current_contract_address(),
                &escrow.depositor,
                &depositor_amount,
            );
        }

        milestone.status = MilestoneStatus::Resolved;
        escrow.released_amount = escrow
            .released_amount
            .checked_add(milestone.amount)
            .ok_or(EscrowError::InvalidAmount)?;

        escrow.milestones.set(milestone_index, milestone);

        let mut all_completed = true;
        for m in escrow.milestones.iter() {
            if m.status != MilestoneStatus::Approved && m.status != MilestoneStatus::Resolved {
                all_completed = false;
                break;
            }
        }

        if all_completed {
            escrow.status = EscrowStatus::Completed;
        }

        save_escrow(&env, &escrow);
        emit_dispute_resolved(
            &env,
            escrow_id,
            milestone_index,
            beneficiary_amount,
            depositor_amount,
        );

        Ok(())
    }

    pub fn cancel_escrow(env: Env, escrow_id: u64) -> Result<(), EscrowError> {
        let mut escrow = load_escrow(&env, escrow_id)?;
        escrow.depositor.require_auth();

        if escrow.released_amount > 0 {
            return Err(EscrowError::InvalidStatus);
        }

        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(
            &env.current_contract_address(),
            &escrow.depositor,
            &escrow.total_amount,
        );

        escrow.status = EscrowStatus::Cancelled;
        save_escrow(&env, &escrow);
        emit_escrow_cancelled(&env, escrow_id, escrow.total_amount);

        Ok(())
    }

    pub fn get_escrow(env: Env, escrow_id: u64) -> Result<Escrow, EscrowError> {
        load_escrow(&env, escrow_id)
    }

    pub fn get_escrow_count(env: Env) -> u64 {
        extend_instance_ttl(&env);
        env.storage()
            .instance()
            .get(&DataKey::NextEscrowId)
            .unwrap_or(1)
            - 1
    }
}
