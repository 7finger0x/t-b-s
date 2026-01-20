import { createConfig } from "@ponder/core";
import { http } from "viem";

export default createConfig({
    networks: {
        base: { chainId: 8453, transport: http(process.env.PONDER_RPC_URL) },
    },
    contracts: {
        ReputationRegistry: {
            abi: [], // Placeholder: ABI generation requires compilation
            network: "base",
            address: "0xYourContractAddress",
            startBlock: 24500000,
        },
    },
});
