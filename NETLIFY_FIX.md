# 🔧 Netlify Deployment Fix

## ❌ The Problem

Your Netlify build is failing with:
```
Error: Your publish directory was not found at: /opt/build/repo/out
```

**Why?** Netlify dashboard settings are **overriding** your `netlify.toml` file.

The logs show Netlify is using:
- ❌ Build command: `npm install --legacy-peer-deps && npm run build`
- ❌ Publish directory: `out`

But our `netlify.toml` has:
- ✅ Build command: `npm run build`
- ✅ Publish directory: `.next`

---

## ✅ Solution: Update Netlify Dashboard Settings

### **Step 1: Go to Build Settings**

1. Open your Netlify dashboard
2. Go to your site
3. Click **"Site settings"** → **"Build & deploy"** → **"Continuous deployment"**

### **Step 2: Update Build Settings**

Find the **"Build settings"** section and change:

**Base directory:**
```
(leave empty)
```

**Build command:**
```
npm run build
```

**Publish directory:**
```
.next
```

**Functions directory:**
```
(leave empty or .netlify/functions)
```

### **Step 3: Clear Old Environment Variables**

Go to **"Environment variables"** and **REMOVE** these if they exist:
- ❌ `NETLIFY=true` (remove if present)
- ❌ `CI=false` (remove if present)

**KEEP** these (add if missing):
- ✅ `NODE_VERSION=20`
- ✅ `NPM_FLAGS=--legacy-peer-deps`
- ✅ `NEXT_TELEMETRY_DISABLED=1`

### **Step 4: Verify Plugin is Installed**

1. Go to **"Site settings"** → **"Build & deploy"** → **"Build plugins"**
2. Make sure **`@netlify/plugin-nextjs`** is listed and enabled
3. If not, click "Install plugin" and search for `@netlify/plugin-nextjs`

### **Step 5: Clear Cache and Redeploy**

1. Go to **"Deploys"**
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Wait for build to complete

---

## 🎯 Quick Fix (Alternative)

If you want to **force Netlify to use netlify.toml**, clear ALL build settings in dashboard:

1. Go to **Build settings**
2. Change **Build command** to: `(leave empty)`
3. Change **Publish directory** to: `(leave empty)`
4. Save
5. Redeploy

Netlify will then read from `netlify.toml` file automatically.

---

## 📋 Correct Settings Summary

| Setting | Old (Dashboard) | New (Should Be) |
|---------|----------------|-----------------|
| **Build command** | `npm install --legacy-peer-deps && npm run build` | `npm run build` |
| **Publish directory** | `out` | `.next` |
| **Plugin** | ❌ Missing or wrong config | ✅ `@netlify/plugin-nextjs` |
| **Node version** | May be old | `20` |

---

## ✅ After Update, Your Build Should Show:

```
✓ Build command: npm run build
✓ Publish directory: .next
✓ Plugin: @netlify/plugin-nextjs
✓ Creating Next.js functions...
✓ Deploy successful!
```

---

## 🚨 Important Notes

1. **Don't use `out` directory** - that's for static exports (`next export`)
2. **Use `.next` directory** - that's for Next.js SSR with the plugin
3. **Plugin is required** - `@netlify/plugin-nextjs` handles Next.js 15
4. **Dashboard overrides netlify.toml** - always check dashboard settings first

---

## 🆘 If Still Failing

Try this **nuclear option**:

1. Delete the site from Netlify completely
2. Create a new site
3. Import from GitHub: `FaisalFasi/risk-monitor-engine`
4. Branch: `deploy/netlify`
5. **Don't change any settings** - let Netlify auto-detect from `netlify.toml`
6. Deploy

This forces a clean setup that will read from `netlify.toml`.

---

## 📞 Need Help?

Check these:
- [ ] Build command is `npm run build` (NOT with npm install)
- [ ] Publish directory is `.next` (NOT out)
- [ ] Plugin `@netlify/plugin-nextjs` is installed
- [ ] Node version is 20
- [ ] No conflicting environment variables
- [ ] Cache is cleared

---

**Update these settings in Netlify dashboard and redeploy!** 🚀

