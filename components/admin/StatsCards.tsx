'use client';

import React from 'react';
import { StatsSummary } from '@/lib/types';
import { Clock, CheckCircle2, XCircle, RotateCcw, Layers, Boxes } from 'lucide-react';

interface StatsCardsProps {
  stats: StatsSummary;
}

const StatsCards = React.memo(function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
      {/* 1. รอการอนุมัติ */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-2.5 sm:gap-4 hover:border-zinc-300 transition min-w-0">
        <div className="p-2 sm:p-3.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs text-zinc-500 font-semibold truncate">รออนุมัติ</p>
          <h3 className="text-lg sm:text-2xl font-black text-zinc-900 mt-0.5 whitespace-nowrap">
            {stats.pendingRequests}{' '}
            <span className="text-[10px] sm:text-xs font-normal text-zinc-400">คำขอ</span>
          </h3>
        </div>
      </div>

      {/* 2. อนุมัติแล้ว (กำลังใช้งาน/รอคืน) */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-2.5 sm:gap-4 hover:border-zinc-300 transition min-w-0">
        <div className="p-2 sm:p-3.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs text-zinc-500 font-semibold truncate">อนุมัติแล้ว</p>
          <h3 className="text-lg sm:text-2xl font-black text-zinc-900 mt-0.5 whitespace-nowrap">
            {stats.approvedRequests}{' '}
            <span className="text-[10px] sm:text-xs font-normal text-zinc-400">คำขอ</span>
          </h3>
        </div>
      </div>

      {/* 3. คืนอุปกรณ์แล้ว */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-2.5 sm:gap-4 hover:border-zinc-300 transition min-w-0">
        <div className="p-2 sm:p-3.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
          <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs text-zinc-500 font-semibold truncate">คืนสำเร็จ</p>
          <h3 className="text-lg sm:text-2xl font-black text-zinc-900 mt-0.5 whitespace-nowrap">
            {stats.returnedRequests}{' '}
            <span className="text-[10px] sm:text-xs font-normal text-zinc-400">คำขอ</span>
          </h3>
        </div>
      </div>

      {/* 4. อุปกรณ์คงเหลือ / ทั้งหมด */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-2.5 sm:gap-4 hover:border-zinc-300 transition min-w-0">
        <div className="p-2 sm:p-3.5 bg-zinc-100 text-zinc-700 rounded-xl shrink-0">
          <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs text-zinc-500 font-semibold truncate">สต็อกพร้อมใช้</p>
          <h3 className="text-lg sm:text-2xl font-black text-zinc-900 mt-0.5 whitespace-nowrap">
            {stats.availableItems}{' '}
            <span className="text-[10px] sm:text-xs font-normal text-zinc-400">/ {stats.totalItems}</span>
          </h3>
        </div>
      </div>
    </div>
  );
});

export default StatsCards;
