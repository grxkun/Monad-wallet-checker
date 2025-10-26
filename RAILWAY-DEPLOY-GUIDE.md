# 🚂 Deploy Monad Security Monitor Backend to Railway

## 🎯 **You're in Railway - Let's Deploy!**

Since you're already in the Railway app, here's exactly what to do:

### **Step 1: Create New Project**

1. **Click "New Project"** (big button on Railway dashboard)
2. **Select "Deploy from GitHub repo"**
3. **Choose repository**: `grxkun/Monad-wallet-checker`
4. **Click "Deploy Now"**

Railway will automatically:
- ✅ Detect Node.js project
- ✅ Find `package.json` in root
- ✅ Run `npm install` and `npm run build`
- ✅ Start the server

### **Step 2: Configure Environment Variables**

In your Railway project dashboard:

1. **Go to "Variables" tab**
2. **Add these environment variables**:

```
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-lovable-app.lovable.app
MONAD_RPC_URL=https://monad-testnet.drpc.org
CHAIN_ID=10143
```

**Optional (if you want Supabase integration)**:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Step 3: Get Your API URL**

After deployment completes:

1. **Go to "Settings" tab**
2. **Find "Domains" section**
3. **Copy your Railway URL**: `https://your-app.railway.app`

### **Step 4: Update Lovable Frontend**

Go back to your Lovable project:
1. **Environment Variables** section
2. **Set**: `VITE_API_URL=https://your-app.railway.app`
3. **Redeploy** the frontend

## 🔧 **Railway Configuration Details**

### **Build Settings (Auto-detected)**
Railway should automatically detect:
- **Framework**: Node.js ✅
- **Build Command**: `npm run build` ✅
- **Start Command**: `npm start` or `node dist/server.js` ✅
- **Port**: `3001` (from your code) ✅

### **If Build Fails - Check These:**

1. **Root Directory**: Should be `/` (not `lovable-frontend/`)
2. **Package.json**: Should exist in root (✅ it does)
3. **Build Command**: `npm run build`
4. **Start Command**: `npm start`

## 🎯 **Expected Railway Deployment Process**

```bash
# Railway will run:
npm install          # Install dependencies
npm run build        # Build TypeScript to dist/
npm start           # Start the server

# Your API will be available at:
https://your-app.railway.app
```

## 🧪 **Test Your Deployed API**

Once deployed, test these endpoints:

1. **Health Check**:
   ```
   GET https://your-app.railway.app/api/health
   ```

2. **Wallet Scan**:
   ```
   POST https://your-app.railway.app/api/scan-wallet
   Content-Type: application/json
   
   {
     "address": "0x275b2f6aF83f99C40FDaBf5bc6b22E1B6C3F75B7"
   }
   ```

## 🔍 **If Something Goes Wrong**

### **Check Build Logs**:
1. Go to your Railway project
2. Click on "Deployments" tab
3. Check the latest deployment logs

### **Common Issues**:

#### **"Module not found" errors**:
- Check if all dependencies are in `package.json`
- Railway should run `npm install` automatically

#### **Port binding errors**:
- Railway automatically sets `PORT` environment variable
- Your server should use `process.env.PORT || 3001`

#### **CORS errors**:
- Make sure `FRONTEND_URL` environment variable is set
- Update it when you get your Lovable URL

## 🎉 **Success Indicators**

You'll know it's working when:

- ✅ **Railway shows "Deployed"** status
- ✅ **Health endpoint responds**: `GET /api/health`
- ✅ **Wallet scan works**: `POST /api/scan-wallet`
- ✅ **Logs show "Server running on port XXXX"**

## 🔄 **Connect Frontend to Backend**

Once Railway deployment is successful:

1. **Copy your Railway URL**: `https://your-app.railway.app`
2. **Go to Lovable project**: https://lovable.dev/projects/7c36db78-9a1d-4c0f-8f35-756d3a186a5b
3. **Update environment variable**: `VITE_API_URL=https://your-app.railway.app`
4. **Redeploy frontend**

## 🛡️ **Full Stack Security Monitor Ready!**

After both deployments:
- **Backend API**: Real-time threat detection on Railway
- **Frontend**: Security dashboard on Lovable
- **Integration**: Live wallet scanning with community protection

---

**🚂 Ready to deploy? Click "New Project" in Railway and select your repository!**