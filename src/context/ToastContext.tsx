"use client";

import React, { useState, useCallback, useRef } from 'react';
import Toast, { ToastProps } from '../components/Toast'; // Import ToastProps dari Toast

// Tambahkan type untuk toast yang menunggu (misal, untuk antrian)
export type ToastItem = Omit<ToastProps, 'onClose' | 'id'> & { id: string };

interface ToastContextType {
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
}

// Buat Context untuk Toast
const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

// Hook kustom untuk menggunakan fungsionalitas toast
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdCounter = useRef(0);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const newId = `toast-${toastIdCounter.current++}`;
    setToasts((prevToasts) => [...prevToasts, { ...toast, id: newId }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};