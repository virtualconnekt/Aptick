import React, { useState, useCallback } from 'react';
import { AptickClient } from 'aptick-sdk';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  cost: number;
  transactionHash?: string;
}

interface DocumentUploadProps {
  billingId: number;
  pricePerMB: number;
  aptickClient: AptickClient | null;
  userAddress?: string;
  onUploadComplete?: (file: UploadedFile) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  billingId,
  pricePerMB,
  aptickClient,
  userAddress,
  onUploadComplete
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [escrowBalance, setEscrowBalance] = useState<number | null>(null);

  // Check user balances
  const checkBalances = useCallback(async () => {
    if (!aptickClient || !userAddress) return;

    try {
      // Get user's APT balance
      const aptBalanceResult = await aptickClient.getAptBalance(userAddress);
      if (aptBalanceResult.success) {
        // Convert BigInt octas to APT (number)
        const balanceInOctas = Number(aptBalanceResult.data!);
        setUserBalance(balanceInOctas / 100_000_000);
      }

      // Get user's escrow balance for this service
      const escrowResult = await aptickClient.getUserEscrow(billingId, userAddress);
      if (escrowResult.success) {
        // Convert BigInt octas to APT (number)
        const escrowInOctas = Number(escrowResult.data!.balance);
        setEscrowBalance(escrowInOctas / 100_000_000);
      }
    } catch (error) {
      console.error('Error checking balances:', error);
    }
  }, [aptickClient, userAddress, billingId]);

  // Check balances when component loads or user changes
  React.useEffect(() => {
    checkBalances();
  }, [checkBalances]);

  const calculateCost = (fileSizeInBytes: number): number => {
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
    return Math.ceil(fileSizeInMB * pricePerMB * 10000) / 10000; // Round up to 4 decimals
  };

  const simulateFileUpload = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        setUploadProgress(Math.min(progress, 90));
        
        if (progress >= 90) {
          clearInterval(interval);
          setUploadProgress(90);
          // Simulate getting a file ID from storage service
          resolve(`file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
        }
      }, 200);
    });
  };

  // Get wallet sign function (this would come from wallet adapter in real implementation)
  const getWalletSignFunction = () => {
    // In a real implementation, this would be from @aptos-labs/wallet-adapter-react
    // For now, we'll simulate the wallet transaction
    return async (transaction: any) => {
      console.log('🔗 Transaction to be signed:', transaction);
      
      // In a real app, this would trigger the user's wallet to sign the transaction
      // For demonstration, we'll simulate this
      const simulatedResponse = {
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        success: true
      };
      
      // Add a small delay to simulate wallet confirmation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return simulatedResponse;
    };
  };

  const processFileUpload = useCallback(async (file: File) => {
    if (!aptickClient) {
      setUploadStatus('❌ Aptick SDK not initialized');
      return;
    }

    if (!userAddress) {
      setUploadStatus('❌ Please connect your wallet first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('📁 Calculating cost and checking balances...');

    try {
      // Calculate file cost
      const cost = calculateCost(file.size);
      const fileSizeMB = file.size / (1024 * 1024);
      
      setUploadStatus(`💰 File: ${file.name} (${fileSizeMB.toFixed(2)} MB) - Cost: ${cost} APT`);
      
      // Check if user has sufficient escrow balance
      await checkBalances();
      
      if (escrowBalance !== null && escrowBalance < cost) {
        setUploadStatus(`❌ Insufficient escrow balance. You have ${escrowBalance.toFixed(4)} APT, but need ${cost} APT. Please deposit more APT to escrow for billing ID ${billingId}.`);
        setUploading(false);
        return;
      }

      // Simulate file upload to storage
      setUploadStatus('⬆️ Uploading file to storage...');
      const fileId = await simulateFileUpload(file);

      // Record usage with Aptick blockchain
      setUploadStatus('⛓️ Recording usage on Aptick blockchain...');
      setUploadProgress(95);

      // Get wallet sign function
      const walletSignFn = getWalletSignFunction();

      // Record the usage on blockchain
      const result = await aptickClient.recordUsage(
        walletSignFn,
        billingId,
        userAddress,
        fileSizeMB // Usage in MB
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to record usage on blockchain');
      }

      setUploadProgress(100);
      setUploadStatus('✅ Upload complete! File stored and payment processed on blockchain.');

      // Create uploaded file record
      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(),
        cost: cost,
        transactionHash: result.transactionHash || result.data
      };

      onUploadComplete?.(uploadedFile);
      
      // Refresh balances after transaction
      setTimeout(checkBalances, 2000);

    } catch (error) {
      setUploadStatus(`❌ Upload failed: ${error}`);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setTimeout(() => {
        if (!uploadStatus.includes('❌')) {
          setUploadProgress(0);
          setUploadStatus('');
        }
      }, 5000);
    }
  }, [aptickClient, userAddress, billingId, escrowBalance, checkBalances, onUploadComplete, uploadStatus]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFileUpload(e.dataTransfer.files[0]);
    }
  }, [processFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFileUpload(e.target.files[0]);
    }
  }, [processFileUpload]);

  return (
    <div className="document-upload">
      {/* Balance Information */}
      {userAddress && (
        <div style={{
          border: '1px solid #17a2b8',
          borderRadius: '6px',
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: '#f0f9ff'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#17a2b8' }}>💰 Your Balance</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', fontSize: '14px' }}>
            <div>
              <strong>APT Balance:</strong> {userBalance !== null ? `${userBalance.toFixed(4)} APT` : 'Loading...'}
            </div>
            <div>
              <strong>Escrow Balance:</strong> {escrowBalance !== null ? `${escrowBalance.toFixed(4)} APT` : 'Loading...'}
            </div>
            <div>
              <strong>Service Price:</strong> {pricePerMB} APT per MB
            </div>
          </div>
          {escrowBalance !== null && escrowBalance < 0.001 && (
            <div style={{
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              ⚠️ <strong>Low Balance Warning:</strong> You have insufficient escrow balance. Please deposit APT to billing ID <strong>{billingId}</strong> before uploading files.
            </div>
          )}
        </div>
      )}

      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragActive ? '#007bff' : '#ccc'}`,
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          backgroundColor: dragActive ? '#f0f8ff' : '#fafafa',
          cursor: uploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        {uploading ? (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  width: '100%',
                  height: '20px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: '100%',
                    backgroundColor: uploadProgress === 100 ? '#28a745' : '#007bff',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              <p style={{ margin: '10px 0', fontSize: '14px' }}>
                {uploadProgress.toFixed(0)}% Complete
              </p>
            </div>
            <p style={{ fontSize: '14px', color: '#666' }}>{uploadStatus}</p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📁</div>
            <h3>Drop files here or click to upload</h3>
            <p style={{ color: '#666', marginBottom: '10px' }}>
              Storage cost: {pricePerMB} APT per MB
            </p>
            <p style={{ color: '#888', fontSize: '12px', marginBottom: '20px' }}>
              Payment will be automatically deducted from your escrow balance
            </p>
            <input
              type="file"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="file-upload"
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                border: 'none',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Choose File
            </label>
          </div>
        )}
      </div>

      {uploadStatus && !uploading && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            borderRadius: '6px',
            backgroundColor: uploadStatus.includes('❌') ? '#ffe6e6' : '#e6ffe6',
            color: uploadStatus.includes('❌') ? '#d00' : '#006600',
            border: `1px solid ${uploadStatus.includes('❌') ? '#ffcccc' : '#ccffcc'}`,
            fontSize: '14px'
          }}
        >
          {uploadStatus}
        </div>
      )}
    </div>
  );
};