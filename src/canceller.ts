import { ethers } from 'ethers';
import { CancellationOptions, TransactionResult } from './types.js';

export class DelegationCanceller {
  private provider: ethers.Provider;
  private readonly SET_CODE_TX_TYPE = 0x04;
  private readonly MAGIC = 0x05;
  private readonly ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  constructor(provider: ethers.Provider) {
    this.provider = provider;
  }

  /**
   * Create and send a cancellation transaction for EIP-7702 delegation
   */
  async cancelDelegation(
    wallet: ethers.Wallet,
    options: CancellationOptions = {}
  ): Promise<TransactionResult> {
    try {
      const address = wallet.address;
      const nonce = await this.provider.getTransactionCount(address);
      const chainId = Number((await this.provider.getNetwork()).chainId);

      // Create authorization tuple for cancellation (delegate to zero address)
      const authTuple = await this.createAuthorizationTuple(
        wallet,
        chainId,
        nonce
      );

      // Build the EIP-7702 transaction
      const tx = await this.buildCancellationTransaction(
        wallet,
        authTuple,
        options
      );

      if (options.dryRun) {
        // Simulate the transaction
        try {
          await this.provider.call(tx);
          return {
            success: true,
            transactionHash: 'DRY_RUN_SUCCESS'
          };
        } catch (error) {
          return {
            success: false,
            error: `Dry run failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          };
        }
      }

      // Send the transaction
      const txResponse = await wallet.sendTransaction(tx);
      const receipt = await txResponse.wait();

      if (!receipt) {
        return {
          success: false,
          error: 'Transaction receipt is null'
        };
      }

      return {
        success: receipt.status === 1,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed,
        effectiveGasPrice: receipt.gasPrice
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create authorization tuple for delegation cancellation
   */
  private async createAuthorizationTuple(
    wallet: ethers.Wallet,
    chainId: number,
    nonce: number
  ): Promise<string[]> {
    // Create the message to sign according to EIP-7702
    const message = ethers.solidityPacked(
      ['uint8', 'bytes'],
      [this.MAGIC, ethers.AbiCoder.defaultAbiCoder().encode(
        ['uint256', 'address', 'uint64'],
        [chainId, this.ZERO_ADDRESS, nonce]
      )]
    );

    const messageHash = ethers.keccak256(message);
    const signature = await wallet.signMessage(ethers.getBytes(messageHash));
    const sig = ethers.Signature.from(signature);

    return [
      chainId.toString(),
      this.ZERO_ADDRESS,
      nonce.toString(),
      sig.yParity.toString(),
      sig.r,
      sig.s
    ];
  }

  /**
   * Build the EIP-7702 cancellation transaction
   */
  private async buildCancellationTransaction(
    wallet: ethers.Wallet,
    authTuple: string[],
    options: CancellationOptions
  ): Promise<ethers.TransactionRequest> {
    const nonce = await this.provider.getTransactionCount(wallet.address);
    const feeData = await this.provider.getFeeData();

    // Use provided gas settings or defaults
    const maxFeePerGas = options.maxFeePerGas || feeData.maxFeePerGas || ethers.parseUnits('20', 'gwei');
    const maxPriorityFeePerGas = options.maxPriorityFeePerGas || feeData.maxPriorityFeePerGas || ethers.parseUnits('2', 'gwei');
    const gasLimit = options.gasLimit || 100000;

    // Build transaction payload according to EIP-7702
    // For Monad, we might need to format this differently
    const authorizationList = [authTuple];
    
    return {
      type: this.SET_CODE_TX_TYPE,
      to: wallet.address, // Self-transaction for cancellation
      value: 0,
      data: '0x', // Empty data
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      // Use custom data approach for now
      customData: {
        authorizationList
      }
    };
  }

  /**
   * Estimate gas for cancellation transaction
   */
  async estimateGas(wallet: ethers.Wallet): Promise<bigint> {
    try {
      const nonce = await this.provider.getTransactionCount(wallet.address);
      const chainId = Number((await this.provider.getNetwork()).chainId);
      
      const authTuple = await this.createAuthorizationTuple(wallet, chainId, nonce);
      const tx = await this.buildCancellationTransaction(wallet, authTuple, {});
      
      return await this.provider.estimateGas(tx);
    } catch (error) {
      // Return a reasonable default if estimation fails
      console.warn('Gas estimation failed, using default:', error);
      return BigInt(100000);
    }
  }

  /**
   * Check if cancellation is possible for the given wallet
   */
  async canCancel(address: string): Promise<{
    canCancel: boolean;
    reason?: string;
    requiredBalance?: bigint;
  }> {
    try {
      const code = await this.provider.getCode(address);
      const balance = await this.provider.getBalance(address);
      const feeData = await this.provider.getFeeData();

      // Check if delegation exists
      if (!this.isDelegationIndicator(code)) {
        return {
          canCancel: false,
          reason: 'No active delegation found'
        };
      }

      // Estimate required gas cost
      const estimatedGas = BigInt(100000); // Conservative estimate
      const maxFeePerGas = feeData.maxFeePerGas || ethers.parseUnits('20', 'gwei');
      const requiredBalance = estimatedGas * maxFeePerGas;

      if (balance < requiredBalance) {
        return {
          canCancel: false,
          reason: 'Insufficient balance for gas fees',
          requiredBalance
        };
      }

      return {
        canCancel: true
      };

    } catch (error) {
      return {
        canCancel: false,
        reason: `Error checking cancellation eligibility: ${error instanceof Error ? error.message : 'Unknown error'}`
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
   * Verify that cancellation was successful
   */
  async verifyCancellation(address: string): Promise<{
    success: boolean;
    isCleared: boolean;
    currentCode: string;
  }> {
    try {
      const code = await this.provider.getCode(address);
      const isCleared = code === '0x';
      
      return {
        success: true,
        isCleared,
        currentCode: code
      };
    } catch (error) {
      return {
        success: false,
        isCleared: false,
        currentCode: 'ERROR'
      };
    }
  }
}