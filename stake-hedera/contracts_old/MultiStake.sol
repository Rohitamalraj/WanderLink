// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MultiStake
 * @dev Simplified multi-user staking contract for Hedera
 * Avoids nested mappings in structs which cause high gas costs
 */
contract MultiStake {
    
    address public owner;
    address public validator;
    
    // Separate mappings instead of nested in struct
    mapping(bytes32 => address[]) public poolParticipants;
    mapping(bytes32 => uint256) public poolTotalAmount;
    mapping(bytes32 => bool) public poolActive;
    mapping(bytes32 => bool) public poolReleased;
    mapping(bytes32 => uint256) public poolCreatedAt;
    
    // User contributions per pool
    mapping(bytes32 => mapping(address => uint256)) public contributions;
    mapping(bytes32 => mapping(address => string)) public locations;
    mapping(bytes32 => mapping(address => bool)) public verified;
    
    event PoolCreated(bytes32 indexed poolId, address[] participants, uint256 totalAmount);
    event FundsDeposited(bytes32 indexed poolId, address indexed user, uint256 amount);
    event LocationVerified(bytes32 indexed poolId, address indexed user);
    event FundsReleased(bytes32 indexed poolId, uint256 totalAmount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyValidator() {
        require(msg.sender == validator, "Only validator");
        _;
    }
    
    constructor(address _validator) {
        owner = msg.sender;
        validator = _validator;
    }
    
    function setValidator(address _validator) external onlyOwner {
        validator = _validator;
    }
    
    function createPool(
        bytes32 poolId,
        address[] memory participants,
        uint256[] memory amounts,
        string[] memory userLocations
    ) external payable {
        require(!poolActive[poolId], "Pool exists");
        require(participants.length > 0, "Need participants");
        require(participants.length == amounts.length, "Length mismatch");
        require(participants.length == userLocations.length, "Length mismatch");
        
        poolParticipants[poolId] = participants;
        poolTotalAmount[poolId] = msg.value;
        poolActive[poolId] = true;
        poolCreatedAt[poolId] = block.timestamp;
        
        for (uint i = 0; i < participants.length; i++) {
            contributions[poolId][participants[i]] = amounts[i];
            locations[poolId][participants[i]] = userLocations[i];
        }
        
        emit PoolCreated(poolId, participants, msg.value);
    }
    
    function depositFunds(bytes32 poolId) external payable {
        require(poolActive[poolId], "Pool not active");
        
        contributions[poolId][msg.sender] += msg.value;
        poolTotalAmount[poolId] += msg.value;
        
        emit FundsDeposited(poolId, msg.sender, msg.value);
    }
    
    function verifyLocation(bytes32 poolId, address user) external onlyValidator {
        require(poolActive[poolId], "Pool not active");
        verified[poolId][user] = true;
        emit LocationVerified(poolId, user);
    }
    
    function releaseFunds(bytes32 poolId) external {
        require(poolActive[poolId], "Pool not active");
        require(!poolReleased[poolId], "Already released");
        
        address[] memory participants = poolParticipants[poolId];
        
        // Check all verified
        for (uint i = 0; i < participants.length; i++) {
            require(verified[poolId][participants[i]], "Not all verified");
        }
        
        poolReleased[poolId] = true;
        uint256 totalAmount = poolTotalAmount[poolId];
        
        // Distribute funds
        for (uint i = 0; i < participants.length; i++) {
            address participant = participants[i];
            uint256 amount = contributions[poolId][participant];
            
            if (amount > 0) {
                payable(participant).transfer(amount);
            }
        }
        
        emit FundsReleased(poolId, totalAmount);
    }
    
    function getPoolInfo(bytes32 poolId) external view returns (
        address[] memory participants,
        uint256 totalAmount,
        bool isActive,
        bool isReleased,
        uint256 createdAt
    ) {
        return (
            poolParticipants[poolId],
            poolTotalAmount[poolId],
            poolActive[poolId],
            poolReleased[poolId],
            poolCreatedAt[poolId]
        );
    }
    
    function getUserInfo(bytes32 poolId, address user) external view returns (
        uint256 contribution,
        string memory location,
        bool isVerified
    ) {
        return (
            contributions[poolId][user],
            locations[poolId][user],
            verified[poolId][user]
        );
    }
}
