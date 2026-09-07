'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { subscribeAuth, loginWithGoogle, logoutUser } from '@/lib/firebase/authService';
import { useCartStore, selectTotalItemsCount } from '@/lib/store/cartStore';
import { ShoppingBag, LogIn, LogOut, Clock, Layers } from 'lucide-react';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const totalItemsCount = useCartStore(selectTotalItemsCount);
  const setIsCartOpen = useCartStore((s) => s.setIsCartOpen);
  const clearCart = useCartStore((s) => s.clearCart);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      router.push('/');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/popup-closed-by-user') return;
      if (err.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'Vercel domain';
        alert(`โดเมน "${domain}" ยังไม่ได้รับอนุญาตใน Firebase Authentication\nกรุณาเพิ่มโดเมนนี้ที่ Firebase Console -> Authentication -> Settings -> Authorized domains`);
      } else {
        alert(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    }
  };

  const handleLogout = async () => {
    clearCart();
    await logoutUser();
    setUser(null);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 min-h-[64px] h-auto sm:h-20 py-2.5 sm:py-0 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform duration-300 shrink-0">
            <Layers className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-xs sm:text-lg leading-tight group-hover:text-indigo-600 transition-colors whitespace-nowrap">
              ยืม-คืนอุปกรณ์
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 font-medium whitespace-nowrap">
              คณะวิทยาศาสตร์
            </div>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* My Requests Link (if logged in) */}
          {user && (
            <Link
              href="/my-requests"
              className="flex items-center gap-1.5 p-2 sm:py-2.5 sm:px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 transition font-bold text-xs shadow-xs"
              title="คำขอของฉัน"
            >
              <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="hidden sm:inline">คำขอของฉัน</span>
            </Link>
          )}

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1.5 sm:gap-2 p-2 sm:py-2.5 sm:px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 transition font-bold text-xs border border-indigo-200/70 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="ตะกร้าอุปกรณ์"
            aria-label={`ตะกร้าอุปกรณ์ มี ${totalItemsCount} ชิ้น`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">ตะกร้า</span>
            {totalItemsCount > 0 ? (
              <span className="absolute -top-1 -right-1 sm:static w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-indigo-600 text-white text-[9px] sm:text-[11px] flex items-center justify-center font-bold shadow-xs">
                {totalItemsCount}
              </span>
            ) : null}
          </button>

          {/* User Profile / Login */}
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-1 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-200">
                  {/* Desktop User Pill */}
                  <div
                    className="hidden sm:flex items-center gap-2 py-1.5 px-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold max-w-xs truncate"
                    title={user.email || undefined}
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="User"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="truncate">
                      {user.displayName || user.email}
                    </span>
                  </div>

                  {/* Mobile User Avatar Only */}
                  <div className="sm:hidden" title={user.displayName || user.email || ''}>
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="User"
                        className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-100"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-indigo-100">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 transition rounded-xl hover:bg-rose-50"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition font-bold text-xs shadow-md shadow-indigo-200"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                  <span>เข้าสู่ระบบ</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
