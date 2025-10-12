#!/bin/bash

echo "🚀 Simple Vault Contract Deployment Script"
echo "==========================================="
echo ""

# Contract already built - WASM file exists
WASM_FILE="contracts/simple-vault-contract/target/wasm32-unknown-unknown/release/simple_vault_contract.wasm"

if [ ! -f "$WASM_FILE" ]; then
    echo "❌ WASM file not found at: $WASM_FILE"
    echo "Building contract..."
    cd contracts/simple-vault-contract
    cargo build --target wasm32-unknown-unknown --release
    cd ../..
fi

echo "✅ WASM file found: $WASM_FILE"
echo ""

# Use a simple contract account name
CONTRACT_ACCOUNT="simplevault$(date +%s).testnet"

echo "📝 Deployment Details:"
echo "   Contract: $CONTRACT_ACCOUNT"
echo "   Network: testnet"
echo "   File: $WASM_FILE"
echo ""

echo "⚠️  You'll need:"
echo "   1. NEAR CLI logged in (run: npx near login)"
echo "   2. At least 5 testnet NEAR for deployment"
echo "   3. Get free testnet NEAR: https://near-faucet.io/"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🔑 Step 1: Login to NEAR (browser will open)..."
npx near login

echo ""
echo "🏗️  Step 2: Creating contract account..."
npx near create-account $CONTRACT_ACCOUNT --useFaucet

echo ""
echo "📦 Step 3: Deploying contract..."
npx near deploy --accountId $CONTRACT_ACCOUNT --wasmFile $WASM_FILE

echo ""
echo "🎉 SUCCESS! Vault contract deployed!"
echo ""
echo "Contract Address: $CONTRACT_ACCOUNT"
echo ""
echo "🔧 Next steps:"
echo "1. Update VaultInteraction.tsx with this contract:"
echo "   receiverId: '$CONTRACT_ACCOUNT'"
echo ""
echo "2. Test the contract:"
echo "   npx near view $CONTRACT_ACCOUNT get_config"
echo ""
echo "3. Enable the vault UI by removing the disabled state"
echo ""

