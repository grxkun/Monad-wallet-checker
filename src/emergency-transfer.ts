import { ethers } from 'ethers';

/**
 * Emergency fund transfer utility
 * Transfer all available funds from compromised wallet to a safe new wallet
 */
export class EmergencyTransfer {
  private provider: ethers.Provider;

  constructor(provider: ethers.Provider) {
    this.provider = provider;
  }

  /**
   * Transfer all available funds to a new safe wallet
   */
  async transferToSafety(
    privateKey: string,
    destinationAddress: string,
    options: {
      gasLimit?: number;
      maxFeePerGas?: bigint;
      maxPriorityFeePerGas?: bigint;
      dryRun?: boolean;
      amount?: string; // Custom amount in ETH/MON (e.g., "2.0")
    } = {}
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
    amountTransferred?: string;
    gasUsed?: bigint;
  }> {
    try {
      const wallet = new ethers.Wallet(privateKey, this.provider);
      const balance = await this.provider.getBalance(wallet.address);
      
      if (balance === 0n) {
        return {
          success: false,
          error: 'No funds available to transfer'
        };
      }

      // Calculate gas costs
      const feeData = await this.provider.getFeeData();
      const gasLimit = BigInt(options.gasLimit || 21000);
      const maxFeePerGas = options.maxFeePerGas || feeData.maxFeePerGas || ethers.parseUnits('20', 'gwei');
      const maxPriorityFeePerGas = options.maxPriorityFeePerGas || feeData.maxPriorityFeePerGas || ethers.parseUnits('2', 'gwei');

      const maxGasCost = gasLimit * maxFeePerGas;
      
      if (balance <= maxGasCost) {
        return {
          success: false,
          error: `Insufficient balance for gas fees. Balance: ${ethers.formatEther(balance)} MON, Gas needed: ${ethers.formatEther(maxGasCost)} MON`
        };
      }

      // Calculate amount to transfer
      let transferAmount: bigint;
      
      if (options.amount) {
        // Custom amount specified
        transferAmount = ethers.parseEther(options.amount);
        
        // Check if we have enough balance (amount + gas)
        if (balance < transferAmount + maxGasCost) {
          return {
            success: false,
            error: `Insufficient balance. Need ${ethers.formatEther(transferAmount + maxGasCost)} MON (${options.amount} + gas), but only have ${ethers.formatEther(balance)} MON`
          };
        }
      } else {
        // Transfer all available (balance minus gas)
        transferAmount = balance - maxGasCost;
      }

      const tx = {
        to: destinationAddress,
        value: transferAmount,
        gasLimit,
        maxFeePerGas,
        maxPriorityFeePerGas
      };

      if (options.dryRun) {
        try {
          await this.provider.estimateGas(tx);
          return {
            success: true,
            transactionHash: 'DRY_RUN_SUCCESS',
            amountTransferred: ethers.formatEther(transferAmount)
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
        amountTransferred: ethers.formatEther(transferAmount),
        gasUsed: receipt.gasUsed
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Generate a new random wallet
   */
  generateNewWallet(): {
    address: string;
    privateKey: string;
    mnemonic: string;
  } {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase || 'N/A'
    };
  }

  /**
   * Estimate transfer cost
   */
  async estimateTransferCost(): Promise<{
    gasLimit: bigint;
    gasPrice: bigint;
    totalCost: bigint;
  }> {
    const feeData = await this.provider.getFeeData();
    const gasLimit = BigInt(21000);
    const gasPrice = feeData.maxFeePerGas || ethers.parseUnits('20', 'gwei');
    const totalCost = gasLimit * gasPrice;

    return {
      gasLimit,
      gasPrice,
      totalCost
    };
  }
}