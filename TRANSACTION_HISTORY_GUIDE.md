# Transaction History Guide - What Shows Where

## 🎯 The Problem

You have transaction history shown in **3 different places** and it was confusing:
- Not clear what each one shows
- Sometimes shows data, sometimes doesn't
- Same generic "Transaction History" title everywhere

## ✅ The Solution

Each tab now has a **SPECIFIC, CLEARLY LABELED** history section:

---

## 📊 WHERE TO FIND WHAT

### **1. SWAP TAB - "Complete Blockchain History"**

**What it shows:**
- ✅ ALL your blockchain transactions
- ✅ Token swaps (NEAR → USDC, etc.)
- ✅ Token transfers (you → someone else)
- ✅ Vault deposits/withdrawals
- ✅ Smart contract calls
- ✅ Everything!

**When to use:**
- Want to see all your blockchain activity
- Looking for any transaction
- Complete audit trail

**Visual identifier:**
- Icon: 🔍 Blue search icon
- Title: "Complete Blockchain History"
- Subtitle: "All types: swaps, transfers, vault operations..."

**What displays:**
```
TRANSFER  SUCCESS  2m ago
From: klaang-data6792.testnet
To: quantum_betor4864.testnet
2.0000 NEAR

SWAP  SUCCESS  1h ago
From: klaang-data6792.testnet  
To: ref-finance.testnet
1.0000 NEAR

CONTRACT_CALL  SUCCESS  3h ago
From: klaang-data6792.testnet
To: vault.testnet
5.0000 NEAR
```

---

### **2. VAULT TAB - "Vault Deposits & Withdrawals"**

**What it shows:**
- ✅ ONLY vault deposits
- ✅ ONLY vault withdrawals
- ✅ Vault shares minted/burned
- ❌ NOT regular transfers
- ❌ NOT token swaps

**When to use:**
- Tracking your vault activity
- See how much you deposited/withdrew
- Monitor vault shares

**Visual identifier:**
- Icon: 📈 Green trending up icon
- Title: "Vault Deposits & Withdrawals"
- Subtitle: "Only your vault smart contract interactions"

**What displays:**
```
↓ Deposited WNEAR
  +50.0000 (50.0000 shares minted)
  1h ago

↑ Withdrew USDC
  -100.0000 (95.5000 shares burned)
  2h ago

↓ Deposited USDT
  +200.0000 (200.0000 shares minted)
  1d ago
```

**Note at bottom:**
```
💡 This shows only vault deposits/withdrawals.
   For token transfers, check the Transfer tab.
   For all activity, check the Swap tab.
```

---

### **3. TRANSFER TAB - "Your Sent Transfers"**

**What it shows:**
- ✅ ONLY tokens YOU sent to others
- ✅ Outgoing transfers only
- ✅ Who you sent to
- ❌ NOT incoming transfers
- ❌ NOT vault operations

**When to use:**
- See who you sent money to
- Track your sent transfers
- Find a specific payment you made

**Visual identifier:**
- Icon: 📤 Purple send icon
- Title: "Your Sent Transfers"
- Subtitle: "Tokens you sent to other accounts (outgoing only)"

**What displays:**
```
→ Sent to alice.near
  5.0000 NEAR
  2m ago
  View TX →

→ Sent to bob.testnet
  100.0000 USDC
  1h ago
  View TX →
```

---

## 🔍 Quick Reference Table

| Tab | History Title | Shows | Filters |
|-----|--------------|-------|---------|
| **Swap** | Complete Blockchain History | Everything | None - shows ALL |
| **Vault** | Vault Deposits & Withdrawals | Vault operations only | Only vault contract calls |
| **Transfer** | Your Sent Transfers | Outgoing transfers | Only where YOU are sender |

---

## 🐛 Why "Sometimes Shows, Sometimes Doesn't"

### **Reasons it might be empty:**

**1. Actually No Transactions**
- Brand new account
- Haven't done that type of transaction yet
- Solution: Make a transaction and it will appear!

**2. API Fetch Failed**
- NearBlocks API might be slow
- Network issue
- Solution: Click the "Refresh" button

**3. Filtering Too Strict**
- Looking for vault operations but you only did transfers
- Looking for your sent transfers on recipient's account
- Solution: Check the right tab for the right data

**4. Account Not Loaded**
- Wallet not connected yet
- Solution: Connect wallet first

### **How to Debug:**

**Open console (F12) and look for:**
```
📊 Fetching transaction history for: [account]
📥 Received history data: [...]
✅ Loaded X transactions

OR

ℹ️ No transaction history found
```

This tells you if:
- Data was fetched (yes/no)
- How many transactions found
- What was filtered out

---

## 💡 Understanding the Data

### **Transaction on Swap Tab:**
Shows who → who, what happened
```
From: klaang-data6792.testnet (sender)
To: quantum_betor4864.testnet (receiver)
Type: TRANSFER
Amount: 2.0000 NEAR
```

### **Transaction on Transfer Tab:**
Shows only YOUR outgoing
```
Sent to: quantum_betor4864.testnet
Amount: 2.0000 NEAR
(Only shows if YOU were the sender)
```

### **Transaction on Vault Tab:**
Shows your vault operations
```
Deposited WNEAR: 50.0000
Shares minted: 50.0000
(Only shows vault contract interactions)
```

---

## ⚠️ Common Confusions

### **Q: Why does Swap tab show more transactions than Transfer tab?**
**A:** Swap tab shows EVERYTHING. Transfer tab shows ONLY transfers YOU sent.

### **Q: Why is Transfer tab empty but Swap tab has data?**
**A:** You might have received transfers but not sent any. Transfer tab only shows YOUR sent transfers.

### **Q: Why does "From" show "Unknown"?**
**A:** API data might be missing that field. I've now added multiple fallback checks to fix this.

### **Q: Why doesn't Vault tab show my transfer?**
**A:** Vault tab ONLY shows vault deposits/withdrawals. Regular transfers appear on Swap and Transfer tabs.

---

## 🎯 Summary

**SWAP TAB = Everything**
- All transaction types
- All directions (sent, received)
- Complete picture

**VAULT TAB = Vault Only**
- Deposits to vault
- Withdrawals from vault
- Vault share changes

**TRANSFER TAB = Your Sent Money**
- Only outgoing transfers
- Only person-to-person
- Not vault, not swaps

**Each section is now clearly labeled so you know what you're looking at!**

---

## 🚀 Test It

1. Refresh browser
2. Go to each tab
3. Notice the different titles and descriptions
4. Each shows specific data relevant to that feature
5. Console logs show what's being fetched and why

No more confusion! 🎉

