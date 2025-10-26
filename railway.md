# Railway Deployment Configuration
# Copy package.railway.json to package.json for Railway deployment

# Railway will automatically:
# 1. Detect Node.js project
# 2. Run npm install
# 3. Run npm run build (builds TypeScript)
# 4. Run npm start (starts simple health server)

# Environment Variables needed in Railway:
# NODE_ENV=production
# PORT=3001 (Railway sets this automatically)
# FRONTEND_URL=https://mondoctor.lovable.app