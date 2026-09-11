'use client';

import React, { useState } from 'react';
import { loginWithGoogle, logoutUser } from '@/lib/firebase/authService';
import { checkIsAdmin, registerAdminEmail } from '@/lib/firebase/firestoreService';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft, AlertCircle, KeyRound, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [adminKey, setAdminKey] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showAdminKey, setShowAdminKey] = useState(false);

  const handleToggleMode = () => {
    setIsRegisterMode((prev) => !prev);
    setAdminKey('');
    setErrorMsg(null);
    setShowAdminKey(false);
  };

  // 1. เข้าสู่ระบบ Admin ด้วย Google
  const handleGoogleAdminLogin = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const user = await loginWithGoogle();
      if (!user.email) {
        throw new Error('ไม่พบข้อมูลอีเมลจากบัญชี Google');
      }

      const isAdmin = await checkIsAdmin(user.email);
      if (!isAdmin) {
        await logoutUser();
        setErrorMsg(
          `บัญชี Google (${user.email}) ยังไม่ได้รับสิทธิ์ผู้ดูแลระบบ หากคุณเป็นเจ้าหน้าที่ กรุณาคลิก "ลงทะเบียนสิทธิ์ Admin ด้วย Security Key" ด้านล่าง`
        );
        setLoading(false);
        return;
      }

      router.replace('/admin/dashboard');
    } catch (err: any) {
      console.error('Admin Google login error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setLoading(false);
        return;
      }
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google');
      setLoading(false);
    }
  };

  // 2. ลงทะเบียนผูกสิทธิ์ Admin ด้วย Google + Security Key
  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const expectedKey = process.env.NEXT_PUBLIC_ADMIN_REGISTRATION_KEY || 'psu-admin-2026';
    if (adminKey.trim() !== expectedKey) {
      setErrorMsg('รหัสผ่านความปลอดภัยแอดมิน (Admin Security Key) ไม่ถูกต้อง');
      return;
    }

    setLoading(true);
    try {
      const user = await loginWithGoogle();
      if (!user.email) {
        throw new Error('ไม่พบข้อมูลอีเมลจากบัญชี Google');
      }

      // บันทึกสิทธิ์ Admin ลง Firestore
      await registerAdminEmail(user.email, user.uid);

      router.replace('/admin/dashboard');
    } catch (err: any) {
      console.error('Admin registration error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setLoading(false);
        return;
      }
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียนสิทธิ์แอดมิน');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-6 sm:p-10 border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-5 sm:mb-6 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" /> กลับสู่หน้าแรก
        </Link>

        {/* Header Icon & Title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-3.5 shadow-lg shadow-indigo-200">
            {isRegisterMode ? <KeyRound className="w-7 h-7 sm:w-8 sm:h-8" /> : <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {isRegisterMode ? 'ลงทะเบียนสิทธิ์ผู้ดูแลระบบ' : 'ผู้ดูแลระบบ (Admin)'}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
            {isRegisterMode
              ? 'ยืนยันรหัสความปลอดภัยเพื่อผูกสิทธิ์บัญชี Google ของคุณให้เป็นผู้ดูแลระบบ'
              : 'เข้าสู่ระบบด้วยบัญชี Google ที่ได้รับสิทธิ์ เพื่อจัดการสต็อกและรายการยืม-คืน'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg ? (
          <div className="mb-4 sm:mb-5 p-3 sm:p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl sm:rounded-2xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        ) : null}

        {/* Action Form */}
        {isRegisterMode ? (
          <form onSubmit={handleRegisterAdmin} className="space-y-4">
            <div>
              <label htmlFor="admin-security-key" className="block text-xs font-semibold text-slate-700 mb-1.5">
                รหัสผ่านความปลอดภัยแอดมิน (Admin Security Key)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-security-key"
                  name="admin_security_key"
                  type={showAdminKey ? 'text' : 'password'}
                  required
                  autoComplete="off"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="กรอกรหัสยืนยันสิทธิ์ เช่น psu-admin-2026"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-amber-50/30 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminKey(!showAdminKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 hover:text-amber-800 focus:outline-none p-1"
                  title={showAdminKey ? 'ซ่อนรหัส' : 'แสดงรหัส'}
                >
                  {showAdminKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                จำเป็นต้องใช้รหัสอนุญาตจากหน่วยงานเพื่อผูกสิทธิ์บัญชีผู้ดูแลระบบ
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition duration-150 disabled:opacity-50 text-sm flex items-center justify-center gap-2.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              {loading ? (
                <span>กำลังดำเนินการ...</span>
              ) : (
                <>
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                  <span>ยืนยันสิทธิ์และเข้าสู่ระบบด้วย Google</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 text-center">
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                เข้าสู่ระบบผู้ดูแลระบบด้วยบัญชี Google PSU หรือบัญชีที่ได้รับสิทธิ์
              </p>
            </div>

            <button
              onClick={handleGoogleAdminLogin}
              disabled={loading}
              className="w-full py-3 sm:py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition duration-150 disabled:opacity-50 text-sm flex items-center justify-center gap-2.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              {loading ? (
                <span>กำลังนำทางสู่ Google...</span>
              ) : (
                <>
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                  <span>เข้าสู่ระบบ Admin ด้วย Google</span>
                </>
              )}
            </button>
          </div>
        )}

        <div className="text-center pt-4">
          <button
            type="button"
            onClick={handleToggleMode}
            className="text-xs text-indigo-600 hover:underline font-semibold"
          >
            {isRegisterMode
              ? '← มีสิทธิ์ผู้ดูแลระบบอยู่แล้ว? คลิกเพื่อเข้าสู่ระบบ'
              : 'ต้องการลงทะเบียนสิทธิ์ Admin ด้วย Security Key? คลิกที่นี่ →'}
          </button>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-400">
          ระบบยืนยันตัวตนระดับผู้ดูแลระบบผ่าน Google Firebase
        </div>
      </div>
    </div>
  );
}
