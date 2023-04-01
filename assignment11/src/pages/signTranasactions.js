import React, { useState } from 'react';

const SignTransactions = () => {
    const [transactionData, setTransactionData] = useState('');
    const [signedTransaction, setSignedTransaction] = useState('');

    const handleTransactionDataChange = (event) => {
        setTransactionData(event.target.value);
    };

    const handleSignTransaction = () => {
        // Replace this with actual logic to sign the transaction data with the private key
        // Example: const signedTx = signTransaction(transactionData, privateKey);
        // setSignedTransaction(signedTx);
        console.log(`Signing transaction data: ${transactionData}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="p-8 max-w-md w-full space-y-4 bg-white shadow-lg rounded-md">
                <h1 className="text-3xl font-semibold text-center">Sign Transactions</h1>

                {/* Transaction Data Input */}
                <div>
                    <p className="text-lg font-bold">Transaction Data</p>
                    <textarea
                        value={transactionData}
                        onChange={handleTransactionDataChange}
                        className="w-full p-2 border border-gray-300 rounded-md mt-2"
                        rows="4"
                        placeholder="Enter transaction data to sign"
                    />
                </div>

                {/* Sign Button */}
                <button
                    onClick={handleSignTransaction}
                    className="w-full bg-blue-600 text-white p-2 rounded-md mt-2 hover:bg-blue-700"
                >
                    Sign Transaction
                </button>

                {/* Display Signed Transaction (if available) */}
                {signedTransaction && (
                    <div>
                        <p className="text-lg font-bold mt-4">Signed Transaction</p>
                        <pre className="p-2 border border-gray-300 rounded-md mt-2 break-all">
                            {signedTransaction}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignTransactions;
