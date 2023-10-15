// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  const StakingContract = await ethers.getContractFactory("StakingContract");
  console.log("Deploying StakingContract...");
  const stakingContract = await upgrades.deployProxy(StakingContract, [42], {
    initializer: "initialize",
  });
  await stakingContract.deployed();
  console.log("StakingContract deployed to:", stakingContract.address);
}

main();