'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { BorrowRequest } from '@/lib/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Package,
  Calendar,
  Phone,
  User,
  ArrowLeft,
  AlertCircle,
  LogIn,
} from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function MyRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUserAndRequests = async () => {
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
    };

    fetchUserAndRequests();
  }, [router]);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/my-requests`,
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>อนุมัติแล้ว (Approved)</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>ไม่อนุมัติ (Rejected)</span>
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>คืนอุปกรณ์แล้ว (Returned)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>รอการอนุมัติ (Pending)</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 mb-2 font-bold transition"
            >
              <ArrowLeft className="w-4 h-4" /> กลับสู่หน้าหลัก
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ประวัติและสถานะคำขอยืมของฉัน
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              ติดตามสถานะการพิจารณาอนุมัติคำขอยืมอุปกรณ์ล่วงหน้า
            </p>
          </div>
        </div>

        {/* Content */}
        {!user ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <LogIn className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">กรุณาเข้าสู่ระบบเพื่อดูประวัติ</h3>
            <p className="text-xs text-slate-400 mt-1 mb-6 max-w-xs mx-auto">
              เข้าสู่ระบบด้วยบัญชี Google เพื่อเรียกดูรายการคำขอยืมทั้งหมดของคุณ
            </p>
            <button
              onClick={handleGoogleLogin}
              className="inline-flex items-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              <span>เข้าสู่ระบบ Google</span>
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse space-y-3 shadow-sm"
              >
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-16 bg-slate-100 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">ยังไม่มีประวัติคำขอยืม</h3>
            <p className="text-xs text-slate-400 mt-1 mb-6">
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
          <div className="space-y-4">
            {requests.map((req) => {
              const isApproved = req.status === 'approved';
              const isRejected = req.status === 'rejected';

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-indigo-600">
                        รหัสคำขอ #{req.id.substring(0, 8).toUpperCase()}
                      </span>
                      <div className="text-xs text-slate-500 mt-0.5">
                        ส่งคำขอเมื่อ: {formatDateTime(req.created_at)} • กลุ่ม: {req.user_group}
                      </div>
                    </div>
                    <div>{getStatusBadge(req.status)}</div>
                  </div>

                  {/* Dates Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
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

                  {/* Items List */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-2">
                      รายการอุปกรณ์ที่ขอยืม:
                    </h4>
                    <div className="space-y-1.5">
                      {req.borrow_items?.map((bi) => (
                        <div
                          key={bi.id}
                          className="flex items-center justify-between py-2 px-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs"
                        >
                          <span className="font-semibold text-slate-800">
                            • {bi.item?.name || 'อุปกรณ์'}
                          </span>
                          <div className="text-right">
                            {isApproved ? (
                              <span className="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full text-xs">
                                อนุมัติ {bi.approved_qty ?? bi.requested_qty} ชิ้น (จากที่ขอ{' '}
                                {bi.requested_qty})
                              </span>
                            ) : (
                              <span className="text-slate-600 font-semibold">
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
    </div>
  );
}
