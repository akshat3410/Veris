#![no_std]

mod errors;
mod events;
mod storage;
mod types;

#[cfg(test)]
mod test;

use errors::EscrowError;
use events::*;
use storage::*;
use types::*;

use soroban_sdk::{contract, contractimpl, token, Address, Env, String, Vec};

#[contract]
pub struct MilestoneEscrowContract;

#[contractimpl]
impl MilestoneEscrowContract {
    /// Initialize the contract with an admin address
    pub fn initialize(env: Env, admin: Address) -> Result<(), EscrowError> {
        admin.require_auth();
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(EscrowError::AlreadyInitialized);
        }
        set_admin(&env, &admin);
        Ok(())
    }

    /// Create a new milestone-based escrow
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

        // Lock funds from depositor to contract address
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&depositor, &env.current_contract_address(), &total_amount);

        let escrow_id = increment_escrow_id(&env);
        let timestamp = env.ledger().timestamp();

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
            created_at: timestamp,
            title,
        };

        save_escrow(&env, &escrow);
        emit_escrow_created(&env, escrow_id, &depositor, &beneficiary, total_amount);

        Ok(escrow_id)
    }

    /// Contractor submits work deliverable proof (IPFS CID)
    pub fn submit_milestone_work(
        env: Env,
        escrow_id: u64,
        milestone_index: u32,
        proof_cid: String,
    ) -> Result<(), EscrowError> {
        let mut escrow = get_escrow(&env, escrow_id)?;
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

    /// Client or Arbiter approves milestone, releasing milestone funds to beneficiary
    pub fn approve_milestone(
        env: Env,
        escrow_id: u64,
        milestone_index: u32,
    ) -> Result<(), EscrowError> {
        let mut escrow = get_escrow(&env, escrow_id)?;

        // Must be authorized by either Depositor or Arbiter
        if escrow.depositor.has_auth() {
            escrow.depositor.require_auth();
        } else {
            escrow.arbiter.require_auth();
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

        // Payout to beneficiary
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

        escrow.milestones.set(milestone_index, milestone);

        // Check if all milestones are complete
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
        emit_milestone_approved(&env, escrow_id, milestone_index, milestone.amount);

        Ok(())
    }

    /// Open dispute on a specific milestone
    pub fn dispute_milestone(
        env: Env,
        escrow_id: u64,
        milestone_index: u32,
        reason_cid: String,
    ) -> Result<(), EscrowError> {
        let mut escrow = get_escrow(&env, escrow_id)?;

        // Authorized by either Depositor or Beneficiary
        if escrow.depositor.has_auth() {
            escrow.depositor.require_auth();
        } else {
            escrow.beneficiary.require_auth();
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

    /// Arbiter resolves dispute with custom payout split
    pub fn resolve_dispute(
        env: Env,
        escrow_id: u64,
        milestone_index: u32,
        beneficiary_amount: i128,
        depositor_amount: i128,
    ) -> Result<(), EscrowError> {
        let mut escrow = get_escrow(&env, escrow_id)?;
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

        // Check overall completion
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

    /// Cancel unstarted escrow and refund remaining funds to depositor
    pub fn cancel_escrow(env: Env, escrow_id: u64) -> Result<(), EscrowError> {
        let mut escrow = get_escrow(&env, escrow_id)?;
        escrow.depositor.require_auth();

        if escrow.released_amount > 0 {
            return Err(EscrowError::InvalidStatus);
        }

        let remaining_balance = escrow.total_amount;
        let token_client = token::Client::new(&env, &escrow.token);

        token_client.transfer(
            &env.current_contract_address(),
            &escrow.depositor,
            &remaining_balance,
        );

        escrow.status = EscrowStatus::Cancelled;

        save_escrow(&env, &escrow);
        emit_escrow_cancelled(&env, escrow_id, remaining_balance);

        Ok(())
    }

    /// Read escrow state by ID
    pub fn get_escrow(env: Env, escrow_id: u64) -> Result<Escrow, EscrowError> {
        get_escrow(&env, escrow_id)
    }

    /// Read total escrows created
    pub fn get_escrow_count(env: Env) -> u64 {
        get_next_escrow_id(&env) - 1
    }
}
