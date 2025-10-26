// Shared utilities for Vercel API routes
import { ethers } from 'ethers';

// Configuration
export const MONAD_RPC = 'https://monad-testnet.drpc.org';
export const CHAIN_ID = 10143;

// Initialize provider
export const provider = new ethers.JsonRpcProvider(MONAD_RPC);

// Known malicious contracts and addresses
export const KNOWN_MALICIOUS = [
  '0xee224caafbc78cc9a208bd22f8e7362b76eef4fa',
  '0x275b2f6aF83f99C40FDaBf5bc6b22E1B6C3F75B7'
];

// In-memory storage (in production, use a database)
export let threatAlerts: any[] = [];
export let stats = {
  total_threats: 0,
  total_scans: 0,
  active_monitoring: 0,
  known_malicious_contracts: KNOWN_MALICIOUS.length,
  last_updated: new Date().toISOString()
};

export const formatAddress = (address: string) => {
  if (!address) return '';
  return address.toLowerCase();
};

export const isValidAddress = (address: string) => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

// Check for EIP-7702 delegation
export const checkDelegation = async (address: string) => {
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
export const getBalance = async (address: string) => {
  try {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0.0';
  }
};

// Risk assessment
export const assessRisk = (address: string, delegation: any, threats: string[]) => {
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

// Update stats
export const updateStats = () => {
  stats.last_updated = new Date().toISOString();
};

// Add threat alert
export const addThreatAlert = (alert: any) => {
  threatAlerts.unshift(alert);
  threatAlerts = threatAlerts.slice(0, 100); // Keep last 100 alerts
  stats.total_threats++;
  updateStats();
};