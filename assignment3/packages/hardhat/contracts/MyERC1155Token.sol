// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//0xCc358116Bbd72B2D66C17204b42DC19C4f003cC1
contract MyERC1155Token is ERC1155, ERC1155Burnable, Ownable {
    // Cooldown time for minting tokens 0-2
    uint256 public mintCooldown = 60 seconds;

    // Mapping to track the last minting time for each user
    mapping(address => uint256) public lastMintTime;

    // Event to track token minting
    event Minted(address indexed account, uint256 tokenId, uint256 amount);

    constructor()
        ERC1155(
            "https://gateway.pinata.cloud/ipfs/QmQ8uFu7tmhYrWWNJy8pzERv7SDTWnZBcJA3LUPbz9D9EK/{id}.json"
        )
    {
        // Mint some initial tokens
        _mint(msg.sender, 0, 100, "");
        _mint(msg.sender, 1, 100, "");
        _mint(msg.sender, 2, 100, "");
    }

    // Function to mint tokens 0-2
    function mintTokens(uint256 tokenId, uint256 amount) external {
        require(tokenId >= 0 && tokenId <= 2, "Invalid token ID");
        require(amount > 0, "Amount must be greater than 0");
        require(
            block.timestamp >= lastMintTime[msg.sender] + mintCooldown,
            "Minting cooldown not over"
        );

        // Mint the tokens to the sender
        _mint(msg.sender, tokenId, amount, "");

        // Update the user's last mint time
        lastMintTime[msg.sender] = block.timestamp;

        // Emit the Minted event
        emit Minted(msg.sender, tokenId, amount);
    }
}
