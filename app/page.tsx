'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Item } from '@/lib/types';
import Navbar from '@/components/Navbar';
import EquipmentCard from '@/components/EquipmentCard';
import CartDrawer from '@/components/CartDrawer';
import BorrowModal from '@/components/BorrowModal';
import { Search, Boxes, Sparkles, CheckCircle2, RefreshCw, X } from 'lucide-react';

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // ดึงข้อมูลรายการอุปกรณ์ และเปิด Realtime Subscription
  useEffect(() => {
    fetchItems();

    // Realtime channel เพื่ออัปเดตสถานะคงเหลือแบบทันทีเมื่อมีการยืม/คืน
    const channel = supabase
      .channel('realtime_items_public')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setItems((prev) =>
              prev.map((it) => (it.id === payload.new.id ? (payload.new as Item) : it))
            );
          } else if (payload.eventType === 'INSERT') {
            setItems((prev) => [payload.new as Item, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setItems((prev) => prev.filter((it) => it.id === payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  // หมวดหมู่ทั้งหมด
  const categories = [
    'ทั้งหมด',
    ...Array.from(new Set(items.map((i) => i.category || 'ทั่วไป'))),
  ];

  // กรองตามการค้นหาและหมวดหมู่
  const filteredItems = items.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    const matchCategory =
      selectedCategory === 'ทั้งหมด' || (item.category || 'ทั่วไป') === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Banner Title Area */}
        <div className="mb-8 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold mb-3 border border-indigo-400/20">
              <Sparkles className="w-3.5 h-3.5" /> ระบบยืม-คืนอุปกรณ์ออนไลน์
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
              บริการยืม-คืนอุปกรณ์และสื่อการสอน
            </h2>
            <p className="text-sm sm:text-base text-indigo-100/80 leading-relaxed">
              สำหรับอาจารย์และบุคลากรในสาขาวิชา สามารถเลือกอุปกรณ์ลงตะกร้าและทำการยืมได้สะดวกรวดเร็ว
              พร้อมตรวจสอบสต็อกคงเหลือแบบ Real-time
            </p>
          </div>
        </div>

        {/* Success Alert Banner */}
        {notification && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-sm font-medium">{notification}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-emerald-600 hover:text-emerald-800 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-8">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ค้นหาชื่ออุปกรณ์ เช่น iPad, กล้อง, ไมโครโฟน..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm text-sm"
            />
          </div>

          {/* Categories Tab Pill */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Grid List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm animate-pulse flex flex-col justify-between"
              >
                <div>
                  <div className="w-full h-48 bg-slate-200 rounded-2xl mb-4" />
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-1/2 mb-4" />
                </div>
                <div className="h-10 bg-slate-200 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Boxes className="w-16 h-16 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">ไม่พบรายการอุปกรณ์</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              ลองเปลี่ยนคำค้นหา หรือเลือกดูหมวดหมู่อื่นๆ
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('ทั้งหมด');
              }}
              className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition"
            >
              ล้างการค้นหาทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <EquipmentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer Component */}
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />

      {/* Checkout Modal Form */}
      <BorrowModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={(msg) => {
          setNotification(msg);
          fetchItems();
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} ระบบยืม-คืนอุปกรณ์ประจำสาขาวิชา • พัฒนาด้วย Next.js, Tailwind CSS และ Supabase
        </div>
      </footer>
    </div>
  );
}
