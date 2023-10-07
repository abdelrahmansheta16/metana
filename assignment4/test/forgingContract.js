const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
import { ethers } from "hardhat";


describe("ForgingContract", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    const totalSupplyLimit = ethers.utils.parseEther("10000");


    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Forging = await ethers.getContractFactory("ForgingContract");
    const MyToken = await ethers.getContractFactory("MyERC1155Token");
    const myToken = await MyToken.deploy();
    const contractAddress = myToken.address;
    const forging = await Forging.deploy(contractAddress);

    return { forging, owner, otherAccount, contractAddress };
  }

  describe("Deployment", function () {
    it("Should set the right totalSupplyLimit", async function () {
      const { forging, contractAddress } = await loadFixture(deployOneYearLockFixture);

      expect(await forging.tokenContract()).to.equal(contractAddress);
    });
  });

  describe("burnToMintToken3", function () {
    describe("Validations", function () {
      it("Should revert with the right error if amount of token 0 is greater than balance of sender", async function () {
        const { forging } = await loadFixture(deployOneYearLockFixture);
        await expect(forging.burnToMintToken3(1000)).to.be.revertedWith(
          "Insufficient balance of token 0"
        );
      });

      it("Should revert with the right error if amount of token 1 is greater than balance of sender", async function () {
        const { forging } = await loadFixture(deployOneYearLockFixture);
        await expect(forging.burnToMintToken3(1000)).to.be.revertedWith(
          "Insufficient balance of token 0"
        );
      });
    });

    describe("Burn", function () {
      it("Should burn the required amount of token 0 from the sender", async function () {
        const { forging, owner } = await loadFixture(
          deployOneYearLockFixture
        );
        const before0 = forging.balanceOf(owner.address, 0);
        await forging.burnToMintToken3(10);
        const after0 = forging.balanceOf(owner.address, 0);
        expect(before0).to.equal(after0 + 10);
      });
      it("Should burn the required amount of token 1 from the sender", async function () {
        const { forging, owner } = await loadFixture(
          deployOneYearLockFixture
        );
        const before1 = forging.balanceOf(owner.address, 0);
        await forging.burnToMintToken3(10);
        const after1 = forging.balanceOf(owner.address, 0);
        expect(before1).to.equal(after1 + 10);
      });
    });
    describe("Mint", function () {
      it("Should mint the required amount of token 3 to the sender", async function () {
        const { forging, owner } = await loadFixture(
          deployOneYearLockFixture
        );
        const before3 = forging.balanceOf(owner.address, 0);
        await forging.burnToMintToken3(10);
        const after3 = forging.balanceOf(owner.address, 0);
        expect(before3).to.equal(after3 - 10);
      });
    });
  });
  describe("tradeTokens", function () {
    describe("Validations", function () {
      it("Should revert with the right error if from tokenID is out of range", async function () {
        const { forging } = await loadFixture(deployOneYearLockFixture);
        await expect(forging.tradeTokens(3, 1, 2)).to.be.revertedWith(
          "Invalid 'from' token ID"
        );
      });

      it("Should revert with the right error if to tokenID is out of range", async function () {
        const { forging } = await loadFixture(deployOneYearLockFixture);
        await expect(forging.tradeTokens(0, 3, 2)).to.be.revertedWith(
          "Invalid 'to' token ID"
        );
      });
      it("Should revert with the right error if amount is not greater than 0", async function () {
        const { forging } = await loadFixture(deployOneYearLockFixture);
        await expect(forging.tradeTokens(0, 1, 0)).to.be.revertedWith(
          "Amount must be greater than 0"
        );
      });
    });

    describe("Burn", function () {
      it("Should burn the required amount of the 'from' token from the sender", async function () {
        const { forging, owner } = await loadFixture(
          deployOneYearLockFixture
        );
        const before0 = forging.balanceOf(owner.address, 0);
        await forging.tradeTokens(0, 1, 10);
        const after0 = forging.balanceOf(owner.address, 0);
        expect(before0).to.equal(after0 + 10);
      });
    });
    describe("Mint", function () {
      it("Should mint the required amount of the 'to' token to the sender", async function () {
        const { forging, owner } = await loadFixture(
          deployOneYearLockFixture
        );
        const before1 = forging.balanceOf(owner.address, 0);
        await forging.tradeTokens(0, 1, 10);
        const after1 = forging.balanceOf(owner.address, 0);
        expect(before1).to.equal(after1 - 10);
      });
    });
  });
  describe("mintTokens", function () {
    describe("Validations", function () {
      it("Should revert with the right error if tokenID is out of range", async function () {
        const { forging } = await loadFixture(deployOneYearLockFixture);
        await expect(forging.mintTokens(3, 2)).to.be.revertedWith(
          "Invalid token ID"
        );
      });

      it("Should revert with the right error if amount is not greater than 0", async function () {
        const { forging } = await loadFixture(deployOneYearLockFixture);
        await expect(forging.mintTokens(1, 0)).to.be.revertedWith(
          "Amount must be greater than 0"
        );
      });

      it("Should revert with the right error if minting cool down is not over yet", async function () {
        const { forging } = await loadFixture(deployOneYearLockFixture);
        await forging.mintTokens(1, 3)
        await expect(forging.mintTokens(1, 3)).to.be.revertedWith(
          "Minting cooldown not over"
        );
      });
      it("Should not revert if minting cool down is over", async function () {
        const { forging } = await loadFixture(deployOneYearLockFixture);
        await forging.mintTokens(1, 3)
        await time.increase(600);
        await expect(forging.mintTokens(1, 3)).not.to.be.reverted;
      });
    });

    describe("Events", function () {
      it("Should emit an event on minting", async function () {
        const { forging, owner } = await loadFixture(deployOneYearLockFixture);
        await expect(forging.mintTokens(1, 3)).to.emit(forging, "Minted").withArgs(owner, 1, 3);
      });
    });

    describe("Mint", function () {
      it("Should mint the tokens to the sender", async function () {
        const { forging, owner } = await loadFixture(deployOneYearLockFixture);
        const before0 = forging.balanceOf(owner.address, 0);
        await forging.mintTokens(0, 10);
        const after0 = forging.balanceOf(owner.address, 0);
        expect(before0).to.equal(after0 - 10);
      });
    });

    describe("lastMintTime", function () {
      it("Should update the lastMintTime state variable after minting the tokens", async function () {
        const { forging, owner } = await loadFixture(deployOneYearLockFixture);
        await forging.mintTokens(1, 3)
        const lastMintTime = await forging.lastMintTime(owner)
        const currentTime = await time.latest();
        expect(lastMintTime).to.be.equal(currentTime);
      });
    });
  });
});
