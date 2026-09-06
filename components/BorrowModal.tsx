'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase/client';
import { AdvanceBorrowFormData, UserGroup } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  X,
  User,
  Phone,
  Calendar,
  AlertCircle,
  Package,
  LogIn,
  School,
  Building2,
  ChevronDown,
} from 'lucide-react';

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const DEPARTMENT_OPTIONS = [
  'วิทยาศาสตร์กายภาพ',
  'วิทยาศาสตร์ชีวภาพ',
  'วิทยาศาสตร์การคำนวณ',
  'วิทยาศาสตร์สุขภาพและวิทยาศาสตร์ประยุกต์',
];

const UNIT_OPTIONS = [
  'งานสนับสนุนการจัดการศึกษา',
  'งานสนับสนุนการวิจัย',
  'งานสนับสนุนการบริการวิชาการ',
  'งานพัฒนานักศึกษาและศิษย์เก่าสัมพันธ์',
  'งานสนับสนุนข้อมูลสารสนเทศและเทคโนโลยี',
  'งานเครือข่ายและประชาสัมพันธ์ (หน่วยวิเทศสัมพันธ์)',
  'งานเครือข่ายและประชาสัมพันธ์ (หน่วยประชาสัมพันธ์)',
  'งานบริหารทรัพยากรมนุษย์',
  'งานบริการกลาง',
  'งานสนับสนุนด้านกายภาพและสิ่งแวดล้อม',
  'งานพัสดุ',
  'งานการเงินและบัญชี',
];

export default function BorrowModal({ isOpen, onClose, onSuccess }: BorrowModalProps) {
  const { cart, clearCart, totalItemsCount } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState<AdvanceBorrowFormData>({
    borrower_name: '',
    borrower_email: '',
    phone: '',
    user_group: 'อาจารย์',
    department_or_unit: '',
    purpose: '',
    use_date: '',
    return_date: '',
  });

  // Check user session
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setFormData((prev) => ({
          ...prev,
          borrower_name: session.user.user_metadata?.full_name || prev.borrower_name || '',
          borrower_email: session.user.email || '',
        }));
      } else {
        setUser(null);
      }
    };

    if (isOpen) {
      checkUser();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  // รีเซ็ตค่าภาควิชา/หน่วยงานเมื่อเปลี่ยนกลุ่มผู้ใช้งาน
  const handleUserGroupChange = (grp: UserGroup) => {
    setFormData((prev) => ({
      ...prev,
      user_group: grp,
      department_or_unit: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage('กรุณาเข้าสู่ระบบด้วย Google ก่อนทำรายการยืม');
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('กรุณาเลือกอุปกรณ์ในตะกร้าอย่างน้อย 1 ชิ้น');
      return;
    }

    // Validate สังกัด (Required)
    if (!formData.department_or_unit.trim()) {
      setErrorMessage(
        formData.user_group === 'บุคลากรภายใน'
          ? 'กรุณาระบุหรือเลือกหน่วยงานของคุณ'
          : 'กรุณาระบุหรือเลือกภาควิชาของคุณ'
      );
      return;
    }

    if (new Date(formData.return_date) < new Date(formData.use_date)) {
      setErrorMessage('วันที่ส่งคืนต้องไม่น้อยกว่าวันที่ต้องการใช้งาน');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const itemsPayload = cart.map((c) => ({
        item_id: c.item.id,
        quantity: c.quantity,
      }));

      // 1. เรียกใช้งาน Stored Procedure: submit_advance_borrow_request
      const { data: requestId, error: dbError } = await supabase.rpc(
        'submit_advance_borrow_request',
        {
          p_user_id: user.id,
          p_borrower_name: formData.borrower_name,
          p_borrower_email: formData.borrower_email,
          p_phone: formData.phone,
          p_user_group: formData.user_group,
          p_purpose: formData.purpose,
          p_use_date: formData.use_date,
          p_return_date: formData.return_date,
          p_items: itemsPayload,
          p_department_or_unit: formData.department_or_unit,
        }
      );

      if (dbError) {
        throw dbError;
      }

      // 2. เรียกส่งอีเมลแจ้งเตือนไปยังผู้ดูแลระบบ (Admin)
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: requestId || 'REQ-' + Date.now(),
            borrowerName: formData.borrower_name,
            borrowerEmail: formData.borrower_email,
            phone: formData.phone,
            userGroup: formData.user_group,
            departmentOrUnit: formData.department_or_unit,
            purpose: formData.purpose,
            useDate: formatDate(formData.use_date),
            returnDate: formatDate(formData.return_date),
            items: cart.map((c) => ({
              name: c.item.name,
              requested_qty: c.quantity,
            })),
          }),
        });
      } catch (emailErr) {
        console.warn('Failed to notify admin via email:', emailErr);
      }

      clearCart();
      onClose();
      onSuccess(
        'ส่งคำขอยืมอุปกรณ์ล่วงหน้าเรียบร้อยแล้ว! คุณสามารถติดตามสถานะการพิจารณาได้ผ่านเมนู "คำขอของฉัน"'
      );
    } catch (err: any) {
      console.error('Borrow submit error:', err);
      setErrorMessage(
        err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาตรวจสอบและลองใหม่อีกครั้ง'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 my-auto sm:my-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-5 pb-2.5 sm:pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900">ฟอร์มยืนยันการยืมอุปกรณ์</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              กรุณากรอกข้อมูลผู้ยืมและกำหนดวันส่งคืนอุปกรณ์
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Require Login if not logged in */}
        {!user ? (
          <div className="text-center py-8 px-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <LogIn className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-800">กรุณาเข้าสู่ระบบก่อนทำรายการ</h4>
            <p className="text-xs text-slate-500 mt-1 mb-5 max-w-xs mx-auto">
              ระบบจำเป็นต้องใช้อีเมล Google ของคุณเพื่อผูกกับข้อมูลคำขอและตรวจสอบประวัติในหน้า &quot;คำขอของฉัน&quot;
            </p>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="inline-flex items-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              <span>เข้าสู่ระบบด้วย Google</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            {/* Cart Items Summary Box */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-indigo-600" />
                  รายการที่ขอยืม ({totalItemsCount} ชิ้น)
                </span>
                <span className="text-[11px] text-slate-400 font-normal">รอเจ้าหน้าที่อนุมัติ</span>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {cart.map((c) => (
                  <div key={c.item.id} className="flex justify-between text-xs text-slate-600">
                    <span className="truncate max-w-[240px]">• {c.item.name}</span>
                    <span className="font-bold text-slate-900">{c.quantity} ชิ้น</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 1. Borrower Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อ-นามสกุล (ผู้ขอยืม) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="เช่น ผศ.ดร. สมชาย ใจดี / นายณัฐวุฒิ พงศาวสีกุล"
                  value={formData.borrower_name}
                  onChange={(e) => setFormData({ ...formData, borrower_name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* 2. Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เบอร์โทรศัพท์ <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="081-234-5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  อีเมลรับแจ้งเตือน
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.borrower_email}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-500"
                />
              </div>
            </div>

            {/* 3. User Group Radio Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                กลุ่มผู้ใช้งาน <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {(['อาจารย์', 'นักศึกษา', 'บุคลากรภายใน'] as UserGroup[]).map((grp) => (
                  <label
                    key={grp}
                    className={`flex items-center justify-center py-2 px-1 rounded-xl border text-[11px] sm:text-xs font-semibold cursor-pointer transition text-center whitespace-nowrap ${
                      formData.user_group === grp
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="user_group"
                      value={grp}
                      checked={formData.user_group === grp}
                      onChange={() => handleUserGroupChange(grp)}
                      className="hidden"
                    />
                    <span>{grp}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Conditional Sub-options: ภาควิชา หรือ หน่วยงาน */}
            <div className="p-3.5 bg-indigo-50/40 rounded-2xl border border-indigo-100 animate-in fade-in-50 slide-in-from-top-1 duration-200">
              {formData.user_group === 'บุคลากรภายใน' ? (
                // กรณีเลือก "บุคลากรภายใน" -> หน่วยงาน (Select Dropdown)
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    หน่วยงาน <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={formData.department_or_unit}
                      onChange={(e) =>
                        setFormData({ ...formData, department_or_unit: e.target.value })
                      }
                      className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-slate-800 font-medium"
                    >
                      <option value="" disabled>
                        -- กรุณาเลือกหน่วยงาน --
                      </option>
                      {UNIT_OPTIONS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              ) : (
                // กรณีเลือก "อาจารย์" หรือ "นักศึกษา" -> ภาควิชา (Radio Buttons Grid)
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-indigo-600" />
                    ภาควิชา <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <label
                        key={dept}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition ${
                          formData.department_or_unit === dept
                            ? 'border-indigo-600 bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-600 font-semibold'
                            : 'border-slate-200 bg-white/80 text-slate-700 hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="department_or_unit"
                          value={dept}
                          checked={formData.department_or_unit === dept}
                          onChange={() =>
                            setFormData({ ...formData, department_or_unit: dept })
                          }
                          className="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                        <span className="truncate">{dept}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 5. Purpose */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                วัตถุประสงค์ในการยืม <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="เช่น ใช้จัดสอบปฏิบัติการวิชา CS102 / จัดกิจกรรมอบรม"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* 6. Dates: use_date & return_date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  วันที่ต้องการใช้งาน (วันรับของ) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={formData.use_date}
                    onChange={(e) => {
                      const newUseDate = e.target.value;
                      setFormData({
                        ...formData,
                        use_date: newUseDate,
                        return_date:
                          formData.return_date && formData.return_date < newUseDate
                            ? newUseDate
                            : formData.return_date,
                      });
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  วันที่คาดว่าจะส่งคืน <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    min={formData.use_date || todayStr}
                    value={formData.return_date}
                    onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition disabled:opacity-50"
              >
                {submitting ? 'กำลังส่งคำขอ...' : 'ยืนยันการยืม'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
