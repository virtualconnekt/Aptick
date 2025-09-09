import { AptickClient } from './client';
import { AptickUtils } from './utils';
import { 
  WalletSignAndSubmitFunction,
  AptickConfig,
  AptickResult,
  BillingId,
  Address
} from './types';

/**
 * React hooks for easy integration with React applications
 */

// Hook for provider registration
export function useProviderRegistration(client: AptickClient) {
  const registerProvider = async (
    walletSignFn: WalletSignAndSubmitFunction,
    pricePerUnit: number,
    unit: string
  ): Promise<AptickResult<BillingId>> => {
    return await client.registerProvider(walletSignFn, pricePerUnit, unit);
  };

  return { registerProvider };
}

// Hook for user operations (deposit, terminate)
export function useUserOperations(client: AptickClient) {
  const deposit = async (
    walletSignFn: WalletSignAndSubmitFunction,
    billingId: BillingId,
    aptAmount: number
  ): Promise<AptickResult<string>> => {
    return await client.deposit(walletSignFn, billingId, aptAmount);
  };

  const terminateService = async (
    walletSignFn: WalletSignAndSubmitFunction,
    billingId: BillingId
  ): Promise<AptickResult<string>> => {
    return await client.terminateService(walletSignFn, billingId);
  };

  return { deposit, terminateService };
}

// Hook for provider operations
export function useProviderOperations(client: AptickClient) {
  const recordUsage = async (
    walletSignFn: WalletSignAndSubmitFunction,
    billingId: BillingId,
    userAddress: Address,
    units: number
  ): Promise<AptickResult<string>> => {
    return await client.recordUsage(walletSignFn, billingId, userAddress, units);
  };

  return { recordUsage };
}

// Hook for balance and data queries
export function useAptickQuery(client: AptickClient) {
  const getProvider = async (billingId: BillingId) => {
    return await client.getProvider(billingId);
  };

  const getUserEscrow = async (billingId: BillingId, userAddress: Address) => {
    return await client.getUserEscrow(billingId, userAddress);
  };

  const getAptBalance = async (address: Address) => {
    return await client.getAptBalance(address);
  };

  const getBillingSession = async (billingId: BillingId, userAddress: Address) => {
    return await client.getBillingSession(billingId, userAddress);
  };

  return {
    getProvider,
    getUserEscrow,
    getAptBalance,
    getBillingSession
  };
}

/**
 * Higher-order component for providing Aptick client to React components
 */
import { createContext, useContext, ReactNode } from 'react';

const AptickContext = createContext<AptickClient | null>(null);

interface AptickProviderProps {
  client: AptickClient;
  children: ReactNode;
}

export function AptickProvider({ client, children }: AptickProviderProps) {
  return (
    <AptickContext.Provider value={client}>
      {children}
    </AptickContext.Provider>
  );
}

export function useAptick(): AptickClient {
  const client = useContext(AptickContext);
  if (!client) {
    throw new Error('useAptick must be used within an AptickProvider');
  }
  return client;
}

/**
 * Factory function for easy SDK instantiation
 */
export function createAptickClient(config: AptickConfig): AptickClient {
  return new AptickClient(config);
}

/**
 * Quick setup function for common use cases
 */
export async function setupAptick(config: AptickConfig): Promise<AptickClient> {
  const client = new AptickClient(config);
  const result = await client.initialize();
  
  if (!result.success) {
    throw new Error(`Failed to initialize Aptick: ${result.error}`);
  }
  
  return client;
}