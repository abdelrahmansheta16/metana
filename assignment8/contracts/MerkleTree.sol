// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {BitMaps} from "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "hardhat/console.sol";

contract AirDropToken is ERC721, ERC721Burnable, Ownable {
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
    uint public totalSupply;
    bool public revealed;
    mapping(address => bytes32) public commitment;
    mapping(address => uint256) public nftAllocations;

    event CommitmentSubmitted(bytes32 commitment);
    event AllocationRevealed(address recipient, uint256 nftID);

    modifier onlyBeforeReveal() {
        require(
            block.number < revealBlockNumber[msg.sender],
            "Reveal period has ended."
        );
        _;
    }

    modifier onlyAfterReveal() {
        require(
            block.number >= revealBlockNumber[msg.sender],
            "Reveal period has not started yet."
        );
        _;
    }

    modifier atStage(Stages _stage) {
        require(stage == _stage);
        _;
    }

    modifier timedTransitions() {
        if (
            stage == Stages.PreMinting &&
            mintedTokens.length >= numOfWhiteListMembers
        ) {
            nextStage();
        } else if (
            stage == Stages.PostMinting && mintedTokens.length >= totalSupply
        ) {
            nextStage();
        }
        _;
    }

    constructor(
        bytes32 _merkleRoot,
        uint _totalSupply,
        address[] memory whitelist
    ) ERC721("AirDropToken", "ADT") Ownable(msg.sender) {
        setWhiteList(whitelist);
        revealed = false;
        totalSupply = _totalSupply;
        merkleRoot = _merkleRoot;
        numOfWhiteListMembers = whitelist.length;
    }

    function setWhiteList(address[] memory _whitelist) private {
        for (uint i = 0; i < _whitelist.length; i++) {
            memberIndex[_whitelist[i]] = i;
        }
    }

    // Transfer multiple NFTs to another address.
    function transferMultiple(address to, uint256[] memory tokenIds) external {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(
                ownerOf(tokenId) == msg.sender,
                "You do not own this token."
            );
            require(
                to != address(0) && to != address(this),
                "Invalid address."
            );
            transferFrom(msg.sender, to, tokenId);
        }
    }

    function whitelistMint(
        bytes32[] calldata proof
    ) external timedTransitions atStage(Stages.PreMinting) {
        uint index = memberIndex[msg.sender];
        console.log("0 %d", index);

        // check if already claimed
        require(
            !BitMaps.get(whitelistClaimed, index),
            "Address already claimed"
        );
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(
            MerkleProof.verify(proof, merkleRoot, leaf),
            "Invalid Merkle Proof."
        );
        BitMaps.setTo(whitelistClaimed, index, true);
        mintedTokens.push(msg.sender);
        revealBlockNumber[msg.sender] = block.number + 10;
        submitCommitment(keccak256(abi.encodePacked(index)));
        _safeMint(msg.sender, index);
    }

    function normalMint()
        external
        timedTransitions
        atStage(Stages.PostMinting)
    {
        uint index = memberIndex[msg.sender];
        // check if already claimed
        mintedTokens[index] = msg.sender;
        revealBlockNumber[msg.sender] = block.number + 10;
        submitCommitment(keccak256(abi.encodePacked(index)));
        _safeMint(msg.sender, index);
    }

    function submitCommitment(
        bytes32 _commitment
    ) private onlyBeforeReveal atStage(Stages.PreMinting) {
        commitment[msg.sender] = _commitment;
        emit CommitmentSubmitted(_commitment);
    }

    function reveal(uint256 _tokenId) external onlyAfterReveal {
        require(
            keccak256(abi.encodePacked(_tokenId)) == commitment[msg.sender],
            "Invalid reveal."
        );
        require(memberIndex[msg.sender] == _tokenId, "Only owner can reveal");
        require(
            !BitMaps.get(revealedTokens, _tokenId),
            "Token already revealed"
        );

        BitMaps.setTo(revealedTokens, _tokenId, true);
    }

    function withdraw(
        uint256 _tokenId
    ) external onlyAfterReveal timedTransitions atStage(Stages.PostMinting) {
        require(
            BitMaps.get(whitelistClaimed, uint(uint160(msg.sender))),
            "Address is not in the whitelist"
        );
        require(
            !BitMaps.get(didWithdraw, uint(uint160(msg.sender))),
            "Address already withdrawn"
        );
        BitMaps.setTo(didWithdraw, uint(uint160(msg.sender)), true);
        _burn(_tokenId);
        (bool success, ) = payable(msg.sender).call{value: 1 ether}("");
        require(success, "Transfer failed");
    }

    function getAllocation() public view returns (uint256) {
        return nftAllocations[msg.sender];
    }

    function canReveal() public view returns (bool) {
        return block.number >= revealBlockNumber[msg.sender] && !revealed;
    }

    function nextStage() private {
        require(
            stage != Stages.NoSupply,
            "Cannot transition from final state."
        );
        stage = Stages(uint256(stage) + 1);
    }
}
