'use client';

import React from 'react';
import { BorrowRequest } from '@/lib/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  Calendar,
  AlertCircle,
  Package,
} from 'lucide-react';

interface BorrowHistoryTableProps {
  records: BorrowRequest[];
  onOpenApproval: (request: BorrowRequest, mode: 'approve' | 'reject') => void;
  onReturnRecord: (requestId: string) => void;
}

export default function BorrowHistoryTable({
  records,
  onOpenApproval,
  onReturnRecord,
}: BorrowHistoryTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>อนุมัติแล้ว</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>ไม่อนุมัติ</span>
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            <span>คืนแล้ว</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>รออนุมัติ</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-600">
          <thead className="bg-zinc-50 text-zinc-700 font-bold border-b border-zinc-200 text-xs">
            <tr>
              <th className="p-4 sm:px-6">ผู้ขอยืม / ข้อมูลติดต่อ</th>
              <th className="p-4 sm:px-6">รายการอุปกรณ์ (แยกบรรทัด)</th>
              <th className="p-4 sm:px-6">วัตถุประสงค์</th>
              <th className="p-4 sm:px-6">วันใช้งาน - กำหนดคืน</th>
              <th className="p-4 sm:px-6">สถานะ</th>
              <th className="p-4 sm:px-6 text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-xs sm:text-sm">
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-20 text-zinc-400">
                  <div className="flex flex-col items-center justify-center">
                    <Package className="w-10 h-10 mb-2 opacity-40 text-zinc-400 stroke-[1.2]" />
                    <p className="font-semibold text-zinc-600">ยังไม่มีรายการคำขอยืมในระบบ</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      เมื่อมีอาจารย์ นักศึกษา หรือบุคลากรส่งคำขอยืม จะปรากฏขึ้นที่นี่
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((rec) => {
                const isPending = rec.status === 'pending';
                const isApproved = rec.status === 'approved';
                const isRejected = rec.status === 'rejected';
                const isReturned = rec.status === 'returned';

                return (
                  <tr key={rec.id} className="hover:bg-zinc-50/70 transition">
                    {/* Borrower Info */}
                    <td className="p-4 sm:px-6 align-top">
                      <div className="font-bold text-zinc-900">{rec.borrower_name}</div>
                      <div className="inline-block px-2 py-0.5 mt-1 rounded bg-zinc-100 text-[11px] font-semibold text-zinc-600">
                        {rec.user_group}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1 space-y-0.5">
                        <div>{rec.borrower_email}</div>
                        <div>โทร: {rec.phone}</div>
                      </div>
                    </td>

                    {/* Equipment Items - Each on a new line */}
                    <td className="p-4 sm:px-6 align-top">
                      <div className="space-y-2 max-w-sm">
                        {rec.borrow_items && rec.borrow_items.length > 0 ? (
                          rec.borrow_items.map((bi) => (
                            <div
                              key={bi.id}
                              className="p-2 bg-zinc-50 border border-zinc-200/80 rounded-xl flex items-center justify-between gap-2 text-xs"
                            >
                              <span className="font-medium text-zinc-800">
                                • {bi.item?.name || 'อุปกรณ์'}
                              </span>
                              <div className="flex-shrink-0 text-right">
                                {isApproved || isReturned ? (
                                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                    อนุมัติ {bi.approved_qty ?? bi.requested_qty} ชิ้น
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-semibold text-zinc-600 bg-zinc-200/80 px-2 py-0.5 rounded-full">
                                    ขอ {bi.requested_qty} ชิ้น
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className="text-zinc-400">-</span>
                        )}
                      </div>
                    </td>

                    {/* Purpose & Admin Note */}
                    <td className="p-4 sm:px-6 align-top">
                      <p className="text-xs text-zinc-700 max-w-xs leading-relaxed">
                        {rec.purpose || '-'}
                      </p>
                      {isRejected && rec.admin_note && (
                        <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800">
                          <span className="font-bold">เหตุผลที่ปฏิเสธ: </span>
                          <span>{rec.admin_note}</span>
                        </div>
                      )}
                    </td>

                    {/* Dates */}
                    <td className="p-4 sm:px-6 align-top text-xs space-y-1">
                      <div>
                        <span className="text-zinc-400">วันใช้งาน (รับของ):</span>{' '}
                        <span className="font-bold text-zinc-800">{formatDate(rec.use_date)}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400">กำหนดคืน:</span>{' '}
                        <span className="font-bold text-rose-600">{formatDate(rec.return_date)}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 pt-1">
                        ส่งคำขอ: {formatDateTime(rec.created_at)}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 sm:px-6 align-top">{getStatusBadge(rec.status)}</td>

                    {/* Action Buttons */}
                    <td className="p-4 sm:px-6 align-top text-center">
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                        {isPending && (
                          <>
                            <button
                              onClick={() => onOpenApproval(rec, 'approve')}
                              className="w-full sm:w-auto px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1"
                              title="อนุมัติคำขอ"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>อนุมัติ</span>
                            </button>
                            <button
                              onClick={() => onOpenApproval(rec, 'reject')}
                              className="w-full sm:w-auto px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                              title="ไม่อนุมัติ"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>ไม่อนุมัติ</span>
                            </button>
                          </>
                        )}

                        {isApproved && (
                          <button
                            onClick={() => onReturnRecord(rec.id)}
                            className="w-full sm:w-auto px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>กดรับคืน</span>
                          </button>
                        )}

                        {isReturned && (
                          <span className="text-xs text-zinc-400 font-medium">คืนแล้วเรียบร้อย</span>
                        )}

                        {isRejected && (
                          <span className="text-xs text-rose-400 font-medium">ไม่อนุมัติ</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
