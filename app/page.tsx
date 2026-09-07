'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { subscribeAuth } from '@/lib/firebase/authService';
import { subscribeItems } from '@/lib/firebase/firestoreService';
import { Item } from '@/lib/types';
import { useCartStore, selectToastMessage } from '@/lib/store/cartStore';
import Navbar from '@/components/Navbar';
import EquipmentCard from '@/components/EquipmentCard';
import FloatingCartBar from '@/components/FloatingCartBar';
import { Search, Boxes, Sparkles, CheckCircle2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Dynamic Imports for Heavy Modals (atomic-component.md: bundle-dynamic-imports)
const CartDrawer = dynamic(() => import('@/components/CartDrawer'), {
  ssr: false,
});
const BorrowModal = dynamic(() => import('@/components/BorrowModal'), {
  ssr: false,
});

export default function HomePage() {
  const router = useRouter();
  const toastMessage = useCartStore(selectToastMessage);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check user authentication
    const unsubscribeAuth = subscribeAuth((user) => {
      if (!user) {
        router.push('/login');
      }
    });

    // 2. Real-time items listener via Cloud Firestore onSnapshot
    setLoading(true);
    const unsubscribeItems = subscribeItems((updatedItems) => {
      setItems(updatedItems);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeItems();
    };
  }, [router]);

  const categories = useMemo(
    () => ['ทั้งหมด', ...Array.from(new Set(items.map((i) => i.category || 'ทั่วไป')))],
    [items]
  );

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term));
      const matchCategory =
        selectedCategory === 'ทั้งหมด' || (item.category || 'ทั่วไป') === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [items, search, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans pb-28 sm:pb-24 w-full max-w-full overflow-x-hidden">
      <Navbar />

      {/* Floating Toast Notification */}
      {toastMessage ? (
        <div className="fixed top-20 sm:top-24 right-3 sm:right-8 z-50 bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl shadow-xl border border-slate-700/50 flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-4 fade-in duration-200 max-w-[90vw]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      ) : null}

      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-10 min-w-0">
        {/* Banner Title Area */}
        <div className="mb-5 sm:mb-8 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden w-full">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl min-w-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-[11px] sm:text-xs font-semibold mb-2 sm:mb-3 border border-indigo-400/20 max-w-full">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">ยืม-คืนอุปกรณ์ออนไลน์</span>
            </span>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-1.5 sm:mb-2 leading-tight sm:leading-snug break-words">
              ยืม-คืนอุปกรณ์สำหรับจัดเลี้ยง <br className="hidden sm:inline" />
              <span className="text-indigo-200">งานบริการกลาง</span>
            </h2>
            <p className="text-xs sm:text-base text-indigo-100/80 leading-relaxed max-w-xl break-words">
              สำหรับอาจารย์ นักศึกษา และบุคลากร ยืมอุปกรณ์ล่วงหน้าสะดวก พร้อมติดตามสถานะได้ทันที
            </p>
          </div>
        </div>

        {/* Success Alert Banner */}
        {notification ? (
          <div className="mb-5 sm:mb-8 p-3.5 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-xs sm:text-sm font-medium truncate">{notification}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-emerald-600 hover:text-emerald-800 p-1 shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="ปิดการแจ้งเตือน"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        ) : null}

        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-stretch md:items-center mb-6 sm:mb-8 w-full min-w-0">
          {/* Search Input */}
          <div className="relative w-full md:w-80 lg:w-96 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
            <input
              type="text"
              placeholder="ค้นหาชื่ออุปกรณ์ เช่น ผ้า, กล้อง, ไมโครโฟน..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 bg-white shadow-xs text-xs sm:text-sm transition"
            />
          </div>

          {/* Categories Tab Pill */}
          <div className="w-full md:w-auto overflow-x-auto flex gap-1.5 sm:gap-2 pb-1 sm:pb-0 scrollbar-none touch-pan-x shrink min-w-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 animate-pulse flex flex-col justify-between h-80"
              >
                <div className="w-full h-40 bg-slate-200 rounded-2xl mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
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

      {/* Sticky Floating Bottom Bar */}
      <FloatingCartBar />

      {/* Cart Drawer Component */}
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />

      {/* Checkout Modal Form */}
      {isCheckoutOpen ? (
        <BorrowModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={(msg) => {
            setNotification(msg);
          }}
        />
      ) : null}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} ระบบยืม-คืนอุปกรณ์ คณะวิทยาศาสตร์ • พัฒนาด้วย Next.js, Tailwind CSS
        </div>
      </footer>
    </div>
  );
}
