'use client';

import React, { memo } from 'react';
import { Item } from '@/lib/types';
import { useCartStore, selectItemQuantity } from '@/lib/store/cartStore';
import { Plus, Minus, Package, Check } from 'lucide-react';

interface EquipmentCardProps {
  item: Item;
}

function EquipmentCardComponent({ item }: EquipmentCardProps) {
  const inCartQty = useCartStore(selectItemQuantity(item.id));
  const addToCart = useCartStore((s) => s.addToCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col hover:shadow-lg hover:border-slate-300 transition-all duration-300 group">
      {/* Image Preview Area */}
      <div className="relative h-44 sm:h-52 bg-gradient-to-tr from-slate-100 to-slate-200/70 overflow-hidden flex items-center justify-center">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400">
            <Package className="w-10 h-10 sm:w-12 sm:h-12 mb-1 opacity-50" />
            <span className="text-xs">ไม่มีรูปภาพ</span>
          </div>
        )}

        {/* Category Badge */}
        <span className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-700 shadow-xs">
          {item.category || 'ทั่วไป'}
        </span>

        {/* In-cart Indicator Badge */}
        {inCartQty > 0 ? (
          <span className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 text-[11px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-indigo-600 text-white shadow-md flex items-center gap-1 animate-in zoom-in-75 duration-200">
            <Check className="w-3 h-3 stroke-[3]" />
            <span>เลือกแล้ว {inCartQty}</span>
          </span>
        ) : null}
      </div>

      {/* Details Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {item.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3 sm:mb-4">
            {item.description || 'ไม่มีคำอธิบายเพิ่มเติมสำหรับอุปกรณ์นี้'}
          </p>
        </div>

        <div className="pt-2.5 sm:pt-3 border-t border-slate-100">
          {inCartQty > 0 ? (
            /* เมื่อถูกเลือกแล้ว: แสดงชุดปุ่ม [-] จำนวน [+] เพื่อปรับได้ทันที */
            <div className="flex items-center justify-between bg-indigo-50/80 border border-indigo-200/80 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => updateQuantity(item.id, inCartQty - 1)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white text-indigo-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center border border-indigo-100 transition shadow-xs active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                title="ลดจำนวน"
                aria-label={`ลดจำนวน ${item.name}`}
              >
                <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <div className="flex flex-col items-center justify-center px-2 sm:px-3">
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium leading-none mb-0.5">ในตะกร้า</span>
                <span className="text-xs sm:text-sm font-extrabold text-indigo-900 leading-none">
                  {inCartQty} <span className="text-[11px] sm:text-xs font-semibold text-indigo-600">ชิ้น</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => updateQuantity(item.id, inCartQty + 1)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-200 transition active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                title="เพิ่มจำนวน"
                aria-label={`เพิ่มจำนวน ${item.name}`}
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          ) : (
            /* เมื่อยังไม่ถูกเลือก: แสดงปุ่มเพิ่มลงตะกร้า */
            <button
              type="button"
              onClick={() => addToCart(item, 1)}
              className="w-full py-2.5 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 hover:shadow-lg transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>เลือกยืมอุปกรณ์นี้</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(EquipmentCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.item.available_quantity === nextProps.item.available_quantity &&
    prevProps.item.image_url === nextProps.item.image_url &&
    prevProps.item.category === nextProps.item.category
  );
});
