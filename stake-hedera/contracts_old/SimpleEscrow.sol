// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @title SimpleEscrow
 * @dev Simplified escrow contract for testing deployment
 */
contract SimpleEscrow {
    
    address public owner;
    address public validatorAgent;
    uint256 public totalStaked;
    
    mapping(address => uint256) public balances;
    
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    
    constructor() {
        owner = msg.sender;
        validatorAgent = msg.sender;
    }
    
    function setValidator(address _validator) external {
        require(msg.sender == owner, "Only owner");
        validatorAgent = _validator;
    }
    
    function stake() external payable {
        require(msg.value > 0, "Must stake positive amount");
        balances[msg.sender] += msg.value;
        totalStaked += msg.value;
        emit Staked(msg.sender, msg.value);
    }
    
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        totalStaked -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawn(msg.sender, amount);
    }
    
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }
}
