import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
export const resend = resendApiKey ? new Resend(resendApiKey) : null;
export const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export interface EmailItemDetail {
  name: string;
  requested_qty: number;
  approved_qty?: number | null;
}

export interface SendEmailPayload {
  type: 'submitted' | 'approved' | 'rejected';
  to: string;
  borrowerName: string;
  requestId: string;
  useDate: string;
  returnDate: string;
  items: EmailItemDetail[];
  adminNote?: string | null;
}

export function generateEmailHtml(payload: SendEmailPayload): { subject: string; html: string } {
  const { type, borrowerName, requestId, useDate, returnDate, items, adminNote } = payload;

  const shortId = requestId.substring(0, 8).toUpperCase();

  if (type === 'submitted') {
    const subject = `[ได้รับคำขอแล้ว] ยืนยันการส่งคำขอยืมอุปกรณ์ล่วงหน้า #${shortId}`;
    const itemsListHtml = items
      .map(
        (i) =>
          `<li style="margin-bottom: 6px; color: #27272a;"><strong>${i.name}</strong>: ${i.requested_qty} ชิ้น</li>`
      )
      .join('');

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background-color: #fafafa; border-radius: 16px; border: 1px solid #e4e4e7;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 20px; font-weight: 300; letter-spacing: 2px; color: #18181b; margin: 0; text-transform: uppercase;">EQUIPMENT BORROW</h1>
          <p style="font-size: 11px; color: #a1a1aa; letter-spacing: 1px; margin-top: 4px; text-transform: uppercase;">ระบบยืม-คืนอุปกรณ์ล่วงหน้า</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #f4f4f5;">
          <div style="display: inline-block; padding: 4px 12px; background-color: #fef3c7; color: #92400e; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px;">
            สถานะ: รอการพิจารณาอนุมัติ (Pending)
          </div>
          
          <h2 style="font-size: 16px; color: #18181b; margin-top: 0;">เรียน ${borrowerName},</h2>
          <p style="font-size: 14px; color: #52525b; line-height: 1.6;">
            ระบบได้รับคำขอยืมอุปกรณ์ล่วงหน้าของคุณเรียบร้อยแล้ว (รหัสคำขอ: <strong>#${shortId}</strong>) เจ้าหน้าที่จะดำเนินการตรวจสอบสต็อกและแจ้งผลการอนุมัติให้ทราบทางอีเมลนี้อีกครั้ง
          </p>
          
          <div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #0f172a;">
            <p style="font-size: 13px; color: #334155; margin: 4px 0;"><strong>วันที่ต้องการใช้งาน (วันเข้ารับของ):</strong> ${useDate}</p>
            <p style="font-size: 13px; color: #334155; margin: 4px 0;"><strong>วันที่กำหนดส่งคืน:</strong> ${returnDate}</p>
          </div>

          <h3 style="font-size: 14px; color: #18181b; margin-bottom: 8px;">รายการอุปกรณ์ที่ขอยืม:</h3>
          <ul style="font-size: 14px; padding-left: 20px; margin-top: 4px;">
            ${itemsListHtml}
          </ul>
        </div>
        
        <p style="font-size: 12px; color: #a1a1aa; text-align: center; margin-top: 24px;">
          ข้อความนี้เป็นการแจ้งเตือนอัตโนมัติจากระบบยืม-คืนอุปกรณ์ประจำสาขาวิชา
        </p>
      </div>
    `;
    return { subject, html };
  }

  if (type === 'approved') {
    const subject = `[อนุมัติแล้ว] ผลการขอยืมอุปกรณ์ #${shortId} ได้รับการอนุมัติ`;
    const itemsListHtml = items
      .map(
        (i) =>
          `<li style="margin-bottom: 6px; color: #27272a;">
            <strong>${i.name}</strong>: 
            <span style="color: #059669; font-weight: 600;">อนุมัติ ${i.approved_qty ?? i.requested_qty} ชิ้น</span> 
            <span style="color: #a1a1aa; font-size: 12px;">(จากที่ขอ ${i.requested_qty} ชิ้น)</span>
          </li>`
      )
      .join('');

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background-color: #fafafa; border-radius: 16px; border: 1px solid #e4e4e7;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 20px; font-weight: 300; letter-spacing: 2px; color: #18181b; margin: 0; text-transform: uppercase;">EQUIPMENT BORROW</h1>
          <p style="font-size: 11px; color: #a1a1aa; letter-spacing: 1px; margin-top: 4px; text-transform: uppercase;">ระบบยืม-คืนอุปกรณ์ล่วงหน้า</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #f4f4f5;">
          <div style="display: inline-block; padding: 4px 12px; background-color: #d1fae5; color: #065f46; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px;">
            ✓ อนุมัติคำขอยืมแล้ว (Approved)
          </div>
          
          <h2 style="font-size: 16px; color: #18181b; margin-top: 0;">เรียน ${borrowerName},</h2>
          <p style="font-size: 14px; color: #52525b; line-height: 1.6;">
            คำขอยืมอุปกรณ์รหัส <strong>#${shortId}</strong> ของคุณได้รับการอนุมัติเรียบร้อยแล้ว กรุณาเข้ามารับอุปกรณ์ ณ ห้องพักอาจารย์/ห้องเก็บอุปกรณ์ในวันเวลาที่ระบุ
          </p>
          
          <div style="margin: 20px 0; padding: 16px; background-color: #ecfdf5; border-radius: 8px; border-left: 4px solid #10b981;">
            <p style="font-size: 13px; color: #065f46; margin: 4px 0;"><strong>วันที่เข้ารับอุปกรณ์ (วันที่ขอใช้งาน):</strong> ${useDate}</p>
            <p style="font-size: 13px; color: #065f46; margin: 4px 0;"><strong>วันที่ต้องนำมาส่งคืน:</strong> ${returnDate}</p>
          </div>

          <h3 style="font-size: 14px; color: #18181b; margin-bottom: 8px;">รายการอุปกรณ์ที่ได้รับอนุมัติ:</h3>
          <ul style="font-size: 14px; padding-left: 20px; margin-top: 4px;">
            ${itemsListHtml}
          </ul>
        </div>
        
        <p style="font-size: 12px; color: #a1a1aa; text-align: center; margin-top: 24px;">
          กรุณานำอีเมลนี้หรือแจ้งรหัส #${shortId} เมื่อเข้ามารับอุปกรณ์
        </p>
      </div>
    `;
    return { subject, html };
  }

  // rejected
  const subject = `[ไม่อนุมัติ] แจ้งผลการพิจารณาคำขอยืมอุปกรณ์ #${shortId}`;
  const itemsListHtml = items
    .map(
      (i) =>
        `<li style="margin-bottom: 6px; color: #71717a;">${i.name} (${i.requested_qty} ชิ้น)</li>`
    )
    .join('');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background-color: #fafafa; border-radius: 16px; border: 1px solid #e4e4e7;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 20px; font-weight: 300; letter-spacing: 2px; color: #18181b; margin: 0; text-transform: uppercase;">EQUIPMENT BORROW</h1>
        <p style="font-size: 11px; color: #a1a1aa; letter-spacing: 1px; margin-top: 4px; text-transform: uppercase;">ระบบยืม-คืนอุปกรณ์ล่วงหน้า</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #f4f4f5;">
        <div style="display: inline-block; padding: 4px 12px; background-color: #fee2e2; color: #991b1b; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px;">
          ✕ ไม่อนุมัติคำขอยืม (Rejected)
        </div>
        
        <h2 style="font-size: 16px; color: #18181b; margin-top: 0;">เรียน ${borrowerName},</h2>
        <p style="font-size: 14px; color: #52525b; line-height: 1.6;">
          ขออภัย เจ้าหน้าที่ไม่สามารถอนุมัติคำขอยืมอุปกรณ์รหัส <strong>#${shortId}</strong> ของคุณได้ในขณะนี้
        </p>
        
        <div style="margin: 20px 0; padding: 16px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
          <p style="font-size: 13px; color: #991b1b; margin: 0;"><strong>เหตุผลจากเจ้าหน้าที่:</strong> ${adminNote || 'ไม่มีการระบุเหตุผล'}</p>
        </div>

        <h3 style="font-size: 14px; color: #71717a; margin-bottom: 8px;">รายการที่ขอ:</h3>
        <ul style="font-size: 14px; padding-left: 20px; margin-top: 4px;">
          ${itemsListHtml}
        </ul>
      </div>
      
      <p style="font-size: 12px; color: #a1a1aa; text-align: center; margin-top: 24px;">
        หากมีข้อสงสัยเพิ่มเติม สามารถติดต่อสอบถามเจ้าหน้าที่ประจำสาขาวิชาได้โดยตรง
      </p>
    </div>
  `;
  return { subject, html };
}
