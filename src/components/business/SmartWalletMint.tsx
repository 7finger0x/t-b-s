'use client';

import {
    Transaction,
    TransactionButton,
    TransactionStatus,
    TransactionStatusLabel,
    TransactionStatusAction,
    TransactionSponsor,
} from '@coinbase/onchainkit/transaction';
import { useAccount } from 'wagmi';
import { parseEther, type Address } from 'viem';
import { useState, useCallback } from 'react';

// --- Configuration (Move to ENV in production) ---
const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as Address;
const NFT_ADDRESS = process.env.NEXT_PUBLIC_NFT_ADDRESS as Address;

// --- ABIs ---
const REGISTRY_ABI = [
    {
        type: 'function',
        name: 'updateMyScore',
        inputs: [
            { name: 'score', type: 'uint256' },
            { name: 'tier', type: 'uint8' },
            { name: 'deadline', type: 'uint256' },
            { name: 'signature', type: 'bytes' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    }
] as const;

const NFT_ABI = [
    {
        type: 'function',
        name: 'mint',
        inputs: [
            { name: 'id', type: 'uint256' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: [],
        stateMutability: 'payable'
    }
] as const;

export default function SmartWalletMint() {
    const { address } = useAccount();
    const [calls, setCalls] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handlePrepareTransaction = useCallback(async () => {
        if (!address) return;
        setIsLoading(true);

        try {
            // 1. Get Signature from API
            const response = await fetch('/api/sign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            // 2. Construct Calls (Batching Update + Mint)
            // Note: We use the signature to update the registry FIRST
            const updateCall = {
                address: REGISTRY_ADDRESS,
                abi: REGISTRY_ABI,
                functionName: 'updateMyScore',
                args: [
                    BigInt(data.score),
                    Number(data.tier),
                    BigInt(data.deadline),
                    data.signature as `0x${string}`
                ]
            };

            // 3. Construct Mint Call
            // Logic: If they are updating, they likely want to mint the badge for their new tier.
            const mintCall = {
                address: NFT_ADDRESS,
                abi: NFT_ABI,
                functionName: 'mint',
                args: [BigInt(data.tier), BigInt(1)], // Mint their Badge Tier
                value: parseEther('0.01'),
            };

            // Set the Calls to be executed by the Smart Wallet
            setCalls([updateCall, mintCall]);

        } catch (error) {
            console.error("Prep Error:", error);
            alert("Failed to prepare transaction. Check console.");
        } finally {
            setIsLoading(false);
        }
    }, [address]);

    // If user hasn't prepared calls yet, show a button to fetch data
    if (calls.length === 0) {
        return (
            <button
                onClick={handlePrepareTransaction}
                disabled={!address || isLoading}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
            >
                {isLoading ? "Verifying Score..." : "Sync Score & Mint"}
            </button>
        );
    }

    // Once calls are prepared, show the OnchainKit Transaction Button
    return (
        <div className="flex flex-col gap-4 p-4 border rounded-xl border-gray-700 bg-gray-900">
            <h3 className="text-xl font-bold text-white">Confirm Transaction</h3>
            <p className="text-gray-400 text-sm">
                1. Verify Reputation On-Chain<br />
                2. Mint Tier Badge (0.01 ETH)
            </p>

            <Transaction
                chainId={8453}
                calls={calls} // Pass the batched calls here
                onSuccess={(response) => console.log('Success:', response)}
            >
                <TransactionButton text="Execute Batch" />
                <TransactionStatus>
                    <TransactionStatusLabel />
                    <TransactionStatusAction />
                </TransactionStatus>
            </Transaction>
        </div>
    );
}
