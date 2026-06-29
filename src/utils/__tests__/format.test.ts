import { formatTime, getGreeting, formatWeight, formatDuration } from '@/utils/format';

describe('format utils', () => {
  describe('formatTime', () => {
    it('formats seconds as mm:ss', () => {
      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(65)).toBe('1:05');
      expect(formatTime(120)).toBe('2:00');
    });
  });

  describe('getGreeting', () => {
    it('returns a greeting string', () => {
      const greeting = getGreeting();
      expect(['Good morning', 'Good afternoon', 'Good evening']).toContain(greeting);
    });
  });

  describe('formatWeight', () => {
    it('formats metric weight', () => {
      expect(formatWeight(75)).toBe('75 kg');
    });

    it('formats imperial weight', () => {
      expect(formatWeight(75, 'imperial')).toBe('165 lbs');
    });
  });

  describe('formatDuration', () => {
    it('formats minutes only', () => {
      expect(formatDuration(45)).toBe('45m');
    });

    it('formats hours and minutes', () => {
      expect(formatDuration(90)).toBe('1h 30m');
      expect(formatDuration(120)).toBe('2h');
    });
  });
});
