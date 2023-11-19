// test/AirDropToken.test.js
const { expect } = require('chai');
const { ethers } = require('hardhat');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');


describe('AirDropToken', function () {
    let AirDropToken;
    let airDropToken;
    let owner;
    let user;
    let rootHash;
    let merkleTree;
    let leafNodes;

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();
        const signers = await ethers.getSigners();
        let whitelistAddresses = signers.slice(0, 10);
        leafNodes = whitelistAddresses.map(addr => keccak256(addr.address));
        merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

        rootHash = merkleTree.getRoot();

        AirDropToken = await ethers.getContractFactory('AirDropToken');
        airDropToken = await AirDropToken.deploy(rootHash, 10, whitelistAddresses.length);
        await airDropToken.waitForDeployment();
    });

    it('should deploy with the correct initial state', async function () {
        expect(await airDropToken.totalSupply()).to.equal(10);
        expect(await airDropToken.revealed()).to.equal(false);
        expect(await airDropToken.numOfWhiteListMembers()).to.equal(10);
    });

    it('should whitelist mint to a user', async function () {
        const hexProof = merkleTree.getHexProof(leafNodes[1]);
        await airDropToken.connect(user).whitelistMint(hexProof);
        for (let i = 0; i < 10; i++) {
            await ethers.provider.send("evm_mine", []);
        }
        await airDropToken.connect(user).reveal();
        const balance = await airDropToken.balanceOf(user.address);
        expect(balance).to.equal(1);
        expect(await airDropToken.totalSupply()).to.equal(10);
    });

    it('should reveal after 10 blocks', async function () {
        const hexProof = merkleTree.getHexProof(leafNodes[1]);
        await airDropToken.connect(user).whitelistMint(hexProof);
        for (let i = 0; i < 10; i++) {
            await ethers.provider.send("evm_mine", []);
        }
        expect(await airDropToken.connect(user).reveal()); // Stages.PreMinting
    });

    it('should not mint to non-whitelisted addresses in the pre-minting stage', async function () {
        const signers = await ethers.getSigners();
        const test = signers[10];
        await expect(airDropToken.connect(test).normalMint()).to.be.reverted;
    });
});
