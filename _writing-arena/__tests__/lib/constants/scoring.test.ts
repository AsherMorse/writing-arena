import { SCORING, getRankPhaseDuration } from '@/lib/constants/scoring';

describe('Scoring Constants', () => {
  describe('SCORING constants', () => {
    it('should have correct phase durations', () => {
      expect(SCORING.PHASE1_DURATION).toBe(300); // 5 minutes
      expect(SCORING.PHASE2_DURATION).toBe(180); // 3 minutes
      expect(SCORING.PHASE3_DURATION).toBe(240); // 4 minutes
    });

    it('should have reasonable time thresholds', () => {
      expect(SCORING.TIME_GREEN_THRESHOLD).toBeGreaterThan(0);
      expect(SCORING.TIME_YELLOW_THRESHOLD).toBeGreaterThan(0);
      expect(SCORING.TIME_PHASE1_GREEN).toBeGreaterThan(0);
      expect(SCORING.TIME_PHASE2_GREEN).toBeGreaterThan(0);
      expect(SCORING.TIME_PHASE3_GREEN).toBeGreaterThan(0);
    });
  });

  describe('getRankPhaseDuration', () => {
    it('should use rank-based duration when rank is provided', () => {
      // Bronze Phase 1 should be 180s (3 min), not default 300s
      expect(getRankPhaseDuration('Bronze I', 1)).toBe(180);
      
      // Silver Phase 1 should be 240s (4 min), not default 300s
      expect(getRankPhaseDuration('Silver III', 1)).toBe(240);
      
      // Gold Phase 1 should be 300s (5 min), matches default
      expect(getRankPhaseDuration('Gold I', 1)).toBe(300);
      
      // Platinum Phase 1 should be 360s (6 min), not default 300s
      expect(getRankPhaseDuration('Platinum', 1)).toBe(360);
    });

    it('should fallback to defaults when rank is null', () => {
      expect(getRankPhaseDuration(null, 1)).toBe(SCORING.PHASE1_DURATION);
      expect(getRankPhaseDuration(null, 2)).toBe(SCORING.PHASE2_DURATION);
      expect(getRankPhaseDuration(null, 3)).toBe(SCORING.PHASE3_DURATION);
    });

    it('should fallback to defaults when rank is undefined', () => {
      expect(getRankPhaseDuration(undefined, 1)).toBe(SCORING.PHASE1_DURATION);
      expect(getRankPhaseDuration(undefined, 2)).toBe(SCORING.PHASE2_DURATION);
      expect(getRankPhaseDuration(undefined, 3)).toBe(SCORING.PHASE3_DURATION);
    });

    it('should use rank-based duration for all phases', () => {
      const rank = 'Silver III';
      
      expect(getRankPhaseDuration(rank, 1)).toBe(240); // 4 min
      expect(getRankPhaseDuration(rank, 2)).toBe(180); // 3 min
      expect(getRankPhaseDuration(rank, 3)).toBe(180); // 3 min
    });

    it('should handle unknown ranks gracefully', () => {
      // Unknown ranks should default to silver tier
      expect(getRankPhaseDuration('Unknown Rank', 1)).toBe(240); // Silver default
      expect(getRankPhaseDuration('Invalid', 2)).toBe(180);
    });
  });
});

