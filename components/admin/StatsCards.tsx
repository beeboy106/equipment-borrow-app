'use client';

import React from 'react';
import { StatsSummary } from '@/lib/types';
import { Clock, CheckCircle2, XCircle, RotateCcw, Layers, Boxes } from 'lucide-react';

interface StatsCardsProps {
  stats: StatsSummary;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. รอการอนุมัติ */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center gap-4 hover:border-zinc-300 transition">
        <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <p className="text-xs text-zinc-500 font-semibold">รออนุมัติ (Pending)</p>
          <h3 className="text-2xl font-black text-zinc-900 mt-0.5">
            {stats.pendingRequests}{' '}
            <span className="text-xs font-normal text-zinc-400">คำขอ</span>
          </h3>
        </div>
      </div>

      {/* 2. อนุมัติแล้ว (กำลังใช้งาน/รอคืน) */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center gap-4 hover:border-zinc-300 transition">
        <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-zinc-500 font-semibold">อนุมัติแล้ว (Approved)</p>
          <h3 className="text-2xl font-black text-zinc-900 mt-0.5">
            {stats.approvedRequests}{' '}
            <span className="text-xs font-normal text-zinc-400">คำขอ</span>
          </h3>
        </div>
      </div>

      {/* 3. คืนอุปกรณ์แล้ว */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center gap-4 hover:border-zinc-300 transition">
        <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
          <RotateCcw className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-zinc-500 font-semibold">คืนสำเร็จ (Returned)</p>
          <h3 className="text-2xl font-black text-zinc-900 mt-0.5">
            {stats.returnedRequests}{' '}
            <span className="text-xs font-normal text-zinc-400">คำขอ</span>
          </h3>
        </div>
      </div>

      {/* 4. อุปกรณ์คงเหลือ / ทั้งหมด */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center gap-4 hover:border-zinc-300 transition">
        <div className="p-3.5 bg-zinc-100 text-zinc-700 rounded-xl">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-zinc-500 font-semibold">สต็อกพร้อมใช้ / ทั้งหมด</p>
          <h3 className="text-2xl font-black text-zinc-900 mt-0.5">
            {stats.availableItems}{' '}
            <span className="text-xs font-normal text-zinc-400">/ {stats.totalItems} ชิ้น</span>
          </h3>
        </div>
      </div>
    </div>
  );
}
