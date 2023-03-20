import React, { useState, useEffect } from 'react';

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);

    // Replace this with actual logic to fetch transaction history from your wallet
    useEffect(() => {
        // Simulated transaction history
        const fakeTransactions = [
            { id: 1, date: '2023-10-20', amount: '0.5 ETH', status: 'Success' },
            { id: 2, date: '2023-10-19', amount: '1.2 ETH', status: 'Success' },
            { id: 3, date: '2023-10-18', amount: '0.3 ETH', status: 'Pending' },
            { id: 4, date: '2023-10-17', amount: '0.7 ETH', status: 'Success' },
        ];

        setTransactions(fakeTransactions);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="p-8 max-w-md w-full space-y-4 bg-white shadow-lg rounded-md">
                <h1 className="text-3xl font-semibold text-center">Transaction History</h1>

                {transactions.map((transaction) => (
                    <div key={transaction.id} className="border p-4 rounded-md">
                        <p className="text-lg font-bold">Date: {transaction.date}</p>
                        <p className="text-lg">Amount: {transaction.amount}</p>
                        <p className={`text-lg ${transaction.status === 'Success' ? 'text-green-600' : 'text-yellow-600'}`}>
                            Status: {transaction.status}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TransactionHistory;
