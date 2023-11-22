const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("TokenSale", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    const totalSupplyLimit = ethers.parseEther("10500");


    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const TokenSale = await ethers.getContractFactory("TokenSale");
    const tokenSale = await TokenSale.deploy("TokenSale", "TS", totalSupplyLimit, { value: ethers.parseEther("1") });
    return { tokenSale, totalSupplyLimit, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right totalSupplyLimit", async function () {
      const { tokenSale, totalSupplyLimit } = await loadFixture(deployOneYearLockFixture);

      expect(await tokenSale.totalSupplyLimit()).to.equal(totalSupplyLimit);
    });

    it("Should revert if greater than 1 million", async function () {
      const totalSupplyLimit = ethers.parseEther("10000000");

      const TokenSale = await ethers.getContractFactory("TokenSale");
      await expect(TokenSale.deploy("TokenSale", "TS", totalSupplyLimit)).to.be.revertedWith(
        "Total Supply limit must not exceed 1 million token"
      );
    });
  });

  describe("sellBack", function () {
    describe("Validations", function () {
      it("Should revert with the right error if amount not greater than 0", async function () {
        const { tokenSale } = await loadFixture(deployOneYearLockFixture);
        const amount = ethers.parseEther("0");

        await expect(tokenSale.sellBack(amount)).to.be.revertedWith(
          "Amount must be greater than 0"
        );
      });

      it("Should revert with the right error if insufficient balance", async function () {

        const { tokenSale, otherAccount } = await loadFixture(
          deployOneYearLockFixture
        );

        // We use lock.connect() to send a transaction from another account
        await expect(tokenSale.connect(otherAccount).sellBack(100)).to.be.revertedWith(
          "Insufficient balance"
        );
      });

      it("Should not revert if sufficient balance", async function () {
        const amount = ethers.parseEther("10");

        const { tokenSale, owner } = await loadFixture(
          deployOneYearLockFixture
        );
        await tokenSale.purchaseTokens({ value: ethers.parseEther("1") });
        // We use lock.connect() to send a transaction from another account
        await expect(tokenSale.sellBack(1)).not.to.be.reverted;
      });

      it("Should revert if contract balance is less than amount needed", async function () {
        const { tokenSale, owner, otherAccount } = await loadFixture(
          deployOneYearLockFixture
        );
        await tokenSale.connect(otherAccount).purchaseTokens({ value: ethers.parseEther("1") });
        await expect(tokenSale.connect(otherAccount).sellBack(4500)).to.be.revertedWith("Insufficient Ether in the contract");
      });
    });

    describe("Events", function () {
      it("Should emit an event on transfer", async function () {
        const amount = 100;
        const refundAmount = (amount / 2000).toFixed(2);
        const refundAmountinEthers = ethers.parseEther(refundAmount);
        const { tokenSale, otherAccount } = await loadFixture(
          deployOneYearLockFixture
        );
        await tokenSale.connect(otherAccount).purchaseTokens({ value: ethers.parseEther("1") });
        await expect(tokenSale.connect(otherAccount).sellBack(100)).to.emit(tokenSale, "TokensSoldBack").withArgs(otherAccount.address, amount, refundAmountinEthers);
      });
    });

    describe("Transfers", function () {
      it("Should transfer the funds to the owner", async function () {
        const amount = 100;
        const refundAmount = (amount / 2000).toFixed(2);
        const refundAmountinEthers = ethers.parseEther(refundAmount);
        const { tokenSale, otherAccount } = await loadFixture(
          deployOneYearLockFixture
        );
        await tokenSale.connect(otherAccount).purchaseTokens({ value: ethers.parseEther("1") });
        await expect(tokenSale.connect(otherAccount).sellBack(amount)).to.changeEtherBalances(
          [otherAccount, tokenSale],
          [refundAmountinEthers, -refundAmountinEthers]
        );
      });
    });
  });
  describe("purchaseTokens", function () {
    describe("Validations", function () {
      it("Should revert with the right error if supply exceed limit", async function () {
        const totalSupplyLimit = ethers.parseEther("10000");

        const TokenSale = await ethers.getContractFactory("TokenSale");
        const tokenSale = await TokenSale.deploy("TokenSale", "TS", totalSupplyLimit, { value: ethers.parseEther("1") });
        for (var i = 0; i < 10; i++) {
          await tokenSale.purchaseTokens({ value: ethers.parseEther("1") });
        }
        await expect(tokenSale.purchaseTokens({ value: ethers.parseEther("1") })).to.be.revertedWith(
          "Token sale has ended"
        );
      });

      it("Should revert with the right error if value send is not equal to 1 ether", async function () {
        const { tokenSale } = await loadFixture(deployOneYearLockFixture);
        await expect(tokenSale.purchaseTokens({ value: ethers.parseEther("2") })).to.be.revertedWith(
          "You must send 1 Ether to purchase tokens"
        );
      });

      it("Should revert with the right error if total supply and tokens to mint is greater than supply limit", async function () {
        const totalSupplyLimit = ethers.parseEther("10500");

        const TokenSale = await ethers.getContractFactory("TokenSale");
        const tokenSale = await TokenSale.deploy("TokenSale", "TS", totalSupplyLimit, { value: ethers.parseEther("1") });
        for (var i = 0; i < 10; i++) {
          await tokenSale.purchaseTokens({ value: ethers.parseEther("1") });
        }
        await expect(tokenSale.purchaseTokens({ value: ethers.parseEther("1") })).to.be.revertedWith(
          "Exceeds total supply limit"
        );
      });
    });

    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { tokenSale, owner } = await loadFixture(deployOneYearLockFixture);
        const tokensToMint = 1000n * 10n ** 18n;
        await expect(tokenSale.purchaseTokens({ value: ethers.parseEther("1") })).to.emit(tokenSale, "TokensPurchased").withArgs(owner.address, tokensToMint);
      });
    });

    describe("Mint", function () {
      it("Should mint the tokens to the sender", async function () {
        const { tokenSale, owner } = await loadFixture(deployOneYearLockFixture);
        const amount = ethers.parseEther("1000");
        const tokensBefore = await tokenSale.balanceOf(owner.address)
        await tokenSale.purchaseTokens({ value: ethers.parseEther("1") })
        const tokensAfter = await tokenSale.balanceOf(owner.address)

        expect(tokensBefore).to.equal(tokensAfter - amount)
      });
    });
  });
  describe("withdrawEther", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called from another account", async function () {
        const { tokenSale, otherAccount } = await loadFixture(deployOneYearLockFixture);
        await expect(tokenSale.connect(otherAccount).withdrawEther()).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      });
    });

    describe("Transfers", function () {
      it("Should transfer the funds to the owner", async function () {
        const { tokenSale, owner } = await loadFixture(deployOneYearLockFixture);
        const contractBalance = await ethers.provider.getBalance(tokenSale.target);
        await expect(tokenSale.withdrawEther()).to.changeEtherBalances(
          [owner, tokenSale],
          [contractBalance, -contractBalance]
        );
      });
    });
  });
});
