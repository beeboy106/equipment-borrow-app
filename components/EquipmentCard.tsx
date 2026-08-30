'use client';

import React from 'react';
import { Item } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { Plus, Check, Package, Sparkles } from 'lucide-react';

interface EquipmentCardProps {
  item: Item;
}

export default function EquipmentCard({ item }: EquipmentCardProps) {
  const { cart, addToCart } = useCart();

  const cartEntry = cart.find((c) => c.item.id === item.id);
  const inCartQty = cartEntry ? cartEntry.quantity : 0;
  const isOutOfStock = item.available_quantity <= 0;
  const isMaxInCart = inCartQty >= item.available_quantity;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col hover:shadow-lg hover:border-slate-300 transition-all duration-300 group">
      {/* Image Preview Area */}
      <div className="relative h-48 sm:h-52 bg-gradient-to-tr from-slate-100 to-slate-200/70 overflow-hidden flex items-center justify-center">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400">
            <Package className="w-12 h-12 mb-1 opacity-50" />
            <span className="text-xs">ไม่มีรูปภาพ</span>
          </div>
        )}

        {/* Category Badge */}
        <span className="absolute top-3.5 left-3.5 text-xs font-semibold px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-700 shadow-sm">
          {item.category || 'ทั่วไป'}
        </span>

        {/* Stock Badge Overlay */}
        <span
          className={`absolute top-3.5 right-3.5 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${
            isOutOfStock
              ? 'bg-rose-500 text-white'
              : item.available_quantity <= 2
              ? 'bg-amber-500 text-white'
              : 'bg-emerald-500 text-white'
          }`}
        >
          {isOutOfStock ? 'ของหมด' : `เหลือ ${item.available_quantity} ชิ้น`}
        </span>
      </div>

      {/* Details Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base mb-1.5 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {item.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {item.description || 'ไม่มีคำอธิบายเพิ่มเติมสำหรับอุปกรณ์นี้'}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3.5">
            <span>ทั้งหมดในสาขา:</span>
            <span className="font-semibold text-slate-700">{item.total_quantity} ชิ้น</span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={() => addToCart(item, 1)}
            disabled={isOutOfStock || isMaxInCart}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-sm ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : isMaxInCart
                ? 'bg-amber-50 text-amber-700 border border-amber-200 cursor-not-allowed'
                : inCartQty > 0
                ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-200'
            }`}
          >
            {isOutOfStock ? (
              'สินค้าหมดชั่วคราว'
            ) : isMaxInCart ? (
              <>
                <Check className="w-4 h-4 text-amber-600" />
                เลือกครบจำนวนสต็อกแล้ว ({inCartQty})
              </>
            ) : inCartQty > 0 ? (
              <>
                <Plus className="w-4 h-4" />
                ในตะกร้า ({inCartQty}) + เพิ่มอีก
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                เลือกยืมอุปกรณ์นี้
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
