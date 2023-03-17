import { fundAccount, getBalance, getNFTBalance, getTokenBalance, sendERC1155Tokens, sendERC20Tokens, sendERC721Tokens } from '@/utils/functions';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';

const Home = () => {
  const router = useRouter();
  const [selectedNetwork, setSelectedNetwork] = useState('Ethereum');
  const [user, setUser] = useState({});
  const [selectedAccount, setSelectedAccount] = useState('');
  const [erc20TokenBalance, setErc20TokenBalance] = useState('');
  const [erc721TokenBalance, setErc721TokenBalance] = useState('');
  const [erc1155TokenBalance, setErc1155TokenBalance] = useState('');
  const [activities, setActivities] = useState([]);
  const [isNew, setIsNew] = useState(true);
  const [accountData, setAccountData] = useState({
    address: '0x1234567890abcdef',
    balance: '10 ETH',
  });

  // State variables to store selected contract addresses
  const [selectedERC20Contract, setSelectedERC20Contract] = useState();
  const [selectedERC721Contract, setSelectedERC721Contract] = useState();
  const [selectedERC1155Contract, setSelectedERC1155Contract] = useState();

  const [erc20ContractAddresses, setErc20ContractAddresses] = useState([]);
  const [erc721ContractAddresses, setErc721ContractAddresses] = useState([]);
  const [erc1155ContractAddresses, setErc1155ContractAddresses] = useState([]);

  useEffect(() => {
    // Simulated account data and activities (replace with actual data)
    const user = JSON.parse(localStorage.getItem('user'));
    setUser(user);
    console.log(user)
    if (user) {
      setIsNew(false)
    } else {
      router.push('/newUser')
      setIsNew(true);
    }

    const getBalanceInit = async () => {
      let balance = await getBalance(user.address);
      balance = balance.toString() + 'ETH';
      console.log(user)
      setAccountData({ address: user.address, balance })
    }

    const getContractsArray = (array) => {
      console.log(array)
      // Use a Set to store unique names
      const uniqueContracts = new Set();

      // Use map to extract the "name" property and add it to the Set
      array.forEach((obj) => {
        uniqueContracts.add(obj.contractAddress);
      });
      console.log(uniqueContracts)
      // Convert the Set back to an array (if needed)
      const uniqueContractsArray = [...uniqueContracts];
      console.log(uniqueContractsArray)
      return uniqueContractsArray;
    }

    const getTokensInit = async () => {
    }
  }, []);

  return (
    <div>
      {!isNew ? (
        <div className="min-h-screen bg-gray-100">
          {/* Navigation Bar */}
          <div className="bg-blue-500 p-4 flex justify-between items-center">
            <div className="flex space-x-2">
              <select
                value={selectedNetwork}
                onChange={handleNetworkChange}
                className="bg-white text-blue-500 border border-blue-500 rounded-md px-3 py-1"
              >
                <option value="mainnet">Ethereum</option>
                <option value="sepolia">Sepolia</option>
                {/* Add more network options here */}
              </select>
              <select
                value={selectedAccount}
                onChange={handleAccountChange}
                className="bg-white text-blue-500 border border-blue-500 rounded-md px-3 py-1"
              >
                <option value="">Select Account</option>
                <option value="0x1234567890abcdef">0x1234567890abcdef</option>
                <option value="0xabcdef123456789">0xabcdef123456789</option>
                {/* Add more account options here */}
              </select>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 max-w-screen-xl mx-auto">
            <div className="bg-white shadow-lg rounded-md p-4 space-y-4">
              {/* Account Details */}
              <div>
                <p className="text-xl font-semibold">Account Details</p>
                <p>Address: {accountData.address}</p>
                <p>Balance: {accountData.balance}</p>
                {/* Display ERC-20 token balance */}
                <p>ERC-20 Token Balance: {erc20TokenBalance.length} Tokens</p>
                {/* Display ERC-721 token balance */}
                <p>ERC-721 Token Balance: {erc721TokenBalance.length} Tokens</p>
                {/* Display ERC-1155 token balance */}
                <p>ERC-1155 Token Balance: {erc1155TokenBalance.length} Tokens</p>
              </div>

              {/* Action Forms */}
              <div>
                <p className="text-xl font-semibold">Action Forms</p>
                {/* Form to Send ERC-20 Tokens */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendEthers(
                      e.target.amount.value,
                      e.target.recipient.value,
                      selectedERC20Contract // Pass the selected ERC-20 contract address
                    );
                  }}
                >
                  <div className="mb-4">
                    <label htmlFor="amount" className="block font-medium">
                      Ethers Amount in Wei
                    </label>
                    <input type="number" name="amount" id="amount" className="border rounded-md px-3 py-1" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="recipient" className="block font-medium">
                      Recipient Address
                    </label>
                    <input type="text" name="recipient" id="recipient" className="border rounded-md px-3 py-1" />
                  </div>
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
                    Send Ethers
                  </button>
                </form>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendERC20(
                      e.target.amount.value,
                      e.target.recipient.value,
                      selectedERC20Contract // Pass the selected ERC-20 contract address
                    );
                  }}
                >
                  <div className="mb-4">
                    <label htmlFor="amount" className="block font-medium">
                      ERC-20 Token Amount
                    </label>
                    <input type="number" name="amount" id="amount" className="border rounded-md px-3 py-1" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="recipient" className="block font-medium">
                      Recipient Address
                    </label>
                    <input type="text" name="recipient" id="recipient" className="border rounded-md px-3 py-1" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="erc20Contract" className="block font-medium">
                      Select ERC-20 Contract
                    </label>
                    <select
                      name="erc20Contract"
                      id="erc20Contract"
                      className="border rounded-md px-3 py-1"
                      value={selectedERC20Contract}
                      onChange={(e) => setSelectedERC20Contract(e.target.value)}
                    >
                      <option>
                        Select the Contract Address
                      </option>
                      {erc20ContractAddresses.map((address) => (
                        <option key={address} value={address}>
                          {address}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
                    Send ERC-20 Tokens
                  </button>
                </form>

                {/* Form to Send ERC-721 Tokens */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendERC721(
                      e.target.tokenId.value,
                      e.target.recipient.value,
                      selectedERC721Contract // Pass the selected ERC-721 contract address
                    );
                  }}
                >
                  <div className="mb-4">
                    <label htmlFor="tokenId" className="block font-medium">
                      ERC-721 Token ID
                    </label>
                    <input type="text" name="tokenId" id="tokenId" className="border rounded-md px-3 py-1" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="recipient" className="block font-medium">
                      Recipient Address
                    </label>
                    <input type="text" name="recipient" id="recipient" className="border rounded-md px-3 py-1" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="erc721Contract" className="block font-medium">
                      Select ERC-721 Contract
                    </label>
                    <select
                      name="erc721Contract"
                      id="erc721Contract"
                      className="border rounded-md px-3 py-1"
                      value={selectedERC721Contract}
                      onChange={(e) => setSelectedERC721Contract(e.target.value)}
                    >
                      <option>
                        Select the Contract Address
                      </option>
                      {erc721ContractAddresses.map((address) => (
                        <option key={address} value={address}>
                          {address}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
                    Send ERC-721 Tokens
                  </button>
                </form>

                {/* Form to Send ERC-1155 Tokens */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendERC1155(
                      e.target.tokenId.value,
                      e.target.amount.value,
                      e.target.recipient.value,
                      selectedERC1155Contract // Pass the selected ERC-1155 contract address
                    );
                  }}
                >
                  <div className="mb-4">
                    <label htmlFor="tokenId" className="block font-medium">
                      ERC-1155 Token ID
                    </label>
                    <input type="text" name="tokenId" id="tokenId" className="border rounded-md px-3 py-1" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="amount" className="block font-medium">
                      Amount
                    </label>
                    <input type="number" name="amount" id="amount" className="border rounded-md px-3 py-1" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="recipient" className="block font-medium">
                      Recipient Address
                    </label>
                    <input type="text" name="recipient" id="recipient" className="border rounded-md px-3 py-1" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="erc1155Contract" className="block font-medium">
                      Select ERC-1155 Contract
                    </label>
                    <select
                      name="erc1155Contract"
                      id="erc1155Contract"
                      className="border rounded-md px-3 py-1"
                      value={selectedERC1155Contract}
                      onChange={(e) => setSelectedERC1155Contract(e.target.value)}
                    >
                      <option>
                        Select the Contract Address
                      </option>
                      {erc1155ContractAddresses.map((address) => (
                        <option key={address} value={address}>
                          {address}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
                    Send ERC-1155 Tokens
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};


export default Home;
