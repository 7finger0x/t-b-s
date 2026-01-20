// Server-only module (prevents client-side import)
// Note: In production, install 'server-only' package for better type safety
// import 'server-only';

import { SCORING_CONSTANTS } from './constants';
import type { PVCVectors, PVCScore } from './types';

/**
 * Calculate Economic Score (Vector E)
 * Based on gas burned (logarithmic) and liquidity provided (>7 days).
 * Max: 2500 points
 * 
 * @param gasBurnedUSD - Total gas burned in USD
 * @param liquidityUSD - Total liquidity provided in USD (must be locked >7 days)
 * @returns Economic score (0-2500)
 */
export function calculateEconomicScore(
    gasBurnedUSD: number,
    liquidityUSD: number
): number {
    // Gas Burn Component (Logarithmic Scale)
    // Formula: ECONOMIC_ALPHA * log10(gasBurnedUSD + 1)
    const gasScore = SCORING_CONSTANTS.WEIGHTS.ECONOMIC_ALPHA * 
        Math.log10(Math.max(gasBurnedUSD, 0) + 1);

    // Liquidity Component (Linear)
    // Only counts liquidity locked for >7 days
    // Formula: ECONOMIC_BETA * (liquidityUSD / 1000)
    const liquidityScore = SCORING_CONSTANTS.WEIGHTS.ECONOMIC_BETA * 
        (Math.max(liquidityUSD, 0) / 1000);

    const total = gasScore + liquidityScore;

    // Cap at MAX_ECONOMIC
    return Math.min(Math.round(total), SCORING_CONSTANTS.MAX_ECONOMIC);
}

/**
 * Calculate Social Score (Vector S)
 * Based on Farcaster OpenRank and Zora mints.
 * Max: 2000 points
 * 
 * @param farcasterRank - OpenRank percentile ("TOP_1", "TOP_5", "TOP_20", "UNRANKED")
 * @param zoraCollections - Number of Zora collections minted
 * @returns Social score (0-2000)
 */
export function calculateSocialScore(
    farcasterRank: 'TOP_1' | 'TOP_5' | 'TOP_20' | 'UNRANKED',
    zoraCollections: number
): number {
    // Farcaster OpenRank Component
    const openRankScore = SCORING_CONSTANTS.WEIGHTS.SOCIAL_OPENRANK[farcasterRank] || 0;

    // Zora Mints Component (Curatorial Proof)
    // Formula: zoraCollections * SOCIAL_ZORA_MULTIPLIER
    // Early adopters get bonus points for minting within 24 hours (handled elsewhere)
    const zoraScore = Math.max(zoraCollections, 0) * 
        SCORING_CONSTANTS.WEIGHTS.SOCIAL_ZORA_MULTIPLIER;

    const total = openRankScore + zoraScore;

    // Cap at MAX_SOCIAL
    return Math.min(Math.round(total), SCORING_CONSTANTS.MAX_SOCIAL);
}

/**
 * Calculate Tenure Score (Vector T)
 * Based on active months (>5 txs/month) and consistency streaks.
 * Max: 1865 points
 * 
 * @param activeMonths - Number of months with >5 transactions
 * @param currentStreak - Current consecutive month streak
 * @returns Tenure score (0-1865)
 */
export function calculateTenureScore(
    activeMonths: number,
    currentStreak: number
): number {
    // Active Months Component
    // Formula: activeMonths * TENURE_MONTH_WEIGHT
    const monthsScore = Math.max(activeMonths, 0) * 
        SCORING_CONSTANTS.WEIGHTS.TENURE_MONTH_WEIGHT;

    // Streak Bonus Component
    // Formula: currentStreak * TENURE_STREAK_BONUS
    const streakScore = Math.max(currentStreak, 0) * 
        SCORING_CONSTANTS.WEIGHTS.TENURE_STREAK_BONUS;

    const total = monthsScore + streakScore;

    // Cap at MAX_TENURE
    return Math.min(Math.round(total), SCORING_CONSTANTS.MAX_TENURE);
}

/**
 * Normalize raw score (0-6365) to tier score (0-1000).
 * This scales the total raw score to fit the tier system.
 * 
 * @param rawScore - Raw PVC score (0-6365)
 * @returns Normalized score (0-1000)
 */
export function normalizeScore(rawScore: number): number {
    if (rawScore <= 0) return 0;
    if (rawScore >= SCORING_CONSTANTS.TOTAL_RAW_MAX) return 1000;

    // Linear scaling: (rawScore / TOTAL_RAW_MAX) * 1000
    return Math.round((rawScore / SCORING_CONSTANTS.TOTAL_RAW_MAX) * 1000);
}

/**
 * Determine reputation tier based on normalized score.
 * 
 * @param normalizedScore - Normalized score (0-1000)
 * @returns Tier string
 */
export function determineTier(
    normalizedScore: number
): 'TOURIST' | 'RESIDENT' | 'BUILDER' | 'BASED' | 'LEGEND' {
    // Check tiers from highest to lowest
    // TIERS constants represent the minimum score for each tier
    // LEGEND: 951+ (TIERS.LEGEND = 951)
    if (normalizedScore >= SCORING_CONSTANTS.TIERS.LEGEND) {
        return 'LEGEND';
    }
    // BASED: 851-950 (TIERS.BASED = 851)
    if (normalizedScore >= SCORING_CONSTANTS.TIERS.BASED) {
        return 'BASED';
    }
    // BUILDER: 651-850 (TIERS.BUILDER = 651)
    if (normalizedScore >= SCORING_CONSTANTS.TIERS.BUILDER) {
        return 'BUILDER';
    }
    // RESIDENT: 351-650 (TIERS.RESIDENT = 351)
    if (normalizedScore >= SCORING_CONSTANTS.TIERS.RESIDENT) {
        return 'RESIDENT';
    }
    // TOURIST: 0-350
    return 'TOURIST';
}

/**
 * Calculate complete PVC score from all vectors.
 * 
 * @param address - User's Ethereum address
 * @param vectors - PVC vectors with raw data
 * @param sybilMultiplier - Sybil resistance multiplier (default: 1.0)
 * @returns Complete PVC score object
 */
export function calculatePVCScore(
    address: string,
    vectors: {
        economic: { gasBurnedUSD: number; liquidityUSD: number };
        social: { farcasterRank: 'TOP_1' | 'TOP_5' | 'TOP_20' | 'UNRANKED'; zoraCollections: number };
        tenure: { activeMonths: number; currentStreak: number };
    },
    sybilMultiplier: number = 1.0
): PVCScore {
    // Calculate individual vector scores
    const economicScore = calculateEconomicScore(
        vectors.economic.gasBurnedUSD,
        vectors.economic.liquidityUSD
    );

    const socialScore = calculateSocialScore(
        vectors.social.farcasterRank,
        vectors.social.zoraCollections
    );

    const tenureScore = calculateTenureScore(
        vectors.tenure.activeMonths,
        vectors.tenure.currentStreak
    );

    // Calculate raw total
    const rawTotal = economicScore + socialScore + tenureScore;

    // Apply sybil multiplier
    const adjustedTotal = Math.round(rawTotal * sybilMultiplier);

    // Normalize to 0-1000 scale
    const normalizedTotal = normalizeScore(adjustedTotal);

    // Determine tier
    const tier = determineTier(normalizedTotal);

    return {
        address,
        totalScore: normalizedTotal, // Store normalized score for tier system
        tier,
        vectors: {
            economic: {
                score: economicScore,
                details: {
                    gasBurnedUSD: vectors.economic.gasBurnedUSD,
                    liquidityUSD: vectors.economic.liquidityUSD,
                },
            },
            social: {
                score: socialScore,
                details: {
                    farcasterRank: vectors.social.farcasterRank,
                    zoraCollections: vectors.social.zoraCollections,
                },
            },
            tenure: {
                score: tenureScore,
                details: {
                    activeMonths: vectors.tenure.activeMonths,
                    currentStreak: vectors.tenure.currentStreak,
                },
            },
        },
        sybilMultiplier,
    };
}
