import React from 'react';

const Home = () => {

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
