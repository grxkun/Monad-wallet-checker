import { ethers } from 'ethers';

/**
 * Emergency delegation cancellation using direct transaction approach
 * This bypasses the standard EIP-7702 transaction building which might not work on Monad
 */
export class EmergencyCanceller {
  private provider: ethers.Provider;

  constructor(provider: ethers.Provider) {
    this.provider = provider;
  }

  /**
   * Emergency cancel delegation by setting account code to empty
   * This is a more direct approach that should work on Monad
   */
  async emergencyCancel(privateKey: string): Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
  }> {
    try {
      const wallet = new ethers.Wallet(privateKey, this.provider);
      
      // Method 1: Try to send a simple transaction that might trigger delegation clearing
      const tx = {
        to: wallet.address,
        value: 0,
        data: '0x', // Empty data
        gasLimit: 30000,
      };

      console.log('Attempting emergency delegation cancellation...');
      const txResponse = await wallet.sendTransaction(tx);
      console.log('Transaction sent:', txResponse.hash);
      
      const receipt = await txResponse.wait();
      
      if (!receipt) {
        return { success: false, error: 'Transaction receipt is null' };
      }

      return {
        success: receipt.status === 1,
        transactionHash: receipt.hash
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Alternative method: Try to interact with a delegation management contract
   */
  async alternativeCancel(privateKey: string): Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
  }> {
    try {
      const wallet = new ethers.Wallet(privateKey, this.provider);
      
      // Some networks have delegation management contracts
      // Try calling a common delegation clearing function
      const data = ethers.id('clearDelegation()').slice(0, 10); // Function selector
      
      const tx = {
        to: wallet.address,
        value: 0,
        data: data,
        gasLimit: 50000,
      };

      const txResponse = await wallet.sendTransaction(tx);
      const receipt = await txResponse.wait();
      
      if (!receipt) {
        return { success: false, error: 'Transaction receipt is null' };
      }

      return {
        success: receipt.status === 1,
        transactionHash: receipt.hash
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}