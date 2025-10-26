# 🚀 Quick Deploy Commands

## Option 1: Use Existing Repository (Recommended)

Since you already have the main Monad-wallet-checker repository, you can deploy the frontend from this repo:

### Push current changes to your main repository:

```bash
# Go to main repository
cd /d/evm/Monad-wallet-checker

# Add the lovable-frontend folder to main repo
git add lovable-frontend/
git commit -m "Add: Complete Lovable frontend for community deployment"
git push origin main
```

### Deploy to Lovable from main repository:
1. Go to [lovable.dev](https://lovable.dev)
2. Click "Import from GitHub"  
3. Select: `grxkun/Monad-wallet-checker`
4. **Set Root Directory**: `lovable-frontend/` (important!)
5. Lovable will detect React + Vite in the subfolder

## Option 2: Create Separate Frontend Repository

If you prefer a dedicated frontend repository:

```bash
# Create new repository on GitHub: 
# https://github.com/new
# Name: monad-security-monitor-frontend

# From the lovable-frontend directory:
cd /d/evm/Monad-wallet-checker/lovable-frontend

# Add remote and push
git remote add origin https://github.com/grxkun/monad-security-monitor-frontend.git
git push -u origin main
```

## 🔧 Environment Variables for Lovable

Regardless of which option you choose, set these in Lovable:

```
VITE_API_URL=https://your-backend-api.onrender.com
```

## 🎯 Recommended: Option 1 (Subfolder)

**Benefits:**
- ✅ Keeps everything in one repository
- ✅ Easier to maintain backend + frontend together  
- ✅ Single source of truth for the entire project
- ✅ Simpler for contributors

**Lovable supports subfolder deployments perfectly!**

---

**Ready to deploy? Run the commands above!** 🚀