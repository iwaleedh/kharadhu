# 🚀 Quick Deployment Commands

## Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `kharadhu`
3. Make it **Public**
4. Don't initialize with anything
5. Click **"Create repository"**

## Step 2: Run These Commands

Open terminal in `kharadhuapp/maldives-expense-tracker` folder and run:

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit - Kharadhu Expense Tracker"

# Add remote (REPLACE YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/kharadhu.git

# Push to GitHub
git push -u origin main
```

## Step 3: Enable GitHub Pages

1. Go to: `https://github.com/YOUR-USERNAME/kharadhu/settings/pages`
2. Under **"Source"**, select: **GitHub Actions**
3. Save and wait 2-3 minutes

## Step 4: Access Your App

Your app will be live at:
```
https://YOUR-USERNAME.github.io/kharadhu/
```

## 🔄 Update App Later

```bash
git add .
git commit -m "Your update message"
git push
```

That's it! 🎉
