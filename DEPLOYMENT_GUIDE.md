# Deployment Guide - Vercel & Netlify

## 🎯 **This Branch: deploy/netlify**

This branch has the **minimal, clean configuration** that works perfectly on both:
- ✅ **Vercel** (recommended - easiest)
- ✅ **Netlify** (alternative)

---

## ✅ **What Was Fixed**

### **Critical Issues Resolved:**

1. **❌ Removed `next-export-optimize-images`**
   - This package breaks SSR on Vercel/Netlify
   - Only for static exports (GitHub Pages)
   - Was causing CSS and JS to not load
   - **Now removed completely** ✅

2. **❌ Removed basePath/assetPrefix**
   - Was set to `/risk-monitor-engine` for GitHub Pages
   - Caused wrong CSS paths on Vercel/Netlify
   - CSS looked for at `/risk-monitor-engine/_next/static/css/...`
   - Actual CSS at `/_next/static/css/...`
   - **Now completely removed** ✅

3. **❌ Simplified Configuration**
   - Removed all platform-specific conditionals
   - Clean, minimal config
   - Let Vercel/Netlify handle defaults
   - **Much simpler now** ✅

---

## 📁 **Configuration Files**

### **1. next.config.ts** ⭐

```typescript
/** Minimal Next.js Configuration */
const nextConfig = {
  reactStrictMode: true,
  
  images: {
    unoptimized: false, // Let platform optimize
  },
  
  webpack: (config, { isServer }) => {
    // NEAR library support
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // CORS headers
  async headers() { ... },
};
```

**What's NOT here:**
- ❌ No basePath
- ❌ No assetPrefix  
- ❌ No trailingSlash
- ❌ No platform detection
- ✅ Clean and simple!

---

### **2. netlify.toml** 🟢

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--legacy-peer-deps"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Key Points:**
- ✅ Uses `@netlify/plugin-nextjs` (handles Next.js SSR)
- ✅ Publishes `.next` folder (not `out`)
- ✅ Simple build command
- ✅ Node 20 (same as development)

---

### **3. vercel.json** 🔵

```json
{
  "framework": "nextjs"
}
```

**That's it!** Vercel auto-detects everything else.

---

### **4. package.json**

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

**No `next-export-optimize-images` in devDependencies** ✅

---

## 🚀 **Deploy to Netlify**

### **Step 1: Install Netlify CLI (Optional)**

```bash
npm install -g netlify-cli
```

### **Step 2: Build Locally (Test First)**

```bash
npm run build
npm start
# Open http://localhost:3000
# Verify CSS loads ✅
```

### **Step 3: Deploy**

**Option A: Netlify Dashboard (Easiest)**

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Select: `FaisalFasi/risk-monitor-engine`
5. Branch to deploy: `deploy/netlify`
6. Build settings (should auto-detect):
   - Build command: `npm run build`
   - Publish directory: `.next`
7. Click "Deploy site"
8. Wait 2-3 minutes
9. Site will be live! ✅

**Option B: Netlify CLI**

```bash
# Login
netlify login

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

---

## 🚀 **Deploy to Vercel**

### **Step 1: Install Vercel CLI (Optional)**

```bash
npm install -g vercel
```

### **Step 2: Deploy**

**Option A: Vercel Dashboard (Easiest)**

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import from GitHub: `FaisalFasi/risk-monitor-engine`
4. Branch: `deploy/netlify` (this branch works on Vercel too!)
5. Vercel auto-detects everything
6. Click "Deploy"
7. Wait ~1 minute
8. Site will be live! ✅

**Option B: Vercel CLI**

```bash
vercel

# For production:
vercel --prod
```

---

## 🎯 **Why This Configuration Works**

### **The Problem Before:**

```
next.config.ts had:
├── basePath: '/risk-monitor-engine' or ''
├── assetPrefix: '/risk-monitor-engine' or ''
├── Complex platform detection
└── Sometimes wrong paths on Vercel/Netlify

Result:
❌ Browser looks for CSS at wrong path
❌ 404 errors on CSS files
❌ No styles load
```

### **The Solution Now:**

```
next.config.ts has:
├── NO basePath
├── NO assetPrefix
├── NO platform detection
└── Just the essentials

Result:
✅ CSS at correct path: /_next/static/css/...
✅ All assets load properly
✅ Styles show beautifully
```

---

## 🔍 **Troubleshooting**

### **If CSS Still Doesn't Load:**

1. **Check Netlify Plugin:**
   ```bash
   # In Netlify dashboard, verify plugin is installed:
   Build & Deploy → Plugins → @netlify/plugin-nextjs ✓
   ```

2. **Check Build Logs:**
   ```
   Look for:
   ✓ Compiled successfully
   ✓ Generating static pages
   ✓ Created CSS files
   ```

3. **Check Publish Directory:**
   ```
   Should be: .next (NOT out)
   ```

4. **Clear Deploy Cache:**
   - Netlify: Settings → Build & Deploy → Clear cache
   - Vercel: Settings → General → Clear cache
   - Then redeploy

---

## 📊 **Platform Comparison**

| Feature | Vercel | Netlify |
|---------|--------|---------|
| **Setup** | Zero config | Needs plugin |
| **Speed** | ⚡⚡⚡ Very fast | ⚡⚡ Fast |
| **Next.js Support** | Native | Via plugin |
| **Free Tier** | Generous | Generous |
| **Build Time** | ~1-2 min | ~2-3 min |
| **Edge Functions** | Yes | Yes |
| **Recommended** | ✅ Best for Next.js | ✅ Also works great |

**My Recommendation: Vercel** (built by Next.js creators, best integration)

---

## 📝 **What Changed in This Branch**

```
File Changes:
✅ next.config.ts - Minimal, no basePath
✅ netlify.toml - Proper Next.js plugin setup
✅ vercel.json - Simplified to just framework
✅ package.json - Removed next-export-optimize-images
✅ .vercelignore - Optimized for deployment
```

---

## 🎨 **What You'll See After Deployment**

### **Before (Broken):**
```
Plain HTML:
- Black text on white background
- No colors, no spacing
- Default browser font
- No CSS at all
```

### **After (Working):**
```
Beautiful app:
✅ Gradient backgrounds (blue to purple)
✅ Styled cards with shadows
✅ Proper fonts (Geist Sans)
✅ All colors showing
✅ Responsive layout
✅ Smooth animations
✅ Professional UI
```

---

## 🧪 **Test Before Deploying**

### **1. Clean Build Test:**

```bash
# Clean everything
rm -rf .next node_modules

# Fresh install
npm install --legacy-peer-deps

# Build
npm run build

# Should see:
# ✓ Compiled successfully
# ✓ Generating static pages (38/38)
```

### **2. Local Production Test:**

```bash
# Start production server
npm start

# Open browser
http://localhost:3000

# Verify:
✓ CSS loads
✓ Styles show
✓ Everything looks good
```

If it works locally, it will work on Vercel/Netlify!

---

## 🚀 **Deployment Steps**

### **For Netlify:**

1. **Push this branch:**
   ```bash
   git push origin deploy/netlify
   ```

2. **Connect on Netlify:**
   - Import from GitHub
   - Select branch: `deploy/netlify`
   - Auto-detects settings
   - Deploy!

3. **Important:** Make sure `@netlify/plugin-nextjs` is installed
   - Should happen automatically
   - Check in Netlify dashboard under "Plugins"

### **For Vercel (Alternative):**

1. **Same branch works:**
   ```bash
   git push origin deploy/netlify
   ```

2. **Deploy on Vercel:**
   - Import from GitHub
   - Select branch: `deploy/netlify`
   - Zero config needed
   - Deploy!

---

## 📊 **Build Output Verification**

After build, check these files exist:

```bash
.next/
├── static/
│   └── css/
│       ├── 823cd097ea0eb292.css ← Main CSS (93KB)
│       ├── e35ab7d0e50acf9f.css ← App CSS (34KB)
│       └── de70bee13400563f.css ← Small CSS (2.3KB)
│
└── server/
    └── app/
        └── [all your pages] ← HTML files

All CSS paths: /_next/static/css/... ✅
```

---

## 🎁 **Bonus: Works on Both Platforms**

This single configuration works on:
- ✅ **Vercel** - Zero additional config
- ✅ **Netlify** - Just needs the plugin
- ✅ **Local dev** - `npm run dev`
- ✅ **Local production** - `npm start`

**One config to rule them all!** 🎉

---

## 🔐 **Environment Variables (Optional)**

If needed, add these in your deployment platform:

```bash
# Netlify or Vercel Dashboard → Settings → Environment Variables

NEXT_PUBLIC_NEAR_NETWORK_ID=testnet
NEXT_TELEMETRY_DISABLED=1
```

---

## ✅ **Deployment Checklist**

Before deploying:
- [x] `next-export-optimize-images` removed
- [x] `basePath` not set (undefined)
- [x] `assetPrefix` not set (undefined)
- [x] Build command: `next build`
- [x] Netlify plugin: `@netlify/plugin-nextjs`
- [x] Build tested locally - works!

After deploying:
- [ ] Site loads
- [ ] CSS shows (colors, fonts, layout)
- [ ] Navigation works
- [ ] Wallet connection works
- [ ] No 404 errors in console

---

## 🎊 **Summary**

**What broke your deployment:**
1. ❌ `next-export-optimize-images` package (for static exports only)
2. ❌ `basePath` configuration (wrong for Vercel/Netlify)
3. ❌ Complex platform detection logic

**What fixed it:**
1. ✅ Removed problematic package
2. ✅ Removed basePath/assetPrefix completely
3. ✅ Simplified to minimal config
4. ✅ Added proper Netlify plugin
5. ✅ Clean build scripts

---

**Deploy this branch and your styles will load!** 🚀✨

