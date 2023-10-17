const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const { ethers } = require("hardhat");

describe("String contract", function () {
    let stringContract;

    before(async () => {
        const String = await ethers.getContractFactory("String");
        stringContract = await String.deploy();
    });

    it("should return the character at a valid index", async function () {
        const char = await stringContract.charAt("abcdef", 2);
        console.log("1", char.toString())
        expect(char.toString()).to.equal("0x6300");
    });

    it("should return 0x0000 for an empty string", async function () {
        const char = await stringContract.charAt("", 0);
        console.log("2: ", char.toString())
        expect(char.toString()).to.equal("0x0000");
    });

    it("should return 0x0000 for an out-of-bounds index", async function () {
        const char = await stringContract.charAt("george", 10);
        console.log(char)
        expect(char).to.equal("0x0000");
    });
});

