# 🔗 Deploy to Lovable via GitHub Integration

This guide walks you through connecting your GitHub repository to Lovable for automatic deployments.

## 📋 Prerequisites

- GitHub account
- Lovable account ([lovable.dev](https://lovable.dev))
- Backend API deployed (e.g., Render, Heroku, Railway)

## 🚀 Step-by-Step GitHub Integration

### Step 1: Push Frontend to GitHub

1. **Navigate to the frontend directory**:
   ```bash
   cd lovable-frontend
   ```

2. **Initialize Git repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Monad Security Monitor frontend"
   ```

3. **Create GitHub repository**:
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name: `monad-security-monitor-frontend`
   - Description: "Real-time EIP-7702 attack detection for Monad testnet"
   - Set to Public (recommended for community project)
   - Click "Create repository"

4. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/monad-security-monitor-frontend.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Connect Repository to Lovable

1. **Login to Lovable**:
   - Go to [lovable.dev](https://lovable.dev)
   - Sign in with GitHub (recommended)

2. **Import Project from GitHub**:
   - Click "New Project"
   - Select "Import from GitHub"
   - Choose your repository: `monad-security-monitor-frontend`
   - Lovable will automatically detect it's a React + Vite project

3. **Configure Project Settings**:
   - **Project Name**: Monad Security Monitor
   - **Framework**: React (auto-detected)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

### Step 3: Set Environment Variables

1. **In Lovable Dashboard**:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add the following:

   ```
   VITE_API_URL=https://your-backend-api.onrender.com
   VITE_APP_NAME=Monad Security Monitor
   VITE_APP_VERSION=1.0.0
   ```

2. **Replace with your actual backend URL**:
   - Render: `https://monad-security-api.onrender.com`
   - Heroku: `https://your-app.herokuapp.com`
   - Railway: `https://your-app.railway.app`

### Step 4: Deploy and Configure Auto-Deployment

1. **Initial Deployment**:
   - Click "Deploy" in Lovable
   - Lovable will build and deploy your app
   - Your app will be available at: `https://project-name.lovable.app`

2. **Configure Auto-Deployment**:
   - Go to "Deployment Settings"
   - Enable "Auto-deploy from main branch"
   - Now every push to main will trigger automatic deployment

### Step 5: Test Your Deployment

1. **Verify Core Features**:
   ```
   ✅ App loads at your Lovable URL
   ✅ Wallet scanner accepts addresses
   ✅ Test buttons work (Known Attacker, Malicious Contract)
   ✅ Real-time monitoring shows connection status
   ✅ Responsive design works on mobile
   ```

2. **Test Known Attack Cases**:
   - Click "Test: Known Attacker Wallet"
   - Should show `0x275b2f6aF83f99C40FDaBf5bc6b22E1B6C3F75B7`
   - Scan should return critical risk level
   - If backend is connected, should show delegation details

## 🔄 Continuous Deployment Workflow

### Making Updates

1. **Local Development**:
   ```bash
   cd lovable-frontend
   npm run dev  # Test locally
   ```

2. **Deploy Changes**:
   ```bash
   git add .
   git commit -m "Update: [description of changes]"
   git push origin main
   ```

3. **Automatic Deployment**:
   - Lovable detects the push
   - Automatically builds and deploys
   - New version goes live in ~2-3 minutes

### Branch-based Development

For larger features:

1. **Create Feature Branch**:
   ```bash
   git checkout -b feature/new-security-feature
   # Make your changes
   git commit -am "Add new security feature"
   git push origin feature/new-security-feature
   ```

2. **Preview Deployment**:
   - Lovable can create preview deployments for feature branches
   - Test changes before merging to main

3. **Merge to Main**:
   ```bash
   git checkout main
   git merge feature/new-security-feature
   git push origin main
   ```

## 🛠️ Advanced Configuration

### Custom Domain (Optional)

1. **In Lovable Dashboard**:
   - Go to "Domains"
   - Add custom domain: `monad-security.com`
   - Follow DNS configuration instructions

### Performance Optimization

1. **Build Optimization**:
   - Lovable automatically optimizes builds
   - Includes code splitting and compression
   - CDN distribution for fast global access

2. **Environment-Specific Configs**:
   ```bash
   # .env.production
   VITE_API_URL=https://prod-api.your-domain.com
   
   # .env.development  
   VITE_API_URL=http://localhost:3001
   ```

## 🔒 Security Best Practices

### Environment Variables

- **Never commit `.env` files** to repository
- **Use Lovable's environment system** for secrets
- **Keep `.env.example`** as template for contributors

### Repository Security

1. **Add `.gitignore`**:
   ```
   # Environment variables
   .env
   .env.local
   .env.production
   
   # Dependencies
   node_modules
   
   # Build output
   dist
   build
   ```

2. **Secure Sensitive Data**:
   - API URLs are safe to expose (they're public endpoints)
   - Never commit API keys or private data

## 🚨 Troubleshooting

### Common GitHub Issues

1. **Permission Denied**:
   ```bash
   # Set up SSH key or use personal access token
   git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/repo.git
   ```

2. **Build Fails on Lovable**:
   - Check package.json scripts are correct
   - Verify environment variables are set
   - Check build logs in Lovable dashboard

3. **API Connection Issues**:
   - Verify `VITE_API_URL` is correct
   - Check CORS settings on backend
   - Test backend health endpoint directly

### Environment Variable Issues

1. **Variables Not Loading**:
   - Ensure variables start with `VITE_`
   - Restart development server after changes
   - Check Lovable dashboard environment settings

2. **Build-time vs Runtime**:
   - `VITE_` variables are injected at build time
   - Changes require rebuild and redeploy

## 🎉 Success Checklist

Before going live:

- [ ] Repository is public on GitHub
- [ ] Lovable is connected to GitHub repo
- [ ] Environment variables are configured
- [ ] Auto-deployment is enabled
- [ ] Test wallet scanning works
- [ ] Mobile responsiveness verified
- [ ] Backend API is accessible
- [ ] Real-time monitoring connects
- [ ] Known attack test cases work

## 📞 Support Resources

- **Lovable Docs**: [docs.lovable.dev](https://docs.lovable.dev)
- **GitHub Help**: [docs.github.com](https://docs.github.com)
- **React + Vite**: [vitejs.dev](https://vitejs.dev)

---

**Your Monad Security Monitor is now live and automatically updating! 🚀**

The community can access it at your Lovable URL and benefit from real-time protection against EIP-7702 delegation attacks.