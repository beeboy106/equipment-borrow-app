'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, LogIn, LogOut, Clock, Layers } from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const { totalItemsCount, setIsCartOpen, clearCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        clearCart();
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [clearCart, router]);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  const handleLogout = async () => {
    clearCart();
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform duration-300">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
              ระบบยืม-คืนอุปกรณ์
            </div>
            <div className="text-xs text-slate-400 font-medium">
              สาขาวิชาเทคโนโลยีสารสนเทศและคอมพิวเตอร์
            </div>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* My Requests Link (if logged in) */}
          {user && (
            <Link
              href="/my-requests"
              className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 transition font-bold text-xs shadow-sm"
            >
              <Clock className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">คำขอของฉัน</span>
            </Link>
          )}

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition font-bold text-xs border border-indigo-200/70 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">ตะกร้า</span>
            {totalItemsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold shadow-sm">
                {totalItemsCount}
              </span>
            )}
          </button>

          {/* User Profile / Login */}
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div
                    className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold max-w-[140px] sm:max-w-xs truncate"
                    title={user.email}
                  >
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="User"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden md:inline truncate">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-600 transition rounded-xl hover:bg-rose-50"
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
