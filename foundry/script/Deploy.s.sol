// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Script, console2} from "forge-std/Script.sol";
import {ReputationRegistry} from "../src/ReputationRegistry.sol";
import {TierNFT} from "../src/TierNFT.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        // Load Env Variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address oracleAddress = vm.envAddress("ORACLE_ADDRESS"); // The backend signer address

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Registry
        ReputationRegistry registry = new ReputationRegistry(oracleAddress);
        console2.log("ReputationRegistry deployed at:", address(registry));

        // 2. Deploy TierNFT
        TierNFT nft = new TierNFT(address(registry));
        console2.log("TierNFT deployed at:", address(nft));

        vm.stopBroadcast();
    }
}
