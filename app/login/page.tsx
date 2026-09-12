'use client';

import React, { useState, useEffect } from 'react';
import { subscribeAuth, loginWithGoogle } from '@/lib/firebase/authService';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Shield } from 'lucide-react';

export default function UserLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeAuth((user) => {
      if (user) {
        router.replace('/');
      } else {
        setCheckingAuth(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      router.replace('/');
    } catch (err: any) {
      console.error('Google login error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setLoading(false);
        return;
      }
      let msg = err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google';
      if (err.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'Vercel domain';
        msg = `โดเมน "${domain}" ยังไม่ได้รับอนุญาตใน Firebase กรุณาเพิ่มใน Firebase Console -> Authentication -> Settings -> Authorized domains`;
      }
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-[460px] w-full bg-white rounded-2xl shadow-sm border border-gray-200/80 p-7 sm:p-9 animate-in zoom-in-95 duration-200">
        {/* Badge */}
        <div className="mb-3">
          <span className="inline-block bg-[#c2f33c] text-black font-extrabold text-[10px] sm:text-[11px] tracking-wider px-2.5 py-1 rounded">
            PSU SCIENCE CENTRAL SERVICES
          </span>
        </div>

        {/* Title & Subtitle */}
        <div className="mb-5 sm:mb-6">
          <h1 className="text-2xl sm:text-[26px] font-black text-gray-900 tracking-tight">
            ระบบยืม-คืนอุปกรณ์จัดเลี้ยง
          </h1>
          <p className="text-xs sm:text-[13px] text-gray-500 mt-1">
            งานบริการกลาง คณะวิทยาศาสตร์ มหาวิทยาลัยสงขลานครินทร์
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-5 sm:my-6" />

        {/* Error Alert */}
        {errorMsg ? (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{errorMsg}</p>
          </div>
        ) : null}

        {/* Notice & Login Button */}
        <div className="space-y-4">
          <div className="p-4 bg-[#f8f9fa] rounded-xl border border-gray-100/80 text-center">
            <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">
              สำหรับอาจารย์ นักศึกษา และบุคลากรภายในคณะวิทยาศาสตร์ กรุณาเข้าสู่ระบบด้วยบัญชี Google เพื่อยื่นคำขอยืมอุปกรณ์
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 bg-[#3b82f6] hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2.5 shadow-sm transition disabled:opacity-50"
          >
            {loading ? (
              <span>กำลังนำทางสู่ Google...</span>
            ) : (
              <>
                <svg className="w-4 h-4 fill-white flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
                <span>เข้าสู่ระบบด้วย Google</span>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-5 sm:my-6" />

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs pt-1">
          <span className="text-gray-400">Google OAuth ผ่าน Firebase</span>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-gray-800 hover:text-black font-semibold transition hover:underline"
          >
            <Shield className="w-3.5 h-3.5 text-gray-700" />
            <span>เข้าสู่ระบบผู้ดูแลระบบ (Admin)</span>
            <span className="text-gray-400">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
