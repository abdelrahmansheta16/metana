// pages/index.js
import React, { useState, useEffect } from 'react';
import BullBear from "../../artifacts/contracts/BullBear.sol/BullBear.json";
import axios from "axios";
import { useAccount } from "wagmi";
import { ethers } from "ethers";

const InstructionsComponent = () => {
  const contractAddress = "0xB2a92b6d6BbB87d136D5Eb62731B9b3Df7852E8A";
  const [nftData, setNFTData] = useState();
  const { address, isConnected } = useAccount();
  const [price, setPrice] = useState();

  const handleMint = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let contract = new ethers.Contract(contractAddress, BullBear.abi, signer);
    const res = await contract.safeMint(address);
    await res.wait()
    const NFT = await contract.tokenOfOwnerByIndex(address, 0);
    console.log("NFT", NFT._hex.toString());
    const tokenURI = await contract.tokenURI(NFT._hex.toString());
    let meta = await axios.get(tokenURI);
    setNFTData(meta.data);
  }

  useEffect(() => {
    const getMetaData = async () => {
      console.log(address)
      const NFT = await contract.tokenOfOwnerByIndex(address, 0);
      console.log(NFT)
      console.log("NFT", NFT._hex.toString());
      const tokenURI = await contract.tokenURI(NFT._hex.toString());
      console.log(tokenURI)
      const latestPrice = await contract.getLatestPrice();
      console.log(latestPrice.toString())
      setPrice(latestPrice.toString());
      if (tokenURI) {
        let meta = await axios.get(tokenURI);
        console.log(meta)
        setNFTData(meta.data);
      }
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let contract = new ethers.Contract(contractAddress, BullBear.abi, signer);
    if (address) {
      getMetaData()
    }
  }, [address]);

  return (
    <main>
      <div className="items-center h-max bg-gray-100">
        {!address ? (
          <div className="flex justify-center text-3xl font-semibold p-8 bg-white rounded-lg shadow-lg text-center">
            <p className="mb-4">Connect to Sepolia Test Network</p>
            {/* You can add additional content or styling here */}
          </div>
        ) : nftData ? (
          <div className="p-4 bg-white rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">{nftData.name}</h2>
            <p className="text-lg text-gray-600">BTC/USD Price: {price}</p>
            <img src={nftData.image} alt="NFT" className="w-32 h-48 mx-auto mt-4" style={{ width: "250px" }} />
          </div>
        ) : (
          <button
            onClick={handleMint}
            className="text-2xl px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Mint
          </button>
        )}
      </div>
    </main>
  );
};

export default InstructionsComponent;



