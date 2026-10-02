import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const expectedKey = process.env.ADMIN_REGISTRATION_KEY;
    if (!expectedKey) {
      return NextResponse.json({ error: 'ระบบลงทะเบียนผู้ดูแลยังไม่ได้ตั้งค่า' }, { status: 503 });
    }

    const authorization = req.headers.get('authorization');
    const idToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนลงทะเบียนสิทธิ์' }, { status: 401 });
    }

    const { securityKey } = await req.json();
    if (typeof securityKey !== 'string' || securityKey !== expectedKey) {
      return NextResponse.json({ error: 'รหัสความปลอดภัยแอดมินไม่ถูกต้อง' }, { status: 403 });
    }

    const decodedToken = await getAdminAuth().verifyIdToken(idToken);
    const email = decodedToken.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: 'ไม่พบอีเมลจากบัญชี Google' }, { status: 400 });
    }

    await getAdminDb().collection('admins').doc(email).set({
      email,
      user_id: decodedToken.uid,
      role: 'admin',
      created_at: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin registration error:', error);
    return NextResponse.json({ error: 'ไม่สามารถลงทะเบียนสิทธิ์ผู้ดูแลได้' }, { status: 500 });
  }
}
