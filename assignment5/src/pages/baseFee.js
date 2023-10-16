import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import { Line } from 'react-chartjs-2';
const { Network, Alchemy } = require("alchemy-sdk");

// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
    apiKey: "DOFOWOEL0fRBG3IigTR875L4XTzs4nXh", // Replace with your Alchemy API Key.
    network: Network.ETH_MAINNET, // Replace with your network.
};

const alchemy = new Alchemy(settings);

const BasefeeChart = () => {
    const [basefeeData, setBasefeeData] = useState([]);
    const [blockNumbers, setBlockNumbers] = useState([]);

    useEffect(() => {

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
            console.log(basefeeData)
            console.log(blockNumbers)
            setBasefeeData(basefeeData);
            setBlockNumbers(blockNumbers);
        }

        getBasefeeData();
    }, []);

    const data = {
        labels: blockNumbers,
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

    const options = {
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                title: {
                    display: true,
                    text: 'Block Number',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'BASEFEE',
                },
            },
        },
    };

    return (
        <div>
            <h2>BASEFEE Chart</h2>
            <Line data={data} />
        </div>
    );
};

export default BasefeeChart;
