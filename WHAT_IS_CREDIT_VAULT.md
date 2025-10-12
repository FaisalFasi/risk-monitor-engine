# What is a Credit Vault? (Simple Explanation)

## 🏦 **Token Vault vs Credit Vault**

### **Token Vault** (What we just built in /near-intents)
```
┌─────────────────────────────┐
│ You deposit: 100 NEAR       │
│ You get: 100 shares         │
│ Earns yield: 5% APY         │
│ You withdraw: 105 NEAR      │
└─────────────────────────────┘

Purpose: Store tokens and earn interest
Like: A savings account
```

### **Credit Vault** (What's on /credit page)
```
┌─────────────────────────────┐
│ AI Agent has: 1000 score    │
│ Deposits collateral: 50 NEAR│
│ Gets credit line: 200 NEAR  │
│ Can borrow: 200 NEAR        │
│ Pays interest: 8% APR       │
└─────────────────────────────┘

Purpose: Give loans to AI agents based on their performance
Like: A credit card or business loan
```

---

## 🤖 **What Are Credit Vaults For?**

### **The Problem:**
- AI agents need money to operate (buy data, pay for services, trade)
- But they don't have money upfront
- Traditional banks won't give loans to AI

### **The Solution:**
- Credit vaults give **credit lines** to AI agents
- Based on their:
  - Performance score
  - Track record
  - Collateral deposited
  - Risk level

### **How It Works:**

```
STEP 1: AI Agent Gets Scored
├─ Performance: 850/1000
├─ Verification: Verified ✓
├─ Track Record: 90 days
└─ Risk Level: Low

STEP 2: Agent Deposits Collateral
├─ Deposits: 50 NEAR
├─ Value: $250
└─ Collateral locked

STEP 3: System Calculates Credit
├─ LTV Ratio: 75%
├─ Credit Line: $250 × 75% = $187.50
├─ Max Borrow: 37.5 NEAR
└─ APR: 8%

STEP 4: Agent Can Borrow
├─ Borrows: 20 NEAR
├─ Uses it for trading
├─ Pays back: 20 NEAR + interest
└─ Collateral returned
```

---

## 📊 **Key Metrics in Credit Vault**

### **1. Credit Limit**
How much the agent can borrow total
```
Credit Limit = Collateral Value × LTV Ratio × Score Multiplier

Example:
Collateral: 100 NEAR ($500)
LTV: 75%
Score Multiplier: 1.2x (high score)
= $500 × 75% × 1.2 = $450 credit limit
```

### **2. LTV (Loan-to-Value) Ratio**
How much can be borrowed vs collateral
```
LTV = Borrowed Amount / Collateral Value

Safe: < 75%
Warning: 75-85%
Danger: > 85%
Liquidation: > 90%
```

### **3. Health Factor**
How healthy is the credit position
```
Health Factor = Collateral Value / Borrowed Amount

> 1.5 = Safe ✓
1.2-1.5 = Warning ⚠️
< 1.2 = Danger ❌
< 1.0 = Liquidation 🚨
```

### **4. Utilization**
How much credit is being used
```
Utilization = Used Credit / Total Credit Line

Example:
Credit Line: 100 NEAR
Borrowed: 40 NEAR
Utilization: 40%
```

---

## 🎯 **What Should the Credit Vault Page Show?**

### **Overview Cards:**
```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Total Credit     │ │ Active Vaults    │ │ Total Collateral │
│ $125,450         │ │ 23               │ │ 5,240 NEAR       │
│ +12% this month  │ │ 3 at risk        │ │ $26,200          │
└──────────────────┘ └──────────────────┘ └──────────────────┘

┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Avg Health Factor│ │ Total Borrowed   │ │ Protocol Revenue │
│ 2.1              │ │ $87,300          │ │ $542 this month  │
│ Healthy ✓        │ │ 69.6% utilized   │ │ from interest    │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

### **Vault List:**
```
Agent: TradingBot Alpha
├─ Credit Limit: 1,000 NEAR
├─ Used: 750 NEAR (75%)
├─ Collateral: 500 NEAR
├─ Health Factor: 1.8 (Safe)
├─ LTV: 67%
└─ Status: Active ✓

Agent: MarketMaker Beta
├─ Credit Limit: 500 NEAR
├─ Used: 450 NEAR (90%)
├─ Collateral: 200 NEAR
├─ Health Factor: 1.1 (Warning)
├─ LTV: 89%
└─ Status: At Risk ⚠️

Agent: DataAnalyzer Gamma
├─ Credit Limit: 2,000 NEAR
├─ Used: 1,200 NEAR (60%)
├─ Collateral: 1,000 NEAR
├─ Health Factor: 2.5 (Healthy)
├─ LTV: 48%
└─ Status: Active ✓
```

### **Risk Monitoring:**
```
┌─────────────────────────────────────┐
│ Vaults Needing Attention            │
├─────────────────────────────────────┤
│ MarketMaker Beta                    │
│ Health Factor: 1.1 ⚠️               │
│ Action: Add collateral or repay     │
│ Time Until Liquidation: 6 hours     │
├─────────────────────────────────────┤
│ ScalpingBot Delta                   │
│ Health Factor: 1.15 ⚠️              │
│ Action: Monitor closely             │
│ Collateral Drop: -12% today         │
└─────────────────────────────────────┘
```

---

## 💰 **How Credit Vaults Make Money**

### **Revenue Sources:**
```
1. Interest on Loans
   ├─ Agent borrows: 100 NEAR
   ├─ APR: 8%
   └─ Annual interest: 8 NEAR

2. Origination Fees
   ├─ New credit line: 1,000 NEAR
   ├─ Fee: 0.5%
   └─ One-time fee: 5 NEAR

3. Liquidation Penalties
   ├─ Agent defaults
   ├─ Collateral: 50 NEAR
   ├─ Penalty: 10%
   └─ Extra income: 5 NEAR

4. Management Fees
   ├─ Active credit: 1,000 NEAR
   ├─ Annual fee: 0.25%
   └─ Annual income: 2.5 NEAR
```

---

## 🔐 **Risk Management**

### **Protection Mechanisms:**

**1. Overcollateralization**
```
Require more collateral than loan
Example: Borrow $100, need $150 collateral
```

**2. Dynamic LTV**
```
Adjust based on:
- Agent's score (better score = higher LTV)
- Market conditions (volatile = lower LTV)
- Agent's history (proven = higher LTV)
```

**3. Liquidation System**
```
If Health Factor < 1.0:
1. Send warning notification
2. Give 24 hours to add collateral
3. If not fixed, liquidate collateral
4. Repay loan from liquidation
5. Return excess to agent
```

**4. Circuit Breakers**
```
If market crashes:
- Pause new loans
- Freeze withdrawals temporarily
- Protect existing positions
```

---

## 📈 **Why Credit Vaults Are Valuable**

### **For AI Agents:**
- ✅ Access to capital without owning it
- ✅ Leverage their good performance
- ✅ Grow faster with borrowed funds
- ✅ Build credit history

### **For Lenders (Protocol):**
- ✅ Earn interest on deposits
- ✅ Lower risk (overcollateralized)
- ✅ Automatic enforcement via smart contracts
- ✅ Diversified across many agents

### **For the Ecosystem:**
- ✅ More active AI agents
- ✅ Higher trading volume
- ✅ Better liquidity
- ✅ Network effects

---

## 🎯 **Summary**

**Credit Vaults:**
- Give loans to AI agents
- Based on performance + collateral
- AI agents can leverage their reputation
- Protocol earns interest
- Smart contracts enforce rules
- Different from token vaults (those are for saving)

**Key Difference:**
```
Token Vault: "Store my money, I'll earn interest"
Credit Vault: "Loan me money, I'll pay interest"
```

**What Page Should Show:**
1. Overview stats (total credit, vaults, health)
2. List of active vaults per agent
3. Risk monitoring dashboard
4. Ability to create new credit lines
5. Ability to add/remove collateral
6. Transaction history
7. Liquidation alerts

