'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase/client';
import { BorrowFormData } from '@/lib/types';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Package,
} from 'lucide-react';

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function BorrowModal({ isOpen, onClose, onSuccess }: BorrowModalProps) {
  const { cart, clearCart, totalItemsCount } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<BorrowFormData>({
    borrower_name: '',
    borrower_email: '',
    borrower_phone: '',
    purpose: '',
    expected_return_date: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setErrorMessage('กรุณาเลือกอุปกรณ์ในตะกร้าอย่างน้อย 1 ชิ้น');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      // เตรียม payload ให้ตรงกับ Stored Procedure ใน Supabase
      const itemsPayload = cart.map((c) => ({
        item_id: c.item.id,
        quantity: c.quantity,
      }));

      // เรียกใช้งาน Atomic Stored Procedure: borrow_equipment
      const { data, error } = await supabase.rpc('borrow_equipment', {
        p_borrower_name: formData.borrower_name,
        p_borrower_email: formData.borrower_email,
        p_borrower_phone: formData.borrower_phone,
        p_purpose: formData.purpose,
        p_expected_return_date: formData.expected_return_date,
        p_items: itemsPayload,
      });

      if (error) {
        throw error;
      }

      // สำเร็จ
      clearCart();
      onClose();
      onSuccess('บันทึกการขอยืมอุปกรณ์สำเร็จ! กรุณาติดต่อรับอุปกรณ์ที่ห้องพักอาจารย์/เจ้าหน้าที่ประจำสาขา');
    } catch (err: any) {
      console.error('Borrow error:', err);
      setErrorMessage(
        err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาตรวจสอบและลองใหม่อีกครั้ง'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-lg text-slate-900">ฟอร์มยืนยันการยืมอุปกรณ์</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              กรุณากรอกข้อมูลผู้ยืมและกำหนดวันส่งคืนอุปกรณ์
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">เกิดข้อผิดพลาด</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Summary Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
              <span className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-indigo-600" />
                รายการที่ขอยืม ({totalItemsCount} ชิ้น)
              </span>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
              {cart.map((c) => (
                <div key={c.item.id} className="flex justify-between text-xs text-slate-600">
                  <span className="truncate max-w-[240px]">• {c.item.name}</span>
                  <span className="font-bold text-slate-800">{c.quantity} ชิ้น</span>
                </div>
              ))}
            </div>
          </div>

          {/* Borrower Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ชื่อ-นามสกุล (ผู้ขอยืม) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="ผศ.ดร. สมชาย ใจดี"
                value={formData.borrower_name}
                onChange={(e) => setFormData({ ...formData, borrower_name: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-white"
              />
            </div>
          </div>

          
          {/* Purpose */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              วัตถุประสงค์ในการยืม <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <textarea
                required
                rows={2}
                placeholder="เช่น ใช้จัดสอบปฏิบัติการวิชา CS102 / บันทึกวิดีโองานเสวนาวิชาการ"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-white"
              />
            </div>
          </div>

          {/* Expected Return Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              วันที่คาดว่าจะส่งคืน <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                required
                min={todayStr}
                value={formData.expected_return_date}
                onChange={(e) =>
                  setFormData({ ...formData, expected_return_date: e.target.value })
                }
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition bg-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? 'กำลังตัดสต็อก...' : 'ยืนยันการยืม'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
