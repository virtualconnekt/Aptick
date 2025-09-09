import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Configure Aptos client for devnet
const config = new AptosConfig({ 
  network: Network.DEVNET
});

export const aptos = new Aptos(config);

// Contract address from your Move.toml
export const CONTRACT_ADDRESS = "0x72780903f4ca64d29bf9fcd1be4b863190d76d25cc5efd176ee4b119732419c1";

// Module name from your smart contract
export const MODULE_NAME = "billing";

// Transaction options
export const DEFAULT_GAS_PRICE = 100;
export const DEFAULT_MAX_GAS = 200000;

// Debug logging for configuration
console.log('=== Aptos Configuration ===');
console.log('Network:', Network.DEVNET);
console.log('CONTRACT_ADDRESS:', CONTRACT_ADDRESS);
console.log('MODULE_NAME:', MODULE_NAME);
console.log('Aptos client initialized:', !!aptos);