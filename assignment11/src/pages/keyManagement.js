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
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="p-8 max-w-md w-full space-y-4 bg-white shadow-lg rounded-md">
                <h1 className="text-3xl font-semibold text-center">Key Management</h1>
            </div>
        </div>
    );
};

export default KeyManagement;
