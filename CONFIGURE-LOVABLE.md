# 🎯 Configure Your Existing Lovable Project

## 📋 **Your Project Details**
- **Project URL**: https://lovable.dev/projects/7c36db78-9a1d-4c0f-8f35-756d3a186a5b
- **Status**: Project created ✅
- **Next**: Configure for Monad Security Monitor deployment

## 🔧 **Configuration Steps**

### **Step 1: Connect Your Repository**

In your Lovable project dashboard, look for:

1. **"Connect Repository"** or **"Import Code"** button
2. **"Settings"** → **"Repository"** section
3. **GitHub integration** options

**Repository to connect**: `grxkun/Monad-wallet-checker`

### **Step 2: Set Root Directory**

⚠️ **CRITICAL**: Your frontend is in a subfolder!

Set the **Root Directory** or **Base Directory** to:
```
lovable-frontend/
```

This tells Lovable to build from the `lovable-frontend/` folder, not the root.

### **Step 3: Build Configuration**

Lovable should auto-detect, but verify these settings:

- **Framework**: React + Vite ✅
- **Build Command**: `npm run build` ✅  
- **Output Directory**: `dist` ✅
- **Node Version**: 18+ ✅

### **Step 4: Environment Variables**

Add this environment variable in Lovable settings:

```
VITE_API_URL=https://your-backend-api.onrender.com
```

**Replace with your actual backend URL**:
- Render: `https://monad-security-api.onrender.com`
- Heroku: `https://your-app.herokuapp.com`
- Railway: `https://your-app.railway.app`

### **Step 5: Deploy**

Click **"Deploy"** or **"Build & Deploy"** button

## 🎯 **What to Look For in Lovable Interface**

### **Repository Connection:**
- Look for "GitHub" icon or "Connect Git" option
- Should show your repository: `grxkun/Monad-wallet-checker`

### **Build Settings:**
- **Root/Base Directory**: `lovable-frontend/`
- **Framework Detection**: Should show "React" or "Vite"

### **Environment Variables:**
- Look for "Environment Variables" or "Env Vars" section
- Add `VITE_API_URL` with your backend URL

## 🚀 **Expected Build Process**

Once configured correctly, Lovable will:

1. **Clone** your repository
2. **Navigate** to `lovable-frontend/` folder
3. **Install** dependencies (`npm install`)
4. **Build** the React app (`npm run build`)
5. **Deploy** to your live URL

## 📱 **Your Live App Will Have**

Once deployed successfully:

- **URL**: `https://your-project-name.lovable.app`
- **Features**: 
  - Real-time threat monitoring
  - Wallet security scanner
  - Mobile-responsive design
  - No wallet connection required
  - Known malicious contract detection

## 🔍 **Troubleshooting Common Issues**

### **Build Fails:**
- ✅ Check Root Directory is set to `lovable-frontend/`
- ✅ Verify Node.js version is 18+
- ✅ Check build logs for missing dependencies

### **App Loads but API Doesn't Work:**
- ✅ Verify `VITE_API_URL` environment variable is set
- ✅ Check your backend API is accessible
- ✅ Verify CORS settings allow your Lovable domain

### **404 Error:**
- ✅ Ensure Root Directory points to `lovable-frontend/`
- ✅ Check `package.json` exists in that folder

## 🎉 **Success Indicators**

You'll know it's working when:

- ✅ Build completes without errors
- ✅ App loads at your Lovable URL
- ✅ Wallet scanner accepts addresses
- ✅ Test buttons work (Known Attacker, Malicious Contract)
- ✅ Real-time monitoring shows connection status

## 📞 **Need Help?**

If you get stuck:

1. **Check build logs** in Lovable dashboard
2. **Verify file structure** matches the expected layout
3. **Test locally** first: `cd lovable-frontend && npm run dev`

---

**🚀 Ready to configure? Go to your project settings and follow the steps above!**

Your Monad Security Monitor will be live and protecting the community soon! 🛡️