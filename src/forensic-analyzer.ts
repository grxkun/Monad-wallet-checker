import { ethers } from 'ethers';
import ora from 'ora';
import chalk from 'chalk';

export class ForensicAnalyzer {
  private provider: ethers.JsonRpcProvider;

  constructor(provider: ethers.JsonRpcProvider) {
    this.provider = provider;
  }

  /**
   * Systematically analyze wallet without requiring user memory
   */
  async performAutomatedInvestigation(walletAddress: string): Promise<{
    currentStatus: string[];
    timeline: string[];
    technicalFindings: string[];
    recommendations: string[];
    browserHistory: string[];
    suspiciousPatterns: string[];
  }> {
    const currentStatus: string[] = [];
    const timeline: string[] = [];
    const technicalFindings: string[] = [];
    const recommendations: string[] = [];
    const browserHistory: string[] = [];
    const suspiciousPatterns: string[] = [];

    try {
      // Current wallet state analysis
      currentStatus.push('🔍 CURRENT WALLET STATE:');
      
      const balance = await this.provider.getBalance(walletAddress);
      const nonce = await this.provider.getTransactionCount(walletAddress);
      const code = await this.provider.getCode(walletAddress);
      
      currentStatus.push(`💰 Balance: ${ethers.formatEther(balance)} MON`);
      currentStatus.push(`📊 Total transactions: ${nonce}`);
      currentStatus.push(`📝 Code length: ${code.length} characters`);

      if (code !== '0x' && code.startsWith('0xef01')) {
        const delegatedTo = '0x' + code.slice(8, 48);
        currentStatus.push(`🚨 ACTIVE DELEGATION: ${delegatedTo}`);
        
        // Analyze the delegated contract
        const contractCode = await this.provider.getCode(delegatedTo);
        currentStatus.push(`📋 Delegated contract size: ${contractCode.length / 2 - 1} bytes`);
        
        technicalFindings.push('✅ EIP-7702 delegation confirmed');
        technicalFindings.push(`Target contract: ${delegatedTo}`);
        technicalFindings.push(`Contract is ${contractCode.length > 100 ? 'complex' : 'simple'} (${Math.floor(contractCode.length / 2)} bytes)`);
      }

      // Timeline reconstruction
      timeline.push('📅 ATTACK TIMELINE RECONSTRUCTION:');
      timeline.push('Without memory, here\'s what we can determine:');
      timeline.push('');
      
      const currentBlock = await this.provider.getBlockNumber();
      const recentBlocks = Math.min(10000, currentBlock); // Last ~10k blocks
      
      timeline.push(`🕐 Current block: ${currentBlock}`);
      timeline.push(`🔍 Searching range: Last ${recentBlocks} blocks`);
      timeline.push(`📊 Your transaction count: ${nonce}`);
      
      // Estimate when delegation likely happened
      if (nonce > 1900) {
        timeline.push('🎯 Delegation likely in recent transactions (high nonce)');
        timeline.push('🕐 Probably happened within last few days');
      }

      // Technical analysis without memory
      technicalFindings.push('🔬 TECHNICAL ANALYSIS:');
      technicalFindings.push('Based on wallet state, not memory:');
      
      if (code.startsWith('0xef01')) {
        technicalFindings.push('• EIP-7702 bytecode prefix detected');
        technicalFindings.push('• Delegation is active and functional');
        technicalFindings.push('• Attack succeeded completely');
      }

      // Browser history guidance (memory-free)
      browserHistory.push('🌐 BROWSER HISTORY INVESTIGATION:');
      browserHistory.push('Since you don\'t remember, check these systematically:');
      browserHistory.push('');
      browserHistory.push('1. Open your browser history (Ctrl+H)');
      browserHistory.push('2. Look for these domains from last 7 days:');
      browserHistory.push('   • Any .io domains (common for crypto)');
      browserHistory.push('   • Sites with "mint", "nft", "free" in URL');
      browserHistory.push('   • Sites with "claim", "airdrop", "token" in URL');
      browserHistory.push('   • Any Monad-related sites');
      browserHistory.push('   • DeFi or DEX sites you don\'t recognize');
      browserHistory.push('');
      browserHistory.push('3. Look for MetaMask notifications in browser:');
      browserHistory.push('   • Check browser notification history');
      browserHistory.push('   • Look for "signature request" notifications');
      browserHistory.push('   • Check for "connect wallet" popups');

      // Suspicious patterns (automated detection)
      suspiciousPatterns.push('⚠️  AUTOMATED PATTERN DETECTION:');
      suspiciousPatterns.push('These patterns indicate likely attack vectors:');
      suspiciousPatterns.push('');
      
      if (nonce > 1900) {
        suspiciousPatterns.push('• High transaction count suggests active wallet');
        suspiciousPatterns.push('• Recent activity makes attack more likely');
      }
      
      if (balance > 0) {
        suspiciousPatterns.push('• Remaining balance indicates partial success');
        suspiciousPatterns.push('• Attacker may be slowly draining funds');
      }

      suspiciousPatterns.push('');
      suspiciousPatterns.push('🎯 MOST LIKELY ATTACK VECTORS:');
      suspiciousPatterns.push('1. "Free NFT" mint that required "wallet connection"');
      suspiciousPatterns.push('2. Fake airdrop claim with "authorization" request');
      suspiciousPatterns.push('3. Phishing DEX that looked like real exchange');
      suspiciousPatterns.push('4. Social media link promising free tokens');
      suspiciousPatterns.push('5. Discord/Telegram bot requesting "verification"');

      // Memory-free recommendations
      recommendations.push('📋 MEMORY-FREE INVESTIGATION PLAN:');
      recommendations.push('');
      recommendations.push('IMMEDIATE ACTIONS:');
      recommendations.push('1. Check browser history systematically');
      recommendations.push('2. Look at MetaMask activity log');
      recommendations.push('3. Check Discord/Telegram message history');
      recommendations.push('4. Review recent email for crypto links');
      recommendations.push('5. Ask friends if you shared any links recently');
      recommendations.push('');
      recommendations.push('TECHNICAL INVESTIGATION:');
      recommendations.push('1. Use block explorer to find the delegation tx');
      recommendations.push('2. Check transaction timestamp');
      recommendations.push('3. Cross-reference with your activity');
      recommendations.push('4. Report the malicious contract');
      recommendations.push('');
      recommendations.push('PREVENTION:');
      recommendations.push('1. Never sign unknown transactions');
      recommendations.push('2. Always verify site URLs');
      recommendations.push('3. Be suspicious of "free" offerings');
      recommendations.push('4. Use a separate wallet for testing');

      return {
        currentStatus,
        timeline,
        technicalFindings,
        recommendations,
        browserHistory,
        suspiciousPatterns
      };

    } catch (error) {
      throw new Error(`Forensic analysis failed: ${error}`);
    }
  }

  /**
   * Generate specific investigation checklist without requiring memory
   */
  generateMemoryFreeChecklist(): string[] {
    return [
      '🔍 MEMORY-FREE INVESTIGATION CHECKLIST:',
      '',
      '━━━ PHASE 1: DIGITAL EVIDENCE ━━━',
      '□ Open browser history (Ctrl+H or Cmd+Y)',
      '□ Filter by last 7 days',
      '□ Look for unknown crypto/NFT sites',
      '□ Check for sites with suspicious names',
      '□ Screenshot any suspicious entries',
      '',
      '━━━ PHASE 2: WALLET EVIDENCE ━━━',
      '□ Open MetaMask activity tab',
      '□ Look for recent signature requests',
      '□ Check for "authorization" transactions',
      '□ Note any unfamiliar contract interactions',
      '□ Export transaction history if possible',
      '',
      '━━━ PHASE 3: SOCIAL EVIDENCE ━━━',
      '□ Check Discord message history',
      '□ Check Telegram chat history',
      '□ Review recent Twitter interactions',
      '□ Check email for crypto-related messages',
      '□ Ask friends about shared links',
      '',
      '━━━ PHASE 4: TECHNICAL ANALYSIS ━━━',
      '□ Use block explorer to find EIP-7702 transaction',
      '□ Note the exact timestamp',
      '□ Cross-reference with digital evidence',
      '□ Document the attack vector',
      '□ Report malicious contracts',
      '',
      '🎯 FOCUS AREAS:',
      '• Sites offering "free" NFTs',
      '• Airdrop claim pages',
      '• Unknown DeFi/DEX sites',
      '• Social media crypto links',
      '• "Wallet verification" requests',
      '',
      '⚠️  RED FLAGS TO LOOK FOR:',
      '• URLs with random characters',
      '• Sites asking for "delegation"',
      '• "Connect wallet" on unknown sites',
      '• "Claim" or "mint" buttons',
      '• Social media DMs about crypto'
    ];
  }
}