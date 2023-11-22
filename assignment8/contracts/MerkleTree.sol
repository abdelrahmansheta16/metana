// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {BitMaps} from "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "hardhat/console.sol";

contract AirDropToken is ERC721, ERC721Burnable, ERC721Enumerable, Ownable {
    error CustomError(string message);

    enum Stages {
        PreMinting,
        PostMinting,
        NoSupply
    }

    bytes32 private immutable merkleRoot;
    BitMaps.BitMap private whitelistClaimed;
    BitMaps.BitMap private revealedTokens;
    BitMaps.BitMap private allocatedTokens;
    BitMaps.BitMap private didWithdraw;

    Stages public stage = Stages.PreMinting;
    mapping(address => uint) public memberIndex;
    mapping(address => uint256) public creationBlock;
    address[] public mintedTokens;
    mapping(address => uint256) public revealBlockNumber;
    uint256 public numOfWhiteListMembers;
    uint public totalSupplyLimit;
    bool public revealed;
    mapping(address => bytes32) public commitment;
    mapping(address => uint256) public nftAllocations;

    event CommitmentSubmitted(bytes32 commitment);
    event AllocationRevealed(address recipient, uint256 nftID);

    modifier onlyBeforeReveal() {
        if (
            block.number > revealBlockNumber[msg.sender] ||
            revealBlockNumber[msg.sender] == 0
        ) {
            revert CustomError("Airdrop has been already revealed");
        }
        _;
    }

    modifier onlyAfterReveal() {
        if (
            block.number < revealBlockNumber[msg.sender] ||
            revealBlockNumber[msg.sender] == 0
        ) {
            revert CustomError(
                "You can't claim tokens before the airdrop was revealed"
            );
        }
        _;
    }

    modifier atStage(Stages _stage) {
        if (stage != _stage) {
            revert CustomError("Wrong Stage!");
        }
        _;
    }

    modifier timedTransitions() {
        _;
        if (
            stage == Stages.PreMinting &&
            mintedTokens.length >= numOfWhiteListMembers
        ) {
            nextStage();
        } else if (
            stage == Stages.PostMinting &&
            mintedTokens.length >= totalSupplyLimit
        ) {
            nextStage();
        }
    }

    constructor(
        bytes32 _merkleRoot,
        uint _totalSupplyLimit,
        uint _numOfWhiteListMembers
    ) payable ERC721("AirDropToken", "ADT") Ownable(msg.sender) {
        revealed = false;
        totalSupplyLimit = _totalSupplyLimit;
        merkleRoot = _merkleRoot;
        numOfWhiteListMembers = _numOfWhiteListMembers;
    }

    // Transfer multiple NFTs to another address.
    function transferMultiple(address to, uint256[] memory tokenIds) external {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            if (ownerOf(tokenId) != msg.sender) {
                revert CustomError(
                    "Only the owner of this token can perform this action"
                );
            }
            if (to == address(0) || to == address(this)) {
                revert CustomError("Cannot send to zero or contract address");
            }
            transferFrom(msg.sender, to, tokenId);
        }
    }

    function whitelistMint(
        bytes32[] calldata proof
    ) external timedTransitions atStage(Stages.PreMinting) {
        uint index = uint256(uint160(msg.sender));

        // check if already claimed
        if (BitMaps.get(whitelistClaimed, index)) {
            revert CustomError("Already Claimed!");
        }
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        if (!MerkleProof.verify(proof, merkleRoot, leaf)) {
            revert CustomError("Invalid Merkle Proof");
        }
        BitMaps.setTo(whitelistClaimed, index, true);
        mintedTokens.push(msg.sender);
        revealBlockNumber[msg.sender] = block.number + 10;
        submitCommitment(keccak256(abi.encodePacked(index)));
    }

    function normalMint()
        external
        timedTransitions
        atStage(Stages.PostMinting)
    {
        uint index = uint256(uint160(msg.sender));
        mintedTokens.push(msg.sender);
        revealBlockNumber[msg.sender] = block.number + 10;
        submitCommitment(keccak256(abi.encodePacked(index)));
    }

    function submitCommitment(bytes32 _commitment) private onlyBeforeReveal {
        commitment[msg.sender] = _commitment;
        emit CommitmentSubmitted(_commitment);
    }

    function reveal() external onlyAfterReveal {
        uint tokenId = block.prevrandao;
        if (
            keccak256(abi.encodePacked(uint256(uint160(msg.sender)))) !=
            commitment[msg.sender]
        ) {
            revert CustomError("Incorrect Commitment");
        }
        if (BitMaps.get(revealedTokens, tokenId)) {
            revert CustomError("Token Already Revealed");
        }

        BitMaps.setTo(revealedTokens, tokenId, true);
        _safeMint(msg.sender, tokenId);
    }

    function withdraw(
        uint256 _tokenId
    ) external onlyAfterReveal timedTransitions atStage(Stages.PostMinting) {
        if (ownerOf(_tokenId) != msg.sender) {
            revert CustomError("Only the owner of this token can withdraw");
        }
        _burn(_tokenId);
        (bool success, ) = payable(msg.sender).call{value: 1 ether}("");
        if (!success) {
            revert CustomError("Failed to send Ether");
        }
    }

    function canReveal() public view returns (bool) {
        return block.number >= revealBlockNumber[msg.sender] && !revealed;
    }

    function nextStage() private {
        if (stage == Stages.NoSupply) {
            revert CustomError("Cannot transition from final state.");
        }
        stage = Stages(uint256(stage) + 1);
    }

    // The following functions are overrides required by Solidity.

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
