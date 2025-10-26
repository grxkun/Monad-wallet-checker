# 🔗 Connect Railway Backend to Your Live Frontend

## 🎯 **Your Current Setup**
- **Frontend**: https://mondoctor.lovable.app/ ✅ LIVE
- **Backend**: Deploy to Railway ⏳ NEXT STEP

## 🚂 **Railway Deployment Steps**

### **1. Deploy Backend to Railway**

In your Railway dashboard:

1. **Click "New Project"**
2. **"Deploy from GitHub repo"**
3. **Select**: `grxkun/Monad-wallet-checker`
4. **Deploy**

### **2. Set Environment Variables in Railway**

Add these in Railway project settings:

```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://mondoctor.lovable.app
MONAD_RPC_URL=https://monad-testnet.drpc.org
CHAIN_ID=10143
CORS_ORIGIN=https://mondoctor.lovable.app
```

### **3. Get Railway API URL**

After deployment:
- Go to **Settings** → **Domains**
- Copy URL: `https://monad-wallet-checker-production.up.railway.app`

### **4. Update Lovable Environment Variable**

In your Lovable project:
- **Environment Variables** section
- **Set**: `VITE_API_URL=https://your-railway-url.railway.app`
- **Redeploy**

## 🧪 **Test Full Integration**

After connecting:

1. **Visit**: https://mondoctor.lovable.app/
2. **Test wallet scan**: `0x275b2f6aF83f99C40FDaBf5bc6b22E1B6C3F75B7`
3. **Should show**: Full scan results with risk assessment
4. **Check status**: "Live Monitoring" instead of "Offline Mode"

## 🎉 **Expected Results**

### **Before Backend (Current)**
- Shows "Offline Mode" 
- Basic UI works
- No wallet scanning functionality

### **After Backend Connected**
- **Real-time monitoring** status
- **Wallet security scanning** works
- **Known malicious contract** detection
- **Critical risk alerts** for test addresses
- **Community statistics** display

## ⚡ **Quick Railway Deploy Command**

For faster setup, your Railway project should detect:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Port**: Automatically detected from your server code

## 🛡️ **Full Security Features Activated**

Once connected, your live app will provide:

- ✅ **EIP-7702 Delegation Detection**
- ✅ **Real-time Threat Alerts** 
- ✅ **Known Attack Pattern Recognition**
- ✅ **Community Protection Database**
- ✅ **Mobile-Responsive Security Scanner**
- ✅ **No Wallet Connection Required**

---

**🚀 Ready to deploy the backend? Your frontend is already protecting users at https://mondoctor.lovable.app/**