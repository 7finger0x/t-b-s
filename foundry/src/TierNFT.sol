// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {ERC1155} from "solady/src/tokens/ERC1155.sol";
import {Ownable} from "solady/src/auth/Ownable.sol";
import {LibString} from "solady/src/utils/LibString.sol";

interface IReputationRegistry {
    struct Reputation { uint16 score; uint8 tier; uint40 lastUpdate; }
    function getReputation(address user) external view returns (Reputation memory);
}

contract TierNFT is ERC1155, Ownable {
    IReputationRegistry public immutable registry;
    mapping(uint256 => uint256) public tierPrices;

    error IneligibleForTier();
    error IncorrectPayment();

    constructor(address _registry) {
        _initializeOwner(msg.sender);
        registry = IReputationRegistry(_registry);
        tierPrices[3] = 0.01 ether; // "Based" Tier Price
    }

    function mint(uint256 id, uint256 amount) external payable {
        if (msg.value != tierPrices[id] * amount) revert IncorrectPayment();
        
        IReputationRegistry.Reputation memory rep = registry.getReputation(msg.sender);
        if (rep.tier < id) revert IneligibleForTier();

        _mint(msg.sender, id, amount, "");
    }

    function uri(uint256 id) public view override returns (string memory) {
        return string.concat("https://api.base-standard.xyz/metadata/", LibString.toString(id), ".json");
    }

    function withdraw() external onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        if (!success) revert("Transfer failed");
    }
}

