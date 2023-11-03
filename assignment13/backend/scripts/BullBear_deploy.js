const hre = require("hardhat");

async function main() {
	//BTC/USD = 0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43
	//Contract deployed at 0xB2a92b6d6BbB87d136D5Eb62731B9b3Df7852E8A
	const Contract = await hre.ethers.getContractFactory("BullBear");
	const duration = 60 * 60 * 24;
	const contract = await Contract.deploy(duration, "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43");

	await contract.deployed();

	console.log("BullBear deployed to:", contract.address);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});