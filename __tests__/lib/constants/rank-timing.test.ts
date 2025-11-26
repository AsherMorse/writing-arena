import {
  getRankTier,
  getPhaseDuration,
  getRankTiming,
  RankTier,
  RANK_TIMING,
} from '@/lib/constants/rank-timing';

describe('Rank Timing Configuration', () => {
  describe('getRankTier', () => {
    it('should identify bronze ranks correctly', () => {
      expect(getRankTier('Bronze I')).toBe('bronze');
      expect(getRankTier('Bronze II')).toBe('bronze');
      expect(getRankTier('Bronze III')).toBe('bronze');
      expect(getRankTier('bronze')).toBe('bronze');
    });

    it('should identify silver ranks correctly', () => {
      expect(getRankTier('Silver I')).toBe('silver');
      expect(getRankTier('Silver II')).toBe('silver');
      expect(getRankTier('Silver III')).toBe('silver');
      expect(getRankTier('silver')).toBe('silver');
    });

    it('should identify gold ranks correctly', () => {
      expect(getRankTier('Gold I')).toBe('gold');
      expect(getRankTier('Gold II')).toBe('gold');
      expect(getRankTier('Gold III')).toBe('gold');
      expect(getRankTier('gold')).toBe('gold');
    });

    it('should identify platinum ranks correctly', () => {
      expect(getRankTier('Platinum')).toBe('platinum');
      expect(getRankTier('Platinum I')).toBe('platinum');
      expect(getRankTier('platinum')).toBe('platinum');
    });

    it('should identify diamond ranks correctly', () => {
      expect(getRankTier('Diamond')).toBe('diamond');
      expect(getRankTier('Diamond I')).toBe('diamond');
      expect(getRankTier('diamond')).toBe('diamond');
    });

    it('should identify master ranks correctly', () => {
      expect(getRankTier('Master')).toBe('master');
      expect(getRankTier('Grand Master')).toBe('master');
      expect(getRankTier('master')).toBe('master');
      expect(getRankTier('grand master')).toBe('master');
    });

    it('should default to silver for unknown ranks', () => {
      expect(getRankTier('Unknown Rank')).toBe('silver');
      expect(getRankTier('')).toBe('silver');
      expect(getRankTier('Invalid')).toBe('silver');
    });

    it('should be case insensitive', () => {
      expect(getRankTier('BRONZE')).toBe('bronze');
      expect(getRankTier('SILVER')).toBe('silver');
      expect(getRankTier('GOLD')).toBe('gold');
    });
  });

  describe('getPhaseDuration', () => {
    describe('Bronze rank', () => {
      it('should return correct durations for all phases', () => {
        expect(getPhaseDuration('Bronze I', 1)).toBe(180); // 3 minutes
        expect(getPhaseDuration('Bronze I', 2)).toBe(150); // 2.5 minutes
        expect(getPhaseDuration('Bronze I', 3)).toBe(150); // 2.5 minutes
      });
    });

    describe('Silver rank', () => {
      it('should return correct durations for all phases', () => {
        expect(getPhaseDuration('Silver III', 1)).toBe(240); // 4 minutes
        expect(getPhaseDuration('Silver III', 2)).toBe(180); // 3 minutes
        expect(getPhaseDuration('Silver III', 3)).toBe(180); // 3 minutes
      });
    });

    describe('Gold rank', () => {
      it('should return correct durations for all phases', () => {
        expect(getPhaseDuration('Gold I', 1)).toBe(300); // 5 minutes
        expect(getPhaseDuration('Gold I', 2)).toBe(210); // 3.5 minutes
        expect(getPhaseDuration('Gold I', 3)).toBe(210); // 3.5 minutes
      });
    });

    describe('Platinum rank', () => {
      it('should return correct durations for all phases', () => {
        expect(getPhaseDuration('Platinum', 1)).toBe(360); // 6 minutes
        expect(getPhaseDuration('Platinum', 2)).toBe(240); // 4 minutes
        expect(getPhaseDuration('Platinum', 3)).toBe(240); // 4 minutes
      });
    });

    describe('Diamond rank', () => {
      it('should return correct durations for all phases', () => {
        expect(getPhaseDuration('Diamond', 1)).toBe(360); // 6 minutes
        expect(getPhaseDuration('Diamond', 2)).toBe(240); // 4 minutes
        expect(getPhaseDuration('Diamond', 3)).toBe(240); // 4 minutes
      });
    });

    describe('Master rank', () => {
      it('should return correct durations for all phases', () => {
        expect(getPhaseDuration('Master', 1)).toBe(360); // 6 minutes
        expect(getPhaseDuration('Grand Master', 2)).toBe(240); // 4 minutes
        expect(getPhaseDuration('Master', 3)).toBe(240); // 4 minutes
      });
    });

    it('should default to silver for unknown ranks', () => {
      expect(getPhaseDuration('Unknown', 1)).toBe(240); // Silver default
      expect(getPhaseDuration('Unknown', 2)).toBe(180);
      expect(getPhaseDuration('Unknown', 3)).toBe(180);
    });
  });

  describe('getRankTiming', () => {
    it('should return complete timing configuration for bronze', () => {
      const timing = getRankTiming('Bronze I');
      expect(timing).toEqual({
        phase1: 180,
        phase2: 150,
        phase3: 150,
      });
    });

    it('should return complete timing configuration for silver', () => {
      const timing = getRankTiming('Silver III');
      expect(timing).toEqual({
        phase1: 240,
        phase2: 180,
        phase3: 180,
      });
    });

    it('should return complete timing configuration for gold', () => {
      const timing = getRankTiming('Gold II');
      expect(timing).toEqual({
        phase1: 300,
        phase2: 210,
        phase3: 210,
      });
    });

    it('should return complete timing configuration for platinum', () => {
      const timing = getRankTiming('Platinum');
      expect(timing).toEqual({
        phase1: 360,
        phase2: 240,
        phase3: 240,
      });
    });
  });

  describe('RANK_TIMING configuration', () => {
    it('should have all rank tiers defined', () => {
      const tiers: RankTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'];
      tiers.forEach(tier => {
        expect(RANK_TIMING[tier]).toBeDefined();
        expect(RANK_TIMING[tier].phase1).toBeGreaterThan(0);
        expect(RANK_TIMING[tier].phase2).toBeGreaterThan(0);
        expect(RANK_TIMING[tier].phase3).toBeGreaterThan(0);
      });
    });

    it('should have increasing durations for higher ranks (Phase 1)', () => {
      expect(RANK_TIMING.bronze.phase1).toBeLessThan(RANK_TIMING.silver.phase1);
      expect(RANK_TIMING.silver.phase1).toBeLessThan(RANK_TIMING.gold.phase1);
      expect(RANK_TIMING.gold.phase1).toBeLessThanOrEqual(RANK_TIMING.platinum.phase1);
      expect(RANK_TIMING.platinum.phase1).toBeLessThanOrEqual(RANK_TIMING.diamond.phase1);
      expect(RANK_TIMING.diamond.phase1).toBeLessThanOrEqual(RANK_TIMING.master.phase1);
    });

    it('should have reasonable phase durations (all phases)', () => {
      Object.values(RANK_TIMING).forEach(config => {
        // Phase durations should be between 2-7 minutes (120-420 seconds)
        expect(config.phase1).toBeGreaterThanOrEqual(120);
        expect(config.phase1).toBeLessThanOrEqual(420);
        expect(config.phase2).toBeGreaterThanOrEqual(120);
        expect(config.phase2).toBeLessThanOrEqual(420);
        expect(config.phase3).toBeGreaterThanOrEqual(120);
        expect(config.phase3).toBeLessThanOrEqual(420);
      });
    });

    it('should have Phase 1 duration >= Phase 2 duration for all ranks', () => {
      Object.values(RANK_TIMING).forEach(config => {
        expect(config.phase1).toBeGreaterThanOrEqual(config.phase2);
      });
    });

    it('should have Phase 2 duration >= Phase 3 duration for all ranks', () => {
      Object.values(RANK_TIMING).forEach(config => {
        expect(config.phase2).toBeGreaterThanOrEqual(config.phase3);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string rank', () => {
      expect(getRankTier('')).toBe('silver');
      expect(getPhaseDuration('', 1)).toBe(240); // Silver default
    });

    it('should handle null/undefined-like strings', () => {
      expect(getRankTier('null')).toBe('silver');
      expect(getRankTier('undefined')).toBe('silver');
    });

    it('should handle ranks with extra whitespace', () => {
      expect(getRankTier('  Bronze I  ')).toBe('bronze');
      expect(getRankTier('Silver   III')).toBe('silver');
    });

    it('should handle partial rank matches correctly', () => {
      // Should match "bronze" in "bronze-level"
      expect(getRankTier('bronze-level')).toBe('bronze');
      // Should match "silver" in "silver-tier"
      expect(getRankTier('silver-tier')).toBe('silver');
    });
  });
});

