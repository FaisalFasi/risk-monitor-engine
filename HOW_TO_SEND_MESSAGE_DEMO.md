# How to Send Messages - PRACTICAL DEMO

## 🎯 I'll Show You EXACTLY How It Works

Let me create a **real working example** you can run right now.

---

## 📱 **Step 1: Create a Simple Demo File**

I'll create a file that shows you EXACTLY how sending a message works:

```typescript
// demo-send-message.ts

import { Contract } from 'near-api-js';

// THIS IS HOW YOU SEND A MESSAGE:
async function sendMessageToSmartContract() {
  
  // 1. Connect to your wallet (user already connected)
  const account = wallet.account();
  
  // 2. Initialize the smart contract connection
  const contract = new Contract(
    account,                           // Your connected account
    'vault.testnet',                   // Contract address
    {
      viewMethods: [],                 // Functions that just READ
      changeMethods: ['deposit']       // Functions that WRITE (send messages)
    }
  );
  
  // 3. THIS LINE SENDS THE MESSAGE!
  const result = await contract.deposit({
    token_type: 'WNEAR',
    amount: '1000000000000000000000000'  // 1 NEAR
  });
  
  // That's it! Message sent!
  console.log('Message sent! Result:', result);
}
```

---

## 🔍 **Let's Break It Down SUPER SIMPLE**

### **Think of it like sending an email:**

```
SENDING AN EMAIL:
1. Open Gmail (connect wallet)
2. Click "Compose" (initialize contract)
3. Type message and click "Send" (call contract function)
4. Email delivered! (transaction confirmed)

SENDING TO SMART CONTRACT:
1. Connect wallet ✓
2. Initialize contract ✓
3. Call function (contract.deposit()) ← THIS IS THE "SEND" BUTTON
4. Transaction confirmed ✓
```

---

## 💻 **The Actual Code in Your Project**

### **File: `src/services/smartContractService.ts`**

```typescript
// Line 116-135 - This is where YOU send messages

export async function depositToVault(
  contract: VaultContract,
  tokenType: TokenType,
  amount: string
): Promise<string> {
  
  console.log(`Depositing ${amount} ${tokenType} to vault...`);
  
  // ⭐ THIS LINE = SENDING THE MESSAGE ⭐
  const result = await contract.deposit({
    token_type: tokenType,
    amount,
  });
  //     ↑ This function call is the "message"
  //     It creates a transaction and sends it to the blockchain
  
  console.log('Deposit successful:', result);
  return result;
}
```

### **When You Click "Deposit" Button:**

```typescript
// File: src/components/VaultInteraction.tsx (line ~405)

const handleTransaction = async () => {
  
  // You click the button, this function runs:
  
  // Step 1: Prepare the data
  const tokenType = 'WNEAR';
  const amount = '10000000';
  
  // Step 2: Send the message! (THIS IS IT!)
  await depositToVault(contract, tokenType, amount);
  //     ↑
  //     This function sends the message to the smart contract
  
  // Step 3: Show success
  setSuccessMessage('Deposit successful!');
};
```

---

## 🎬 **Let Me Create a Working Demo**

I'll create a file you can actually run to see it work:

```typescript
// File: demo-smart-contract-call.ts

import { useNearWallet } from '@/hooks/useNearWallet';
import { initVaultContract, depositToVault } from '@/services/smartContractService';

export function SmartContractDemo() {
  const { account } = useNearWallet();
  
  const sendMessage = async () => {
    // 1. Get the contract
    const contract = initVaultContract(account, 'vault.testnet');
    
    // 2. Send the message! (THIS IS IT!)
    await depositToVault(contract, 'WNEAR', '1000000');
    
    // That's it! Message sent to blockchain!
    alert('Message sent to smart contract!');
  };
  
  return (
    <button onClick={sendMessage}>
      Click to Send Message to Smart Contract
    </button>
  );
}
```

---

## 🔥 **The SIMPLEST Possible Explanation**

### **Sending a Message = Calling a Function**

```javascript
// Regular JavaScript function call:
myFunction(parameter1, parameter2);

// Smart contract "message" is the SAME THING:
contract.deposit({ token_type: 'WNEAR', amount: '10' });
         ↑
         This IS the message! It's just a function call!
```

### **What Happens Behind the Scenes:**

```
YOU:
  contract.deposit({ token_type: 'WNEAR', amount: '10' })

NEAR-API-JS (automatically does this):
  1. Creates transaction object
  2. Shows wallet popup
  3. User approves
  4. Signs with private key
  5. Sends to blockchain
  6. Waits for confirmation
  7. Returns result to you

YOU SEE:
  "Deposit successful!"
```

---

## 📊 **Visual Flow**

```
┌─────────────────────────────────────────────────────────────┐
│ YOUR CODE                                                    │
│                                                              │
│  await contract.deposit({ token_type: 'WNEAR', amount: 10 })│
│         ↑                                                    │
│         THIS IS THE MESSAGE                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ WALLET POPUP                                                 │
│                                                              │
│  Do you want to call deposit() on vault.testnet?            │
│  [Cancel]  [Approve] ← User clicks                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ BLOCKCHAIN                                                   │
│                                                              │
│  Received transaction from alice.near                        │
│  Calling: vault.testnet.deposit(WNEAR, 10)                 │
│  Executing smart contract code...                           │
│  ✓ Success! Transaction hash: 0xABC123...                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ YOUR CODE GETS RESULT                                        │
│                                                              │
│  console.log('Success!', result);                           │
│  UI shows: "Deposit successful!"                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 **To Make It Work For Real**

### **Current Status:**
```typescript
// In smartContractService.ts line 73-107
// This is FAKE/MOCK:
export function initVaultContract(account, contractId) {
  return {
    deposit: async (args) => {
      return args.amount;  // ← Just returns what you sent
    }
  };
}
```

### **To Make It REAL:**
```typescript
// Replace with this:
import { Contract } from 'near-api-js';

export function initVaultContract(account, contractId) {
  return new Contract(
    account,
    contractId,
    {
      changeMethods: ['deposit', 'withdraw']  // ← These are the "messages" you can send
    }
  );
}
```

---

## 🚀 **TRY IT NOW**

1. Open your browser console (F12)
2. Go to /near-intents
3. Connect wallet
4. Click "Deposit"
5. In console, you'll see:
   ```
   Depositing 10 WNEAR to vault...
   Deposit successful: 10
   ```

**That console.log IS the "message sending"!**

Currently it's mocked, but the flow is identical to real blockchain calls.

---

## 💡 **Key Takeaway**

**Sending a message to a smart contract is just calling a function:**

```typescript
// This:
await contract.deposit({ token_type: 'WNEAR', amount: '10' });

// Is the same as saying:
// "Hey blockchain, run the deposit() function 
//  on vault.testnet with these parameters"
```

**That's it! That's the "message"!**

The word "message" just means "function call that goes to the blockchain instead of running locally."

---

## ✅ **Summary**

**Q: How do I send messages?**
**A: You call a function on the contract object**

```typescript
contract.deposit(...)  ← This IS sending a message
contract.withdraw(...) ← This IS sending a message
contract.transfer(...) ← This IS sending a message
```

**Q: Where is the code?**
**A: Line 124 in smartContractService.ts**

**Q: How do I make it real?**
**A: Replace initVaultContract() with actual Contract() from near-api-js**

**Q: What happens when I send a message?**
**A:**
1. Wallet popup appears
2. User approves
3. Transaction sent to blockchain
4. Smart contract executes
5. Result returned to your code
6. UI updates

That's it! No mystery - it's just a function call that goes to the blockchain! 🎉

