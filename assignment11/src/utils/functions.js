const bip39 = require('bip39');
const EC = require('elliptic').ec;
const ripemd160 = require('ripemd160');
const sha256 = require('sha256');
const axios = require('axios');
import * as ethers from 'ethers';
const ethereumjs_common = require('ethereumjs-common').default;
import * as crypto from 'crypto';
import { Transaction } from 'ethereumjs-tx';
import { publicToAddress, toChecksumAddress } from 'ethereumjs-util';
import getRandomWords, { wordList } from './wordlist';
const secp256k1 = require('secp256k1');
const keccak = require('keccak');

// Ethereum JSON-RPC URL
const ethereumNodeUrl = 'https://eth-sepolia.g.alchemy.com/v2/yhqIvHR4S-qbR4vQxPs6ZtLyEQL9kkNO';

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
    console.log(address)

    // Generate the mnemonic phrase using BIP39
    const mnemonic = bip39.entropyToMnemonic(privateKey, wordList);

    console.log('Generated Mnemonic Phrase:', mnemonic);
    const fundingAddress = '0x059035c23fA0B47cF7e81Dd0d9c2d3AD2EA18e01';
    const valueInWei = 1000000000000000;
    await fundAccount(fundingAddress, 'dec68c695698c57c05cd2aab7b731f16e091edb104cdb4256d381d251c53a4f3', valueInWei, address);
    const user = {
        privateKey: Buffer.from(privateKey).toString('hex'),
        publicKey: Buffer.from(publicKey).toString("hex"),
        address,
        mnemonic
    };
    return user;
}

export async function getBalance(address) {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log(user);
    const balanceTX = await axios.post(ethereumNodeUrl, {
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1,
    });
    const balance = parseInt(balanceTX.data.result, 16) / 10 ** 18;
    return balance;
}

export async function sendERC20Tokens(fromAddress, privateKey, contractAddress, toAddress, value) {

    // Function signature for the transferFrom function
    const functionSignature = ethers.id("transfer(address,uint256)").substring(0, 10);
    console.log("Function Signature:", functionSignature);

    const nonce = await getNonce(fromAddress);
    // Data for the transferFrom function
    const data = functionSignature + // ERC-20 transfer function signature
        '000000000000000000000000' + toAddress.substr(2) + // Recipient address without '0x'
        '0000000000000000000000000000000000000000000000000000000000000001'; // Padding for the amount
    console.log(data)
    const gasPriceResponse = await axios.post(ethereumNodeUrl, {
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
        gasPrice: gasPrice, // Example gas price (optional)
        gasLimit: '0xFFFF', // Example gas limit (optional)
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
    axios.post(ethereumNodeUrl, {
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [signedTransaction],
        id: 1,
    })
        .then((response) => {
            console.log(response)
            const txHash = response.data.result;
            console.log(`Transaction Hash: ${txHash}`);
        })
        .catch((error) => {
            console.log(error)
            console.error('Error sending ERC-20 transaction:', error);
        });

}
async function approve721(fromAddress, contractAddress, privateKey, tokenId) {
    const nonce = await getNonce(fromAddress);
    // Data for the transferFrom function
    const data = '0x095ea7b3' +
        '000000000000000000000000' + contractAddress.substr(2) + // Recipient address without '0x'
        '000000000000000000000000000000000000000000000000000000000000000' + tokenId; // Padding for the amount
    console.log(data)
    const gasPriceResponse = await axios.post(ethereumNodeUrl, {
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
        gasPrice: gasPrice, // Example gas price (optional)
        gasLimit: '0xFFFF', // Example gas limit (optional)
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
    const response = await axios.post(ethereumNodeUrl, {
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [signedTransaction],
        id: 1,
    });
    const txHash = response.data.result;
    console.log(txHash)
    return txHash;
}

async function approve1155(fromAddress, contractAddress, privateKey, tokenId) {
    const nonce = await getNonce(fromAddress);
    // Data for the transferFrom function
    const data = '0xa22cb465' +
        '000000000000000000000000' + contractAddress.substr(2) + // Recipient address without '0x'
        '0000000000000000000000000000000000000000000000000000000000000001'; // Padding for the amount
    console.log(data)
    const gasPriceResponse = await axios.post(ethereumNodeUrl, {
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
        gasPrice: gasPrice, // Example gas price (optional)
        gasLimit: '0xFFFF', // Example gas limit (optional)
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
    const response = await axios.post(ethereumNodeUrl, {
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [signedTransaction],
        id: 1,
    });
    const txHash = response.data.result;
    console.log(txHash)
    return txHash;
}

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export async function sendERC721Tokens(fromAddress, privateKey, contractAddress, toAddress, tokenId) {
    let isApproved = false;
    const txHash = await approve721(fromAddress, contractAddress, privateKey, tokenId)
    console.log(txHash)
    while (!isApproved) {
        const response = await axios.post(ethereumNodeUrl, {
            jsonrpc: '2.0',
            method: 'eth_getTransactionByHash',
            params: [txHash],
            id: 1,
        });
        console.log(response)
        const blockNum = response.data.result.blockHash;
        if (blockNum) {
            isApproved = true;
        } else {
            isApproved = false;
        }
        await sleep(6000);
    }
    // Function signature for the transferFrom function
    const functionSignature = ethers.id("transferFrom(address,address,uint256)").substring(0, 10);
    console.log("Function Signature:", functionSignature);

    const nonce = await getNonce(fromAddress);
    // Data for the transferFrom function
    const data = functionSignature +
        fromAddress.substr(2).padStart(64, '0') + // Sender address, 32 bytes
        toAddress.substr(2).padStart(64, '0') + // Recipient address, 32 bytes
        tokenId.toString().padStart(64, '0'); // Token ID, 32 bytes
    console.log(data)
    const gasPriceResponse = await axios.post(ethereumNodeUrl, {
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
        gasPrice: gasPrice, // Example gas price (optional)
        gasLimit: '0xFFFFF', // Example gas limit (optional)
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
    axios.post(ethereumNodeUrl, {
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [signedTransaction],
        id: 1,
    })
        .then((response) => {
            console.log(response)
            const txHash = response.data.result;
            console.log(`Transaction Hash: ${txHash}`);
        })
        .catch((error) => {
            console.log(error)
            console.error('Error sending ERC-721 transaction:', error);
        });

}

export async function sendERC1155Tokens(fromAddress, privateKey, contractAddress, toAddress, tokenId, value) {

    let isApproved = false;
    const txHash = await approve1155(fromAddress, contractAddress, privateKey, tokenId)
    console.log(txHash)
    while (!isApproved) {
        const response = await axios.post(ethereumNodeUrl, {
            jsonrpc: '2.0',
            method: 'eth_getTransactionByHash',
            params: [txHash],
            id: 1,
        });
        console.log(response)
        const blockNum = response.data.result.blockHash;
        if (blockNum) {
            isApproved = true;
        } else {
            isApproved = false;
        }
        await sleep(6000);
    }
    // Function signature for the transferFrom function
    const functionSignature = ethers.id("safeTransferFrom(address,address,uint256,uint256,bytes)").substring(0, 10);
    console.log("Function Signature:", functionSignature);

    const nonce = await getNonce(fromAddress);
    // Data for the transferFrom function
    const data = functionSignature +
        fromAddress.substr(2).padStart(64, '0') + // Sender address, 32 bytes
        toAddress.substr(2).padStart(64, '0') + // Recipient address, 32 bytes
        tokenId.padStart(64, '0') + // Token ID, 32 bytes
        value.padStart(64, '0') + // value, 32 bytes
        '00000000000000000000000000000000000000000000000000000000000000a0' +
        '0000000000000000000000000000000000000000000000000000000000000001' +
        '0000000000000000000000000000000000000000000000000000000000000000';
    console.log(data)
    const gasPriceResponse = await axios.post(ethereumNodeUrl, {
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
        gasPrice: gasPrice, // Example gas price (optional)
        gasLimit: '0xFFFFF', // Example gas limit (optional)
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
    axios.post(ethereumNodeUrl, {
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [signedTransaction],
        id: 1,
    })
        .then((response) => {
            console.log(response)
            const txHash = response.data.result;
            console.log(`Transaction Hash: ${txHash}`);
        })
        .catch((error) => {
            console.log(error)
            console.error('Error sending ERC-1155 transaction:', error);
        });

}
export async function getTokenBalance(address) {
    // Data for making the request to query token balances
    const data = JSON.stringify({
        jsonrpc: "2.0",
        method: "alchemy_getTokenBalances",
        headers: {
            "Content-Type": "application/json",
        },
        params: [`${address}`],
        id: 42,
    });

    // config object for making a request with axios
    const config = {
        method: "post",
        url: ethereumNodeUrl,
        headers: {
            "Content-Type": "application/json",
        },
        data: data,
    };

    // Make the request and print the formatted response:
    const res = await axios(config)
    return res.data.result.tokenBalances;
}

export async function getNFTBalance(address) {
    let data = JSON.stringify({
        "jsonrpc": "2.0",
        "id": 0,
        "method": "alchemy_getAssetTransfers",
        "params": [
            {
                "fromBlock": "0x0",
                "toBlock": "latest",
                "toAddress": address,
                "fromAddress": address,
                "excludeZeroValue": true,
                "withMetadata": true,
                "category": ["erc721", "erc1155"]
            }
        ]
    });


    var requestOptions = {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        data: data,
    };
    const baseURL = ethereumNodeUrl + '/getNFTs/';

    // Construct the axios request:
    var config = {
        method: 'get',
        url: `${baseURL}?owner=${address}`
    };
    const res = await axios(config);
    console.log(res)
    let erc721Token = [];
    let erc1155Token = [];
    // Print contract address and tokenId for each NFT:
    for (const events of res.data.ownedNfts) {
        const token = {
            id: parseInt(events.id.tokenId, 16).toString(),
            contractAddress: events.contract.address
        };
        if (events.contractMetadata.tokenType == "ERC721") {
            erc721Token.push(token);
            console.log("ERC-721 Token: ID- ", parseInt(events.id.tokenId, 16).toString(), " Contract- ", events.contract.address);
        }
        else {
            erc1155Token.push(token);
            console.log("ERC-1155 Token: ID- ", parseInt(events.id.tokenId, 16).toString(), " Contract- ", events.contract.address);
        }
    }
    return {
        erc721Token, erc1155Token
    }
}
const generatePrivateKey = () => {
    const privateKey = crypto.randomBytes(32);
    console.log('Private Key:', privateKey.toString('hex'));
    return privateKey;
}

const generatePublicKey = (privateKey) => {
    const ec = new EC('secp256k1'); // for Bitcoin-like cryptocurrencies
    const key = ec.keyFromPrivate(privateKey);

    const publicKey = key.getPublic();
    console.log('Public Key:', publicKey.encode('hex'));
    return publicKey;
}

const generateAddress = (publicKey) => {

    const publicKeyBuffer = Buffer.from(publicKey.encode('hex'), 'hex');
    const hash1 = sha256(publicKeyBuffer);
    const hash2 = new ripemd160().update(Buffer.from(hash1, 'hex')).digest('hex');

    // Prepend '0x' for Ethereum address format
    const address = '0x' + hash2;
    console.log('Account Address:', address);
    return address;
}

const generateMnemonic = (derivedPrivateKeyHex) => {

    // Check if the private key is a valid 256-bit (32-byte) hexadecimal string
    // if (derivedPrivateKeyHex.length !== 64 || !/^[0-9a-fA-F]+$/.test(derivedPrivateKeyHex)) {
    //     console.error('Invalid private key format');
    //     return;
    // }

    // Convert the private key to a buffer
    const derivedPrivateKeyBuffer = Buffer.from(derivedPrivateKeyHex, 'hex');

    // Generate the mnemonic phrase using BIP39
    const mnemonic = bip39.entropyToMnemonic(derivedPrivateKeyBuffer);

    console.log('Generated Mnemonic Phrase:', mnemonic);
    return mnemonic;
}

// Example: Fund the new account with some Ether (if you control an Ethereum node)
export async function fundAccount(fundingAddress, privateKey, valueInWei, address) {

    const nonce = await getNonce(fundingAddress);
    console.log(nonce)
    const gasPriceResponse = await axios.post(ethereumNodeUrl, {
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: 1,
    });

    const gasPrice = gasPriceResponse.data.result;
    console.log(gasPrice)
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
    const sendTransactionResponse = await axios.post(ethereumNodeUrl, {
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [signedTransaction],
        id: 1,
    });

    const txHash = sendTransactionResponse;

    console.log('Funded with Ether:', txHash);
}

// Helper function to get the nonce for a given address
async function getNonce(address) {
    console.log(address)
    const response = await sendEthRPCRequest('eth_getTransactionCount', [address, 'latest']);
    console.log(response)
    return parseInt(response, 16);
}

// Helper function to send an Ethereum RPC request
async function sendEthRPCRequest(method, params) {
    const requestData = {
        jsonrpc: '2.0',
        method: method,
        params: params,
        id: 1,
    };

    const response = await axios.post(ethereumNodeUrl, requestData, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    console.log('Response:', response);

    const responseData = await response.data.result;
    console.log(responseData)

    return responseData;
}

// Helper function to send a raw transaction
async function sendRawTransaction(serializedTx) {
    const response = await sendEthRPCRequest('eth_sendRawTransaction', [serializedTx]);
    return response.result;
}
