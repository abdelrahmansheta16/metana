import { useState } from 'react';
import { useRouter } from 'next/router';
import { HDKey } from 'ethereum-cryptography/hdkey';
import { mnemonicToEntropy, mnemonicToSeed } from 'ethereum-cryptography/bip39';
const { wordlist } = require("ethereum-cryptography/bip39/wordlists/english");
import key from 'ethereum-cryptography/hdkey';
import crypto from 'crypto';
import { publicToAddress, secp256k1, toChecksumAddress } from 'ethereumjs-util';
import { ethers } from 'ethers';

// export async function getStaticProps() {
//     try {
//         // Read the contents of the text file
//         const data = await fse.readFile('./src/utils/wordlist.txt', 'utf8')
//         console.log(data)
//         const wordList = data.split(/\s+|\n/).filter(word => word.trim() !== "");
//         return {
//             props: {
//                 content: wordList,
//             },
//         };
//     } catch (error) {
//         console.log(error)
//         console.error('Error reading the file:', error);
//         return {
//             props: {
//                 content: 'Error reading the file',
//             },
//         };
//     }
// }
const RecoveryPage = ({ content }) => {
    const [mnemonic, setMnemonic] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const handleRecovery = async () => {

        try {
            // Derive the private key
            const privateKey = mnemonicToEntropy(mnemonic,wordlist);
            console.log(Buffer.from(privateKey).toString('hex'));
            // Derive the public key from the private key
            const publicKey = secp256k1.publicKeyCreate(privateKey, false);

            // Calculate the Ethereum address from the public key
            const addressBuffer = publicToAddress(Buffer.from(publicKey), true); // true for RLP encoding
            const address = toChecksumAddress('0x' + addressBuffer.toString('hex'));
            console.log(address)
            const user = {
                privateKey: Buffer.from(privateKey).toString('hex'),
                publicKey:Buffer.from(publicKey).toString('hex'),
                address,
                mnemonic
            };
            console.log(user)
            localStorage.setItem('user', JSON.stringify(user));
            router.push('/');
        } catch (err) {
            console.error(err)
            setError('Error deriving the private key.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white p-8 rounded-md shadow-lg space-y-4">
                <h1 className="text-3xl font-semibold text-center">Recovery Page</h1>
            </div>
        </div>
    );
};

export default RecoveryPage;
