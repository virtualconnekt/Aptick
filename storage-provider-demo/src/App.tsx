import React, { useState, useEffect } from 'react';
import { AptickClient } from 'aptick-sdk';
import { WalletConnect } from './components/WalletConnect';
import { DocumentUpload } from './components/DocumentUpload';
import { FileList } from './components/FileList';
import SERVICE_CONFIG from './config/serviceConfig';
import './App.css';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  cost: number;
  transactionHash?: string;
}

// Service Provider Configuration - Update in src/config/serviceConfig.ts
const PROVIDER_CONFIG = SERVICE_CONFIG;

function App() {
  const [aptickClient, setAptickClient] = useState<AptickClient | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [sdkStatus, setSdkStatus] = useState<string>('Initializing...');
  const [providerInfo, setProviderInfo] = useState<any>(null);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);

  // Initialize Aptick SDK
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const client = new AptickClient({
          network: PROVIDER_CONFIG.network,
          contractAddress: PROVIDER_CONFIG.contractAddress
        });
        
        // Initialize the SDK
        const initResult = await client.initialize();
        if (!initResult.success) {
          throw new Error(initResult.error);
        }
        
        setAptickClient(client);
        setSdkStatus('✅ SDK Ready');
        
        // Get provider information
        const providerResult = await client.getProvider(PROVIDER_CONFIG.billingId);
        if (providerResult.success) {
          setProviderInfo(providerResult.data);
        }
        
      } catch (error) {
        setSdkStatus(`❌ SDK Error: ${error}`);
        console.error('SDK initialization error:', error);
      }
    };

    initializeSDK();
  }, []);

  // Calculate total revenue from uploaded files
  useEffect(() => {
    const revenue = uploadedFiles.reduce((sum, file) => sum + file.cost, 0);
    setTotalRevenue(revenue);
  }, [uploadedFiles]);

  const handleWalletConnect = (address: string) => {
    setUserAddress(address);
  };

  const handleWalletDisconnect = () => {
    setUserAddress('');
    setUploadedFiles([]);
  };

  const handleUploadComplete = (file: UploadedFile) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  return (
    <div className="App" style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        borderBottom: '2px solid #007bff',
        paddingBottom: '20px'
      }}>
        <h1 style={{ color: '#007bff', margin: '0 0 10px 0' }}>
          🗃️ {PROVIDER_CONFIG.serviceName}
        </h1>
        <p style={{ color: '#666', margin: '0' }}>
          Powered by Aptick - Blockchain Storage with Automated Billing
        </p>
        <div style={{ 
          marginTop: '10px', 
          fontSize: '14px',
          color: sdkStatus.includes('✅') ? '#28a745' : '#dc3545'
        }}>
          SDK Status: {sdkStatus}
        </div>
      </header>

      <main>
        {/* Service Information */}
        <div style={{
          border: '1px solid #17a2b8',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          backgroundColor: '#f0f9ff'
        }}>
          <h2 style={{ margin: '0 0 15px 0', color: '#17a2b8' }}>
            📊 Service Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <strong>Billing ID:</strong> {PROVIDER_CONFIG.billingId}
            </div>
            <div>
              <strong>Price:</strong> {PROVIDER_CONFIG.pricePerMB} APT per MB
            </div>
            <div>
              <strong>Network:</strong> {PROVIDER_CONFIG.network}
            </div>
            <div>
              <strong>Files Stored:</strong> {uploadedFiles.length}
            </div>
            <div>
              <strong>Total Revenue:</strong> {totalRevenue.toFixed(4)} APT
            </div>
            {providerInfo && (
              <div>
                <strong>Provider Status:</strong> {providerInfo.active ? '🟢 Active' : '🔴 Inactive'}
              </div>
            )}
          </div>
        </div>

        {/* Wallet Connection */}
        <WalletConnect 
          onConnect={handleWalletConnect}
          onDisconnect={handleWalletDisconnect}
        />

        {userAddress && (
          <>
            {/* File Upload Section */}
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ marginBottom: '20px' }}>📤 Upload Files</h2>
              <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: '#fff'
              }}>
                <div style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
                  <strong>How it works:</strong>
                  <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    <li>Select or drag files to upload</li>
                    <li>Cost is automatically calculated based on file size</li>
                    <li>Usage is recorded on Aptick blockchain</li>
                    <li>Payment is deducted from user's escrow balance</li>
                  </ol>
                </div>
                <DocumentUpload
                  billingId={PROVIDER_CONFIG.billingId}
                  pricePerMB={PROVIDER_CONFIG.pricePerMB}
                  aptickClient={aptickClient}
                  userAddress={userAddress}
                  onUploadComplete={handleUploadComplete}
                />
              </div>
            </div>

            {/* File List */}
            {uploadedFiles.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ marginBottom: '20px' }}>📁 File History</h2>
                <FileList files={uploadedFiles} />
              </div>
            )}

            {/* Revenue Analytics */}
            {uploadedFiles.length > 0 && (
              <div style={{
                border: '1px solid #28a745',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#f8fff8'
              }}>
                <h2 style={{ margin: '0 0 15px 0', color: '#28a745' }}>
                  📈 Revenue Analytics
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                      {uploadedFiles.length}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Total Files</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                      {(uploadedFiles.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024)).toFixed(2)} MB
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Total Storage</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                      {totalRevenue.toFixed(4)} APT
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Total Revenue</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                      {uploadedFiles.length > 0 ? (totalRevenue / uploadedFiles.length).toFixed(4) : '0'} APT
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Avg per File</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Instructions */}
        {!userAddress && (
          <div style={{
            border: '1px solid #007bff',
            borderRadius: '8px',
            padding: '30px',
            backgroundColor: '#f0f8ff',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#007bff', marginBottom: '20px' }}>🚀 Welcome to Our Storage Service</h2>
            <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
              <p><strong>This is a live Aptick-powered storage service.</strong></p>
              <ol style={{ lineHeight: '1.8' }}>
                <li><strong>Connect your Aptos wallet</strong> to access the service</li>
                <li><strong>Ensure you have APT tokens</strong> in your wallet</li>
                <li><strong>Deposit APT to escrow</strong> for billing ID {PROVIDER_CONFIG.billingId}</li>
                <li><strong>Upload files</strong> and pay automatically via blockchain</li>
                <li><strong>Track your usage</strong> and remaining balance</li>
              </ol>
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: '#fff3cd', 
                border: '1px solid #ffeaa7',
                borderRadius: '4px'
              }}>
                <strong>⚠️ Important:</strong> Make sure you have deposited APT to escrow for billing ID <strong>{PROVIDER_CONFIG.billingId}</strong> before uploading files.
              </div>
            </div>
          </div>
        )}
      </main>

      <footer style={{
        marginTop: '40px',
        padding: '20px',
        borderTop: '1px solid #ddd',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        <p>Powered by Aptick SDK • Aptos Blockchain • Billing ID: {PROVIDER_CONFIG.billingId}</p>
        <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
          Contract: {PROVIDER_CONFIG.contractAddress}
        </p>
      </footer>
    </div>
  );
}

export default App;
