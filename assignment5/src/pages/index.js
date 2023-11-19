import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { ethers } from 'ethers';
const { Network, Alchemy } = require("alchemy-sdk");

// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
    apiKey: "DOFOWOEL0fRBG3IigTR875L4XTzs4nXh", // Replace with your Alchemy API Key.
    network: Network.ETH_MAINNET, // Replace with your network.
};

const alchemy = new Alchemy(settings);
const AllCharts = () => {
    // State for ERC20 token transfer data
    const [transferVolumeData, setTransferVolumeData] = useState([]);
    const [blockNumbers, setBlockNumbers] = useState([]);

    // State for BASEFEE data
    const [basefeeData, setBasefeeData] = useState([]);
    const [basefeeBlockNumbers, setBasefeeBlockNumbers] = useState([]);

    // State for gasUsed/gasLimit ratio data
    const [gasRatioData, setGasRatioData] = useState([]);
    const [gasRatioBlockNumbers, setGasRatioBlockNumbers] = useState([]);

    useEffect(() => {
        const erc20TokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
        const erc20Abi = [
            "event Transfer(address indexed _from, address indexed _to, uint256 _value)"
        ];
        const provider = new ethers.providers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/DOFOWOEL0fRBG3IigTR875L4XTzs4nXh');

        const contract = new ethers.Contract(erc20TokenAddress, erc20Abi, provider);

        async function getTransferVolumeData() {
            const latestBlockNumber = await alchemy.core.getBlockNumber();
            const startBlockNumber = Math.max(0, latestBlockNumber - 10);

            const filter = {
                address: erc20TokenAddress,
                fromBlock: startBlockNumber,
                toBlock: 'latest', // Use 'latest' for the most recent block
                topics: [ethers.utils.id('Transfer(address,address,uint256)')] // ERC-20 Transfer event topic
            };

            const transferEvents = await alchemy.core.getLogs(filter);

            const transferVolumeData = [];
            const blockNumbers = [];

            for (let blockNumber = startBlockNumber; blockNumber <= latestBlockNumber; blockNumber++) {
                let transferVolume = 0;
                for (const event of transferEvents) {
                    if (event.blockNumber == blockNumber) {
                        transferVolume += parseInt(event.data, 16);
                    }
                }
                console.log(transferVolume);
                transferVolumeData.push(transferVolume);
                blockNumbers.push(blockNumber);
            }

            setTransferVolumeData(transferVolumeData);
            setBlockNumbers(blockNumbers);
        }

        async function getBasefeeData() {
            const latestBlockNumber = await alchemy.core.getBlockNumber();
            const startBlock = Math.max(0, latestBlockNumber - 10); // Look back 10 blocks

            const basefeeData = [];
            const blockNumbers = [];

            for (let blockNumber = startBlock; blockNumber <= latestBlockNumber; blockNumber++) {
                const block = await alchemy.core.getBlock(blockNumber);
                const basefee = block.baseFeePerGas;

                basefeeData.push(basefee.toString());
                blockNumbers.push(blockNumber.toString());
            }
            setBasefeeData(basefeeData);
            setBasefeeBlockNumbers(blockNumbers);
        }

        async function getGasRatioData() {
            const latestBlockNumber = await alchemy.core.getBlockNumber();
            const startBlock = Math.max(0, latestBlockNumber - 10); // Look back 10 blocks

            const gasRatioData = [];
            const blockNumbers = [];

            for (let blockNumber = startBlock; blockNumber <= latestBlockNumber; blockNumber++) {
                const block = await alchemy.core.getBlock(blockNumber);
                const gasUsed = block.gasUsed;
                const gasLimit = block.gasLimit;
                const ratio = (gasUsed / gasLimit) * 100; // Calculate ratio as a percentage

                gasRatioData.push(ratio);
                blockNumbers.push(blockNumber);
            }

            setGasRatioData(gasRatioData);
            setGasRatioBlockNumbers(blockNumbers);
        }

        // Fetch data for all three charts
        getTransferVolumeData();
        getBasefeeData();
        getGasRatioData();
    }, []);

    // Create chart data and options for all three charts here
    const transferData = {
        labels: blockNumbers,
        datasets: [
            {
                label: 'Transfer Volume',
                data: transferVolumeData,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
            },
        ],
    };
    const baseData = {
        labels: basefeeBlockNumbers,
        datasets: [
            {
                label: 'BASEFEE',
                data: basefeeData,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
            },
        ],
    };
    const ratioData = {
        labels: gasRatioBlockNumbers,
        datasets: [
            {
                label: 'GasUsed/GasLimit Ratio (%)',
                data: gasRatioData,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
            },
        ],
    };
    const comparison = {
        labels: gasRatioBlockNumbers,
        datasets: [
            {
                label: 'GasUsed/GasLimit Ratio (%)',
                data: gasRatioData,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
            },
            {
                label: 'BASEFEE',
                data: basefeeData.map(fee => fee/100000000),
                borderColor: 'rgba(75, 152, 132, 1)',
                borderWidth: 2,
                fill: false,
            }
        ],
    };
    return (
        <div >
            <h2>ERC20 Token Transfer Volume Chart</h2>
            <Bar data={transferData} />

            <h2>BASEFEE Chart</h2>
            <Line data={baseData} />

            <h2>GasUsed/GasLimit Ratio Chart</h2>
            <Line data={ratioData} />

            <h2>Comparison</h2>
            <Line data={comparison} />
        </div>
    );
};

export default AllCharts;
