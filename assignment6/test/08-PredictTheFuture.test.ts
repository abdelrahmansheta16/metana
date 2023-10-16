import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import helpers from "@nomicfoundation/hardhat-network-helpers";
import { Contract } from 'ethers';
import { ethers,network } from 'hardhat';
const { utils, provider } = ethers;

describe('PredictTheFutureChallenge', () => {
  let target: Contract;
  let hack: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('PredictTheFutureChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });
    await target.deployed();

    hack = await (
      await ethers.getContractFactory('Attack', deployer)
    ).deploy(target.address);
    await hack.deployed();

    hack = hack.connect(attacker);
  });

  it('exploit', async () => {
    await hack.lockInGuess({value:ethers.utils.parseEther('1')});
    while(!(await target.isComplete())){
      await hack.hack();
    }
    const first = await target.blockNumber();
    const second = await target.settlementBlockNumber();
    expect(await provider.getBalance(target.address)).to.equal(0);
    expect(await target.isComplete()).to.equal(true);
  });
});
