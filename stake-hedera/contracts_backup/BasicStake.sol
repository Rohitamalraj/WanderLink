// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BasicStake
 * @dev Absolute minimal staking - no constructor params
 */
contract BasicStake {
    
    address public owner;
    mapping(address => uint256) public balances;
    
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    function stake() external payable {
        balances[msg.sender] += msg.value;
        emit Staked(msg.sender, msg.value);
    }
    
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawn(msg.sender, amount);
    }
}
