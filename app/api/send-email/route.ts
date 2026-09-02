import { NextResponse } from 'next/server';
import { resend, fromEmail, generateEmailHtml, SendEmailPayload } from '@/lib/resend';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SendEmailPayload;

    if (!body.to || !body.type || !body.requestId) {
      return NextResponse.json({ error: 'Missing required email fields' }, { status: 400 });
    }

    if (!resend) {
      console.warn('RESEND_API_KEY is not configured. Skipping email delivery.');
      return NextResponse.json(
        { message: 'RESEND_API_KEY not configured, email simulated successfully' },
        { status: 200 }
      );
    }

    const { subject, html } = generateEmailHtml(body);

    const { data, error } = await resend.emails.send({
      from: `EQUIPMENT BORROW <${fromEmail}>`,
      to: [body.to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend email error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('API Send Email error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
