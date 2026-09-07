import { describe, it, expect, beforeEach } from 'vitest';
import {
  escapeHtml,
  sanitizeString,
  isValidEmail,
  isValidPhone,
  checkRateLimit,
  _resetRateLimits,
} from './security';

describe('Web Security Utilities (lib/security.ts)', () => {
  beforeEach(() => {
    _resetRateLimits();
  });

  describe('escapeHtml', () => {
    it('should escape dangerous HTML characters to prevent XSS / HTML injection', () => {
      const input = '<script>alert("XSS & Hack");</script>';
      const escaped = escapeHtml(input);
      expect(escaped).toBe('&lt;script&gt;alert(&quot;XSS &amp; Hack&quot;);&lt;&#x2F;script&gt;');
      expect(escaped).not.toContain('<');
      expect(escaped).not.toContain('>');
    });

    it('should escape single and double quotes and forward slashes', () => {
      const input = `onclick='attack()' href="/bad"`;
      const escaped = escapeHtml(input);
      expect(escaped).toBe('onclick=&#x27;attack()&#x27; href=&quot;&#x2F;bad&quot;');
    });

    it('should preserve benign Thai and alphanumeric strings', () => {
      const input = 'กล้องวิดีโอ 4K Sony และ ไมโครโฟนไร้สาย';
      expect(escapeHtml(input)).toBe(input);
    });

    it('should safely handle null, undefined, and empty string', () => {
      expect(escapeHtml('')).toBe('');
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });
  });

  describe('sanitizeString', () => {
    it('should trim leading and trailing whitespace', () => {
      expect(sanitizeString('   นายทดสอบ ระบบ   ')).toBe('นายทดสอบ ระบบ');
    });

    it('should strip harmful ASCII control characters', () => {
      const malicious = 'Test\x00Name\x08Payload\x1F';
      expect(sanitizeString(malicious)).toBe('TestNamePayload');
    });

    it('should clamp string length to specified maxLength', () => {
      const longStr = 'a'.repeat(300);
      const clamped = sanitizeString(longStr, 100);
      expect(clamped.length).toBe(100);
    });

    it('should safely handle null and undefined', () => {
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
    });
  });

  describe('isValidEmail', () => {
    it('should validate standard email addresses', () => {
      expect(isValidEmail('user@psu.ac.th')).toBe(true);
      expect(isValidEmail('admin.test@gmail.com')).toBe(true);
      expect(isValidEmail('somchai-k@sci.psu.ac.th')).toBe(true);
    });

    it('should reject invalid or malicious email strings', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@psu.ac.th')).toBe(false);
      expect(isValidEmail('<script>@test.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should accept valid Thai telephone and mobile phone numbers', () => {
      expect(isValidPhone('081-234-5678')).toBe(true);
      expect(isValidPhone('074288000')).toBe(true);
      expect(isValidPhone('+66812345678')).toBe(true);
      expect(isValidPhone('081 234 5678')).toBe(true);
    });

    it('should reject invalid phone strings', () => {
      expect(isValidPhone('12345')).toBe(false); // too short
      expect(isValidPhone('phone12345678')).toBe(false); // contains letters
      expect(isValidPhone('')).toBe(false);
    });
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit and track remaining allowance', () => {
      const key = 'test-ip-1';
      const r1 = checkRateLimit(key, 3, 60000);
      expect(r1.allowed).toBe(true);
      expect(r1.remaining).toBe(2);

      const r2 = checkRateLimit(key, 3, 60000);
      expect(r2.allowed).toBe(true);
      expect(r2.remaining).toBe(1);

      const r3 = checkRateLimit(key, 3, 60000);
      expect(r3.allowed).toBe(true);
      expect(r3.remaining).toBe(0);

      // Exceeded limit
      const r4 = checkRateLimit(key, 3, 60000);
      expect(r4.allowed).toBe(false);
      expect(r4.remaining).toBe(0);
    });

    it('should isolate limits by key', () => {
      const rA = checkRateLimit('ip-a', 1, 60000);
      expect(rA.allowed).toBe(true);

      const rA2 = checkRateLimit('ip-a', 1, 60000);
      expect(rA2.allowed).toBe(false);

      // Different IP should still be allowed
      const rB = checkRateLimit('ip-b', 1, 60000);
      expect(rB.allowed).toBe(true);
    });
  });
});
