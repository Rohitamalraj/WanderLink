// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract SimpleStaking {
    address public owner;
    mapping(address => mapping(address => uint256)) public allowances;
    mapping(address => uint256) public balances;
    
    event Approval(address indexed user, address indexed agent, uint256 amount);
    event StakedOnBehalf(address indexed user, address indexed agent, uint256 amount, uint256 tripId);
    
    constructor() {
        owner = msg.sender;
    }
    
    function approve(address agent, uint256 amount) external {
        allowances[msg.sender][agent] = amount;
        emit Approval(msg.sender, agent, amount);
    }
    
    function allowance(address user, address agent) external view returns (uint256) {
        return allowances[user][agent];
    }
    
    function stakeOnBehalf(address user, uint256 amount, uint256 tripId) external payable {
        require(allowances[user][msg.sender] >= amount, "Insufficient allowance");
        require(msg.value == amount, "Amount mismatch");
        
        allowances[user][msg.sender] -= amount;
        balances[user] += amount;
        
        emit StakedOnBehalf(user, msg.sender, amount, tripId);
    }
    
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }
}
