# 🚀 Deploy Kharadhu to GitHub Pages

This guide will walk you through deploying your Kharadhu expense tracker to GitHub Pages, making it accessible online.

## 📋 Prerequisites

- A GitHub account (create one at [github.com](https://github.com) if you don't have one)
- Git installed on your computer

## 🎯 Step-by-Step Deployment Guide

### Step 1: Create a New GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon in the top-right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `kharadhu` (or any name you prefer)
   - **Description**: "Maldives Expense Tracker - Track BML/MIB transactions"
   - **Visibility**: Choose **Public** (required for free GitHub Pages)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

### Step 2: Connect Your Local Project to GitHub

Open your terminal/command prompt and navigate to the project folder:

```bash
cd kharadhuapp/maldives-expense-tracker
```

Then run these commands one by one:

```bash
# Add all files to git
git add .

# Create your first commit
git commit -m "Initial commit - Kharadhu Expense Tracker"

# Add your GitHub repository as remote (REPLACE with your actual URL)
git remote add origin https://github.com/YOUR-USERNAME/kharadhu.git

# Push to GitHub
git push -u origin main
```

**Important**: Replace `YOUR-USERNAME` with your actual GitHub username!

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **"Settings"** tab (at the top)
3. Scroll down and click **"Pages"** in the left sidebar
4. Under **"Source"**, select:
   - **Source**: GitHub Actions
5. Click **"Save"**

### Step 4: Wait for Deployment

1. Go to the **"Actions"** tab in your repository
2. You should see a workflow running called **"Deploy to GitHub Pages"**
3. Wait for it to complete (usually takes 1-3 minutes)
4. Once complete, you'll see a green checkmark ✅

### Step 5: Access Your App! 🎉

Your app will be available at:

```
https://YOUR-USERNAME.github.io/kharadhu/
```

Replace `YOUR-USERNAME` with your GitHub username.

## 🔄 Making Updates

Whenever you make changes to your app and want to deploy:

```bash
# Navigate to project folder
cd kharadhuapp/maldives-expense-tracker

# Add changes
git add .

# Commit changes
git commit -m "Description of your changes"

# Push to GitHub
git push
```

The app will automatically rebuild and redeploy (takes 1-3 minutes).

## 🎨 Customizing the URL

### Option 1: Custom Repository Name

If you want a different URL, you can:

1. Rename your repository on GitHub (Settings → General → Repository name)
2. Update `vite.config.js`:
   ```js
   base: '/your-new-repo-name/',
   ```
3. Commit and push the change

### Option 2: Custom Domain (Advanced)

If you own a domain, you can set up a custom domain:

1. Go to Settings → Pages
2. Add your custom domain under "Custom domain"
3. Follow GitHub's instructions for DNS configuration

## ✅ Verification Checklist

After deployment, test these features:

- [ ] App loads without errors
- [ ] Can create an account and sign in
- [ ] Can add manual transactions
- [ ] Can import SMS transactions
- [ ] Dashboard shows correct data
- [ ] All pages (Dashboard, Transactions, Reports, Profile) work
- [ ] Theme toggle works
- [ ] Data persists after refresh

## 🐛 Troubleshooting

### Problem: 404 Page Not Found

**Solution**: Make sure the `base` path in `vite.config.js` matches your repository name:
```js
export default defineConfig({
  base: '/kharadhu/', // Must match repository name
  plugins: [react()],
})
```

### Problem: Blank Page or Assets Not Loading

**Solution**: 
1. Check browser console (F12) for errors
2. Verify the base path is correct
3. Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Problem: Build Fails in GitHub Actions

**Solution**:
1. Go to Actions tab and click on the failed workflow
2. Check the error logs
3. Common issues:
   - Missing dependencies: Run `npm install` locally and commit `package-lock.json`
   - Build errors: Run `npm run build` locally to test

### Problem: Changes Not Showing Up

**Solution**:
1. Check if GitHub Actions workflow completed successfully
2. Clear browser cache (Ctrl+Shift+Delete)
3. Wait a few minutes for GitHub's CDN to update

## 📱 Sharing Your App

Once deployed, you can share your app with anyone:

1. **Share the URL**: Send them your GitHub Pages URL
2. **QR Code**: Generate a QR code for easy mobile access
3. **Social Media**: Share on Twitter/Facebook with #Kharadhu

## 🔒 Privacy & Data

**Important Notes**:

- ✅ All data is stored **locally** in the user's browser (IndexedDB)
- ✅ **No data** is sent to any servers
- ✅ Each user's data is completely **private and isolated**
- ✅ Data stays on the device, not on GitHub
- ✅ Users can export their data anytime

## 📊 GitHub Pages Features

Your deployed app will have:

- ✅ **Free hosting** (no cost)
- ✅ **HTTPS enabled** by default
- ✅ **Auto-deployment** on every push
- ✅ **Fast CDN delivery** worldwide
- ✅ **Version control** through Git

## 🎓 What Happens During Deployment?

1. You push code to GitHub
2. GitHub Actions workflow starts automatically
3. Node.js environment is set up
4. Dependencies are installed (`npm ci`)
5. App is built for production (`npm run build`)
6. Built files are uploaded to GitHub Pages
7. Your app is live! 🎉

## 🛠️ Advanced Configuration

### Environment-Specific Builds

If you need different configurations for development vs production:

```js
// vite.config.js
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/kharadhu/' : '/',
  plugins: [react()],
}))
```

### Build Optimization

The app is already optimized, but you can check build output:

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## 📞 Need Help?

If you encounter issues:

1. Check the Actions tab for build logs
2. Review the troubleshooting section above
3. Check browser console for errors (F12)
4. Verify all steps were followed correctly

---

**🎉 Congratulations!** Your Kharadhu expense tracker is now live on the internet!

**App URL**: `https://YOUR-USERNAME.github.io/kharadhu/`

Enjoy tracking your expenses online! 💰🌊
