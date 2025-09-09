// Core types for the Aptick SDK
export interface AptickConfig {
  network: 'mainnet' | 'testnet' | 'devnet' | 'local';
  contractAddress?: string;
  moduleAccount?: string;
  rpcUrl?: string;
}

export interface Provider {
  providerId: number;
  providerAddress: string;
  pricePerUnit: bigint;
  unit: string;
  active: boolean;
  totalRevenue: bigint;
}

export interface UserEscrow {
  balance: bigint;
  usageUnits: bigint;
}

export interface BillingSession {
  billingId: number;
  provider: Provider;
  userAddress: string;
  escrow: UserEscrow;
}

export interface TransactionOptions {
  maxGasAmount?: number;
  gasUnitPrice?: number;
  timeoutSecs?: number;
}

export interface AptickResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  transactionHash?: string;
}

export interface UsageRecord {
  billingId: number;
  userAddress: string;
  units: bigint;
  cost: bigint;
  timestamp: Date;
}

export interface DepositRecord {
  billingId: number;
  userAddress: string;
  amount: bigint;
  timestamp: Date;
}

export type WalletSignAndSubmitFunction = (transaction: any) => Promise<any>;

// Event types for real-time updates
export interface AptickEvents {
  'provider:registered': (provider: Provider) => void;
  'deposit:made': (record: DepositRecord) => void;
  'usage:recorded': (record: UsageRecord) => void;
  'service:terminated': (billingId: number, userAddress: string) => void;
  'error': (error: Error) => void;
}

// Utility types
export type AptAmount = bigint; // APT in octas (1 APT = 100,000,000 octas)
export type BillingId = number;
export type Address = string;