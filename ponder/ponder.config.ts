import { createConfig } from "@ponder/core";
import { http } from "viem";
import { ReputationRegistryAbi } from "./src/abis/ReputationRegistry";

export default createConfig({
    networks: {
        base: { 
            chainId: 8453, 
            transport: http(process.env.PONDER_RPC_URL || "https://mainnet.base.org"),
        },
    },
    contracts: {
        ReputationRegistry: {
            abi: ReputationRegistryAbi,
            network: "base",
            // Update this with your deployed contract address
            address: process.env.REPUTATION_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000",
            // Start from a recent block (adjust based on deployment)
            startBlock: Number(process.env.PONDER_START_BLOCK || "24500000"),
        },
    },
});
