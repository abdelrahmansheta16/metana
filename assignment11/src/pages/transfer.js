import { fundAccount } from '@/utils/functions';
import { entropyToMnemonic } from 'ethereum-cryptography/bip39';
import React, { useState } from 'react';

const SendReceive = () => {
    const [sendAddress, setSendAddress] = useState('');
    const [sendAmount, setSendAmount] = useState('');
    const [receiveAddress, setReceiveAddress] = useState('');

    // Replace these with actual functions for sending and receiving funds
    const handleSend = async () => {
        // Implement the logic to send cryptocurrency
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            await fundAccount(user.address,user.privateKey,parseInt(sendAmount),sendAddress)
        }
        console.log(`Sending ${sendAmount} to ${sendAddress}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="p-8 max-w-md w-full space-y-4 bg-white shadow-lg rounded-md">
                <h1 className="text-3xl font-semibold text-center">Send</h1>

                {/* Send Funds */}
                <div>
                    <p className="text-lg font-bold">Send Funds</p>
                    <input
                        type="text"
                        placeholder="Recipient Address"
                        value={sendAddress}
                        onChange={(e) => setSendAddress(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <input
                        type="number"
                        placeholder="Amount"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md mt-2"
                    />
                    <button
                        onClick={handleSend}
                        className="w-full bg-blue-600 text-white p-2 rounded-md mt-2 hover:bg-blue-700"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SendReceive;
