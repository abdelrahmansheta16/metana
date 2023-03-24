import { useRouter } from 'next/router';
import React, { useState } from 'react';
import crypto from 'crypto';
const fse = require('fs-extra');
import createAccount from '@/utils/functions';

export async function getStaticProps() {
    try {
        // Read the contents of the text file
        const data = await fse.readFile('./src/utils/wordlist.txt', 'utf8')
        console.log(data)
        const wordList = data.split(/\s+|\n/).filter(word => word.trim() !== "");
        return {
            props: {
                content: wordList,
            },
        };
    } catch (error) {
        console.log(error)
        console.error('Error reading the file:', error);
        return {
            props: {
                content: 'Error reading the file',
            },
        };
    }
}

const KeyManagement = ({content}) => {
    const router = useRouter();
    const [newAccountName, setNewAccountName] = useState('');
    const [generatedKeyPair, setGeneratedKeyPair] = useState(null);

    const generateKeyPair = async () => {
        // Replace this with actual logic to generate key pairs securely
        const user = await createAccount(content);
        console.log(user);
        const privateKeyHash = crypto.createHash('sha256').update(user.privateKey.toString('hex')).digest('hex');
        localStorage.setItem('user', JSON.stringify(user));
        setGeneratedKeyPair(user);
        router.push('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="p-8 max-w-md w-full space-y-4 bg-white shadow-lg rounded-md">
                <h1 className="text-3xl font-semibold text-center">Key Management</h1>

                {/* Create New Account */}
                <div>
                    <p className="text-lg font-bold">Create New Account</p>
                    <input
                        type="text"
                        placeholder="Account Name"
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    {generatedKeyPair ? <button
                        onClick={() => { router.push('/') }}
                        className="w-full bg-blue-600 text-white p-2 rounded-md mt-2 hover:bg-blue-700"
                    >
                        Continue
                    </button> : <button
                        onClick={generateKeyPair}
                        className="w-full bg-blue-600 text-white p-2 rounded-md mt-2 hover:bg-blue-700"
                    >
                        Generate Key Pair
                    </button>}
                </div>

                {/* Display Generated Key Pair */}
                {generatedKeyPair && (
                    <div>
                        <p className="text-lg font-bold">Generated Key Pair</p>
                        <p className="text-lg">Account Address: {generatedKeyPair.address}</p>
                        <p className="text-lg">24-word Mnemonic: {generatedKeyPair.mnemonic}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KeyManagement;
