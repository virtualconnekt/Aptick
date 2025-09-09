// Example: How the current frontend would use the new SDK

import { createAptickClient, AptickUtils } from '@aptick/sdk';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useState, useEffect } from 'react';

const client = createAptickClient({
  network: 'devnet',
  contractAddress: '0x72780903f4ca64d29bf9fcd1be4b863190d76d25cc5efd176ee4b119732419c1'
});

export default function ProviderRegistration() {
  const { signAndSubmitTransaction, connected, account } = useWallet();
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [unit, setUnit] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [balance, setBalance] = useState<bigint>(0n);

  // Initialize SDK and load balance
  useEffect(() => {
    const init = async () => {
      await client.initialize();
      
      if (account?.address) {
        const balanceResult = await client.getAptBalance(account.address);
        if (balanceResult.success) {
          setBalance(balanceResult.data!);
        }
      }
    };
    
    init();
  }, [account]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !signAndSubmitTransaction) {
      setResult('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      // Validate inputs using SDK utilities
      const validation = AptickUtils.validateBillingParams(
        parseFloat(pricePerUnit), 
        unit
      );
      
      if (!validation.valid) {
        setResult(`Validation error: ${validation.error}`);
        return;
      }

      // Register provider using SDK
      const registerResult = await client.registerProvider(
        signAndSubmitTransaction,
        parseFloat(pricePerUnit),
        unit
      );

      if (registerResult.success) {
        setResult(`Success! 
          Billing ID: ${registerResult.data}
          Transaction: ${registerResult.transactionHash}
          You can now accept payments for ${unit} at ${pricePerUnit} APT per unit.
        `);
        
        // Reset form
        setPricePerUnit('');
        setUnit('');
        
        // Refresh balance
        if (account?.address) {
          const balanceResult = await client.getAptBalance(account.address);
          if (balanceResult.success) {
            setBalance(balanceResult.data!);
          }
        }
      } else {
        setResult(`Registration failed: ${registerResult.error}`);
      }

    } catch (error) {
      setResult(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Register as Provider</h2>
      
      {/* Balance Display */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">
          Wallet Balance: {AptickUtils.formatApt(balance)}
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price per Unit (APT)
          </label>
          <input
            type="number"
            step="0.000001"
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="0.001"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Price in APT that users will pay per unit of service
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit Type
          </label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select unit type</option>
            <option value="GB">Gigabyte (GB)</option>
            <option value="MB">Megabyte (MB)</option>
            <option value="TB">Terabyte (TB)</option>
            <option value="Hours">Hours</option>
            <option value="Requests">API Requests</option>
            <option value="Transactions">Transactions</option>
            <option value="Users">Active Users</option>
            <option value="Custom">Custom Unit</option>
          </select>
        </div>

        {unit === 'Custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Unit Name
            </label>
            <input
              type="text"
              onChange={(e) => setUnit(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., Files, Queries, etc."
              required
            />
          </div>
        )}

        {/* Cost Preview */}
        {pricePerUnit && unit && (
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-sm text-blue-800">
              <strong>Preview:</strong> Users will pay {pricePerUnit} APT per {unit}
              <br />
              <span className="text-xs">
                ({AptickUtils.formatApt(AptickUtils.aptToOctas(parseFloat(pricePerUnit || '0')))} per {unit})
              </span>
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={!connected || isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Registering...' : 'Register Provider'}
        </button>
      </form>

      {result && (
        <div className={`mt-4 p-3 rounded-md ${
          result.includes('Success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}

      {!connected && (
        <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md">
          <p className="text-sm">Please connect your Aptos wallet to continue.</p>
        </div>
      )}
    </div>
  );
}