// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleStake
 * @dev Minimal multi-user staking for Hedera - no strings, minimal gas
 */
contract SimpleStake {
    
    address public owner;
    address public validator;
    
    mapping(bytes32 => address[]) public poolParticipants;
    mapping(bytes32 => uint256) public poolTotal;
    mapping(bytes32 => bool) public poolActive;
    mapping(bytes32 => mapping(address => uint256)) public contributions;
    mapping(bytes32 => mapping(address => bool)) public verified;
    
    event PoolCreated(bytes32 indexed poolId, uint256 total);
    event Deposited(bytes32 indexed poolId, address indexed user, uint256 amount);
    event Verified(bytes32 indexed poolId, address indexed user);
    event Released(bytes32 indexed poolId, uint256 total);
    
    constructor(address _validator) {
        owner = msg.sender;
        validator = _validator;
    }
    
    function createPool(bytes32 poolId, address[] memory participants) external payable {
        require(!poolActive[poolId], "Pool exists");
        poolParticipants[poolId] = participants;
        poolTotal[poolId] = msg.value;
        poolActive[poolId] = true;
        emit PoolCreated(poolId, msg.value);
    }
    
    function deposit(bytes32 poolId) external payable {
        require(poolActive[poolId], "Not active");
        contributions[poolId][msg.sender] += msg.value;
        poolTotal[poolId] += msg.value;
        emit Deposited(poolId, msg.sender, msg.value);
    }
    
    function verify(bytes32 poolId, address user) external {
        require(msg.sender == validator, "Only validator");
        verified[poolId][user] = true;
        emit Verified(poolId, user);
    }
    
    function release(bytes32 poolId) external {
        require(poolActive[poolId], "Not active");
        address[] memory participants = poolParticipants[poolId];
        for (uint i = 0; i < participants.length; i++) {
            require(verified[poolId][participants[i]], "Not verified");
        }
        uint256 total = poolTotal[poolId];
        poolActive[poolId] = false;
        for (uint i = 0; i < participants.length; i++) {
            uint256 amount = contributions[poolId][participants[i]];
            if (amount > 0) {
                payable(participants[i]).transfer(amount);
            }
        }
        emit Released(poolId, total);
    }
    
    function getPool(bytes32 poolId) external view returns (address[] memory, uint256, bool) {
        return (poolParticipants[poolId], poolTotal[poolId], poolActive[poolId]);
    }
}
