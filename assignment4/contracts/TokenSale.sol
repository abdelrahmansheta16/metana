// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenSale is ERC20, Ownable {
    uint256 public totalSupplyLimit;

    event TokensPurchased(address indexed buyer, uint256 amount);
    event TokensSoldBack(
        address indexed seller,
        uint256 tokensSold,
        uint256 etherRefund
    );

    constructor(
        string memory name,
        string memory symbol,
        uint256 _totalSupplyLimit
    ) ERC20(name, symbol) {
        if (_totalSupplyLimit > 1 * 10 ** 6 * 10 ** 18) {
            revert("Total Supply limit must not exceed 1 million token");
        }
        totalSupplyLimit = _totalSupplyLimit;
    }

    // Function to allow users to purchase tokens for 1 Ether
    function purchaseTokens() external payable {
        if (totalSupply() > totalSupplyLimit) {
            revert("Token sale has ended");
        }
        if (msg.value != 1 ether) {
            revert("You must send 1 Ether to purchase tokens");
        }
        uint256 tokensToMint = 1000 * 10 ** 18; // 1000 tokens with 18 decimals
        if (totalSupply() + tokensToMint > totalSupplyLimit) {
            revert("Exceeds total supply limit");
        }
        _mint(msg.sender, tokensToMint);

        emit TokensPurchased(msg.sender, tokensToMint);
    }

    // Function to allow users to sell back their tokens and receive a refund
    function sellBack(uint256 amount) external {
        if (amount <= 0) {
            revert("Amount must be greater than 0");
        }
        if (balanceOf(msg.sender) < amount) {
            revert("Insufficient balance");
        }

        uint256 refundAmount = ((amount * 10 ** 18) / 2000);

        if (address(this).balance < refundAmount) {
            revert("Insufficient Ether in the contract");
        }

        _transfer(msg.sender, address(this), amount);
        payable(msg.sender).transfer(refundAmount);

        emit TokensSoldBack(msg.sender, amount, refundAmount);
    }

    // Function to withdraw Ether from the contract to the owner's address
    function withdrawEther() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
