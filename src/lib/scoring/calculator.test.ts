import { describe, it, expect } from 'vitest';
import {
    calculateEconomicScore,
    calculateSocialScore,
    calculateTenureScore,
    normalizeScore,
    determineTier,
    calculatePVCScore,
} from './calculator';
import { SCORING_CONSTANTS } from './constants';

describe('calculateEconomicScore', () => {
    it('should calculate score from gas burned', () => {
        const score = calculateEconomicScore(1000, 0);
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(SCORING_CONSTANTS.MAX_ECONOMIC);
    });

    it('should calculate score from liquidity', () => {
        const score = calculateEconomicScore(0, 10000);
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(SCORING_CONSTANTS.MAX_ECONOMIC);
    });

    it('should cap at MAX_ECONOMIC', () => {
        const score = calculateEconomicScore(1000000, 1000000);
        expect(score).toBeLessThanOrEqual(SCORING_CONSTANTS.MAX_ECONOMIC);
    });

    it('should handle zero values', () => {
        const score = calculateEconomicScore(0, 0);
        expect(score).toBe(0);
    });

    it('should handle negative values gracefully', () => {
        const score = calculateEconomicScore(-100, -100);
        expect(score).toBe(0);
    });
});

describe('calculateSocialScore', () => {
    it('should give TOP_1 rank maximum points', () => {
        const score = calculateSocialScore('TOP_1', 0);
        expect(score).toBe(SCORING_CONSTANTS.WEIGHTS.SOCIAL_OPENRANK.TOP_1);
    });

    it('should calculate score from Zora collections', () => {
        const score = calculateSocialScore('UNRANKED', 10);
        expect(score).toBe(10 * SCORING_CONSTANTS.WEIGHTS.SOCIAL_ZORA_MULTIPLIER);
    });

    it('should combine OpenRank and Zora scores', () => {
        const score = calculateSocialScore('TOP_5', 5);
        const expected = SCORING_CONSTANTS.WEIGHTS.SOCIAL_OPENRANK.TOP_5 + 
            (5 * SCORING_CONSTANTS.WEIGHTS.SOCIAL_ZORA_MULTIPLIER);
        expect(score).toBe(expected);
    });

    it('should cap at MAX_SOCIAL', () => {
        const score = calculateSocialScore('TOP_1', 1000);
        expect(score).toBeLessThanOrEqual(SCORING_CONSTANTS.MAX_SOCIAL);
    });
});

describe('calculateTenureScore', () => {
    it('should calculate score from active months', () => {
        const score = calculateTenureScore(12, 0);
        expect(score).toBe(12 * SCORING_CONSTANTS.WEIGHTS.TENURE_MONTH_WEIGHT);
    });

    it('should add streak bonus', () => {
        const score = calculateTenureScore(0, 6);
        expect(score).toBe(6 * SCORING_CONSTANTS.WEIGHTS.TENURE_STREAK_BONUS);
    });

    it('should combine months and streak', () => {
        const score = calculateTenureScore(12, 6);
        const expected = (12 * SCORING_CONSTANTS.WEIGHTS.TENURE_MONTH_WEIGHT) +
            (6 * SCORING_CONSTANTS.WEIGHTS.TENURE_STREAK_BONUS);
        expect(score).toBe(expected);
    });

    it('should cap at MAX_TENURE', () => {
        const score = calculateTenureScore(100, 100);
        expect(score).toBeLessThanOrEqual(SCORING_CONSTANTS.MAX_TENURE);
    });
});

describe('normalizeScore', () => {
    it('should normalize zero score', () => {
        expect(normalizeScore(0)).toBe(0);
    });

    it('should normalize max score to 1000', () => {
        expect(normalizeScore(SCORING_CONSTANTS.TOTAL_RAW_MAX)).toBe(1000);
    });

    it('should normalize mid-range score', () => {
        const midScore = SCORING_CONSTANTS.TOTAL_RAW_MAX / 2;
        const normalized = normalizeScore(midScore);
        expect(normalized).toBe(500);
    });

    it('should handle scores above max', () => {
        expect(normalizeScore(SCORING_CONSTANTS.TOTAL_RAW_MAX + 1000)).toBe(1000);
    });
});

describe('determineTier', () => {
    it('should return TOURIST for low scores', () => {
        expect(determineTier(0)).toBe('TOURIST');
        expect(determineTier(350)).toBe('TOURIST');
    });

    it('should return RESIDENT for mid-low scores', () => {
        expect(determineTier(351)).toBe('RESIDENT');
        expect(determineTier(650)).toBe('RESIDENT');
    });

    it('should return BUILDER for mid scores', () => {
        expect(determineTier(651)).toBe('BUILDER');
        expect(determineTier(850)).toBe('BUILDER');
    });

    it('should return BASED for high scores', () => {
        expect(determineTier(851)).toBe('BASED');
        expect(determineTier(950)).toBe('BASED');
    });

    it('should return LEGEND for highest scores', () => {
        // LEGEND tier starts at 951 (TIERS.LEGEND)
        expect(determineTier(951)).toBe('LEGEND');
        expect(determineTier(1000)).toBe('LEGEND');
    });
});

describe('calculatePVCScore', () => {
    it('should calculate complete PVC score', () => {
        const result = calculatePVCScore(
            '0x742d35cc6634c0532925a3b844bc9e7595f0beb5',
            {
                economic: {
                    gasBurnedUSD: 1000,
                    liquidityUSD: 5000,
                },
                social: {
                    farcasterRank: 'TOP_5',
                    zoraCollections: 10,
                },
                tenure: {
                    activeMonths: 12,
                    currentStreak: 6,
                },
            }
        );

        expect(result.address).toBe('0x742d35cc6634c0532925a3b844bc9e7595f0beb5');
        expect(result.totalScore).toBeGreaterThanOrEqual(0);
        expect(result.totalScore).toBeLessThanOrEqual(1000);
        expect(['TOURIST', 'RESIDENT', 'BUILDER', 'BASED', 'LEGEND']).toContain(result.tier);
        expect(result.vectors.economic.score).toBeGreaterThanOrEqual(0);
        expect(result.vectors.social.score).toBeGreaterThanOrEqual(0);
        expect(result.vectors.tenure.score).toBeGreaterThanOrEqual(0);
    });

    it('should apply sybil multiplier', () => {
        const result1 = calculatePVCScore(
            '0x742d35cc6634c0532925a3b844bc9e7595f0beb5',
            {
                economic: { gasBurnedUSD: 1000, liquidityUSD: 0 },
                social: { farcasterRank: 'UNRANKED', zoraCollections: 0 },
                tenure: { activeMonths: 0, currentStreak: 0 },
            },
            1.0
        );

        const result2 = calculatePVCScore(
            '0x742d35cc6634c0532925a3b844bc9e7595f0beb5',
            {
                economic: { gasBurnedUSD: 1000, liquidityUSD: 0 },
                social: { farcasterRank: 'UNRANKED', zoraCollections: 0 },
                tenure: { activeMonths: 0, currentStreak: 0 },
            },
            0.5
        );

        // Score with 0.5 multiplier should be lower
        expect(result2.totalScore).toBeLessThanOrEqual(result1.totalScore);
    });
});
