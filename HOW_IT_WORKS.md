# How Smart Contract "Send Message" Works

## 📍 Current Implementation Status

### ✅ **What's Already Built:**

1. **UI Component** - `/src/components/VaultInteraction.tsx`
   - Professional vault interface
   - Deposit/Withdraw forms
   - Portfolio tracking
   - Transaction history

2. **Service Layer** - `/src/services/smartContractService.ts`
   - Function stubs ready
   - Type definitions complete
   - **Currently using MOCK data** (placeholders)

3. **Smart Contracts** - `/contracts/simple-vault-contract/`
   - Rust code ready
   - Deployed contracts exist
   - Functions: `deposit()`, `withdraw()`, etc.

### ⚠️ **What's Missing:**

The connection between UI and blockchain is **MOCKED** right now. Need to replace placeholders with real near-api-js calls.

---

## 🔌 **Where the "Send Message" Happens**

### **Current Code (Lines 73-107 in smartContractService.ts):**

```typescript
// THIS IS CURRENTLY A PLACEHOLDER:
export function initVaultContract(account: Account, contractId: string) {
  const contract = {
    deposit: async (args: { token_type: TokenType; amount: string }) => {
      return args.amount;  // ← Just returns what you sent, doesn't actually call blockchain
    },
    withdraw: async (args: { token_type: TokenType; vault_shares_amount: string }) => {
      return args.vault_shares_amount;  // ← Placeholder
    },
  };
  return contract;
}
```

### **What Needs to Be Added (REAL Implementation):**

```typescript
import { Contract } from 'near-api-js';

export function initVaultContract(account: Account, contractId: string) {
  // THIS creates the actual connection to the blockchain:
  const contract = new Contract(
    account,                    // Your NEAR account with signing keys
    contractId,                 // The deployed contract address
    {
      viewMethods: [            // Read-only functions (FREE, no gas)
        'get_user_vault_shares',
        'get_config',
        'get_total_supply'
      ],
      changeMethods: [          // Functions that modify state (cost gas)
        'deposit',              // ← THIS sends the actual message
        'withdraw'              // ← THIS sends the actual message
      ],
    }
  );
  
  return contract;
}

// When you call this:
await contract.deposit({ 
  token_type: 'WNEAR', 
  amount: '10000000000000000000000000' 
});

// Under the hood, near-api-js does:
// 1. Creates transaction object
// 2. Signs with your wallet
// 3. Sends to blockchain
// 4. Waits for confirmation
// 5. Returns result
```

---

## 🔄 **Complete Flow: Button Click → Blockchain**

### **Step 1: User Clicks "Deposit" in UI**

**File:** `src/components/VaultInteraction.tsx` (Line ~405)

```typescript
const handleTransaction = async () => {
  // Validation
  if (!amount || parseFloat(amount) <= 0) {
    setError('Please enter a valid amount');
    return;
  }

  setIsLoading(true);

  try {
    // THIS is where we would call the service:
    // await depositToVault(contract, activeToken, amount);
    
    // Currently simulated with:
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } catch (err) {
    setError('Transaction failed');
  } finally {
    setIsLoading(false);
  }
};
```

### **Step 2: Service Layer Prepares Transaction**

**File:** `src/services/smartContractService.ts` (Line 116-135)

```typescript
export async function depositToVault(
  contract: VaultContract,
  tokenType: TokenType,
  amount: string
): Promise<string> {
  console.log(`Depositing ${amount} ${tokenType} to vault...`);
  
  // THIS LINE sends the actual message to blockchain:
  const result = await contract.deposit({
    token_type: tokenType,
    amount,
  });

  console.log('Deposit successful:', result);
  return result;
}
```

### **Step 3: What `contract.deposit()` Does**

When you call `contract.deposit()`, near-api-js internally does:

```javascript
// 1. Create transaction
const transaction = {
  signerId: "alice.near",
  receiverId: "vault.testnet",
  actions: [{
    type: "FunctionCall",
    params: {
      methodName: "deposit",           // ← Function to call on contract
      args: {                          // ← The "message" data
        token_type: "WNEAR",
        amount: "10000000000000000000000000"
      },
      gas: "30000000000000",           // ← How much computation allowed
      deposit: "0"                     // ← Attached NEAR (if any)
    }
  }]
};

// 2. User's wallet signs it
const signedTx = await wallet.signTransaction(transaction);

// 3. Send to blockchain
const response = await provider.sendTransaction(signedTx);

// 4. Wait for confirmation
const result = await provider.txStatus(response.transaction.hash, "alice.near");

// 5. Return result to your code
return result;
```

### **Step 4: Blockchain Executes**

```rust
// This Rust code runs on NEAR blockchain:
// File: contracts/simple-vault-contract/src/lib.rs (Line 181)

pub fn deposit(&mut self, token_type: TokenType, amount: U128) -> U128 {
    let sender_id = env::predecessor_account_id();  // "alice.near"
    
    // Update user shares
    user_shares[sender_id][token_type] += amount;
    
    // Update reserves
    token_reserves[token_type] += amount;
    
    // Record event
    deposit_events.push(DepositEvent { ... });
    
    return amount;  // ← This gets sent back to your UI
}
```

### **Step 5: Result Returns to UI**

```typescript
// Back in VaultInteraction.tsx:
const newTransaction = {
  id: Date.now().toString(),
  type: 'deposit',
  token: activeToken,
  amount: parseFloat(amount).toFixed(4),
  timestamp: Date.now(),
  status: 'success',
  txHash: result.transaction_hash  // ← From blockchain
};

setTransactions([newTransaction, ...transactions]);
setSuccessMessage(`Successfully deposited ${amount} ${activeToken}`);
```

---

## 🔗 **How to Connect Real Blockchain**

### **Option 1: Using NEAR Wallet Selector (Recommended)**

```typescript
// In your component:
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';

const selector = await setupWalletSelector({
  network: "testnet",
  modules: [setupMyNearWallet()],
});

const wallet = await selector.wallet();
const accounts = await wallet.getAccounts();

// Now use this to initialize contract:
const contract = new Contract(
  wallet.account(),
  'vault.testnet',
  { viewMethods: [...], changeMethods: ['deposit', 'withdraw'] }
);

// Call deposit - wallet popup will appear automatically:
await contract.deposit({ token_type: 'WNEAR', amount: '1000' });
```

### **Option 2: Using Your Existing Hook**

```typescript
// In VaultInteraction.tsx:
import { useNearWallet } from '@/hooks/useNearWallet';

const { account } = useNearWallet();

useEffect(() => {
  if (account) {
    // Initialize real contract
    const contract = initVaultContract(account, 'vault.testnet');
    setContract(contract);
  }
}, [account]);

// Then in your deposit handler:
const handleTransaction = async () => {
  if (contract) {
    await depositToVault(contract, activeToken, amount);
  }
};
```

---

## 📦 **Installation Steps to Enable Real Calls**

```bash
# Install near-api-js if not already installed
npm install near-api-js

# Or use the wallet selector (better UX)
npm install @near-wallet-selector/core
npm install @near-wallet-selector/modal-ui
npm install @near-wallet-selector/my-near-wallet
```

---

## 🔍 **How to Test on Testnet**

### **1. Get Testnet Tokens:**
```bash
# Visit: https://testnet.mynearwallet.com/
# Create account: your-name.testnet
# Automatically get free testnet NEAR
```

### **2. Deploy Your Contract:**
```bash
cd contracts/simple-vault-contract

# Build the contract
cargo build --target wasm32-unknown-unknown --release

# Deploy to testnet
near deploy --accountId your-vault.testnet \
  --wasmFile target/wasm32-unknown-unknown/release/simple_vault_contract.wasm

# Initialize the contract
near call your-vault.testnet new \
  '{"owner_id":"your-name.testnet", "wnear_contract":"wrap.testnet", "usdc_contract":"usdc.testnet", "usdt_contract":"usdt.testnet", "fee_percentage":100}' \
  --accountId your-name.testnet
```

### **3. Update Contract Address:**
```typescript
// In smartContractService.ts
export const CONTRACTS = {
  SIMPLE_VAULT: 'your-vault.testnet',  // ← Your deployed contract
} as const;
```

### **4. Test Deposit:**
```bash
# Call directly from CLI to test:
near call your-vault.testnet deposit \
  '{"token_type":"WNEAR","amount":"1000000000000000000000000"}' \
  --accountId your-name.testnet \
  --gas 30000000000000

# Check it worked:
near view your-vault.testnet get_user_vault_shares \
  '{"account_id":"your-name.testnet","token_type":"WNEAR"}'
```

---

## 🎯 **Summary**

### **Current State:**
```
UI (VaultInteraction.tsx) 
  ↓
Service (smartContractService.ts) - PLACEHOLDER
  ↓
❌ NOT CONNECTED TO BLOCKCHAIN
```

### **To Make It Real:**
```
UI (VaultInteraction.tsx)
  ↓
Service (smartContractService.ts) + near-api-js
  ↓
NEAR Wallet (signs transaction)
  ↓
✅ NEAR BLOCKCHAIN (executes smart contract)
```

### **Key Files:**

1. **UI Layer:**
   - `src/components/VaultInteraction.tsx` - What user sees

2. **Service Layer:**
   - `src/services/smartContractService.ts` - Needs near-api-js integration

3. **Smart Contract:**
   - `contracts/simple-vault-contract/src/lib.rs` - Already deployed

The "send message" code is at **line 124** in `smartContractService.ts`:
```typescript
const result = await contract.deposit({ token_type, amount });
```

Right now it's mocked. To make it real, replace the `initVaultContract` function with actual `new Contract()` from near-api-js.

