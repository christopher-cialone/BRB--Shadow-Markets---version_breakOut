import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  // Get appropriate styles based on toast type
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-800/70 border-green-500 text-white';
      case 'error':
        return 'bg-red-800/70 border-red-500 text-white';
      case 'info':
      default:
        return 'bg-neon-purple/30 border-neon-cyan text-white';
    }
  };
  
  // Get appropriate icon based on toast type
  const getTypeIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'info':
      default:
        return 'ℹ';
    }
  };
  
  if (!visible) return null;
  
  return (
    <div className={`toast ${getTypeStyles()}`}>
      <div className="toast-icon">{getTypeIcon()}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={() => { setVisible(false); if (onClose) onClose(); }}>
        ×
      </button>
    </div>
  );
};

export default Toast;