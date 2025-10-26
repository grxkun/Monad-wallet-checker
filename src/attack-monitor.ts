import { ethers } from 'ethers';
import ora from 'ora';
import chalk from 'chalk';

export class AttackMonitor {
  private provider: ethers.JsonRpcProvider;
  private monitoringInterval: number = 30000; // 30 seconds
  private isMonitoring: boolean = false;

  constructor(provider: ethers.JsonRpcProvider) {
    this.provider = provider;
  }

  /**
   * Real-time monitoring for EIP-7702 delegation attacks
   */
  async startRealTimeMonitoring(walletAddresses: string[]): Promise<void> {
    console.log(chalk.blue('\n🚨 ATTACK MONITOR ACTIVATED'));
    console.log('═'.repeat(50));
    console.log(chalk.yellow('Real-time EIP-7702 delegation attack detection'));
    console.log(`👁️  Monitoring ${walletAddresses.length} wallet(s)`);
    console.log(`⏱️  Check interval: ${this.monitoringInterval / 1000} seconds`);
    console.log(chalk.gray('Press Ctrl+C to stop monitoring\n'));

    this.isMonitoring = true;
    let lastBlockChecked = await this.provider.getBlockNumber();

    while (this.isMonitoring) {
      try {
        const currentBlock = await this.provider.getBlockNumber();
        
        // Check if there are new blocks
        if (currentBlock > lastBlockChecked) {
          console.log(chalk.gray(`🔍 Scanning blocks ${lastBlockChecked + 1} to ${currentBlock}...`));
          
          // Check each wallet for changes
          for (const address of walletAddresses) {
            const alerts = await this.checkWalletForAttacks(address);
            
            if (alerts.length > 0) {
              this.displayAlerts(address, alerts);
            }
          }
          
          lastBlockChecked = currentBlock;
        }

        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, this.monitoringInterval));
        
      } catch (error) {
        console.error(chalk.red(`❌ Monitoring error: ${error}`));
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s on error
      }
    }
  }

  /**
   * Check wallet for new delegation attacks
   */
  async checkWalletForAttacks(walletAddress: string): Promise<Array<{
    type: 'delegation_detected' | 'suspicious_transaction' | 'balance_drain' | 'contract_interaction';
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    message: string;
    action: string;
    timestamp: Date;
    evidence?: string[];
  }>> {
    const alerts = [];

    try {
      // Check for EIP-7702 delegation
      const code = await this.provider.getCode(walletAddress);
      if (code !== '0x' && code.startsWith('0xef01')) {
        const delegatedTo = '0x' + code.slice(8, 48);
        
        // Check if this is a known malicious contract
        if (this.isKnownMaliciousContract(delegatedTo)) {
          alerts.push({
            type: 'delegation_detected',
            severity: 'CRITICAL',
            message: '🚨 CRITICAL: EIP-7702 delegation to KNOWN MALICIOUS CONTRACT detected!',
            action: 'IMMEDIATE ACTION REQUIRED: Cancel delegation and transfer funds to safety',
            timestamp: new Date(),
            evidence: [
              `Wallet delegated to: ${delegatedTo}`,
              'This contract is known to steal funds',
              'Your wallet is compromised',
              'Transfers may be blocked by the malicious contract'
            ]
          });
        } else {
          alerts.push({
            type: 'delegation_detected',
            severity: 'HIGH',
            message: '⚠️  EIP-7702 delegation detected',
            action: 'Verify if this delegation is legitimate',
            timestamp: new Date(),
            evidence: [
              `Wallet delegated to: ${delegatedTo}`,
              'Check if you authorized this delegation',
              'Monitor for suspicious activity'
            ]
          });
        }
      }

      // Check balance for significant drops
      const balance = await this.provider.getBalance(walletAddress);
      const balanceETH = parseFloat(ethers.formatEther(balance));
      
      if (balanceETH < 1.0 && balanceETH > 0) {
        alerts.push({
          type: 'balance_drain',
          severity: 'HIGH',
          message: '💸 LOW BALANCE WARNING: Potential fund drainage detected',
          action: 'Check recent transactions for unauthorized transfers',
          timestamp: new Date(),
          evidence: [
            `Current balance: ${balanceETH} MON`,
            'Balance is unusually low',
            'May indicate fund theft'
          ]
        });
      }

      return alerts;

    } catch (error) {
      return [{
        type: 'contract_interaction' as const,
        severity: 'MEDIUM' as const,
        message: `⚠️  Error checking wallet: ${error}`,
        action: 'Manual verification recommended',
        timestamp: new Date()
      }];
    }
  }

  /**
   * Display alerts to user
   */
  private displayAlerts(walletAddress: string, alerts: Array<{
    type: string;
    severity: string;
    message: string;
    action: string;
    timestamp: Date;
    evidence?: string[];
  }>): void {
    console.log('\n');
    console.log('🚨'.repeat(20));
    console.log(chalk.red.bold('   SECURITY ALERT DETECTED   '));
    console.log('🚨'.repeat(20));
    
    console.log(chalk.blue(`\n📍 Wallet: ${walletAddress}`));
    console.log(chalk.gray(`⏰ Time: ${new Date().toLocaleString()}\n`));

    alerts.forEach((alert, index) => {
      const severityColor = {
        'CRITICAL': chalk.red.bold,
        'HIGH': chalk.red,
        'MEDIUM': chalk.yellow,
        'LOW': chalk.blue
      }[alert.severity] || chalk.white;

      console.log(`${index + 1}. ${severityColor(`[${alert.severity}]`)} ${alert.message}`);
      console.log(chalk.cyan(`   👉 ${alert.action}`));
      
      if (alert.evidence && alert.evidence.length > 0) {
        console.log(chalk.gray('   📋 Evidence:'));
        alert.evidence.forEach(evidence => {
          console.log(chalk.gray(`      • ${evidence}`));
        });
      }
      console.log('');
    });

    // Provide quick action commands
    console.log(chalk.green('🔧 QUICK ACTIONS:'));
    console.log('   • Check delegation: node dist/cli.js check --address <wallet>');
    console.log('   • Cancel delegation: node dist/cli.js cancel --address <wallet>');
    console.log('   • Emergency transfer: node dist/cli.js transfer --address <wallet>');
    console.log('   • Full investigation: node dist/cli.js simulate-attack --address <wallet>');
    
    console.log('\n' + '═'.repeat(60) + '\n');
  }

  /**
   * Check if contract is known to be malicious
   */
  private isKnownMaliciousContract(contractAddress: string): boolean {
    const knownMaliciousContracts = [
      '0xee224caafbc78cc9a208bd22f8e7362b76eef4fa', // From our investigation
      // Add more known malicious contracts here
    ];

    return knownMaliciousContracts.includes(contractAddress.toLowerCase());
  }

  /**
   * One-time check for immediate threats
   */
  async performImmediateThreatAssessment(walletAddress: string): Promise<{
    threatLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    threats: Array<{
      type: string;
      description: string;
      recommendation: string;
    }>;
    safetyScore: number; // 0-100
  }> {
    const threats = [];
    let threatLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'SAFE';
    let safetyScore = 100;

    try {
      // Check for active delegation
      const code = await this.provider.getCode(walletAddress);
      if (code !== '0x' && code.startsWith('0xef01')) {
        const delegatedTo = '0x' + code.slice(8, 48);
        
        if (this.isKnownMaliciousContract(delegatedTo)) {
          threats.push({
            type: 'CRITICAL_DELEGATION',
            description: `Wallet is delegated to known malicious contract: ${delegatedTo}`,
            recommendation: 'IMMEDIATE: Cancel delegation and transfer funds to new wallet'
          });
          threatLevel = 'CRITICAL';
          safetyScore = 0;
        } else {
          threats.push({
            type: 'UNKNOWN_DELEGATION',
            description: `Wallet is delegated to unknown contract: ${delegatedTo}`,
            recommendation: 'Verify delegation legitimacy and monitor for suspicious activity'
          });
          threatLevel = 'HIGH';
          safetyScore = 25;
        }
      }

      // Check balance
      const balance = await this.provider.getBalance(walletAddress);
      const balanceETH = parseFloat(ethers.formatEther(balance));
      
      if (balanceETH === 0) {
        threats.push({
          type: 'ZERO_BALANCE',
          description: 'Wallet has zero balance - may have been drained',
          recommendation: 'Investigate recent transactions for unauthorized transfers'
        });
        if (threatLevel === 'SAFE') threatLevel = 'MEDIUM';
        safetyScore = Math.min(safetyScore, 50);
      } else if (balanceETH < 1.0) {
        threats.push({
          type: 'LOW_BALANCE',
          description: `Unusually low balance: ${balanceETH} MON`,
          recommendation: 'Check for recent large outgoing transactions'
        });
        if (threatLevel === 'SAFE') threatLevel = 'LOW';
        safetyScore = Math.min(safetyScore, 75);
      }

      // Check transaction count for suspicious activity
      const nonce = await this.provider.getTransactionCount(walletAddress);
      if (nonce > 1000) {
        threats.push({
          type: 'HIGH_ACTIVITY',
          description: `High transaction count (${nonce}) - review for suspicious activity`,
          recommendation: 'Check recent transactions for unauthorized activity'
        });
        if (threatLevel === 'SAFE') threatLevel = 'LOW';
        safetyScore = Math.min(safetyScore, 85);
      }

      return {
        threatLevel,
        threats,
        safetyScore
      };

    } catch (error) {
      return {
        threatLevel: 'MEDIUM',
        threats: [{
          type: 'ASSESSMENT_ERROR',
          description: `Unable to assess wallet security: ${error}`,
          recommendation: 'Manual verification required'
        }],
        safetyScore: 50
      };
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log(chalk.yellow('\n🛑 Monitoring stopped'));
  }

  /**
   * Generate user safety recommendations
   */
  generateSafetyRecommendations(): string[] {
    return [
      '🛡️  WALLET SAFETY RECOMMENDATIONS:',
      '',
      '🔍 REGULAR MONITORING:',
      '• Check your wallet daily for unexpected delegations',
      '• Monitor balance for unexplained decreases',
      '• Review transaction history weekly',
      '',
      '⚠️  WARNING SIGNS:',
      '• Transactions you didn\'t authorize',
      '• MetaMask requests you don\'t understand',
      '• Websites asking for "delegation" or "authorization"',
      '• Sudden balance decreases',
      '• Failed transfer attempts',
      '',
      '🚨 IMMEDIATE ACTIONS IF COMPROMISED:',
      '• Stop using the compromised wallet immediately',
      '• Try to cancel any active delegations',
      '• Transfer remaining funds to a new wallet',
      '• Report the attack to the community',
      '',
      '🔐 PREVENTION:',
      '• Never sign transactions you don\'t understand',
      '• Be suspicious of "free" NFT or token offers',
      '• Verify website URLs before connecting wallet',
      '• Use separate wallets for testing and main funds',
      '• Keep only small amounts in active wallets',
      '',
      '🛠️  TOOLS:',
      '• Use this monitoring tool regularly',
      '• Set up balance alerts',
      '• Monitor delegation status',
      '• Keep emergency procedures ready'
    ];
  }
}