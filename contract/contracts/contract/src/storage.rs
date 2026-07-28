use soroban_sdk::{Address, Env};
use crate::types::{DataKey, Escrow};
use crate::errors::EscrowError;

// TTL Extension Constants (Ledger counts based on ~5 seconds per ledger)
pub const INSTANCE_BUMP_AMOUNT: u32 = 518_400; // ~30 days
pub const INSTANCE_THRESHOLD: u32 = 172_800;   // ~10 days

pub const PERSISTENT_BUMP_AMOUNT: u32 = 1_555_200; // ~90 days
pub const PERSISTENT_THRESHOLD: u32 = 518_400;   // ~30 days

pub fn extend_instance_ttl(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_THRESHOLD, INSTANCE_BUMP_AMOUNT);
}

pub fn get_admin(env: &Env) -> Result<Address, EscrowError> {
    extend_instance_ttl(env);
    env.storage()
        .instance()
        .get(&DataKey::Admin)
        .ok_or(EscrowError::NotInitialized)
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&DataKey::Admin, admin);
    extend_instance_ttl(env);
}

pub fn get_next_escrow_id(env: &Env) -> u64 {
    extend_instance_ttl(env);
    env.storage()
        .instance()
        .get(&DataKey::NextEscrowId)
        .unwrap_or(1)
}

pub fn increment_escrow_id(env: &Env) -> u64 {
    let current_id = get_next_escrow_id(env);
    let next_id = current_id + 1;
    env.storage()
        .instance()
        .set(&DataKey::NextEscrowId, &next_id);
    extend_instance_ttl(env);
    current_id
}

pub fn get_escrow(env: &Env, id: u64) -> Result<Escrow, EscrowError> {
    let key = DataKey::Escrow(id);
    if let Some(escrow) = env.storage().persistent().get::<DataKey, Escrow>(&key) {
        env.storage()
            .persistent()
            .extend_ttl(&key, PERSISTENT_THRESHOLD, PERSISTENT_BUMP_AMOUNT);
        Ok(escrow)
    } else {
        Err(EscrowError::EscrowNotFound)
    }
}

pub fn save_escrow(env: &Env, escrow: &Escrow) {
    let key = DataKey::Escrow(escrow.id);
    env.storage().persistent().set(&key, escrow);
    env.storage()
        .persistent()
        .extend_ttl(&key, PERSISTENT_THRESHOLD, PERSISTENT_BUMP_AMOUNT);
}
