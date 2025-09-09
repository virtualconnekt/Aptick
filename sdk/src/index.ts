// Main SDK exports
export { AptickClient } from './client';
export { AptickUtils } from './utils';

// Types
export type {
  AptickConfig,
  Provider,
  UserEscrow,
  BillingSession,
  TransactionOptions,
  AptickResult,
  UsageRecord,
  DepositRecord,
  WalletSignAndSubmitFunction,
  AptAmount,
  BillingId,
  Address,
  AptickEvents
} from './types';

// React integration
export {
  useProviderRegistration,
  useUserOperations,
  useProviderOperations,
  useAptickQuery,
  AptickProvider,
  useAptick,
  createAptickClient,
  setupAptick
} from './react';

// Version
export const VERSION = '1.0.0';