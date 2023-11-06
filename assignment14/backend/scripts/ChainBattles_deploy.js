const hre = require("hardhat");

async function main() {
	const Chainlink = await hre.ethers.getContractFactory("VRFv2Consumer");
	const chainlink = await Chainlink.deploy(6646);

	await chainlink.deployed();

	console.log("Chainlink deployed to:", chainlink.address);

	const Contract = await hre.ethers.getContractFactory("ChainBattles");
	const contract = await Contract.deploy(chainlink.address);

	await contract.deployed();

	console.log("ChainBattles deployed to:", contract.address);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});