// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenSale is ERC20, Ownable {
    uint256 public totalSupplyLimit;
    uint256 public tokensSold;

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
        require(_totalSupplyLimit <= 1 * 10 ** 6 * 10 ** 18);
        totalSupplyLimit = _totalSupplyLimit;
    }

    // Function to allow users to purchase tokens for 1 Ether
    function purchaseTokens() external payable {
        require(tokensSold < totalSupplyLimit, "Token sale has ended");
        require(
            msg.value == 1 ether,
            "You must send 1 Ether to purchase tokens"
        );

        uint256 tokensToMint = 1000 * 10 ** 18; // 1000 tokens with 18 decimals
        require(
            tokensSold + tokensToMint <= totalSupplyLimit,
            "Exceeds total supply limit"
        );
        _mint(msg.sender, tokensToMint);
        tokensSold += tokensToMint;

        emit TokensPurchased(msg.sender, tokensToMint);
    }

    // Function to allow users to sell back their tokens and receive a refund
    function sellBack(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        uint256 refundAmount = ((amount * 10 ** 18) / 2000);
        require(
            address(this).balance >= refundAmount,
            "Insufficient Ether in the contract"
        );

        transferFrom(msg.sender, address(this), amount);
        payable(msg.sender).transfer(refundAmount);

        emit TokensSoldBack(msg.sender, amount, refundAmount);
    }

    // Function to withdraw Ether from the contract to the owner's address
    function withdrawEther() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
