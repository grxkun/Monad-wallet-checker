import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Search, Activity, TrendingUp, RefreshCw } from 'lucide-react';

// API Configuration - Update this with your deployed backend URL
const API_BASE = import.meta.env.VITE_API_URL || 'https://monad-security-api.onrender.com';

interface ThreatAlert {
  id: string;
  address: string;
  threat_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  evidence?: any;
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

interface Stats {
  total_threats: number;
  total_scans: number;
  active_monitoring: number;
  known_malicious_contracts: number;
  last_updated: string;
}

const App: React.FC = () => {
  const [threats, setThreats] = useState<ThreatAlert[]>([]);
  const [stats, setStats] = useState<Stats>({ 
    total_threats: 0, 
    total_scans: 0, 
    active_monitoring: 0, 
    known_malicious_contracts: 2,
    last_updated: new Date().toISOString()
  });
  const [scanAddress, setScanAddress] = useState('');
  const [scanResult, setScanResult] = useState<WalletScan | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Try to connect to WebSocket for real-time alerts
    connectWebSocket();
    
    // Fetch initial data
    fetchThreats();
    fetchStats();

    // Set up periodic stats refresh
    const statsInterval = setInterval(fetchStats, 30000);

    return () => {
      clearInterval(statsInterval);
    };
  }, []);

  const connectWebSocket = () => {
    try {
      const wsUrl = API_BASE.replace('https://', 'wss://').replace('http://', 'ws://');
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setWsConnected(true);
        setErrorMessage('');
        console.log('Connected to threat monitoring');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'threat_alert') {
            setThreats(prev => [data.alert, ...prev.slice(0, 49)]);
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        console.log('Disconnected from threat monitoring');
        // Try to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setWsConnected(false);
    }
  };

  const fetchThreats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/threats`);
      if (response.ok) {
        const data = await response.json();
        setThreats(data.threats || []);
        setErrorMessage('');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to fetch threats:', error);
      setErrorMessage('Unable to connect to security monitoring service');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setErrorMessage('');
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const scanWallet = async () => {
    if (!scanAddress.trim()) return;
    
    setIsScanning(true);
    setErrorMessage('');
    
    try {
      const response = await fetch(`${API_BASE}/api/scan-wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: scanAddress.trim() })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setScanResult(data.scan);
        } else {
          setErrorMessage(data.error || 'Scan failed');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Scan failed:', error);
      setErrorMessage('Unable to scan wallet - service may be unavailable');
    } finally {
      setIsScanning(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      scanWallet();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      case 'safe': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const formatAddress = (address: string) => {
    if (address.length > 10) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address;
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Monad Security Monitor</h1>
                <p className="text-sm text-gray-600">Real-time EIP-7702 Attack Detection</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={fetchStats}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className={`h-3 w-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {wsConnected ? 'Live Monitoring' : 'Offline Mode'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{errorMessage}</p>
                <p className="text-xs text-yellow-600 mt-1">
                  Some features may be limited in offline mode
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Threats</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_threats}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Search className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Wallet Scans</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_scans}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Monitors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active_monitoring}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Known Threats</p>
                <p className="text-2xl font-bold text-gray-900">{stats.known_malicious_contracts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Scanner */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Wallet Security Scanner</h2>
          <p className="text-sm text-gray-600 mb-4">
            Check any Monad wallet for EIP-7702 delegations and security threats. No wallet connection required.
          </p>
          <div className="flex space-x-4">
            <input
              type="text"
              value={scanAddress}
              onChange={(e) => setScanAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter wallet address (0x...)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={scanWallet}
              disabled={isScanning || !scanAddress.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScanning ? 'Scanning...' : 'Scan Wallet'}
            </button>
          </div>

          {/* Quick Test Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setScanAddress('0x275b2f6aF83f99C40FDaBf5bc6b22E1B6C3F75B7')}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Test: Known Attacker Wallet
            </button>
            <button
              onClick={() => setScanAddress('0xee224caafbc78cc9a208bd22f8e7362b76eef4fa')}
              className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
            >
              Test: Malicious Contract
            </button>
          </div>

          {scanResult && (
            <div className={`mt-6 p-4 border-l-4 rounded ${getRiskColor(scanResult.risk_level)}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">Scan Results</h3>
                  <p className="text-sm text-gray-600 font-mono">{scanResult.address}</p>
                  <p className="text-sm text-gray-600">Balance: {scanResult.balance_mon} MON</p>
                  <p className="text-sm text-gray-600">
                    Risk Level: <span className={`font-semibold ${scanResult.risk_level === 'critical' ? 'text-red-600' : scanResult.risk_level === 'safe' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {scanResult.risk_level.toUpperCase()}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Last Scanned</p>
                  <p className="text-sm font-mono">{formatTime(scanResult.last_scanned)}</p>
                </div>
              </div>
              
              {scanResult.has_delegation && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm font-semibold text-yellow-800">⚠️ EIP-7702 Delegation Detected</p>
                  {scanResult.delegated_to && (
                    <p className="text-sm text-yellow-700 font-mono">
                      Delegated to: {formatAddress(scanResult.delegated_to)}
                    </p>
                  )}
                  <p className="text-xs text-yellow-600 mt-1">
                    This wallet has delegated its code execution to another contract. This could be dangerous if the delegated contract is malicious.
                  </p>
                </div>
              )}
              
              {scanResult.threats.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-semibold text-gray-900">Detected Threats:</p>
                  <ul className="mt-1 space-y-1">
                    {scanResult.threats.map((threat, index) => (
                      <li key={index} className="text-sm text-red-600">• {threat}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real-time Threats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Threat Alerts</h2>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">Last 24 hours</span>
            </div>
          </div>
          
          {threats.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">No recent threats detected.</p>
              <p className="text-sm text-gray-500 mt-1">
                {wsConnected ? 'Monitoring is active and protecting the community.' : 'Connect to see real-time alerts.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {threats.slice(0, 10).map((threat) => (
                <div key={threat.id} className="border-l-4 border-red-500 pl-4 py-2 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getSeverityColor(threat.severity)}`}>
                          {threat.severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">{threat.threat_type.replace('_', ' ')}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{threat.description}</p>
                      <p className="text-sm text-gray-600 font-mono">{formatAddress(threat.address)}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-gray-500">{formatTime(threat.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Warning Notice */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-blue-400" />
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-blue-800">Security Advisory</h3>
              <p className="text-sm text-blue-700 mt-1">
                This tool was created in response to sophisticated NFT verification scams that compromise wallets using EIP-7702 delegations. 
                Always verify the source of any transaction requests and never sign transactions from untrusted websites.
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Be cautious of fake NFT verification, airdrop claims, and similar phishing attempts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p className="font-semibold">Monad Security Monitor</p>
            <p className="mt-1">Community protection against EIP-7702 delegation attacks on Monad testnet</p>
            <p className="mt-2 text-xs">
              Built by the community, for the community. Report issues or contribute on GitHub.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;