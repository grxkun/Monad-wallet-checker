// Wallet scanner endpoint for Vercel
import { 
  isValidAddress, 
  formatAddress, 
  checkDelegation, 
  getBalance, 
  assessRisk,
  KNOWN_MALICIOUS,
  provider,
  stats,
  addThreatAlert,
  updateStats
} from '../../lib/security-utils';

export default async function handler(req: any, res: any) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ 
        success: false, 
        error: 'Address is required' 
      });
    }

    stats.total_scans++;
    
    if (!isValidAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format'
      });
    }

    const formattedAddress = formatAddress(address);
    const delegation = await checkDelegation(address);
    const balance = await getBalance(address);
    
    // Detect threats
    const threats = [];
    
    if (KNOWN_MALICIOUS.includes(formattedAddress)) {
      threats.push('Known malicious wallet');
    }
    
    if (delegation.has_delegation) {
      threats.push('EIP-7702 delegation detected');
      if (delegation.delegated_to && KNOWN_MALICIOUS.includes(formatAddress(delegation.delegated_to))) {
        threats.push('Delegated to known malicious contract');
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
      
      addThreatAlert(alert);
    }
    
    updateStats();
    
    return res.status(200).json({
      success: true,
      scan
    });
    
  } catch (error) {
    console.error('Scan error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to scan wallet: ' + (error as Error).message
    });
  }
}