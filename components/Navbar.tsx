'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Laptop, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { totalItemsCount, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition duration-200">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              ระบบยืม-คืนอุปกรณ์
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              สำหรับอาจารย์และบุคลากรในสาขาวิชา
            </p>
          </div>
        </Link>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative px-3 sm:px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-sm transition flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">ตะกร้า</span>
            {totalItemsCount > 0 && (
              <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                {totalItemsCount}
              </span>
            )}
          </button>

          {/* Admin Dashboard Link */}
          <Link
            href="/admin/dashboard"
            className="px-3 sm:px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-semibold text-sm transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">ผู้ดูแลระบบ</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
