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
          {/* Add to Cart Button */}
          <button
            onClick={() => addToCart(item, 1)}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-sm ${
              inCartQty > 0
                ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-md'
            }`}
          >
            {inCartQty > 0 ? (
              <>
                <Check className="w-4 h-4 text-indigo-600" />
                <span>ในตะกร้า ({inCartQty}) + เพิ่มอีก</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>เลือกยืมอุปกรณ์นี้</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
