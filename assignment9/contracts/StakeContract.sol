// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
interface MyNFT {
    function ownerOf(uint256 tokenId) external view returns (address);

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function setApprovalForAll(address operator, bool approved) external;
}

interface MyToken {
    function balanceOf(address account) external returns (uint256);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    function transfer(address to, uint256 amount) external returns (bool);

    function approveContract(
        address owner,
        address spender,
        uint256 amount
    ) external;

    function mint(address to, uint256 amount) external;
}

//StakingContract deployed to: 0xA36c2a9500F03394548ad62Ecf844fb98E5d084E
contract StakingContract {
    MyNFT nftContract;
    MyToken tokenContract;
    address private nftsHolder;
    uint256 public stakingDuration;
    uint256 public rewardAmount; // 10 tokens with 18 decimals

    mapping(address => uint256) public stakingTimestamp;
    mapping(uint256 => bool) public isDeposited;
    mapping(uint256 => address) public originalOwner;

    function initialize(
        address _stakingNFTAddress,
        address _erc20TokenAddress
    ) external {
        stakingDuration = 1 days;
        rewardAmount = 10 * 10 ** 18;
        nftContract = MyNFT(_stakingNFTAddress);
        tokenContract = MyToken(_erc20TokenAddress);
        nftsHolder = msg.sender;
    }

    // function onERC721Received(
    //     address ,
    //     address from,
    //     uint256 tokenId,
    //     bytes calldata
    // ) external returns (bytes4){
    //     originalOwner[tokenId] = from;
    //     return IERC721Receiver.onERC721Received.selector;
    // }

    function getNFT(uint256 tokenId) external {
        require(
            nftContract.ownerOf(tokenId) != msg.sender,
            "You already own this NFT"
        );
        require(
            stakingTimestamp[msg.sender] + stakingDuration <= block.timestamp,
            "Staking not available yet"
        );
        require(
            tokenContract.balanceOf(msg.sender) >= rewardAmount,
            "Not enough balance"
        );
        tokenContract.approveContract(msg.sender, address(this), rewardAmount);
        tokenContract.transferFrom(msg.sender, address(this), rewardAmount);
        nftContract.safeTransferFrom(nftsHolder, msg.sender, tokenId);
        stakingTimestamp[msg.sender] = block.timestamp;
    }

    function depositNFT(uint256 tokenId) external {
        require(
            nftContract.ownerOf(tokenId) == msg.sender,
            "You do not own this NFT"
        );
        require(!isDeposited[tokenId], "You already deposited this NFT");
        isDeposited[tokenId] = true;
        stakingTimestamp[msg.sender] = block.timestamp;
    }

    function withdrawTokens(uint256 tokenId) external {
        require(
            nftContract.ownerOf(tokenId) == msg.sender,
            "You do not own this NFT"
        );
        uint256 periods = (block.timestamp - stakingTimestamp[msg.sender]) /
            (5 seconds);
        require(periods > 0, "Withdrawal not available yet");
        require(isDeposited[tokenId], "You must deposit your NFT first");
        tokenContract.mint(msg.sender, rewardAmount * periods);
        stakingTimestamp[msg.sender] = block.timestamp;
    }

    function withdrawNFT(uint256 tokenId) external {
        require(
            nftContract.ownerOf(tokenId) == msg.sender,
            "You do not own this NFT"
        );
        isDeposited[tokenId] = false;
        nftContract.safeTransferFrom(address(this), msg.sender, tokenId);
    }

    function changeRewardAmount(uint256 _newRewardAmount) external {
        rewardAmount = _newRewardAmount;
    }

    function changeStakingDuration(uint256 _newStakingDuration) external {
        stakingDuration = _newStakingDuration;
    }
}
