// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MyERC1155Token.sol";

//0xC7697bd7BD41052be82F979910139B9b61AAF61b
contract ForgingContract is MyERC1155Token {
    IERC1155 public tokenContract;

    constructor(address _tokenContract) {
        tokenContract = IERC1155(_tokenContract);
    }

    // Function to burn tokens 0 and 1 to mint token 3
    function burnToMintToken3(uint256 amount) external {
        require(
            balanceOf(msg.sender, 0) >= amount,
            "Insufficient balance of token 0"
        );
        require(
            balanceOf(msg.sender, 1) >= amount,
            "Insufficient balance of token 1"
        );

        // Burn tokens 0 and 1
        _burn(msg.sender, 0, amount);
        _burn(msg.sender, 1, amount);

        // Mint token 3 to the sender
        _mint(msg.sender, 3, amount, "");
    }

    // Function to burn tokens 1 and 2 to mint token 4
    function burnToMintToken4(uint256 amount) external {
        require(
            balanceOf(msg.sender, 1) >= amount,
            "Insufficient balance of token 1"
        );
        require(
            balanceOf(msg.sender, 2) >= amount,
            "Insufficient balance of token 2"
        );

        // Burn tokens 1 and 2
        _burn(msg.sender, 1, amount);
        _burn(msg.sender, 2, amount);

        // Mint token 4 to the sender
        _mint(msg.sender, 4, amount, "");
    }

    // Function to burn tokens 0 and 2 to mint token 5
    function burnToMintToken5(uint256 amount) external {
        require(
            balanceOf(msg.sender, 0) >= amount,
            "Insufficient balance of token 0"
        );
        require(
            balanceOf(msg.sender, 2) >= amount,
            "Insufficient balance of token 2"
        );

        // Burn tokens 0 and 2
        _burn(msg.sender, 0, amount);
        _burn(msg.sender, 2, amount);

        // Mint token 5 to the sender
        _mint(msg.sender, 5, amount, "");
    }

    // Function to burn tokens 0, 1, and 2 to mint token 6
    function burnToMintToken6(uint256 amount) external {
        require(
            balanceOf(msg.sender, 0) >= amount,
            "Insufficient balance of token 0"
        );
        require(
            balanceOf(msg.sender, 1) >= amount,
            "Insufficient balance of token 1"
        );
        require(
            balanceOf(msg.sender, 2) >= amount,
            "Insufficient balance of token 2"
        );

        // Burn tokens 0, 1, and 2
        _burn(msg.sender, 0, amount);
        _burn(msg.sender, 1, amount);
        _burn(msg.sender, 2, amount);

        // Mint token 6 to the sender
        _mint(msg.sender, 6, amount, "");
    }

    // Function to trade tokens [0-2] for another token
    function tradeTokens(
        uint256 fromTokenId,
        uint256 toTokenId,
        uint256 amount
    ) external {
        require(
            fromTokenId >= 0 && fromTokenId <= 2,
            "Invalid 'from' token ID"
        );
        require(toTokenId >= 0 && toTokenId <= 2, "Invalid 'to' token ID");
        require(amount > 0, "Amount must be greater than 0");

        // burn tokens from the sender
        burn(msg.sender, fromTokenId, amount);

        // Mint the 'to' token to the sender
        _mint(msg.sender, toTokenId, amount, "");
    }
}
