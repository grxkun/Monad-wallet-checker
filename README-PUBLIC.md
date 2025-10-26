# Monad Wallet Security Monitor

A public security tool to detect and investigate EIP-7702 delegation attacks on Monad testnet. **No wallet connection required** - simply enter any wallet address to check for security threats.

## 🚨 What This Tool Detects

- **EIP-7702 Delegation Attacks**: Unauthorized wallet control via delegation
- **Fund Drainage**: Suspicious balance decreases and transfers  
- **Malicious Contracts**: Known attack contracts and suspicious patterns
- **Attack Timelines**: Complete reconstruction of attack sequences
- **Real-time Monitoring**: Continuous threat detection

## 🎯 Key Features

### ✅ No Wallet Connection Required
- **Public Investigation**: Check any wallet address for threats
- **Privacy Safe**: Uses read-only blockchain data
- **Community Tool**: Help others detect attacks

### 🔍 Investigation Tools
- `check` - Quick delegation status check
- `investigate` - Memory-free forensic analysis  
- `trace` - Attack source investigation
- `find-signature` - Penetration signature hunting
- `simulate-attack` - 7-day attack timeline reconstruction
- `threat-check` - Immediate security assessment
- `monitor` - Real-time attack detection

### 🚨 Known Attack Vectors
- **MAC Verify Scam** (mac-chi.vercel.app) - NFT verification phishing
- **NadPoker** (app.nadpoker.xyz) - Gambling DApp with suspicious permissions
- **Other EIP-7702 delegation scams**

## 🛡️ How It Helps

1. **Early Detection**: Identify attacks before total fund loss
2. **Attack Analysis**: Understand how the attack happened
3. **Community Protection**: Share threat intelligence
4. **Evidence Gathering**: Document attacks for reporting

## ⚡ Quick Start

```bash
# Check any wallet for threats
npm run check --address 0x...

# Full investigation (no memory required)
npm run investigate --address 0x...

# Real-time monitoring
npm run monitor --address 0x...
```

## 🚨 Real Attack Case Study

**Victim Wallet**: `0xe819fdcf966bc12d10dcfebbf271ab62ba900072`
- **Attack Date**: October 22, 2025, 18:50:30
- **Attack Vector**: mac-chi.vercel.app (NFT verification scam)
- **Method**: EIP-7702 delegation authorization
- **Loss**: ~4,123 MON
- **Attacker Wallet**: `0x275b2f6aF83f99C40FDaBf5bc6b22E1B6C3F75B7`

## 🔧 Technology Stack

- **Frontend**: Next.js / React (Lovable deployment)
- **Backend**: Node.js with TypeScript
- **Database**: Supabase (threat intelligence storage)
- **Blockchain**: Ethers.js v6 (Monad testnet integration)
- **Monitoring**: Real-time WebSocket connections

## 🌐 Public Deployment

### Lovable Frontend
- Public web interface for wallet security checks
- No wallet connection required
- Community threat reporting
- Real-time attack alerts

### Supabase Backend  
- Threat intelligence database
- Known malicious contracts registry
- Attack pattern storage
- Community reporting system

## 📊 Threat Intelligence Database

```sql
-- Known malicious contracts
CREATE TABLE malicious_contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_address TEXT NOT NULL UNIQUE,
  attack_type TEXT NOT NULL,
  first_seen TIMESTAMP DEFAULT NOW(),
  total_victims INTEGER DEFAULT 0,
  estimated_damage DECIMAL,
  status TEXT DEFAULT 'active'
);

-- Attack reports  
CREATE TABLE attack_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  victim_wallet TEXT NOT NULL,
  attacker_wallet TEXT,
  malicious_contract TEXT,
  attack_vector TEXT,
  penetration_timestamp TIMESTAMP,
  estimated_loss DECIMAL,
  status TEXT DEFAULT 'active',
  reported_at TIMESTAMP DEFAULT NOW()
);

-- Threat alerts
CREATE TABLE threat_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  threat_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  evidence JSONB,
  detected_at TIMESTAMP DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);
```

## 🚀 Community Features

- **Public Security Dashboard**: View global attack statistics
- **Threat Intelligence Feed**: Real-time attack notifications  
- **Community Reporting**: Report suspicious contracts and websites
- **Educational Resources**: Learn about EIP-7702 security
- **Attack Case Studies**: Detailed analysis of real attacks

## ⚠️ Security Notice

This tool is for **investigation and monitoring only**. It does not:
- Require wallet connection
- Request private keys or signatures
- Perform any transactions
- Store sensitive user data

## 📱 API Endpoints

```typescript
// Public security check
GET /api/check/:walletAddress

// Threat assessment  
GET /api/threat-check/:walletAddress

// Attack simulation
GET /api/simulate-attack/:walletAddress

// Known threats database
GET /api/threats

// Community reporting
POST /api/report-threat
```

## 🔮 Future Features

- **Mobile App**: React Native for mobile security checks
- **Browser Extension**: Real-time website threat detection
- **Telegram Bot**: Community alert notifications
- **API Integration**: Third-party security tool integration
- **Multi-chain Support**: Extend beyond Monad testnet

---

**🛡️ Protect the Monad Community - No Wallet Connection Required**

*Help detect EIP-7702 delegation attacks before they drain community funds.*