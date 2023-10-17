// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract String {
    function charAt(
        string memory input,
        uint index
    ) public pure returns (bytes2) {
        assembly {
            // Get the length of the string
            let length := mload(input)

            // If index is out of bounds, return 0x0000
            if gt(index, sub(length, 1)) {
                mstore(0x00, 0x0000)
                return(0x00, 0x20)
            }

            // Calculate the memory address of the character at the given index
            let charAddress := add(add(input, 0x20), index)

            // Load the character and convert it to a bytes2 value
            let char := byte(0, mload(charAddress))
            mstore8(0x00, char)

            return(0x00, 32)
        }
    }
}
