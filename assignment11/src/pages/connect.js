import React, { useState } from 'react';

const ConnectNetworks = () => {
    const [selectedNetwork, setSelectedNetwork] = useState('Ethereum');
    const [customRPC, setCustomRPC] = useState('');

    const handleNetworkChange = (event) => {
        setSelectedNetwork(event.target.value);
    };

    const handleCustomRPCChange = (event) => {
        setCustomRPC(event.target.value);
    };

    const connectToNetwork = () => {
        // Replace this with actual logic to connect to the selected network
        console.log(`Connecting to ${selectedNetwork}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="p-8 max-w-md w-full space-y-4 bg-white shadow-lg rounded-md">
                <h1 className="text-3xl font-semibold text-center">Connect to Blockchain Networks</h1>

                {/* Select Network */}
                <div>
                    <p className="text-lg font-bold">Select Blockchain Network</p>
                    <select
                        value={selectedNetwork}
                        onChange={handleNetworkChange}
                        className="w-full p-2 border border-gray-300 rounded-md mt-2"
                    >
                        <option value="Ethereum">Ethereum</option>
                        <option value="Binance Smart Chain">Binance Smart Chain</option>
                        <option value="Custom">Custom</option>
                    </select>
                </div>

                {/* Custom RPC URL */}
                {selectedNetwork === 'Custom' && (
                    <div>
                        <p className="text-lg font-bold">Custom RPC URL</p>
                        <input
                            type="text"
                            value={customRPC}
                            onChange={handleCustomRPCChange}
                            className="w-full p-2 border border-gray-300 rounded-md mt-2"
                            placeholder="Enter Custom RPC URL"
                        />
                    </div>
                )
        }

                {/* Connect Button */}
                <button
                    onClick={connectToNetwork}
                    className="w-full bg-blue-600 text-white p-2 rounded-md mt-2 hover:bg-blue-700"
                >
                    Connect
                </button>
            </div>
        </div>
    );
};

export default ConnectNetworks;
