import { createAptickClient, AptickUtils } from 'aptick-sdk';
import express from 'express';
import cors from 'cors';

/**
 * API Gateway Service Integration Example
 * 
 * This example shows how to integrate Aptick SDK into an API service
 * where users pay per API request or per data usage.
 * 
 * Usage:
 * 1. Provider registers on Aptick with billing ID
 * 2. Users deposit APT into escrow
 * 3. Each API call deducts from user's balance
 */

interface APIConfig {
  billingId: number;
  network: 'devnet' | 'mainnet';
  costPerRequest: number; // Number of requests per unit
  minBalance: number; // Minimum balance in APT
}

const API_CONFIG: APIConfig = {
  billingId: 124, // Your billing ID from Aptick registration
  network: 'devnet',
  costPerRequest: 10, // 10 requests per unit
  minBalance: 0.001 // 0.001 APT minimum
};

class AptickAPIGateway {
  private client: any;
  private app: express.Application;
  private providerWallet: any; // Your provider wallet for signing transactions

  constructor(providerWallet: any) {
    this.providerWallet = providerWallet;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  async initialize() {
    this.client = createAptickClient({
      network: API_CONFIG.network
    });
    
    await this.client.initialize();
    console.log('Aptick API Gateway initialized');
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    
    // Custom middleware to check Aptick balance
    this.app.use('/api/v1', async (req, res, next) => {
      const userAddress = req.headers['x-user-address'] as string;
      
      if (!useAddress) {
        return res.status(401).json({
          error: 'Missing x-user-address header'
        });
      }

      try {
       const hasBalance = await this.checkUserBalance(userAddress);
        
        if (!hasBalance.sufficient) {
          return res.status(402).json({
            error: 'Insufficient balance',
            required: API_CONFIG.minBalance,
            current: hasBalance.current,
            billingId: API_CONFIG.billingId,
            depositUrl: `https://aptick.app/deposit/${API_CONFIG.billingId}`
          });
        }

        req.userAddress = userAddress;
        next();
      } catch (error) {
        console.error('Balance check error:', error);
        res.status(500).json({ error: 'Balance check failed' });
      }
    });
  }

  private setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', service: 'aptick-api-gateway' });
    });

    // Balance endpoint
    this.app.get('/balance/:userAddress', async (req, res) => {
      try {
        const { userAddress } = req.params;
        const balance = await this.getUserBalance(userAddress);
        res.json(balance);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Example API endpoints with billing
    this.app.get('/api/v1/data', async (req, res) => {
      try {
        await this.processRequest(req.userAddress, 'data_fetch');
        
        // Your actual API logic
        const data = await this.fetchData(req.query);
        
        res.json({
          success: true,
          data,
          charged: `${API_CONFIG.costPerRequest} requests`
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/v1/process', async (req, res) => {
      try {
        await this.processRequest(req.userAddress, 'data_process');
        
        // Your actual processing logic
        const result = await this.processData(req.body);
        
        res.json({
          success: true,
          result,
          charged: `${API_CONFIG.costPerRequest} requests`
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/v1/analytics/:timeframe', async (req, res) => {
      try {
        await this.processRequest(req.userAddress, 'analytics');
        
        // Your analytics logic
        const analytics = await this.getAnalytics(req.params.timeframe);
        
        res.json({
          success: true,
          analytics,
          charged: `${API_CONFIG.costPerRequest} requests`
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  private async checkUserBalance(userAddress: string) {
    const escrowResult = await this.client.getUserEscrow(
      API_CONFIG.billingId,
      userAddress
    );

    if (!escrowResult.success) {
      return { sufficient: false, current: 0 };
    }

    const balanceInAPT = AptickUtils.octasToApt(escrowResult.data.balance);
    
    return {
      sufficient: balanceInAPT >= API_CONFIG.minBalance,
      current: balanceInAPT
    };
  }

  private async getUserBalance(userAddress: string) {
    const escrowResult = await this.client.getUserEscrow(
      API_CONFIG.billingId,
      userAddress
    );

    if (!escrowResult.success) {
      return {
        balance: 0,
        usage: 0,
        error: escrowResult.error
      };
    }

    const balanceInAPT = AptickUtils.octasToApt(escrowResult.data.balance);
    const usageUnits = Number(escrowResult.data.usageUnits);

    return {
      balance: balanceInAPT,
      usage: usageUnits,
      costPerRequest: API_CONFIG.costPerRequest,
      billingId: API_CONFIG.billingId
    };
  }

  private async processRequest(userAddress: string, requestType: string) {
    try {
      const result = await this.client.recordUsage(
        this.providerWallet.signAndSubmitTransaction,
        API_CONFIG.billingId,
        userAddress,
        API_CONFIG.costPerRequest
      );

      if (!result.success) {
        throw new Error(`Billing failed: ${result.error}`);
      }

      console.log(`Processed ${requestType} for ${userAddress}, charged ${API_CONFIG.costPerRequest} requests`);
      return result;
    } catch (error) {
      console.error('Billing error:', error);
      throw new Error('Payment processing failed');
    }
  }

  // Mock API functions - replace with your actual implementation
  private async fetchData(query: any) {
    // Simulate data fetching
    await this.delay(500);
    return {
      timestamp: new Date().toISOString(),
      query,
      results: [
        { id: 1, name: 'Sample Data 1', value: Math.random() },
        { id: 2, name: 'Sample Data 2', value: Math.random() },
        { id: 3, name: 'Sample Data 3', value: Math.random() }
      ]
    };
  }

  private async processData(data: any) {
    // Simulate data processing
    await this.delay(1000);
    return {
      processed: true,
      input: data,
      output: {
        processed_at: new Date().toISOString(),
        result: 'Data processed successfully',
        hash: Math.random().toString(36).substring(7)
      }
    };
  }

  private async getAnalytics(timeframe: string) {
    // Simulate analytics generation
    await this.delay(750);
    return {
      timeframe,
      metrics: {
        requests: Math.floor(Math.random() * 1000),
        users: Math.floor(Math.random() * 100),
        revenue: Math.random() * 10,
        avg_response_time: Math.random() * 500
      },
      generated_at: new Date().toISOString()
    };
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  start(port: number = 3001) {
    this.app.listen(port, () => {
      console.log(`Aptick API Gateway running on port ${port}`);
      console.log(`Health check: http://localhost:${port}/health`);
      console.log(`API endpoints: http://localhost:${port}/api/v1/*`);
    });
  }
}

// Usage example
export async function startAPIGateway() {
  // You need to provide your provider wallet here
  // This should be the same wallet used to register the provider
  const providerWallet = {
    signAndSubmitTransaction: async (transaction: any) => {
      // Implement your wallet signing logic
      // This could be a hardware wallet, private key, or other signing method
      throw new Error('Provider wallet signing not implemented');
    }
  };

  const gateway = new AptickAPIGateway(providerWallet);
  await gateway.initialize();
  gateway.start(3001);
}

// Client-side usage example
export const createAPIClient = (userAddress: string) => {
  const baseURL = 'http://localhost:3001';
  
  return {
    async checkBalance() {
      const response = await fetch(`${baseURL}/balance/${userAddress}`);
      return await response.json();
    },

    async fetchData(query: any) {
      const response = await fetch(`${baseURL}/api/v1/data?${new URLSearchParams(query)}`, {
        headers: {
          'x-user-address': userAddress
        }
      });
      return await response.json();
    },

    async processData(data: any) {
      const response = await fetch(`${baseURL}/api/v1/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-address': userAddress
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    },

    async getAnalytics(timeframe: string) {
      const response = await fetch(`${baseURL}/api/v1/analytics/${timeframe}`, {
        headers: {
          'x-user-address': userAddress
        }
      });
      return await response.json();
    }
  };
};

export default AptickAPIGateway;

// Example usage:
// const client = createAPIClient('0x123...');
// const data = await client.fetchData({ limit: 10, filter: 'active' });