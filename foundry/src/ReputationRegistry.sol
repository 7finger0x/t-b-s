// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Ownable} from "solady/src/auth/Ownable.sol";
import {EIP712} from "solady/src/utils/EIP712.sol";
import {SignatureCheckerLib} from "solady/src/utils/SignatureCheckerLib.sol";

contract ReputationRegistry is Ownable, EIP712 {
    error InvalidSignature();
    error SignatureExpired();
    error ArrayLengthMismatch();

    enum Tier { TOURIST, RESIDENT, BUILDER, BASED, LEGEND }

    struct Reputation {
        uint16 score;
        Tier tier;
        uint40 lastUpdate;
    }

    address public oracle;
    mapping(address => Reputation) public reputations;
    mapping(address => uint256) public nonces;

    // keccak256("UpdateScore(address user,uint256 score,uint8 tier,uint256 nonce,uint256 deadline)");
    bytes32 private constant UPDATE_SCORE_TYPEHASH = 
        0x8b9954087e5025d263301a61c51c142e47589d9852277d32c029352e464c015b;

    event ReputationUpdated(address indexed user, uint256 score, Tier tier);

    constructor(address _oracle) {
        _initializeOwner(msg.sender);
        oracle = _oracle;
    }

    function _domainNameAndVersion() internal pure override returns (string memory name, string memory version) {
        name = "The Base Standard";
        version = "1";
    }

    function updateMyScore(uint256 score, Tier tier, uint256 deadline, bytes calldata signature) external {
        if (block.timestamp > deadline) revert SignatureExpired();

        bytes32 structHash = keccak256(abi.encode(
            UPDATE_SCORE_TYPEHASH,
            msg.sender,
            score,
            uint8(tier),
            nonces[msg.sender]++, 
            deadline
        ));

        address signer = SignatureCheckerLib.recoverSigner(_hashTypedData(structHash), signature);
        if (signer != oracle) revert InvalidSignature();

        reputations[msg.sender] = Reputation({
            score: uint16(score),
            tier: tier,
            lastUpdate: uint40(block.timestamp)
        });

        emit ReputationUpdated(msg.sender, score, tier);
    }

    function getReputation(address user) external view returns (Reputation memory) {
        return reputations[user];
    }
}
