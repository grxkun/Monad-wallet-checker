import { ethers } from 'ethers';
import { DelegationInfo, WalletStatus } from './types.js';

export class WalletAnalyzer {
  private provider: ethers.Provider;
  private readonly DELEGATION_PREFIX = '0xef0100';
  private readonly EMPTY_CODE_HASH = '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470';

  constructor(provider: ethers.Provider) {
    this.provider = provider;
  }

  /**
   * Check if a wallet has EIP-7702 delegation active
   */
  async checkWalletStatus(address: string): Promise<WalletStatus> {
    try {
      const [code, balance, nonce, chainId] = await Promise.all([
        this.provider.getCode(address),
        this.provider.getBalance(address),
        this.provider.getTransactionCount(address),
        this.provider.getNetwork().then((n: any) => Number(n.chainId))
      ]);

      const codeHash = ethers.keccak256(code);
      const delegation = this.analyzeDelegation(code, codeHash, balance, nonce);

      // Additional check: Look for recent transactions that might indicate delegation
      const additionalInfo = await this.checkForHiddenDelegation(address);
      if (additionalInfo.suspiciousBehavior) {
        delegation.riskFactors.push(...additionalInfo.riskFactors);
        if (delegation.riskLevel === 'LOW') {
          delegation.riskLevel = 'MEDIUM';
        }
      }

      return {
        address,
        chainId,
        delegation,
        lastChecked: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to check wallet status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze the delegation status and risk factors
   */
  private analyzeDelegation(code: string, codeHash: string, balance: bigint, nonce: number): DelegationInfo {
    const isDelegated = this.isDelegationIndicator(code);
    let delegatedTo: string | undefined;
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    const riskFactors: string[] = [];

    if (isDelegated) {
      // Extract the delegated address from code (skip 0xef0100 prefix)
      delegatedTo = '0x' + code.slice(8, 48);
      
      // Assess risk factors
      if (balance > ethers.parseEther('0.1')) {
        riskFactors.push('High balance at risk');
        riskLevel = 'HIGH';
      }
      
      if (balance > ethers.parseEther('1')) {
        riskFactors.push('Very high balance at risk');
        riskLevel = 'CRITICAL';
      }

      if (nonce > 100) {
        riskFactors.push('High transaction activity');
        riskLevel = riskLevel === 'LOW' ? 'MEDIUM' : riskLevel;
      }

      // Check if delegated to a suspicious address (all zeros, known bad contracts, etc.)
      if (delegatedTo === '0x0000000000000000000000000000000000000000') {
        riskFactors.push('Delegated to zero address (unusual)');
      }

      if (delegatedTo && this.isKnownRiskyContract(delegatedTo)) {
        riskFactors.push('Delegated to potentially risky contract');
        riskLevel = 'CRITICAL';
      }

      if (riskFactors.length === 0) {
        riskFactors.push('Delegation active');
        riskLevel = 'MEDIUM';
      }
    }

    return {
      isDelegated,
      delegatedTo,
      codeHash,
      nonce,
      balance: ethers.formatEther(balance),
      riskLevel,
      riskFactors
    };
  }

  /**
   * Check if the code is a delegation indicator
   */
  private isDelegationIndicator(code: string): boolean {
    // Standard EIP-7702 delegation
    if (code.startsWith(this.DELEGATION_PREFIX) && code.length === 46) {
      return true;
    }
    
    // Check for other possible delegation patterns
    // Some implementations might use different prefixes or formats
    if (code.startsWith('0xef01') && code.length >= 26) {
      return true;
    }
    
    // Check for any non-empty code that's not standard bytecode
    if (code !== '0x' && code.length < 100 && !code.startsWith('0x60') && !code.startsWith('0x30')) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if an address is known to be risky (extensible)
   */
  private isKnownRiskyContract(address: string): boolean {
    // Add known risky contract addresses here
    const riskyContracts: string[] = [
      // Add known malicious contracts
    ];
    
    return riskyContracts.includes(address.toLowerCase());
  }

  /**
   * Check for hidden or non-standard delegations
   */
  private async checkForHiddenDelegation(address: string): Promise<{
    suspiciousBehavior: boolean;
    riskFactors: string[];
  }> {
    const riskFactors: string[] = [];
    let suspiciousBehavior = false;

    try {
      // Check if the account has been making calls it shouldn't be able to as an EOA
      // This is a heuristic approach since we can't always detect all delegation types
      
      // For now, we'll check if the code exists but doesn't match our standard pattern
      const code = await this.provider.getCode(address);
      
      if (code !== '0x' && !this.isDelegationIndicator(code)) {
        // Account has code but not in expected delegation format
        riskFactors.push('Account has unexpected code that may indicate delegation');
        suspiciousBehavior = true;
      }

      // You could add more sophisticated checks here:
      // - Check recent transaction patterns
      // - Look for contract interactions that EOAs shouldn't be able to make
      // - Check for unusual internal transactions

    } catch (error) {
      // If we can't check, don't mark as suspicious
    }

    return {
      suspiciousBehavior,
      riskFactors
    };
  }

  /**
   * Get detailed information about the delegated contract
   */
  async getDelegatedContractInfo(address: string): Promise<{
    code: string;
    codeSize: number;
    isContract: boolean;
    balance: string;
  }> {
    try {
      const [code, balance] = await Promise.all([
        this.provider.getCode(address),
        this.provider.getBalance(address)
      ]);

      return {
        code,
        codeSize: (code.length - 2) / 2, // Remove 0x and divide by 2 for byte count
        isContract: code !== '0x',
        balance: ethers.formatEther(balance)
      };
    } catch (error) {
      throw new Error(`Failed to get delegated contract info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate if an address is a valid Ethereum address
   */
  static isValidAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  /**
   * Format balance for display
   */
  static formatBalance(balance: string | bigint): string {
    if (typeof balance === 'bigint') {
      return ethers.formatEther(balance);
    }
    return balance;
  }

  /**
   * Get the native token symbol for the network
   */
  static getNativeTokenSymbol(chainId: number): string {
    switch (chainId) {
      case 10143: // Monad testnet
        return 'MON';
      case 1: // Ethereum mainnet
        return 'ETH';
      default:
        return 'ETH'; // Default to ETH for unknown networks
    }
  }
}