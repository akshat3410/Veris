use soroban_sdk::{contracttype, Address, String, Vec};

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
