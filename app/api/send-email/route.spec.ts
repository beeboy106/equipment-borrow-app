import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from './route';
import { _resetRateLimits } from '@/lib/security';

describe('API Route: POST /api/send-email (app/api/send-email/route.ts)', () => {
  beforeEach(() => {
    _resetRateLimits();
  });

  it('should reject requests with missing required fields (HTTP 400)', async () => {
    const req = new Request('http://localhost:3000/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: '',
        borrowerName: '',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('should reject requests with invalid email format (HTTP 400)', async () => {
    const req = new Request('http://localhost:3000/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: 'REQ-12345',
        borrowerName: 'สมชาย ทดสอบ',
        borrowerEmail: 'invalid-email-address',
        phone: '0812345678',
        items: [{ name: 'สาย HDMI', requested_qty: 2 }],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain('รูปแบบอีเมลไม่ถูกต้อง');
  });

  it('should reject requests exceeding maximum item limit (HTTP 400)', async () => {
    const items = Array.from({ length: 55 }, (_, i) => ({
      name: `อุปกรณ์ชิ้นที่ ${i + 1}`,
      requested_qty: 1,
    }));

    const req = new Request('http://localhost:3000/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: 'REQ-999',
        borrowerName: 'สมชาย ทดสอบ',
        borrowerEmail: 'somchai@psu.ac.th',
        phone: '0812345678',
        items,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain('เกินจำนวนสูงสุด');
  });

  it('should enforce rate limiting after repeated requests (HTTP 429)', async () => {
    const validBody = {
      requestId: 'REQ-RATELIMIT',
      borrowerName: 'อาจารย์ สมศักดิ์',
      borrowerEmail: 'somsak@psu.ac.th',
      phone: '0812345678',
      items: [{ name: 'โปรเจกเตอร์', requested_qty: 1 }],
    };

    const makeReq = () =>
      new Request('http://localhost:3000/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.50',
        },
        body: JSON.stringify(validBody),
      });

    // Make 5 requests (all should pass validation and not be 429)
    for (let i = 0; i < 5; i++) {
      const res = await POST(makeReq());
      expect(res.status).not.toBe(429);
    }

    // 6th request from same IP should be blocked with 429 Too Many Requests
    const blockedRes = await POST(makeReq());
    expect(blockedRes.status).toBe(429);

    const data = await blockedRes.json();
    expect(data.error).toContain('คุณส่งคำขอถี่เกินไป');
  });
});
