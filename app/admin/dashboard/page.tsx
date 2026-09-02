'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Item, BorrowRequest, StatsSummary } from '@/lib/types';
import { formatDate, formatDateTime, exportToCSV } from '@/lib/utils';
import StatsCards from '@/components/admin/StatsCards';
import ItemManagerModal from '@/components/admin/ItemManagerModal';
import BorrowHistoryTable from '@/components/admin/BorrowHistoryTable';
import ApprovalModal from '@/components/admin/ApprovalModal';
import {
  Plus,
  Edit2,
  Trash2,
  Download,
  LogOut,
  RefreshCw,
  Search,
  ArrowUpRight,
  Package,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'requests' | 'items'>('requests');
  const [items, setItems] = useState<Item[]>([]);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Filters & Search
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const [approvalModalState, setApprovalModalState] = useState<{
    isOpen: boolean;
    mode: 'approve' | 'reject';
    request: BorrowRequest | null;
  }>({
    isOpen: false,
    mode: 'approve',
    request: null,
  });

  useEffect(() => {
    const checkAdminAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/admin/login');
        return;
      }

      // ตรวจสอบว่าต้องเป็นบัญชีที่ Login ด้วย Email & Password ที่สร้างไว้ใน Supabase เท่านั้น
      const isEmailProvider =
        session.user.app_metadata?.provider === 'email' ||
        session.user.identities?.some((id) => id.provider === 'email');

      if (!isEmailProvider) {
        setAuthError(
          'บัญชีที่คุณเข้าสู่ระบบอยู่ในขณะนี้เป็นบัญชีผู้ใช้ทั่วไป (Google) ไม่มีสิทธิ์เข้าถึงส่วนผู้ดูแลระบบ กรุณาเข้าสู่ระบบด้วยบัญชีแอดมิน (Email & Password)'
        );
        setLoading(false);
        return;
      }

      await loadAllData();
    };

    checkAdminAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session && event === 'SIGNED_OUT') {
        router.push('/admin/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchItems(), fetchRequests()]);
    setLoading(false);
  };

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setItems(data);
    }
  };

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('borrow_requests')
      .select('*, borrow_items(id, item_id, requested_qty, approved_qty, item:items(name, image_url, available_quantity))')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRequests(data as BorrowRequest[]);
    }
  };

  const handleReturnRecord = async (requestId: string) => {
    if (!confirm('ยืนยันว่าได้รับอุปกรณ์คืนครบถ้วนแล้ว? ระบบจะเพิ่มสต็อกสินค้ากลับคืนให้อัตโนมัติ')) {
      return;
    }

    try {
      const { error } = await supabase.rpc('return_advance_borrow_request', {
        p_request_id: requestId,
      });

      if (error) throw error;

      alert('บันทึกการรับคืนอุปกรณ์และเพิ่มสต็อกกลับคืนเรียบร้อยแล้ว');
      await loadAllData();
    } catch (err: any) {
      console.error('Error returning equipment:', err);
      alert(`เกิดข้อผิดพลาด: ${err.message || 'ไม่สามารถทำรายการได้'}`);
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบอุปกรณ์ "${name}" ออกจากระบบ?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) throw error;
      alert('ลบอุปกรณ์สำเร็จ');
      await fetchItems();
    } catch (err: any) {
      console.error('Error deleting item:', err);
      alert(`ลบไม่สำเร็จ: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const handleExportCSV = () => {
    const exportData = requests.map((r) => {
      const requestedItemsStr =
        r.borrow_items?.map((bi) => `${bi.item?.name || 'อุปกรณ์'} (${bi.requested_qty} ชิ้น)`).join('; ') || '-';
      const approvedItemsStr =
        r.borrow_items
          ?.map((bi) => `${bi.item?.name || 'อุปกรณ์'} (${bi.approved_qty ?? bi.requested_qty} ชิ้น)`)
          .join('; ') || '-';

      return {
        'รหัสคำขอ': r.id,
        'ชื่อผู้ขอยืม': r.borrower_name,
        'กลุ่มผู้ใช้': r.user_group,
        'อีเมล': r.borrower_email,
        'เบอร์โทร': r.phone,
        'วัตถุประสงค์': r.purpose,
        'วันที่ส่งคำขอ': formatDateTime(r.created_at),
        'วันที่ขอใช้งาน': formatDate(r.use_date),
        'วันที่กำหนดส่งคืน': formatDate(r.return_date),
        'สถานะ':
          r.status === 'approved'
            ? 'อนุมัติแล้ว'
            : r.status === 'rejected'
            ? 'ไม่อนุมัติ'
            : r.status === 'returned'
            ? 'คืนแล้ว'
            : 'รออนุมัติ',
        'รายการที่ขอ': requestedItemsStr,
        'รายการที่อนุมัติ': r.status === 'approved' || r.status === 'returned' ? approvedItemsStr : '-',
        'หมายเหตุ/เหตุผล': r.admin_note || '-',
      };
    });

    const filename = `รายงานการยืมคืนอุปกรณ์_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(exportData, filename);
  };

  if (authError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">ไม่มีสิทธิ์เข้าถึงส่วนผู้ดูแล</h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">{authError}</p>
          <div className="flex flex-col gap-2">
            <Link
              href="/admin/login"
              className="py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200"
            >
              ไปที่หน้าเข้าสู่ระบบ Admin (Email/Password)
            </Link>
            <Link
              href="/"
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              กลับสู่หน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stats: StatsSummary = {
    totalItems: items.reduce((sum, i) => sum + i.total_quantity, 0),
    availableItems: items.reduce((sum, i) => sum + i.available_quantity, 0),
    pendingRequests: requests.filter((r) => r.status === 'pending').length,
    approvedRequests: requests.filter((r) => r.status === 'approved').length,
    rejectedRequests: requests.filter((r) => r.status === 'rejected').length,
    returnedRequests: requests.filter((r) => r.status === 'returned').length,
    totalRequests: requests.length,
  };

  const filteredRequests = requests.filter((r) => {
    const q = searchFilter.toLowerCase();
    const matchSearch =
      r.borrower_name.toLowerCase().includes(q) ||
      r.borrower_email.toLowerCase().includes(q) ||
      r.phone.toLowerCase().includes(q) ||
      r.purpose.toLowerCase().includes(q) ||
      r.borrow_items?.some((bi) => bi.item?.name.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (i.category && i.category.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (i.description && i.description.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 text-lg leading-tight">
                ระบบจัดการอุปกรณ์ (Admin Dashboard)
              </h1>
              <p className="text-xs text-slate-400">
                ตรวจสอบและอนุมัติคำขอยืมอุปกรณ์ พร้อมจัดการสต็อก
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm"
            >
              <span>ดูหน้าเว็บ</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 text-xs font-bold transition"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Tab & Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
          {/* Main Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab('requests');
                setSearchFilter('');
              }}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeTab === 'requests'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              ประวัติการยืมทั้งหมด ({requests.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('items');
                setSearchFilter('');
              }}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeTab === 'items'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              จัดการอุปกรณ์ในสต็อก ({items.length})
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  activeTab === 'requests' ? 'ค้นหาชื่อผู้ยืม, อุปกรณ์...' : 'ค้นหาชื่ออุปกรณ์...'
                }
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={loadAllData}
              title="รีเฟรชข้อมูล"
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {activeTab === 'requests' ? (
              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export CSV (Excel)</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsItemModalOpen(true);
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-200"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มอุปกรณ์ใหม่</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Pills (for requests) */}
        {activeTab === 'requests' && (
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none">
            {[
              { label: 'ทั้งหมด', value: 'ALL' },
              { label: '🟡 รออนุมัติ', value: 'pending' },
              { label: '🟢 อนุมัติแล้ว', value: 'approved' },
              { label: '🔴 ไม่อนุมัติ', value: 'rejected' },
              { label: '⚪ คืนแล้ว', value: 'returned' },
            ].map((st) => (
              <button
                key={st.value}
                onClick={() => setStatusFilter(st.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  statusFilter === st.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        )}

        {/* Tab 1: Requests Table */}
        {activeTab === 'requests' && (
          <BorrowHistoryTable
            records={filteredRequests}
            onOpenApproval={(req, mode) =>
              setApprovalModalState({ isOpen: true, mode, request: req })
            }
            onReturnRecord={handleReturnRecord}
          />
        )}

        {/* Tab 2: Item Stock Table */}
        {activeTab === 'items' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-xs">
                  <tr>
                    <th className="p-4 sm:px-6">รูปภาพ</th>
                    <th className="p-4 sm:px-6">ชื่ออุปกรณ์ / รายละเอียด</th>
                    <th className="p-4 sm:px-6">หมวดหมู่</th>
                    <th className="p-4 sm:px-6">สต็อกคงเหลือ / ทั้งหมด</th>
                    <th className="p-4 sm:px-6 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-20 text-slate-400">
                        <Package className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                        <p className="font-semibold text-slate-600">ไม่พบอุปกรณ์</p>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((it) => (
                      <tr key={it.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-4 sm:px-6 w-20">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                            {it.image_url ? (
                              <img
                                src={it.image_url}
                                alt={it.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-slate-300" />
                            )}
                          </div>
                        </td>
                        <td className="p-4 sm:px-6">
                          <div className="font-bold text-slate-900 text-sm">{it.name}</div>
                          <div className="text-xs text-slate-400 max-w-sm truncate mt-0.5">
                            {it.description || 'ไม่มีคำอธิบาย'}
                          </div>
                        </td>
                        <td className="p-4 sm:px-6">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                            {it.category || 'ทั่วไป'}
                          </span>
                        </td>
                        <td className="p-4 sm:px-6">
                          <span
                            className={`font-bold text-xs px-2.5 py-1 rounded-full ${
                              it.available_quantity === 0
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {it.available_quantity} / {it.total_quantity} ชิ้น
                          </span>
                        </td>
                        <td className="p-4 sm:px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingItem(it);
                                setIsItemModalOpen(true);
                              }}
                              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
                              title="แก้ไขข้อมูล"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(it.id, it.name)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                              title="ลบอุปกรณ์"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Item Manager Modal */}
      <ItemManagerModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        onSuccess={() => {
          fetchItems();
        }}
        editingItem={editingItem}
      />

      {/* Approval / Rejection Modal */}
      <ApprovalModal
        isOpen={approvalModalState.isOpen}
        mode={approvalModalState.mode}
        request={approvalModalState.request}
        onClose={() =>
          setApprovalModalState({ isOpen: false, mode: 'approve', request: null })
        }
        onSuccess={() => {
          loadAllData();
        }}
      />
    </div>
  );
}
