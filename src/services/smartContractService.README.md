# Smart Contract Service - How It Works

## 📍 This File: `src/services/smartContractService.ts`

This file contains the functions that **send messages to smart contracts** on the NEAR blockchain.

---

## 🎯 The Main Functions

### **1. `initVaultContract()`** - Connect to Smart Contract
```typescript
const contract = initVaultContract(account, 'vault.testnet');
```

**What it does:**
- Creates a connection to the smart contract
- Sets up which functions you can call
- Returns a contract object you can use

**How it works:**
- Uses `new Contract()` from near-api-js
- Specifies `viewMethods` (read data, free)
- Specifies `changeMethods` (write data, costs gas) ← These are the "messages"

---

### **2. `depositToVault()`** - Send Deposit Message
```typescript
await depositToVault(contract, 'WNEAR', '1000000');
```

**What it does:**
- Sends a message to the smart contract to deposit tokens
- This is the actual "message sending"!

**What happens:**
1. Function is called
2. Creates transaction: `contract.deposit({...})`
3. Wallet popup appears: "Approve transaction?"
4. User clicks approve
5. Transaction sent to blockchain
6. Smart contract executes
7. Result returned

**This IS the message!** There's no separate send action.

---

### **3. `withdrawFromVault()`** - Send Withdraw Message
```typescript
await withdrawFromVault(contract, 'WNEAR', '500000');
```

**What it does:**
- Sends a message to the smart contract to withdraw tokens

**Same flow as deposit:**
- Call function → Wallet popup → Approve → Blockchain executes → Done

---

## 🔍 Understanding "Messages"

### **What is a "message"?**

In blockchain terms, a "message" is just **a function call that goes to the blockchain**.

```typescript
// Regular JavaScript:
myFunction('hello');  // Runs on your computer

// Smart Contract "Message":
contract.deposit({...});  // Runs on blockchain
```

**They're the same thing!** Just running in different places.

---

## 💬 How Messages Are Sent

### **The Code:**
```typescript
// Line 124 in smartContractService.ts
const result = await contract.deposit({
  token_type: tokenType,
  amount,
});
```

### **What Happens Behind The Scenes:**

**Step 1: You call the function**
```typescript
await depositToVault(contract, 'WNEAR', '10');
```

**Step 2: near-api-js creates a transaction**
```javascript
{
  signerId: "your-wallet.near",
  receiverId: "vault.testnet", 
  actions: [{
    type: "FunctionCall",
    methodName: "deposit",
    args: { token_type: "WNEAR", amount: "10" }
  }]
}
```

**Step 3: Wallet shows popup**
```
┌─────────────────────────────────────┐
│  Approve Transaction?               │
│  vault.testnet                      │
│  Function: deposit()                │
│  Gas: ~10 TGas                      │
│  [Cancel]  [Approve]                │
└─────────────────────────────────────┘
```

**Step 4: User approves**
- Wallet signs with private key
- Sends to NEAR blockchain

**Step 5: Blockchain processes**
- Validators receive transaction
- Execute smart contract code
- Verify result matches across all validators
- Record on blockchain

**Step 6: Result returns**
```typescript
console.log('Success!', result);
// UI shows: "Deposit successful!"
```

---

## 🎮 Real vs Mock Implementation

### **Current Implementation:**

The code is **smart** - it tries to use real blockchain, but falls back to mock:

```typescript
if (typeof Contract !== 'undefined' && account) {
  // ✅ Use REAL blockchain connection
  return new Contract(account, contractId, {...});
} else {
  // ⚠️ Use MOCK (for testing)
  return mockContract;
}
```

### **When does it use REAL blockchain?**
- ✅ When wallet is connected
- ✅ When near-api-js is loaded
- ✅ When Contract class is available

### **When does it use MOCK?**
- ⚠️ When wallet not connected
- ⚠️ When near-api-js not loaded
- ⚠️ For testing without wallet

**Check your console!** It will tell you:
- `✅ Real smart contract initialized` ← Using blockchain
- `⚠️ Using mock contract` ← Using fake data

---

## 📊 Message Flow Diagram

```
USER CLICKS BUTTON
    ↓
handleTransaction() in VaultInteraction.tsx
    ↓
depositToVault() in smartContractService.ts ← YOU ARE HERE
    ↓
contract.deposit({...}) ← THE MESSAGE IS SENT HERE!
    ↓
near-api-js creates transaction
    ↓
Wallet popup shows
    ↓
User approves
    ↓
Transaction sent to NEAR blockchain
    ↓
Smart contract executes on chain
    ↓
Result comes back
    ↓
UI updates with success message
```

---

## 🔧 How to Test

### **Method 1: With Console Logs**
1. Open browser console (F12)
2. Go to `/near-intents` page
3. Click "Vault" tab
4. Connect wallet
5. Try to deposit
6. Watch console logs:
   ```
   💬 Sending message to smart contract:
      Function: deposit()
      Token: WNEAR
      Amount: 1000000
   ✅ Message sent successfully!
   ```

### **Method 2: With Real Wallet**
1. Install NEAR wallet extension
2. Create testnet account
3. Get free testnet NEAR
4. Connect to your app
5. Try deposit/withdraw
6. Approve in wallet popup
7. See transaction on NearBlocks explorer

---

## 🎯 Key Takeaways

1. **"Message" = Function call** that goes to blockchain
2. **The message is sent** when you call `contract.deposit()` or `contract.withdraw()`
3. **Location of message sending:** Line 144 and 177 in this file
4. **No separate "send" action** - calling the function IS sending
5. **Wallet approval required** - popup will show for user to confirm
6. **Console logs show** whether using real blockchain or mock

---

## 📚 Related Files

- `src/components/VaultInteraction.tsx` - UI that calls these functions
- `src/hooks/useNearWallet.ts` - Wallet connection
- `contracts/simple-vault-contract/src/lib.rs` - The actual smart contract code

---

## 💡 Remember

**Sending a message to a smart contract is as simple as:**
```typescript
await contract.functionName({ parameters });
```

That's it! No magic, no mystery. Just a function call that goes to the blockchain instead of running locally.

