'use client';

import React, { useState } from 'react';
import { loginWithEmail, registerWithEmail } from '@/lib/firebase/authService';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, ArrowLeft, AlertCircle, KeyRound, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Show/Hide Password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);

  // เมื่อสลับโหมด ให้ล้างข้อมูลทั้งหมดออกทันทีตามข้อกำหนด
  const handleToggleMode = () => {
    setIsRegisterMode((prev) => !prev);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAdminKey('');
    setErrorMsg(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowAdminKey(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;
    const cleanKey = adminKey.trim();

    if (!cleanEmail) {
      setErrorMsg('กรุณากรอกอีเมลผู้ดูแลระบบ');
      setLoading(false);
      return;
    }

    if (!cleanPassword) {
      setErrorMsg('กรุณากรอกรหัสผ่าน');
      setLoading(false);
      return;
    }

    try {
      if (isRegisterMode) {
        if (cleanPassword.length < 6) {
          setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
          setLoading(false);
          return;
        }

        if (cleanPassword !== confirmPassword) {
          setErrorMsg('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
          setLoading(false);
          return;
        }

        const expectedKey = process.env.NEXT_PUBLIC_ADMIN_REGISTRATION_KEY || 'psu-admin-2026';
        if (cleanKey !== expectedKey) {
          setErrorMsg('รหัสยืนยันสิทธิ์สร้างบัญชีผู้ดูแลระบบ (Admin Security Key) ไม่ถูกต้อง');
          setLoading(false);
          return;
        }

        await registerWithEmail(cleanEmail, cleanPassword);
      } else {
        await loginWithEmail(cleanEmail, cleanPassword);
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
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">ผู้ดูแลระบบ (Admin)</h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
            {isRegisterMode
              ? 'ลงทะเบียนบัญชีใหม่เพื่อจัดการสต็อกอุปกรณ์และรายการยืม-คืน'
              : 'เข้าสู่ระบบเพื่อจัดการสต็อกอุปกรณ์และรายการยืม-คืน'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg ? (
          <div className="mb-4 sm:mb-5 p-3 sm:p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl sm:rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{errorMsg}</p>
          </div>
        ) : null}

        {/* Form */}
        <form onSubmit={handleLogin} autoComplete="on" className="space-y-3.5 sm:space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
              อีเมลผู้ดูแลระบบ (Admin Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-email"
                name="admin_email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@univ.ac.th"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
              {isRegisterMode ? 'ตั้งรหัสผ่านใหม่ (Password)' : 'รหัสผ่าน (Password)'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-password"
                name="admin_password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isRegisterMode ? (
            <>
              <div>
                <label htmlFor="admin-confirm-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ยืนยันรหัสผ่านอีกครั้ง (Confirm Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="admin-confirm-password"
                    name="admin_confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="พิมพ์รหัสผ่านเดิมอีกครั้ง"
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                    title={showConfirmPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

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
                    placeholder="กรอกรหัสยืนยันสิทธิ์สร้างแอดมิน"
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
                  จำเป็นต้องใช้รหัสอนุญาตจากหน่วยงานเพื่อสร้างบัญชีผู้ดูแลระบบ
                </p>
              </div>
            </>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition duration-150 disabled:opacity-50 text-sm mt-3 flex items-center justify-center gap-2 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
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
              onClick={handleToggleMode}
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
