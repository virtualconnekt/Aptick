export interface Provider {
  provider_addr: string;
  price_per_unit: number;
  unit: string;
  billing_id: number;
  active: boolean;
  total_revenue: number;
}

export interface UserEscrow {
  balance: number;
  usage_units: number;
}

export interface WalletInfo {
  address: string;
  balance: number;
  connected: boolean;
}

export interface BillingService {
  billing_id: number;
  provider: Provider;
  user_escrow?: UserEscrow;
}

export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
}