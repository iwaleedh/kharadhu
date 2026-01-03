# 🔐 Fix GitHub Authentication Issue

GitHub requires a **Personal Access Token (PAT)** instead of password for Git operations.

## ✅ Solution 1: Use Personal Access Token (Recommended)

### Step 1: Create a Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `Kharadhu Deploy`
4. Set expiration: **No expiration** (or choose your preference)
5. Select scopes (permissions):
   - ✅ **repo** (Full control of private repositories)
   - That's all you need!
6. Scroll down and click **"Generate token"**
7. **COPY THE TOKEN** - you won't see it again! ⚠️

### Step 2: Update Your Git Remote

```bash
cd kharadhuapp/maldives-expense-tracker

# Remove the old remote
git remote remove origin

# Add new remote with your username (REPLACE iwaleedh if different)
git remote add origin https://github.com/iwaleedh/kharadhu.git

# Push to GitHub
git push -u origin main
```

When prompted:
- **Username**: `iwaleedh`
- **Password**: Paste your **Personal Access Token** (not your GitHub password!)

---

## ✅ Solution 2: Use SSH (Alternative - More Secure)

### Step 1: Generate SSH Key

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Press Enter to accept default location
# Press Enter twice to skip passphrase (or set one if you prefer)

# Copy the public key
cat ~/.ssh/id_ed25519.pub
```

### Step 2: Add SSH Key to GitHub

1. Go to: https://github.com/settings/keys
2. Click **"New SSH key"**
3. Title: `My Computer`
4. Paste the key you copied
5. Click **"Add SSH key"**

### Step 3: Update Git Remote to Use SSH

```bash
cd kharadhuapp/maldives-expense-tracker

# Remove the old remote
git remote remove origin

# Add new remote with SSH
git remote add origin git@github.com:iwaleedh/kharadhu.git

# Push to GitHub
git push -u origin main
```

---

## 🚀 Which Solution to Choose?

### Use PAT (Solution 1) if:
- ✅ You want a quick setup
- ✅ You're comfortable storing the token
- ✅ First time using Git

### Use SSH (Solution 2) if:
- ✅ You want more security
- ✅ You work with Git frequently
- ✅ You don't want to enter credentials

---

## 📝 Quick Reference

### If you used PAT:
```bash
# Your remote should look like:
https://github.com/iwaleedh/kharadhu.git
```

### If you used SSH:
```bash
# Your remote should look like:
git@github.com:iwaleedh/kharadhu.git
```

---

## 🔍 Verify Your Setup

```bash
# Check remote URL
git remote -v

# Should show:
# origin  https://github.com/iwaleedh/kharadhu.git (fetch)
# origin  https://github.com/iwaleedh/kharadhu.git (push)
# OR
# origin  git@github.com:iwaleedh/kharadhu.git (fetch)
# origin  git@github.com:iwaleedh/kharadhu.git (push)
```

---

## 🎉 After Authentication Works

Continue with:
```bash
git push -u origin main
```

Then enable GitHub Pages as described in `GITHUB_DEPLOYMENT.md`!
