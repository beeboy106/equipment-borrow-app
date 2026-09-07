import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
export const resend = resendApiKey ? new Resend(resendApiKey) : null;
export const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
export const adminNotificationEmail =
  process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'admin@equipment-borrow.local';

export interface EmailItemDetail {
  name: string;
  requested_qty: number;
  approved_qty?: number | null;
}

export interface AdminNotificationPayload {
  requestId: string;
  borrowerName: string;
  borrowerEmail: string;
  phone: string;
  userGroup: string;
  departmentOrUnit?: string | null;
  purpose: string;
  useDate: string;
  returnDate: string;
  items: EmailItemDetail[];
  adminUrl?: string;
}

export function generateAdminEmailHtml(payload: AdminNotificationPayload): { subject: string; html: string } {
  const {
    borrowerName,
    borrowerEmail,
    phone,
    userGroup,
    departmentOrUnit,
    requestId,
    useDate,
    returnDate,
    purpose,
    items,
    adminUrl = 'http://localhost:3000/admin/dashboard',
  } = payload;

  const shortId = requestId.substring(0, 8).toUpperCase();
  const affiliationText =
    userGroup && departmentOrUnit ? `${userGroup} - ${departmentOrUnit}` : userGroup || '';

  const subject = `[คำขอยืมใหม่] #${shortId} จากคุณ ${borrowerName} (${userGroup})`;

  const itemsListHtml = items
    .map(
      (i) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 12px; color: #1e293b; font-weight: 600; font-size: 13px;">${i.name}</td>
        <td style="padding: 10px 12px; color: #4338ca; font-weight: 700; text-align: right; font-size: 13px;">${i.requested_qty} ชิ้น</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 24px 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner (Bulletproof for Outlook & all email clients) -->
          <div style="background-color: #eef2ff; border-bottom: 2px solid #e0e7ff; padding: 26px 20px; text-align: center;">
            <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #4f46e5; font-weight: 800;">
              EQUIPMENT BORROW NOTIFICATION
            </p>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #1e1b4b; line-height: 1.3;">
              มีคำขอยืมอุปกรณ์เข้ามาใหม่
            </h1>
            <div style="margin-top: 10px;">
              <span style="display: inline-block; background-color: #ffffff; padding: 4px 12px; border-radius: 8px; font-size: 13px; color: #3730a3; font-weight: 700; border: 1px solid #c7d2fe;">
                รหัสคำขอ: #${shortId}
              </span>
            </div>
          </div>

          <!-- Body Container -->
          <div style="padding: 24px 28px;">
            <div style="display: inline-block; padding: 4px 12px; background-color: #fef3c7; color: #92400e; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 20px;">
              สถานะ: รอการพิจารณาอนุมัติ (Pending)
            </div>

            <!-- Borrower Info Card -->
            <div style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 18px 20px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                ข้อมูลผู้ขอยืม
              </h3>
              <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; color: #64748b; width: 140px;">ชื่อ-นามสกุล:</td>
                  <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">${borrowerName}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">กลุ่มผู้ใช้งาน / สังกัด:</td>
                  <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">${affiliationText}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">อีเมล:</td>
                  <td style="padding: 4px 0; color: #0f172a;">${borrowerEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">เบอร์โทรศัพท์:</td>
                  <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b; vertical-align: top;">วัตถุประสงค์:</td>
                  <td style="padding: 4px 0; color: #334155;">${purpose || '-'}</td>
                </tr>
              </table>
            </div>

            <!-- Dates Schedule -->
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
              <div style="font-size: 13px; color: #1e3a8a; margin-bottom: 4px;">
                <strong>วันที่ต้องการใช้งาน (วันรับของ):</strong> ${useDate}
              </div>
              <div style="font-size: 13px; color: #1e3a8a;">
                <strong>วันที่กำหนดส่งคืน:</strong> <span style="color: #dc2626; font-weight: 700;">${returnDate}</span>
              </div>
            </div>

            <!-- Items Table -->
            <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #0f172a;">
              รายการอุปกรณ์ที่ขอยืม (${items.length} รายการ)
            </h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background-color: #f1f5f9; text-align: left; font-size: 12px; color: #475569;">
                  <th style="padding: 8px 12px; font-weight: 700;">ชื่ออุปกรณ์</th>
                  <th style="padding: 8px 12px; font-weight: 700; text-align: right;">จำนวนที่ขอ</th>
                </tr>
              </thead>
              <tbody>
                ${itemsListHtml}
              </tbody>
            </table>

            <!-- Action Button & Link for Admin -->
            <div style="margin: 28px 0; text-align: center; background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 22px 16px;">
              <p style="margin: 0 0 14px 0; font-size: 13px; font-weight: 600; color: #334155;">
                คลิกปุ่มด้านล่างเพื่อเข้าสู่ระบบและพิจารณาอนุมัติคำขอ:
              </p>
              <a href="${adminUrl}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-weight: 700; font-size: 14px; padding: 12px 28px; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.25);">
                เข้าสู่หน้าจัดการระบบ (Admin Dashboard) &rarr;
              </a>
              <div style="margin-top: 14px; font-size: 11px; color: #64748b; line-height: 1.6; word-break: break-all;">
                หรือเปิดผ่านลิงก์นี้:<br />
                <a href="${adminUrl}" target="_blank" style="color: #4f46e5; text-decoration: underline;">${adminUrl}</a>
              </div>
            </div>

            <!-- Note about user checking via web -->
            <div style="padding: 12px 16px; background-color: #f1f5f9; border-radius: 8px; font-size: 12px; color: #64748b; margin-bottom: 20px;">
              💡 <em>หมายเหตุ: ผู้ใช้งานจะตรวจสอบผลการอนุมัติผ่านหน้าเว็บ (เมนู "คำขอของฉัน") โดยตรง ไม่มีการส่งอีเมลตอบกลับไปยังผู้ใช้งาน</em>
            </div>

          </div>

          <!-- Footer -->
          <div style="padding: 16px 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
            ระบบยืม-คืนอุปกรณ์การเรียนการสอนและไอที • อีเมลแจ้งเตือนสำหรับผู้ดูแลระบบ
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, html };
}
