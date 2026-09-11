/**
 * Web Security Utilities: Sanitization, HTML Escaping, and Rate Limiting
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escapes characters that could lead to HTML injection / XSS
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str).replace(/[&<>"'/]/g, (match) => HTML_ESCAPE_MAP[match] || match);
}

/**
 * Sanitizes input strings by trimming, stripping harmful control characters,
 * and restricting length to prevent buffer/payload injection attacks.
 */
export function sanitizeString(val: unknown, maxLength: number = 255): string {
  if (val === null || val === undefined) return '';
  const str = String(val)
    // Remove control characters (0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F, 0x7F)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
  return str.length > maxLength ? str.substring(0, maxLength) : str;
}

/**
 * Validates whether an email conforms to a valid format
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates phone numbers (numeric, hyphens, plus, spaces, 8-20 characters)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.trim().replace(/[\s-]/g, '');
  return /^(0\d{8,9}|\+66\d{8,9}|\d{8,15})$/.test(cleaned);
}

// In-Memory Rate Limiter Map: key -> { count, resetTime }
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
let lastCleanup = Date.now();
function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < 300000) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Checks and increments rate limit for a given identifier (e.g. IP address or user ID)
 *
 * @param key Unique key for client/IP
 * @param limit Maximum requests allowed in window
 * @param windowMs Time window in milliseconds
 * @returns { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  cleanupStaleEntries();

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    const newResetTime = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetTime: newResetTime });
    return { allowed: true, remaining: limit - 1, resetTime: newResetTime };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetTime: entry.resetTime };
}

/**
 * Reset rate limit for testing purposes
 */
export function _resetRateLimits(): void {
  rateLimitStore.clear();
}
