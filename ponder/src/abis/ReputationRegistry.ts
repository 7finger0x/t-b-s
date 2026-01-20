/**
 * ABI for ReputationRegistry contract
 * Generated from foundry/src/ReputationRegistry.sol
 */
export const ReputationRegistryAbi = [
    {
        type: 'event',
        name: 'ReputationUpdated',
        inputs: [
            { name: 'user', type: 'address', indexed: true },
            { name: 'score', type: 'uint256', indexed: false },
            { name: 'tier', type: 'uint8', indexed: false },
        ],
    },
    {
        type: 'function',
        name: 'reputations',
        inputs: [{ name: '', type: 'address' }],
        outputs: [
            { name: 'score', type: 'uint16' },
            { name: 'tier', type: 'uint8' },
            { name: 'lastUpdate', type: 'uint40' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'nonces',
        inputs: [{ name: '', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'oracle',
        inputs: [],
        outputs: [{ name: '', type: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'updateMyScore',
        inputs: [
            { name: 'score', type: 'uint256' },
            { name: 'tier', type: 'uint8' },
            { name: 'deadline', type: 'uint256' },
            { name: 'signature', type: 'bytes' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'getReputation',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [
            { name: 'score', type: 'uint16' },
            { name: 'tier', type: 'uint8' },
            { name: 'lastUpdate', type: 'uint40' },
        ],
        stateMutability: 'view',
    },
] as const;
