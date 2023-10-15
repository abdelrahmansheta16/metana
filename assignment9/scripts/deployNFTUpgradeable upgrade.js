// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require("hardhat");

const PROXY = "";

async function main() {
  const Contract = await ethers.getContractFactory("MyNFTUpgradeableV2");
  console.log("Upgrading MyNFTUpgradeable...");
  await upgrades.upgradeProxy(PROXY, Contract);
  console.log("MyNFTUpgradeable upgraded");
}

main();