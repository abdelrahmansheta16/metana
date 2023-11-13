// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require("hardhat");

const PROXY = "0xd247ad50e00fc5658B1D1F62E20cF741d5E35278";

async function main() {
  const Contract = await ethers.getContractFactory("MyNFTUpgradeableV2");
  console.log("Upgrading MyNFTUpgradeable...");
  await upgrades.upgradeProxy(PROXY, Contract);
  console.log("MyNFTUpgradeable upgraded");
}

main();