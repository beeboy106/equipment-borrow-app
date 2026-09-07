import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime } from './utils';

describe('Utility Functions (lib/utils.ts)', () => {
  describe('formatDate', () => {
    it('should format ISO date string into Thai locale date', () => {
      // 2026-09-07 should format to day, month, Thai BE year (2569)
      const formatted = formatDate('2026-09-07T00:00:00.000Z');
      expect(formatted).toContain('7');
      expect(formatted).toContain('2569');
    });

    it('should return dash "-" when given null or undefined or empty', () => {
      expect(formatDate(null)).toBe('-');
      expect(formatDate(undefined)).toBe('-');
      expect(formatDate('')).toBe('-');
    });

    it('should return original string when given an invalid date string', () => {
      expect(formatDate('not-a-valid-date')).toBe('not-a-valid-date');
    });
  });

  describe('formatDateTime', () => {
    it('should format ISO timestamp string into Thai date and time', () => {
      const formatted = formatDateTime('2026-09-07T12:30:00.000Z');
      expect(formatted).toContain('2569');
      expect(formatted).not.toBe('-');
    });

    it('should return dash "-" when given null or undefined or empty', () => {
      expect(formatDateTime(null)).toBe('-');
      expect(formatDateTime(undefined)).toBe('-');
      expect(formatDateTime('')).toBe('-');
    });
  });
});
