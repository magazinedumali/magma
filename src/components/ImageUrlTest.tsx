import React, { useState } from 'react';

interface ImageUrlTestProps {
  url: string;
  title?: string;
}

const ImageUrlTest: React.FC<ImageUrlTestProps> = ({ url, title = 'Test Image' }) => {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageError, setImageError] = useState<string>('');
  const [responseInfo, setResponseInfo] = useState<any>(null);

  const testImageUrl = async (imageUrl: string) => {
    setImageStatus('loading');
    setImageError('');
    setResponseInfo(null);

    try {
      // Test with fetch first
      const response = await fetch(imageUrl, { 
        method: 'HEAD',
        mode: 'cors'
      });
      
      setResponseInfo({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // If HEAD request succeeds, test with img element
      const img = new Image();
      img.onload = () => {
        setImageStatus('loaded');
      };
      img.onerror = (e) => {
        setImageStatus('error');
        setImageError('Image failed to load');
      };
      img.src = imageUrl;

    } catch (error: any) {
      setImageStatus('error');
      setImageError(error.message);
    }
  };

  React.useEffect(() => {
    if (url) {
      testImageUrl(url);
    }
  }, [url]);

  return (
    <div style={{ 
      border: '2px solid #ccc', 
      padding: '15px', 
      margin: '10px 0',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>
        {title}
      </h4>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>URL:</strong> 
        <div style={{ 
          wordBreak: 'break-all', 
          fontSize: '11px', 
          backgroundColor: '#eee', 
          padding: '5px', 
          borderRadius: '4px',
          marginTop: '5px'
        }}>
          {url}
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Status:</strong> 
        <span style={{ 
          color: imageStatus === 'loaded' ? 'green' : 
                imageStatus === 'error' ? 'red' : 'orange',
          fontWeight: 'bold',
          marginLeft: '5px'
        }}>
          {imageStatus === 'loaded' ? '✅ Loaded' : 
           imageStatus === 'error' ? '❌ Error' : '⏳ Loading...'}
        </span>
      </div>

      {imageError && (
        <div style={{ marginBottom: '10px' }}>
          <strong>Error:</strong> 
          <span style={{ color: 'red', marginLeft: '5px' }}>{imageError}</span>
        </div>
      )}

      {responseInfo && (
        <div style={{ marginBottom: '10px' }}>
          <strong>Response Info:</strong>
          <div style={{ 
            fontSize: '10px', 
            backgroundColor: '#f0f0f0', 
            padding: '5px', 
            borderRadius: '4px',
            marginTop: '5px',
            maxHeight: '100px',
            overflow: 'auto'
          }}>
            <div>Status: {responseInfo.status} {responseInfo.statusText}</div>
            <div>Content-Type: {responseInfo.headers['content-type'] || 'N/A'}</div>
            <div>Content-Length: {responseInfo.headers['content-length'] || 'N/A'}</div>
            <div>Final URL: {responseInfo.url}</div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '10px' }}>
        <img 
          src={url} 
          alt={title}
          style={{ 
            maxWidth: '200px', 
            maxHeight: '150px', 
            objectFit: 'cover',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
          onLoad={() => setImageStatus('loaded')}
          onError={() => {
            setImageStatus('error');
            setImageError('Image failed to load in img element');
          }}
        />
      </div>

      <button 
        onClick={() => testImageUrl(url)}
        style={{
          background: '#4f8cff',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        Retest
      </button>
    </div>
  );
};

export default ImageUrlTest;
