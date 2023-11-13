// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  const Contract = await ethers.getContractFactory("MyNFTUpgradeable");
  console.log("Deploying MyNFTUpgradeable...");
  const contract = await upgrades.deployProxy(Contract, [], {
    initializer: "initialize",
  });
  await contract.waitForDeployment();
  console.log("MyNFTUpgradeable deployed to:", await contract.getAddress());
}

main();