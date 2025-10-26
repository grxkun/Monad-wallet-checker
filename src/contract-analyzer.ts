import { ethers } from 'ethers';

/**
 * Contract analyzer to investigate the delegation contract
 */
export class ContractAnalyzer {
  private provider: ethers.Provider;

  constructor(provider: ethers.Provider) {
    this.provider = provider;
  }

  /**
   * Analyze the delegation contract to understand its functions
   */
  async analyzeContract(contractAddress: string): Promise<{
    code: string;
    codeSize: number;
    isContract: boolean;
    balance: string;
    functions: string[];
    possibleCancelMethods: string[];
    analysis: string[];
  }> {
    try {
      const [code, balance] = await Promise.all([
        this.provider.getCode(contractAddress),
        this.provider.getBalance(contractAddress)
      ]);

      const isContract = code !== '0x';
      const codeSize = (code.length - 2) / 2;
      
      // Extract function selectors from bytecode
      const functions = this.extractFunctionSelectors(code);
      
      // Look for common cancellation method signatures
      const possibleCancelMethods = this.identifyPossibleCancelMethods(functions);
      
      // Provide analysis
      const analysis = this.performAnalysis(code, functions);

      return {
        code,
        codeSize,
        isContract,
        balance: ethers.formatEther(balance),
        functions,
        possibleCancelMethods,
        analysis
      };

    } catch (error) {
      throw new Error(`Failed to analyze contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract function selectors from contract bytecode
   */
  private extractFunctionSelectors(code: string): string[] {
    const selectors: string[] = [];
    
    // Common function signatures that might be relevant
    const commonFunctions = [
      'clearDelegation()',
      'revoke()',
      'cancel()',
      'disable()',
      'reset()',
      'withdraw()',
      'selfdestruct()',
      'emergencyStop()',
      'pause()',
      'unpause()',
      'setCode(address)',
      'execute(bytes)',
      'multicall(bytes[])',
      'delegateToImplementation(bytes)',
      'upgradeTo(address)',
      'transferOwnership(address)',
      'renounceOwnership()',
    ];

    // Calculate selectors for common functions
    for (const func of commonFunctions) {
      const selector = ethers.id(func).slice(0, 10);
      if (code.includes(selector.slice(2))) {
        selectors.push(`${selector} (${func})`);
      }
    }

    return selectors;
  }

  /**
   * Identify possible cancellation methods
   */
  private identifyPossibleCancelMethods(functions: string[]): string[] {
    const cancelKeywords = ['clear', 'revoke', 'cancel', 'disable', 'reset', 'stop'];
    
    return functions.filter(func => 
      cancelKeywords.some(keyword => 
        func.toLowerCase().includes(keyword)
      )
    );
  }

  /**
   * Perform bytecode analysis
   */
  private performAnalysis(code: string, functions: string[]): string[] {
    const analysis: string[] = [];

    if (code === '0x') {
      analysis.push('ERROR: Not a contract - no bytecode found');
      return analysis;
    }

    analysis.push(`Contract size: ${(code.length - 2) / 2} bytes`);

    // Check for proxy patterns
    if (code.includes('363d3d373d3d3d363d73')) {
      analysis.push('⚠️  Minimal proxy pattern detected');
    }

    // Check for common patterns
    if (code.includes('7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc')) {
      analysis.push('⚠️  EIP-1967 proxy implementation slot detected');
    }

    // Check for selfdestruct
    if (code.includes('ff')) {
      analysis.push('⚠️  SELFDESTRUCT opcode found - contract can be destroyed');
    }

    // Check for delegatecall
    if (code.includes('f4')) {
      analysis.push('⚠️  DELEGATECALL opcode found - can execute arbitrary code');
    }

    if (functions.length === 0) {
      analysis.push('No recognizable function signatures found');
    } else {
      analysis.push(`Found ${functions.length} potential function(s)`);
    }

    return analysis;
  }

  /**
   * Try to call a specific function on the contract
   */
  async tryCallFunction(
    contractAddress: string,
    functionSignature: string,
    fromAddress: string
  ): Promise<{
    success: boolean;
    result?: string;
    error?: string;
  }> {
    try {
      const selector = ethers.id(functionSignature).slice(0, 10);
      
      const result = await this.provider.call({
        to: contractAddress,
        data: selector,
        from: fromAddress
      });

      return {
        success: true,
        result
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get transaction history for the contract
   */
  async getRecentTransactions(contractAddress: string): Promise<string[]> {
    // This would require an indexing service or archive node
    // For now, return a placeholder
    return [
      'Note: Full transaction history requires archive node access',
      'Consider using a block explorer API for complete history'
    ];
  }
}