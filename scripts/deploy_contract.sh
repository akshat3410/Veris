#!/usr/bin/env bash

# Milestone Escrow Platform — Soroban Contract Build & Deployment Script
set -e

echo "🚀 Building Soroban Milestone Escrow Smart Contract..."

CONTRACT_DIR="./contracts/milestone_escrow"
TARGET_WASM="target/wasm32-unknown-unknown/release/milestone_escrow.wasm"
NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; July 2015"

# 1. Build contract WASM
if command -v cargo &> /dev/null; then
    echo "📦 Building WASM target with cargo..."
    cd "$CONTRACT_DIR"
    cargo build --target wasm32-unknown-unknown --release
    cd ../..
else
    echo "⚠️ Cargo not detected in environment. Skipping local binary compilation."
fi

# 2. Check if Stellar CLI is available
if command -v stellar &> /dev/null; then
    echo "🔑 Configuring Stellar Testnet Identity..."
    stellar keys generate deployer --network "$NETWORK" || true
    stellar keys fund deployer --network "$NETWORK" || true

    DEPLOYER_ADDRESS=$(stellar keys address deployer)
    echo "Deployer Address: $DEPLOYER_ADDRESS"

    echo "🌐 Deploying WASM to Soroban Testnet..."
    CONTRACT_ID=$(stellar contract deploy \
        --wasm "$CONTRACT_DIR/$TARGET_WASM" \
        --source deployer \
        --network "$NETWORK")

    echo "✅ Contract Deployed Successfully!"
    echo "Contract ID: $CONTRACT_ID"

    echo "🔧 Initializing Contract Admin..."
    stellar contract invoke \
        --id "$CONTRACT_ID" \
        --source deployer \
        --network "$NETWORK" \
        -- \
        initialize \
        --admin "$DEPLOYER_ADDRESS"

    echo "📝 Saving Contract Config to Frontend..."
    mkdir -p ./lib/contracts
    cat <<EOF > ./lib/contracts/config.ts
export const SOROBAN_CONFIG = {
  network: "$NETWORK",
  rpcUrl: "$RPC_URL",
  networkPassphrase: "$NETWORK_PASSPHRASE",
  contractId: "$CONTRACT_ID",
  deployerAddress: "$DEPLOYER_ADDRESS",
  usdcTokenId: "CCW67TSB3SSS366OIOMAYDHUTLXDGOWMY7SC2226XM5FYW5EAKOJ62OY", // Soroban Testnet USDC SAC
};
EOF
    echo "🎉 Deployment Complete! Config saved to lib/contracts/config.ts"
else
    echo "ℹ️ Stellar CLI not present. Pre-populating fallback contract configuration for Testnet."
    mkdir -p ./lib/contracts
    cat <<EOF > ./lib/contracts/config.ts
export const SOROBAN_CONFIG = {
  network: "testnet",
  rpcUrl: "https://soroban-testnet.stellar.org",
  networkPassphrase: "Test SDF Network ; July 2015",
  contractId: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMWAXA26TX27N5", // Deployed Testnet Contract ID Placeholder
  deployerAddress: "GBXGQJWVLWOYHFLVTKWV5FGHA3LNYY2JQW6F6JLH2B35VJ6R4ZPA6Q4U",
  usdcTokenId: "CCW67TSB3SSS366OIOMAYDHUTLXDGOWMY7SC2226XM5FYW5EAKOJ62OY", // Testnet USDC SAC
};
EOF
    echo "✅ Default Testnet config populated in lib/contracts/config.ts"
fi
