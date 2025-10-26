/**
 * Example: Basic wallet check
 * This example shows how to check if a wallet has active EIP-7702 delegation
 */

import { MonadWalletChecker } from '../src/index.js';

async function basicCheck() {
  // Initialize with Monad testnet RPC
  const checker = new MonadWalletChecker();
  
  // Replace with the wallet address you want to check
  const walletAddress = '0x1234567890123456789012345678901234567890';
  
  try {
    console.log('Checking wallet:', walletAddress);
    
    // Check wallet status
    const status = await checker.checkWallet(walletAddress);
    
    console.log('\n=== Wallet Status ===');
    console.log('Address:', status.address);
    console.log('Balance:', status.delegation.balance, 'ETH');
    console.log('Is Delegated:', status.delegation.isDelegated);
    
    if (status.delegation.isDelegated) {
      console.log('\n⚠️  DELEGATION DETECTED!');
      console.log('Delegated to:', status.delegation.delegatedTo);
      console.log('Risk Level:', status.delegation.riskLevel);
      console.log('Risk Factors:');
      status.delegation.riskFactors.forEach(factor => {
        console.log('  -', factor);
      });
    } else {
      console.log('\n✅ No delegation found - wallet is safe');
    }
    
  } catch (error) {
    console.error('Error checking wallet:', error);
  }
}

// Run the example
basicCheck().catch(console.error);