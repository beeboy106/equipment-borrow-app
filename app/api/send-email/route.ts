import { NextResponse } from 'next/server';
import {
  resend,
  fromEmail,
  adminNotificationEmail,
  generateAdminEmailHtml,
  AdminNotificationPayload,
} from '@/lib/resend';
import { checkRateLimit, sanitizeString, isValidEmail, isValidPhone } from '@/lib/security';

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Protection (Max 5 email requests per 2 minutes per IP)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : req.headers.get('x-real-ip') || '127.0.0.1';
    
    const rateLimit = checkRateLimit(`email:${clientIp}`, 5, 120000);
    if (!rateLimit.allowed) {
      const retryAfterSec = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'คุณส่งคำขอถี่เกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง' },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSec),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // 2. Parse & Validate Payload
    const rawBody = (await req.json()) as Partial<AdminNotificationPayload>;

    if (!rawBody || typeof rawBody !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const requestId = sanitizeString(rawBody.requestId, 64);
    const borrowerName = sanitizeString(rawBody.borrowerName, 100);
    const borrowerEmail = sanitizeString(rawBody.borrowerEmail, 254);
    const phone = sanitizeString(rawBody.phone, 30);
    const userGroup = sanitizeString(rawBody.userGroup, 50);
    const departmentOrUnit = sanitizeString(rawBody.departmentOrUnit, 100);
    const purpose = sanitizeString(rawBody.purpose, 1000);
    const useDate = sanitizeString(rawBody.useDate, 50);
    const returnDate = sanitizeString(rawBody.returnDate, 50);

    if (!requestId || !borrowerName || !rawBody.items || !Array.isArray(rawBody.items) || rawBody.items.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
    }

    if (rawBody.items.length > 50) {
      return NextResponse.json({ error: 'รายการอุปกรณ์เกินจำนวนสูงสุดที่อนุญาต (50 ชิ้น)' }, { status: 400 });
    }

    if (borrowerEmail && !isValidEmail(borrowerEmail)) {
      return NextResponse.json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' }, { status: 400 });
    }

    if (phone && !isValidPhone(phone)) {
      return NextResponse.json({ error: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง' }, { status: 400 });
    }

    const validatedItems = rawBody.items.map((i) => ({
      name: sanitizeString(i.name, 150) || 'อุปกรณ์ไม่ระบุชื่อ',
      requested_qty: Math.max(1, Math.min(1000, Number(i.requested_qty) || 1)),
      approved_qty: i.approved_qty ? Math.max(0, Number(i.approved_qty)) : null,
    }));

    const safePayload: AdminNotificationPayload = {
      requestId,
      borrowerName,
      borrowerEmail,
      phone,
      userGroup: userGroup || 'ทั่วไป',
      departmentOrUnit,
      purpose,
      useDate,
      returnDate,
      items: validatedItems,
    };

    // กำหนดปลายทางเป็นอีเมลของผู้ดูแลระบบ (Admin) เท่านั้น
    const targetAdminEmail =
      process.env.ADMIN_NOTIFICATION_EMAIL ||
      process.env.ADMIN_EMAIL ||
      adminNotificationEmail;

    // ตรวจสอบและสร้าง URL สำหรับลิงก์เข้าสู่หน้า Admin Dashboard
    const defaultBaseUrl = 'https://equipment-borrow-app.vercel.app';
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      (req.headers.get('origin') && !req.headers.get('origin')?.includes('localhost')
        ? req.headers.get('origin')
        : null) ||
      (req.headers.get('host') && !req.headers.get('host')?.includes('localhost')
        ? `https://${req.headers.get('host')}`
        : null) ||
      defaultBaseUrl;

    const adminUrl = rawBody.adminUrl && !rawBody.adminUrl.includes('localhost') && (rawBody.adminUrl.startsWith('http://') || rawBody.adminUrl.startsWith('https://'))
      ? rawBody.adminUrl
      : `${origin}/admin`;

    if (!resend) {
      console.warn('RESEND_API_KEY is not configured. Skipping email delivery.');
      return NextResponse.json(
        {
          message: 'RESEND_API_KEY not configured, email simulated successfully',
          sentTo: targetAdminEmail,
          adminUrl,
        },
        { status: 200 }
      );
    }

    const { subject, html } = generateAdminEmailHtml({ ...safePayload, adminUrl });

    const { data, error } = await resend.emails.send({
      from: `EQUIPMENT BORROW <${fromEmail}>`,
      to: [targetAdminEmail],
      subject,
      html,
    });

    if (error) {
      console.error('Resend admin notification error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sentTo: targetAdminEmail,
      data,
    });
  } catch (err: any) {
    console.error('API Send Email error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
