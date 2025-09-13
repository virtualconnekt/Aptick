import React, { useState } from 'react';

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  onConnect,
  onDisconnect
}) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [address, setAddress] = useState<string>('');

  // Simulate wallet connection - In real implementation, use @aptos-labs/wallet-adapter-react
  const handleConnect = async () => {
    setConnecting(true);
    
    try {
      // Simulate wallet connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a realistic looking address for demo
      const simulatedAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      
      setAddress(simulatedAddress);
      setConnected(true);
      onConnect?.(simulatedAddress);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAddress('');
    setConnected(false);
    onDisconnect?.();
  };

  return (
    <div className="wallet-connect" style={{
      padding: '20px',
      border: '2px solid #007bff',
      borderRadius: '10px',
      backgroundColor: connected ? '#e7f3ff' : '#f8f9fa',
      marginBottom: '25px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#007bff' }}>🔗 Wallet Connection</h3>
      
      {!connected ? (
        <div>
          <p style={{ margin: '0 0 15px 0', color: '#666' }}>
            Connect your Aptos wallet to use this storage service. Make sure you have:
          </p>
          <ul style={{ margin: '0 0 20px 20px', color: '#666', fontSize: '14px' }}>
            <li>An Aptos wallet installed (Petra, Martian, etc.)</li>
            <li>APT tokens in your wallet</li>
            <li>APT deposited to escrow for billing</li>
          </ul>
          
          <button
            onClick={handleConnect}
            disabled={connecting}
            style={{
              backgroundColor: connecting ? '#6c757d' : '#007bff',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: connecting ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {connecting ? '🔄 Connecting...' : '🔌 Connect Wallet'}
          </button>
          
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            <strong>🚨 Demo Mode:</strong> This is simulating wallet connection. In production, this would connect to your actual Aptos wallet.
          </div>
        </div>
      ) : (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '15px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>✅</span>
              <span style={{ fontWeight: 'bold', color: '#28a745' }}>Wallet Connected</span>
            </div>
            <button
              onClick={handleDisconnect}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Disconnect
            </button>
          </div>
          
          <div style={{
            backgroundColor: '#ffffff',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #dee2e6'
          }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
              <strong>Connected Address:</strong>
            </div>
            <div style={{ 
              fontFamily: 'monospace',
              fontSize: '14px',
              wordBreak: 'break-all',
              color: '#495057',
              backgroundColor: '#f8f9fa',
              padding: '8px',
              borderRadius: '4px'
            }}>
              {address}
            </div>
          </div>
          
          <div style={{
            marginTop: '15px',
            fontSize: '12px',
            color: '#666'
          }}>
            📝 <strong>Next step:</strong> Make sure you have deposited APT to escrow for this service before uploading files.
          </div>
        </div>
      )}
    </div>
  );
};