import Image from 'next/image'
import { Inter } from 'next/font/google'
import Chart from 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
const { Network, Alchemy } = require("alchemy-sdk");

// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
  apiKey: "DOFOWOEL0fRBG3IigTR875L4XTzs4nXh", // Replace with your Alchemy API Key.
  network: Network.ETH_MAINNET, // Replace with your network.
};

const alchemy = new Alchemy(settings);

export default function Home() {
  const [transferVolumeData, setTransferVolumeData] = useState([]);
  const [blockNumbers, setBlockNumbers] = useState([]);

  useEffect(() => {
    const erc20TokenAddress = '0xc3761EB917CD790B30dAD99f6Cc5b4Ff93C4F9eA';

    async function getTransferVolumeData() {
      const transactions = await alchemy.core.getAssetTransfers({
        fromBlock: "0x0",
        toBlock: "latest",
        contractAddresses: [erc20TokenAddress], // You can replace with contract of your choosing
        excludeZeroValue: true,
        category: ["erc20"],
      });
      console.log(transactions)
      // Initialize an array to store the 10 subarrays
      const blocksArray = new Array(10).fill([]);

      // Use reduce to group transactions by block number
      const groupedTransactions = transactions.transfers.reduce((accumulator, transaction) => {
        const blockNumber = transaction.blockNum;
        console.log(blockNumber)
        accumulator[blockNumber] = accumulator[blockNumber] || [];
        accumulator[blockNumber].push(transaction);
        return accumulator;
      }, {});
      console.log(groupedTransactions);
      // Filter out empty or undefined blocks
      const filteredBlocks = blocksArray.map((_, index) => groupedTransactions[index] || []);
      console.log(filteredBlocks)
      const latestBlockNumber = await alchemy.core.getBlockNumber();
      const startBlock = Math.max(0, latestBlockNumber - 10); // Look back 10 blocks

      const transferVolumeData = [];
      const blockNumbers = [];

      for (let blockNumber = startBlock; blockNumber <= latestBlockNumber; blockNumber++) {
        const block = await alchemy.core.getBlock(blockNumber, true); // Retrieve block details
        let transferVolume = 0;
        if (block.transactions) {
          for (const tx of block.transactions) {
            if (tx === erc20TokenAddress) {
              console.log("hello")
              transferVolume += Number(tx.value);
            }
          }
        }

        transferVolumeData.push(transferVolume);
        blockNumbers.push(blockNumber);
      }

      setTransferVolumeData(transferVolumeData);
      setBlockNumbers(blockNumbers);
    }

    getTransferVolumeData();
  }, []);

  const data = {
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

  // const options = {
  //   scales: {
  //     x: {
  //       type: 'linear',
  //       position: 'bottom',
  //       title: {
  //         display: true,
  //         text: 'Block Number',
  //       },
  //     },
  //     y: {
  //       title: {
  //         display: true,
  //         text: 'BASEFEE',
  //       },
  //     },
  //   },
  // };

  return (
    <div>
      <h2>ERC20 Token Transfer Volume Chart</h2>
      <Line data={data} />
    </div>
  );
};
