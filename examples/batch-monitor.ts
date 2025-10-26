/**
 * Example: Batch wallet monitoring
 * Monitor multiple wallets for delegation status
 */

import { MonadWalletChecker } from '../src/index.js';

async function monitorWallets() {
  const checker = new MonadWalletChecker();
  
  // List of wallets to monitor
  const walletsToCheck = [
    '0x1234567890123456789012345678901234567890',
    '0x0987654321098765432109876543210987654321',
    // Add more wallet addresses here
  ];
  
  console.log('🔍 Monitoring', walletsToCheck.length, 'wallets for delegations...\n');
  
  for (const address of walletsToCheck) {
    try {
      console.log('Checking:', address);
      
      const status = await checker.checkWallet(address);
      
      if (status.delegation.isDelegated) {
        console.log('🚨 DELEGATION FOUND!');
        console.log('  → Delegated to:', status.delegation.delegatedTo);
        console.log('  → Risk Level:', status.delegation.riskLevel);
        console.log('  → Balance at risk:', status.delegation.balance, 'ETH');
      } else {
        console.log('✅ Safe - no delegation');
      }
      
      console.log('---');
      
    } catch (error) {
      console.error('❌ Error checking', address, ':', error);
    }
  }
  
  console.log('✅ Monitoring complete');
}

monitorWallets().catch(console.error);