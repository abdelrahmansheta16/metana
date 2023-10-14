import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils } = ethers;

describe('GuessTheSecretNumberChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('GuessTheSecretNumberChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    const secret = await target.answerHash();
    console.log(secret)
    for(var i = 0; i < 256; i++) {
    const numberAsBytes32 = ethers.utils.hexZeroPad(ethers.utils.hexlify(i), 32);
    const guess = ethers.utils.solidityKeccak256(["uint8"],[i]);
    console.log(guess)
    if(guess == secret){
      console.log(guess)
      await target.guess(i,{value:ethers.utils.parseEther('1')})
    }
    }

    expect(await target.isComplete()).to.equal(true);
  });
});
