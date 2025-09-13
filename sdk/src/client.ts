import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { 
  AptickConfig, 
  Provider, 
  UserEscrow, 
  BillingSession, 
  AptickResult, 
  TransactionOptions,
  WalletSignAndSubmitFunction,
  Address,
  BillingId,
  AptAmount
} from './types';
import { AptickUtils } from './utils';

/**
 * Main Aptick SDK Client
 */
export class AptickClient {
  private aptos: Aptos;
  private config: Required<AptickConfig>;
  private isInitialized: boolean = false;

  constructor(config: AptickConfig) {
    // Set default values
    this.config = {
      network: config.network,
      contractAddress: config.contractAddress || this.getDefaultContractAddress(config.network),
      moduleAccount: config.moduleAccount || 'billing',
      rpcUrl: config.rpcUrl || AptickUtils.getDefaultRpcUrl(config.network)
    };

    // Validate configuration
    if (!AptickUtils.validateNetwork(this.config.network)) {
      throw new Error(`Invalid network: ${this.config.network}`);
    }

    // Initialize Aptos client
    const aptosConfig = new AptosConfig({ 
      network: this.config.network as Network,
      fullnode: this.config.rpcUrl 
    });
    this.aptos = new Aptos(aptosConfig);
  }

  /**
   * Initialize the SDK - checks contract deployment and connectivity
   */
  async initialize(): Promise<AptickResult<boolean>> {
    try {
      // Check if contract is deployed and initialized
      const isDeployed = await this.isContractDeployed();
      
      if (!isDeployed) {
        return {
          success: false,
          error: 'Aptick contract is not deployed or initialized on this network'
        };
      }

      this.isInitialized = true;
      return { success: true, data: true };
    } catch (error) {
      return {
        success: false,
        error: AptickUtils.parseTransactionError(error)
      };
    }
  }

  /**
   * Register as a service provider
   */
  async registerProvider(
    walletSignFn: WalletSignAndSubmitFunction,
    pricePerUnit: number,
    unit: string,
    options?: TransactionOptions
  ): Promise<AptickResult<BillingId>> {
    try {
      this.ensureInitialized();

      // Validate parameters
      const validation = AptickUtils.validateBillingParams(pricePerUnit, unit);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const priceInOctas = AptickUtils.aptToOctas(pricePerUnit);

      const transaction = {
        data: {
          function: `${this.config.contractAddress}::${this.config.moduleAccount}::register_provider`,
          typeArguments: [],
          functionArguments: [priceInOctas.toString(), unit]
        },
        options: this.buildTransactionOptions(options)
      };

      const response = await walletSignFn(transaction);
      const hash = this.extractTransactionHash(response);

      // Wait for confirmation
      await this.aptos.waitForTransaction({ transactionHash: hash });

      // Get the billing ID from transaction events
      const billingId = await this.getBillingIdFromTransaction(hash);

      return {
        success: true,
        data: billingId,
        transactionHash: hash
      };
    } catch (error) {
      return {
        success: false,
        error: AptickUtils.parseTransactionError(error)
      };
    }
  }

  /**
   * Deposit APT into escrow for a billing service
   */
  async deposit(
    walletSignFn: WalletSignAndSubmitFunction,
    billingId: BillingId,
    aptAmount: number,
    options?: TransactionOptions
  ): Promise<AptickResult<string>> {
    try {
      this.ensureInitialized();

      if (aptAmount <= 0) {
        return { success: false, error: 'Deposit amount must be positive' };
      }

      const amountInOctas = AptickUtils.aptToOctas(aptAmount);

      const transaction = {
        data: {
          function: `${this.config.contractAddress}::${this.config.moduleAccount}::deposit`,
          typeArguments: [],
          functionArguments: [billingId.toString(), amountInOctas.toString()]
        },
        options: this.buildTransactionOptions(options)
      };

      const response = await walletSignFn(transaction);
      const hash = this.extractTransactionHash(response);

      await this.aptos.waitForTransaction({ transactionHash: hash });

      return {
        success: true,
        data: hash,
        transactionHash: hash
      };
    } catch (error) {
      return {
        success: false,
        error: AptickUtils.parseTransactionError(error)
      };
    }
  }

  /**
   * Record usage (provider only)
   */
  async recordUsage(
    walletSignFn: WalletSignAndSubmitFunction,
    billingId: BillingId,
    userAddress: Address,
    units: number,
    options?: TransactionOptions
  ): Promise<AptickResult<string>> {
    try {
      this.ensureInitialized();

      if (units <= 0) {
        return { success: false, error: 'Usage units must be positive' };
      }

      if (!AptickUtils.isValidAddress(userAddress)) {
        return { success: false, error: 'Invalid user address format' };
      }

      const transaction = {
        data: {
          function: `${this.config.contractAddress}::${this.config.moduleAccount}::record_usage`,
          typeArguments: [],
          functionArguments: [
            billingId.toString(), 
            AptickUtils.normalizeAddress(userAddress), 
            units.toString()
          ]
        },
        options: this.buildTransactionOptions(options)
      };

      const response = await walletSignFn(transaction);
      const hash = this.extractTransactionHash(response);

      await this.aptos.waitForTransaction({ transactionHash: hash });

      return {
        success: true,
        data: hash,
        transactionHash: hash
      };
    } catch (error) {
      return {
        success: false,
        error: AptickUtils.parseTransactionError(error)
      };
    }
  }

  /**
   * Terminate service and get refund
   */
  async terminateService(
    walletSignFn: WalletSignAndSubmitFunction,
    billingId: BillingId,
    options?: TransactionOptions
  ): Promise<AptickResult<string>> {
    try {
      this.ensureInitialized();

      const transaction = {
        data: {
          function: `${this.config.contractAddress}::${this.config.moduleAccount}::terminate_service`,
          typeArguments: [],
          functionArguments: [billingId.toString()]
        },
        options: this.buildTransactionOptions(options)
      };

      const response = await walletSignFn(transaction);
      const hash = this.extractTransactionHash(response);

      await this.aptos.waitForTransaction({ transactionHash: hash });

      return {
        success: true,
        data: hash,
        transactionHash: hash
      };
    } catch (error) {
      return {
        success: false,
        error: AptickUtils.parseTransactionError(error)
      };
    }
  }

  /**
   * Get provider information
   */
  async getProvider(billingId: BillingId): Promise<AptickResult<Provider>> {
    try {
      this.ensureInitialized();

      const [priceResult, addressResult, unitResult, activeResult, revenueResult] = await Promise.all([
        this.aptos.view({
          payload: {
            function: `${this.config.contractAddress}::${this.config.moduleAccount}::provider_price_per_unit`,
            functionArguments: [billingId.toString()]
          }
        }),
        this.aptos.view({
          payload: {
            function: `${this.config.contractAddress}::${this.config.moduleAccount}::provider_addr`,
            functionArguments: [billingId.toString()]
          }
        }),
        this.getProviderUnit(billingId),
        this.getProviderActive(billingId), 
        this.getProviderRevenue(billingId)
      ]);

      const provider: Provider = {
        providerId: billingId,
        providerAddress: addressResult[0] as string,
        pricePerUnit: BigInt(priceResult[0] as string),
        unit: unitResult.success ? unitResult.data! : 'Unknown',
        active: activeResult.success ? activeResult.data! : true,
        totalRevenue: revenueResult.success ? revenueResult.data! : BigInt(0)
      };

      return {
        success: true,
        data: provider
      };
    } catch (error) {
      return {
        success: false,
        error: AptickUtils.parseTransactionError(error)
      };
    }
  }

  /**
   * Get user's escrow balance and usage
   */
  async getUserEscrow(billingId: BillingId, userAddress: Address): Promise<AptickResult<UserEscrow>> {
    try {
      this.ensureInitialized();

      if (!AptickUtils.isValidAddress(userAddress)) {
        return { success: false, error: 'Invalid user address format' };
      }

      const normalizedAddress = AptickUtils.normalizeAddress(userAddress);

      const [balanceResult, usageResult] = await Promise.all([
        this.aptos.view({
          payload: {
            function: `${this.config.contractAddress}::${this.config.moduleAccount}::user_balance`,
            functionArguments: [billingId.toString(), normalizedAddress]
          }
        }),
        this.aptos.view({
          payload: {
            function: `${this.config.contractAddress}::${this.config.moduleAccount}::user_usage_units`,
            functionArguments: [billingId.toString(), normalizedAddress]
          }
        })
      ]);

      const escrow: UserEscrow = {
        balance: BigInt(balanceResult[0] as string),
        usageUnits: BigInt(usageResult[0] as string)
      };

      return {
        success: true,
        data: escrow
      };
    } catch (error) {
      return {
        success: false,
        error: AptickUtils.parseTransactionError(error)
      };
    }
  }

  /**
   * Get user's APT balance
   */
  async getAptBalance(address: Address): Promise<AptickResult<AptAmount>> {
    try {
      if (!AptickUtils.isValidAddress(address)) {
        return { success: false, error: 'Invalid address format' };
      }

      const balance = await this.aptos.getAccountAPTAmount({ 
        accountAddress: AptickUtils.normalizeAddress(address) 
      });

      return {
        success: true,
        data: BigInt(balance)
      };
    } catch (error) {
      return {
        success: false,
        error: AptickUtils.parseTransactionError(error)
      };
    }
  }

  /**
   * Get complete billing session information
   */
  async getBillingSession(billingId: BillingId, userAddress: Address): Promise<AptickResult<BillingSession>> {
    try {
      const [providerResult, escrowResult] = await Promise.all([
        this.getProvider(billingId),
        this.getUserEscrow(billingId, userAddress)
      ]);

      if (!providerResult.success) {
        return { success: false, error: providerResult.error };
      }

      if (!escrowResult.success) {
        return { success: false, error: escrowResult.error };
      }

      const session: BillingSession = {
        billingId,
        provider: providerResult.data!,
        userAddress: AptickUtils.normalizeAddress(userAddress),
        escrow: escrowResult.data!
      };

      return {
        success: true,
        data: session
      };
    } catch (error) {
      return {
        success: false,
        error: AptickUtils.parseTransactionError(error)
      };
    }
  }

  // Private helper methods
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('AptickClient not initialized. Call initialize() first.');
    }
  }

  private async isContractDeployed(): Promise<boolean> {
    try {
      await this.aptos.getAccountResource({
        accountAddress: this.config.contractAddress,
        resourceType: `${this.config.contractAddress}::${this.config.moduleAccount}::Aptick`
      });
      return true;
    } catch {
      return false;
    }
  }

  private extractTransactionHash(response: any): string {
    if (typeof response === 'string') {
      return response;
    }
    
    if (response?.hash) {
      return response.hash;
    }
    
    if (response?.transactionHash) {
      return response.transactionHash;
    }
    
    throw new Error('No transaction hash found in wallet response');
  }

  private buildTransactionOptions(options?: TransactionOptions) {
    return {
      maxGasAmount: options?.maxGasAmount || 10000,
      gasUnitPrice: options?.gasUnitPrice || 100,
      timeoutSecs: options?.timeoutSecs || 30,
      ...options
    };
  }

  private async getBillingIdFromTransaction(hash: string): Promise<BillingId> {
    try {
      // Wait a bit for the transaction to be processed
      await AptickUtils.sleep(1000);
      
      // Query the current next_billing_id from the contract
      // Since the contract increments next_billing_id after registration,
      // the billing ID assigned to the provider is (current_next_billing_id - 1)
      const aptickResource = await this.aptos.getAccountResource({
        accountAddress: this.config.contractAddress,
        resourceType: `${this.config.contractAddress}::${this.config.moduleAccount}::Aptick`
      });
      
      const nextBillingId = (aptickResource.data as any).next_billing_id;
      const assignedBillingId = parseInt(nextBillingId) - 1;
      
      console.log('Current next_billing_id:', nextBillingId);
      console.log('Assigned billing_id:', assignedBillingId);
      
      return assignedBillingId;
    } catch (error) {
      console.warn('Error getting billing ID from contract state:', error);
      // Fallback: try to extract from transaction events
      try {
        const txn = await this.aptos.getTransactionByHash({ transactionHash: hash });
        
        if ('events' in txn && txn.events) {
          // Look for any event that might contain billing ID
          for (const event of txn.events) {
            if ('data' in event) {
              const eventData = event.data as any;
              if (eventData && (eventData.billing_id || eventData.id)) {
                return parseInt(eventData.billing_id || eventData.id);
              }
            }
          }
        }
      } catch (eventError) {
        console.warn('Error parsing transaction events:', eventError);
      }
      
      // Final fallback: return 1 (first provider)
      console.warn('Could not determine billing ID, using fallback value 1');
      return 1;
    }
  }

  private getDefaultContractAddress(network: string): string {
    switch (network.toLowerCase()) {
      case 'mainnet':
        return '0x72780903f4ca64d29bf9fcd1be4b863190d76d25cc5efd176ee4b119732419c1'; // Use devnet address as placeholder
      case 'testnet':
        return '0x72780903f4ca64d29bf9fcd1be4b863190d76d25cc5efd176ee4b119732419c1'; // Use devnet address as placeholder
      case 'devnet':
        return '0x72780903f4ca64d29bf9fcd1be4b863190d76d25cc5efd176ee4b119732419c1'; // Your actual deployment
      case 'local':
        return '0x72780903f4ca64d29bf9fcd1be4b863190d76d25cc5efd176ee4b119732419c1'; // Use devnet address as placeholder
      default:
        throw new Error(`No default contract address for network: ${network}`);
    }
  }

  /**
   * Get provider unit by reading the full provider struct from contract state
   */
  private async getProviderUnit(billingId: BillingId): Promise<AptickResult<string>> {
    try {
      const aptickResource = await this.aptos.getAccountResource({
        accountAddress: this.config.contractAddress,
        resourceType: `${this.config.contractAddress}::${this.config.moduleAccount}::Aptick`
      });
      
      const resourceData = aptickResource.data as any;
      const providersHandle = resourceData.providers.handle;
      
      const provider = await this.aptos.getTableItem({
        handle: providersHandle,
        data: {
          key_type: 'u64',
          value_type: `${this.config.contractAddress}::${this.config.moduleAccount}::Provider`,
          key: billingId.toString()
        }
      }) as any;
      
      return {
        success: true,
        data: provider.unit as string
      };
    } catch (error) {
      return {
        success: false,
        error: 'Could not retrieve provider unit'
      };
    }
  }

  /**
   * Get provider active status by reading the full provider struct
   */
  private async getProviderActive(billingId: BillingId): Promise<AptickResult<boolean>> {
    try {
      const aptickResource = await this.aptos.getAccountResource({
        accountAddress: this.config.contractAddress,
        resourceType: `${this.config.contractAddress}::${this.config.moduleAccount}::Aptick`
      });
      
      const resourceData = aptickResource.data as any;
      const providersHandle = resourceData.providers.handle;
      
      const provider = await this.aptos.getTableItem({
        handle: providersHandle,
        data: {
          key_type: 'u64',
          value_type: `${this.config.contractAddress}::${this.config.moduleAccount}::Provider`,
          key: billingId.toString()
        }
      }) as any;
      
      return {
        success: true,
        data: provider.active as boolean
      };
    } catch (error) {
      return {
        success: false,
        error: 'Could not retrieve provider active status'
      };
    }
  }

  /**
   * Get provider total revenue by reading the full provider struct
   */
  private async getProviderRevenue(billingId: BillingId): Promise<AptickResult<bigint>> {
    try {
      const aptickResource = await this.aptos.getAccountResource({
        accountAddress: this.config.contractAddress,
        resourceType: `${this.config.contractAddress}::${this.config.moduleAccount}::Aptick`
      });
      
      const resourceData = aptickResource.data as any;
      const providersHandle = resourceData.providers.handle;
      
      const provider = await this.aptos.getTableItem({
        handle: providersHandle,
        data: {
          key_type: 'u64',
          value_type: `${this.config.contractAddress}::${this.config.moduleAccount}::Provider`,
          key: billingId.toString()
        }
      }) as any;
      
      return {
        success: true,
        data: BigInt(provider.total_revenue as string)
      };
    } catch (error) {
      return {
        success: false,
        error: 'Could not retrieve provider revenue'
      };
    }
  }

  /**
   * Get deposit URL for this client's network and billing ID
   */
  getDepositUrl(billingId: BillingId): string {
    return AptickUtils.getDepositUrl(billingId, this.config.network);
  }

  /**
   * Get provider registration URL for this client's network
   */
  getProviderRegistrationUrl(): string {
    return AptickUtils.getProviderRegistrationUrl(this.config.network);
  }

  /**
   * Get base application URL for this client's network
   */
  getBaseUrl(): string {
    return this.config.network === 'devnet' ? 'http://localhost:3000' : 'https://aptick.app';
  }
}