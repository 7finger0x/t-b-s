import 'server-only';

export const SCORING_CONSTANTS = {
    MAX_ECONOMIC: 2500,
    MAX_SOCIAL: 2000,
    MAX_TENURE: 1865,
    TOTAL_RAW_MAX: 6365,

    WEIGHTS: {
        ECONOMIC_ALPHA: 800, // Coefficient for Gas Log
        ECONOMIC_BETA: 50,   // Coefficient for Liquidity
        SOCIAL_OPENRANK: {
            TOP_1: 1200,
            TOP_5: 800,
            TOP_20: 400,
            UNRANKED: 0,
        },
        SOCIAL_ZORA_MULTIPLIER: 15,
        TENURE_MONTH_WEIGHT: 100,
        TENURE_STREAK_BONUS: 50,
    },

    TIERS: {
        TOURIST: 350,
        RESIDENT: 650,
        BUILDER: 850,
        BASED: 950,
        LEGEND: 1000,
    }
};
