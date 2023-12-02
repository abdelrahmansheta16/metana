// pages/index.js
import React, { useState, useEffect } from 'react';
import ChainBattles from "../../artifacts/contracts/ChainBattles.sol/ChainBattles.json";
import axios from "axios";
import { useAccount } from "wagmi";
import { ethers } from "ethers";

const InstructionsComponent = () => {
  const contractAddress = "0x2d1d702AcA729481d0fFD66467EEC93230E74a73";
  const [nftData, setNFTData] = useState();
  const { address, isConnected } = useAccount();
  const [price, setPrice] = useState();

  const handleMint = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let contract = new ethers.Contract(contractAddress, ChainBattles.abi, signer);
    const res = await contract.mint();
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
      console.log(nftData)
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
    let contract = new ethers.Contract(contractAddress, ChainBattles.abi, signer);
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
            <p className="text-lg text-gray-600">{nftData.description}</p>
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



