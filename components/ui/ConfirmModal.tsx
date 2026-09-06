'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
  iconType?: 'danger' | 'warning' | 'info' | 'success';
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  isDanger = false,
  isLoading = false,
  iconType = isDanger ? 'danger' : 'info',
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const iconConfig = {
    danger: {
      bg: 'bg-rose-100 text-rose-600',
      icon: <AlertCircle className="w-6 h-6" />,
      btn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200',
    },
    warning: {
      bg: 'bg-amber-100 text-amber-600',
      icon: <AlertTriangle className="w-6 h-6" />,
      btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200',
    },
    info: {
      bg: 'bg-indigo-100 text-indigo-600',
      icon: <HelpCircle className="w-6 h-6" />,
      btn: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200',
    },
    success: {
      bg: 'bg-emerald-100 text-emerald-600',
      icon: <CheckCircle2 className="w-6 h-6" />,
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200',
    },
  }[iconType];

  return (
    <div className="fixed inset-0 z-[9998] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconConfig.bg}`}>
            {iconConfig.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 leading-snug">{title}</h3>
            <div className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {description}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition shrink-0 -mr-1 -mt-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2.5 mt-6 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 ${iconConfig.btn}`}
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
