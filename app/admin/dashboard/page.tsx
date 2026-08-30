'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Item, BorrowRecord, StatsSummary } from '@/lib/types';
import { formatDate, formatDateTime, exportToCSV } from '@/lib/utils';
import StatsCards from '@/components/admin/StatsCards';
import ItemManagerModal from '@/components/admin/ItemManagerModal';
import BorrowHistoryTable from '@/components/admin/BorrowHistoryTable';
import {
  Boxes,
  Plus,
  Edit2,
  Trash2,
  Download,
  LogOut,
  Layers,
  Clock,
  CheckCircle2,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  Package,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'records' | 'items'>('records');
  const [items, setItems] = useState<Item[]>([]);
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  // Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // ตรวจสอบ Authentication Session ของ Admin
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/admin/login');
      } else {
        await loadAllData();
      }
    };

    checkAuthAndLoad();

    // ฟังสถานะ auth state change (ถ้า logout ให้ redirect)
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
    await Promise.all([fetchItems(), fetchRecords()]);
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

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from('borrow_records')
      .select('*, borrow_items(id, quantity, item:items(name, image_url))')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRecords(data as BorrowRecord[]);
    }
  };

  // จัดการการคืนอุปกรณ์ (Return Equipment via RPC)
  const handleReturnRecord = async (recordId: string) => {
    if (
      !confirm(
        'ยืนยันการรับคืนอุปกรณ์นี้? ระบบจะปรับปรุงจำนวนสต็อกสินค้ากลับคืนให้อัตโนมัติ'
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase.rpc('return_equipment', {
        p_record_id: recordId,
      });

      if (error) {
        throw error;
      }

      alert('บันทึกการคืนอุปกรณ์และเพิ่มสต็อกกลับคืนเรียบร้อยแล้ว');
      await loadAllData();
    } catch (err: any) {
      console.error('Error returning equipment:', err);
      alert(`เกิดข้อผิดพลาด: ${err.message || 'ไม่สามารถทำรายการได้'}`);
    }
  };

  // ลบอุปกรณ์
  const handleDeleteItem = async (id: string, name: string) => {
    if (
      !confirm(
        `คุณแน่ใจหรือไม่ว่าต้องการลบอุปกรณ์ "${name}" ออกจากระบบ? (หากมีประวัติการยืมค้างอยู่ จะไม่สามารถลบได้)`
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase.from('items').delete().eq('id', id);

      if (error) {
        throw error;
      }

      alert('ลบอุปกรณ์สำเร็จ');
      await fetchItems();
    } catch (err: any) {
      console.error('Error deleting item:', err);
      alert(`ลบไม่สำเร็จ: ${err.message}`);
    }
  };

  // ออกจากระบบ
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // Export ข้อมูลเป็น CSV
  const handleExportCSV = () => {
    const exportData = records.map((r) => {
      const itemsList =
        r.borrow_items
          ?.map((bi) => `${bi.item?.name || 'อุปกรณ์'} (${bi.quantity} ชิ้น)`)
          .join(', ') || '-';

      return {
        'รหัสรายการ': r.id,
        'ชื่อผู้ขอยืม': r.borrower_name,
        'อีเมล': r.borrower_email,
        'เบอร์โทร': r.borrower_phone,
        'วัตถุประสงค์': r.purpose,
        'วันที่ยืม': formatDateTime(r.borrow_date || r.created_at),
        'กำหนดส่งคืน': formatDate(r.expected_return_date),
        'วันที่คืนจริง': formatDateTime(r.actual_return_date),
        'สถานะ': r.status === 'returned' ? 'คืนแล้ว' : 'กำลังยืมอยู่',
        'รายการอุปกรณ์ที่ยืม': itemsList,
      };
    });

    const filename = `รายงานการยืมคืนอุปกรณ์_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(exportData, filename);
  };

  // สถิติสำหรับ Summary Cards
  const stats: StatsSummary = {
    activeBorrows: records.filter((r) => r.status === 'borrowed').length,
    returnedBorrows: records.filter((r) => r.status === 'returned').length,
    totalItems: items.reduce((sum, i) => sum + i.total_quantity, 0),
    availableItems: items.reduce((sum, i) => sum + i.available_quantity, 0),
    categoriesCount: items.length,
  };

  // Filter records & items by search
  const filteredRecords = records.filter(
    (r) =>
      r.borrower_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.borrower_email.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.purpose.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.borrow_items?.some((bi) =>
        bi.item?.name.toLowerCase().includes(searchFilter.toLowerCase())
      )
  );

  const filteredItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (i.category && i.category.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (i.description && i.description.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Admin Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2.5 rounded-2xl text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 leading-tight text-base sm:text-lg">
                ระบบจัดการอุปกรณ์ (Admin Dashboard)
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                ควบคุมสต็อกอุปกรณ์ ตรวจสอบประวัติการยืม และบันทึกการรับคืน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-bold px-3 sm:px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition flex items-center gap-1.5 border border-slate-200"
            >
              <span>ดูหน้าผู้ใช้</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 text-xs font-bold transition border border-rose-100"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* สรุปผลการทำงาน Analytics Cards */}
        <StatsCards stats={stats} />

        {/* Tab & Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
          {/* Tabs */}
          <div className="flex bg-slate-200/80 p-1.5 rounded-2xl">
            <button
              onClick={() => {
                setActiveTab('records');
                setSearchFilter('');
              }}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeTab === 'records'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ประวัติการยืมทั้งหมด ({records.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('items');
                setSearchFilter('');
              }}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeTab === 'items'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              จัดการอุปกรณ์ในสต็อก ({items.length})
            </button>
          </div>

          {/* Action Buttons & Search */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  activeTab === 'records'
                    ? 'ค้นหาชื่อผู้ยืม, อุปกรณ์...'
                    : 'ค้นหาชื่ออุปกรณ์, หมวดหมู่...'
                }
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full sm:w-60 pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadAllData}
              title="รีเฟรชข้อมูล"
              className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition shadow-sm flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {activeTab === 'records' ? (
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Export CSV (Excel)</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsItemModalOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มอุปกรณ์ใหม่</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Borrow History Table */}
        {activeTab === 'records' && (
          <BorrowHistoryTable
            records={filteredRecords}
            onReturnRecord={handleReturnRecord}
          />
        )}

        {/* Tab 2: Item Management Table */}
        {activeTab === 'items' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-xs">
                  <tr>
                    <th className="p-4 sm:px-6">รูปภาพ</th>
                    <th className="p-4 sm:px-6">ชื่ออุปกรณ์ / รายละเอียด</th>
                    <th className="p-4 sm:px-6">หมวดหมู่</th>
                    <th className="p-4 sm:px-6">คงเหลือ / ทั้งหมด</th>
                    <th className="p-4 sm:px-6 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-slate-400">
                        <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <p className="font-semibold text-slate-600">ไม่พบรายการอุปกรณ์</p>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((it) => (
                      <tr key={it.id} className="hover:bg-slate-50/70 transition">
                        {/* Image */}
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

                        {/* Name & Desc */}
                        <td className="p-4 sm:px-6">
                          <div className="font-bold text-slate-900 text-sm">{it.name}</div>
                          <div className="text-xs text-slate-400 max-w-sm truncate mt-0.5">
                            {it.description || 'ไม่มีคำอธิบาย'}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-4 sm:px-6">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                            {it.category || 'ทั่วไป'}
                          </span>
                        </td>

                        {/* Quantity */}
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

                        {/* Actions */}
                        <td className="p-4 sm:px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingItem(it);
                                setIsItemModalOpen(true);
                              }}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
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

      {/* Item Manager Modal (Add / Edit + Storage Upload) */}
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
    </div>
  );
}
