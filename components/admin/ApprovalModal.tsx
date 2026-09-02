'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { BorrowRequest } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { X, CheckCircle, XCircle, AlertCircle, Package } from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  mode: 'approve' | 'reject';
  request: BorrowRequest | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApprovalModal({
  isOpen,
  mode,
  request,
  onClose,
  onSuccess,
}: ApprovalModalProps) {
  const [approvedQuantities, setApprovedQuantities] = useState<{ [itemId: string]: number }>({});
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (request && isOpen) {
      const initialQty: { [itemId: string]: number } = {};
      request.borrow_items?.forEach((bi) => {
        initialQty[bi.item_id] = bi.requested_qty;
      });
      setApprovedQuantities(initialQty);
      setAdminNote('');
      setErrorMsg(null);
    }
  }, [request, isOpen, mode]);

  if (!isOpen || !request) return null;

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const itemsPayload =
        request.borrow_items?.map((bi) => ({
          item_id: bi.item_id,
          approved_qty: approvedQuantities[bi.item_id] ?? bi.requested_qty,
        })) || [];

      // 1. เรียกใช้งาน RPC: approve_borrow_request
      const { error: dbError } = await supabase.rpc('approve_borrow_request', {
        p_request_id: request.id,
        p_items: itemsPayload,
        p_pickup_time: null,
      });

      if (dbError) throw dbError;

      // 2. เรียกส่งอีเมลแจ้งผลผ่าน Resend API
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'approved',
            to: request.borrower_email,
            borrowerName: request.borrower_name,
            requestId: request.id,
            useDate: formatDate(request.use_date),
            returnDate: formatDate(request.return_date),
            items: request.borrow_items?.map((bi) => ({
              name: bi.item?.name || 'อุปกรณ์',
              requested_qty: bi.requested_qty,
              approved_qty: approvedQuantities[bi.item_id] ?? bi.requested_qty,
            })),
          }),
        });
      } catch (mailErr) {
        console.warn('Resend mail error:', mailErr);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Approve error:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการอนุมัติคำขอ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNote.trim()) {
      setErrorMsg('กรุณาระบุเหตุผลหรือหมายเหตุที่ไม่อนุมัติ');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. เรียกใช้งาน RPC: reject_borrow_request
      const { error: dbError } = await supabase.rpc('reject_borrow_request', {
        p_request_id: request.id,
        p_admin_note: adminNote,
      });

      if (dbError) throw dbError;

      // 2. เรียกส่งอีเมลแจ้งผลการปฏิเสธผ่าน Resend API
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'rejected',
            to: request.borrower_email,
            borrowerName: request.borrower_name,
            requestId: request.id,
            useDate: formatDate(request.use_date),
            returnDate: formatDate(request.return_date),
            items: request.borrow_items?.map((bi) => ({
              name: bi.item?.name || 'อุปกรณ์',
              requested_qty: bi.requested_qty,
            })),
            adminNote,
          }),
        });
      } catch (mailErr) {
        console.warn('Resend mail error:', mailErr);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Reject error:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการปฏิเสธคำขอ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
        {/* Header */}
        <div className="flex justify-between items-start mb-5 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {mode === 'approve'
                ? 'อนุมัติคำขอยืมอุปกรณ์ล่วงหน้า'
                : 'ปฏิเสธคำขอยืมอุปกรณ์ (ไม่อนุมัติ)'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ผู้ขอยืม: <strong className="text-slate-800">{request.borrower_name}</strong> ({request.user_group})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {mode === 'approve' ? (
          <form onSubmit={handleApproveSubmit} className="space-y-4">
            {/* Dates info */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
              <div>
                <span className="text-slate-500">วันที่ต้องการใช้งาน (วันเข้ารับของ): </span>
                <span className="font-bold text-slate-900">{formatDate(request.use_date)}</span>
              </div>
              <div>
                <span className="text-slate-500">วันที่กำหนดส่งคืน: </span>
                <span className="font-bold text-slate-900">{formatDate(request.return_date)}</span>
              </div>
            </div>

            {/* Requested Items & Approved Qty Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                ระบุจำนวนอุปกรณ์ที่อนุมัติให้ยืมจริง:
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {request.borrow_items?.map((bi) => {
                  const currentApproved = approvedQuantities[bi.item_id] ?? bi.requested_qty;

                  return (
                    <div
                      key={bi.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 truncate">
                          {bi.item?.name || 'อุปกรณ์'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          ขอ {bi.requested_qty} ชิ้น (คงเหลือในสต็อก: {bi.item?.available_quantity ?? '-'} ชิ้น)
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-slate-600 text-xs font-bold">อนุมัติ:</span>
                        <input
                          type="number"
                          min={0}
                          max={bi.requested_qty}
                          required
                          value={currentApproved}
                          onChange={(e) =>
                            setApprovedQuantities({
                              ...approvedQuantities,
                              [bi.item_id]: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-16 px-2.5 py-1 text-center font-bold text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                        <span className="text-slate-500 text-xs">ชิ้น</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-[11px] bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-800">
              * เมื่อกดยืนยัน ระบบจะตัดสต็อกตามจำนวนที่อนุมัติจริง และส่งอีเมลแจ้งผลไปยัง <strong>{request.borrower_email}</strong> ทันที
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{submitting ? 'กำลังบันทึก...' : 'ยืนยันการอนุมัติ'}</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRejectSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เหตุผล / หมายเหตุที่ไม่อนุมัติ <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="เช่น อุปกรณ์ติดการใช้งานในงานสัมมนาคณะ / ไม่ตรงตามเงื่อนไข..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              />
            </div>

            <div className="text-[11px] bg-rose-50 p-3 rounded-xl border border-rose-200 text-rose-800">
              * ระบบจะส่งอีเมลแจ้งผลการปฏิเสธพร้อมเหตุผลนี้ไปยัง <strong>{request.borrower_email}</strong>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-200 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>{submitting ? 'กำลังบันทึก...' : 'ยืนยันการไม่อนุมัติ'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
