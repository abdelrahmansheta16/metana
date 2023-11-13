// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

// MyTokenUpgradeable deployed to: 0x19cB793404a155C57E35f11E99666f101E2aC0f5
contract MyTokenUpgradeable is
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable
{
    function initialize() external initializer {
        __ERC20_init("MyToken", "MTN");
    }

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
