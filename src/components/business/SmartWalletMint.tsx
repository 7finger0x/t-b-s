'use client';

import {
    Transaction,
    TransactionButton,
    TransactionStatus,
    TransactionStatusLabel,
    TransactionStatusAction
} from '@coinbase/onchainkit/transaction';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';

// Ensure you replace this with the actual deployed contract address
const NFT_CONTRACT_ADDRESS = '0xYourNFTContractAddress';

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

    const contracts = [{
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'mint',
        args: [BigInt(3), BigInt(1)], // Mint Tier 3 (BASED)
        value: parseEther('0.01'),
    }];

    return (
        <div className="flex flex-col gap-4 p-4 border rounded-xl border-gray-700 bg-gray-900">
            <h3 className="text-xl font-bold text-white">Mint BASED Badge</h3>
            <p className="text-gray-400">Price: 0.01 ETH</p>

            <Transaction
                chainId={8453}
                contracts={contracts} // Type assertion might be needed depending on strictness
                onSuccess={(response) => console.log('Minted:', response)}
            >
                <TransactionButton text="Mint with Smart Wallet" />
                <TransactionStatus>
                    <TransactionStatusLabel />
                    <TransactionStatusAction />
                </TransactionStatus>
            </Transaction>
        </div>
    );
}
