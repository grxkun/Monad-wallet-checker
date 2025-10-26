export interface DelegationInfo {
  isDelegated: boolean;
  delegatedTo?: string;
  codeHash: string;
  nonce: number;
  balance: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskFactors: string[];
}

export interface WalletStatus {
  address: string;
  chainId: number;
  delegation: DelegationInfo;
  lastChecked: Date;
}

export interface CancellationOptions {
  gasLimit?: number;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  dryRun?: boolean;
}

export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  gasUsed?: bigint;
  effectiveGasPrice?: bigint;
}