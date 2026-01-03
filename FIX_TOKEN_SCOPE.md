# 🔧 Fix Token Scope Issue

Your Personal Access Token needs the **workflow** scope to push GitHub Actions files.

## ✅ Quick Fix (2 minutes)

### Option 1: Update Your Existing Token

1. Go to: https://github.com/settings/tokens
2. Find your **"Kharadhu Deploy"** token
3. Click on it to edit
4. Check these permissions:
   - ✅ **repo** (should already be checked)
   - ✅ **workflow** (ADD THIS!)
5. Scroll down and click **"Update token"**
6. **You don't need to copy it again** - it's the same token

### Then Push Again:

```bash
cd kharadhuapp/maldives-expense-tracker
git push -u origin main --force
```

---

## ✅ Option 2: Create a New Token (If Option 1 Doesn't Work)

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Name: `Kharadhu Deploy Full`
4. Select permissions:
   - ✅ **repo** (Full control)
   - ✅ **workflow** (Update GitHub Action workflows)
5. Click **"Generate token"**
6. **COPY THE NEW TOKEN**

### Then Push:

```bash
cd kharadhuapp/maldives-expense-tracker
git push -u origin main --force
```

When prompted for password, paste the **NEW token**.

---

## 🎯 What These Permissions Mean:

- **repo**: Allows Git to push code
- **workflow**: Allows Git to push GitHub Actions workflow files (`.github/workflows/*.yml`)

---

## ✅ After It Works:

You should see:
```
To https://github.com/iwaleedh/kharadhu.git
 + abc1234...def5678 main -> main (forced update)
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

Then check: https://github.com/iwaleedh/kharadhu/actions

Your deployment should start automatically! 🚀
