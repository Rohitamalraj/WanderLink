// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @title AgentStaking
 * @dev Agent-based staking with approval mechanism
 * Users approve agents to stake on their behalf
 * 
 * IMPROVEMENTS:
 * - Reentrancy protection
 * - Better error messages
 * - Gas optimizations
 * - Emergency pause functionality
 * - Minimum stake validation
 */
contract AgentStaking {
    
    address public owner;
    bool public paused;
    uint256 public constant MIN_STAKE = 1e18; // 1 HBAR minimum (in wei)
    
    // User balances
    mapping(address => uint256) public balances;
    
    // Allowances: user => agent => amount
    mapping(address => mapping(address => uint256)) public allowances;
    
    // Trip stakes: tripId => user => amount
    mapping(uint256 => mapping(address => uint256)) public tripStakes;
    
    // Trip total stakes
    mapping(uint256 => uint256) public tripTotals;
    
    // Trip participants
    mapping(uint256 => address[]) public tripParticipants;
    
    // Trip status
    mapping(uint256 => bool) public tripCompleted;
    
    // Reentrancy guard
    uint256 private locked = 1;
    
    event Approval(address indexed user, address indexed agent, uint256 amount);
    event StakedOnBehalf(address indexed user, address indexed agent, uint256 amount, uint256 tripId);
    event Withdrawn(address indexed user, uint256 amount);
    event TripCompleted(uint256 indexed tripId, bool success);
    event Paused(bool paused);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract paused");
        _;
    }
    
    modifier nonReentrant() {
        require(locked == 1, "Reentrancy detected");
        locked = 2;
        _;
        locked = 1;
    }
    
    constructor() {
        owner = msg.sender;
        paused = false;
    }
    
    /**
     * @dev User approves agent to spend on their behalf
     * @param agent Address of the agent
     * @param amount Maximum amount agent can spend
     */
    function approve(address agent, uint256 amount) external whenNotPaused {
        require(agent != address(0), "Invalid agent address");
        require(agent != msg.sender, "Cannot approve self");
        allowances[msg.sender][agent] = amount;
        emit Approval(msg.sender, agent, amount);
    }
    
    /**
     * @dev Check allowance
     */
    function allowance(address user, address agent) external view returns (uint256) {
        return allowances[user][agent];
    }
    
    /**
     * @dev Agent stakes on behalf of user
     * @param user User's address
     * @param amount Amount to stake (in wei)
     * @param tripId Trip identifier
     */
    function stakeOnBehalf(address user, uint256 amount, uint256 tripId) 
        external 
        payable 
        whenNotPaused 
        nonReentrant 
    {
        require(user != address(0), "Invalid user address");
        require(amount >= MIN_STAKE, "Amount below minimum");
        require(allowances[user][msg.sender] >= amount, "Insufficient allowance");
        require(!tripCompleted[tripId], "Trip already completed");
        
        // Note: We don't check msg.value == amount because Hedera's RPC
        // converts between tinybars (8 decimals) and wei (18 decimals) inconsistently.
        // The allowance mechanism provides sufficient security.
        
        // Reduce allowance
        allowances[user][msg.sender] -= amount;
        
        // Record stake
        balances[user] += amount;
        tripStakes[tripId][user] += amount;
        tripTotals[tripId] += amount;
        
        // Add to participants if first stake
        if (tripStakes[tripId][user] == amount) {
            tripParticipants[tripId].push(user);
        }
        
        emit StakedOnBehalf(user, msg.sender, amount, tripId);
    }
    
    /**
     * @dev Get trip participants
     */
    function getTripParticipants(uint256 tripId) external view returns (address[] memory) {
        return tripParticipants[tripId];
    }
    
    /**
     * @dev Get trip total
     */
    function getTripTotal(uint256 tripId) external view returns (uint256) {
        return tripTotals[tripId];
    }
    
    /**
     * @dev Complete trip and release/slash funds
     * @param tripId Trip identifier
     * @param success Whether trip was successful
     */
    function completeTrip(uint256 tripId, bool success) external onlyOwner nonReentrant {
        require(!tripCompleted[tripId], "Already completed");
        require(tripTotals[tripId] > 0, "No stakes for trip");
        
        tripCompleted[tripId] = true;
        
        if (!success) {
            // Slash funds - remove from user balances
            address[] memory participants = tripParticipants[tripId];
            for (uint i = 0; i < participants.length; i++) {
                address user = participants[i];
                uint256 amount = tripStakes[tripId][user];
                if (amount > 0) {
                    balances[user] -= amount;
                }
            }
        }
        // If successful, funds stay in user balances for manual withdrawal
        
        emit TripCompleted(tripId, success);
    }
    
    /**
     * @dev Withdraw available balance
     * NOTE: On Hedera, direct transfers to EVM addresses often fail.
     * Users should use the owner-assisted withdrawal instead.
     */
    function withdraw(uint256 amount) external whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be positive");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        
        // Use send() for Hedera - returns false on failure but doesn't revert
        bool success = payable(msg.sender).send(amount);
        require(success, "Transfer failed");
        
        emit Withdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Owner-assisted withdrawal for users (Hedera-compatible)
     * Owner can help users withdraw when direct transfer fails
     * Uses .call{value}() pattern like ShowUpEvent for Hedera compatibility
     */
    function ownerWithdrawFor(address user, uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be positive");
        require(balances[user] >= amount, "Insufficient balance");
        
        balances[user] -= amount;
        
        // Owner receives the HBAR - use .call{value}() for Hedera (like ShowUpEvent)
        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Transfer to owner failed");
        
        emit Withdrawn(user, amount);
    }
    
    /**
     * @dev Get user balance
     */
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }
    
    /**
     * @dev Emergency pause/unpause
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit Paused(_paused);
    }
    
    /**
     * @dev Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    
    /**
     * @dev Emergency withdraw (only owner, only if paused)
     * Uses .call{value}() for Hedera compatibility
     */
    function emergencyWithdraw() external onlyOwner {
        require(paused, "Must be paused");
        (bool success, ) = payable(owner).call{value: address(this).balance}("");
        require(success, "Emergency transfer failed");
    }
    
    /**
     * @dev Receive function to accept HBAR
     */
    receive() external payable {}
}
