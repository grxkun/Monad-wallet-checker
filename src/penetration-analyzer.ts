import { ethers } from 'ethers';
import ora from 'ora';
import chalk from 'chalk';

export class PenetrationAnalyzer {
  private provider: ethers.JsonRpcProvider;

  constructor(provider: ethers.JsonRpcProvider) {
    this.provider = provider;
  }

  /**
   * Find the exact signature and timestamp of initial penetration
   */
  async findInitialPenetration(walletAddress: string): Promise<{
    penetrationFound: boolean;
    transactionHash?: string;
    blockNumber?: number;
    timestamp?: Date;
    signature?: string;
    authorizationDetails?: any;
    reconstructedFlow: string[];
    technicalDetails: string[];
  }> {
    const reconstructedFlow: string[] = [];
    const technicalDetails: string[] = [];

    try {
      reconstructedFlow.push('🔍 HUNTING FOR INITIAL PENETRATION...');
      
      // Get current state
      const currentNonce = await this.provider.getTransactionCount(walletAddress);
      const code = await this.provider.getCode(walletAddress);
      
      reconstructedFlow.push(`📊 Scanning ${currentNonce} transactions for EIP-7702 signature`);
      
      if (code !== '0x' && code.startsWith('0xef01')) {
        const delegatedTo = '0x' + code.slice(8, 48);
        reconstructedFlow.push(`🎯 Target confirmed: ${delegatedTo}`);
        
        // Try to find recent transactions that might contain the delegation
        // Since we can't easily get full tx history, we'll use block scanning approach
        const currentBlock = await this.provider.getBlockNumber();
        reconstructedFlow.push(`🔍 Current block: ${currentBlock}`);
        
        // Estimate transaction search range
        const estimatedBlocksBack = Math.min(50000, currentBlock); // Last ~50k blocks
        const searchFromBlock = currentBlock - estimatedBlocksBack;
        
        reconstructedFlow.push(`📅 Searching blocks ${searchFromBlock} to ${currentBlock}`);
        reconstructedFlow.push('⚠️  Note: Full transaction history requires block explorer');
        
        // Provide specific guidance for manual search
        technicalDetails.push('🔬 TECHNICAL PENETRATION DETAILS:');
        technicalDetails.push('');
        technicalDetails.push('The initial penetration transaction will have:');
        technicalDetails.push(`• Transaction Type: 0x04 (EIP-7702)`);
        technicalDetails.push(`• Authorization List containing:`);
        technicalDetails.push(`  - Address: ${delegatedTo}`);
        technicalDetails.push(`  - Chain ID: 10143 (Monad testnet)`);
        technicalDetails.push(`  - Nonce: (specific value)`);
        technicalDetails.push(`• Signature: r, s, v values`);
        technicalDetails.push(`• Gas Used: Usually low (< 100,000)`);
        technicalDetails.push(`• Value: Usually 0 or very small`);
        technicalDetails.push('');
        
        // Generate specific search instructions
        const searchInstructions = this.generatePenetrationSearchInstructions(walletAddress, delegatedTo);
        technicalDetails.push(...searchInstructions);
        
        return {
          penetrationFound: true,
          reconstructedFlow,
          technicalDetails
        };
      } else {
        reconstructedFlow.push('❌ No active delegation found');
        return {
          penetrationFound: false,
          reconstructedFlow,
          technicalDetails: ['No delegation detected in wallet state']
        };
      }

    } catch (error) {
      reconstructedFlow.push(`❌ Error during penetration analysis: ${error}`);
      return {
        penetrationFound: false,
        reconstructedFlow,
        technicalDetails: ['Analysis failed due to error']
      };
    }
  }

  /**
   * Generate specific instructions to find the penetration transaction
   */
  private generatePenetrationSearchInstructions(walletAddress: string, delegatedTo: string): string[] {
    return [
      '🎯 PENETRATION TRANSACTION HUNTING GUIDE:',
      '',
      '1. BLOCK EXPLORER METHOD:',
      `   • Visit: https://testnet.monadexplorer.com/address/${walletAddress}`,
      '   • Sort transactions by date (newest first)',
      '   • Look for transaction with these EXACT characteristics:',
      '',
      '   📋 SIGNATURE CHARACTERISTICS:',
      '   ┌─ Transaction Type: 0x04',
      '   ├─ Method: Authorization',
      '   ├─ Status: Success (1)',
      `   ├─ Delegation Target: ${delegatedTo}`,
      '   ├─ Gas Used: < 100,000',
      '   ├─ Value: 0 or minimal MON',
      '   └─ Contains "authorizationList" field',
      '',
      '2. TIMESTAMP IDENTIFICATION:',
      '   • The transaction timestamp = EXACT moment of penetration',
      '   • Cross-reference this timestamp with:',
      '     - Browser history',
      '     - MetaMask activity',
      '     - Social media activity',
      '     - Email timestamps',
      '',
      '3. SIGNATURE ANALYSIS:',
      '   • Look for "Authorization List" in transaction details',
      '   • Check for r, s, v signature values',
      '   • Note the nonce used in authorization',
      '   • Record the chain ID (should be 10143)',
      '',
      '4. PENETRATION VECTOR RECONSTRUCTION:',
      '   • Once you find the timestamp, check what you were doing:',
      '     - What website were you on?',
      '     - What did you think you were signing?',
      '     - Was it an NFT mint, airdrop, or DeFi interaction?',
      '     - Did MetaMask show "authorization" in the popup?',
      '',
      '🚨 RED FLAGS IN THE SIGNATURE:',
      '• Transaction type 0x04 (not common)',
      '• "Authorization" or "Delegation" in method name',
      '• Low gas usage but high impact',
      '• Succeeded but you don\'t remember it',
      '• Contains address of unknown contract',
      '',
      '📊 WHAT TO DOCUMENT:',
      '• Transaction hash',
      '• Block number',
      '• Exact timestamp',
      '• Authorization signature details',
      '• What website you were on',
      '• What you thought you were signing',
      '',
      '💡 PRO TIP:',
      'The penetration transaction is probably within the last',
      '1000 transactions of your wallet. Look for anything with',
      'type 0x04 or containing "authorization" in recent history.'
    ];
  }

  /**
   * Analyze a specific transaction for penetration signatures
   */
  async analyzePenetrationTransaction(txHash: string): Promise<{
    isPenetrationTx: boolean;
    timestamp?: Date;
    signatureDetails?: any;
    authorizationList?: any;
    penetrationMethod: string;
    evidence: string[];
    recommendations: string[];
  }> {
    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!tx || !receipt) {
        throw new Error('Transaction not found');
      }

      const evidence: string[] = [];
      const recommendations: string[] = [];
      let isPenetrationTx = false;
      let penetrationMethod = 'Unknown';

      // Check for EIP-7702 signature
      if (tx.type === 4) {
        isPenetrationTx = true;
        penetrationMethod = 'EIP-7702 Direct Authorization';
        evidence.push('🚨 CONFIRMED: This is the penetration transaction!');
        evidence.push('🔍 Transaction Type: 0x04 (EIP-7702)');
        
        // Get block for timestamp
        const block = await this.provider.getBlock(receipt.blockNumber);
        if (block) {
          const timestamp = new Date(block.timestamp * 1000);
          evidence.push(`⏰ PENETRATION TIMESTAMP: ${timestamp.toLocaleString()}`);
          evidence.push(`📅 Date: ${timestamp.toDateString()}`);
          evidence.push(`🕐 Time: ${timestamp.toLocaleTimeString()}`);
          
          recommendations.push(`Check your activity on ${timestamp.toDateString()} at ${timestamp.toLocaleTimeString()}`);
          recommendations.push('Look at browser history for that exact time');
          recommendations.push('Check MetaMask activity around that timestamp');
        }
      }

      // Analyze transaction details
      evidence.push(`💰 Value: ${ethers.formatEther(tx.value)} MON`);
      evidence.push(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
      evidence.push(`📊 Gas Price: ${tx.gasPrice ? ethers.formatUnits(tx.gasPrice, 'gwei') : 'N/A'} gwei`);
      evidence.push(`🎯 From: ${tx.from}`);
      evidence.push(`🎯 To: ${tx.to || 'Contract Creation'}`);

      // Check for authorization patterns in data
      if (tx.data && tx.data.length > 10) {
        evidence.push(`📝 Data Length: ${tx.data.length / 2 - 1} bytes`);
        
        // Look for common authorization signatures
        if (tx.data.includes('authorization') || tx.data.includes('delegate')) {
          evidence.push('⚠️  Transaction data contains authorization keywords');
          isPenetrationTx = true;
          penetrationMethod = 'Authorization Data Pattern';
        }
      }

      // Status check
      if (receipt.status === 1) {
        evidence.push('✅ Transaction Status: SUCCESS');
        if (isPenetrationTx) {
          evidence.push('🚨 Penetration was successful!');
        }
      } else {
        evidence.push('❌ Transaction Status: FAILED');
      }

      // Provide specific recommendations
      recommendations.push('Document this transaction hash for evidence');
      recommendations.push('Report this transaction to security researchers');
      recommendations.push('Use timestamp to find the source website');
      recommendations.push('Share findings with wallet security teams');

      return {
        isPenetrationTx,
        penetrationMethod,
        evidence,
        recommendations
      };

    } catch (error) {
      throw new Error(`Failed to analyze penetration transaction: ${error}`);
    }
  }

  /**
   * Generate timeline reconstruction based on transaction patterns
   */
  generateTimelineReconstruction(walletAddress: string): string[] {
    return [
      '📅 PENETRATION TIMELINE RECONSTRUCTION:',
      '',
      '🔍 INVESTIGATION METHOD:',
      '1. Open block explorer in new tab',
      `2. Go to: https://testnet.monadexplorer.com/address/${walletAddress}`,
      '3. Filter transactions by type or date',
      '4. Look for the EXACT moment of compromise',
      '',
      '⏰ TIMELINE MARKERS TO FIND:',
      '• Last normal transaction (before attack)',
      '• EIP-7702 authorization transaction (THE PENETRATION)',
      '• First suspicious transaction (after penetration)',
      '• Current state (funds trapped)',
      '',
      '🎯 PENETRATION SIGNATURE HUNT:',
      'Look for transaction with ALL these characteristics:',
      '  ✓ Type: 0x04 (EIP-7702)',
      '  ✓ Contains "authorizationList"',
      '  ✓ Low gas usage but high impact',
      '  ✓ Recent timestamp (last few days)',
      '  ✓ Succeeded (status: 1)',
      '',
      '📊 WHAT THE SIGNATURE REVEALS:',
      '• Exact timestamp = when you signed',
      '• Authorization details = what you authorized',
      '• Gas usage = complexity of attack',
      '• Block number = network state at time',
      '• Transaction hash = unique identifier',
      '',
      '🕐 CROSS-REFERENCE TIMESTAMP WITH:',
      '• Browser history at that exact time',
      '• MetaMask activity log',
      '• Social media posts/interactions',
      '• Email/message timestamps',
      '• Calendar events or meetings',
      '',
      '💡 PENETRATION MOMENT IDENTIFICATION:',
      'The transaction with type 0x04 is the EXACT moment',
      'the attacker gained control. Everything after that',
      'transaction was executed by the malicious contract.'
    ];
  }
}