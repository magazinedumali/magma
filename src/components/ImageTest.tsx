import React, { useState } from 'react';

interface ImageTestProps {
  src: string;
  alt: string;
}

const ImageTest: React.FC<ImageTestProps> = ({ src, alt }) => {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageError, setImageError] = useState<string>('');

  const handleLoad = () => {
    setImageStatus('loaded');
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageStatus('error');
    setImageError(e.currentTarget.src);
    e.currentTarget.src = '/placeholder.svg';
  };

  return (
    <div style={{ 
      border: '2px solid #ccc', 
      padding: '10px', 
      margin: '10px 0',
      backgroundColor: '#f9f9f9'
    }}>
      <h4>Test d'image:</h4>
      <p><strong>URL:</strong> {src}</p>
      <p><strong>Status:</strong> 
        <span style={{ 
          color: imageStatus === 'loaded' ? 'green' : 
                imageStatus === 'error' ? 'red' : 'orange',
          fontWeight: 'bold'
        }}>
          {imageStatus}
        </span>
      </p>
      {imageError && <p><strong>Erreur URL:</strong> {imageError}</p>}
      <img 
        src={src} 
        alt={alt}
        style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

export default ImageTest;
