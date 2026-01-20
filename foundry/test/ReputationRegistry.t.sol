// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "forge-std/Test.sol";
import "../src/ReputationRegistry.sol";

contract ReputationRegistryTest is Test {
    ReputationRegistry registry;
    uint256 oraclePrivateKey = 0xA11CE;
    address oracle;
    address user = address(0x123);

    bytes32 constant TYPEHASH = 0x8b9954087e5025d263301a61c51c142e47589d9852277d32c029352e464c015b;

    function setUp() public {
        oracle = vm.addr(oraclePrivateKey);
        registry = new ReputationRegistry(oracle);
    }

    function test_UpdateScore() public {
        uint256 score = 855;
        uint8 tier = 3; // BASED
        uint256 deadline = block.timestamp + 1 hours;
        uint256 nonce = 0;

        // 1. Recreate the specific EIP-712 struct hash
        bytes32 structHash = keccak256(abi.encode(
            TYPEHASH,
            user,
            score,
            tier,
            nonce,
            deadline
        ));

        // 2. Generate EIP-712 Domain Separator hash
        bytes32 digest = registry.hashTypedData(structHash);

        // 3. Sign it with the Oracle key
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(oraclePrivateKey, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        // 4. Prank the user and submit
        vm.prank(user);
        registry.updateMyScore(score, ReputationRegistry.Tier(tier), deadline, signature);

        // 5. Assert State Change
        ReputationRegistry.Reputation memory rep = registry.getReputation(user);
        assertEq(rep.score, 855);
        assertEq(uint(rep.tier), 3);
    }

    function test_RevertIfWrongSigner() public {
        uint256 score = 855;
        uint8 tier = 3;
        uint256 deadline = block.timestamp + 1 hours;
        uint256 nonce = 0;
        uint256 wrongKey = 0xBADA55;

        bytes32 structHash = keccak256(abi.encode(
           TYPEHASH,
           user,
           score,
           tier,
           nonce,
           deadline
        ));
        bytes32 digest = registry.hashTypedData(structHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(wrongKey, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.prank(user);
        vm.expectRevert(ReputationRegistry.InvalidSignature.selector);
        registry.updateMyScore(score, ReputationRegistry.Tier(tier), deadline, signature);
    }
}
