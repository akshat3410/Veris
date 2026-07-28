use soroban_sdk::contracterror;

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
