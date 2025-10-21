// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title TripEscrow
 * @notice Manages escrow for stranger trips with automated enforcement
 * @dev Holds stakes, enforces commitment, handles slashing and rewards
 */
contract TripEscrow is ReentrancyGuard, AccessControlEnumerable, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ORGANIZER_ROLE = keccak256("ORGANIZER_ROLE");

    enum TripStatus {
        Created,
        Active,
        Completed,
        Cancelled,
        Disputed
    }

    struct Trip {
        uint256 tripId;
        address organizer;
        uint256 stakeAmount;
        uint256 maxParticipants;
        uint256 startTime;
        uint256 endTime;
        TripStatus status;
        uint256 totalStaked;
        uint256 participantCount;
        bool emergencyFreeze;
    }

    struct Participant {
        address wallet;
        uint256 stakedAmount;
        bool hasJoined;
        bool hasConfirmed;
        bool isSlashed;
        bytes32 checkInProofHash;
        uint256 confirmationTime;
    }

    // State variables
    uint256 public tripCounter;
    mapping(uint256 => Trip) public trips;
    mapping(uint256 => mapping(address => Participant)) public participants;
    mapping(uint256 => address[]) public tripParticipants;

    // Configuration
    uint256 public constant CANCELLATION_WINDOW = 7 days;
    uint256 public constant SLASH_PERCENTAGE = 30; // 30% of stake
    uint256 public constant PLATFORM_FEE = 5; // 5% platform fee

    // Events
    event TripCreated(uint256 indexed tripId, address indexed organizer, uint256 stakeAmount);
    event ParticipantJoined(uint256 indexed tripId, address indexed participant, uint256 amount);
    event CheckInSubmitted(uint256 indexed tripId, address indexed participant, bytes32 proofHash);
    event TripCompleted(uint256 indexed tripId, uint256 totalReleased);
    event ParticipantSlashed(uint256 indexed tripId, address indexed participant, uint256 amount);
    event EmergencyFreeze(uint256 indexed tripId, address indexed initiator);
    event TripCancelled(uint256 indexed tripId, string reason);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Create a new trip escrow
     * @param _stakeAmount Required stake per participant
     * @param _maxParticipants Maximum number of participants
     * @param _startTime Trip start timestamp
     * @param _endTime Trip end timestamp
     */
    function createTrip(
        uint256 _stakeAmount,
        uint256 _maxParticipants,
        uint256 _startTime,
        uint256 _endTime
    ) external whenNotPaused returns (uint256) {
        require(_stakeAmount > 0, "Stake must be positive");
        require(_maxParticipants >= 3 && _maxParticipants <= 8, "Invalid participant count");
        require(_startTime > block.timestamp, "Start time must be future");
        require(_endTime > _startTime, "End time must be after start");

        tripCounter++;
        uint256 tripId = tripCounter;

        trips[tripId] = Trip({
            tripId: tripId,
            organizer: msg.sender,
            stakeAmount: _stakeAmount,
            maxParticipants: _maxParticipants,
            startTime: _startTime,
            endTime: _endTime,
            status: TripStatus.Created,
            totalStaked: 0,
            participantCount: 0,
            emergencyFreeze: false
        });

        _grantRole(ORGANIZER_ROLE, msg.sender);

        emit TripCreated(tripId, msg.sender, _stakeAmount);
        return tripId;
    }

    /**
     * @notice Join a trip by staking required amount
     * @param _tripId Trip to join
     */
    function joinTrip(uint256 _tripId) external payable nonReentrant whenNotPaused {
        Trip storage trip = trips[_tripId];
        require(trip.status == TripStatus.Created, "Trip not open for joining");
        require(msg.value == trip.stakeAmount, "Incorrect stake amount");
        require(trip.participantCount < trip.maxParticipants, "Trip is full");
        require(!participants[_tripId][msg.sender].hasJoined, "Already joined");
        require(block.timestamp < trip.startTime - CANCELLATION_WINDOW, "Too close to start");

        participants[_tripId][msg.sender] = Participant({
            wallet: msg.sender,
            stakedAmount: msg.value,
            hasJoined: true,
            hasConfirmed: false,
            isSlashed: false,
            checkInProofHash: bytes32(0),
            confirmationTime: 0
        });

        tripParticipants[_tripId].push(msg.sender);
        trip.participantCount++;
        trip.totalStaked += msg.value;

        // Activate trip when minimum participants join
        if (trip.participantCount >= 3) {
            trip.status = TripStatus.Active;
        }

        emit ParticipantJoined(_tripId, msg.sender, msg.value);
    }

    /**
     * @notice Submit signed check-in proof
     * @param _tripId Trip ID
     * @param _proofHash Keccak256 hash of signed location + timestamp
     */
    function confirmAttendance(uint256 _tripId, bytes32 _proofHash) external {
        Trip storage trip = trips[_tripId];
        require(trip.status == TripStatus.Active, "Trip not active");
        require(block.timestamp >= trip.startTime, "Trip not started");
        require(block.timestamp <= trip.endTime + 1 days, "Check-in window closed");

        Participant storage participant = participants[_tripId][msg.sender];
        require(participant.hasJoined, "Not a participant");
        require(!participant.hasConfirmed, "Already confirmed");

        participant.hasConfirmed = true;
        participant.checkInProofHash = _proofHash;
        participant.confirmationTime = block.timestamp;

        emit CheckInSubmitted(_tripId, msg.sender, _proofHash);
    }

    /**
     * @notice Complete trip and release funds after verification period
     * @param _tripId Trip to complete
     */
    function completeTrip(uint256 _tripId) external nonReentrant {
        Trip storage trip = trips[_tripId];
        require(trip.status == TripStatus.Active, "Trip not active");
        require(block.timestamp > trip.endTime + 2 days, "Verification period not over");
        require(!trip.emergencyFreeze, "Trip is frozen");

        trip.status = TripStatus.Completed;

        uint256 totalToDistribute = trip.totalStaked;
        uint256 platformFeeAmount = (totalToDistribute * PLATFORM_FEE) / 100;
        uint256 remainingAmount = totalToDistribute - platformFeeAmount;

        // Calculate confirmed vs slashed participants
        uint256 confirmedCount = 0;

        address[] memory participantList = tripParticipants[_tripId];
        for (uint256 i = 0; i < participantList.length; i++) {
            address participantAddr = participantList[i];
            Participant storage participant = participants[_tripId][participantAddr];

            if (participant.hasConfirmed) {
                confirmedCount++;
            } else if (!participant.isSlashed) {
                // Slash no-show participants - they forfeit their entire stake
                participant.isSlashed = true;
                uint256 slashAmount = (participant.stakedAmount * SLASH_PERCENTAGE) / 100;
                emit ParticipantSlashed(_tripId, participantAddr, slashAmount);
            }
        }

        require(confirmedCount > 0, "No confirmed participants");

        // All remaining funds (after platform fee) are distributed equally to confirmed participants
        // This includes the stakes from no-show participants who were slashed
        uint256 rewardPerParticipant = remainingAmount / confirmedCount;

        for (uint256 i = 0; i < participantList.length; i++) {
            address participantAddr = participantList[i];
            Participant storage participant = participants[_tripId][participantAddr];

            if (participant.hasConfirmed) {
                (bool success, ) = participantAddr.call{value: rewardPerParticipant}("");
                require(success, "Transfer failed");
            }
            // Note: Slashed participants forfeit their entire stake as penalty
            // The slashed amount is redistributed to confirmed participants
        }

        // Send platform fee to admin
        (bool feeSuccess, ) = payable(getRoleMember(ADMIN_ROLE, 0)).call{value: platformFeeAmount}("");
        require(feeSuccess, "Fee transfer failed");

        emit TripCompleted(_tripId, totalToDistribute);
    }

    /**
     * @notice Report incident and freeze escrow
     * @param _tripId Trip with incident
     */
    function reportIncident(uint256 _tripId) external {
        Trip storage trip = trips[_tripId];
        Participant storage participant = participants[_tripId][msg.sender];
        
        require(participant.hasJoined, "Not a participant");
        require(trip.status == TripStatus.Active, "Trip not active");
        require(!trip.emergencyFreeze, "Already frozen");

        trip.emergencyFreeze = true;
        trip.status = TripStatus.Disputed;

        emit EmergencyFreeze(_tripId, msg.sender);
    }

    /**
     * @notice Admin function to manually slash a participant after investigation
     * @param _tripId Trip ID
     * @param _participant Address to slash
     */
    function slashUser(uint256 _tripId, address _participant) external onlyRole(ADMIN_ROLE) {
        Trip storage trip = trips[_tripId];
        require(trip.status == TripStatus.Disputed, "Trip not in dispute");

        Participant storage participant = participants[_tripId][_participant];
        require(participant.hasJoined, "Not a participant");
        require(!participant.isSlashed, "Already slashed");

        participant.isSlashed = true;
        uint256 slashAmount = participant.stakedAmount;

        // Distribute slashed amount to other participants
        uint256 participantCount = trip.participantCount - 1;
        if (participantCount > 0) {
            uint256 rewardPerParticipant = slashAmount / participantCount;
            address[] memory participantList = tripParticipants[_tripId];

            for (uint256 i = 0; i < participantList.length; i++) {
                if (participantList[i] != _participant) {
                    (bool success, ) = participantList[i].call{value: rewardPerParticipant}("");
                    require(success, "Reward transfer failed");
                }
            }
        }

        emit ParticipantSlashed(_tripId, _participant, slashAmount);
    }

    /**
     * @notice Cancel trip and refund all participants (before trip starts)
     * @param _tripId Trip to cancel
     * @param _reason Cancellation reason
     */
    function cancelTrip(uint256 _tripId, string calldata _reason) external {
        Trip storage trip = trips[_tripId];
        require(msg.sender == trip.organizer || hasRole(ADMIN_ROLE, msg.sender), "Not authorized");
        require(trip.status == TripStatus.Created || trip.status == TripStatus.Active, "Cannot cancel");
        require(block.timestamp < trip.startTime, "Trip already started");

        trip.status = TripStatus.Cancelled;

        // Refund all participants
        address[] memory participantList = tripParticipants[_tripId];
        for (uint256 i = 0; i < participantList.length; i++) {
            address participantAddr = participantList[i];
            Participant storage participant = participants[_tripId][participantAddr];

            if (participant.stakedAmount > 0) {
                (bool success, ) = participantAddr.call{value: participant.stakedAmount}("");
                require(success, "Refund failed");
                participant.stakedAmount = 0;
            }
        }

        emit TripCancelled(_tripId, _reason);
    }

    /**
     * @notice Emergency pause all operations
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause operations
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @notice Get trip participants list
     */
    function getTripParticipants(uint256 _tripId) external view returns (address[] memory) {
        return tripParticipants[_tripId];
    }

    /**
     * @notice Get participant details
     */
    function getParticipant(uint256 _tripId, address _participant) 
        external 
        view 
        returns (Participant memory) 
    {
        return participants[_tripId][_participant];
    }

    /**
     * @notice Get trip details
     */
    function getTrip(uint256 _tripId) external view returns (Trip memory) {
        return trips[_tripId];
    }
}
