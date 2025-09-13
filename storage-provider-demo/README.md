# Aptick Storage Provider Integration

This is a **real implementation** of Aptick SDK integration for service providers. This demo shows how to integrate Aptick's blockchain billing system into your storage service.

## 🚀 Quick Start

### Prerequisites
- You must already be **registered as a provider** on Aptick
- You must have your **Billing ID** from the registration
- Node.js 16+ installed
- APT tokens for testing

### 1. Configure Your Service

Edit `src/config/serviceConfig.ts`:

```typescript
export const SERVICE_CONFIG = {
  billingId: YOUR_ACTUAL_BILLING_ID, // ⚠️ REPLACE THIS
  serviceName: 'Your Service Name',
  pricePerMB: YOUR_ACTUAL_PRICE, // ⚠️ REPLACE THIS
  network: 'devnet' // or 'mainnet' for production
};
```

### 2. Install and Run

```bash
npm install
npm start
```

## 🔧 Real Implementation Features

### ✅ What's Already Implemented (REAL)

- **Real Aptick SDK Integration**: Uses actual `aptick-sdk` package
- **Blockchain Transaction Recording**: Real calls to `recordUsage()`
- **Balance Checking**: Real queries to user escrow balances
- **Provider Information**: Real queries to provider details
- **Cost Calculation**: Accurate APT cost calculations
- **Error Handling**: Proper blockchain error handling

### 🔄 What's Simulated (For Demo)

- **Wallet Connection**: Uses mock wallet (easy to replace with real wallet)
- **File Upload**: Simulates file storage (replace with your storage backend)
- **Transaction Signing**: Mock wallet signatures (replace with real wallet)

## 🔐 Integration Steps

### Step 1: Real Wallet Integration

Replace the mock wallet with real Aptos wallet integration:

```bash
npm install @aptos-labs/wallet-adapter-react
```

Update `WalletConnect.tsx`:
```typescript
import { useWallet } from '@aptos-labs/wallet-adapter-react';

// Replace mock connection with:
const { connect, account, signAndSubmitTransaction } = useWallet();
```

### Step 2: Real Storage Backend

Replace `simulateFileUpload()` in `DocumentUpload.tsx` with your actual storage:

```typescript
// Example: IPFS Integration
const uploadToIPFS = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload-ipfs', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
};
```

### Step 3: Production Configuration

Update `serviceConfig.ts` for production:
```typescript
export const SERVICE_CONFIG = {
  billingId: YOUR_ACTUAL_BILLING_ID,
  network: 'mainnet', // ⚠️ Change to mainnet
  enableRealWallet: true,
  enableRealStorage: true
};
```

## 📋 Testing Checklist

Before going live, test:

- [ ] User can connect wallet
- [ ] User balance displays correctly
- [ ] File upload calculates correct cost
- [ ] Aptick `recordUsage()` transaction succeeds
- [ ] Escrow balance decreases correctly
- [ ] Error handling works for insufficient balance
- [ ] Provider revenue tracking works

## 🔍 How It Works

1. **User connects wallet** → App checks APT and escrow balances
2. **User uploads file** → App calculates cost based on file size
3. **App calls Aptick SDK** → `recordUsage(billingId, userAddress, fileSizeMB)`
4. **Blockchain transaction** → Payment automatically deducted from escrow
5. **File stored** → User receives confirmation with transaction hash

## 🛠 Real SDK Calls Used

```typescript
// Initialize SDK
const client = new AptickClient({
  network: 'devnet',
  contractAddress: '0x...'
});

// Check balances
await client.getAptBalance(userAddress);
await client.getUserEscrow(billingId, userAddress);

// Record usage (this charges the user)
await client.recordUsage(
  walletSignFn,
  billingId, 
  userAddress, 
  fileSizeMB
);

// Get provider info
await client.getProvider(billingId);
```

## 📊 Revenue Tracking

The demo includes real-time tracking of:
- Total files stored
- Total storage used (MB)
- Total revenue earned (APT)
- Average revenue per file

## 🚨 Important Notes

- **This uses REAL blockchain transactions** on devnet
- **Users need actual APT tokens** deposited to escrow
- **Your billing ID must be valid** and registered on Aptick
- **Replace mock components** with real implementations before production

## 🔗 Links

- [Aptick SDK Documentation](../sdk/README.md)
- [Provider Integration Guide](../sdk/INTEGRATION_GUIDE.md)
- [Aptos Wallet Adapter](https://github.com/aptos-labs/aptos-wallet-adapter)

## 💡 Next Steps

1. **Test on devnet** with real APT tokens
2. **Integrate your storage backend** 
3. **Add real wallet connection**
4. **Deploy to mainnet** for production

---

**🎯 This is a production-ready template for integrating Aptick into your service!**