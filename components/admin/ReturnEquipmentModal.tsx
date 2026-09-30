'use client';

import { useEffect, useState } from 'react';
import { BorrowRequest, ReturnIssue } from '@/lib/types';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

type IssueType = 'complete' | 'lost' | 'damaged';

interface Props {
  isOpen: boolean;
  request: BorrowRequest | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (issues: ReturnIssue[]) => void;
}

export default function ReturnEquipmentModal({ isOpen, request, isLoading, onClose, onConfirm }: Props) {
  const [selections, setSelections] = useState<Record<string, { type: IssueType; quantity: number }>>({});

  useEffect(() => {
    if (!isOpen || !request) return;
    setSelections(Object.fromEntries((request.borrow_items || []).map((item) => [item.item_id, { type: 'complete', quantity: 0 }])));
  }, [isOpen, request]);

  if (!isOpen || !request) return null;

  const updateSelection = (itemId: string, value: Partial<{ type: IssueType; quantity: number }>) => {
    setSelections((current) => ({ ...current, [itemId]: { ...current[itemId], ...value } }));
  };

  const submit = () => {
    const issues: ReturnIssue[] = [];
    for (const item of request.borrow_items || []) {
      const selection = selections[item.item_id] || { type: 'complete', quantity: 0 };
      const borrowed = item.approved_qty ?? item.requested_qty;
      if (selection.type === 'complete') continue;
      if (!Number.isInteger(selection.quantity) || selection.quantity < 1 || selection.quantity > borrowed) return;
      issues.push({ item_id: item.item_id, type: selection.type, quantity: selection.quantity });
    }
    onConfirm(issues);
  };

  const hasInvalidIssue = (request.borrow_items || []).some((item) => {
    const selection = selections[item.item_id];
    const borrowed = item.approved_qty ?? item.requested_qty;
    return selection?.type !== 'complete' && (!Number.isInteger(selection?.quantity) || selection.quantity < 1 || selection.quantity > borrowed);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-label="บันทึกการรับคืนอุปกรณ์">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">บันทึกการรับคืนอุปกรณ์</h2>
            <p className="mt-1 text-xs text-slate-500">ตรวจสอบรายการจากคุณ {request.borrower_name} แล้วเลือกสถานะของแต่ละรายการ</p>
          </div>
          <button onClick={onClose} disabled={isLoading} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100" aria-label="ปิด"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3 p-5 sm:p-6">
          {(request.borrow_items || []).map((item) => {
            const selection = selections[item.item_id] || { type: 'complete', quantity: 0 };
            const borrowed = item.approved_qty ?? item.requested_qty;
            return <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between gap-3"><strong className="text-sm text-slate-900">{item.item?.name || 'อุปกรณ์'}</strong><span className="text-xs font-bold text-indigo-700">ยืม {borrowed} ชิ้น</span></div>
              <div className="grid grid-cols-3 gap-2">
                {([['complete', 'ครบ'], ['lost', 'สูญหาย'], ['damaged', 'เสียหาย']] as const).map(([type, label]) => <button key={type} type="button" onClick={() => updateSelection(item.item_id, { type, quantity: type === 'complete' ? 0 : selection.quantity || 1 })} className={`rounded-xl border px-2 py-2 text-xs font-bold transition ${selection.type === type ? type === 'complete' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{label}</button>)}
              </div>
              {selection.type !== 'complete' ? <div className="mt-3 flex items-center gap-2 text-xs"><AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" /><label className="font-semibold text-slate-700">จำนวน:</label><input type="number" min="1" max={borrowed} value={selection.quantity || ''} onChange={(e) => updateSelection(item.item_id, { quantity: Number(e.target.value) })} className="w-20 rounded-lg border border-slate-300 px-2 py-1.5" /><span className="text-slate-400">จาก {borrowed} ชิ้น</span></div> : null}
            </div>;
          })}
          <p className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600"><CheckCircle2 className="mr-1 inline h-4 w-4 text-emerald-600" />รายการที่ครบจะถูกคืนเข้าสต็อก; รายการสูญหายหรือเสียหายจะถูกลดจากยอดรวมคลังถาวร</p>
        </div>
        <div className="flex gap-3 border-t border-slate-100 p-5 sm:p-6"><button onClick={onClose} disabled={isLoading} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600">ยกเลิก</button><button onClick={submit} disabled={isLoading || hasInvalidIssue} className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white disabled:opacity-50">{isLoading ? 'กำลังบันทึก...' : 'ยืนยันรับคืน'}</button></div>
      </div>
    </div>
  );
}
