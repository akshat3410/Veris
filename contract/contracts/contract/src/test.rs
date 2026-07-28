#![cfg(test)]
use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token, Address, Env, String, Vec,
};

fn create_token_contract<'a>(
    env: &Env,
    admin: &Address,
) -> (token::Client<'a>, token::StellarAssetClient<'a>) {
    let token_address = env.register_stellar_asset_contract_v2(admin.clone()).address();
    (
        token::Client::new(env, &token_address),
        token::StellarAssetClient::new(env, &token_address),
    )
}

#[test]
fn test_create_and_approve_milestones() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(MilestoneEscrowContract, ());
    let client = MilestoneEscrowContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    let depositor = Address::generate(&env);
    let beneficiary = Address::generate(&env);
    let arbiter = Address::generate(&env);

    let (token_client, token_admin) = create_token_contract(&env, &admin);
    token_admin.mint(&depositor, &1000);

    let mut milestones = Vec::new(&env);
    milestones.push_back(MilestoneInput {
        title: String::from_str(&env, "Design & Architecture"),
        amount: 400,
    });
    milestones.push_back(MilestoneInput {
        title: String::from_str(&env, "Smart Contract Implementation"),
        amount: 600,
    });

    let escrow_id = client.create_escrow(
        &depositor,
        &beneficiary,
        &arbiter,
        &token_client.address,
        &String::from_str(&env, "Soroban Escrow System"),
        &milestones,
    );

    assert_eq!(escrow_id, 1);
    assert_eq!(token_client.balance(&depositor), 0);
    assert_eq!(token_client.balance(&contract_id), 1000);

    let escrow = client.get_escrow(&escrow_id);
    assert_eq!(escrow.total_amount, 1000);
    assert_eq!(escrow.status, EscrowStatus::Funded);

    // Contractor submits work for milestone 0
    let proof_cid = String::from_str(&env, "ipfs://QmProof123");
    client.submit_milestone_work(&escrow_id, &0, &proof_cid);

    let escrow_sub = client.get_escrow(&escrow_id);
    assert_eq!(escrow_sub.status, EscrowStatus::InDevelopment);
    assert_eq!(
        escrow_sub.milestones.get(0).unwrap().status,
        MilestoneStatus::Submitted
    );

    // Depositor approves milestone 0
    client.approve_milestone(&depositor, &escrow_id, &0);
    assert_eq!(token_client.balance(&beneficiary), 400);
    assert_eq!(token_client.balance(&contract_id), 600);

    // Contractor submits and depositor approves milestone 1
    client.submit_milestone_work(&escrow_id, &1, &proof_cid);
    client.approve_milestone(&depositor, &escrow_id, &1);

    assert_eq!(token_client.balance(&beneficiary), 1000);
    assert_eq!(token_client.balance(&contract_id), 0);

    let escrow_final = client.get_escrow(&escrow_id);
    assert_eq!(escrow_final.status, EscrowStatus::Completed);
    assert_eq!(escrow_final.released_amount, 1000);
}

#[test]
fn test_dispute_and_resolve_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(MilestoneEscrowContract, ());
    let client = MilestoneEscrowContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    let depositor = Address::generate(&env);
    let beneficiary = Address::generate(&env);
    let arbiter = Address::generate(&env);

    let (token_client, token_admin) = create_token_contract(&env, &admin);
    token_admin.mint(&depositor, &500);

    let mut milestones = Vec::new(&env);
    milestones.push_back(MilestoneInput {
        title: String::from_str(&env, "Milestone 1"),
        amount: 500,
    });

    let escrow_id = client.create_escrow(
        &depositor,
        &beneficiary,
        &arbiter,
        &token_client.address,
        &String::from_str(&env, "Disputed Project"),
        &milestones,
    );

    // Depositor disputes milestone 0
    let reason = String::from_str(&env, "Incomplete deliverable");
    client.dispute_milestone(&depositor, &escrow_id, &0, &reason);

    let escrow_disp = client.get_escrow(&escrow_id);
    assert_eq!(escrow_disp.status, EscrowStatus::Disputed);

    // Arbiter resolves: 300 to beneficiary, 200 refund to depositor
    client.resolve_dispute(&escrow_id, &0, &300, &200);

    assert_eq!(token_client.balance(&beneficiary), 300);
    assert_eq!(token_client.balance(&depositor), 200);
    assert_eq!(token_client.balance(&contract_id), 0);

    let escrow_resolved = client.get_escrow(&escrow_id);
    assert_eq!(escrow_resolved.status, EscrowStatus::Completed);
}

#[test]
fn test_cancel_escrow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(MilestoneEscrowContract, ());
    let client = MilestoneEscrowContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    let depositor = Address::generate(&env);
    let beneficiary = Address::generate(&env);
    let arbiter = Address::generate(&env);

    let (token_client, token_admin) = create_token_contract(&env, &admin);
    token_admin.mint(&depositor, &800);

    let mut milestones = Vec::new(&env);
    milestones.push_back(MilestoneInput {
        title: String::from_str(&env, "Initial Work"),
        amount: 800,
    });

    let escrow_id = client.create_escrow(
        &depositor,
        &beneficiary,
        &arbiter,
        &token_client.address,
        &String::from_str(&env, "Cancelled Escrow"),
        &milestones,
    );

    // Depositor cancels unstarted escrow
    client.cancel_escrow(&escrow_id);

    assert_eq!(token_client.balance(&depositor), 800);
    assert_eq!(token_client.balance(&contract_id), 0);

    let escrow_cancelled = client.get_escrow(&escrow_id);
    assert_eq!(escrow_cancelled.status, EscrowStatus::Cancelled);
}
