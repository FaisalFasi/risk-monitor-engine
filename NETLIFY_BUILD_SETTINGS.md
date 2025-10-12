# 🎯 Netlify Build Settings - What to Change

## Your Current Settings (From Dashboard)

```
Runtime:              Next.js ✅
Base directory:       / ✅
Package directory:    Not set ✅
Build command:        npm install --legacy-peer-deps && npm run build ❌ WRONG
Publish directory:    .next ✅ CORRECT
Functions directory:  .netlify/functions ✅
```

---

## ❌ What's Wrong

**Build command:**
```
npm install --legacy-peer-deps && npm run build
```

**Problems:**
1. ❌ Netlify **already runs `npm install` automatically** before your build command
2. ❌ Running `npm install` again in build command causes conflicts
3. ❌ Can cause dependency resolution issues
4. ❌ Takes extra time (installs twice)

---

## ✅ What to Change

### **Change Build Command To:**

```
npm run build
```

**That's it!** Just `npm run build` - nothing else needed.

---

## 📋 Correct Settings (Copy These)

Go to **Site settings** → **Build & deploy** → **Continuous deployment** → **Build settings**

Click **"Edit settings"** and set:

| Setting | Value |
|---------|-------|
| **Base directory** | `/` or leave empty |
| **Build command** | `npm run build` |
| **Publish directory** | `.next` |
| **Functions directory** | `.netlify/functions` |

---

## 🔧 Step-by-Step Fix

### **1. Update Build Command**

In Netlify dashboard:
1. Go to **Site settings**
2. Click **"Build & deploy"**
3. Under **"Build settings"**, click **"Edit settings"**
4. Change **Build command** from:
   ```
   npm install --legacy-peer-deps && npm run build
   ```
   To:
   ```
   npm run build
   ```
5. Click **"Save"**

### **2. Verify Other Settings**

Double-check these are correct:
- ✅ Publish directory: `.next` (you already have this correct!)
- ✅ Runtime: Next.js
- ✅ Node version: 20 (set in environment variables)

### **3. Add Environment Variables**

Go to **Site settings** → **Environment variables**

Make sure you have:
```
NODE_VERSION=20
NPM_FLAGS=--legacy-peer-deps
NEXT_TELEMETRY_DISABLED=1
```

**How Netlify handles NPM_FLAGS:**
- Netlify will automatically use `--legacy-peer-deps` flag
- It runs: `npm install --legacy-peer-deps` (automatically)
- Then runs: `npm run build` (your build command)

### **4. Clear Cache and Redeploy**

1. Go to **"Deploys"** tab
2. Click **"Trigger deploy"** dropdown
3. Select **"Clear cache and deploy site"**
4. Wait for build

---

## 🎯 Why This Works

### **Old Way (Current - WRONG):**
```bash
1. Netlify runs: npm install --legacy-peer-deps  (automatic)
2. Your command:  npm install --legacy-peer-deps && npm run build
                  ↑ installs AGAIN (conflict!)
3. Result: Errors, conflicts, or weird behavior
```

### **New Way (Correct):**
```bash
1. Netlify runs: npm install --legacy-peer-deps  (automatic, uses NPM_FLAGS)
2. Your command:  npm run build                   (just build)
3. Result: Clean build, no conflicts ✅
```

---

## 📊 Before vs After

| Step | Before (Wrong) | After (Correct) |
|------|---------------|-----------------|
| **Netlify auto-install** | `npm install --legacy-peer-deps` | `npm install --legacy-peer-deps` |
| **Your build command** | `npm install --legacy-peer-deps && npm run build` ❌ | `npm run build` ✅ |
| **Total installs** | 2 (duplicate!) | 1 (correct!) |
| **Result** | Conflicts, errors | Clean build ✅ |

---

## ✅ What Your Build Log Should Look Like After Fix

```
1:00:00 AM: Installing npm packages using npm version 10.x.x
1:00:00 AM: npm install --legacy-peer-deps
1:00:05 AM: added 696 packages in 5s
1:00:05 AM: ​
1:00:05 AM: > risk-monitor-engine@0.1.0 build
1:00:05 AM: > next build
1:00:10 AM: ✓ Compiled successfully
1:00:15 AM: ✓ Generating static pages (38/38)
1:00:16 AM: ✓ Finalizing page optimization
1:00:16 AM: ​
1:00:16 AM: Plugin @netlify/plugin-nextjs
1:00:16 AM: ✓ Creating Next.js functions
1:00:20 AM: ✓ Next.js cache saved
1:00:20 AM: ​
1:00:20 AM: Deploy successful! ✅
```

**Key points:**
- ✅ Only ONE `npm install` (Netlify's automatic one)
- ✅ Then `npm run build`
- ✅ Plugin processes successfully
- ✅ Deploy works!

---

## 🚨 Common Mistakes

| Mistake | Why It's Wrong | Correct |
|---------|---------------|---------|
| `npm install && npm run build` | Installs twice | `npm run build` |
| `npm run export` | Wrong for SSR | `npm run build` |
| `next build && next export` | Static export (wrong) | `npm run build` |
| Publish: `out` | Static export folder | `.next` |

---

## 🎁 Summary: ONE Change Needed

**Current:**
```
Build command: npm install --legacy-peer-deps && npm run build
```

**Change to:**
```
Build command: npm run build
```

**Everything else is already correct!** ✅

---

## ✅ After This Change

1. Save the new build command
2. Clear cache and redeploy
3. Build should succeed
4. CSS and styles will load correctly
5. Your site will be live! 🎉

---

**Just change the build command and redeploy - you're almost there!** 🚀

