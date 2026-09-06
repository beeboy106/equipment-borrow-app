'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { BorrowRequest } from '@/lib/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import ToastContainer, { ToastMessage, ToastType } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Package,
  ArrowLeft,
  AlertCircle,
  LogIn,
  Trash2,
  Info,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MyRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (type: ToastType, message: string, title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };
  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cancel Request Modal State
  const [cancelModalState, setCancelModalState] = useState<{
    isOpen: boolean;
    request: BorrowRequest | null;
    loading: boolean;
  }>({
    isOpen: false,
    request: null,
    loading: false,
  });

  const fetchUserAndRequests = useCallback(async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push('/login');
      return;
    }

    setUser(session.user);
    const { data, error } = await supabase
      .from('borrow_requests')
      .select('*, borrow_items(id, item_id, requested_qty, approved_qty, item:items(name, image_url))')
      .eq('borrower_email', session.user.email)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRequests(data as BorrowRequest[]);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchUserAndRequests();
  }, [fetchUserAndRequests]);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/my-requests`,
      },
    });
  };

  const handleOpenCancelModal = (request: BorrowRequest) => {
    setCancelModalState({
      isOpen: true,
      request,
      loading: false,
    });
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalState.request) return;

    try {
      setCancelModalState((prev) => ({ ...prev, loading: true }));
      const { error } = await supabase
        .from('borrow_requests')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', cancelModalState.request.id)
        .eq('status', 'pending'); // ป้องกันยกเลิกซ้ำซ้อน

      if (error) throw error;

      showToast('success', 'ยกเลิกคำขอยืมอุปกรณ์เรียบร้อยแล้ว', 'ยกเลิกสำเร็จ');
      setCancelModalState({ isOpen: false, request: null, loading: false });
      await fetchUserAndRequests();
    } catch (err: any) {
      console.error('Cancel request error:', err);
      showToast('error', err.message || 'ไม่สามารถยกเลิกคำขอได้', 'เกิดข้อผิดพลาด');
      setCancelModalState((prev) => ({ ...prev, loading: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold whitespace-nowrap">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>อนุมัติแล้ว (Approved)</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold whitespace-nowrap">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>ไม่อนุมัติ (Rejected)</span>
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold whitespace-nowrap">
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>คืนอุปกรณ์แล้ว (Returned)</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold whitespace-nowrap">
            <XCircle className="w-4 h-4 text-slate-400" />
            <span>ยกเลิกแล้ว (Cancelled)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold whitespace-nowrap">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>รอการอนุมัติ (Pending)</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-200">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 mb-1.5 sm:mb-2 font-bold transition"
            >
              <ArrowLeft className="w-4 h-4" /> กลับสู่หน้าหลัก
            </Link>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900">
              ประวัติและสถานะคำขอยืมของฉัน
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">
              ติดตามสถานะการพิจารณาอนุมัติคำขอยืมอุปกรณ์ล่วงหน้า
            </p>
          </div>
        </div>

        {/* Content */}
        {!user ? (
          <div className="text-center py-16 sm:py-20 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <LogIn className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-400 mx-auto mb-3" />
            <h3 className="text-sm sm:text-base font-bold text-slate-800">กรุณาเข้าสู่ระบบเพื่อดูประวัติ</h3>
            <p className="text-xs text-slate-400 mt-1 mb-5 max-w-xs mx-auto">
              เข้าสู่ระบบด้วยบัญชี Google เพื่อเรียกดูรายการคำขอยืมทั้งหมดของคุณ
            </p>
            <button
              onClick={handleGoogleLogin}
              className="inline-flex items-center gap-2 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              <span>เข้าสู่ระบบ Google</span>
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 animate-pulse space-y-3 shadow-sm"
              >
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-14 sm:h-16 bg-slate-100 rounded-xl sm:rounded-2xl" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <Package className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm sm:text-base font-bold text-slate-800">ยังไม่มีประวัติคำขอยืม</h3>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              คุณยังไม่เคยส่งคำขอยืมอุปกรณ์ล่วงหน้าในระบบ
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition"
            >
              เลือกอุปกรณ์ที่ต้องการยืม
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5 sm:space-y-4">
            {requests.map((req) => {
              const isPending = req.status === 'pending';
              const isApproved = req.status === 'approved';
              const isRejected = req.status === 'rejected';

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs hover:shadow-md transition space-y-3 sm:space-y-4"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-indigo-600">
                        รหัสคำขอ #{req.id.substring(0, 8).toUpperCase()}
                      </span>
                      <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>ส่งคำขอ: {formatDateTime(req.created_at)}</span>
                        <span>•</span>
                        <span>กลุ่ม: {req.user_group}</span>
                        {req.department_or_unit && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600 font-medium">
                              {req.department_or_unit}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                      {getStatusBadge(req.status)}
                      {isPending && (
                        <button
                          onClick={() => handleOpenCancelModal(req)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-full text-xs font-bold transition flex items-center gap-1"
                          title="ยกเลิกคำขอนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>ยกเลิกคำขอ</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dates Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 p-3 sm:p-3.5 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-500">วันที่ต้องการใช้งาน (วันรับของ):</span>{' '}
                      <span className="font-bold text-slate-900">{formatDate(req.use_date)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">วันที่กำหนดส่งคืน:</span>{' '}
                      <span className="font-bold text-slate-900">
                        {formatDate(req.return_date)}
                      </span>
                    </div>
                  </div>

                  {/* Rejection Note */}
                  {isRejected && req.admin_note && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">เหตุผลที่ไม่อนุมัติ: </span>
                        <span>{req.admin_note}</span>
                      </div>
                    </div>
                  )}

                  {/* Approved Notice with Contact Instruction */}
                  {isApproved && (
                    <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold">
                          คำขอนี้ได้รับการอนุมัติแล้ว{' '}
                          {req.pickup_time && `(เวลานัดรับของ: ${req.pickup_time})`}
                        </p>
                        <p className="text-[11px] text-emerald-700 font-normal">
                          กรุณานำบัตรประจำตัวมารับอุปกรณ์ตามวันและเวลาที่นัดหมาย หากต้องการยกเลิกหรือเปลี่ยนแปลงกำหนดการ กรุณาติดต่อเจ้าหน้าที่ดูแลห้องอุปกรณ์โดยตรง
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Items List */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-2">
                      รายการอุปกรณ์ที่ขอยืม:
                    </h4>
                    <div className="space-y-1.5">
                      {req.borrow_items?.map((bi) => (
                        <div
                          key={bi.id}
                          className="flex items-center justify-between gap-2 py-2 px-3 sm:px-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs"
                        >
                          <span className="font-semibold text-slate-800 truncate min-w-0 flex-1">
                            • {bi.item?.name || 'อุปกรณ์'}
                          </span>
                          <div className="text-right shrink-0">
                            {isApproved ? (
                              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[11px] sm:text-xs whitespace-nowrap">
                                อนุมัติ {bi.approved_qty ?? bi.requested_qty} ชิ้น
                              </span>
                            ) : (
                              <span className="text-slate-600 font-semibold bg-slate-200/70 px-2 py-0.5 rounded-full text-[11px] sm:text-xs whitespace-nowrap">
                                ขอ {bi.requested_qty} ชิ้น
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Purpose */}
                  <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-700">วัตถุประสงค์: </span>
                    <span>{req.purpose}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cancel Request Confirmation Modal */}
      <ConfirmModal
        isOpen={cancelModalState.isOpen}
        title="ยืนยันการยกเลิกคำขอยืม"
        isDanger={true}
        confirmText="ยืนยันยกเลิกคำขอ"
        cancelText="กลับ"
        isLoading={cancelModalState.loading}
        onClose={() => setCancelModalState({ isOpen: false, request: null, loading: false })}
        onConfirm={handleConfirmCancel}
        description={
          cancelModalState.request ? (
            <div className="space-y-2 mt-1">
              <p>
                คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำขอยืมรหัส{' '}
                <strong className="text-slate-900">
                  #{cancelModalState.request.id.substring(0, 8).toUpperCase()}
                </strong>{' '}
                นี้?
              </p>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                <p className="font-bold text-[11px] text-slate-500 mb-1">อุปกรณ์ในคำขอนี้:</p>
                <ul className="space-y-0.5">
                  {cancelModalState.request.borrow_items?.map((bi) => (
                    <li key={bi.id} className="text-xs">
                      • {bi.item?.name || 'อุปกรณ์'} ({bi.requested_qty} ชิ้น)
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-[11px] text-slate-500">
                คำขอจะถูกเปลี่ยนสถานะเป็น &quot;ยกเลิกแล้ว&quot; และเจ้าหน้าที่จะไม่ต้องดำเนินการตรวจสอบรายการนี้
              </p>
            </div>
          ) : (
            ''
          )
        }
      />
    </div>
  );
}
