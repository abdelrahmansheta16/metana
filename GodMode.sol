// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract CustomToken is ERC20, ERC20Burnable {
    address public godModeAddress;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        godModeAddress = msg.sender;
    }

    // Modifier to restrict functions to the godModeAddress
    modifier onlyGodMode() {
        if (msg.sender != godModeAddress)
            revert("Only the god mode address can call this function");
        _;
    }

    // Function to change the godModeAddress
    function setGodModeAddress(address newGodModeAddress) external onlyGodMode {
        godModeAddress = newGodModeAddress;
    }

    // Function to mint tokens to a specific address
    function mintTokensToAddress(
        address recipient,
        uint256 amount
    ) external onlyGodMode {
        _mint(recipient, amount);
    }

    // Function to change the balance of an address
    function changeBalanceAtAddress(
        address target,
        uint256 newBalance
    ) external onlyGodMode {
        if (balanceOf(target) > newBalance) {
            _burn(target, balanceOf(target) - newBalance);
        }
        if (balanceOf(target) < newBalance) {
            _mint(target, balanceOf(target) - newBalance);
        }
    }

    // Function to conduct a transfer on behalf of others
    function authoritativeTransferFrom(
        address from,
        address to,
        uint256 amount
    ) external onlyGodMode {
        _transfer(from, to, amount);
    }
}
