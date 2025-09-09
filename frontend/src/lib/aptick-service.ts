import { aptos, CONTRACT_ADDRESS, MODULE_NAME } from '@/lib/aptos';
import { TransactionResult } from '@/types/billing';

export class AptickService {
  
  // Check if the contract is deployed and initialized
  static async checkContractDeployment(): Promise<boolean> {
    try {
      console.log('=== Checking Contract Deployment ===');
      const accountResource = await aptos.getAccountResource({
        accountAddress: CONTRACT_ADDRESS,
        resourceType: `${CONTRACT_ADDRESS}::${MODULE_NAME}::Aptick`
      });
      console.log('Contract resource found:', !!accountResource);
      console.log('Contract resource data:', accountResource);
      return !!accountResource;
    } catch (error) {
      console.log('Contract resource not found, checking if account exists:', error);
      
      // Check if the account exists at all
      try {
        const account = await aptos.getAccountInfo({ accountAddress: CONTRACT_ADDRESS });
        console.log('Contract account exists:', !!account);
        console.log('Account info:', account);
        
        // Account exists but no Aptick resource - contract needs initialization
        return false;
      } catch (accountError) {
        console.error('Contract account does not exist:', accountError);
        return false;
      }
    }
  }
  
  // Initialize the billing system (admin only) - this should be called once after deployment
  static async initialize(
    signAndSubmitTransaction: any,
    senderAddress: string
  ): Promise<TransactionResult> {
    try {
      console.log('=== Initializing Contract ===');
      
      const transactionPayload = {
        type: "entry_function_payload",
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::init`,
        type_arguments: [],
        arguments: []
      };

      console.log('Initialization payload:', transactionPayload);
      
      const response = await signAndSubmitTransaction(transactionPayload);
      
      let transactionHash: string;
      if (response && typeof response === 'object' && 'hash' in response) {
        transactionHash = response.hash as string;
      } else if (typeof response === 'string') {
        transactionHash = response;
      } else {
        return { success: false, error: 'Invalid initialization response format' };
      }

      await aptos.waitForTransaction({ transactionHash });
      console.log('Contract initialized successfully');
      return { success: true, hash: transactionHash };
      
    } catch (error) {
      console.error('Contract initialization error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Register as a service provider (Petra-compatible version)
  static async registerProvider(
    signAndSubmitTransaction: any,
    senderAddress: string,
    pricePerUnit: number, 
    unit: string
  ): Promise<TransactionResult> {
    try {
      // Validate inputs with detailed checks
      console.log('=== Transaction Validation ===');
      console.log('CONTRACT_ADDRESS:', CONTRACT_ADDRESS);
      console.log('MODULE_NAME:', MODULE_NAME);
      console.log('signAndSubmitTransaction type:', typeof signAndSubmitTransaction);
      console.log('signAndSubmitTransaction is null:', signAndSubmitTransaction === null);
      console.log('signAndSubmitTransaction is undefined:', signAndSubmitTransaction === undefined);
      console.log('senderAddress:', senderAddress);
      console.log('pricePerUnit:', pricePerUnit, typeof pricePerUnit);
      console.log('unit:', unit, typeof unit);
      
      if (!CONTRACT_ADDRESS) {
        throw new Error('CONTRACT_ADDRESS is not defined');
      }
      
      if (!MODULE_NAME) {
        throw new Error('MODULE_NAME is not defined');
      }
      
      if (!signAndSubmitTransaction) {
        throw new Error('signAndSubmitTransaction is not provided');
      }
      
      if (typeof signAndSubmitTransaction !== 'function') {
        throw new Error(`signAndSubmitTransaction is not a function, got: ${typeof signAndSubmitTransaction}`);
      }

      // Build the function path
      const functionPath = `${CONTRACT_ADDRESS}::${MODULE_NAME}::register_provider`;
      console.log('Function path:', functionPath);
      
      // Aptos Connect payload format with data wrapper
      const aptosConnectTransaction = {
        data: {
          function: functionPath,
          typeArguments: [],
          functionArguments: [pricePerUnit.toString(), unit]
        }
      };

      console.log('=== Aptos Connect Transaction Payload ===');
      console.log('Transaction structure:', Object.keys(aptosConnectTransaction));
      console.log('Data structure:', Object.keys(aptosConnectTransaction.data));
      console.log('Full transaction:', JSON.stringify(aptosConnectTransaction, null, 2));
      
      // Submit the transaction using Aptos Connect format
      console.log('=== Calling signAndSubmitTransaction (Aptos Connect format) ===');
      console.log('About to call signAndSubmitTransaction with Aptos Connect transaction');
      
      let response;
      try {
        response = await signAndSubmitTransaction(aptosConnectTransaction);
        console.log('Aptos Connect transaction succeeded');
      } catch (aptosConnectError) {
        console.error('Aptos Connect transaction failed:', aptosConnectError);
        console.error('Error type:', typeof aptosConnectError);
        console.error('Error message:', aptosConnectError instanceof Error ? aptosConnectError.message : String(aptosConnectError));
        throw new Error(`Aptos Connect transaction failed: ${aptosConnectError instanceof Error ? aptosConnectError.message : String(aptosConnectError)}`);
      }
      
      console.log('=== Transaction Response ===');
      console.log('Response type:', typeof response);
      console.log('Response is null:', response === null);
      console.log('Response is undefined:', response === undefined);
      console.log('Response:', response);

      // Handle different response formats
      let transactionHash: string;
      
      if (response === null || response === undefined) {
        throw new Error('Wallet returned null/undefined response');
      }
      
      if (typeof response === 'string') {
        transactionHash = response;
      } else if (typeof response === 'object') {
        if ('hash' in response && response.hash) {
          transactionHash = response.hash as string;
        } else if ('transactionHash' in response && response.transactionHash) {
          transactionHash = response.transactionHash as string;
        } else {
          console.error('Response object keys:', Object.keys(response));
          throw new Error('Response missing transaction hash');
        }
      } else {
        throw new Error(`Unexpected response type: ${typeof response}`);
      }

      console.log('=== Waiting for Transaction ===');
      console.log('Transaction hash:', transactionHash);
      
      if (!transactionHash || typeof transactionHash !== 'string') {
        throw new Error('Invalid transaction hash received');
      }
      
      // Wait for transaction confirmation
      await aptos.waitForTransaction({ transactionHash });
      return { success: true, hash: transactionHash };
      
    } catch (error) {
      console.error('=== Transaction Error ===');
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : undefined);
      console.error('Full error object:', error);
      
      // Return a more specific error message
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }

  // Deposit APT into escrow for a billing service
  static async deposit(
    signAndSubmitTransaction: any,
    senderAddress: string,
    billingId: number, 
    amount: number
  ): Promise<TransactionResult> {
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::deposit`,
        arguments: [billingId.toString(), amount.toString()],
        type_arguments: [],
      };

      const response = await signAndSubmitTransaction(payload);

      if (response && typeof response === 'object' && 'hash' in response) {
        const hash = response.hash as string;
        await aptos.waitForTransaction({ transactionHash: hash });
        return { success: true, hash };
      } else if (typeof response === 'string') {
        await aptos.waitForTransaction({ transactionHash: response });
        return { success: true, hash: response };
      } else {
        return { success: false, error: 'Invalid transaction response format' };
      }
    } catch (error) {
      console.error('Deposit error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Record usage (provider only)
  static async recordUsage(
    signAndSubmitTransaction: any,
    senderAddress: string,
    billingId: number, 
    userAddress: string, 
    units: number
  ): Promise<TransactionResult> {
    try {
      const response = await signAndSubmitTransaction({
        type: "entry_function_payload",
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::record_usage`,
        arguments: [billingId.toString(), userAddress, units.toString()],
        type_arguments: [],
      });

      if (response?.hash) {
        await aptos.waitForTransaction({ transactionHash: response.hash });
        return { success: true, hash: response.hash };
      } else {
        return { success: false, error: 'No transaction hash returned' };
      }
    } catch (error) {
      console.error('Record usage error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Terminate service and get refund
  static async terminateService(
    signAndSubmitTransaction: any,
    senderAddress: string,
    billingId: number
  ): Promise<TransactionResult> {
    try {
      const response = await signAndSubmitTransaction({
        type: "entry_function_payload",
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::terminate_service`,
        arguments: [billingId.toString()],
        type_arguments: [],
      });

      if (response?.hash) {
        await aptos.waitForTransaction({ transactionHash: response.hash });
        return { success: true, hash: response.hash };
      } else {
        return { success: false, error: 'No transaction hash returned' };
      }
    } catch (error) {
      console.error('Terminate service error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // View functions
  static async getProviderPrice(billingId: number): Promise<number> {
    try {
      const result = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::provider_price_per_unit`,
          functionArguments: [billingId],
        },
      });
      return Number(result[0]);
    } catch (error) {
      console.error('Get provider price error:', error);
      return 0;
    }
  }

  static async getUserBalance(billingId: number, userAddress: string): Promise<number> {
    try {
      const result = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::user_balance`,
          functionArguments: [billingId, userAddress],
        },
      });
      return Number(result[0]);
    } catch (error) {
      console.error('Get user balance error:', error);
      return 0;
    }
  }

  static async getUserUsageUnits(billingId: number, userAddress: string): Promise<number> {
    try {
      const result = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::user_usage_units`,
          functionArguments: [billingId, userAddress],
        },
      });
      return Number(result[0]);
    } catch (error) {
      console.error('Get user usage units error:', error);
      return 0;
    }
  }

  // Get APT balance
  static async getAptBalance(address: string): Promise<number> {
    try {
      const balance = await aptos.getAccountAPTAmount({ accountAddress: address });
      return balance;
    } catch (error) {
      console.error('Get APT balance error:', error);
      return 0;
    }
  }
}