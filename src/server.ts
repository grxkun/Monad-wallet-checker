import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// Monad testnet provider
const provider = new ethers.JsonRpcProvider('https://monad-testnet.drpc.org');

// Security middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://monad-security-monitor.lovable.app',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Known malicious contracts database
const KNOWN_MALICIOUS_CONTRACTS = new Set([
  '0xee224caafbc78cc9a208bd22f8e7362b76eef4fa', // mac-chi.vercel.app delegator
  // Add more as discovered
]);

// Known attack signatures database
const KNOWN_ATTACK_SIGNATURES = new Set([
  '0x9e9bdb28', // NFT verification scam
  '0x8129fc1c', // Multicall delegation
  // Add more as discovered
]);

// Threat intelligence interface
interface ThreatAlert {
  id: string;
  address: string;
  threat_type: 'delegation_attack' | 'balance_drain' | 'malicious_contract' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: any;
  timestamp: string;
  resolved: boolean;
}

interface WalletScan {
  address: string;
  has_delegation: boolean;
  delegated_to?: string;
  balance_mon: string;
  risk_level: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  threats: string[];
  last_scanned: string;
}

// Real-time monitoring system
class SecurityMonitor {
  private clients: Set<any> = new Set();
  private monitoring = false;

  addClient(ws: any) {
    this.clients.add(ws);
    ws.on('close', () => this.clients.delete(ws));
  }

  broadcast(data: any) {
    const message = JSON.stringify(data);
    this.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  }

  async startMonitoring() {
    if (this.monitoring) return;
    this.monitoring = true;

    console.log('🔍 Starting real-time threat monitoring...');
    
    // Monitor new blocks for suspicious transactions
    provider.on('block', async (blockNumber) => {
      try {
        await this.scanBlockForThreats(blockNumber);
      } catch (error) {
        console.error('Block scan error:', error);
      }
    });

    this.broadcast({
      type: 'monitor_status',
      status: 'active',
      message: 'Real-time threat monitoring is now active'
    });
  }

  async scanBlockForThreats(blockNumber: number) {
    try {
      const block = await provider.getBlock(blockNumber, true);
      if (!block || !block.transactions) return;

      for (const tx of block.transactions) {
        if (typeof tx === 'string') continue;
        
        // Check for EIP-7702 authorization signatures
        if (tx.data && KNOWN_ATTACK_SIGNATURES.has(tx.data.slice(0, 10))) {
          await this.handleThreatDetection({
            type: 'delegation_attack',
            transaction: tx,
            block: blockNumber,
            severity: 'high'
          });
        }

        // Check for interactions with known malicious contracts
        if (tx.to && KNOWN_MALICIOUS_CONTRACTS.has(tx.to.toLowerCase())) {
          await this.handleThreatDetection({
            type: 'malicious_contract',
            transaction: tx,
            block: blockNumber,
            severity: 'critical'
          });
        }
      }
    } catch (error) {
      console.error('Block scanning error:', error);
    }
  }

  async handleThreatDetection(threat: any) {
    const alert: ThreatAlert = {
      id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      address: threat.transaction.from || 'unknown',
      threat_type: threat.type,
      severity: threat.severity,
      description: this.generateThreatDescription(threat),
      evidence: {
        transaction_hash: threat.transaction.hash,
        block_number: threat.block,
        to_address: threat.transaction.to,
        data: threat.transaction.data
      },
      timestamp: new Date().toISOString(),
      resolved: false
    };

    // Store in Supabase
    await supabase.from('threat_alerts').insert(alert);

    // Broadcast to connected clients
    this.broadcast({
      type: 'threat_alert',
      alert
    });

    console.log(`🚨 THREAT DETECTED: ${alert.description}`);
  }

  generateThreatDescription(threat: any): string {
    switch (threat.type) {
      case 'delegation_attack':
        return `EIP-7702 delegation attack detected from ${threat.transaction.from}`;
      case 'malicious_contract':
        return `Interaction with known malicious contract ${threat.transaction.to}`;
      default:
        return `Suspicious activity detected in transaction ${threat.transaction.hash}`;
    }
  }
}

const monitor = new SecurityMonitor();

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('🔗 New client connected to threat monitoring');
  monitor.addClient(ws);
  
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to Monad Security Monitor'
  }));
});

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Monad Security Monitor',
    timestamp: new Date().toISOString()
  });
});

// Scan wallet for threats
app.post('/api/scan-wallet', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    const scan = await performWalletScan(address);
    
    // Store scan result in Supabase
    await supabase.from('wallet_scans').upsert({
      address: address.toLowerCase(),
      ...scan
    });

    res.json({ success: true, scan });
  } catch (error) {
    console.error('Wallet scan error:', error);
    res.status(500).json({ error: 'Scan failed' });
  }
});

// Get threat alerts
app.get('/api/threats', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('threat_alerts')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;

    res.json({ threats: data || [] });
  } catch (error) {
    console.error('Threat fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch threats' });
  }
});

// Report suspicious activity
app.post('/api/report-threat', async (req, res) => {
  try {
    const { address, description, evidence } = req.body;

    const alert: Partial<ThreatAlert> = {
      id: `user_report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      address: address?.toLowerCase() || 'unknown',
      threat_type: 'suspicious_activity',
      severity: 'medium',
      description: description || 'User reported suspicious activity',
      evidence,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    const { error } = await supabase.from('threat_alerts').insert(alert);
    
    if (error) throw error;

    // Broadcast to monitoring clients
    monitor.broadcast({
      type: 'user_report',
      alert
    });

    res.json({ success: true, message: 'Threat reported successfully' });
  } catch (error) {
    console.error('Threat report error:', error);
    res.status(500).json({ error: 'Failed to report threat' });
  }
});

// Get community statistics
app.get('/api/stats', async (req, res) => {
  try {
    const [threatsResult, scansResult] = await Promise.all([
      supabase.from('threat_alerts').select('*', { count: 'exact' }),
      supabase.from('wallet_scans').select('*', { count: 'exact' })
    ]);

    const stats = {
      total_threats: threatsResult.count || 0,
      total_scans: scansResult.count || 0,
      active_monitoring: monitor.clients.size,
      known_malicious_contracts: KNOWN_MALICIOUS_CONTRACTS.size,
      last_updated: new Date().toISOString()
    };

    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Core wallet scanning function
async function performWalletScan(address: string): Promise<WalletScan> {
  const scan: WalletScan = {
    address: address.toLowerCase(),
    has_delegation: false,
    balance_mon: '0',
    risk_level: 'safe',
    threats: [],
    last_scanned: new Date().toISOString()
  };

  try {
    // Check balance
    const balance = await provider.getBalance(address);
    scan.balance_mon = ethers.formatEther(balance);

    // Check for EIP-7702 delegation
    const code = await provider.getCode(address);
    if (code && code !== '0x') {
      scan.has_delegation = true;
      scan.delegated_to = await extractDelegationTarget(code);
      
      // Check if delegated to known malicious contract
      if (scan.delegated_to && KNOWN_MALICIOUS_CONTRACTS.has(scan.delegated_to.toLowerCase())) {
        scan.risk_level = 'critical';
        scan.threats.push('Delegated to known malicious contract');
      } else if (scan.delegated_to) {
        scan.risk_level = 'high';
        scan.threats.push('EIP-7702 delegation detected');
      }
    }

    // Check transaction history for attack patterns
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latestBlock - 1000); // Last ~1000 blocks

    try {
      const logs = await provider.getLogs({
        fromBlock,
        toBlock: 'latest',
        address: address
      });

      for (const log of logs) {
        if (KNOWN_ATTACK_SIGNATURES.has(log.data.slice(0, 10))) {
          scan.threats.push('Suspicious transaction signature detected');
          scan.risk_level = scan.risk_level === 'safe' ? 'medium' : scan.risk_level;
        }
      }
    } catch (logError) {
      // Logs might not be available, continue without them
    }

  } catch (error) {
    console.error('Wallet scan error:', error);
    scan.threats.push('Scan error - unable to complete full analysis');
    scan.risk_level = 'medium';
  }

  return scan;
}

async function extractDelegationTarget(code: string): Promise<string | undefined> {
  // EIP-7702 delegation format: 0xef0100 + 20-byte address
  if (code.startsWith('0xef0100') && code.length >= 46) {
    return '0x' + code.slice(6, 46);
  }
  return undefined;
}

// Start monitoring when server starts
const PORT = process.env.PORT || 3001;

server.listen(PORT, async () => {
  console.log(`🛡️  Monad Security Monitor running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'https://monad-security-monitor.lovable.app'}`);
  
  // Initialize threat monitoring
  await monitor.startMonitoring();
  
  console.log('🔍 Real-time threat detection is active');
  console.log('📊 WebSocket endpoint: ws://localhost:3001');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Monad Security Monitor...');
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});

export default app;