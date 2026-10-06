import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

const DEFAULT_ADMIN_EMAILS = new Set([
  '6710210106@psu.ac.th',
  'thunwa02122547@gmail.com',
]);

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get('authorization');
    const idToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนย้ายข้อมูล' }, { status: 401 });
    }

    const auth = getAdminAuth();
    const db = getAdminDb();
    const decodedToken = await auth.verifyIdToken(idToken);
    const email = decodedToken.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: 'ไม่พบอีเมลจากบัญชี Google' }, { status: 400 });
    }

    const isDefaultAdmin = DEFAULT_ADMIN_EMAILS.has(email);
    const adminDoc = isDefaultAdmin ? null : await db.collection('admins').doc(email).get();
    if (!isDefaultAdmin && !adminDoc?.exists) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์ย้ายข้อมูลคำขอยืม' }, { status: 403 });
    }

    const requests = await db.collection('borrow_requests').get();
    const legacyRequests = requests.docs.filter((request) => {
      const userId = request.get('user_id');
      return typeof userId !== 'string' || !userId.trim();
    });
    const requestsByEmail = new Map<string, typeof legacyRequests>();

    for (const request of legacyRequests) {
      const borrowerEmail = request.get('borrower_email');
      if (typeof borrowerEmail !== 'string' || !borrowerEmail.trim()) continue;
      const normalizedEmail = borrowerEmail.trim().toLowerCase();
      const records = requestsByEmail.get(normalizedEmail) || [];
      records.push(request);
      requestsByEmail.set(normalizedEmail, records);
    }

    const uidByEmail = new Map<string, string>();
    const emails = [...requestsByEmail.keys()];
    for (let index = 0; index < emails.length; index += 100) {
      const batchEmails = emails.slice(index, index + 100);
      const users = await auth.getUsers(batchEmails.map((lookupEmail) => ({ email: lookupEmail })));
      users.users.forEach((user) => {
        if (user.email) uidByEmail.set(user.email.toLowerCase(), user.uid);
      });
    }

    let migrated = 0;
    let pendingWrites = 0;
    let batch = db.batch();
    for (const [borrowerEmail, records] of requestsByEmail) {
      const userId = uidByEmail.get(borrowerEmail);
      if (!userId) continue;

      for (const request of records) {
        batch.update(request.ref, { user_id: userId });
        migrated += 1;
        pendingWrites += 1;
        if (pendingWrites === 500) {
          await batch.commit();
          batch = db.batch();
          pendingWrites = 0;
        }
      }
    }
    if (pendingWrites) await batch.commit();

    return NextResponse.json({
      migrated,
      unmatched: legacyRequests.length - migrated,
    });
  } catch (error) {
    console.error('Borrow request owner migration error:', error);
    return NextResponse.json({ error: 'ไม่สามารถย้ายข้อมูลประวัติคำขอยืมได้' }, { status: 500 });
  }
}
