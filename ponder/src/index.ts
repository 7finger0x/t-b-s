import { ponder } from "@/generated";

// Note: This code relies on generated types from Ponder which are not present yet.
// This is a reference implementation.

// ponder.on("ReputationRegistry:ReputationUpdated", async ({ event, context }) => {
//   const { User } = context.db;
//   await User.upsert({
//     id: event.args.user,
//     create: {
//       score: Number(event.args.score),
//       tier: event.args.tier,
//       lastUpdate: event.block.timestamp,
//     },
//     update: {
//       score: Number(event.args.score),
//       tier: event.args.tier,
//       lastUpdate: event.block.timestamp,
//     },
//   });
// });
