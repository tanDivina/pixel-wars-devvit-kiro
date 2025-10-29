import { useState, useCallback } from 'react';
import type { ToastType } from '../components/Toast';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// Enhanced error messages with helpful context
const ERROR_MESSAGES: Record<string, string> = {
  'no_credits': '⏳ Out of pixel credits! Wait for regeneration or check the timer.',
  'invalid_coordinates': '❌ Invalid position. Try clicking within the canvas boundaries.',
  'network_error': '🌐 Connection issue. Check your internet and try again.',
  'rate_limit': '⚠️ Slow down! You\'re placing pixels too quickly.',
  'already_placed': 'ℹ️ That pixel is already yours. Try a different spot!',
  'server_error': '⚠️ Server hiccup! Please try again in a moment.',
  'unknown': '❌ Something went wrong. Please try again.',
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string) => addToast(message, 'success'), [addToast]);
  
  const error = useCallback((message: string, errorCode?: string) => {
    // Use enhanced error message if error code is provided
    const enhancedMessage = errorCode && ERROR_MESSAGES[errorCode] 
      ? ERROR_MESSAGES[errorCode] 
      : message;
    return addToast(enhancedMessage, 'error');
  }, [addToast]);
  
  const info = useCallback((message: string) => addToast(message, 'info'), [addToast]);
  const warning = useCallback((message: string) => addToast(message, 'warning'), [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
  } as const;
};
