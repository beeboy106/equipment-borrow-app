'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    },
    info: {
      bg: 'bg-indigo-50 border-indigo-200 text-indigo-900',
      icon: <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />,
    },
  }[toast.type];

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-lg backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-bottom-3 fade-in ${config.bg}`}
    >
      {config.icon}
      <div className="flex-1 min-w-0 pt-0.5">
        {toast.title && <h5 className="text-xs font-bold leading-none mb-1">{toast.title}</h5>}
        <p className="text-xs leading-relaxed opacity-90">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-lg hover:bg-black/5 text-current opacity-60 hover:opacity-100 transition shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
