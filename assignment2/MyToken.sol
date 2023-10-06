// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
//0xE6160A5dF0A8D03810a6B67087F897B0e2e9d8C6
contract MyToken is ERC20, ERC20Burnable {
    constructor() ERC20("MyToken", "MTN") {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function approveContract(
        address owner,
        address spender,
        uint256 amount
    ) public {
        _approve(owner, spender, amount);
    }
}
