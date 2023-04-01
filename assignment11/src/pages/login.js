import { useState } from 'react';
import { useRouter } from 'next/router';

const RecoveryPage = ({ content }) => {
    const [mnemonic, setMnemonic] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white p-8 rounded-md shadow-lg space-y-4">
                <h1 className="text-3xl font-semibold text-center">Recovery Page</h1>
            </div>
        </div>
    );
};

export default RecoveryPage;
