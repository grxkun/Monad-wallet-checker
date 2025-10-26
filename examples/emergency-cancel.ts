/**
 * Example: Emergency delegation cancellation
 * Use this script when you need to quickly cancel a malicious delegation
 */

import { MonadWalletChecker } from '../src/index.js';

async function emergencyCancel() {
  // Initialize checker
  const checker = new MonadWalletChecker();
  
  // Your private key (KEEP THIS SECURE!)
  // In production, use environment variables or secure key management
  const PRIVATE_KEY = process.env.PRIVATE_KEY || 'your_private_key_here';
  
  if (PRIVATE_KEY === 'your_private_key_here') {
    console.error('❌ Please set your PRIVATE_KEY in environment variables or edit this script');
    process.exit(1);
  }
  
  try {
    // First, check current status
    console.log('🔍 Checking current delegation status...');
    
    // Get wallet address from private key
    const { ethers } = await import('ethers');
    const wallet = new ethers.Wallet(PRIVATE_KEY);
    const address = wallet.address;
    
    const status = await checker.checkWallet(address);
    
    console.log(`Wallet: ${address}`);
    console.log(`Balance: ${status.delegation.balance} ETH`);
    
    if (!status.delegation.isDelegated) {
      console.log('✅ No active delegation found. Nothing to cancel.');
      return;
    }
    
    console.log('\n⚠️  ACTIVE DELEGATION DETECTED!');
    console.log('Delegated to:', status.delegation.delegatedTo);
    console.log('Risk Level:', status.delegation.riskLevel);
    
    // Run safety checks
    console.log('\n🛡️  Running safety checks...');
    const safetyResult = await checker.runSafetyChecks(address);
    
    if (!safetyResult.safe) {
      console.log('⚠️  Safety warnings:');
      safetyResult.warnings.forEach(warning => {
        console.log(`   • ${warning}`);
      });
    }
    
    // Perform dry run first
    console.log('\n🧪 Performing dry run...');
    const dryRunResult = await checker.cancelDelegation(PRIVATE_KEY, {
      dryRun: true
    });
    
    if (!dryRunResult.success) {
      console.error('❌ Dry run failed:', dryRunResult.error);
      return;
    }
    
    console.log('✅ Dry run successful - proceeding with actual cancellation');
    
    // Actually cancel the delegation
    console.log('\n❌ Canceling delegation...');
    const result = await checker.cancelDelegation(PRIVATE_KEY, {
      gasLimit: 120000, // Add some buffer
      maxFeePerGas: BigInt('30000000000'), // 30 gwei
      maxPriorityFeePerGas: BigInt('2000000000') // 2 gwei
    });
    
    if (result.success) {
      console.log('✅ Delegation canceled successfully!');
      console.log('Transaction Hash:', result.transactionHash);
      console.log('Gas Used:', result.gasUsed?.toString());
      
      // Wait a bit and verify
      console.log('\n🔍 Verifying cancellation...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const verifyStatus = await checker.checkWallet(address);
      if (!verifyStatus.delegation.isDelegated) {
        console.log('✅ Verification successful - delegation has been cleared!');
      } else {
        console.log('⚠️  Verification pending - check again in a few blocks');
      }
      
    } else {
      console.error('❌ Cancellation failed:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Emergency cancellation failed:', error);
  }
}

// Run emergency cancellation
emergencyCancel().catch(console.error);