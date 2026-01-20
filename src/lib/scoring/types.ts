export interface PVCVectors {
    economic: {
        score: number; // Max 2500
        details: {
            gasBurnedUSD: number;
            liquidityUSD: number;
        };
    };
    social: {
        score: number; // Max 2000
        details: {
            farcasterRank: string;
            zoraCollections: number;
        };
    };
    tenure: {
        score: number; // Max 1865
        details: {
            activeMonths: number;
            currentStreak: number;
        };
    };
}

export interface PVCScore {
    address: string;
    totalScore: number; // 0-6365 Raw (or 0-1000 Normalized?) -> Spec says 0-6365 for SPVC, but Tiers are 0-1000.
    tier: "TOURIST" | "RESIDENT" | "BUILDER" | "BASED" | "LEGEND";
    vectors: PVCVectors;
    sybilMultiplier: number;
}
