import { getInitials, formatSalaryRange, confidenceLabel, statusBadgeStyle } from '../src/utils/formatters';

describe('getInitials', () => {
  test('returns the first letter of each of the first two words, uppercased', () => {
    expect(getInitials('Amina Yousafzai')).toBe('AY');
  });

  test('handles a single-word name', () => {
    expect(getInitials('Cher')).toBe('C');
  });

  test('returns an empty string for empty input', () => {
    expect(getInitials('')).toBe('');
  });

  test('ignores extra whitespace between words', () => {
    expect(getInitials('  Jane   Doe  ')).toBe('JD');
  });
});

describe('formatSalaryRange', () => {
  test('formats a full min-max range with commas', () => {
    expect(formatSalaryRange(90000, 110000)).toBe('$90,000 - $110,000');
  });

  test('formats a min-only value with a plus sign', () => {
    expect(formatSalaryRange(90000, null)).toBe('$90,000+');
  });

  test('formats a max-only value with "Up to"', () => {
    expect(formatSalaryRange(null, 110000)).toBe('Up to $110,000');
  });

  test('returns "Not specified" when both are missing', () => {
    expect(formatSalaryRange(null, null)).toBe('Not specified');
  });
});

describe('confidenceLabel', () => {
  test('returns High for scores 80 and above', () => {
    expect(confidenceLabel(80)).toBe('High');
    expect(confidenceLabel(95)).toBe('High');
  });

  test('returns Medium for scores between 50 and 79', () => {
    expect(confidenceLabel(50)).toBe('Medium');
    expect(confidenceLabel(79)).toBe('Medium');
  });

  test('returns Low for anything below 50', () => {
    expect(confidenceLabel(49)).toBe('Low');
    expect(confidenceLabel(0)).toBe('Low');
  });

  test('returns null for a null score, rather than a misleading label', () => {
    expect(confidenceLabel(null)).toBeNull();
  });
});

describe('statusBadgeStyle', () => {
  test('returns a known style for a recognized status', () => {
    expect(statusBadgeStyle('Interview')).toContain('primary');
  });

  test('falls back to a default style for an unrecognized status', () => {
    expect(statusBadgeStyle('SomeUnknownStatus')).toBe('bg-slate-100 text-ink-700');
  });
});
