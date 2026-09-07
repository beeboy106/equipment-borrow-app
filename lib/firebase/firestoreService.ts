import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './client';
import { Item, BorrowRequest, BorrowRequestItem } from '@/lib/types';

// ==========================================
// 1. ITEMS MANAGEMENT
// ==========================================

export async function fetchItems(): Promise<Item[]> {
  try {
    const q = query(collection(db, 'items'), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Item[];
  } catch (err) {
    console.error('Error fetching items from Firestore:', err);
    // Fallback without ordering if index is still indexing
    const snapshot = await getDocs(collection(db, 'items'));
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Item[];
  }
}

export function subscribeItems(callback: (items: Item[]) => void): () => void {
  const q = collection(db, 'items');
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Item[];
      // Sort in memory by created_at desc to avoid requiring composite indexes
      items.sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      });
      callback(items);
    },
    (error) => {
      console.error('Realtime items listener error:', error);
    }
  );
}

export async function saveItem(
  itemData: Partial<Item> & { name: string; total_quantity: number },
  itemId?: string
): Promise<string> {
  const now = new Date().toISOString();
  if (itemId) {
    // Update existing item
    const itemRef = doc(db, 'items', itemId);
    const existingSnap = await getDoc(itemRef);
    if (!existingSnap.exists()) throw new Error('ไม่พบข้อมูลอุปกรณ์นี้');

    const existing = existingSnap.data() as Item;
    const diff = Number(itemData.total_quantity) - Number(existing.total_quantity || 0);
    const newAvailable = Math.max(0, Number(existing.available_quantity || 0) + diff);

    await updateDoc(itemRef, {
      ...itemData,
      total_quantity: Number(itemData.total_quantity),
      available_quantity: newAvailable,
      updated_at: now,
    });
    return itemId;
  } else {
    // Create new item
    const newDocRef = doc(collection(db, 'items'));
    await setDoc(newDocRef, {
      name: itemData.name,
      description: itemData.description || '',
      category: itemData.category || 'ทั่วไป',
      image_url: itemData.image_url || null,
      total_quantity: Number(itemData.total_quantity),
      available_quantity: Number(itemData.total_quantity),
      created_at: now,
      updated_at: now,
    });
    return newDocRef.id;
  }
}

export async function deleteItem(itemId: string): Promise<void> {
  await deleteDoc(doc(db, 'items', itemId));
}

// ==========================================
// 2. BORROW REQUESTS MANAGEMENT
// ==========================================

export async function fetchBorrowRequests(): Promise<BorrowRequest[]> {
  try {
    const q = query(collection(db, 'borrow_requests'), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as BorrowRequest[];
  } catch (err) {
    console.error('Error fetching borrow requests:', err);
    const snapshot = await getDocs(collection(db, 'borrow_requests'));
    const list = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as BorrowRequest[];
    list.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });
    return list;
  }
}

export async function fetchUserRequests(userEmail: string): Promise<BorrowRequest[]> {
  try {
    const q = query(
      collection(db, 'borrow_requests'),
      where('borrower_email', '==', userEmail)
    );
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as BorrowRequest[];
    list.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });
    return list;
  } catch (err) {
    console.error('Error fetching user requests:', err);
    return [];
  }
}

// Submit Advance Borrow Request
export async function submitBorrowRequest(
  requestData: Omit<BorrowRequest, 'id' | 'status' | 'created_at' | 'updated_at' | 'borrow_items'>,
  items: Array<{ item_id: string; requested_qty: number; name?: string; image_url?: string | null }>
): Promise<string> {
  const reqRef = doc(collection(db, 'borrow_requests'));
  const now = new Date().toISOString();

  const borrowItemsList: BorrowRequestItem[] = items.map((i, idx) => ({
    id: `${reqRef.id}_${idx + 1}`,
    request_id: reqRef.id,
    item_id: i.item_id,
    requested_qty: Number(i.requested_qty),
    approved_qty: null,
    item: {
      id: i.item_id,
      name: i.name || 'อุปกรณ์',
      image_url: i.image_url || null,
    },
  }));

  await setDoc(reqRef, {
    ...requestData,
    status: 'pending',
    created_at: now,
    updated_at: now,
    borrow_items: borrowItemsList,
  });

  return reqRef.id;
}

// Atomic Transaction: Approve Borrow Request (Deduct from inventory)
export async function approveBorrowRequestTransaction(
  requestId: string,
  approvedItems: Array<{ item_id: string; approved_qty: number }>,
  adminNote?: string
): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const reqRef = doc(db, 'borrow_requests', requestId);
    const reqSnap = await transaction.get(reqRef);
    if (!reqSnap.exists()) throw new Error('ไม่พบคำขอยืมนี้ในระบบ');

    const reqData = reqSnap.data() as BorrowRequest;
    if (reqData.status !== 'pending') {
      throw new Error(`คำขอนี้ไม่ได้อยู่ในสถานะรออนุมัติ (สถานะปัจจุบัน: ${reqData.status})`);
    }

    // Step 1: Read all item documents first (Firestore Rule: All reads before writes)
    const itemReads: Array<{
      ref: any;
      itemSnap: any;
      approvedQty: number;
    }> = [];

    for (const appItem of approvedItems) {
      if (appItem.approved_qty > 0) {
        const itemRef = doc(db, 'items', appItem.item_id);
        const itemSnap = await transaction.get(itemRef);
        if (!itemSnap.exists()) {
          throw new Error(`ไม่พบอุปกรณ์รหัส ${appItem.item_id} ในคลัง`);
        }
        itemReads.push({
          ref: itemRef,
          itemSnap,
          approvedQty: appItem.approved_qty,
        });
      }
    }

    // Step 2: Validate available quantity
    for (const read of itemReads) {
      const item = read.itemSnap.data() as Item;
      if (item.available_quantity < read.approvedQty) {
        throw new Error(
          `อุปกรณ์ "${item.name}" มีจำนวนพร้อมใช้คงเหลือ ${item.available_quantity} ชิ้น ไม่พอสำหรับการอนุมัติ ${read.approvedQty} ชิ้น`
        );
      }
    }

    // Step 3: Perform all writes
    for (const read of itemReads) {
      const item = read.itemSnap.data() as Item;
      const newAvailable = item.available_quantity - read.approvedQty;
      transaction.update(read.ref, {
        available_quantity: newAvailable,
        updated_at: new Date().toISOString(),
      });
    }

    // Update request status
    const updatedBorrowItems = (reqData.borrow_items || []).map((bi) => {
      const matchingApp = approvedItems.find((a) => a.item_id === bi.item_id);
      return {
        ...bi,
        approved_qty: matchingApp ? matchingApp.approved_qty : 0,
      };
    });

    transaction.update(reqRef, {
      status: 'approved',
      admin_note: adminNote || reqData.admin_note || null,
      borrow_items: updatedBorrowItems,
      updated_at: new Date().toISOString(),
    });
  });
}

// Reject Borrow Request
export async function rejectBorrowRequest(requestId: string, adminNote?: string): Promise<void> {
  const reqRef = doc(db, 'borrow_requests', requestId);
  const snap = await getDoc(reqRef);
  if (!snap.exists()) throw new Error('ไม่พบคำขอยืมนี้');

  await updateDoc(reqRef, {
    status: 'rejected',
    admin_note: adminNote || null,
    updated_at: new Date().toISOString(),
  });
}

// Atomic Transaction: Return Borrow Request (Restore inventory)
export async function returnBorrowRequestTransaction(
  requestId: string,
  adminNote?: string
): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const reqRef = doc(db, 'borrow_requests', requestId);
    const reqSnap = await transaction.get(reqRef);
    if (!reqSnap.exists()) throw new Error('ไม่พบคำขอยืมนี้ในระบบ');

    const reqData = reqSnap.data() as BorrowRequest;
    if (reqData.status !== 'approved') {
      throw new Error(`คำขอนี้ไม่ได้อยู่ในสถานะอนุมัติ (สถานะปัจจุบัน: ${reqData.status})`);
    }

    // Read all item docs first
    const itemReads: Array<{
      ref: any;
      itemSnap: any;
      returnQty: number;
    }> = [];

    for (const bi of reqData.borrow_items || []) {
      const qtyToReturn = bi.approved_qty ?? bi.requested_qty;
      if (qtyToReturn > 0) {
        const itemRef = doc(db, 'items', bi.item_id);
        const itemSnap = await transaction.get(itemRef);
        if (itemSnap.exists()) {
          itemReads.push({
            ref: itemRef,
            itemSnap,
            returnQty: qtyToReturn,
          });
        }
      }
    }

    // Write: Update item inventory
    for (const read of itemReads) {
      const item = read.itemSnap.data() as Item;
      const newAvailable = Math.min(
        item.total_quantity,
        item.available_quantity + read.returnQty
      );
      transaction.update(read.ref, {
        available_quantity: newAvailable,
        updated_at: new Date().toISOString(),
      });
    }

    // Update request to returned
    transaction.update(reqRef, {
      status: 'returned',
      admin_note: adminNote || reqData.admin_note || null,
      updated_at: new Date().toISOString(),
    });
  });
}

// Cancel Borrow Request (ByUser)
export async function cancelBorrowRequest(requestId: string): Promise<void> {
  const reqRef = doc(db, 'borrow_requests', requestId);
  const snap = await getDoc(reqRef);
  if (!snap.exists()) throw new Error('ไม่พบคำขอยืมนี้');

  const data = snap.data() as BorrowRequest;
  if (data.status !== 'pending') {
    throw new Error('สามารถยกเลิกได้เฉพาะคำขอที่อยู่ในสถานะรอพิจารณาเท่านั้น');
  }

  await updateDoc(reqRef, {
    status: 'cancelled',
    updated_at: new Date().toISOString(),
  });
}
