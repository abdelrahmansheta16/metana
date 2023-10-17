const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("BitWise", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployOneYearLockFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const Lock = await ethers.getContractFactory("BitWise");
        const lock = await Lock.deploy();

        return { lock, owner, otherAccount };
    }

    describe("Test", function () {
        it("Should return the right value", async function () {
            const { lock } = await loadFixture(deployOneYearLockFixture);

            expect(await lock.countBitSetAsm(7)).to.equal(3);
        });
    });
});
