// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  const MyTokenUpgradeable = await ethers.getContractFactory("MyTokenUpgradeable");
  console.log("Deploying MyTokenUpgradeable...");
  const myTokenUpgradeable = await upgrades.deployProxy(MyTokenUpgradeable, [], {
    initializer: "initialize",
  });
  await myTokenUpgradeable.deployed();
  console.log("MyTokenUpgradeable deployed to:", myTokenUpgradeable.address);
}

main();