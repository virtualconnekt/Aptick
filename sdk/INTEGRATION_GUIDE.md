# Aptick SDK Integration Guide

## Overview

After registering as a provider on the Aptick platform and receiving your billing ID, this guide will help you integrate the Aptick SDK into your application to start accepting payments from users.

## Quick Start

### 1. Installation

```bash
npm install aptick-sdk
# or
yarn add aptick-sdk
```

### 2. Basic Setup

```typescript
import { createAptickClient } from 'aptick-sdk';

const client = createAptickClient({
  network: 'devnet', // or 'mainnet' for production
  contractAddress: '0x72780903f4ca64d29bf9fcd1be4b863190d76d25cc5efd176ee4b119732419c1'
});

await client.initialize();
```

## Integration Scenarios

### Scenario 1: File Storage Service

If you're running a file storage service and registered with:
- **Price**: 0.001 APT per GB
- **Unit**: "GB"
- **Billing ID**: 123

```typescript
import { createAptickClient } from 'aptick-sdk';

class FileStorageService {
  private aptickClient;
  private billingId = 123; // Your billing ID from registration

  constructor() {
    this.aptickClient = createAptickClient({
      network: 'devnet' // Use 'mainnet' for production
    });
  }

  async initialize() {
    await this.aptickClient.initialize();
  }

  // Record usage when user uploads files
  async recordFileUpload(userAddress: string, fileSizeGB: number, providerWallet: any) {
    try {
      const result = await this.aptickClient.recordUsage(
        providerWallet.signAndSubmitTransaction,
        this.billingId,
        userAddress,
        fileSizeGB
      );

      if (result.success) {
        console.log(`Recorded ${fileSizeGB} GB usage for user ${userAddress}`);
        console.log(`Transaction: ${result.transactionHash}`);
        return true;
      } else {
        console.error('Failed to record usage:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error recording usage:', error);
      return false;
    }
  }

  // Check if user has sufficient balance before allowing upload
  async checkUserBalance(userAddress: string): Promise<number> {
    const result = await this.aptickClient.getUserEscrow(this.billingId, userAddress);
    
    if (result.success) {
      // Convert octas to APT for display
      const balanceInAPT = Number(result.data!.balance) / 100_000_000;
      return balanceInAPT;
    }
    
    return 0;
  }
}
```

### Scenario 2: API Service

For an API service charging per request:

```typescript
class APIService {
  private aptickClient;
  private billingId = 124; // Your billing ID
  private costPerRequest = 10; // requests per unit

  async handleAPIRequest(userAddress: string, providerWallet: any) {
    // Check if user has balance
    const escrow = await this.aptickClient.getUserEscrow(this.billingId, userAddress);
    
    if (!escrow.success || escrow.data!.balance < 1000) { // Minimum balance check
      return { error: 'Insufficient balance. Please deposit APT first.' };
    }

    // Process the actual API request
    const apiResult = await this.processRequest();

    // Record usage after successful request
    await this.aptickClient.recordUsage(
      providerWallet.signAndSubmitTransaction,
      this.billingId,
      userAddress,
      this.costPerRequest // 10 requests
    );

    return apiResult;
  }

  private async processRequest() {
    // Your actual API logic here
    return { data: 'API response data' };
  }
}
```

### Scenario 3: React Web Application

For a React web app that provides services:

```tsx
import React, { useEffect, useState } from 'react';
import { AptickProvider, useAptick, createAptickClient } from 'aptick-sdk';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

// Initialize client
const aptickClient = createAptickClient({
  network: 'devnet'
});

function App() {
  return (
    <AptickProvider client={aptickClient}>
      <ServiceProvider />
    </AptickProvider>
  );
}

function ServiceProvider() {
  const client = useAptick();
  const { account, signAndSubmitTransaction } = useWallet();
  const [userBalance, setUserBalance] = useState(0);
  const billingId = 125; // Your billing ID

  useEffect(() => {
    if (account?.address) {
      checkUserBalance();
    }
  }, [account]);

  const checkUserBalance = async () => {
    if (!account?.address) return;
    
    const result = await client.getUserEscrow(billingId, account.address.toString());
    if (result.success) {
      const balanceInAPT = Number(result.data!.balance) / 100_000_000;
      setUserBalance(balanceInAPT);
    }
  };

  const provideService = async () => {
    if (!account?.address || !signAndSubmitTransaction) {
      alert('Please connect your wallet');
      return;
    }

    // Check balance first
    if (userBalance < 0.001) {
      alert('Insufficient balance. Please deposit APT first.');
      return;
    }

    try {
      // Provide your service here
      const serviceResult = await performService();

      // Record usage
      const result = await client.recordUsage(
        signAndSubmitTransaction,
        billingId,
        account.address.toString(),
        1 // 1 unit of service
      );

      if (result.success) {
        alert('Service provided and payment processed!');
        checkUserBalance(); // Refresh balance
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const performService = async () => {
    // Your actual service logic
    return 'Service completed';
  };

  return (
    <div>
      <h2>My Service</h2>
      <p>Your balance: {userBalance.toFixed(6)} APT</p>
      <button onClick={provideService}>Use Service (0.001 APT)</button>
    </div>
  );
}
```

## Integration Best Practices

### 1. Balance Checking

Always check user balance before providing service:

```typescript
const checkSufficientBalance = async (userAddress: string, requiredUnits: number) => {
  const escrow = await client.getUserEscrow(billingId, userAddress);
  const provider = await client.getProvider(billingId);
  
  if (!escrow.success || !provider.success) return false;
  
  const requiredCost = requiredUnits * Number(provider.data!.pricePerUnit);
  const userBalance = Number(escrow.data!.balance);
  
  return userBalance >= requiredCost;
};
```

### 2. Error Handling

Implement robust error handling:

```typescript
const recordUsageWithRetry = async (userAddress: string, units: number, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await client.recordUsage(
        signAndSubmitTransaction,
        billingId,
        userAddress,
        units
      );
      
      if (result.success) return result;
      
      console.warn(`Attempt ${i + 1} failed:`, result.error);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    } catch (error) {
      console.error(`Attempt ${i + 1} error:`, error);
    }
  }
  
  throw new Error('Failed to record usage after retries');
};
```

### 3. User Onboarding

Help users deposit funds:

```typescript
const showDepositInstructions = (userAddress: string) => {
  return {
    message: 'To use this service, please deposit APT to your escrow account.',
    steps: [
      '1. Connect your Aptos wallet',
      '2. Visit the Aptick deposit page',
      `3. Deposit APT for service ID: ${billingId}`,
      '4. Return here to use the service'
    ],
    depositUrl: `https://aptick.app/deposit/${billingId}`
  };
};
```

## Environment Configuration

### Development Setup

```typescript
// .env.development
REACT_APP_APTICK_NETWORK=devnet
REACT_APP_APTICK_CONTRACT=0x72780903f4ca64d29bf9fcd1be4b863190d76d25cc5efd176ee4b119732419c1
REACT_APP_BILLING_ID=123

// config.ts
export const config = {
  network: process.env.REACT_APP_APTICK_NETWORK as 'devnet' | 'mainnet',
  contractAddress: process.env.REACT_APP_APTICK_CONTRACT,
  billingId: parseInt(process.env.REACT_APP_BILLING_ID || '0')
};
```

### Production Setup

```typescript
// .env.production
REACT_APP_APTICK_NETWORK=mainnet
REACT_APP_APTICK_CONTRACT=0x[mainnet_contract_address]
REACT_APP_BILLING_ID=123
```

## Next Steps

1. **Test Integration**: Start with devnet to test your integration
2. **Monitor Usage**: Track usage patterns and adjust pricing if needed
3. **Scale**: Move to mainnet when ready for production
4. **Analytics**: Implement analytics to track revenue and usage

## Support

For integration support:
- Check the [SDK documentation](./README.md)
- Review [examples](./examples/)
- Open an issue on GitHub

## Example Projects

- [File Storage Service](./examples/file-storage/)
- [API Gateway](./examples/api-gateway/)
- [SaaS Application](./examples/saas-app/)