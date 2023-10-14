// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {BitMaps} from "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract AirDropToken is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Burnable,
    Ownable
{
    enum Stages {
        AcceptMinting,
        PreMinting,
        PostMinting,
        NoSupply
    }

    bytes32 private immutable merkleRoot;
    BitMaps.BitMap private whitelistClaimed;
    BitMaps.BitMap private didWithdraw;

    mapping(address => Stages) public stage = Stages.AcceptMinting;

    mapping(address => uint256) public creationBlock;
    uint256 public revealBlockNumber;
    bool public revealed;
    mapping(address => bytes32) public commitment;
    mapping(address => uint256) public nftAllocations;

    event CommitmentSubmitted(bytes32 commitment);
    event AllocationRevealed(address recipient, uint256 nftID);

    // modifier onlyBeforeReveal() {
    //     require(block.number < revealBlockNumber, "Reveal period has ended.");
    //     _;
    // }

    // modifier onlyAfterReveal() {
    //     require(
    //         block.number >= revealBlockNumber,
    //         "Reveal period has not started yet."
    //     );
    //     _;
    // }

    modifier atStage(Stages _stage) {
        require(stage == _stage);
        _;
    }

    modifier transitionAfter() {
        _;
        nextStage();
    }

    modifier timedTransitions() {
        if (
            stage == Stages.PreMinting && now >= creationBlock + 10
        ) {
            nextStage();
        }
        _;
    }

    constructor(
        bytes32 _merkleRoot,
        address initialOwner
    ) ERC721("AirDropToken", "ADT") Ownable(initialOwner) {
        revealBlockNumber = block.number + 10; // Reveal 10 blocks later
        revealed = false;
        merkleRoot = _merkleRoot;
    }

    function safeMint(
        address to,
        uint256 tokenId,
        string memory uri
    ) public onlyOwner {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
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

    function whitelistMint(bytes32[] calldata proof, uint tokenId) external timedTransitions transitionAfter atStage(Stages.AcceptMinting) {
        // check if already claimed
        require(
            !BitMaps.get(whitelistClaimed, uint(uint160(msg.sender))),
            "Address already claimed"
        );
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(
            MerkleProof.verify(proof, merkleRoot, leaf),
            "Invalid Merkle Proof."
        );
        BitMaps.setTo(whitelistClaimed, uint(uint160(msg.sender)),true);

        bytes32 _commitment = keccak256(abi.encodePacked(tokenId));
        submitCommitment(_commitment);
    }

    function submitCommitment(
        bytes32 _commitment
    ) public onlyBeforeReveal timedTransitions atStage(Stages.PreMinting) {
        commitment[msg.sender] = _commitment;
        emit CommitmentSubmitted(_commitment);
    }

    function reveal(uint256 _tokenId) external onlyAfterReveal timedTransitions atStage(Stages.PostMinting) {
        require(keccak256(abi.encodePacked(_tokenId)) == commitment[msg.sender], "Invalid reveal.");
        require(!revealedTokens[_tokenId], "Token already revealed.");

        _mint(msg.sender, tokenId);
        allocatedTokens[msg.sender] = tokenId;
        revealedTokens[tokenId] = true;
    }

    function withdraw(uint256 _tokenId) external onlyAfterReveal timedTransitions atStage(Stages.PostMinting) {
        require(
            BitMaps.get(whitelistClaimed, uint(uint160(msg.sender))),
            "Address is not in the whitelist"
        );
        require(
            !BitMaps.get(didWithdraw, uint(uint160(msg.sender))),
            "Address already withdrawn"
        );
        BitMaps.setTo(didWithdraw, uint(uint160(msg.sender)),true);
        _burn(tokenId);
        (bool success,_) = payable(msg.sender).call{value:1 ether}("");
        require(success,"Transfer failed");
    }

    function getAllocation() public view returns (uint256) {
        return nftAllocations[msg.sender];
    }

    function canReveal() public view returns (bool) {
        return block.number >= revealBlockNumber && !revealed;
    }
}
