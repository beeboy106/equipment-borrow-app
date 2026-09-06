import { NextResponse } from 'next/server';
import {
  resend,
  fromEmail,
  adminNotificationEmail,
  generateAdminEmailHtml,
  AdminNotificationPayload,
} from '@/lib/resend';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AdminNotificationPayload;

    if (!body.requestId || !body.borrowerName || !body.items) {
      return NextResponse.json({ error: 'Missing required request fields' }, { status: 400 });
    }

    // กำหนดปลายทางเป็นอีเมลของผู้ดูแลระบบ (Admin) เท่านั้น
    const targetAdminEmail =
      process.env.ADMIN_NOTIFICATION_EMAIL ||
      process.env.ADMIN_EMAIL ||
      adminNotificationEmail;

    if (!resend) {
      console.warn('RESEND_API_KEY is not configured. Skipping email delivery.');
      return NextResponse.json(
        {
          message: 'RESEND_API_KEY not configured, email simulated successfully',
          sentTo: targetAdminEmail,
        },
        { status: 200 }
      );
    }

    const { subject, html } = generateAdminEmailHtml(body);

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
