-- Supabase database schema for Monad Security Monitor
-- Run this in your Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Threat alerts table
CREATE TABLE IF NOT EXISTS threat_alerts (
    id TEXT PRIMARY KEY,
    address TEXT NOT NULL,
    threat_type TEXT CHECK (threat_type IN ('delegation_attack', 'balance_drain', 'malicious_contract', 'suspicious_activity')) NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL,
    description TEXT NOT NULL,
    evidence JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet scans table
CREATE TABLE IF NOT EXISTS wallet_scans (
    address TEXT PRIMARY KEY,
    has_delegation BOOLEAN DEFAULT FALSE,
    delegated_to TEXT,
    balance_mon TEXT DEFAULT '0',
    risk_level TEXT CHECK (risk_level IN ('safe', 'low', 'medium', 'high', 'critical')) DEFAULT 'safe',
    threats TEXT[] DEFAULT '{}',
    last_scanned TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Malicious contracts registry
CREATE TABLE IF NOT EXISTS malicious_contracts (
    address TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    attack_type TEXT,
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    verified BOOLEAN DEFAULT FALSE,
    evidence JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attack signatures registry
CREATE TABLE IF NOT EXISTS attack_signatures (
    signature TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    attack_type TEXT,
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community reports table
CREATE TABLE IF NOT EXISTS community_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_address TEXT,
    reported_address TEXT NOT NULL,
    report_type TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence JSONB,
    status TEXT CHECK (status IN ('pending', 'verified', 'rejected', 'duplicate')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monitoring statistics table
CREATE TABLE IF NOT EXISTS monitoring_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE DEFAULT CURRENT_DATE,
    total_scans INTEGER DEFAULT 0,
    total_threats INTEGER DEFAULT 0,
    critical_threats INTEGER DEFAULT 0,
    wallets_at_risk INTEGER DEFAULT 0,
    new_malicious_contracts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_threat_alerts_address ON threat_alerts(address);
CREATE INDEX IF NOT EXISTS idx_threat_alerts_timestamp ON threat_alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_threat_alerts_severity ON threat_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_threat_alerts_resolved ON threat_alerts(resolved);

CREATE INDEX IF NOT EXISTS idx_wallet_scans_risk_level ON wallet_scans(risk_level);
CREATE INDEX IF NOT EXISTS idx_wallet_scans_has_delegation ON wallet_scans(has_delegation);
CREATE INDEX IF NOT EXISTS idx_wallet_scans_last_scanned ON wallet_scans(last_scanned DESC);

CREATE INDEX IF NOT EXISTS idx_community_reports_status ON community_reports(status);
CREATE INDEX IF NOT EXISTS idx_community_reports_created_at ON community_reports(created_at DESC);

-- Row Level Security (RLS) policies
ALTER TABLE threat_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE malicious_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attack_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_stats ENABLE ROW LEVEL SECURITY;

-- Public read access for threat intelligence
CREATE POLICY "Public read access for threat_alerts" ON threat_alerts FOR SELECT USING (true);
CREATE POLICY "Public read access for wallet_scans" ON wallet_scans FOR SELECT USING (true);
CREATE POLICY "Public read access for malicious_contracts" ON malicious_contracts FOR SELECT USING (true);
CREATE POLICY "Public read access for attack_signatures" ON attack_signatures FOR SELECT USING (true);
CREATE POLICY "Public read access for monitoring_stats" ON monitoring_stats FOR SELECT USING (true);

-- Allow inserts for community reporting (no authentication required)
CREATE POLICY "Public insert for threat_alerts" ON threat_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert for wallet_scans" ON wallet_scans FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert for community_reports" ON community_reports FOR INSERT WITH CHECK (true);

-- Allow updates for existing scans
CREATE POLICY "Public update for wallet_scans" ON wallet_scans FOR UPDATE USING (true);

-- Insert initial known malicious contracts
INSERT INTO malicious_contracts (address, name, description, attack_type, severity, verified, evidence) VALUES
('0xee224caafbc78cc9a208bd22f8e7362b76eef4fa', 'mac-chi.vercel.app Delegator', 'Malicious contract used in NFT verification scam via mac-chi.vercel.app', 'EIP-7702 Delegation', 'critical', true, '{"attack_site": "mac-chi.vercel.app", "method": "NFT verification scam", "first_victim": "0x1234..."}'),
('0x275b2f6af83f99c40fdabf5bc6b22e1b6c3f75b7', 'Attacker Wallet', 'Wallet controlled by attackers, contains stolen funds from delegation attacks', 'Fund Accumulation', 'critical', true, '{"stolen_amount": "4126 MON", "attack_method": "EIP-7702 delegation"}')
ON CONFLICT (address) DO NOTHING;

-- Insert initial known attack signatures
INSERT INTO attack_signatures (signature, name, description, attack_type, severity, verified) VALUES
('0x9e9bdb28', 'NFT Verification Scam', 'Signature used in fake NFT verification that triggers EIP-7702 delegation', 'EIP-7702 Authorization', 'critical', true),
('0x8129fc1c', 'Multicall Delegation', 'Multicall function used to batch EIP-7702 delegations', 'Batch Delegation', 'high', true)
ON CONFLICT (signature) DO NOTHING;

-- Functions for automated updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at timestamps
CREATE TRIGGER update_threat_alerts_updated_at BEFORE UPDATE ON threat_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallet_scans_updated_at BEFORE UPDATE ON wallet_scans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_reports_updated_at BEFORE UPDATE ON community_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for public statistics
CREATE OR REPLACE VIEW public_stats AS
SELECT 
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as threats_today,
    COUNT(*) FILTER (WHERE severity = 'critical') as critical_threats,
    COUNT(DISTINCT address) as unique_addresses_at_risk,
    MAX(created_at) as last_threat_detected
FROM threat_alerts;

-- Grant access to anon role for public API
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT ON threat_alerts, wallet_scans, community_reports TO anon;
GRANT UPDATE ON wallet_scans TO anon;
GRANT SELECT ON public_stats TO anon;