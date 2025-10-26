export { WalletAnalyzer } from './analyzer.js';
export { DelegationCanceller } from './canceller.js';
export { SafetyChecker } from './safety.js';
export * from './types.js';

// Main functionality for programmatic use
import { ethers } from 'ethers';
import { WalletAnalyzer } from './analyzer.js';
import { DelegationCanceller } from './canceller.js';
import { SafetyChecker } from './safety.js';
import { WalletStatus, CancellationOptions, TransactionResult } from './types.js';

export class MonadWalletChecker {
  private provider: ethers.Provider;
  private analyzer: WalletAnalyzer;
  private canceller: DelegationCanceller;
  private safetyChecker: SafetyChecker;

  constructor(rpcUrl: string = 'https://testnet1.monad.xyz') {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.analyzer = new WalletAnalyzer(this.provider);
    this.canceller = new DelegationCanceller(this.provider);
    this.safetyChecker = new SafetyChecker(this.provider);
  }

  /**
   * Check if a wallet has active EIP-7702 delegation
   */
  async checkWallet(address: string): Promise<WalletStatus> {
    return await this.analyzer.checkWalletStatus(address);
  }

  /**
   * Cancel active delegation for a wallet
   */
  async cancelDelegation(
    privateKey: string,
    options: CancellationOptions = {}
  ): Promise<TransactionResult> {
    const wallet = new ethers.Wallet(privateKey, this.provider);
    return await this.canceller.cancelDelegation(wallet, options);
  }

  /**
   * Perform safety checks before cancellation
   */
  async runSafetyChecks(address: string) {
    return await this.safetyChecker.performSafetyChecks(address);
  }

  /**
   * Get provider instance for advanced usage
   */
  getProvider(): ethers.Provider {
    return this.provider;
  }
}

// Default export for convenience
export default MonadWalletChecker;