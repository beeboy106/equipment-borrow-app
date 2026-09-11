'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { subscribeAuth, logoutUser } from '@/lib/firebase/authService';
import {
  fetchItems as getItemsFromFirestore,
  fetchBorrowRequests as getRequestsFromFirestore,
  returnBorrowRequestTransaction,
  deleteItem as deleteItemFromFirestore,
  checkIsAdmin,
} from '@/lib/firebase/firestoreService';
import { useRouter } from 'next/navigation';
import { Item, BorrowRequest, StatsSummary } from '@/lib/types';
import { formatDate, formatDateTime, exportToCSV } from '@/lib/utils';
import StatsCards from '@/components/admin/StatsCards';
import BorrowHistoryTable from '@/components/admin/BorrowHistoryTable';
import ToastContainer, { ToastMessage, ToastType } from '@/components/ui/Toast';
import dynamic from 'next/dynamic';

const ItemManagerModal = dynamic(() => import('@/components/admin/ItemManagerModal'), {
  ssr: false,
});
const ApprovalModal = dynamic(() => import('@/components/admin/ApprovalModal'), {
  ssr: false,
});
const ConfirmModal = dynamic(() => import('@/components/ui/ConfirmModal'), {
  ssr: false,
});
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
  PackageCheck,
  ShieldAlert,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Filter,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'requests' | 'items'>('requests');
  const [items, setItems] = useState<Item[]>([]);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Filters & Search
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [userGroupFilter, setUserGroupFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('created_desc');
  const [dateFilterMode, setDateFilterMode] = useState<'ALL' | 'month' | 'date' | 'range'>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dateTargetField, setDateTargetField] = useState<'created_at' | 'use_date' | 'return_date'>('created_at');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (type: ToastType, message: string, title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };
  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

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

  // Confirm Modals
  const [returnConfirmState, setReturnConfirmState] = useState<{
    isOpen: boolean;
    request: BorrowRequest | null;
    loading: boolean;
  }>({
    isOpen: false,
    request: null,
    loading: false,
  });

  const [deleteItemState, setDeleteItemState] = useState<{
    isOpen: boolean;
    item: Item | null;
    loading: boolean;
  }>({
    isOpen: false,
    item: null,
    loading: false,
  });

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    const unsubscribe = subscribeAuth(async (user) => {
      if (!user) {
        setIsAuthorized(false);
        router.replace('/admin/login');
        return;
      }

      // ตรวจสอบสิทธิ์ผู้ดูแลระบบ (Admin)
      const hasAdminRole = await checkIsAdmin(user.email);

      if (!hasAdminRole) {
        setIsAuthorized(false);
        setAuthError(
          `บัญชีที่คุณเข้าสู่ระบบอยู่ในขณะนี้ (${user.email || 'ไม่ระบุอีเมล'}) ยังไม่ได้รับสิทธิ์ผู้ดูแลระบบ กรุณาเข้าสู่ระบบด้วยบัญชีแอดมิน หรือลงทะเบียนยืนยันสิทธิ์ด้วย Admin Security Key`
        );
        setLoading(false);
        return;
      }

      setIsAuthorized(true);
      await loadAllData();
    });

    return () => {
      unsubscribe();
    };
  }, [router]);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchItems(), fetchRequests()]);
    setLoading(false);
  };

  const fetchItems = async () => {
    try {
      const data = await getItemsFromFirestore();
      setItems(data);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  };

  const fetchRequests = async () => {
    try {
      const data = await getRequestsFromFirestore();
      setRequests(data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  const handleOpenReturnModal = (request: BorrowRequest) => {
    setReturnConfirmState({
      isOpen: true,
      request,
      loading: false,
    });
  };

  const handleConfirmReturn = async () => {
    if (!returnConfirmState.request) return;

    try {
      setReturnConfirmState((prev) => ({ ...prev, loading: true }));
      await returnBorrowRequestTransaction(returnConfirmState.request.id);

      showToast(
        'success',
        `รับคืนอุปกรณ์จากคุณ ${returnConfirmState.request.borrower_name} และเพิ่มสต็อกกลับคืนเรียบร้อยแล้ว`,
        'บันทึกรับคืนสำเร็จ'
      );
      setReturnConfirmState({ isOpen: false, request: null, loading: false });
      await loadAllData();
    } catch (err: any) {
      console.error('Error returning equipment:', err);
      showToast('error', err.message || 'ไม่สามารถบันทึกรับคืนได้', 'เกิดข้อผิดพลาด');
      setReturnConfirmState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleOpenDeleteModal = (item: Item) => {
    setDeleteItemState({
      isOpen: true,
      item,
      loading: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteItemState.item) return;

    try {
      setDeleteItemState((prev) => ({ ...prev, loading: true }));
      await deleteItemFromFirestore(deleteItemState.item.id);

      showToast(
        'success',
        `ลบอุปกรณ์ "${deleteItemState.item.name}" ออกจากระบบเรียบร้อยแล้ว`,
        'ลบอุปกรณ์สำเร็จ'
      );
      setDeleteItemState({ isOpen: false, item: null, loading: false });
      await fetchItems();
    } catch (err: any) {
      console.error('Error deleting item:', err);
      showToast('error', err.message || 'ไม่สามารถลบอุปกรณ์ได้', 'เกิดข้อผิดพลาด');
      setDeleteItemState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push('/admin/login');
  };

  // Badge Counts for Request Tabs
  const badgeCounts = useMemo(() => {
    return {
      all: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved' && r.return_date >= todayStr).length,
      overdue: requests.filter((r) => r.status === 'approved' && r.return_date < todayStr).length,
      returned: requests.filter((r) => r.status === 'returned').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
    };
  }, [requests, todayStr]);

  // Helper to extract YYYY-MM-DD from target field
  const getTargetDateStr = (r: BorrowRequest, field: 'created_at' | 'use_date' | 'return_date') => {
    if (field === 'created_at') {
      if (!r.created_at) return '';
      try {
        const d = new Date(r.created_at);
        if (isNaN(d.getTime())) return r.created_at.slice(0, 10);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch {
        return r.created_at.slice(0, 10);
      }
    } else if (field === 'use_date') {
      return r.use_date ? r.use_date.slice(0, 10) : '';
    } else {
      return r.return_date ? r.return_date.slice(0, 10) : '';
    }
  };

  // Filtered & Sorted Requests
  const filteredRequests = useMemo(() => {
    let result = requests.filter((r) => {
      const q = searchFilter.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.borrower_name.toLowerCase().includes(q) ||
        r.borrower_email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.user_group.toLowerCase().includes(q) ||
        (r.department_or_unit && r.department_or_unit.toLowerCase().includes(q)) ||
        r.purpose.toLowerCase().includes(q) ||
        r.borrow_items?.some((bi) => bi.item?.name.toLowerCase().includes(q));

      // Status filter with 'overdue' special handling
      let matchStatus = true;
      if (statusFilter === 'ALL') {
        matchStatus = true;
      } else if (statusFilter === 'overdue') {
        matchStatus = r.status === 'approved' && r.return_date < todayStr;
      } else if (statusFilter === 'approved') {
        matchStatus = r.status === 'approved' && r.return_date >= todayStr;
      } else {
        matchStatus = r.status === statusFilter;
      }

      // User Group filter
      const matchUserGroup = userGroupFilter === 'ALL' || r.user_group === userGroupFilter;

      // Date / Month filter
      let matchDate = true;
      if (dateFilterMode !== 'ALL') {
        const dateStr = getTargetDateStr(r, dateTargetField);
        if (dateFilterMode === 'month') {
          if (selectedMonth) {
            matchDate = dateStr.startsWith(selectedMonth);
          }
        } else if (dateFilterMode === 'date') {
          if (selectedDate) {
            matchDate = dateStr === selectedDate;
          }
        } else if (dateFilterMode === 'range') {
          const afterStart = !startDate || (dateStr !== '' && dateStr >= startDate);
          const beforeEnd = !endDate || (dateStr !== '' && dateStr <= endDate);
          matchDate = afterStart && beforeEnd;
        }
      }

      return matchSearch && matchStatus && matchUserGroup && matchDate;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'created_desc') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      } else if (sortBy === 'created_asc') {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      } else if (sortBy === 'return_asc') {
        return a.return_date.localeCompare(b.return_date);
      } else if (sortBy === 'return_desc') {
        return b.return_date.localeCompare(a.return_date);
      } else if (sortBy === 'use_asc') {
        return a.use_date.localeCompare(b.use_date);
      }
      return 0;
    });

    return result;
  }, [
    requests,
    searchFilter,
    statusFilter,
    userGroupFilter,
    sortBy,
    todayStr,
    dateFilterMode,
    selectedMonth,
    selectedDate,
    startDate,
    endDate,
    dateTargetField,
  ]);

  const hasActiveFilters =
    searchFilter !== '' ||
    statusFilter !== 'ALL' ||
    userGroupFilter !== 'ALL' ||
    dateFilterMode !== 'ALL' ||
    sortBy !== 'created_desc';

  const resetFilters = () => {
    setSearchFilter('');
    setStatusFilter('ALL');
    setUserGroupFilter('ALL');
    setDateFilterMode('ALL');
    setSelectedMonth('');
    setSelectedDate('');
    setStartDate('');
    setEndDate('');
    setDateTargetField('created_at');
    setSortBy('created_desc');
  };

  const handleExportCSV = () => {
    const exportData = filteredRequests.map((r) => {
      const requestedItemsStr =
        r.borrow_items?.map((bi) => `${bi.item?.name || 'อุปกรณ์'} (${bi.requested_qty} ชิ้น)`).join('; ') || '-';
      const approvedItemsStr =
        r.borrow_items
          ?.map((bi) => `${bi.item?.name || 'อุปกรณ์'} (${bi.approved_qty ?? bi.requested_qty} ชิ้น)`)
          .join('; ') || '-';

      const isOverdue = r.status === 'approved' && r.return_date < todayStr;
      let statusLabel = 'รออนุมัติ';
      if (isOverdue) statusLabel = 'เกินกำหนดคืน (Overdue)';
      else if (r.status === 'approved') statusLabel = 'อนุมัติแล้ว (กำลังยืม)';
      else if (r.status === 'rejected') statusLabel = 'ไม่อนุมัติ';
      else if (r.status === 'returned') statusLabel = 'คืนแล้ว';
      else if (r.status === 'cancelled') statusLabel = 'ยกเลิกแล้ว';

      return {
        'รหัสคำขอ': r.id,
        'ชื่อผู้ขอยืม': r.borrower_name,
        'กลุ่มผู้ใช้': r.user_group,
        'ภาควิชา/หน่วยงาน': r.department_or_unit || '-',
        'อีเมล': r.borrower_email,
        'เบอร์โทร': r.phone,
        'วัตถุประสงค์': r.purpose,
        'วันที่ส่งคำขอ': formatDateTime(r.created_at),
        'วันที่ขอใช้งาน': formatDate(r.use_date),
        'วันที่กำหนดส่งคืน': formatDate(r.return_date),
        'สถานะ': statusLabel,
        'รายการที่ขอ': requestedItemsStr,
        'รายการที่อนุมัติ': r.status === 'approved' || r.status === 'returned' ? approvedItemsStr : '-',
        'เวลานัดรับของ': r.pickup_time || '-',
        'หมายเหตุ/เหตุผล': r.admin_note || '-',
      };
    });

    const filename = `รายงานการยืมคืนอุปกรณ์_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(exportData, filename);
    showToast('success', `ส่งออกข้อมูลเรียบร้อยแล้ว จำนวน ${exportData.length} รายการ`, 'ดาวน์โหลด CSV สำเร็จ');
  };

  const filteredItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (i.category && i.category.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (i.description && i.description.toLowerCase().includes(searchFilter.toLowerCase()))
  );

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

  // Prevent ANY dashboard UI from rendering before admin authorization is confirmed
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl flex flex-col items-center gap-4 max-w-sm w-full text-center animate-in fade-in duration-150">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <div className="w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ...</h3>
            <p className="text-xs text-slate-400 mt-1">กรุณารอสักครู่ ระบบกำลังยืนยันความปลอดภัย</p>
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 min-h-[64px] h-auto sm:h-20 py-2.5 sm:py-0 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-slate-900 text-sm sm:text-lg leading-tight truncate sm:whitespace-normal">
                ระบบจัดการอุปกรณ์ <span className="text-xs font-semibold text-slate-500 hidden sm:inline">(Admin Dashboard)</span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-400 hidden sm:block truncate">
                ตรวจสอบและอนุมัติคำขอยืมอุปกรณ์ พร้อมจัดการสต็อก
              </p>
              <span className="text-[10px] font-bold text-indigo-600 sm:hidden block">Admin Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-bold px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs whitespace-nowrap"
              title="ดูหน้าเว็บฝั่งผู้ใช้"
            >
              <span className="hidden sm:inline">ดูหน้าเว็บ</span>
              <span className="sm:hidden text-xs">หน้าเว็บ</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </Link>

            <button
              onClick={handleLogout}
              className="px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 text-xs font-bold transition whitespace-nowrap"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4 shrink-0 text-slate-400" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 pb-16 sm:pb-12">
        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Tab & Controls Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
          {/* Main Tabs */}
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex">
            <button
              onClick={() => {
                setActiveTab('requests');
                setSearchFilter('');
              }}
              className={`px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-center whitespace-nowrap transition-all duration-200 ${
                activeTab === 'requests'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="sm:hidden">คำขอยืม ({requests.length})</span>
              <span className="hidden sm:inline">ประวัติการยืมทั้งหมด ({requests.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('items');
                setSearchFilter('');
              }}
              className={`px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-center whitespace-nowrap transition-all duration-200 ${
                activeTab === 'items'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="sm:hidden">คลังอุปกรณ์ ({items.length})</span>
              <span className="hidden sm:inline">จัดการอุปกรณ์ในสต็อก ({items.length})</span>
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  activeTab === 'requests'
                    ? 'ค้นหาชื่อ, อุปกรณ์, เบอร์...'
                    : 'ค้นหาชื่ออุปกรณ์...'
                }
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={loadAllData}
              title="รีเฟรชข้อมูล"
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-xs shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {activeTab === 'requests' ? (
              <button
                onClick={handleExportCSV}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs whitespace-nowrap shrink-0"
                title="ส่งออกรายการตามตัวกรองปัจจุบัน"
              >
                <Download className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="hidden sm:inline">Export CSV</span>
                <span>({filteredRequests.length})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsItemModalOpen(true);
                }}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-200 whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>เพิ่มอุปกรณ์</span>
              </button>
            )}
          </div>
        </div>

        {/* Requests Sub-Filter Panel */}
        {activeTab === 'requests' ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs mb-5 sm:mb-6 space-y-3">
            {/* Row 1: Status Filter Tabs with Badges */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-0.5">
                <Filter className="w-3.5 h-3.5" /> สถานะ:
              </span>
              {[
                { label: 'ทั้งหมด', value: 'ALL', count: badgeCounts.all, color: 'bg-slate-100 text-slate-700' },
                { label: 'รออนุมัติ', value: 'pending', count: badgeCounts.pending, color: 'bg-amber-100 text-amber-800' },
                { label: 'อนุมัติแล้ว', value: 'approved', count: badgeCounts.approved, color: 'bg-emerald-100 text-emerald-800' },
                { label: '⚠️ เกินกำหนดคืน', value: 'overdue', count: badgeCounts.overdue, color: 'bg-rose-100 text-rose-800' },
                { label: 'คืนแล้ว', value: 'returned', count: badgeCounts.returned, color: 'bg-slate-200 text-slate-700' },
                { label: 'ไม่อนุมัติ', value: 'rejected', count: badgeCounts.rejected, color: 'bg-rose-50 text-rose-600' },
              ].map((st) => (
                <button
                  key={st.value}
                  onClick={() => setStatusFilter(st.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    statusFilter === st.value
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{st.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      statusFilter === st.value ? 'bg-indigo-700 text-white' : st.color
                    }`}
                  >
                    {st.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Row 2: Secondary Filters (User Group, Date/Month Filter, Sorting, and Reset) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pt-2.5 border-t border-slate-100 text-xs">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {/* User Group Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium whitespace-nowrap">กลุ่ม:</span>
                  <select
                    value={userGroupFilter}
                    onChange={(e) => setUserGroupFilter(e.target.value)}
                    className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="ALL">ทุกกลุ่มผู้ใช้</option>
                    <option value="อาจารย์">อาจารย์</option>
                    <option value="นักศึกษา">นักศึกษา</option>
                    <option value="บุคลากรภายใน">บุคลากรภายใน</option>
                  </select>
                </div>

                {/* Date / Month Filter */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-400 font-medium flex items-center gap-1 whitespace-nowrap">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> วันที่:
                  </span>
                  <select
                    value={dateFilterMode}
                    onChange={(e) => {
                      const mode = e.target.value as 'ALL' | 'month' | 'date' | 'range';
                      setDateFilterMode(mode);
                      if (mode === 'month' && !selectedMonth) {
                        setSelectedMonth(todayStr.slice(0, 7));
                      } else if (mode === 'date' && !selectedDate) {
                        setSelectedDate(todayStr);
                      }
                    }}
                    className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="ALL">ทุกช่วงเวลา</option>
                    <option value="month">ระบุเดือน</option>
                    <option value="date">ระบุวันที่</option>
                    <option value="range">ช่วงวันที่</option>
                  </select>

                  {/* Month Picker */}
                  {dateFilterMode === 'month' ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="py-1 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
                      />
                      {selectedMonth !== todayStr.slice(0, 7) ? (
                        <button
                          type="button"
                          onClick={() => setSelectedMonth(todayStr.slice(0, 7))}
                          className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md font-semibold text-[11px] whitespace-nowrap transition active:scale-95"
                          title="เลือกเดือนปัจจุบัน"
                        >
                          เดือนนี้
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  {/* Specific Date Picker */}
                  {dateFilterMode === 'date' ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="py-1 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
                      />
                      {selectedDate !== todayStr ? (
                        <button
                          type="button"
                          onClick={() => setSelectedDate(todayStr)}
                          className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md font-semibold text-[11px] whitespace-nowrap transition active:scale-95"
                          title="เลือกวันนี้"
                        >
                          วันนี้
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  {/* Date Range Picker */}
                  {dateFilterMode === 'range' ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="py-1 px-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
                        title="ตั้งแต่วันที่"
                      />
                      <span className="text-slate-400 font-medium">ถึง</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="py-1 px-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
                        title="ถึงวันที่"
                      />
                    </div>
                  ) : null}

                  {/* Date Target Field (Only shown when date filtering is active) */}
                  {dateFilterMode !== 'ALL' ? (
                    <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
                      <span className="text-slate-400 whitespace-nowrap">อิงตาม:</span>
                      <select
                        value={dateTargetField}
                        onChange={(e) => setDateTargetField(e.target.value as any)}
                        className="py-1 px-2 bg-indigo-50/60 border border-indigo-200/80 rounded-lg text-indigo-900 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="created_at">วันที่ส่งคำขอ</option>
                        <option value="use_date">วันใช้งาน</option>
                        <option value="return_date">กำหนดคืน</option>
                      </select>
                    </div>
                  ) : null}
                </div>

                {/* Sort By Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium flex items-center gap-1 whitespace-nowrap">
                    <ArrowUpDown className="w-3 h-3" /> เรียงตาม:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="created_desc">วันที่ส่งคำขอ (ใหม่สุด)</option>
                    <option value="created_asc">วันที่ส่งคำขอ (เก่าสุด)</option>
                    <option value="return_asc">กำหนดคืน (เร็วสุด)</option>
                    <option value="return_desc">กำหนดคืน (ช้าสุด)</option>
                    <option value="use_asc">วันใช้งาน (เร็วสุด)</option>
                  </select>
                </div>
              </div>

              {/* Reset Filters & Results summary */}
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <span className="text-slate-400 whitespace-nowrap">
                  พบ <strong className="text-slate-700">{filteredRequests.length}</strong> รายการ
                </span>
                {hasActiveFilters ? (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg font-bold whitespace-nowrap transition text-xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>ล้างตัวกรอง</span>
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {/* Tab 1: Requests Table */}
        {activeTab === 'requests' ? (
          <BorrowHistoryTable
            records={filteredRequests}
            onOpenApproval={(req: BorrowRequest, mode: 'approve' | 'reject') =>
              setApprovalModalState({ isOpen: true, mode, request: req })
            }
            onReturnRecord={handleOpenReturnModal}
          />
        ) : null}

        {/* Tab 2: Item Stock Table */}
        {activeTab === 'items' ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Mobile Card View (md:hidden) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <div className="text-center py-16 px-4 text-slate-400">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="font-semibold text-slate-600">ไม่พบอุปกรณ์</p>
                </div>
              ) : (
                filteredItems.map((it) => (
                  <div key={it.id} className="p-4 flex items-center justify-between gap-3 [content-visibility:auto]">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
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
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 text-sm leading-snug truncate">
                          {it.name}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 whitespace-nowrap">
                            {it.category || 'ทั่วไป'}
                          </span>
                          <span
                            className={`font-bold text-[10px] px-2 py-0.5 rounded-md whitespace-nowrap ${
                              it.available_quantity === 0
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            สต็อก: {it.available_quantity}/{it.total_quantity} ชิ้น
                          </span>
                        </div>
                        {it.description ? (
                          <div className="text-[11px] text-slate-400 truncate mt-1">
                            {it.description}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingItem(it);
                          setIsItemModalOpen(true);
                        }}
                        aria-label={`แก้ไขข้อมูล ${it.name}`}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        title="แก้ไขข้อมูล"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(it)}
                        aria-label={`ลบอุปกรณ์ ${it.name}`}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                        title="ลบอุปกรณ์"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[760px] text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-xs">
                  <tr>
                    <th className="p-4 sm:px-6 w-20 whitespace-nowrap">รูปภาพ</th>
                    <th className="p-4 sm:px-6 min-w-[200px] whitespace-nowrap">ชื่ออุปกรณ์ / รายละเอียด</th>
                    <th className="p-4 sm:px-6 min-w-[130px] whitespace-nowrap">หมวดหมู่</th>
                    <th className="p-4 sm:px-6 min-w-[160px] whitespace-nowrap">สต็อกคงเหลือ / ทั้งหมด</th>
                    <th className="p-4 sm:px-6 min-w-[110px] text-center whitespace-nowrap">จัดการ</th>
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
                      <tr key={it.id} className="hover:bg-slate-50/70 transition [content-visibility:auto]">
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
                          <div className="font-bold text-slate-900 text-sm leading-snug">{it.name}</div>
                          <div className="text-xs text-slate-400 max-w-sm truncate mt-0.5">
                            {it.description || 'ไม่มีคำอธิบาย'}
                          </div>
                        </td>
                        <td className="p-4 sm:px-6 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 whitespace-nowrap">
                            {it.category || 'ทั่วไป'}
                          </span>
                        </td>
                        <td className="p-4 sm:px-6 whitespace-nowrap">
                          <span
                            className={`font-bold text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${
                              it.available_quantity === 0
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {it.available_quantity} / {it.total_quantity} ชิ้น
                          </span>
                        </td>
                        <td className="p-4 sm:px-6 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2 flex-nowrap">
                            <button
                              onClick={() => {
                                setEditingItem(it);
                                setIsItemModalOpen(true);
                              }}
                              aria-label={`แก้ไขข้อมูล ${it.name}`}
                              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                              title="แก้ไขข้อมูล"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(it)}
                              aria-label={`ลบอุปกรณ์ ${it.name}`}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
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
        ) : null}
      </main>

      {/* Item Manager Modal */}
      <ItemManagerModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        onSuccess={() => {
          showToast('success', 'บันทึกข้อมูลอุปกรณ์ในคลังเรียบร้อยแล้ว', 'สำเร็จ');
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
          showToast(
            'success',
            approvalModalState.mode === 'approve' ? 'อนุมัติคำขอยืมเรียบร้อยแล้ว' : 'ปฏิเสธคำขอยืมแล้ว',
            'ดำเนินการสำเร็จ'
          );
          loadAllData();
        }}
      />

      {/* Return Confirmation Modal */}
      <ConfirmModal
        isOpen={returnConfirmState.isOpen}
        title="ยืนยันการรับคืนอุปกรณ์"
        iconType="info"
        confirmText="ยืนยันรับคืนอุปกรณ์"
        cancelText="ยกเลิก"
        isLoading={returnConfirmState.loading}
        onClose={() => setReturnConfirmState({ isOpen: false, request: null, loading: false })}
        onConfirm={handleConfirmReturn}
        description={
          returnConfirmState.request ? (
            <div className="space-y-2 mt-1">
              <p>
                ยืนยันว่าได้รับอุปกรณ์คืนครบถ้วนจากคุณ{' '}
                <strong className="text-slate-900">{returnConfirmState.request.borrower_name}</strong>{' '}
                เรียบร้อยแล้วหรือไม่?
              </p>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                <p className="font-bold text-[11px] text-slate-500 mb-1">รายการอุปกรณ์ที่ต้องรับคืน:</p>
                <ul className="space-y-1">
                  {returnConfirmState.request.borrow_items?.map((bi) => (
                    <li key={bi.id} className="text-xs flex justify-between">
                      <span>• {bi.item?.name || 'อุปกรณ์'}</span>
                      <strong className="text-indigo-600">
                        {bi.approved_qty ?? bi.requested_qty} ชิ้น
                      </strong>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold">
                ✓ ระบบจะนำจำนวนอุปกรณ์ดังกล่าวกลับเข้าสู่สต็อกพร้อมใช้อัตโนมัติ
              </p>
            </div>
          ) : (
            ''
          )
        }
      />

      {/* Delete Item Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteItemState.isOpen}
        title="ยืนยันการลบอุปกรณ์"
        isDanger={true}
        confirmText="ลบอุปกรณ์"
        cancelText="ยกเลิก"
        isLoading={deleteItemState.loading}
        onClose={() => setDeleteItemState({ isOpen: false, item: null, loading: false })}
        onConfirm={handleConfirmDelete}
        description={
          deleteItemState.item ? (
            <div>
              <p>
                คุณแน่ใจหรือไม่ว่าต้องการลบอุปกรณ์{' '}
                <strong className="text-slate-900">&quot;{deleteItemState.item.name}&quot;</strong> ออกจากระบบ?
              </p>
              <p className="text-[11px] text-rose-600 mt-2 font-semibold">
                ⚠️ การกระทำนี้ไม่สามารถย้อนกลับได้ และรายการอุปกรณ์นี้จะถูกลบออกจากคลัง
              </p>
            </div>
          ) : (
            ''
          )
        }
      />
    </div>
  );
}
