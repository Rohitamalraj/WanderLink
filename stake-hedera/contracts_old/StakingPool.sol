// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StakingPool
 * @dev Multi-user staking pool with location verification for Hedera
 */
contract StakingPool {
    
    struct Pool {
        address[] participants;
        mapping(address => uint256) contributions;
        mapping(address => string) locations;
        mapping(address => bool) verified;
        uint256 totalAmount;
        bool isActive;
        bool isReleased;
        uint256 createdAt;
    }
    
    mapping(bytes32 => Pool) public pools;
    
    address public owner;
    address public validator;
    
    event PoolCreated(bytes32 indexed poolId, address[] participants, uint256 totalAmount);
    event FundsDeposited(bytes32 indexed poolId, address indexed user, uint256 amount);
    event LocationVerified(bytes32 indexed poolId, address indexed user);
    event FundsReleased(bytes32 indexed poolId, address indexed user, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyValidator() {
        require(msg.sender == validator, "Only validator");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        validator = msg.sender;
    }
    
    function setValidator(address _validator) external onlyOwner {
        validator = _validator;
    }
    
    function createPool(
        bytes32 poolId,
        address[] memory participants,
        string[] memory locations
    ) external payable {
        require(participants.length > 0, "Need participants");
        require(participants.length == locations.length, "Length mismatch");
        require(!pools[poolId].isActive, "Pool exists");
        
        Pool storage pool = pools[poolId];
        pool.participants = participants;
        pool.totalAmount = msg.value;
        pool.isActive = true;
        pool.createdAt = block.timestamp;
        
        for (uint i = 0; i < participants.length; i++) {
            pool.locations[participants[i]] = locations[i];
        }
        
        emit PoolCreated(poolId, participants, msg.value);
    }
    
    function depositFunds(bytes32 poolId) external payable {
        Pool storage pool = pools[poolId];
        require(pool.isActive, "Pool not active");
        
        pool.contributions[msg.sender] += msg.value;
        pool.totalAmount += msg.value;
        
        emit FundsDeposited(poolId, msg.sender, msg.value);
    }
    
    function verifyLocation(bytes32 poolId, address user) external onlyValidator {
        Pool storage pool = pools[poolId];
        require(pool.isActive, "Pool not active");
        
        pool.verified[user] = true;
        
        emit LocationVerified(poolId, user);
    }
    
    function releaseFunds(bytes32 poolId) external {
        Pool storage pool = pools[poolId];
        require(pool.isActive, "Pool not active");
        require(!pool.isReleased, "Already released");
        
        // Check all participants verified
        for (uint i = 0; i < pool.participants.length; i++) {
            require(pool.verified[pool.participants[i]], "Not all verified");
        }
        
        pool.isReleased = true;
        
        // Distribute funds proportionally
        for (uint i = 0; i < pool.participants.length; i++) {
            address participant = pool.participants[i];
            uint256 amount = pool.contributions[participant];
            
            if (amount > 0) {
                payable(participant).transfer(amount);
                emit FundsReleased(poolId, participant, amount);
            }
        }
    }
    
    function getPoolInfo(bytes32 poolId) external view returns (
        address[] memory participants,
        uint256 totalAmount,
        bool isActive,
        bool isReleased
    ) {
        Pool storage pool = pools[poolId];
        return (
            pool.participants,
            pool.totalAmount,
            pool.isActive,
            pool.isReleased
        );
    }
    
    function getUserContribution(bytes32 poolId, address user) external view returns (uint256) {
        return pools[poolId].contributions[user];
    }
    
    function isUserVerified(bytes32 poolId, address user) external view returns (bool) {
        return pools[poolId].verified[user];
    }
}
