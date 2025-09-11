import { createAptickClient, AptickUtils } from 'aptick-sdk';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useState, useEffect } from 'react';

/**
 * File Storage Service Integration Example
 * 
 * This example shows how to integrate Aptick SDK into a file storage service
 * where users pay per GB of storage used.
 * 
 * Prerequisites:
 * 1. Provider registered on Aptick with billing ID
 * 2. Users have deposited APT into escrow
 * 3. Service is connected to Aptick SDK
 */

interface FileUpload {
  id: string;
  name: string;
  size: number; // in bytes
  userAddress: string;
  timestamp: Date;
  paid: boolean;
}

const FILE_STORAGE_SERVICE_CONFIG = {
  billingId: 1, // Your billing ID from Aptick registration
  network: 'devnet' as const,
  pricePerGB: 0.001, // APT per GB
  minBalance: 0.01 // Minimum balance required (APT)
};

export function FileStorageService() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [client, setClient] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [userUsage, setUserUsage] = useState(0);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Initialize Aptick client
  useEffect(() => {
    const initClient = async () => {
      const aptickClient = createAptickClient({
        network: FILE_STORAGE_SERVICE_CONFIG.network
      });
      
      await aptickClient.initialize();
      setClient(aptickClient);
    };
    
    initClient();
  }, []);

  // Load user balance and usage when wallet connects
  useEffect(() => {
    if (client && account?.address) {
      loadUserData();
    }
  }, [client, account]);

  const loadUserData = async () => {
    if (!client || !account?.address) return;

    try {
      // Get user's escrow balance
      const escrowResult = await client.getUserEscrow(
        FILE_STORAGE_SERVICE_CONFIG.billingId,
        account.address.toString()
      );

      if (escrowResult.success) {
        const balanceInAPT = AptickUtils.octasToApt(escrowResult.data.balance);
        const usageInGB = Number(escrowResult.data.usageUnits);
        
        setUserBalance(balanceInAPT);
        setUserUsage(usageInGB);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !client || !account?.address || !signAndSubmitTransaction) {
      alert('Please connect your wallet and select a file');
      return;
    }

    const fileSizeGB = file.size / (1024 * 1024 * 1024); // Convert bytes to GB
    const cost = fileSizeGB * FILE_STORAGE_SERVICE_CONFIG.pricePerGB;

    // Check if user has sufficient balance
    if (userBalance < cost) {
      alert(`Insufficient balance. You need ${cost.toFixed(6)} APT but have ${userBalance.toFixed(6)} APT.`);
      return;
    }

    setUploading(true);

    try {
      // 1. Upload file to your storage system
      const uploadResult = await uploadFileToStorage(file);
      
      if (!uploadResult.success) {
        throw new Error('File upload failed');
      }

      // 2. Record usage with Aptick
      const billingResult = await client.recordUsage(
        signAndSubmitTransaction,
        FILE_STORAGE_SERVICE_CONFIG.billingId,
        account.address.toString(),
        Math.ceil(fileSizeGB * 1000) / 1000 // Round up to 3 decimal places
      );

      if (billingResult.success) {
        // 3. Update local state
        const newFile = {
          id: uploadResult.fileId,
          name: file.name,
          size: file.size,
          userAddress: account.address.toString(),
          timestamp: new Date(),
          paid: true
        };
        
        setFiles(prev => [...prev, newFile]);
        
        // 4. Refresh user balance
        await loadUserData();
        
        alert(`File uploaded successfully! ${fileSizeGB.toFixed(3)} GB charged.`);
      } else {
        // If billing fails, you might want to delete the uploaded file
        await deleteFileFromStorage(uploadResult.fileId);
        throw new Error(`Billing failed: ${billingResult.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Mock file storage functions - replace with your actual storage implementation
  const uploadFileToStorage = async (file) => {
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      success: true,
      fileId: `file_${Date.now()}`,
      url: `https://storage.example.com/files/file_${Date.now()}`
    };
  };

  const deleteFileFromStorage = async (fileId) => {
    console.log(`Deleting file ${fileId} from storage`);
    // Implement actual file deletion
  };

  const formatFileSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!client) {
    return <div>Initializing Aptick SDK...</div>;
  }

  return (
    <div className=\"file-storage-service\">
      <div className=\"header\">
        <h2>Decentralized File Storage</h2>
        <p>Pay-per-use file storage powered by Aptick</p>
      </div>

      {account?.address ? (
        <div className=\"user-info\">
          <div className=\"balance-card\">
            <h3>Your Account</h3>
            <p><strong>Balance:</strong> {userBalance.toFixed(6)} APT</p>
            <p><strong>Storage Used:</strong> {userUsage.toFixed(3)} GB</p>
            <p><strong>Price:</strong> {FILE_STORAGE_SERVICE_CONFIG.pricePerGB} APT per GB</p>
          </div>

          <div className=\"upload-section\">
            <h3>Upload File</h3>
            <input
              type=\"file\"
              onChange={handleFileUpload}
              disabled={uploading || userBalance < FILE_STORAGE_SERVICE_CONFIG.minBalance}
            />
            {uploading && <p>Uploading and processing payment...</p>}
            
            {userBalance < FILE_STORAGE_SERVICE_CONFIG.minBalance && (
              <div className=\"warning\">
                <p>⚠️ Insufficient balance. Please deposit APT to use this service.</p>
                <p>Minimum balance required: {FILE_STORAGE_SERVICE_CONFIG.minBalance} APT</p>
                <a 
                  href={client?.getDepositUrl(FILE_STORAGE_SERVICE_CONFIG.billingId)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Deposit APT →
                </a>
              </div>
            )}
          </div>

          <div className=\"files-section\">
            <h3>Your Files</h3>
            {files.length === 0 ? (
              <p>No files uploaded yet.</p>
            ) : (
              <div className=\"files-list\">
                {files.map(file => (
                  <div key={file.id} className=\"file-item\">
                    <span className=\"file-name\">{file.name}</span>
                    <span className=\"file-size\">{formatFileSize(file.size)}</span>
                    <span className=\"file-date\">{file.timestamp.toLocaleDateString()}</span>
                    <span className={`file-status ${file.paid ? 'paid' : 'unpaid'}`}>
                      {file.paid ? '✅ Paid' : '❌ Unpaid'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className=\"connect-wallet\">
          <p>Please connect your Aptos wallet to use the file storage service.</p>
        </div>
      )}

      <style jsx>{`
        .file-storage-service {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: system-ui, sans-serif;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .balance-card {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .upload-section {
          margin-bottom: 30px;
        }
        
        .warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 4px;
          margin: 10px 0;
        }
        
        .files-list {
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .file-item {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 10px;
          padding: 10px;
          border-bottom: 1px solid #eee;
          align-items: center;
        }
        
        .file-item:last-child {
          border-bottom: none;
        }
        
        .file-status.paid {
          color: green;
        }
        
        .file-status.unpaid {
          color: red;
        }
        
        input[type=\"file\"] {
          width: 100%;
          padding: 8px;
          margin: 10px 0;
        }
        
        input[type=\"file\"]:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default FileStorageService;