// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract CustomToken is ERC20,Ownable {
    mapping(address => bool) public isSanctioned;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
    }

    // Function to add an address to the sanction list
    function addSanctionedAddress(
        address target
    ) external onlyOwner {
        isSanctioned[target] = true;
    }

    // Function to remove an address from the sanction list
    function removeSanctionedAddress(
        address target
    ) external onlyOwner {
        isSanctioned[target] = false;
    }

    // // ERC20 transfer function overridden to check for sanctions
    // function transfer(
    //     address to,
    //     uint256 amount
    // ) public override returns (bool) {
    //     require(
    //         !isSanctioned[msg.sender] && !isSanctioned[to],
    //         "Sanctioned addresses cannot send or receive tokens"
    //     );
    //     return super.transfer(to, amount);
    // }

    // // ERC20 transferFrom function overridden to check for sanctions
    // function transferFrom(
    //     address from,
    //     address to,
    //     uint256 amount
    // ) public override returns (bool) {
    //     require(
    //         !isSanctioned[from] && !isSanctioned[to],
    //         "Sanctioned addresses cannot send or receive tokens"
    //     );
    //     return super.transferFrom(from, to, amount);
    // }

    function _beforeTokenTransfer(
        address _from,
        address _to,
        uint256
    ) internal view override {
        if (isSanctioned[_from] || isSanctioned[_to])
            revert("Sanctioned addresses cannot send or receive tokens");
    }
}
