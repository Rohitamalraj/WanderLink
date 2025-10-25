// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

/**
 * @title HederaEscrow
 * @dev Escrow contract compatible with Hedera
 */
contract HederaEscrow {
    
    address public owner;
    address public validator;
    uint256 public totalStaked;
    
    mapping(address => uint256) public balances;
    
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event ValidatorSet(address indexed validator);
    
    constructor() public {
        owner = msg.sender;
        validator = msg.sender;
    }
    
    function setValidator(address _validator) external {
        require(msg.sender == owner, "Only owner");
        validator = _validator;
        emit ValidatorSet(_validator);
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
        msg.sender.transfer(amount);
        emit Withdrawn(msg.sender, amount);
    }
    
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }
    
    function getTotalStaked() external view returns (uint256) {
        return totalStaked;
    }
}
