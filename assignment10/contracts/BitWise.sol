// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

contract BitWise {
    // count the number of bit set in data.  i.e. data = 7, result = 3
    function countBitSet(uint8 data) public pure returns (uint8 result) {
        for( uint i = 0; i < 8; i += 1) {
            if( ((data >> i) & 1) == 1) {
                result += 1;
            }
        }
    }

     function countBitSetAsm(uint8 data) public pure returns (uint8 result) {
        assembly {
            // Initialize result to 0
            result := 0

            // Loop through each bit of data (8 bits)
            for { let i := 0 } lt(i, 8) { i := add(i, 1) } {
                // Shift data right by i and bitwise AND with 1
                let bit := and(shr(i, data), 1)
                
                // If the bit is 1, increment the result
                if iszero(iszero(bit)) {
                    result := add(result, 1)
                }
            }
        }
    }
}