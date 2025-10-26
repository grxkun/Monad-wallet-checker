import { ethers } from 'ethers';
import ora from 'ora';
import chalk from 'chalk';

export class SignatureScanner {
  private provider: ethers.JsonRpcProvider;

  constructor(provider: ethers.JsonRpcProvider) {
    this.provider = provider;
  }

  /**
   * Generate specific search filters for block explorer
   */
  generateSearchFilters(walletAddress: string): string[] {
    return [
      '🔍 BLOCK EXPLORER SEARCH FILTERS:',
      '',
      '1. PRIMARY FILTER - Transaction Type:',
      '   • Look for Type: "0x04" or "4"',
      '   • This is the EIP-7702 identifier',
      '   • Very few transactions will have this type',
      '',
      '2. SECONDARY FILTER - Status:',
      '   • Status: "Success" or "1"',
      '   • Ignore all failed transactions',
      '',
      '3. TERTIARY FILTER - Recent Date:',
      '   • Last 7-14 days only',
      '   • Focus on October 2025',
      '',
      '4. GAS USAGE PATTERN:',
      '   • Gas Used: < 100,000',
      '   • Much lower than failed attempts',
      '',
      '5. VALUE PATTERN:',
      '   • Value: 0 MON or very small',
      '   • Not 1.0 or 5.0 MON like failed attempts',
      '',
      '🎯 EXACT SEARCH CRITERIA:',
      `   Address: ${walletAddress}`,
      '   Type: 0x04',
      '   Status: Success',
      '   Method: Authorization (if shown)',
      '   Contains: authorizationList',
      `   Delegates to: 0xee224caafbc78cc9a208bd22f8e7362b76eef4fa`,
      '',
      '💡 SEARCH TIP:',
      'If the explorer has a search/filter box, try:',
      '• "type:0x04"',
      '• "method:authorization"',
      '• "status:success"',
      '',
      '🚨 WHAT YOU\'RE LOOKING FOR:',
      'A transaction that:',
      '• Has type 0x04 (very rare)',
      '• Succeeded (not failed)',
      '• You don\'t remember making',
      '• Has low gas usage',
      '• Recent timestamp',
      '• Contains delegation authorization'
    ];
  }

  /**
   * Generate manual inspection checklist
   */
  generateManualChecklist(): string[] {
    return [
      '📋 MANUAL INSPECTION CHECKLIST:',
      '',
      'For each SUCCESSFUL transaction in recent history:',
      '',
      '□ Check if Type = 0x04',
      '□ Check if Status = Success',
      '□ Check if Gas < 100,000',
      '□ Check if Value ≤ 0.1 MON',
      '□ Check if you remember making it',
      '□ Check if Method contains "auth" or "delegate"',
      '□ Look for "authorizationList" in details',
      '□ Check timestamp against your activity',
      '',
      '🎯 SYSTEMATIC APPROACH:',
      '1. Start with most recent transactions',
      '2. Skip all FAILED transactions',
      '3. Focus only on SUCCESS transactions',
      '4. Look for Type 0x04 specifically',
      '5. Cross-reference timestamp with memory',
      '',
      '⚠️  COMMON MISTAKES:',
      '• Don\'t get distracted by failed transactions',
      '• Don\'t focus on high-value transfers',
      '• Don\'t ignore low-gas transactions',
      '• Don\'t skip transactions you "think" are normal',
      '',
      '🔍 VERIFICATION STEPS:',
      'When you find a Type 0x04 transaction:',
      '1. Note the exact timestamp',
      '2. Check transaction details for authorizationList',
      '3. Verify it delegates to 0xee224caafbc78cc9a208bd22f8e7362b76eef4fa',
      '4. Cross-reference timestamp with your browser history',
      '5. That\'s your penetration moment!'
    ];
  }

  /**
   * Provide focused guidance based on common patterns
   */
  generateFocusedGuidance(): string[] {
    return [
      '🎯 FOCUSED SEARCH GUIDANCE:',
      '',
      '❌ IGNORE THESE PATTERNS:',
      '• Failed transactions (you\'ve found several)',
      '• High gas usage (> 200,000)',
      '• High values (1.0, 5.0 MON)',
      '• Obviously failed DeFi interactions',
      '',
      '✅ FOCUS ON THESE PATTERNS:',
      '• Type: 0x04 (this is the smoking gun)',
      '• Status: Success',
      '• Low gas usage',
      '• Recent timestamp',
      '• Transactions you don\'t remember',
      '',
      '🔍 SEARCH STRATEGY:',
      '1. Use block explorer filters if available',
      '2. Sort by transaction type if possible',
      '3. Look for the rare "0x04" type',
      '4. Check only successful transactions',
      '5. Ignore everything else for now',
      '',
      '💡 KEY INSIGHT:',
      'EIP-7702 transactions are RARE. In your 1964 transactions,',
      'there might only be 1-2 with type 0x04. Find those first.',
      '',
      '🚨 BREAKTHROUGH MOMENT:',
      'When you see "Type: 0x04" + "Status: Success",',
      'you\'ve found the penetration signature!',
      '',
      '📊 EXPECTED CHARACTERISTICS:',
      'The real penetration transaction will be:',
      '• Boring looking (low value, low gas)',
      '• Recent (last few days)',
      '• Successful (not failed)',
      '• Type 0x04 (the key identifier)',
      '• Something you forgot about'
    ];
  }

  /**
   * Create a summary guide for efficient searching
   */
  generateEfficiencyGuide(): string[] {
    return [
      '⚡ EFFICIENCY SEARCH GUIDE:',
      '',
      '🎯 SINGLE MOST IMPORTANT FILTER:',
      '   Type: 0x04',
      '',
      'This alone will eliminate 99%+ of transactions.',
      'EIP-7702 is rare. Type 0x04 is the unique identifier.',
      '',
      '🔍 SEARCH WORKFLOW:',
      '1. Open block explorer',
      '2. Find filter/search option',
      '3. Filter by Type: "0x04" or "4"',
      '4. If no filter, manually scan Type column',
      '5. Look for "0x04" in Type field',
      '6. Ignore everything else temporarily',
      '',
      '📊 WHAT TO EXPECT:',
      '• Very few results (maybe 1-3 transactions)',
      '• One will be the penetration signature',
      '• Others might be legitimate EIP-7702 uses',
      '',
      '🚨 IMMEDIATE ACTION:',
      'Stop looking at failed transactions.',
      'Focus 100% on finding Type: 0x04 transactions.',
      'That\'s your penetration signature.',
      '',
      '💡 SUCCESS INDICATOR:',
      'When you find Type 0x04 + Success status +',
      'delegates to 0xee224caafbc78cc9a208bd22f8e7362b76eef4fa,',
      'you\'ve found the exact moment of compromise!'
    ];
  }
}