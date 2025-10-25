// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StakingEscrow
 * @dev Escrow contract for multi-user staking with location verification
 * Deployed on Hedera Network
 */
contract StakingEscrow {
    
    struct StakePool {
        address[] participants;
        mapping(address => uint256) contributions;
        mapping(address => string) requiredLocations;
        mapping(address => bool) locationVerified;
        uint256 totalAmount;
        uint256 negotiatedAmount;
        bool isActive;
        bool isReleased;
        uint256 createdAt;
    }
    
    mapping(bytes32 => StakePool) public stakePools;
    
    address public owner;
    address public validatorAgent;
    
    event PoolCreated(bytes32 indexed poolId, address[] participants, uint256 totalAmount);
    event FundsLocked(bytes32 indexed poolId, address indexed user, uint256 amount);
    event LocationVerified(bytes32 indexed poolId, address indexed user, string location);
    event FundsReleased(bytes32 indexed poolId, address indexed user, uint256 amount);
    event PoolNegotiated(bytes32 indexed poolId, uint256 originalAmount, uint256 negotiatedAmount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    modifier onlyValidator() {
        require(msg.sender == validatorAgent, "Only validator can call this");
        _;
    }
    
    constructor(address _validatorAgent) {
        owner = msg.sender;
        validatorAgent = _validatorAgent;
    }
    
    /**
     * @dev Create a new staking pool for multiple users
     * @param poolId Unique identifier for the pool
     * @param participants Array of participant addresses
     * @param amounts Array of contribution amounts
     * @param locations Array of required locations for each participant
     */
    function createPool(
        bytes32 poolId,
        address[] memory participants,
        uint256[] memory amounts,
        string[] memory locations
    ) external payable {
        require(participants.length == amounts.length, "Participants and amounts length mismatch");
        require(participants.length == locations.length, "Participants and locations length mismatch");
        require(participants.length >= 2, "Need at least 2 participants");
        require(!stakePools[poolId].isActive, "Pool already exists");
        
        StakePool storage pool = stakePools[poolId];
        pool.isActive = true;
        pool.createdAt = block.timestamp;
        
        uint256 totalContributions = 0;
        
        for (uint i = 0; i < participants.length; i++) {
            pool.participants.push(participants[i]);
            pool.contributions[participants[i]] = amounts[i];
            pool.requiredLocations[participants[i]] = locations[i];
            pool.locationVerified[participants[i]] = false;
            totalContributions += amounts[i];
        }
        
        require(msg.value == totalContributions, "Sent value doesn't match total contributions");
        
        pool.totalAmount = totalContributions;
        pool.negotiatedAmount = totalContributions; // Will be updated after negotiation
        
        emit PoolCreated(poolId, participants, totalContributions);
    }
    
    /**
     * @dev Lock funds for a specific user in the pool
     * @param poolId Pool identifier
     * @param user User address
     */
    function lockFunds(bytes32 poolId, address user) external payable {
        StakePool storage pool = stakePools[poolId];
        require(pool.isActive, "Pool not active");
        require(pool.contributions[user] > 0, "User not in pool");
        require(msg.value == pool.contributions[user], "Incorrect amount");
        
        emit FundsLocked(poolId, user, msg.value);
    }
    
    /**
     * @dev Update negotiated amount after agent negotiation
     * @param poolId Pool identifier
     * @param negotiatedAmount New amount after negotiation
     */
    function updateNegotiatedAmount(
        bytes32 poolId,
        uint256 negotiatedAmount
    ) external onlyValidator {
        StakePool storage pool = stakePools[poolId];
        require(pool.isActive, "Pool not active");
        require(negotiatedAmount <= pool.totalAmount, "Negotiated amount too high");
        
        pool.negotiatedAmount = negotiatedAmount;
        
        emit PoolNegotiated(poolId, pool.totalAmount, negotiatedAmount);
    }
    
    /**
     * @dev Verify location for a user
     * @param poolId Pool identifier
     * @param user User address
     * @param location Verified location
     */
    function verifyLocation(
        bytes32 poolId,
        address user,
        string memory location
    ) external onlyValidator {
        StakePool storage pool = stakePools[poolId];
        require(pool.isActive, "Pool not active");
        require(pool.contributions[user] > 0, "User not in pool");
        
        // In production, add location matching logic
        pool.locationVerified[user] = true;
        
        emit LocationVerified(poolId, user, location);
    }
    
    /**
     * @dev Release funds to a user after location verification
     * @param poolId Pool identifier
     * @param user User address
     */
    function releaseFunds(bytes32 poolId, address user) external {
        StakePool storage pool = stakePools[poolId];
        require(pool.isActive, "Pool not active");
        require(pool.locationVerified[user], "Location not verified");
        require(pool.contributions[user] > 0, "No funds to release");
        
        // Calculate user's share of negotiated amount
        uint256 userShare = (pool.contributions[user] * pool.negotiatedAmount) / pool.totalAmount;
        
        pool.contributions[user] = 0; // Prevent re-entrancy
        
        payable(user).transfer(userShare);
        
        emit FundsReleased(poolId, user, userShare);
        
        // Check if all users have withdrawn
        bool allWithdrawn = true;
        for (uint i = 0; i < pool.participants.length; i++) {
            if (pool.contributions[pool.participants[i]] > 0) {
                allWithdrawn = false;
                break;
            }
        }
        
        if (allWithdrawn) {
            pool.isActive = false;
            pool.isReleased = true;
        }
    }
    
    /**
     * @dev Get pool information
     */
    function getPoolInfo(bytes32 poolId) external view returns (
        address[] memory participants,
        uint256 totalAmount,
        uint256 negotiatedAmount,
        bool isActive,
        bool isReleased
    ) {
        StakePool storage pool = stakePools[poolId];
        return (
            pool.participants,
            pool.totalAmount,
            pool.negotiatedAmount,
            pool.isActive,
            pool.isReleased
        );
    }
    
    /**
     * @dev Get user's contribution and verification status
     */
    function getUserInfo(bytes32 poolId, address user) external view returns (
        uint256 contribution,
        string memory requiredLocation,
        bool locationVerified
    ) {
        StakePool storage pool = stakePools[poolId];
        return (
            pool.contributions[user],
            pool.requiredLocations[user],
            pool.locationVerified[user]
        );
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw(bytes32 poolId) external onlyOwner {
        StakePool storage pool = stakePools[poolId];
        require(pool.isActive, "Pool not active");
        
        pool.isActive = false;
        
        // Return funds to all participants
        for (uint i = 0; i < pool.participants.length; i++) {
            address participant = pool.participants[i];
            uint256 amount = pool.contributions[participant];
            if (amount > 0) {
                pool.contributions[participant] = 0;
                payable(participant).transfer(amount);
            }
        }
    }
    
    /**
     * @dev Update validator agent address
     */
    function updateValidator(address newValidator) external onlyOwner {
        validatorAgent = newValidator;
    }
    
    receive() external payable {}
}
