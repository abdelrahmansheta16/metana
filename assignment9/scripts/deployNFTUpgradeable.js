// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  const Contract = await ethers.getContractFactory("MyNFTUpgradeable");
  console.log("Deploying MyNFTUpgradeable...");
  const contract = await upgrades.deployProxy(Contract, [], {
    initializer: "initialize",
  });
  await contract.deployed();
  console.log("MyNFTUpgradeable deployed to:", box.address);
}

main();