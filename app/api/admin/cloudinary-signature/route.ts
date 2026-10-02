import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

const DEFAULT_ADMIN_EMAILS = new Set([
  '6710210106@psu.ac.th',
  'thunwa02122547@gmail.com',
]);
const FOLDER = 'equipment-borrow/items';

export async function GET(req: Request) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'ระบบอัปโหลดรูปภาพยังไม่ได้ตั้งค่า' }, { status: 503 });
    }

    const authorization = req.headers.get('authorization');
    const idToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนอัปโหลดรูปภาพ' }, { status: 401 });
    }

    const decodedToken = await getAdminAuth().verifyIdToken(idToken);
    const email = decodedToken.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: 'ไม่พบอีเมลจากบัญชี Google' }, { status: 400 });
    }

    const isDefaultAdmin = DEFAULT_ADMIN_EMAILS.has(email);
    const adminDoc = isDefaultAdmin
      ? null
      : await getAdminDb().collection('admins').doc(email).get();
    if (!isDefaultAdmin && !adminDoc?.exists) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์อัปโหลดรูปภาพ' }, { status: 403 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const parametersToSign = `folder=${FOLDER}&timestamp=${timestamp}`;
    const signature = createHash('sha1')
      .update(`${parametersToSign}${apiSecret}`)
      .digest('hex');

    return NextResponse.json({ cloudName, apiKey, timestamp, signature, folder: FOLDER });
  } catch (error) {
    console.error('Cloudinary signature error:', error);
    return NextResponse.json({ error: 'ไม่สามารถยืนยันสิทธิ์อัปโหลดรูปภาพได้' }, { status: 500 });
  }
}
