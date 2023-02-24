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
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};


export default Home;
