'use client';

import React from 'react';
import { BorrowRecord } from '@/lib/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import { RotateCcw, User, Calendar, Mail, Phone, Clock, CheckCircle } from 'lucide-react';

interface BorrowHistoryTableProps {
  records: BorrowRecord[];
  onReturnRecord: (recordId: string) => void;
}

export default function BorrowHistoryTable({
  records,
  onReturnRecord,
}: BorrowHistoryTableProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-xs">
            <tr>
              <th className="p-4 sm:px-6">ผู้ขอยืม / ข้อมูลติดต่อ</th>
              <th className="p-4 sm:px-6">อุปกรณ์ที่ยืม</th>
              <th className="p-4 sm:px-6">วัตถุประสงค์</th>
              <th className="p-4 sm:px-6">วันที่ยืม - กำหนดคืน</th>
              <th className="p-4 sm:px-6">สถานะ</th>
              <th className="p-4 sm:px-6 text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Clock className="w-10 h-10 mb-2 opacity-40 text-slate-400" />
                    <p className="font-semibold text-slate-600">ยังไม่มีประวัติการยืมในระบบ</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      เมื่อมีอาจารย์หรือเจ้าหน้าที่ทำรายการยืม จะปรากฏขึ้นที่นี่
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((rec) => {
                const isReturned = rec.status === 'returned';

                return (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition">
                    {/* Borrower */}
                    <td className="p-4 sm:px-6">
                      <div className="font-bold text-slate-900">{rec.borrower_name}</div>
                      <div className="text-xs text-slate-400 flex flex-col sm:flex-row sm:gap-2 mt-0.5">
                        <span>{rec.borrower_email}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{rec.borrower_phone}</span>
                      </div>
                    </td>

                    {/* Items */}
                    <td className="p-4 sm:px-6">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {rec.borrow_items && rec.borrow_items.length > 0 ? (
                          rec.borrow_items.map((bi) => (
                            <span
                              key={bi.id}
                              className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-lg font-semibold border border-slate-200"
                            >
                              <span>{bi.item?.name || 'อุปกรณ์ไม่ระบุ'}</span>
                              <span className="bg-indigo-600 text-white rounded-full px-1.5 py-0.2 text-[10px]">
                                ×{bi.quantity}
                              </span>
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </div>
                    </td>

                    {/* Purpose */}
                    <td className="p-4 sm:px-6">
                      <p className="text-xs text-slate-600 max-w-xs line-clamp-2" title={rec.purpose}>
                        {rec.purpose || '-'}
                      </p>
                    </td>

                    {/* Dates */}
                    <td className="p-4 sm:px-6 text-xs">
                      <div className="text-slate-600">
                        <span className="font-semibold text-slate-700">ยืมเมื่อ:</span>{' '}
                        {formatDateTime(rec.borrow_date || rec.created_at)}
                      </div>
                      <div className="mt-1">
                        <span className="font-semibold text-rose-600">กำหนดคืน:</span>{' '}
                        <span className="font-bold text-rose-700">
                          {formatDate(rec.expected_return_date)}
                        </span>
                      </div>
                      {isReturned && rec.actual_return_date && (
                        <div className="mt-1 text-emerald-600 font-semibold">
                          คืนแล้วเมื่อ: {formatDateTime(rec.actual_return_date)}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4 sm:px-6">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full shadow-sm ${
                          isReturned
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isReturned ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            คืนแล้ว
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            กำลังยืมอยู่
                          </>
                        )}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 sm:px-6 text-center">
                      {!isReturned ? (
                        <button
                          onClick={() => onReturnRecord(rec.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-200 transition inline-flex items-center gap-1.5 hover:scale-105"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>กดรับคืน</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">เสร็จสิ้น</span>
                      )}
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
