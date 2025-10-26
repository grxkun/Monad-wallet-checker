# 🛡️ Monad Security Monitor - Public Deployment Guide

A comprehensive security monitoring system for detecting and preventing EIP-7702 delegation attacks on Monad testnet.

## 🎯 Purpose

This tool was born from a real attack investigation where a user's wallet was compromised via a sophisticated EIP-7702 delegation attack through mac-chi.vercel.app (NFT verification scam). The attacker successfully stole 4,126 MON tokens by tricking users into authorizing delegations to malicious contracts.

**Our mission**: Protect the entire Monad community by providing real-time threat detection and intelligence sharing.

## 🚀 Quick Deploy to Production

### Option 1: Lovable + Supabase (Recommended)

#### Frontend Deployment (Lovable)

1. **Clone Repository**
   ```bash
   git clone https://github.com/monad-security/wallet-monitor.git
   cd wallet-monitor
   ```

2. **Set up Lovable Project**
   - Go to [Lovable.dev](https://lovable.dev)
   - Create new project: "Monad Security Monitor"
   - Upload the `/src/frontend/SecurityMonitor.tsx` component
   - Configure environment variables:
     ```
     REACT_APP_API_URL=https://your-backend-url.herokuapp.com
     ```

3. **Deploy Frontend**
   - Deploy with Lovable's one-click deployment
   - Your frontend will be available at: `https://monad-security-monitor.lovable.app`

#### Backend Deployment (Supabase + Heroku)

1. **Set up Supabase Database**
   - Create account at [Supabase.com](https://supabase.com)
   - Create new project: "monad-security-db"
   - Run the SQL schema from `supabase-schema.sql` in the SQL editor
   - Copy your Project URL and anon key

2. **Deploy Backend to Heroku**
   ```bash
   # Install Heroku CLI and login
   heroku create monad-security-api
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set SUPABASE_URL=your_supabase_url
   heroku config:set SUPABASE_ANON_KEY=your_supabase_anon_key
   heroku config:set FRONTEND_URL=https://monad-security-monitor.lovable.app
   
   # Deploy
   git push heroku main
   ```

3. **Verify Deployment**
   ```bash
   curl https://monad-security-api.herokuapp.com/api/health
   ```

### Option 2: Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables in Railway dashboard
```

### Option 3: Vercel + PlanetScale

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy backend
vercel --prod

# Use PlanetScale for database (similar to Supabase setup)
```

## 🔧 Configuration

### Environment Variables

Copy `.env.production` and update with your values:

```bash
# Server Configuration
PORT=3001
NODE_ENV=production

# Frontend URL
FRONTEND_URL=https://monad-security-monitor.lovable.app

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# Blockchain Configuration
MONAD_RPC_URL=https://monad-testnet.drpc.org
CHAIN_ID=10143
```

### Database Setup

Run the complete schema from `supabase-schema.sql`:

1. **Automatic Setup**: Copy and paste the entire SQL file into Supabase SQL editor
2. **Includes**:
   - Threat alerts table with real-time capabilities
   - Wallet scan results storage
   - Malicious contract registry (pre-loaded with known threats)
   - Attack signature database
   - Community reporting system
   - Monitoring statistics
   - Row-level security policies

## 🛠️ Features

### Real-time Threat Detection
- **EIP-7702 Delegation Monitoring**: Detects new delegation attacks in real-time
- **Malicious Contract Database**: Pre-loaded with known threats including mac-chi.vercel.app attack contract
- **WebSocket Alerts**: Instant notifications to all connected users
- **Attack Signature Recognition**: Identifies known attack patterns (NFT verification scam, etc.)

### Community Protection
- **No Wallet Connection Required**: Users can check any address without connecting wallets
- **Public Threat Intelligence**: Shared database of threats helps protect entire community
- **Community Reporting**: Users can report suspicious activity
- **Attack Pattern Learning**: System learns from new attacks to prevent future victims

### Comprehensive Analysis
- **Wallet Security Scanner**: Deep analysis of any wallet address
- **Balance Monitoring**: Track fund movements and potential drainage
- **Risk Assessment**: Automatic risk level calculation
- **Historical Analysis**: 7-day attack timeline reconstruction

## 📊 API Endpoints

### Public API (No Authentication Required)

```bash
# Health check
GET /api/health

# Scan any wallet
POST /api/scan-wallet
{
  "address": "0x..."
}

# Get recent threats
GET /api/threats

# Report suspicious activity
POST /api/report-threat
{
  "address": "0x...",
  "description": "Suspicious activity description",
  "evidence": {...}
}

# Community statistics
GET /api/stats
```

### WebSocket Real-time Monitoring

```javascript
const ws = new WebSocket('wss://monad-security-api.herokuapp.com');
ws.onmessage = (event) => {
  const alert = JSON.parse(event.data);
  if (alert.type === 'threat_alert') {
    // Display real-time threat alert
    console.log('New threat detected:', alert.alert);
  }
};
```

## 🧪 Testing the System

### Test Known Attack Address

```bash
# Test with the known compromised wallet
curl -X POST https://monad-security-api.herokuapp.com/api/scan-wallet \
  -H "Content-Type: application/json" \
  -d '{"address": "0x1234..."}'

# Should return critical risk level with delegation detected
```

### Test Real-time Monitoring

```bash
# Connect to WebSocket and watch for live threats
wscat -c wss://monad-security-api.herokuapp.com
```

## 🔒 Security Features

### Attack Prevention Database

**Pre-loaded Threats**:
- `0xee224caafbc78cc9a208bd22f8e7362b76eef4fa` - mac-chi.vercel.app delegator contract
- `0x275b2f6aF83f99C40FDaBf5bc6b22E1B6C3F75B7` - Attacker's fund accumulation wallet
- Signature `0x9e9bdb28` - NFT verification scam pattern
- Signature `0x8129fc1c` - Multicall delegation pattern

### Community Intelligence
- **Shared Threat Database**: All users benefit from community-discovered threats
- **Real-time Updates**: New threats are immediately shared across all users
- **No Single Point of Failure**: Distributed threat intelligence prevents attackers from hiding

## 📈 Monitoring & Analytics

### Built-in Dashboards
- **Real-time Threat Feed**: Live stream of detected attacks
- **Community Statistics**: Track total threats, scans, and active monitoring
- **Risk Heatmap**: Visualize threat levels across the network

### Integration Options
- **Discord/Slack Webhooks**: Get alerts in your community channels
- **API Integration**: Build custom monitoring tools
- **CSV Export**: Download threat data for analysis

## 🚀 Scaling Considerations

### Performance Optimization
- **Database Indexing**: Optimized for fast address lookups
- **WebSocket Clustering**: Supports multiple monitoring instances
- **Caching Layer**: Redis can be added for high-traffic scenarios

### Monitoring Infrastructure
- **Health Checks**: Built-in endpoint monitoring
- **Error Tracking**: Comprehensive error logging
- **Rate Limiting**: Prevents abuse while maintaining accessibility

## 🤝 Community Contribution

### Adding New Threats
```sql
-- Add newly discovered malicious contracts
INSERT INTO malicious_contracts (address, name, description, attack_type, severity, verified)
VALUES ('0x...', 'New Threat', 'Description of attack', 'EIP-7702 Delegation', 'critical', true);
```

### Reporting Issues
- **GitHub Issues**: Technical problems and feature requests
- **Community Reports**: Use the built-in reporting system for new threats
- **Security Disclosures**: Contact team for responsible disclosure

## 🎯 Success Metrics

### Protection Goals
- **Zero Future Victims**: Prevent mac-chi.vercel.app style attacks
- **Community Coverage**: Monitor 1000+ wallets daily
- **Response Time**: Detect new threats within 1 block confirmation
- **Intelligence Sharing**: Build comprehensive threat database

### Key Performance Indicators
- **Threat Detection Rate**: % of attacks caught in real-time
- **False Positive Rate**: Maintain <5% false alarms
- **Community Engagement**: Active users and reports
- **Prevention Success**: Wallets protected from delegation attacks

---

## 🆘 Emergency Response

If you discover a new attack:

1. **Immediate**: Report via `/api/report-threat` endpoint
2. **Evidence**: Include transaction hashes and attack vectors  
3. **Communication**: Alert is broadcast to all connected users
4. **Update**: Malicious contracts are added to permanent database

**Remember**: This system exists because individual users can't remember every attack vector. Together, we build community immunity against sophisticated attacks like the mac-chi.vercel.app delegation scam.

---

*Built by the Monad Security Community - Protecting wallets through collective intelligence* 🛡️