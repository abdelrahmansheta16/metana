const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

describe("AirDropToken", function () {
    let AirDropToken;
    let airDropToken;
    let owner, user1;
    let signers;
    let leafNodes;
    let merkleTree;
    let rootHash;

    beforeEach(async function () {
        [owner, user1] = await ethers.getSigners();
        signers = await ethers.getSigners();
        let whitelistAddresses = signers.slice(0, 10);
        leafNodes = whitelistAddresses.map(addr => keccak256(addr.address));
        merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

        rootHash = merkleTree.getRoot();

        AirDropToken = await ethers.getContractFactory('AirDropToken');
        airDropToken = await AirDropToken.deploy(rootHash, 20, whitelistAddresses.length, { value: ethers.parseEther("10") });
        await airDropToken.waitForDeployment();
    });

    describe("Deployment", function () {
        it("should deploy with the correct initial state", async function () {
            expect(await airDropToken.totalSupplyLimit()).to.equal(20);
            expect(await airDropToken.revealed()).to.equal(false);
            expect(await airDropToken.numOfWhiteListMembers()).to.equal(10);
            expect(await airDropToken.stage()).to.equal(0); // Stages.PreMinting
        });
    });

    describe("whitelistMint", function () {
        describe("Validations", function () {
            it("should allow whitelisted minting during PreMinting stage", async function () {
                const hexProof = merkleTree.getHexProof(leafNodes[1]);
                await airDropToken.connect(user1).whitelistMint(hexProof);
                for (let i = 0; i < 10; i++) {
                    await ethers.provider.send("evm_mine", []);
                }
                await airDropToken.connect(user1).reveal();
                const balance = await airDropToken.balanceOf(user1.address);
                expect(balance).to.equal(1);
            });

            it("Should revert with the right error if address already minted", async function () {

                const hexProof = merkleTree.getHexProof(leafNodes[1]);
                await airDropToken.connect(user1).whitelistMint(hexProof);
                await expect(airDropToken.connect(user1).whitelistMint(hexProof)).to.be.revertedWithCustomError(airDropToken, "CustomError").withArgs("Already Claimed!");
            });

            it("Should not revert if sufficient balance", async function () {
                const hexProof = merkleTree.getHexProof(leafNodes[1]);
                await expect(airDropToken.connect(user1).whitelistMint(hexProof.slice(0, 2))).to.be.revertedWithCustomError(airDropToken, "CustomError").withArgs("Invalid Merkle Proof");
            });

            it("Should submit a commitment", async function () {
                const hexProof = merkleTree.getHexProof(leafNodes[1]);
                await airDropToken.connect(user1).whitelistMint(hexProof);
                await expect(airDropToken.connect(user1).commitment(user1.address)).not.to.equal(0);
            });
        });
        describe("Events", function () {
            it("Should emit an event on submitting a commitment", async function () {
                const hexProof = merkleTree.getHexProof(leafNodes[1]);
                await expect(airDropToken.connect(user1).whitelistMint(hexProof)).to.emit(airDropToken, "CommitmentSubmitted");
            });
        });
    });
    describe("normalMint", function () {
        describe("Validations", function () {
            it("should not allow normal minting during PreMinting stage", async function () {
                await expect(airDropToken.connect(user1).normalMint()).to.be.reverted;
            });
        });

        describe("Events", function () {
            it("Should emit an event on submitting a commitment", async function () {
                for (let i = 0; i < 10; i++) {
                    const hexProof = merkleTree.getHexProof(leafNodes[i]);
                    await airDropToken.connect(signers[i]).whitelistMint(hexProof);
                    for (let i = 0; i < 10; i++) {
                        await ethers.provider.send("evm_mine", []);
                    }
                    await airDropToken.connect(signers[i]).reveal();
                }
                await expect(airDropToken.connect(user1).normalMint()).to.emit(airDropToken, "CommitmentSubmitted");
            });
        });
    });

    describe("withdraw", function () {
        describe("Validations", function () {
            it("should not withdraw during PreMinting stage", async function () {
                for (let i = 0; i < 5; i++) {
                    const hexProof = merkleTree.getHexProof(leafNodes[i]);
                    await airDropToken.connect(signers[i]).whitelistMint(hexProof);
                    for (let i = 0; i < 10; i++) {
                        await ethers.provider.send("evm_mine", []);
                    }
                    await airDropToken.connect(signers[i]).reveal();
                }
                const tokenId = await airDropToken.connect(user1).tokenOfOwnerByIndex(user1.address, 0)
                await expect(airDropToken.connect(user1).withdraw(tokenId)).to.be.reverted;
            });

            it("should not withdraw if not owner", async function () {
                for (let i = 0; i < 10; i++) {
                    const hexProof = merkleTree.getHexProof(leafNodes[i]);
                    await airDropToken.connect(signers[i]).whitelistMint(hexProof);
                    for (let i = 0; i < 10; i++) {
                        await ethers.provider.send("evm_mine", []);
                    }
                    await airDropToken.connect(signers[i]).reveal();
                }
                const tokenId = await airDropToken.connect(owner).tokenOfOwnerByIndex(owner.address, 0)
                await expect(airDropToken.connect(user1).withdraw(tokenId)).to.be.revertedWithCustomError(airDropToken, "CustomError").withArgs("Only the owner of this token can withdraw");
            });

            it("should increase the sender balance by 1 ETH", async function () {
                for (let i = 0; i < 10; i++) {
                    const hexProof = merkleTree.getHexProof(leafNodes[i]);
                    await airDropToken.connect(signers[i]).whitelistMint(hexProof);
                    for (let i = 0; i < 10; i++) {
                        await ethers.provider.send("evm_mine", []);
                    }
                    await airDropToken.connect(signers[i]).reveal();
                }
                const tokenId = await airDropToken.connect(user1).tokenOfOwnerByIndex(user1.address, 0)
                const balanceBefore = await ethers.provider.getBalance(user1.address);
                console.log(balanceBefore);
                await airDropToken.connect(user1).withdraw(tokenId);
                const balanceAfter = await ethers.provider.getBalance(user1.address);
                console.log(balanceAfter);
                expect(balanceAfter - balanceBefore).to.be.closeTo(ethers.parseEther("1"), ethers.parseEther("0.00008"));
            });
        });


        describe("Events", function () {
            it("Should emit an event on submitting a commitment", async function () {
                for (let i = 0; i < 10; i++) {
                    const hexProof = merkleTree.getHexProof(leafNodes[i]);
                    await airDropToken.connect(signers[i]).whitelistMint(hexProof);
                    for (let i = 0; i < 10; i++) {
                        await ethers.provider.send("evm_mine", []);
                    }
                    await airDropToken.connect(signers[i]).reveal();
                }
                await expect(airDropToken.connect(user1).normalMint()).to.emit(airDropToken, "CommitmentSubmitted");
            });
        });
    });

    describe("transferMultiple", function () {
        describe("Validations", function () {
            it("should not transfer if not owner", async function () {
                for (let i = 0; i < 10; i++) {
                    const hexProof = merkleTree.getHexProof(leafNodes[i]);
                    await airDropToken.connect(signers[i]).whitelistMint(hexProof);
                    for (let i = 0; i < 10; i++) {
                        await ethers.provider.send("evm_mine", []);
                    }
                    await airDropToken.connect(signers[i]).reveal();
                }
                let tokenIds = [];
                for (let i = 0; i < 3; i++) {
                    await airDropToken.connect(owner).normalMint();
                    for (let i = 0; i < 10; i++) {
                        await ethers.provider.send("evm_mine", []);
                    }
                    await airDropToken.connect(owner).reveal();
                    const tokenId = await airDropToken.connect(owner).tokenOfOwnerByIndex(owner.address, i);
                    tokenIds.push(tokenId);
                }
                await expect(airDropToken.connect(user1).transferMultiple(owner, tokenIds)).to.be.revertedWithCustomError(airDropToken, "CustomError").withArgs("Only the owner of this token can perform this action");
            });

            it("should not transfer to zero or contract address", async function () {
                for (let i = 0; i < 10; i++) {
                    const hexProof = merkleTree.getHexProof(leafNodes[i]);
                    await airDropToken.connect(signers[i]).whitelistMint(hexProof);
                    for (let i = 0; i < 10; i++) {
                        await ethers.provider.send("evm_mine", []);
                    }
                    await airDropToken.connect(signers[i]).reveal();
                }
                let tokenIds = [];
                for (let i = 0; i < 3; i++) {
                    await airDropToken.connect(owner).normalMint();
                    for (let i = 0; i < 10; i++) {
                        await ethers.provider.send("evm_mine", []);
                    }
                    await airDropToken.connect(owner).reveal();
                    const tokenId = await airDropToken.connect(owner).tokenOfOwnerByIndex(owner.address, i);
                    tokenIds.push(tokenId);
                }
                console.log(airDropToken.target)
                await expect(airDropToken.connect(owner).transferMultiple(airDropToken.target, tokenIds)).to.be.revertedWithCustomError(airDropToken, "CustomError").withArgs("Cannot send to zero or contract address");
            });
        });

        describe("Events", function () {
            it("Should emit an event on submitting a commitment", async function () {
                for (let i = 0; i < 10; i++) {
                    const hexProof = merkleTree.getHexProof(leafNodes[i]);
                    await airDropToken.connect(signers[i]).whitelistMint(hexProof);
                    for (let i = 0; i < 10; i++) {
                        await ethers.provider.send("evm_mine", []);
                    }
                    await airDropToken.connect(signers[i]).reveal();
                }
                await expect(airDropToken.connect(user1).normalMint()).to.emit(airDropToken, "CommitmentSubmitted");
            });
        });

        describe("Transfers", function () {
            it("Should transfer the funds", async function () {
                for (let i = 0; i < 10; i++) {
                    const hexProof = merkleTree.getHexProof(leafNodes[i]);
                    await airDropToken.connect(signers[i]).whitelistMint(hexProof);
                    for (let i = 0; i < 10; i++) {
                        await ethers.provider.send("evm_mine", []);
                    }
                    await airDropToken.connect(signers[i]).reveal();
                }
                let tokenIds = [];
                for (let i = 0; i < 3; i++) {
                    await airDropToken.connect(owner).normalMint();
                    for (let i = 0; i < 10; i++) {
                        await ethers.provider.send("evm_mine", []);
                    }
                    await airDropToken.connect(owner).reveal();
                    const tokenId = await airDropToken.connect(owner).tokenOfOwnerByIndex(owner.address, i);
                    tokenIds.push(tokenId);
                }
                await airDropToken.connect(owner).transferMultiple(user1.address, tokenIds);
                const ownerBalance = await airDropToken.balanceOf(owner.address);
                const userBalance = await airDropToken.balanceOf(user1.address);
                expect(userBalance).to.equal(ownerBalance + BigInt(tokenIds.length));
            });
        });
    });
});

