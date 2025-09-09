# @aptick/sdk

The official JavaScript/TypeScript SDK for Aptick - a decentralized billing system built on the Aptos blockchain.

## Features

- 🏗️ **Type-safe** - Full TypeScript support with comprehensive type definitions
- 🔗 **Multi-wallet** - Works with all Aptos wallet adapters
- ⚡ **Easy to use** - Simple, intuitive API design
- 🛡️ **Error handling** - Comprehensive error handling with meaningful messages
- ⚛️ **React ready** - Built-in React hooks and components
- 🌐 **Multi-network** - Support for mainnet, testnet, devnet, and local networks

## Installation

```bash
npm install @aptick/sdk
# or
yarn add @aptick/sdk
# or
pnpm add @aptick/sdk
```

## Quick Start

### Basic Setup

```typescript
import { createAptickClient, AptickConfig } from '@aptick/sdk';

const config: AptickConfig = {
  network: 'devnet', // or 'mainnet', 'testnet', 'local'
  contractAddress: '0x123...', // Optional: defaults to official deployed contracts
};

const client = createAptickClient(config);
await client.initialize();
```

### React Integration

```tsx
import { AptickProvider, useAptick, setupAptick } from '@aptick/sdk';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

// Setup the client
const client = await setupAptick({ network: 'devnet' });

// Wrap your app
function App() {
  return (
    <AptickProvider client={client}>
      <YourComponents />
    </AptickProvider>
  );
}

// Use in components
function ProviderRegistration() {
  const client = useAptick();
  const { signAndSubmitTransaction } = useWallet();

  const handleRegister = async () => {
    const result = await client.registerProvider(
      signAndSubmitTransaction,
      0.001, // 0.001 APT per unit
      'GB'   // Unit type
    );

    if (result.success) {
      console.log('Registered with billing ID:', result.data);
    }
  };

  return <button onClick={handleRegister}>Register as Provider</button>;
}
```

## API Reference

### Core Classes

#### `AptickClient`

The main client for interacting with the Aptick billing system.

```typescript
// Initialize
const client = new AptickClient(config);
await client.initialize();

// Register as provider
const result = await client.registerProvider(walletSignFn, pricePerUnit, unit);

// Deposit APT
await client.deposit(walletSignFn, billingId, aptAmount);

// Record usage (providers only)
await client.recordUsage(walletSignFn, billingId, userAddress, units);

// Terminate service and get refund
await client.terminateService(walletSignFn, billingId);

// Query data
const provider = await client.getProvider(billingId);
const escrow = await client.getUserEscrow(billingId, userAddress);
const balance = await client.getAptBalance(address);
```

#### `AptickUtils`

Utility functions for common operations.

```typescript
import { AptickUtils } from '@aptick/sdk';

// Convert between APT and octas
const octas = AptickUtils.aptToOctas(1.5); // 150,000,000 octas
const apt = AptickUtils.octasToApt(150000000n); // 1.5

// Format for display
const formatted = AptickUtils.formatApt(150000000n); // "1.5000 APT"

// Validate addresses
const isValid = AptickUtils.isValidAddress('0x123...');

// Calculate costs
const cost = AptickUtils.calculateCost(10n, 1000n); // 10 units × 1000 octas = 10000 octas
```

### React Hooks

#### `useProviderRegistration`

```typescript
import { useProviderRegistration } from '@aptick/sdk';

const { registerProvider } = useProviderRegistration(client);

await registerProvider(signAndSubmitTransaction, 0.001, 'GB');
```

#### `useUserOperations`

```typescript
import { useUserOperations } from '@aptick/sdk';

const { deposit, terminateService } = useUserOperations(client);

await deposit(signAndSubmitTransaction, billingId, 1.0);
await terminateService(signAndSubmitTransaction, billingId);
```

#### `useProviderOperations`

```typescript
import { useProviderOperations } from '@aptick/sdk';

const { recordUsage } = useProviderOperations(client);

await recordUsage(signAndSubmitTransaction, billingId, userAddress, 10);
```

#### `useAptickQuery`

```typescript
import { useAptickQuery } from '@aptick/sdk';

const { getProvider, getUserEscrow, getAptBalance } = useAptickQuery(client);

const provider = await getProvider(billingId);
const escrow = await getUserEscrow(billingId, userAddress);
const balance = await getAptBalance(address);
```

## Examples

### Complete Provider Registration Flow

```typescript
import { createAptickClient, AptickUtils } from '@aptick/sdk';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

async function registerAsProvider() {
  const client = createAptickClient({ network: 'devnet' });
  await client.initialize();
  
  const { signAndSubmitTransaction } = useWallet();
  
  // Validate inputs
  const validation = AptickUtils.validateBillingParams(0.001, 'GB');
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Register
  const result = await client.registerProvider(
    signAndSubmitTransaction,
    0.001, // 0.001 APT per GB
    'GB'   // Gigabyte
  );
  
  if (result.success) {
    console.log(`Registered! Billing ID: ${result.data}`);
    console.log(`Transaction: ${result.transactionHash}`);
  } else {
    console.error(`Registration failed: ${result.error}`);
  }
}
```

### User Deposit and Usage Flow

```typescript
async function userFlow() {
  const client = createAptickClient({ network: 'devnet' });
  await client.initialize();
  
  const { signAndSubmitTransaction } = useWallet();
  const billingId = 1;
  const userAddress = '0x123...';
  
  // Check balance before
  const beforeBalance = await client.getAptBalance(userAddress);
  console.log(`Balance: ${AptickUtils.formatApt(beforeBalance.data!)}`);
  
  // Deposit 1 APT
  await client.deposit(signAndSubmitTransaction, billingId, 1.0);
  
  // Check escrow
  const escrow = await client.getUserEscrow(billingId, userAddress);
  console.log(`Escrow: ${AptickUtils.formatApt(escrow.data!.balance)}`);
  
  // Provider records usage (10 GB)
  // This would be called by the provider
  await client.recordUsage(signAndSubmitTransaction, billingId, userAddress, 10);
  
  // Terminate and get refund
  await client.terminateService(signAndSubmitTransaction, billingId);
}
```

## Error Handling

All SDK methods return `AptickResult<T>` objects:

```typescript
interface AptickResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  transactionHash?: string;
}

// Always check success
const result = await client.registerProvider(/* ... */);
if (result.success) {
  console.log('Success:', result.data);
} else {
  console.error('Error:', result.error);
}
```

## Configuration

### Network Configuration

```typescript
const config: AptickConfig = {
  network: 'devnet',
  contractAddress: '0x123...', // Optional
  moduleAccount: 'billing',    // Optional
  rpcUrl: 'https://...',      // Optional
};
```

### Transaction Options

```typescript
const options: TransactionOptions = {
  maxGasAmount: 10000,
  gasUnitPrice: 100,
  timeoutSecs: 30,
};

await client.registerProvider(walletSignFn, pricePerUnit, unit, options);
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](./LICENSE) for details.