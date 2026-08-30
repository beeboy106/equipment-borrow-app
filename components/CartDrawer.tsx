'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, Package } from 'lucide-react';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export default function CartDrawer({ onOpenCheckout }: CartDrawerProps) {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItemsCount,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base">รายการที่เลือกยืม</h2>
              <p className="text-xs text-slate-500">{totalItemsCount} รายการทั้งหมดในตะกร้า</p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Package className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold text-slate-600">ยังไม่มีอุปกรณ์ในตะกร้า</p>
              <p className="text-xs text-slate-400 mt-1">เลือกอุปกรณ์ที่คุณต้องการยืมจากหน้าหลัก</p>
            </div>
          ) : (
            cart.map(({ item, quantity }) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3.5 hover:border-slate-300 transition"
              >
                {/* Item Thumbnail */}
                <div className="w-16 h-16 bg-white rounded-xl border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6 text-slate-300" />
                  )}
                </div>

                {/* Info & Quantity controls */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{item.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    คงเหลือในสต็อก: {item.available_quantity} ชิ้น
                  </p>

                  <div className="flex items-center gap-2 mt-2.5">
                    <button
                      onClick={() => updateQuantity(item.id, quantity - 1)}
                      className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition shadow-sm"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-slate-800 w-6 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, quantity + 1)}
                      disabled={quantity >= item.available_quantity}
                      className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition disabled:opacity-40 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-xl transition"
                  title="ลบออกจากตะกร้า"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-slate-600">จำนวนที่ขอยืมทั้งหมด</span>
              <span className="text-indigo-600 text-base font-bold">{totalItemsCount} ชิ้น</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={clearCart}
                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-200 text-xs font-bold transition"
              >
                ล้างตะกร้า
              </button>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onOpenCheckout();
                }}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2"
              >
                <span>กรอกข้อมูลยืนยันการยืม</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
