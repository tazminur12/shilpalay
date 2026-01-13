"use client";

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      id,
      ...toast,
      duration: toast.duration || 3000,
    };
    
    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message, options = {}) => {
    return addToast({ type: 'success', message, ...options });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({ type: 'error', message, ...options });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({ type: 'info', message, ...options });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({ type: 'warning', message, ...options });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[9999] space-y-2 max-w-md w-full"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, removeToast }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 300);
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  const Icon = icons[toast.type] || Info;

  return (
    <div
      className={`
        ${colors[toast.type] || colors.info}
        border rounded-lg shadow-lg p-4 flex items-start gap-3
        transition-all duration-300
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-semibold text-sm mb-1">{toast.title}</p>
        )}
        <p className="text-sm">{toast.message}</p>
      </div>
      <button
        onClick={handleRemove}
        className="shrink-0 p-1 hover:bg-black/10 rounded transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
