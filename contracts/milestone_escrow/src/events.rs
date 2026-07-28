use soroban_sdk::{symbol_short, Address, Env, String};

pub fn emit_escrow_created(
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

pub fn emit_milestone_submitted(
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

pub fn emit_milestone_approved(
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

pub fn emit_dispute_opened(
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

pub fn emit_dispute_resolved(
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

pub fn emit_escrow_cancelled(env: &Env, escrow_id: u64, refunded_amount: i128) {
    env.events().publish(
        (symbol_short!("escrow"), symbol_short!("cancel")),
        (escrow_id, refunded_amount),
    );
}
