import { ethers } from 'ethers';

export interface SafetyResult {
  safe: boolean;
  warnings: string[];
  suggestions: string[];
}

export class SafetyChecker {
  private provider: ethers.Provider;

  constructor(provider: ethers.Provider) {
    this.provider = provider;
  }

  /**
   * Perform comprehensive safety checks before cancellation
   */
  async performSafetyChecks(address: string): Promise<SafetyResult> {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    try {
      // Check balance
      const balance = await this.provider.getBalance(address);
      if (balance < ethers.parseEther('0.001')) {
        warnings.push('Very low balance - may not have enough native tokens for gas fees');
        suggestions.push('Add more native tokens to cover transaction costs');
      }

      // Check code
      const code = await this.provider.getCode(address);
      if (!this.isDelegationIndicator(code)) {
        warnings.push('No delegation detected - nothing to cancel');
      }

      // Check network
      const network = await this.provider.getNetwork();
      if (network.chainId !== 1n) { // Assuming Monad testnet chain ID
        suggestions.push('Verify you are connected to the correct network');
      }

      // Check recent transaction activity
      const nonce = await this.provider.getTransactionCount(address);
      if (nonce > 1000) {
        warnings.push('High transaction activity detected - verify this is your wallet');
      }

      // Gas price check
      const feeData = await this.provider.getFeeData();
      if (feeData.maxFeePerGas && feeData.maxFeePerGas > ethers.parseUnits('100', 'gwei')) {
        warnings.push('High gas prices detected - consider waiting for lower fees');
      }

      return {
        safe: warnings.length === 0,
        warnings,
        suggestions
      };

    } catch (error) {
      return {
        safe: false,
        warnings: [`Safety check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        suggestions: ['Retry the operation or check your connection']
      };
    }
  }

  /**
   * Check if the code is a delegation indicator
   */
  private isDelegationIndicator(code: string): boolean {
    return code.startsWith('0xef0100') && code.length === 46;
  }

  /**
   * Validate transaction parameters
   */
  validateTransactionParams(params: {
    gasLimit?: number;
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
  }): SafetyResult {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check gas limit
    if (params.gasLimit && params.gasLimit < 21000) {
      warnings.push('Gas limit too low - transaction will likely fail');
    }
    if (params.gasLimit && params.gasLimit > 1000000) {
      warnings.push('Gas limit very high - may waste ETH');
    }

    // Check fee parameters
    if (params.maxFeePerGas && params.maxFeePerGas > ethers.parseUnits('1000', 'gwei')) {
      warnings.push('Max fee per gas extremely high');
      suggestions.push('Consider using a lower fee to save costs');
    }

    if (params.maxPriorityFeePerGas && params.maxFeePerGas) {
      if (params.maxPriorityFeePerGas > params.maxFeePerGas) {
        warnings.push('Priority fee higher than max fee - invalid configuration');
      }
    }

    return {
      safe: warnings.length === 0,
      warnings,
      suggestions
    };
  }
}