import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ 
  id, 
  title, 
  description, 
  variant = 'default', 
  onDismiss 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Handle animation before dismissal
  const dismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss(id);
    }, 300); // Match animation duration
  };

  return (
    <div 
      className={`toast toast-${variant} ${isVisible ? 'animate-in' : 'animate-out'}`}
      role="alert"
    >
      <div className="toast-icon">
        {variant === 'success' && '✓'}
        {variant === 'error' && '✗'}
        {variant === 'warning' && '⚠'}
        {variant === 'default' && 'ℹ'}
      </div>
      <div className="toast-content">
        <div className="toast-title">{title}</div>
        {description && <div className="toast-message">{description}</div>}
      </div>
      <button onClick={dismiss} className="toast-close" aria-label="Close toast">
        ×
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          onDismiss={dismissToast}
        />
      ))}
    </div>
  );
};