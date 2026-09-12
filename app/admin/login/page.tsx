'use client';

import React, { useState } from 'react';
import { loginWithGoogle, logoutUser } from '@/lib/firebase/authService';
import { checkIsAdmin, registerAdminEmail } from '@/lib/firebase/firestoreService';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, KeyRound, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [adminKey, setAdminKey] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showAdminKey, setShowAdminKey] = useState(false);

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
          `บัญชี Google (${user.email}) ยังไม่ได้รับสิทธิ์ผู้ดูแลระบบ หากคุณเป็นเจ้าหน้าที่ กรุณาเลือกแท็บ "ลงทะเบียนสิทธิ์" ด้านบน`
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
      setErrorMsg('รหัสความปลอดภัยแอดมิน (Admin Security Key) ไม่ถูกต้อง');
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
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-[460px] w-full bg-white rounded-2xl shadow-sm border border-gray-200/80 p-7 sm:p-9 animate-in zoom-in-95 duration-200">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 mb-5 sm:mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>กลับสู่หน้าหลัก</span>
        </Link>

        {/* Badge */}
        <div className="mb-3">
          <span className="inline-block bg-[#c2f33c] text-black font-extrabold text-[10px] sm:text-[11px] tracking-wider px-2.5 py-1 rounded">
            ADMINISTRATION ACCESS
          </span>
        </div>

        {/* Header Title & Subtitle based on Tab */}
        <div className="mb-5 sm:mb-6">
          <h1 className="text-2xl sm:text-[26px] font-black text-gray-900 tracking-tight">
            {isRegisterMode ? 'ลงทะเบียนสิทธิ์ผู้ดูแล' : 'เข้าสู่ระบบผู้ดูแล'}
          </h1>
          <p className="text-xs sm:text-[13px] text-gray-500 mt-1">
            {isRegisterMode
              ? 'ยืนยันรหัสความปลอดภัยเพื่อผูกสิทธิ์บัญชี Google ให้เป็นผู้ดูแลระบบ'
              : 'เข้าสู่ระบบด้วยบัญชี Google ที่ได้รับสิทธิ์ เพื่อจัดการสต็อกและรายการคำขอยืม'}
          </p>
        </div>

        {/* Tabs Segmented Control */}
        <div className="bg-[#f4f4f5] p-1 rounded-xl flex gap-1 mb-5 sm:mb-6">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              !isRegisterMode ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            เข้าสู่ระบบ
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              isRegisterMode ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            ลงทะเบียนสิทธิ์
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-5 sm:my-6" />

        {/* Error Alert */}
        {errorMsg ? (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        ) : null}

        {/* Tab Content */}
        {isRegisterMode ? (
          <form onSubmit={handleRegisterAdmin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-security-key"
                className="block text-[11px] font-bold text-gray-700 tracking-wider mb-2 uppercase"
              >
                รหัสความปลอดภัยแอดมิน (SECURITY KEY)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-security-key"
                  name="admin_security_key"
                  type={showAdminKey ? 'text' : 'password'}
                  required
                  autoComplete="off"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="กรอกรหัสยืนยันสิทธิ์ เช่น psu-admin-2026"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none bg-white placeholder-gray-400 text-gray-800 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminKey(!showAdminKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                  title={showAdminKey ? 'ซ่อนรหัส' : 'แสดงรหัส'}
                >
                  {showAdminKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">
                จำเป็นต้องใช้รหัสอนุญาตจากหน่วยงานเพื่อผูกสิทธิ์บัญชี
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#3b82f6] hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2.5 shadow-sm transition disabled:opacity-50"
            >
              {loading ? (
                <span>กำลังดำเนินการ...</span>
              ) : (
                <>
                  <svg className="w-4 h-4 fill-white flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                  <span>ยืนยันสิทธิ์และเข้าสู่ระบบด้วย Google</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-[#f8f9fa] rounded-xl border border-gray-100/80 text-center">
              <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">
                เข้าสู่ระบบผู้ดูแลด้วยบัญชี Google PSU หรือบัญชีที่ได้รับสิทธิ์ในระบบงานบริการกลาง
              </p>
            </div>

            <button
              onClick={handleGoogleAdminLogin}
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
                  <span>เข้าสู่ระบบ Admin ด้วย Google</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 my-5 sm:my-6" />

        {/* Footer */}
        <div className="text-center text-[11px] sm:text-xs text-gray-400">
          ระบบยืนยันตัวตนระดับผู้ดูแลระบบผ่าน Google Firebase
        </div>
      </div>
    </div>
  );
}
