# Contributing to Upstream Repository

## 🚨 Important: Never Push Directly to Upstream

You should **ALWAYS** use Pull Requests to contribute to the upstream repository.

---

## ✅ Proper Workflow

### **Step 1: Create a Pull Request**

1. **Go to your fork on GitHub:**
   ```
   https://github.com/FaisalFasi/risk-monitor-engine
   ```

2. **Click "Contribute" → "Open pull request"**

3. **Fill in PR details:**
   - Title: Clear, descriptive title
   - Description: What changed and why
   - Testing: How you tested it
   - Screenshots: If UI changes

4. **Submit PR for review**

5. **Wait for maintainers to:**
   - Review your code
   - Request changes if needed
   - Merge your PR when approved

---

## 📋 Your Current Commits to Contribute

```
✅ Add proactive testnet token notice in UI
✅ Add better error handling for insufficient balance errors
✅ Migrate from MyNearWallet to Meteor Wallet
✅ Fix Docker build for Render deployment
✅ Add Netlify troubleshooting guides
... and 20 more commits
```

Total: **25 commits ahead of upstream**

---

## 🔄 If Maintainers Want Direct Push Access

If the upstream maintainers give you direct push access:

1. **They need to add you as a collaborator**
   - Go to upstream repo settings
   - Add you with write access

2. **Then you can push:**
   ```bash
   # Create a feature branch
   git checkout -b feature/meteor-wallet-integration
   
   # Push to upstream (only if you have permission)
   git push upstream feature/meteor-wallet-integration
   
   # Then create PR from that branch
   ```

But this is **NOT recommended** without explicit permission!

---

## 🎯 Recommended: Create PR via GitHub UI

**Easiest way:**

1. Visit: https://github.com/FaisalFasi/risk-monitor-engine
2. Click: "Contribute" button
3. Click: "Open pull request"
4. Fill details
5. Submit!

**Done!** ✅

---

## ⚠️ What NOT to Do

```bash
# ❌ DON'T DO THIS:
git push upstream main  # You don't have permission

# ❌ DON'T DO THIS:
git push --force upstream main  # This will be rejected

# ❌ DON'T DO THIS:
git push upstream +main:main  # This breaks things
```

---

## ✅ What TO Do

```bash
# ✅ DO THIS:
# 1. Keep your fork updated
git push origin main

# 2. Create PR on GitHub
# (Use GitHub web interface)

# 3. Wait for review and merge
```

---

## 🎉 After Your PR is Merged

**Update your fork:**

```bash
# Fetch latest from upstream
git fetch upstream

# Merge upstream changes
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

**Now your fork is in sync with upstream!** ✅

---

## 📞 Need Help?

If you're unsure about contributing:

1. Check the upstream repository's CONTRIBUTING.md
2. Ask the maintainers in an issue
3. Follow their contribution guidelines

**Never push directly without permission!** ⚠️

