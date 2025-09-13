import { 
  AptAmount, 
  Address, 
  BillingId 
} from './types';

/**
 * Utility functions for the Aptick SDK
 */
export class AptickUtils {
  /**
   * Convert APT to octas (1 APT = 100,000,000 octas)
   */
  static aptToOctas(apt: number): bigint {
    return BigInt(Math.floor(apt * 100_000_000));
  }

  /**
   * Convert octas to APT
   */
  static octasToApt(octas: bigint): number {
    return Number(octas) / 100_000_000;
  }

  /**
   * Format APT amount for display
   */
  static formatApt(octas: bigint, decimals: number = 4): string {
    const apt = this.octasToApt(octas);
    return apt.toFixed(decimals) + ' APT';
  }

  /**
   * Validate Aptos address format
   */
  static isValidAddress(address: string): boolean {
    const addressRegex = /^0x[a-fA-F0-9]{1,64}$/;
    return addressRegex.test(address);
  }

  /**
   * Normalize address (ensure proper 0x prefix and length)
   */
  static normalizeAddress(address: string): string {
    if (!address.startsWith('0x')) {
      address = '0x' + address;
    }
    return address.toLowerCase().padEnd(66, '0');
  }

  /**
   * Calculate cost for usage
   */
  static calculateCost(units: bigint, pricePerUnit: bigint): bigint {
    return units * pricePerUnit;
  }

  /**
   * Validate billing parameters
   */
  static validateBillingParams(pricePerUnit: number, unit: string): { valid: boolean; error?: string } {
    if (pricePerUnit <= 0) {
      return { valid: false, error: 'Price per unit must be positive' };
    }
    
    if (!unit || unit.trim().length === 0) {
      return { valid: false, error: 'Unit type cannot be empty' };
    }
    
    if (unit.length > 50) {
      return { valid: false, error: 'Unit type too long (max 50 characters)' };
    }
    
    return { valid: true };
  }

  /**
   * Generate a unique transaction ID for tracking
   */
  static generateTransactionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Sleep utility for delays
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry mechanism for network calls
   */
  static async retry<T>(
    fn: () => Promise<T>, 
    maxRetries: number = 3, 
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (i === maxRetries) {
          throw lastError;
        }
        
        await this.sleep(delay * Math.pow(2, i)); // Exponential backoff
      }
    }
    
    throw lastError!;
  }

  /**
   * Parse transaction error messages for better UX
   */
  static parseTransactionError(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.message) {
      // Common Aptos error patterns
      if (error.message.includes('INSUFFICIENT_BALANCE')) {
        return 'Insufficient APT balance for this transaction';
      }
      
      if (error.message.includes('SEQUENCE_NUMBER_TOO_OLD')) {
        return 'Transaction sequence error. Please try again';
      }
      
      if (error.message.includes('INVALID_SIGNATURE')) {
        return 'Invalid signature. Please check your wallet connection';
      }
      
      if (error.message.includes('ERESOURCE_DOES_NOT_EXIST')) {
        return 'Billing service not found or not initialized';
      }
      
      return error.message;
    }
    
    return 'Unknown transaction error occurred';
  }

  /**
   * Validate network configuration
   */
  static validateNetwork(network: string): boolean {
    const validNetworks = ['mainnet', 'testnet', 'devnet', 'local'];
    return validNetworks.includes(network.toLowerCase());
  }

  /**
   * Get deposit URL for a billing ID
   */
  static getDepositUrl(billingId: number, network: string = 'devnet'): string {
    // Use localhost for development
    const baseUrl = network === 'devnet' ? 'http://localhost:3000' : 'https://aptick.app';
    return `${baseUrl}/deposit/${billingId}`;
  }

  /**
   * Get provider registration URL
   */
  static getProviderRegistrationUrl(network: string = 'devnet'): string {
    const baseUrl = network === 'devnet' ? 'http://localhost:3000' : 'https://aptick.app';
    return `${baseUrl}/provider/register`;
  }

  /**
   * Get default RPC URL for network
   */
  static getDefaultRpcUrl(network: string): string {
    switch (network.toLowerCase()) {
      case 'mainnet':
        return 'https://fullnode.mainnet.aptoslabs.com/v1';
      case 'testnet':
        return 'https://fullnode.testnet.aptoslabs.com/v1';
      case 'devnet':
        return 'https://fullnode.devnet.aptoslabs.com/v1';
      case 'local':
        return 'http://localhost:8080/v1';
      default:
        throw new Error(`Unsupported network: ${network}`);
    }
  }
}