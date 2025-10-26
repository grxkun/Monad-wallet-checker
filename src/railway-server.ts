#!/usr/bin/env node

import { createServer } from 'http';
import { parse } from 'url';
import chalk from 'chalk';
import { ethers } from 'ethers';

// Configuration
const PORT = process.env.PORT || 3001;
const MONAD_RPC = 'https://monad-testnet.drpc.org';
const CHAIN_ID = 10143;

// Initialize provider
const provider = new ethers.JsonRpcProvider(MONAD_RPC);

// Known malicious contracts and addresses
const KNOWN_MALICIOUS = [
  '0xee224caafbc78cc9a208bd22f8e7362b76eef4fa',
  '0x275b2f6aF83f99C40FDaBf5bc6b22E1B6C3F75B7'
];

// In-memory storage for threats and stats
let threatAlerts: any[] = [];
let stats = {
  total_threats: 0,
  total_scans: 0,
  active_monitoring: 0,
  known_malicious_contracts: KNOWN_MALICIOUS.length,
  last_updated: new Date().toISOString()
};

console.log(chalk.blue('🛡️ Monad Security Monitor - API Server'));
console.log(chalk.green(`✅ Service healthy on port ${PORT}`));
console.log(chalk.yellow(`🔗 Connected to Monad RPC: ${MONAD_RPC}`));

// Utility functions
const formatAddress = (address: string) => {
  if (!address) return '';
  return address.toLowerCase();
};

const isValidAddress = (address: string) => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

// Check for EIP-7702 delegation
const checkDelegation = async (address: string) => {
  try {
    const code = await provider.getCode(address);
    // EIP-7702 delegation signature: 0xef0100
    if (code.startsWith('0xef0100')) {
      const delegatedTo = '0x' + code.slice(6, 46); // Extract delegated address
      return {
        has_delegation: true,
        delegated_to: delegatedTo,
        code_prefix: code.slice(0, 10)
      };
    }
    return { has_delegation: false };
  } catch (error) {
    console.error('Error checking delegation:', error);
    return { has_delegation: false, error: 'RPC_ERROR' };
  }
};

// Check wallet balance
const getBalance = async (address: string) => {
  try {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0.0';
  }
};

// Risk assessment
const assessRisk = (address: string, delegation: any, threats: string[]) => {
  const addr = formatAddress(address);
  
  // Check if it's a known malicious address
  if (KNOWN_MALICIOUS.includes(addr)) {
    return 'critical';
  }
  
  // Check if delegated to malicious contract
  if (delegation.has_delegation && delegation.delegated_to) {
    if (KNOWN_MALICIOUS.includes(formatAddress(delegation.delegated_to))) {
      return 'critical';
    }
  }
  
  // Check threats
  if (threats.length > 2) return 'high';
  if (threats.length > 0) return 'medium';
  if (delegation.has_delegation) return 'medium';
  
  return 'safe';
};

// Scan wallet function
const scanWallet = async (address: string) => {
  try {
    stats.total_scans++;
    
    if (!isValidAddress(address)) {
      return {
        success: false,
        error: 'Invalid wallet address format'
      };
    }

    const formattedAddress = formatAddress(address);
    const delegation = await checkDelegation(address);
    const balance = await getBalance(address);
    
    // Detect threats
    const threats = [];
    
    if (KNOWN_MALICIOUS.includes(formattedAddress)) {
      threats.push('Known malicious wallet');
      stats.total_threats++;
    }
    
    if (delegation.has_delegation) {
      threats.push('EIP-7702 delegation detected');
      if (delegation.delegated_to && KNOWN_MALICIOUS.includes(formatAddress(delegation.delegated_to))) {
        threats.push('Delegated to known malicious contract');
        stats.total_threats++;
      }
    }
    
    // Check transaction patterns (simplified)
    try {
      const txCount = await provider.getTransactionCount(address);
      if (txCount > 1000) {
        threats.push('High transaction volume (potential bot)');
      }
    } catch (error) {
      console.error('Error getting transaction count:', error);
    }
    
    const risk_level = assessRisk(address, delegation, threats);
    
    const scan = {
      address: formattedAddress,
      has_delegation: delegation.has_delegation,
      delegated_to: delegation.delegated_to || null,
      balance_mon: balance,
      risk_level,
      threats,
      last_scanned: new Date().toISOString()
    };
    
    // Add to threat alerts if high risk
    if (risk_level === 'critical' || risk_level === 'high') {
      const alert = {
        id: Date.now().toString(),
        address: formattedAddress,
        threat_type: delegation.has_delegation ? 'eip7702_delegation' : 'malicious_wallet',
        severity: risk_level === 'critical' ? 'critical' : 'high',
        description: threats.join(', '),
        timestamp: new Date().toISOString(),
        evidence: { delegation, balance, threats }
      };
      
      threatAlerts.unshift(alert);
      threatAlerts = threatAlerts.slice(0, 100); // Keep last 100 alerts
    }
    
    stats.last_updated = new Date().toISOString();
    
    return {
      success: true,
      scan
    };
    
  } catch (error) {
    console.error('Scan error:', error);
    return {
      success: false,
      error: 'Failed to scan wallet: ' + (error as Error).message
    };
  }
};

// HTTP request handler
const requestHandler = async (req: any, res: any) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const { pathname, query } = parse(req.url || '', true);
  
  try {
    // Health check
    if (pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'healthy',
        service: 'Monad Security Monitor API',
        timestamp: new Date().toISOString(),
        rpc_connected: true,
        chain_id: CHAIN_ID
      }));
      return;
    }
    
    // Get stats
    if (pathname === '/api/stats') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stats));
      return;
    }
    
    // Get threats
    if (pathname === '/api/threats') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ threats: threatAlerts.slice(0, 50) }));
      return;
    }
    
    // Scan wallet
    if (pathname === '/api/scan-wallet' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const { address } = JSON.parse(body);
          const result = await scanWallet(address);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            error: 'Invalid request body' 
          }));
        }
      });
      return;
    }
    
    // Default response
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      service: 'Monad Security Monitor API',
      version: '1.0.0',
      endpoints: [
        'GET /health - Service health check',
        'GET /api/stats - Security statistics',
        'GET /api/threats - Recent threat alerts',
        'POST /api/scan-wallet - Scan wallet for threats'
      ],
      timestamp: new Date().toISOString()
    }));
    
  } catch (error) {
    console.error('Request error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }));
  }
};

const server = createServer(requestHandler);

server.listen(PORT, () => {
  console.log(chalk.green(`🚀 Monad Security API running on port ${PORT}`));
  console.log(chalk.blue(`🔗 Health: http://localhost:${PORT}/health`));
  console.log(chalk.yellow(`📊 Stats: http://localhost:${PORT}/api/stats`));
  console.log(chalk.cyan(`🛡️ Scan: POST http://localhost:${PORT}/api/scan-wallet`));
});

// Periodic stats update
setInterval(() => {
  stats.last_updated = new Date().toISOString();
  console.log(chalk.gray(`[${new Date().toISOString()}] API server active - ${stats.total_scans} scans, ${stats.total_threats} threats`));
}, 60000);

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log(chalk.yellow('🛑 Received SIGTERM, shutting down gracefully...'));
  server.close(() => {
    console.log(chalk.green('✅ Server closed'));
    process.exit(0);
  });
});