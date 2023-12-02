// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./ChainlinkRandomness.sol";
import "hardhat/console.sol";

//ChainBattles uploaded at 0x2d1d702AcA729481d0fFD66467EEC93230E74a73
contract ChainBattles is ERC721, ERC721URIStorage, ERC721Enumerable {
    using Strings for uint256;
    using Counters for Counters.Counter;
    VRFv2Consumer consumer;
    Counters.Counter private _tokenIds;

    struct Tracker {
        uint256 levels;
        uint256 hp;
        uint256 strength;
        uint256 speed;
        // Add more fields as needed
    }

    mapping(uint256 => Tracker) public tokenIdToLevels;

    constructor(address _consumer) ERC721("Chain Battles", "CBTLS") {
        consumer = VRFv2Consumer(_consumer);
    }

    function generateCharacter(
        uint256 tokenId
    ) public view returns (string memory) {
        Tracker memory tracker = tokenIdToLevels[tokenId];
        bytes memory svg = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350">',
            "<style>.base { fill: white; font-family: serif; font-size: 14px; }</style>",
            '<rect width="100%" height="100%" fill="black" />',
            '<text x="50%" y="20%" class="base" dominant-baseline="middle" text-anchor="middle">',
            "Warrior",
            "</text>",
            '<text x="50%" y="30%" class="base" dominant-baseline="middle" text-anchor="middle">',
            "Levels: ",
            tracker.levels.toString(),
            "</text>",
            '<text x="50%" y="40%" class="base" dominant-baseline="middle" text-anchor="middle">',
            "Hp: ",
            tracker.hp.toString(),
            "</text>",
            '<text x="50%" y="50%" class="base" dominant-baseline="middle" text-anchor="middle">',
            "Strength: ",
            tracker.strength.toString(),
            "</text>",
            '<text x="50%" y="60%" class="base" dominant-baseline="middle" text-anchor="middle">',
            "Speed: ",
            tracker.speed.toString(),
            "</text>",
            "</svg>"
        );
        return
            string(
                abi.encodePacked(
                    "data:image/svg+xml;base64,",
                    Base64.encode(svg)
                )
            );
    }

    function getTracker(uint256 tokenId) public view returns (Tracker memory) {
        Tracker memory tracker = tokenIdToLevels[tokenId];
        return tracker;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        bytes memory dataURI = abi.encodePacked(
            "{",
            '"name": "Chain Battles #',
            tokenId.toString(),
            '",',
            '"description": "Battles on chain",',
            '"image": "',
            generateCharacter(tokenId),
            '"',
            "}"
        );
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(dataURI)
                )
            );
    }

    function mint() public {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI(newItemId));
    }

    function train(uint256 tokenId) public {
        require(_exists(tokenId), "Please use an existing token");
        require(
            ownerOf(tokenId) == msg.sender,
            "You must own this token to train it"
        );
        uint256 newItemId = _tokenIds.current();
        uint256 requestId = consumer.requestRandomWords();
        (bool fulfilled, uint256[] memory randomWords) = consumer
            .getRequestStatus(requestId);
        tokenIdToLevels[newItemId].hp = randomWords[0] % 10;
        tokenIdToLevels[newItemId].levels = randomWords[1] % 10;
        tokenIdToLevels[newItemId].speed = randomWords[2] % 10;
        tokenIdToLevels[newItemId].strength = randomWords[3] % 10;
        console.log("tracker levels: %d", tokenIdToLevels[newItemId].levels);
        // emit TrackerEvent(tokenIdToLevels[newItemId]);
        _setTokenURI(newItemId, tokenURI(newItemId));
        // lastRandomnessRequestId = requestRandomness(100000, 3, 1);
    }

    // The following functions are overrides required by Solidity.

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721URIStorage, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }
}
