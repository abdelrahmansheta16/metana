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
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};


export default Home;
