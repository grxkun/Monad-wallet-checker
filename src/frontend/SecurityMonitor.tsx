import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Search, Activity, Users, TrendingUp } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'https://monad-security-api.lovable.app';

interface ThreatAlert {
  id: string;
  address: string;
  threat_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
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
}

const SecurityMonitor: React.FC = () => {
  const [threats, setThreats] = useState<ThreatAlert[]>([]);
  const [stats, setStats] = useState<Stats>({ total_threats: 0, total_scans: 0, active_monitoring: 0, known_malicious_contracts: 0 });
  const [scanAddress, setScanAddress] = useState('');
  const [scanResult, setScanResult] = useState<WalletScan | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    // Connect to WebSocket for real-time alerts
    const wsUrl = API_BASE.replace('https://', 'wss://').replace('http://', 'ws://');
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setWsConnected(true);
      console.log('Connected to threat monitoring');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'threat_alert') {
        setThreats(prev => [data.alert, ...prev.slice(0, 49)]);
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
      console.log('Disconnected from threat monitoring');
    };

    // Fetch initial data
    fetchThreats();
    fetchStats();

    const statsInterval = setInterval(fetchStats, 30000);

    return () => {
      ws.close();
      clearInterval(statsInterval);
    };
  }, []);

  const fetchThreats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/threats`);
      const data = await response.json();
      setThreats(data.threats || []);
    } catch (error) {
      console.error('Failed to fetch threats:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const scanWallet = async () => {
    if (!scanAddress.trim()) return;
    
    setIsScanning(true);
    try {
      const response = await fetch(`${API_BASE}/api/scan-wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: scanAddress.trim() })
      });
      
      const data = await response.json();
      if (data.success) {
        setScanResult(data.scan);
      }
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Monad Security Monitor</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {wsConnected ? 'Monitoring Active' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="flex space-x-4">
            <input
              type="text"
              value={scanAddress}
              onChange={(e) => setScanAddress(e.target.value)}
              placeholder="Enter wallet address (0x...)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={scanWallet}
              disabled={isScanning || !scanAddress.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isScanning ? 'Scanning...' : 'Scan Wallet'}
            </button>
          </div>

          {scanResult && (
            <div className={`mt-4 p-4 border-l-4 rounded ${getRiskColor(scanResult.risk_level)}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">Scan Results</h3>
                  <p className="text-sm text-gray-600 font-mono">{scanResult.address}</p>
                  <p className="text-sm text-gray-600">Balance: {scanResult.balance_mon} MON</p>
                  <p className="text-sm text-gray-600">Risk Level: <span className="font-semibold">{scanResult.risk_level.toUpperCase()}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Last Scanned</p>
                  <p className="text-sm font-mono">{new Date(scanResult.last_scanned).toLocaleString()}</p>
                </div>
              </div>
              
              {scanResult.has_delegation && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm font-semibold text-yellow-800">⚠️ EIP-7702 Delegation Detected</p>
                  {scanResult.delegated_to && (
                    <p className="text-sm text-yellow-700 font-mono">Delegated to: {scanResult.delegated_to}</p>
                  )}
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
          <h2 className="text-xl font-bold text-gray-900 mb-4">Real-time Threat Alerts</h2>
          {threats.length === 0 ? (
            <p className="text-gray-600">No threats detected recently. Monitoring is active.</p>
          ) : (
            <div className="space-y-4">
              {threats.slice(0, 10).map((threat) => (
                <div key={threat.id} className="border-l-4 border-red-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getSeverityColor(threat.severity)}`}>
                        {threat.severity.toUpperCase()}
                      </span>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{threat.description}</p>
                      <p className="text-sm text-gray-600 font-mono">{threat.address}</p>
                    </div>
                    <p className="text-xs text-gray-500">{new Date(threat.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>Monad Security Monitor - Community Protection Against EIP-7702 Delegation Attacks</p>
            <p className="mt-2">Protecting the Monad community through real-time threat detection and intelligence sharing</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SecurityMonitor;