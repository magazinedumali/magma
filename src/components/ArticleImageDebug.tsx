import React, { useState } from 'react';

interface ArticleImageDebugProps {
  article: any;
}

const ArticleImageDebug: React.FC<ArticleImageDebugProps> = ({ article }) => {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageError, setImageError] = useState<string>('');
  const [responseInfo, setResponseInfo] = useState<any>(null);

  const testImageUrl = async (url: string) => {
    setImageStatus('loading');
    setImageError('');
    setResponseInfo(null);

    try {
      const response = await fetch(url, { 
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

      const img = new Image();
      img.onload = () => setImageStatus('loaded');
      img.onerror = () => {
        setImageStatus('error');
        setImageError('Image failed to load');
      };
      img.src = url;

    } catch (error: any) {
      setImageStatus('error');
      setImageError(error.message);
    }
  };

  React.useEffect(() => {
    if (article?.image_url) {
      testImageUrl(article.image_url);
    }
  }, [article?.image_url]);

  if (!article?.image_url) {
    return (
      <div style={{ 
        border: '2px solid #ffc107', 
        padding: '10px', 
        margin: '5px 0',
        backgroundColor: '#fffbf0',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <strong>⚠️ No image_url</strong>
        <div>Article ID: {article?.id}</div>
        <div>Title: {article?.titre}</div>
      </div>
    );
  }

  return (
    <div style={{ 
      border: '2px solid #ccc', 
      padding: '10px', 
      margin: '5px 0',
      backgroundColor: '#f9f9f9',
      borderRadius: '4px',
      fontSize: '11px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <strong>Article: {article.titre}</strong>
        <span style={{ 
          color: imageStatus === 'loaded' ? 'green' : 
                imageStatus === 'error' ? 'red' : 'orange',
          fontWeight: 'bold'
        }}>
          {imageStatus === 'loaded' ? '✅' : 
           imageStatus === 'error' ? '❌' : '⏳'}
        </span>
      </div>
      
      <div style={{ marginBottom: '5px' }}>
        <strong>URL:</strong> 
        <div style={{ 
          wordBreak: 'break-all', 
          fontSize: '10px', 
          backgroundColor: '#eee', 
          padding: '3px', 
          borderRadius: '2px',
          marginTop: '2px'
        }}>
          {article.image_url}
        </div>
      </div>

      {imageError && (
        <div style={{ marginBottom: '5px', color: 'red' }}>
          <strong>Error:</strong> {imageError}
        </div>
      )}

      {responseInfo && (
        <div style={{ marginBottom: '5px' }}>
          <strong>Response:</strong> {responseInfo.status} {responseInfo.statusText}
          {responseInfo.headers['content-type'] && (
            <div>Type: {responseInfo.headers['content-type']}</div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <img 
          src={article.image_url} 
          alt={article.titre}
          style={{ 
            width: '60px', 
            height: '40px', 
            objectFit: 'cover',
            border: '1px solid #ddd',
            borderRadius: '2px'
          }}
          onLoad={() => setImageStatus('loaded')}
          onError={() => {
            setImageStatus('error');
            setImageError('Image failed to load in img element');
          }}
        />
        <button 
          onClick={() => testImageUrl(article.image_url)}
          style={{
            background: '#4f8cff',
            color: 'white',
            border: 'none',
            padding: '3px 8px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Retest
        </button>
      </div>
    </div>
  );
};

export default ArticleImageDebug;
