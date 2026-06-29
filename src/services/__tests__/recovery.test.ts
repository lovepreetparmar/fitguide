import { recoveryService } from '@/services/progress';

describe('recoveryService', () => {
  describe('calculateRecoveryScore', () => {
    it('returns recovering or needs_rest for high volume with limited rest', () => {
      const twoDaysAgo = new Date(Date.now() - 48 * 3600000).toISOString();
      const result = recoveryService.calculateRecoveryScore(twoDaysAgo, 1000, 2);
      expect(result.score).toBeLessThan(50);
      expect(['recovering', 'needs_rest']).toContain(result.status);
    });

    it('returns needs_rest for recently trained muscle with high volume', () => {
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
      const result = recoveryService.calculateRecoveryScore(oneHourAgo, 10000, 0);
      expect(result.status).toBe('needs_rest');
    });

    it('returns full score when never trained', () => {
      const result = recoveryService.calculateRecoveryScore(null, 0, 0);
      expect(result.score).toBe(100);
      expect(result.status).toBe('recovered');
    });
  });

  describe('getOverallRecoveryScore', () => {
    it('calculates average recovery score', () => {
      const recovery = [
        { score: 80 } as Parameters<typeof recoveryService.getOverallRecoveryScore>[0][0],
        { score: 60 } as Parameters<typeof recoveryService.getOverallRecoveryScore>[0][0],
      ];
      expect(recoveryService.getOverallRecoveryScore(recovery)).toBe(70);
    });

    it('returns 100 for empty array', () => {
      expect(recoveryService.getOverallRecoveryScore([])).toBe(100);
    });
  });
});
