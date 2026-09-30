import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BorrowRequest, Item } from '@/lib/types';

const mocks = vi.hoisted(() => ({
  getDocs: vi.fn(),
  runTransaction: vi.fn(),
  writeBatch: vi.fn(),
}));

vi.mock('@/lib/firebase/client', () => ({ db: {} }));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_: unknown, name: string) => ({ name })),
  doc: vi.fn((_: unknown, collectionName?: string, id?: string) => ({ collectionName, id })),
  getDocs: mocks.getDocs,
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  runTransaction: mocks.runTransaction,
  writeBatch: mocks.writeBatch,
  serverTimestamp: vi.fn(),
}));

import { deleteAllBorrowRequests, returnBorrowRequestTransaction } from './firestoreService';

const request: BorrowRequest = {
  id: 'request-1',
  borrower_name: 'ผู้ยืมทดสอบ',
  borrower_email: 'user@psu.ac.th',
  phone: '0123',
  user_group: 'นักศึกษา',
  purpose: 'ทดสอบ',
  use_date: '2026-10-01',
  return_date: '2026-10-02',
  status: 'approved',
  borrow_items: [{
    id: 'request-1_1',
    item_id: 'item-1',
    requested_qty: 5,
    approved_qty: 5,
    item: { id: 'item-1', name: 'เก้าอี้', image_url: null },
  }],
};

const item: Item = {
  id: 'item-1', name: 'เก้าอี้', description: null, category: null, image_url: null,
  total_quantity: 10, available_quantity: 5,
};

function mockReturnTransaction() {
  const updates: Array<{ ref: { collectionName: string; id: string }; data: Record<string, unknown> }> = [];
  mocks.runTransaction.mockImplementation(async (_db, callback) => callback({
    get: async (ref: { collectionName: string }) => ({
      exists: () => true,
      data: () => ref.collectionName === 'borrow_requests' ? request : item,
    }),
    update: (ref: { collectionName: string; id: string }, data: Record<string, unknown>) => updates.push({ ref, data }),
  }));
  return updates;
}

describe('Firestore borrow-request operations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('restores every approved item when equipment is returned complete', async () => {
    const updates = mockReturnTransaction();

    await returnBorrowRequestTransaction(request.id);

    expect(updates).toEqual(expect.arrayContaining([
      expect.objectContaining({ ref: expect.objectContaining({ collectionName: 'items' }), data: expect.objectContaining({ available_quantity: 10, total_quantity: 10 }) }),
      expect.objectContaining({ ref: expect.objectContaining({ collectionName: 'borrow_requests' }), data: expect.objectContaining({ status: 'returned', return_condition: 'complete', return_issues: [] }) }),
    ]));
  });

  it.each(['lost', 'damaged'] as const)('deducts %s equipment from total stock and restores only received stock', async (type) => {
    const updates = mockReturnTransaction();

    await returnBorrowRequestTransaction(request.id, [{ item_id: 'item-1', type, quantity: 2 }]);

    expect(updates).toEqual(expect.arrayContaining([
      expect.objectContaining({ ref: expect.objectContaining({ collectionName: 'items' }), data: expect.objectContaining({ available_quantity: 8, total_quantity: 8 }) }),
      expect.objectContaining({ ref: expect.objectContaining({ collectionName: 'borrow_requests' }), data: expect.objectContaining({ return_condition: 'incomplete', return_issues: [{ item_id: 'item-1', type, quantity: 2 }] }) }),
    ]));
  });

  it('keeps an optional damage note with the return record', async () => {
    const updates = mockReturnTransaction();
    const issue = { item_id: 'item-1', type: 'damaged' as const, quantity: 1, note: 'ด้ามหัก' };

    await returnBorrowRequestTransaction(request.id, [issue]);

    expect(updates).toEqual(expect.arrayContaining([
      expect.objectContaining({ ref: expect.objectContaining({ collectionName: 'borrow_requests' }), data: expect.objectContaining({ return_issues: [issue] }) }),
    ]));
  });

  it('rejects an issue quantity greater than the approved quantity', async () => {
    const updates = mockReturnTransaction();

    await expect(returnBorrowRequestTransaction(request.id, [{ item_id: 'item-1', type: 'lost', quantity: 6 }]))
      .rejects.toThrow('มากกว่าจำนวนที่ยืม');
    expect(updates).toHaveLength(0);
  });

  it('deletes all history records in Firestore batches of at most 500', async () => {
    const records = Array.from({ length: 501 }, (_, index) => ({ ref: { id: `request-${index}` } }));
    const batches = [{ delete: vi.fn(), commit: vi.fn() }, { delete: vi.fn(), commit: vi.fn() }];
    mocks.getDocs.mockResolvedValue({ docs: records });
    mocks.writeBatch.mockImplementation(() => batches.shift());

    await expect(deleteAllBorrowRequests()).resolves.toBe(501);
    expect(mocks.writeBatch).toHaveBeenCalledTimes(2);
    expect(batches).toHaveLength(0);
  });
});
