import React from 'react';

interface FullScreenLoaderProps {
  message?: string;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-screen">
      <div className="loading-title">{message}</div>
      <div className="loading-spinner"></div>
    </div>
  );
};

export default FullScreenLoader;