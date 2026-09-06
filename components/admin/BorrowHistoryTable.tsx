'use client';

import React, { useState } from 'react';
import { BorrowRequest } from '@/lib/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Calendar,
  Clock,
  FileText,
  User,
} from 'lucide-react';

interface BorrowHistoryTableProps {
  records: BorrowRequest[];
  onOpenApproval: (request: BorrowRequest, mode: 'approve' | 'reject') => void;
  onReturnRecord: (request: BorrowRequest) => void;
}

export default function BorrowHistoryTable({
  records,
  onOpenApproval,
  onReturnRecord,
}: BorrowHistoryTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const todayStr = new Date().toISOString().split('T')[0];

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getStatusBadge = (rec: BorrowRequest) => {
    const isOverdue = rec.status === 'approved' && rec.return_date < todayStr;

    if (isOverdue) {
      return (
        <div className="flex flex-col gap-1 items-start">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold shadow-xs whitespace-nowrap">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>เกินกำหนดคืน</span>
          </span>
          <span className="text-[10px] text-zinc-400 font-medium pl-1 whitespace-nowrap">
            ครบกำหนด {formatDate(rec.return_date)}
          </span>
        </div>
      );
    }

    switch (rec.status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>อนุมัติแล้ว</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-bold whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            <span>ไม่อนุมัติ</span>
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-bold whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
            <span>คืนแล้ว</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>ยกเลิกแล้ว</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-bold whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
            <span>รออนุมัติ</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 md:space-y-0">
      {/* Mobile Card View (md:hidden) */}
      <div className="md:hidden space-y-3.5">
        {records.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-8 text-center text-zinc-400 shadow-xs">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-40 text-zinc-400 stroke-[1.2]" />
            <p className="font-semibold text-zinc-600">ไม่พบรายการคำขอยืมตามเงื่อนไขที่เลือก</p>
            <p className="text-xs text-zinc-400 mt-0.5">
              ลองเปลี่ยนตัวกรอง หรือกดปุ่ม &quot;ล้างตัวกรอง&quot;
            </p>
          </div>
        ) : (
          records.map((rec, idx) => {
            const isPending = rec.status === 'pending';
            const isApproved = rec.status === 'approved';
            const isRejected = rec.status === 'rejected';
            const isReturned = rec.status === 'returned';
            const isCancelled = rec.status === 'cancelled';
            const isOverdue = isApproved && rec.return_date < todayStr;
            const isExpanded = expandedIds.has(rec.id);

            // Distinct status colors for left border accent & header badge
            let statusAccentBorder = 'border-l-amber-500';
            let cardBorder = 'border-slate-200/90';

            if (isOverdue) {
              statusAccentBorder = 'border-l-rose-500';
              cardBorder = 'border-rose-300';
            } else if (isApproved) {
              statusAccentBorder = 'border-l-emerald-500';
            } else if (isReturned) {
              statusAccentBorder = 'border-l-slate-400';
            } else if (isRejected) {
              statusAccentBorder = 'border-l-rose-400';
            } else if (isCancelled) {
              statusAccentBorder = 'border-l-zinc-300';
            }

            return (
              <div
                key={rec.id}
                className={`bg-white rounded-2xl border ${cardBorder} border-l-[6px] ${statusAccentBorder} shadow-sm overflow-hidden transition-all duration-200`}
              >
                {/* 1. Header Bar: Order number / ID badge + Status Badge */}
                <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-bold text-[11px] tracking-tight">
                      คำขอที่ #{idx + 1}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      #{rec.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="shrink-0">
                    {getStatusBadge(rec)}
                  </div>
                </div>

                {/* 2. Card Content Body */}
                <div className="p-4 space-y-3">
                  {/* Borrower Details */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                      {rec.borrower_name.charAt(0) || <User className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-zinc-900 text-sm leading-snug">
                        {rec.borrower_name}
                      </div>
                      <div className="inline-flex items-center gap-1.5 flex-wrap mt-1">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-[11px] font-semibold text-zinc-700 whitespace-nowrap">
                          {rec.user_group}
                        </span>
                        {rec.department_or_unit && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-[11px] font-medium text-indigo-700 border border-indigo-100/80 whitespace-nowrap truncate max-w-[170px]">
                            {rec.department_or_unit}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Borrow Items */}
                  <div className="space-y-1.5 pt-0.5">
                    {rec.borrow_items && rec.borrow_items.length > 0 ? (
                      rec.borrow_items.map((bi) => (
                        <div
                          key={bi.id}
                          className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <Package className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="font-semibold text-zinc-800 truncate">
                              {bi.item?.name || 'อุปกรณ์'}
                            </span>
                          </div>
                          <div className="shrink-0">
                            {isApproved || isReturned ? (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full whitespace-nowrap">
                                อนุมัติ {bi.approved_qty ?? bi.requested_qty} ชิ้น
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-zinc-700 bg-zinc-200/80 px-2 py-0.5 rounded-full whitespace-nowrap">
                                ขอ {bi.requested_qty} ชิ้น
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-400">ไม่มีรายการอุปกรณ์</span>
                    )}
                  </div>

                  {/* Dates Summary */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
                    <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] text-zinc-400">วันที่ใช้งาน</div>
                        <div className="font-semibold text-zinc-800 truncate">{formatDate(rec.use_date)}</div>
                      </div>
                    </div>
                    <div
                      className={`p-2 rounded-xl border flex items-center gap-1.5 ${
                        isOverdue ? 'bg-rose-50 border-rose-200' : 'bg-zinc-50 border-zinc-100'
                      }`}
                    >
                      <Calendar
                        className={`w-3.5 h-3.5 shrink-0 ${isOverdue ? 'text-rose-500' : 'text-zinc-400'}`}
                      />
                      <div className="min-w-0">
                        <div className={`text-[10px] ${isOverdue ? 'text-rose-600 font-bold' : 'text-zinc-400'}`}>
                          {isOverdue ? 'เกินกำหนดคืน' : 'วันที่คืน'}
                        </div>
                        <div
                          className={`font-semibold truncate ${
                            isOverdue ? 'text-rose-700 font-bold' : 'text-zinc-800'
                          }`}
                        >
                          {formatDate(rec.return_date)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Accordion Details */}
                  {isExpanded && (
                    <div className="pt-1">
                      <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/80 text-xs space-y-2 text-zinc-600 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="text-zinc-500">อีเมล:</span>
                          <a
                            href={`mailto:${rec.borrower_email}`}
                            className="text-indigo-600 font-medium truncate hover:underline"
                          >
                            {rec.borrower_email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="text-zinc-500">โทร:</span>
                          {rec.phone ? (
                            <a
                              href={`tel:${rec.phone}`}
                              className="text-indigo-600 font-semibold hover:underline"
                            >
                              {rec.phone} (กดโทร)
                            </a>
                          ) : (
                            <span className="text-zinc-400">-</span>
                          )}
                        </div>
                        {rec.purpose && (
                          <div className="flex items-start gap-2 pt-1.5 border-t border-slate-200/60">
                            <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-zinc-500">วัตถุประสงค์: </span>
                              <span className="text-zinc-800">{rec.purpose}</span>
                            </div>
                          </div>
                        )}
                        {rec.pickup_time && (
                          <div className="flex items-center gap-2 text-indigo-700 font-medium pt-1.5 border-t border-slate-200/60">
                            <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span>เวลานัดรับของ: {rec.pickup_time}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-1.5 border-t border-slate-200/60">
                          <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span>ยื่นคำขอเมื่อ: {formatDateTime(rec.created_at)}</span>
                        </div>
                        {isRejected && rec.admin_note && (
                          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
                            <strong className="block mb-0.5">เหตุผลที่ไม่อนุมัติ:</strong>
                            <span>{rec.admin_note}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Dedicated Tinted Action Footer */}
                <div className="px-4 py-3 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    {isPending && (
                      <>
                        <button
                          onClick={() => onOpenApproval(rec, 'approve')}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                          title="อนุมัติคำขอ"
                        >
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>อนุมัติ</span>
                        </button>
                        <button
                          onClick={() => onOpenApproval(rec, 'reject')}
                          className="flex-1 py-2 px-3 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs"
                          title="ไม่อนุมัติคำขอ"
                        >
                          <XCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>ไม่อนุมัติ</span>
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <button
                        onClick={() => onReturnRecord(rec)}
                        className="flex-1 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                        title="รับคืนอุปกรณ์"
                      >
                        <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                        <span>กดรับคืน</span>
                      </button>
                    )}

                    {isReturned && (
                      <span className="text-xs text-zinc-400 font-medium whitespace-nowrap py-1">คืนแล้วเรียบร้อย</span>
                    )}

                    {isRejected && (
                      <span className="text-xs text-rose-400 font-medium whitespace-nowrap py-1">ไม่อนุมัติ</span>
                    )}

                    {isCancelled && (
                      <span className="text-xs text-slate-400 font-medium whitespace-nowrap py-1">ยกเลิกแล้ว</span>
                    )}
                  </div>

                  {/* Expand / Collapse Button */}
                  <button
                    onClick={() => toggleExpand(rec.id)}
                    className="py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center gap-1 transition shrink-0 shadow-xs"
                    title={isExpanded ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียดเพิ่มเติม'}
                  >
                    <span>{isExpanded ? 'ซ่อน' : 'รายละเอียด'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (hidden md:block) */}
      <div className="hidden md:block bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[1050px] text-left text-sm text-zinc-600">
          <thead className="bg-zinc-50 text-zinc-700 font-bold border-b border-zinc-200 text-xs">
            <tr>
              <th className="py-4 px-5 w-[22%] min-w-[200px] whitespace-nowrap">ผู้ขอยืม / ข้อมูลติดต่อ</th>
              <th className="py-4 px-5 w-[22%] min-w-[200px] whitespace-nowrap">รายการอุปกรณ์</th>
              <th className="py-4 px-5 w-[16%] min-w-[140px] whitespace-nowrap">วัตถุประสงค์</th>
              <th className="py-4 px-5 w-[18%] min-w-[180px] whitespace-nowrap">กำหนดการ (รับ - คืน)</th>
              <th className="py-4 px-4 w-[11%] min-w-[125px] whitespace-nowrap">สถานะ</th>
              <th className="py-4 px-5 w-[11%] min-w-[160px] text-center whitespace-nowrap">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-xs sm:text-sm">
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-20 text-zinc-400">
                  <div className="flex flex-col items-center justify-center">
                    <Package className="w-10 h-10 mb-2 opacity-40 text-zinc-400 stroke-[1.2]" />
                    <p className="font-semibold text-zinc-600">ไม่พบรายการคำขอยืมตามเงื่อนไขที่เลือก</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      ลองเปลี่ยนตัวกรอง ค้นหาคำใหม่ หรือกดปุ่ม &quot;ล้างตัวกรอง&quot;
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
                const isCancelled = rec.status === 'cancelled';
                const isOverdue = isApproved && rec.return_date < todayStr;

                return (
                  <tr
                    key={rec.id}
                    className={`transition ${
                      isOverdue
                        ? 'bg-amber-50/40 hover:bg-amber-50/70'
                        : 'hover:bg-zinc-50/70'
                    }`}
                  >
                    {/* 1. Borrower Info */}
                    <td className="py-4 px-5 align-top">
                      <div className="font-bold text-zinc-900 text-sm leading-snug">{rec.borrower_name}</div>
                      <div className="inline-flex items-center gap-1.5 flex-wrap mt-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-[11px] font-semibold text-zinc-700 whitespace-nowrap">
                          {rec.user_group}
                        </span>
                        {rec.department_or_unit && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-[11px] font-medium text-indigo-700 border border-indigo-100/80 whitespace-nowrap">
                            {rec.department_or_unit}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1.5 space-y-0.5">
                        <div className="truncate max-w-[190px]">{rec.borrower_email}</div>
                        <div>โทร: {rec.phone || '-'}</div>
                      </div>
                    </td>

                    {/* 2. Equipment Items */}
                    <td className="py-4 px-5 align-top">
                      <div className="space-y-1.5 max-w-sm">
                        {rec.borrow_items && rec.borrow_items.length > 0 ? (
                          rec.borrow_items.map((bi) => (
                            <div
                              key={bi.id}
                              className="p-2 bg-zinc-50 border border-zinc-200/80 rounded-xl flex items-center justify-between gap-2 text-xs"
                            >
                              <span className="font-medium text-zinc-800 truncate mr-1">
                                • {bi.item?.name || 'อุปกรณ์'}
                              </span>
                              <div className="shrink-0 text-right">
                                {isApproved || isReturned ? (
                                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                    อนุมัติ {bi.approved_qty ?? bi.requested_qty} ชิ้น
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-semibold text-zinc-600 bg-zinc-200/80 px-2 py-0.5 rounded-full whitespace-nowrap">
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

                    {/* 3. Purpose & Admin Note */}
                    <td className="py-4 px-5 align-top">
                      <p className="text-xs text-zinc-700 leading-relaxed max-w-[180px] break-words">
                        {rec.purpose || '-'}
                      </p>
                      {isRejected && rec.admin_note && (
                        <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800 leading-snug">
                          <span className="font-bold">เหตุผลที่ไม่อนุมัติ: </span>
                          <span>{rec.admin_note}</span>
                        </div>
                      )}
                      {rec.pickup_time && (
                        <div className="mt-1.5 text-[11px] text-indigo-700 font-medium">
                          นัดรับของ: {rec.pickup_time}
                        </div>
                      )}
                    </td>

                    {/* 4. Dates */}
                    <td className="py-4 px-5 align-top text-xs space-y-1">
                      <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                        <span className="text-zinc-400 shrink-0">วันใช้งาน:</span>
                        <span className="font-bold text-zinc-800 whitespace-nowrap">{formatDate(rec.use_date)}</span>
                      </div>
                      <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                        <span className="text-zinc-400 shrink-0">กำหนดคืน:</span>
                        <span
                          className={`font-bold whitespace-nowrap ${
                            isOverdue ? 'text-rose-600 underline' : 'text-zinc-800'
                          }`}
                        >
                          {formatDate(rec.return_date)}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 pt-0.5 whitespace-nowrap">
                        ส่งคำขอ: {formatDateTime(rec.created_at)}
                      </div>
                    </td>

                    {/* 5. Status Badge */}
                    <td className="py-4 px-4 align-top">
                      {getStatusBadge(rec)}
                    </td>

                    {/* 6. Action Buttons */}
                    <td className="py-4 px-5 align-top text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-nowrap">
                        {isPending && (
                          <>
                            <button
                              onClick={() => onOpenApproval(rec, 'approve')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1 whitespace-nowrap"
                              title="อนุมัติคำขอ"
                            >
                              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>อนุมัติ</span>
                            </button>
                            <button
                              onClick={() => onOpenApproval(rec, 'reject')}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 whitespace-nowrap"
                              title="ไม่อนุมัติ"
                            >
                              <XCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>ไม่อนุมัติ</span>
                            </button>
                          </>
                        )}

                        {isApproved && (
                          <button
                            onClick={() => onReturnRecord(rec)}
                            className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                          >
                            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                            <span>กดรับคืน</span>
                          </button>
                        )}

                        {isReturned && (
                          <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">คืนแล้วเรียบร้อย</span>
                        )}

                        {isRejected && (
                          <span className="text-xs text-rose-400 font-medium whitespace-nowrap">ไม่อนุมัติ</span>
                        )}

                        {isCancelled && (
                          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">ยกเลิกแล้ว</span>
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
  </div>
);
}
