'use client';

import React, { useState } from 'react';
import { loginWithEmail, registerWithEmail } from '@/lib/firebase/authService';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, ArrowLeft, AlertCircle, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isRegisterMode) {
        const expectedKey = process.env.NEXT_PUBLIC_ADMIN_REGISTRATION_KEY || 'psu-admin-2026';
        if (adminKey.trim() !== expectedKey) {
          setErrorMsg('รหัสยืนยันสิทธิ์สร้างบัญชีผู้ดูแลระบบ (Admin Security Key) ไม่ถูกต้อง');
          setLoading(false);
          return;
        }
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error('Admin auth error:', err);
      let msg = err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'ไม่พบบัญชีนี้ในระบบ (หากเป็นครั้งแรก สามารถสลับเป็นโหมดสร้างบัญชีแอดมินได้)';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'อีเมลนี้ถูกลงทะเบียนไว้แล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านของคุณ';
      } else if (err.code === 'auth/weak-password') {
        msg = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-6 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" /> กลับสู่หน้าแรก
        </Link>

        {/* Header Icon & Title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-lg shadow-indigo-200">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">ผู้ดูแลระบบ (Admin)</h1>
          <p className="text-xs text-slate-500 mt-1">
            เข้าสู่ระบบเพื่อจัดการสต็อกอุปกรณ์และรายการยืม-คืน
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg ? (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{errorMsg}</p>
          </div>
        ) : null}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              อีเมลผู้ดูแลระบบ (Admin Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@univ.ac.th"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ตั้งรหัสผ่าน (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white transition"
              />
            </div>
          </div>

          {isRegisterMode ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                รหัสผ่านความปลอดภัยแอดมิน (Admin Security Key)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="กรอกรหัสยืนยันสิทธิ์สร้างแอดมิน"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-amber-50/30 transition"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                จำเป็นต้องใช้รหัสอนุญาตจากหน่วยงานเพื่อสร้างบัญชีผู้ดูแลระบบ
              </p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition duration-150 disabled:opacity-50 text-sm mt-3 flex items-center justify-center gap-2 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            {loading
              ? isRegisterMode
                ? 'กำลังสร้างบัญชี...'
                : 'กำลังเข้าสู่ระบบ...'
              : isRegisterMode
              ? 'ลงทะเบียนบัญชี Admin ใหม่'
              : 'เข้าสู่ระบบ Admin'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMsg(null);
              }}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              {isRegisterMode
                ? 'มีบัญชีแอดมินอยู่แล้ว? คลิกเพื่อเข้าสู่ระบบ'
                : 'ยังไม่มีบัญชีแอดมินใน Firebase? คลิกเพื่อสร้างบัญชีใหม่'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-400">
          บัญชีผู้ดูแลระบบได้รับการจัดการผ่าน Firebase Authentication
        </div>
      </div>
    </div>
  );
}
