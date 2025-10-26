import { ethers } from 'ethers';

/**
 * Attack Source Tracer
 * Analyzes wallet history to find the source of delegation attacks
 */
export class AttackTracer {
  private provider: ethers.Provider;

  constructor(provider: ethers.Provider) {
    this.provider = provider;
  }

  /**
   * Analyze recent transactions to find the source of the delegation
   */
  async traceAttackSource(walletAddress: string): Promise<{
    suspiciousTransactions: Array<{
      hash: string;
      blockNumber: number;
      from: string;
      to: string;
      value: string;
      data: string;
      timestamp?: Date;
      suspicionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      reasons: string[];
      possibleAttackVector: string;
    }>;
    nftInteractions: string[];
    contractInteractions: string[];
    signatureRequests: string[];
    analysis: string[];
  }> {
    try {
      const suspiciousTransactions: Array<{
        hash: string;
        blockNumber: number;
        from: string;
        to: string;
        value: string;
        data: string;
        timestamp?: Date;
        suspicionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        reasons: string[];
        possibleAttackVector: string;
      }> = [];
      const nftInteractions: string[] = [];
      const contractInteractions: string[] = [];
      const signatureRequests: string[] = [];
      const analysis: string[] = [];

      // Get recent transaction count
      const currentNonce = await this.provider.getTransactionCount(walletAddress);
      
      analysis.push(`Current nonce: ${currentNonce} transactions`);
      analysis.push('Analyzing recent transactions for attack patterns...');

      // Look for EIP-7702 delegation transactions (type 0x04)
      // Unfortunately, we can't easily get transaction history without an indexer
      // But we can analyze patterns in the current state

      // Check for suspicious patterns
      const code = await this.provider.getCode(walletAddress);
      if (code !== '0x' && code.startsWith('0xef01')) {
        analysis.push('✅ EIP-7702 delegation detected in wallet code');
        
        // Extract delegated address
        if (code.length >= 46) {
          const delegatedTo = '0x' + code.slice(8, 48);
          analysis.push(`Delegated to: ${delegatedTo}`);
          
          // Analyze the delegated contract
          const contractCode = await this.provider.getCode(delegatedTo);
          if (contractCode !== '0x') {
            analysis.push(`Delegation target is a contract (${(contractCode.length - 2) / 2} bytes)`);
            contractInteractions.push(delegatedTo);
            
            // Check for common attack patterns in the contract
            if (contractCode.includes('a9059cbb')) { // transfer(address,uint256)
              analysis.push('⚠️  Contract contains ERC-20 transfer functionality');
            }
            if (contractCode.includes('23b872dd')) { // transferFrom(address,address,uint256)
              analysis.push('⚠️  Contract can move ERC-20 tokens');
            }
            if (contractCode.includes('42842e0e')) { // safeTransferFrom NFT
              analysis.push('⚠️  Contract can move NFTs');
            }
            if (contractCode.includes('f2fde38b')) { // transferOwnership
              analysis.push('⚠️  Contract has ownership functionality');
            }
            if (contractCode.includes('ff')) { // SELFDESTRUCT
              analysis.push('🚨 Contract can self-destruct');
            }
          }
        }
      }

      // Common attack vectors to check for
      const commonAttackSignatures = [
        '0x095ea7b3', // approve(address,uint256) - dangerous approvals
        '0xa22cb465', // setApprovalForAll(address,bool) - NFT approvals
        '0x42842e0e', // safeTransferFrom - NFT transfers
        '0x23b872dd', // transferFrom - token transfers
        '0x40c10f19', // mint - potential fake mints
        '0x6a627842', // mint - alternative mint signature
        '0x1249c58b', // mint - another variant
      ];

      // Since we can't get full transaction history easily, provide guidance
      analysis.push('\n📋 To find the attack source, check for:');
      analysis.push('1. Recent NFT mints or transfers');
      analysis.push('2. Token approvals to unknown contracts');
      analysis.push('3. Interactions with DeFi protocols');
      analysis.push('4. Signature requests from websites');
      analysis.push('5. Airdrops or "free" NFTs');

      // Common attack vectors
      const attackVectors = [
        {
          vector: 'Malicious NFT Mint',
          description: 'Free NFT that requires delegation permission',
          signature: 'NFT minting with hidden delegation approval'
        },
        {
          vector: 'Fake DeFi Approval',
          description: 'Fake DEX or DeFi site requesting "connection"',
          signature: 'setApprovalForAll or delegation signature'
        },
        {
          vector: 'Phishing Signature',
          description: 'Legitimate-looking site requesting signature',
          signature: 'EIP-7702 authorization signature'
        },
        {
          vector: 'Airdrop Scam',
          description: 'Fake airdrop requiring "claim authorization"',
          signature: 'Delegation permission disguised as claim'
        }
      ];

      analysis.push('\n🎯 Common Attack Vectors:');
      attackVectors.forEach((attack, index) => {
        analysis.push(`${index + 1}. ${attack.vector}: ${attack.description}`);
      });

      return {
        suspiciousTransactions,
        nftInteractions,
        contractInteractions,
        signatureRequests,
        analysis
      };

    } catch (error) {
      throw new Error(`Failed to trace attack source: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check for common NFT contract interactions
   */
  async checkNFTInteractions(walletAddress: string): Promise<{
    potentialNFTContracts: string[];
    suspiciousPatterns: string[];
  }> {
    const potentialNFTContracts: string[] = [];
    const suspiciousPatterns: string[] = [];

    try {
      // This would require an indexing service to get full transaction history
      // For now, we'll provide guidance on what to look for
      
      suspiciousPatterns.push('Look for recent transactions to contracts ending in common patterns:');
      suspiciousPatterns.push('- Contracts with "mint" functions');
      suspiciousPatterns.push('- ERC-721 or ERC-1155 NFT contracts');
      suspiciousPatterns.push('- Contracts with suspicious names or unverified code');
      
    } catch (error) {
      suspiciousPatterns.push(`Error analyzing NFT interactions: ${error}`);
    }

    return {
      potentialNFTContracts,
      suspiciousPatterns
    };
  }

  /**
   * Generate investigation checklist
   */
  generateInvestigationChecklist(): string[] {
    return [
      '🔍 INVESTIGATION CHECKLIST:',
      '',
      '1. Check your browser history for:',
      '   • NFT minting sites visited recently',
      '   • DeFi protocols you interacted with',
      '   • New exchanges or DEXes',
      '   • Airdrop claim sites',
      '',
      '2. Look for recent MetaMask/wallet signatures:',
      '   • "Set approval for all" requests',
      '   • "Connect wallet" to new sites',
      '   • Any EIP-7702 authorization requests',
      '   • Unusual permission requests',
      '',
      '3. Check for recent NFT activities:',
      '   • Free NFT mints',
      '   • NFT airdrops',
      '   • "Claim" or "Reveal" transactions',
      '   • NFT marketplace interactions',
      '',
      '4. Review recent DeFi interactions:',
      '   • New liquidity pool additions',
      '   • Yield farming protocols',
      '   • Bridge transactions',
      '   • Swap aggregators',
      '',
      '5. Social engineering attempts:',
      '   • Discord/Telegram DMs about airdrops',
      '   • Twitter messages about free tokens',
      '   • Email phishing attempts',
      '   • Fake support contacts',
      '',
      '🎯 LIKELY SOURCES:',
      '• Malicious NFT minting sites',
      '• Fake DeFi protocols',
      '• Phishing versions of real sites',
      '• Compromised legitimate sites',
      '• Social engineering attacks'
    ];
  }

  /**
   * Find the specific EIP-7702 delegation transaction
   */
  async findDelegationTransaction(walletAddress: string): Promise<{
    delegationTx?: {
      hash: string;
      blockNumber: number;
      timestamp: Date;
      from: string;
      to: string;
      value: string;
      delegatedTo: string;
      gasUsed: string;
      gasPrice: string;
    };
    analysis: string[];
    investigationSteps: string[];
  }> {
    const analysis: string[] = [];
    const investigationSteps: string[] = [];

    try {
      analysis.push('🔍 Searching for EIP-7702 delegation transaction...');
      
      // Get current nonce to understand transaction range
      const currentNonce = await this.provider.getTransactionCount(walletAddress);
      analysis.push(`📊 Wallet has ${currentNonce} total transactions`);
      
      // Unfortunately, without an indexer, we can't easily get transaction history
      // But we can provide specific guidance on how to find it manually
      
      // Check if delegation is currently active
      const code = await this.provider.getCode(walletAddress);
      if (code !== '0x' && code.startsWith('0xef01')) {
        const delegatedTo = '0x' + code.slice(8, 48);
        analysis.push('✅ Active delegation found!');
        analysis.push(`🎯 Delegated to: ${delegatedTo}`);
        
        investigationSteps.push('🔍 MANUAL INVESTIGATION REQUIRED:');
        investigationSteps.push('');
        investigationSteps.push('1. Visit block explorer:');
        investigationSteps.push(`   https://testnet.monadexplorer.com/address/${walletAddress}`);
        investigationSteps.push('');
        investigationSteps.push('2. Look for transaction with these characteristics:');
        investigationSteps.push('   • Transaction Type: 0x04 (EIP-7702)');
        investigationSteps.push('   • Contains authorization list');
        investigationSteps.push(`   • Delegates to: ${delegatedTo}`);
        investigationSteps.push('   • Recent transaction (last few days)');
        investigationSteps.push('');
        investigationSteps.push('3. Signs this was the delegation transaction:');
        investigationSteps.push('   • Type field shows "0x04"');
        investigationSteps.push('   • Authorization field is present');
        investigationSteps.push('   • Transaction succeeded (status: 1)');
        investigationSteps.push('   • Low or zero value transfer');
        investigationSteps.push('');
        investigationSteps.push('4. What to look for in the transaction:');
        investigationSteps.push('   • Block timestamp (when it happened)');
        investigationSteps.push('   • Who initiated it (your address)');
        investigationSteps.push('   • What contract it delegated to');
        investigationSteps.push('   • Any associated website or service');
        investigationSteps.push('');
        investigationSteps.push('5. Cross-reference with your activity:');
        investigationSteps.push('   • Check browser history for that timestamp');
        investigationSteps.push('   • Look for MetaMask signature requests');
        investigationSteps.push('   • Remember what dApp you were using');
        investigationSteps.push('   • Check for NFT mints or DeFi interactions');
        
      } else {
        analysis.push('❌ No active delegation found');
        investigationSteps.push('No EIP-7702 delegation detected in current wallet state');
      }

      return {
        analysis,
        investigationSteps
      };

    } catch (error) {
      analysis.push(`❌ Error during investigation: ${error}`);
      return {
        analysis,
        investigationSteps: ['Investigation failed due to error']
      };
    }
  }

  /**
   * Check specific transaction for attack patterns
   */
  async analyzeSpecificTransaction(txHash: string): Promise<{
    isAttackTransaction: boolean;
    attackType: string;
    evidence: string[];
    recommendations: string[];
  }> {
    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!tx || !receipt) {
        return {
          isAttackTransaction: false,
          attackType: 'Unknown',
          evidence: ['Transaction not found'],
          recommendations: []
        };
      }

      const evidence = [];
      let attackType = 'Unknown';
      let isAttackTransaction = false;

      // Check transaction type
      if (tx.type === 4) { // EIP-7702
        evidence.push('🚨 EIP-7702 delegation transaction detected');
        attackType = 'Direct EIP-7702 Delegation';
        isAttackTransaction = true;
      }

      // Check for suspicious data patterns
      if (tx.data && tx.data !== '0x') {
        evidence.push(`Transaction contains data: ${tx.data.length} characters`);
        
        // Check for common malicious patterns
        if (tx.data.includes('a22cb465')) {
          evidence.push('⚠️  Contains setApprovalForAll signature');
          attackType = 'NFT Approval Attack';
          isAttackTransaction = true;
        }
        
        if (tx.data.includes('095ea7b3')) {
          evidence.push('⚠️  Contains token approval signature');
          attackType = 'Token Approval Attack';
          isAttackTransaction = true;
        }
      }

      // Check recipient
      if (tx.to) {
        const code = await this.provider.getCode(tx.to);
        if (code !== '0x') {
          evidence.push(`Interacted with contract: ${tx.to}`);
          if (code.includes('42842e0e') || code.includes('23b872dd')) {
            evidence.push('⚠️  Contract can transfer tokens/NFTs');
            isAttackTransaction = true;
          }
        }
      }

      const recommendations = [
        'Never interact with this contract again',
        'Check if you signed any permissions for this transaction',
        'Revoke any approvals given to related contracts',
        'Report this contract as malicious'
      ];

      return {
        isAttackTransaction,
        attackType,
        evidence,
        recommendations
      };

    } catch (error) {
      return {
        isAttackTransaction: false,
        attackType: 'Analysis Failed',
        evidence: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: []
      };
    }
  }
}