import React, { useState } from 'react';
import { AptickClient } from 'aptick-sdk';

interface ProviderRegistrationProps {
  aptickClient: AptickClient | null;
  userAddress?: string;
  onRegistrationComplete?: (providerId: number) => void;
}

export const ProviderRegistration: React.FC<ProviderRegistrationProps> = ({
  aptickClient,
  userAddress,
  onRegistrationComplete
}) => {
  const [serviceName, setServiceName] = useState('File Storage Service');
  const [pricePerUnit, setPricePerUnit] = useState('0.1');
  const [registering, setRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<string>('');
  const [providerId, setProviderId] = useState<number | null>(null);

  const handleRegisterProvider = async () => {
    if (!aptickClient) {
      setRegistrationStatus('❌ Aptick SDK not initialized');
      return;
    }

    if (!userAddress) {
      setRegistrationStatus('❌ Please connect your wallet first');
      return;
    }

    if (!serviceName.trim()) {
      setRegistrationStatus('❌ Please enter a service name');
      return;
    }

    const price = parseFloat(pricePerUnit);
    if (isNaN(price) || price <= 0) {
      setRegistrationStatus('❌ Please enter a valid price');
      return;
    }

    setRegistering(true);
    setRegistrationStatus('🔄 Registering provider...');

    try {
      // Create a mock wallet sign function for demo
      const mockWalletSign = async (transaction: any) => {
        // In a real app, this would be the actual wallet.signAndSubmitTransaction
        console.log('Mock registration transaction:', transaction);
        // Simulate transaction response
        return {
          hash: `0x${Math.random().toString(16).substr(2, 64)}`
        };
      };

      // Register provider with unit as 'MB'
      const result = await aptickClient.registerProvider(
        mockWalletSign,
        price,
        'MB'
      );

      if (result.success) {
        // Get the provider ID from the result or simulate one
        const newProviderId = result.data || (Date.now() % 10000);
        
        setProviderId(newProviderId);
        setRegistrationStatus(`✅ Provider registered successfully! Provider ID: ${newProviderId}`);
        
        onRegistrationComplete?.(newProviderId);
      } else {
        setRegistrationStatus(`❌ Registration failed: ${result.error}`);
      }

    } catch (error) {
      setRegistrationStatus(`❌ Registration failed: ${error}`);
      console.error('Registration error:', error);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="provider-registration" style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '20px', 
      margin: '20px 0',
      backgroundColor: '#fff'
    }}>
      <h2 style={{ marginBottom: '20px' }}>🏪 Provider Registration</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Service Name:
        </label>
        <input
          type="text"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          placeholder="Enter your service name"
          disabled={registering}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Price per MB (APT):
        </label>
        <input
          type="number"
          value={pricePerUnit}
          onChange={(e) => setPricePerUnit(e.target.value)}
          placeholder="0.1"
          step="0.01"
          min="0"
          disabled={registering}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
        <small style={{ color: '#666' }}>
          This will be charged for each MB of storage used
        </small>
      </div>

      <button
        onClick={handleRegisterProvider}
        disabled={registering || !userAddress}
        style={{
          backgroundColor: registering ? '#ccc' : '#28a745',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '4px',
          cursor: registering ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        {registering ? '🔄 Registering...' : '📝 Register as Provider'}
      </button>

      {registrationStatus && (
        <div
          style={{
            marginTop: '15px',
            padding: '10px',
            borderRadius: '4px',
            backgroundColor: registrationStatus.includes('❌') ? '#ffe6e6' : '#e6ffe6',
            color: registrationStatus.includes('❌') ? '#d00' : '#006600',
            border: `1px solid ${registrationStatus.includes('❌') ? '#ffcccc' : '#ccffcc'}`
          }}
        >
          {registrationStatus}
        </div>
      )}

      {providerId && (
        <div style={{
          marginTop: '15px',
          padding: '15px',
          backgroundColor: '#f0f8ff',
          border: '1px solid #b3d9ff',
          borderRadius: '4px'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>🎉 Registration Complete!</h4>
          <p style={{ margin: '0' }}>
            <strong>Provider ID:</strong> {providerId}<br/>
            <strong>Service:</strong> {serviceName}<br/>
            <strong>Price:</strong> {pricePerUnit} APT per MB
          </p>
        </div>
      )}
    </div>
  );
};