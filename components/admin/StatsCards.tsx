'use client';

import React from 'react';
import { StatsSummary } from '@/lib/types';
import { Clock, CheckCircle2, Layers, Boxes, AlertTriangle } from 'lucide-react';

interface StatsCardsProps {
  stats: StatsSummary;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. รายการที่กำลังถูกยืมอยู่ */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:border-slate-300 transition">
        <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-semibold">กำลังถูกยืมอยู่ (Active)</p>
          <h3 className="text-2xl font-black text-slate-900 mt-0.5">
            {stats.activeBorrows}{' '}
            <span className="text-xs font-normal text-slate-400">รายการ</span>
          </h3>
        </div>
      </div>

      {/* 2. คืนสำเร็จแล้ว */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:border-slate-300 transition">
        <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-semibold">คืนอุปกรณ์แล้ว (Returned)</p>
          <h3 className="text-2xl font-black text-slate-900 mt-0.5">
            {stats.returnedBorrows}{' '}
            <span className="text-xs font-normal text-slate-400">รายการ</span>
          </h3>
        </div>
      </div>

      {/* 3. สต็อกคงเหลือ / ทั้งหมด */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:border-slate-300 transition">
        <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-semibold">อุปกรณ์คงเหลือ / ทั้งหมด</p>
          <h3 className="text-2xl font-black text-slate-900 mt-0.5">
            {stats.availableItems}{' '}
            <span className="text-sm font-semibold text-slate-400">/ {stats.totalItems} ชิ้น</span>
          </h3>
        </div>
      </div>

      {/* 4. ชนิดอุปกรณ์ทั้งหมด */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:border-slate-300 transition">
        <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
          <Boxes className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-semibold">ชนิดอุปกรณ์ทั้งหมด</p>
          <h3 className="text-2xl font-black text-slate-900 mt-0.5">
            {stats.categoriesCount}{' '}
            <span className="text-xs font-normal text-slate-400">ชนิด</span>
          </h3>
        </div>
      </div>
    </div>
  );
}
