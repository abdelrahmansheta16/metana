// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CustomToken is ERC20 {
    address public centralAuthority;
    mapping(address => bool) public isSanctioned;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        centralAuthority = msg.sender;
    }

    // Modifier to restrict functions to the centralAuthority
    modifier onlyCentralAuthority() {
        require(
            msg.sender == centralAuthority,
            "Only the central authority can call this function"
        );
        _;
    }

    // Function to add an address to the sanction list
    function addSanctionedAddress(
        address target
    ) external onlyCentralAuthority {
        isSanctioned[target] = true;
    }

    // Function to remove an address from the sanction list
    function removeSanctionedAddress(
        address target
    ) external onlyCentralAuthority {
        isSanctioned[target] = false;
    }

    // ERC20 transfer function overridden to check for sanctions
    function transfer(
        address to,
        uint256 amount
    ) public override returns (bool) {
        require(
            !isSanctioned[msg.sender] && !isSanctioned[to],
            "Sanctioned addresses cannot send or receive tokens"
        );
        return super.transfer(to, amount);
    }

    // ERC20 transferFrom function overridden to check for sanctions
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        require(
            !isSanctioned[from] && !isSanctioned[to],
            "Sanctioned addresses cannot send or receive tokens"
        );
        return super.transferFrom(from, to, amount);
    }
}
