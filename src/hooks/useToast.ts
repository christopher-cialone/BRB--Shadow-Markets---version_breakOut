import { useGameState } from './useGameState';

type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'default';

interface ToastProps {
  title: string;
  description: string;
  variant?: ToastVariant;
}

export const useToast = () => {
  const { addNotification } = useGameState();
  
  const toast = ({ title, description, variant = 'default' }: ToastProps) => {
    // Convert variant to notification type (they use slightly different naming)
    const notificationType = variant === 'default' ? 'info' : variant;
    
    // Add notification to the game state
    addNotification(notificationType, title, description);
  };
  
  return { toast };
};

export default useToast;