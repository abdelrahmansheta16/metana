import { useState } from 'react';
import { useRouter } from 'next/router';
import { HDKey } from 'ethereum-cryptography/hdkey';
import { mnemonicToEntropy, mnemonicToSeed } from 'ethereum-cryptography/bip39';
const { wordlist } = require("ethereum-cryptography/bip39/wordlists/english");
import key from 'ethereum-cryptography/hdkey';
import crypto from 'crypto';
import { publicToAddress, secp256k1, toChecksumAddress } from 'ethereumjs-util';

const RecoveryPage = () => {
    const [mnemonic, setMnemonic] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const handleRecovery = async () => {

        try {
            // Derive the private key
            const privateKey = mnemonicToEntropy(mnemonic,wordlist);
            // Derive the public key from the private key
            const publicKey = secp256k1.publicKeyCreate(privateKey, false);

            // Calculate the Ethereum address from the public key
            const addressBuffer = publicToAddress(Buffer.from(publicKey), true); // true for RLP encoding
            const address = toChecksumAddress('0x' + addressBuffer.toString('hex'));
            const user = {
                privateKey: Buffer.from(privateKey).toString('hex'),
                publicKey:Buffer.from(publicKey).toString('hex'),
                address,
                mnemonic
            };
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
                <div>
                    <label className="text-lg">Enter your 24-word mnemonic phrase:</label>
                    <input
                        type="text"
                        value={mnemonic}
                        onChange={(e) => setMnemonic(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 mt-2"
                    />
                    <button
                        onClick={handleRecovery}
                        className="w-full bg-blue-500 text-white p-2 rounded-md mt-4 hover:bg-blue-600"
                    >
                        Recover
                    </button>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default RecoveryPage;
