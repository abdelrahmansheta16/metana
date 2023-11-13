// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require("hardhat");

async function main() {

  const tokenAddress = '0x19cB793404a155C57E35f11E99666f101E2aC0f5';
  const nftAddress = '0xd247ad50e00fc5658B1D1F62E20cF741d5E35278';

  const StakingContract = await ethers.getContractFactory("StakingContract");
  console.log("Deploying StakingContract...");
  const stakingContract = await upgrades.deployProxy(StakingContract, [nftAddress, tokenAddress], {
    initializer: "initialize",
  });
  await stakingContract.waitForDeployment();
  console.log("StakingContract deployed to:", await stakingContract.getAddress());
}

main();