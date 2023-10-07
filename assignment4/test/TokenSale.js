const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
import { ethers } from "hardhat";


describe("TokenSale", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    const totalSupplyLimit = ethers.utils.parseEther("10000");


    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const TokenSale = await ethers.getContractFactory("TokenSale");
    const tokenSale = await TokenSale.deploy("TokenSale", "TS", totalSupplyLimit);

    return { tokenSale, totalSupplyLimit, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right totalSupplyLimit", async function () {
      const { tokenSale, totalSupplyLimit } = await loadFixture(deployOneYearLockFixture);

      expect(await tokenSale.totalSupplyLimit()).to.equal(totalSupplyLimit);
    });

    it("Should revert if greater than 1 million", async function () {
      const totalSupplyLimit = ethers.utils.parseEther("10000000");

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
        const amount = ethers.utils.parseEther("100");

        await expect(tokenSale.sellBack(amount)).to.be.revertedWith(
          "Amount must be greater than 0"
        );
      });

      it("Should revert with the right error if insufficient balance", async function () {
        const amount = ethers.utils.parseEther("100");

        const { tokenSale, otherAccount } = await loadFixture(
          deployOneYearLockFixture
        );

        // We use lock.connect() to send a transaction from another account
        await expect(tokenSale.connect(otherAccount).sellBack(amount)).to.be.revertedWith(
          "Insufficient balance"
        );
      });

      it("Should not revert if sufficient balance", async function () {
        const amount = ethers.utils.parseEther("100");

        const { tokenSale, otherAccount } = await loadFixture(
          deployOneYearLockFixture
        );

        await tokenSale.connect(otherAccount).purchaseTokens();
        // We use lock.connect() to send a transaction from another account
        await expect(tokenSale.connect(otherAccount).sellBack(amount)).not.to.be.reverted;
      });

      it("Should revert if contract balance is less than amount needed", async function () {
        const amount = ethers.utils.parseEther("100");
        const { tokenSale, otherAccount } = await loadFixture(
          deployOneYearLockFixture
        );
        // Get the contract's address
        const contractAddress = tokenSale.address;
        await ethers.provider.sendTransaction({
          to: contractAddress,
          value: ethers.utils.parseEther("10"), // Increase the balance by 1000 ETH
        });
        // Get the balance of the contract
        const contractBalance = await ethers.provider.getBalance(contractAddress);
        console.log("contract balance: ", contractBalance);
        await tokenSale.connect(otherAccount).purchaseTokens();
        await expect(tokenSale.connect(otherAccount).sellBack(amount)).to.be.revertedWith(
          "Insufficient Ether in the contract"
        );
      });
    });

    describe("Events", function () {
      it("Should emit an event on transfer", async function () {
        const amount = ethers.utils.parseEther("100");
        const refundAmount = ((amount * 10 ** 18) / 2000);
        const { tokenSale, otherAccount } = await loadFixture(
          deployOneYearLockFixture
        );
        // Get the contract's address
        const contractAddress = tokenSale.address;
        await ethers.provider.sendTransaction({
          to: contractAddress,
          value: ethers.utils.parseEther("1000"), // Increase the balance by 1000 ETH
        });
        // Get the balance of the contract
        const contractBalance = await ethers.provider.getBalance(contractAddress);
        console.log("contract balance: ", contractBalance);
        await tokenSale.connect(otherAccount).purchaseTokens();
        await tokenSale.connect(otherAccount).sellBack(amount).to.emit(tokenSale, "TokensSoldBack").withArgs(otherAccount, amount, refundAmount);
      });
    });

    describe("Transfers", function () {
      it("Should transfer the funds to the owner", async function () {
        const amount = ethers.utils.parseEther("100");
        const refundAmount = ((amount * 10 ** 18) / 2000);
        const { tokenSale, otherAccount } = await loadFixture(
          deployOneYearLockFixture
        );
        // Get the contract's address
        const contractAddress = tokenSale.address;
        await ethers.provider.sendTransaction({
          to: contractAddress,
          value: ethers.utils.parseEther("1000"), // Increase the balance by 1000 ETH
        });
        // Get the balance of the contract
        const contractBalance = await ethers.provider.getBalance(contractAddress);
        console.log("contract balance: ", contractBalance);
        await tokenSale.connect(otherAccount).purchaseTokens();
        await tokenSale.connect(otherAccount).sellBack(amount).to.changeEtherBalances(
          [otherAccount, tokenSale],
          [refundAmount, -refundAmount]
        );
      });
    });
  });
  describe("purchaseTokens", function () {
    describe("Validations", function () {
      it("Should revert with the right error if supply exceed limit", async function () {
        const { tokenSale, owner } = await loadFixture(deployOneYearLockFixture);
        const amount = ethers.utils.parseEther("10000000");
        await tokenSale._mint(owner, amount)
        await expect(tokenSale.purchaseTokens()).to.be.revertedWith(
          "Token sale has ended"
        );
      });

      it("Should revert with the right error if value send is not equal to 1 ether", async function () {
        const { tokenSale, owner } = await loadFixture(deployOneYearLockFixture);
        const amount = ethers.utils.parseEther("1000");
        await tokenSale._mint(owner, amount)
        await expect(tokenSale.purchaseTokens({ value: ethers.utils.parseEther("2") })).to.be.revertedWith(
          "You must send 1 Ether to purchase tokens"
        );
      });

      it("Should revert with the right error if total supply and tokens to mint is greater than supply limit", async function () {
        const { tokenSale, owner } = await loadFixture(deployOneYearLockFixture);

        const amount = ethers.utils.parseEther("999001");
        await tokenSale._mint(owner, amount)
        await expect(tokenSale.purchaseTokens({ value: ethers.utils.parseEther("1") })).to.be.revertedWith(
          "Exceeds total supply limit"
        );
      });
    });

    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { tokenSale, owner } = await loadFixture(deployOneYearLockFixture);
        const amount = ethers.utils.parseEther("1000");
        const refundAmount = ((amount * 10 ** 18) / 2000);
        await tokenSale._mint(owner, amount)
        await expect(tokenSale.purchaseTokens({ value: ethers.utils.parseEther("1") })).to.emit(tokenSale, "TokensPurchased").withArgs(owner, amount, refundAmount);
      });
    });

    describe("Mint", function () {
      it("Should mint the tokens to the sender", async function () {
        const { tokenSale, owner } = await loadFixture(deployOneYearLockFixture);
        const amount = ethers.utils.parseEther("1000");
        await tokenSale._mint(owner, amount)
        await expect(tokenSale.purchaseTokens({ value: ethers.utils.parseEther("1") })).to.changeEtherBalances(
          [owner, tokenSale],
          [amount, -amount]
        );
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
        const contractBalance = await ethers.provider.getBalance(tokenSale.address);
        await expect(tokenSale.withdrawEther()).to.changeEtherBalances(
          [owner, tokenSale],
          [contractBalance, -contractBalance]
        );
      });
    });
  });
});
