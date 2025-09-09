import { aptos } from '@/lib/aptos';

export class TransactionHelper {
  
  /**
   * Extract billing ID from transaction events
   * This is a helper for future enhancement when we can parse events
   */
  static async getBillingIdFromTransaction(transactionHash: string): Promise<number | null> {
    try {
      // Get transaction by hash
      const transaction = await aptos.getTransactionByHash({ transactionHash });
      
      // TODO: Parse events to extract billing ID
      // This would require parsing the transaction events for the provider registration
      // For now, we return null and will implement this when the contract emits events
      
      console.log('Transaction details:', transaction);
      return null;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }

  /**
   * Format transaction hash for display
   */
  static formatTransactionHash(hash: string): string {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  }

  /**
   * Get explorer URL for transaction
   */
  static getExplorerUrl(transactionHash: string, network: string = 'devnet'): string {
    return `https://explorer.aptoslabs.com/txn/${transactionHash}?network=${network}`;
  }
}