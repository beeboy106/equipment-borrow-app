'use client';

import React from 'react';
import { useCartStore, selectTotalItemsCount } from '@/lib/store/cartStore';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function FloatingCartBar() {
  const totalItemsCount = useCartStore(selectTotalItemsCount);
  const cartTypesCount = useCartStore((s) => s.cart.length);
  const setIsCartOpen = useCartStore((s) => s.setIsCartOpen);

  if (totalItemsCount === 0) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-40 px-3 sm:px-4 pointer-events-none flex justify-center">
      <div className="pointer-events-auto max-w-xl w-full bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/60 shadow-2xl rounded-2xl p-2.5 sm:p-3.5 flex items-center justify-between gap-2.5 sm:gap-4 animate-in slide-in-from-bottom-6 duration-300">
        {/* Left: Icon and Summary */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pl-0.5 sm:pl-1">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] sm:text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-sm animate-pulse">
              {totalItemsCount}
            </span>
          </div>

          {/* Mobile Text */}
          <div className="sm:hidden min-w-0">
            <div className="font-bold text-xs text-white leading-tight whitespace-nowrap">
              ตะกร้า ({totalItemsCount} ชิ้น)
            </div>
            <div className="text-[10px] text-slate-300 whitespace-nowrap">
              เลือกไว้ {cartTypesCount} รายการ
            </div>
          </div>

          {/* Desktop Text */}
          <div className="hidden sm:block min-w-0">
            <div className="font-bold text-sm text-slate-100 truncate">
              เลือกไว้ {cartTypesCount} รายการ
            </div>
            <div className="text-xs text-slate-400">
              รวมทั้งหมด <span className="text-indigo-400 font-semibold">{totalItemsCount} ชิ้น</span>
            </div>
          </div>
        </div>

        {/* Right: Open Drawer Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-3.5 sm:px-5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition duration-150 whitespace-nowrap"
        >
          <span className="sm:hidden">ดูตะกร้า</span>
          <span className="hidden sm:inline">ดูตะกร้า / ยืนยันการยืม</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}
