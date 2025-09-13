import React from 'react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  cost: number;
  transactionHash?: string;
}

interface FileListProps {
  files: UploadedFile[];
}

export const FileList: React.FC<FileListProps> = ({ files }) => {
  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleString();
  };

  const getFileIcon = (type: string): string => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('text')) return '📝';
    return '📁';
  };

  if (files.length === 0) {
    return (
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
        color: '#666'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>📂</div>
        <p>No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fff'
    }}>
      <h3 style={{ 
        margin: '0',
        padding: '15px 20px',
        borderBottom: '1px solid #ddd',
        backgroundColor: '#f8f9fa'
      }}>
        📂 Uploaded Files ({files.length})
      </h3>
      
      <div style={{ padding: '0' }}>
        {files.map((file, index) => (
          <div
            key={file.id}
            style={{
              padding: '15px 20px',
              borderBottom: index < files.length - 1 ? '1px solid #eee' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <span style={{ fontSize: '24px', marginRight: '15px' }}>
                {getFileIcon(file.type)}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {file.name}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {formatFileSize(file.size)} • {formatDate(file.uploadDate)}
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: 'right', marginLeft: '20px' }}>
              <div style={{ 
                fontWeight: 'bold', 
                color: '#28a745',
                marginBottom: '5px'
              }}>
                {file.cost} APT
              </div>
              {file.transactionHash && (
                <div style={{ fontSize: '10px', color: '#666' }}>
                  TX: {file.transactionHash.substring(0, 8)}...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{
        padding: '15px 20px',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #ddd',
        textAlign: 'right'
      }}>
        <strong>
          Total Cost: {files.reduce((sum, file) => sum + file.cost, 0).toFixed(2)} APT
        </strong>
      </div>
    </div>
  );
};