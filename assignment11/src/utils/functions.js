const bip39 = require('bip39');
const EC = require('elliptic').ec;
const ripemd160 = require('ripemd160');
const sha256 = require('sha256');
const axios = require('axios');
const ethereumjs_common = require('ethereumjs-common').default;
import * as crypto from 'crypto';
import { Transaction } from 'ethereumjs-tx';
import { publicToAddress, toChecksumAddress } from 'ethereumjs-util';
const { wordlist } = require("ethereum-cryptography/bip39/wordlists/english");
const secp256k1 = require('secp256k1');

// Ethereum JSON-RPC URL
const goerliNodeUrl = process.env.NEXT_PUBLIC_GOERLI_URL;
const sepoliaNodeUrl = process.env.NEXT_PUBLIC_SEPOLIA_URL;
const maxPriorityFeePerGas = 5 * 10 ** 9;


export default async function createAccount() {
    // Generate a new Ethereum private key
    const privateKey = crypto.randomBytes(32);
    // Derive the public key from the private key
    if (!secp256k1.privateKeyVerify(privateKey)) {
        console.error('Invalid private key');
        process.exit(1);
    }
    // Derive the public key from the private key
    const publicKey = secp256k1.publicKeyCreate(privateKey, false);

    // Calculate the Ethereum address from the public key
    const addressBuffer = publicToAddress(Buffer.from(publicKey), true); // true for RLP encoding
    const address = toChecksumAddress('0x' + addressBuffer.toString('hex'));

    // Generate the mnemonic phrase using BIP39
    const mnemonic = bip39.entropyToMnemonic(privateKey, wordlist);

    const user = {
        privateKey: Buffer.from(privateKey).toString('hex'),
        publicKey: Buffer.from(publicKey).toString("hex"),
        address,
        mnemonic
    };
    return user;
}

export async function getBalance(address, network) {
    const user = JSON.parse(localStorage.getItem('user'));
    const balanceTX = await axios.post(network == 'goerli' ? goerliNodeUrl : sepoliaNodeUrl, {
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1,
    });
    const balance = parseInt(balanceTX.data.result, 16) / 10 ** 18;
    return balance;
}

export async function sendERC20Tokens(fromAddress, privateKey, contractAddress, toAddress, value, network) {

    // Function signature for the transferFrom function
    const functionSignature = "0xa9059cbb";

    const nonce = await getNonce(fromAddress, network);
    // Data for the transferFrom function
    const data = functionSignature + // ERC-20 transfer function signature
        '000000000000000000000000' + toAddress.substr(2) + // Recipient address without '0x'
        value.toString().padStart(64, '0'); // Padding for the amount
    const gasPriceResponse = await axios.post(network == 'goerli' ? goerliNodeUrl : sepoliaNodeUrl, {
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: 1,
    });

    const gasPrice = gasPriceResponse.data.result;
    const transactionData = {
        nonce,
        from: fromAddress,
        to: contractAddress,
        gasPrice: '0x', // Set gasPrice to '0x' for EIP-1559 transactions
        maxFeePerGas: gasPrice + maxPriorityFeePerGas, // Example maxFeePerGas (in Wei)
        maxPriorityFeePerGas: maxPriorityFeePerGas, // Example maxPriorityFeePerGas (in Wei)
        value: '0x0',
        data: data,
    };
    const common = ethereumjs_common.forCustomChain('mainnet', { networkId: 11155111, chainId: 11155111, name: 'sepolia' }, 'petersburg');
    const transaction = new Transaction(transactionData, { "common": common });
    // const tx = new EthereumTx(rawTransaction, { chain: 'mainnet', hardfork: 'petersburg' })
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    const privateKeyBufferWith0x = Buffer.concat([Buffer.from('0x'), privateKeyBuffer]);

    transaction.sign(privateKeyBuffer);
    const signedTransaction = '0x' + Buffer.from(transaction.serialize()).toString('hex');
    console.log('Signed Transaction:', signedTransaction);
    axios.post(network == 'goerli' ? goerliNodeUrl : sepoliaNodeUrl, {
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [signedTransaction],
        id: 1,
    })
        .then((response) => {
            const txHash = response.data.result;
            console.log(`Transaction Hash: ${txHash}`);
        })
        .catch((error) => {
            console.error('Error sending ERC-20 transaction:', error);
        });

}
async function approve721(fromAddress, contractAddress, privateKey, tokenId, network) {
    const nonce = await getNonce(fromAddress, network);
    // Data for the transferFrom function
    const data = '0x095ea7b3' +
        '000000000000000000000000' + contractAddress.substr(2) + // Recipient address without '0x'
        '000000000000000000000000000000000000000000000000000000000000000' + tokenId; // Padding for the amount
    const gasPriceResponse = await axios.post(network == 'goerli' ? goerliNodeUrl : sepoliaNodeUrl, {
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: 1,
    });

    const gasPrice = gasPriceResponse.data.result;
    const transactionData = {
        nonce,
        from: fromAddress,
        to: contractAddress,
        gasPrice: '0x', // Set gasPrice to '0x' for EIP-1559 transactions
        maxFeePerGas: gasPrice + maxPriorityFeePerGas, // Example maxFeePerGas (in Wei)
        maxPriorityFeePerGas: maxPriorityFeePerGas, // Example maxPriorityFeePerGas (in Wei)
        value: '0x0',
        data: data,
    };

    const common = ethereumjs_common.forCustomChain('mainnet', { networkId: 11155111, chainId: 11155111, name: 'sepolia' }, 'petersburg');
    const transaction = new Transaction(transactionData, { "common": common });
    // const tx = new EthereumTx(rawTransaction, { chain: 'mainnet', hardfork: 'petersburg' })
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    const privateKeyBufferWith0x = Buffer.concat([Buffer.from('0x'), privateKeyBuffer]);

    transaction.sign(privateKeyBuffer);
    const signedTransaction = '0x' + Buffer.from(transaction.serialize()).toString('hex');
    console.log('Signed Transaction:', signedTransaction);
    const response = await axios.post(network == 'goerli' ? goerliNodeUrl : sepoliaNodeUrl, {
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [signedTransaction],
        id: 1,
    });
    const txHash = response.data.result;
    return txHash;
}

async function approve1155(fromAddress, contractAddress, privateKey, network) {
    const nonce = await getNonce(fromAddress, network);
    // Data for the transferFrom function
    const data = '0xa22cb465' +
        '000000000000000000000000' + contractAddress.substr(2) + // Recipient address without '0x'
        '0000000000000000000000000000000000000000000000000000000000000001'; // Padding for the amount
    const gasPriceResponse = await axios.post(network == 'goerli' ? goerliNodeUrl : sepoliaNodeUrl, {
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: 1,
    });

    const gasPrice = gasPriceResponse.data.result;
    const transactionData = {
        nonce,
        from: fromAddress,
        to: contractAddress,
        gasPrice: '0x', // Set gasPrice to '0x' for EIP-1559 transactions
        maxFeePerGas: gasPrice + maxPriorityFeePerGas, // Example maxFeePerGas (in Wei)
        maxPriorityFeePerGas: maxPriorityFeePerGas, // Example maxPriorityFeePerGas (in Wei)
        value: '0x0',
        data: data,
    };

    const common = ethereumjs_common.forCustomChain('mainnet', { networkId: 11155111, chainId: 11155111, name: 'sepolia' }, 'petersburg');
    const transaction = new Transaction(transactionData, { "common": common });
    // const tx = new EthereumTx(rawTransaction, { chain: 'mainnet', hardfork: 'petersburg' })
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    const privateKeyBufferWith0x = Buffer.concat([Buffer.from('0x'), privateKeyBuffer]);

    transaction.sign(privateKeyBuffer);
    const signedTransaction = '0x' + Buffer.from(transaction.serialize()).toString('hex');
    const response = await axios.post(network == 'goerli' ? goerliNodeUrl : sepoliaNodeUrl, {
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [signedTransaction],
        id: 1,
    });
    const txHash = response.data.result;
    return txHash;
}

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export async function sendERC721Tokens(fromAddress, privateKey, contractAddress, toAddress, tokenId, network) {
    let isApproved = false;
    const txHash = await approve721(fromAddress, contractAddress, privateKey, tokenId, network)
    while (!isApproved) {
        const response = await axios.post(network == 'goerli' ? goerliNodeUrl : sepoliaNodeUrl, {
            jsonrpc: '2.0',
            method: 'eth_getTransactionByHash',
            params: [txHash],
            id: 1,
        });
        const blockNum = response.data.result.blockHash;
        if (blockNum) {
            isApproved = true;
        } else {
            isApproved = false;
        }
        await sleep(6000);
    }
    // Function signature for the transferFrom function
    const functionSignature = "0x23b872dd";

    const nonce = await getNonce(fromAddress, network);
    // Data for the transferFrom function
    const data = functionSignature +
        fromAddress.substr(2).padStart(64, '0') + // Sender address, 32 bytes
        toAddress.substr(2).padStart(64, '0') + // Recipient address, 32 bytes
        tokenId.toString().padStart(64, '0'); // Token ID, 32 bytes
    const gasPriceResponse = await axios.post(network == 'goerli' ? goerliNodeUrl : sepoliaNodeUrl, {
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: 1,
    });

    const gasPrice = gasPriceResponse.data.result;
    const transactionData = {
        nonce,
        from: fromAddress,
        to: contractAddress,
        gasPrice: '0x', // Set gasPrice to '0x' for EIP-1559 transactions
        maxFeePerGas: gasPrice + maxPriorityFeePerGas, // Example maxFeePerGas (in Wei)
        maxPriorityFeePerGas: maxPriorityFeePerGas, // Example maxPriorityFeePerGas (in Wei)
        value: '0x0',
        data: data,
    };

    const common = ethereumjs_common.forCustomChain('mainnet', { networkId: 11155111, chainId: 11155111, name: 'sepolia' }, 'petersburg');
    const transaction = new Transaction(transactionData, { "common": common });
    // const tx = new EthereumTx(rawTransaction, { chain: 'mainnet', hardfork: 'petersburg' })
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    const privateKeyBufferWith0x = Buffer.concat([Buffer.from('0x'), privateKeyBuffer]);

    transaction.sign(privateKeyBuffer);
    const signedTransaction = '0x' + Buffer.from(transaction.serialize()).toString('hex');
    axios.post(network == 'goerli' ? goerliNodeUrl : sepoliaNodeUrl, {
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [signedTransaction],
        id: 1,
    })
        .then((response) => {
            const txHash = response.data.result;
            console.log(`Transaction Hash: ${txHash}`);
        })
        .catch((error) => {
            console.error('Error sending ERC-721 transaction:', error);
        });

}

export async function sendERC1155Tokens(fromAddress, privateKey, contractAddress, toAddress, tokenId, value, network) {

    let isApproved = false;
    const txHash = await approve1155(fromAddress, contractAddress, privateKey, network)
    while (!isApproved) {
        const response = await axios.post(network == 'goerli' ? goerliNodeUrl : sepoliaNodeUrl, {
            jsonrpc: '2.0',
            method: 'eth_getTransactionByHash',
            params: [txHash],
            id: 1,
        });
        const blockNum = response.data.result.blockHash;
        if (blockNum) {
            isApproved = true;
        } else {
            isApproved = false;
        }
        await sleep(6000);
    }
    // Function signature for the transferFrom function
    const functionSignature = "0xf242432a";

    const nonce = await getNonce(fromAddress, network);
    // Data for the transferFrom function
    const data = functionSignature +
        fromAddress.substr(2).padStart(64, '0') + // Sender address, 32 bytes
        toAddress.substr(2).padStart(64, '0') + // Recipient address, 32 bytes
        tokenId.padStart(64, '0') + // Token ID, 32 bytes
        value.padStart(64, '0') + // value, 32 bytes
        '00000000000000000000000000000000000000000000000000000000000000a0' +
        '0000000000000000000000000000000000000000000000000000000000000001' +
        '0000000000000000000000000000000000000000000000000000000000000000';
    const gasPriceResponse = await axios.post(network == 'goerli' ? goerliNodeUrl : sepoliaNodeUrl, {
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: 1,
    });

    const gasPrice = gasPriceResponse.data.result;
    const transactionData = {
        nonce,
        from: fromAddress,
        to: contractAddress,
        gasPrice: '0x', // Set gasPrice to '0x' for EIP-1559 transactions
        maxFeePerGas: gasPrice + maxPriorityFeePerGas, // Example maxFeePerGas (in Wei)
        maxPriorityFeePerGas: maxPriorityFeePerGas, // Example maxPriorityFeePerGas (in Wei)
        value: '0x0',
        data: data,
    };

    const common = ethereumjs_common.forCustomChain('mainnet', { networkId: 11155111, chainId: 11155111, name: 'sepolia' }, 'petersburg');
    const transaction = new Transaction(transactionData, { "common": common });
    // const tx = new EthereumTx(rawTransaction, { chain: 'mainnet', hardfork: 'petersburg' })
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    const privateKeyBufferWith0x = Buffer.concat([Buffer.from('0x'), privateKeyBuffer]);

    transaction.sign(privateKeyBuffer);
    const signedTransaction = '0x' + Buffer.from(transaction.serialize()).toString('hex');
    console.log('Signed Transaction:', signedTransaction);
    axios.post(network == 'goerli' ? goerliNodeUrl : sepoliaNodeUrl, {
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [signedTransaction],
        id: 1,
    })
        .then((response) => {
            const txHash = response.data.result;
            console.log(`Transaction Hash: ${txHash}`);
        })
        .catch((error) => {
            console.error('Error sending ERC-1155 transaction:', error);
        });

}

export async function getTokenBalances(address, tokens, network) {
    // ERC-20 balanceOf function signature
    const balanceOfFunctionSignature = '0x70a08231';

    // Build the data payload for the eth_call
    const data2 = balanceOfFunctionSignature + '000000000000000000000000' + address.substr(2);
    let tokenBalances = [];
    for (let i = 0; i < tokens.length; i++) {
        // JSON-RPC payload for eth_call
        const rpcData = {
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
                {
                    to: tokens[i].address,
                    data: data2,
                },
                'latest',
            ],
            id: 1,
        };

        // Make the HTTP request to the Ethereum node
        const response = await axios.post(network == 'goerli' ? goerliNodeUrl : sepoliaNodeUrl, rpcData);
        const balanceHex = response.data.result;
        const balanceWei = parseInt(balanceHex, 16); // Convert hex to decimal
        const tokenBalance = {
            name: tokens[i].name,
            balance: balanceWei
        };
        tokenBalances.push(tokenBalance);
    }

    return tokenBalances;
}

export async function getERC1155TokenBalances(address, tokens, network) {
    // Function signature for the transferFrom function
    const functionSignature = "0x00fdd58e";

    let tokenBalances = [];
    if (tokens.length > 0) {
        for (let i = 0; i < tokens.length; i++) {
            // Data for the transferFrom function
            const data = functionSignature +
                address.substr(2).padStart(64, '0') + // Sender address, 32 bytes
                tokens[i].id?.toString().padStart(64, '0');
            // JSON-RPC payload for eth_call
            const rpcData = {
                jsonrpc: '2.0',
                method: 'eth_call',
                params: [
                    {
                        to: tokens[i].address,
                        data: data,
                    },
                    'latest',
                ],
                id: 1,
            };

            // Make the HTTP request to the Ethereum node
            const response = await axios.post(network == 'goerli' ? goerliNodeUrl : sepoliaNodeUrl, rpcData);
            const balanceHex = response.data.result;
            const balanceWei = parseInt(balanceHex, 16); // Convert hex to decimal
            const tokenBalance = {
                id: tokens[i].id,
                name: tokens[i].name,
                balance: balanceWei
            };
            tokenBalances.push(tokenBalance);
        }
    }
    return tokenBalances;
}

// Example: Fund the new account with some Ether (if you control an Ethereum node)
export async function fundAccount(fundingAddress, privateKey, valueInWei, address, network) {

    const nonce = await getNonce(fundingAddress, network);
    const gasPriceResponse = await axios.post(network == 'goerli' ? goerliNodeUrl : sepoliaNodeUrl, {
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: 1,
    });

    const gasPrice = gasPriceResponse.data.result;
    const rawTransaction = {
        nonce: nonce,
        gasPrice: gasPrice,
        gasLimit: '0x5208', // Typical gas limit for a standard Ether transfer
        from: fundingAddress,
        to: address,
        value: '0x' + valueInWei.toString(16),
        data: '0x'
    };
    const common = ethereumjs_common.forCustomChain('mainnet', { networkId: 11155111, chainId: 11155111, name: 'sepolia' }, 'petersburg');
    const transaction = new Transaction(rawTransaction, { "common": common });
    // const tx = new EthereumTx(rawTransaction, { chain: 'mainnet', hardfork: 'petersburg' })

    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    const privateKeyBufferWith0x = Buffer.concat([Buffer.from('0x'), privateKeyBuffer]);

    transaction.sign(privateKeyBuffer);
    const signedTransaction = '0x' + Buffer.from(transaction.serialize()).toString('hex');
    console.log('Signed Transaction:', signedTransaction);
    const sendTransactionResponse = await axios.post(network == 'goerli' ? goerliNodeUrl : sepoliaNodeUrl, {
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [signedTransaction],
        id: 1,
    });

    const txHash = sendTransactionResponse;

    console.log('Funded with Ether:', txHash);
}

// Helper function to get the nonce for a given address
async function getNonce(address, network) {
    const response = await sendEthRPCRequest('eth_getTransactionCount', [address, 'latest'], network);
    return parseInt(response, 16);
}

// Helper function to send an Ethereum RPC request
async function sendEthRPCRequest(method, params, network) {
    const requestData = {
        jsonrpc: '2.0',
        method: method,
        params: params,
        id: 1,
    };

    const response = await axios.post(network == 'goerli' ? goerliNodeUrl : sepoliaNodeUrl, requestData, {
        headers: {
            'Content-Type': 'application/json',
        },
    });


    const responseData = await response.data.result;

    return responseData;
}

