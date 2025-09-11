// Service Provider Configuration
// Update these values with your actual Aptick registration details

export const SERVICE_CONFIG = {
  // Your billing ID from Aptick registration
  billingId: 5, // REPLACE WITH YOUR ACTUAL BILLING ID
  
  // Your service details
  serviceName: 'Decentralized File Storage',
  description: 'Secure blockchain-powered file storage with automated billing',
  
  // Pricing (in APT per MB)
  pricePerMB: 0.1, // REPLACE WITH YOUR ACTUAL PRICE
  
  // Network configuration
  network: 'devnet' as const, // Change to 'mainnet' for production
  contractAddress: '0x72780903f4ca64d29bf9fcd1be4b863190d76d25cc5efd176ee4b119732419c1',
  
  // Feature flags
  enableRealWallet: false, // Set to true when integrating real wallet
  enableRealStorage: false, // Set to true when integrating real storage backend
  
  // UI Configuration
  theme: {
    primaryColor: '#007bff',
    successColor: '#28a745',
    warningColor: '#ffc107',
    dangerColor: '#dc3545'
  }
};

// Instructions for service providers
export const INTEGRATION_INSTRUCTIONS = {
  steps: [
    '1. Update SERVICE_CONFIG.billingId with your actual billing ID from Aptick',
    '2. Set your SERVICE_CONFIG.pricePerMB to match your registered price',
    '3. Update SERVICE_CONFIG.serviceName and description',
    '4. For production: Change network to "mainnet"',
    '5. Integrate real wallet using @aptos-labs/wallet-adapter-react',
    '6. Replace simulated storage with your actual storage backend',
    '7. Test the full flow on devnet before deploying to mainnet'
  ],
  
  realWalletIntegration: `
    // To integrate real wallet, install:
    // npm install @aptos-labs/wallet-adapter-react
    
    // Then replace the simulated wallet in WalletConnect.tsx with:
    // import { useWallet } from '@aptos-labs/wallet-adapter-react';
    // const { connect, account, signAndSubmitTransaction } = useWallet();
  `,
  
  realStorageIntegration: `
    // Replace the simulateFileUpload function in DocumentUpload.tsx with your actual storage upload logic:
    // - IPFS integration
    // - AWS S3 upload
    // - Your custom storage backend
    // - Return actual file URLs/hashes
  `
};

export default SERVICE_CONFIG;