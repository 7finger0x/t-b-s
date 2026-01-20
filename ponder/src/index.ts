import { ponder } from "@/generated";

/**
 * Ponder Indexer for ReputationRegistry
 * Syncs ReputationUpdated events from blockchain to database
 */

// Map tier enum (uint8) to string
const TIER_MAP: Record<number, string> = {
    0: 'TOURIST',
    1: 'RESIDENT',
    2: 'BUILDER',
    3: 'BASED',
    4: 'LEGEND',
};

ponder.on("ReputationRegistry:ReputationUpdated", async ({ event, context }) => {
    const { User, ReputationLog } = context.db;
    
    const userAddress = event.args.user.toLowerCase(); // Normalize address
    const score = Number(event.args.score);
    const tierInt = Number(event.args.tier);
    const tier = TIER_MAP[tierInt] || 'TOURIST';
    const timestamp = new Date(Number(event.block.timestamp) * 1000);

    // Upsert user with updated reputation
    await User.upsert({
        id: userAddress,
        create: {
            address: userAddress,
            totalScore: score,
            tier: tier,
            scoreEconomic: 0, // These would be calculated separately
            scoreSocial: 0,
            scoreTenure: 0,
            sybilMultiplier: 1.0,
            lastUpdated: timestamp,
        },
        update: {
            totalScore: score,
            tier: tier,
            lastUpdated: timestamp,
        },
    });

    // Log the reputation update
    await ReputationLog.create({
        id: `${event.transaction.hash}-${event.logIndex}`,
        data: {
            userId: userAddress,
            vector: 'ONCHAIN_UPDATE', // Special vector for on-chain updates
            change: score, // This would need previous score to calculate delta
            reason: `On-chain reputation update to ${tier}`,
            timestamp: timestamp,
        },
    });
});
