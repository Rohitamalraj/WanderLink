// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationSBT
 * @notice Soulbound Token (non-transferable) for traveler reputation
 * @dev Used for identity verification and reputation tracking
 */
contract ReputationSBT is ERC721, Ownable {
    enum VerificationTier {
        None,
        Basic,      // Email + WorldID
        Standard,   // Photo + WorldID
        Full        // Full KYC
    }

    struct TravelerProfile {
        uint256 tokenId;
        address wallet;
        VerificationTier tier;
        uint256 tripScore;
        uint256 completedTrips;
        uint256 totalStaked;
        bool isActive;
        uint256 createdAt;
        uint256 lastUpdated;
    }

    // State
    uint256 private _tokenIdCounter;
    mapping(uint256 => TravelerProfile) public profiles;
    mapping(address => uint256) public walletToTokenId;
    mapping(uint256 => bytes32) public encryptedKYCHash; // Lit Protocol encrypted data hash

    // Events
    event ProfileCreated(uint256 indexed tokenId, address indexed wallet, VerificationTier tier);
    event TierUpgraded(uint256 indexed tokenId, VerificationTier newTier);
    event ScoreUpdated(uint256 indexed tokenId, uint256 oldScore, uint256 newScore);
    event TripCompleted(uint256 indexed tokenId, uint256 tripId);

    constructor() ERC721("WanderLink Traveler", "WMTRVL") Ownable(msg.sender) {}

    /**
     * @notice Mint a new Verified Traveler SBT
     * @param _wallet Traveler's wallet address
     * @param _tier Verification tier
     * @param _kycHash Hash of encrypted KYC data
     */
    function mintVerifiedSBT(
        address _wallet,
        VerificationTier _tier,
        bytes32 _kycHash
    ) external onlyOwner returns (uint256) {
        require(walletToTokenId[_wallet] == 0, "SBT already exists");
        require(_tier != VerificationTier.None, "Invalid tier");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(_wallet, tokenId);

        profiles[tokenId] = TravelerProfile({
            tokenId: tokenId,
            wallet: _wallet,
            tier: _tier,
            tripScore: 100, // Starting score
            completedTrips: 0,
            totalStaked: 0,
            isActive: true,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp
        });

        walletToTokenId[_wallet] = tokenId;
        encryptedKYCHash[tokenId] = _kycHash;

        emit ProfileCreated(tokenId, _wallet, _tier);
        return tokenId;
    }

    /**
     * @notice Update traveler's reputation score
     * @param _wallet Traveler address
     * @param _delta Score change (can be negative)
     */
    function updateScore(address _wallet, int256 _delta) external onlyOwner {
        uint256 tokenId = walletToTokenId[_wallet];
        require(tokenId != 0, "Profile not found");

        TravelerProfile storage profile = profiles[tokenId];
        uint256 oldScore = profile.tripScore;

        if (_delta >= 0) {
            profile.tripScore += uint256(_delta);
        } else {
            uint256 decrease = uint256(-_delta);
            if (decrease >= profile.tripScore) {
                profile.tripScore = 0;
            } else {
                profile.tripScore -= decrease;
            }
        }

        // Cap at 1000
        if (profile.tripScore > 1000) {
            profile.tripScore = 1000;
        }

        profile.lastUpdated = block.timestamp;

        emit ScoreUpdated(tokenId, oldScore, profile.tripScore);
    }

    /**
     * @notice Record trip completion
     * @param _wallet Traveler address
     * @param _tripId Trip ID from TripEscrow
     * @param _stakeAmount Amount staked
     */
    function recordTripCompletion(
        address _wallet,
        uint256 _tripId,
        uint256 _stakeAmount
    ) external onlyOwner {
        uint256 tokenId = walletToTokenId[_wallet];
        require(tokenId != 0, "Profile not found");

        TravelerProfile storage profile = profiles[tokenId];
        profile.completedTrips++;
        profile.totalStaked += _stakeAmount;
        profile.lastUpdated = block.timestamp;

        emit TripCompleted(tokenId, _tripId);
    }

    /**
     * @notice Upgrade verification tier
     * @param _wallet Traveler address
     * @param _newTier New verification tier
     * @param _newKYCHash Updated KYC hash
     */
    function upgradeTier(
        address _wallet,
        VerificationTier _newTier,
        bytes32 _newKYCHash
    ) external onlyOwner {
        uint256 tokenId = walletToTokenId[_wallet];
        require(tokenId != 0, "Profile not found");

        TravelerProfile storage profile = profiles[tokenId];
        require(_newTier > profile.tier, "Can only upgrade");

        profile.tier = _newTier;
        profile.lastUpdated = block.timestamp;
        encryptedKYCHash[tokenId] = _newKYCHash;

        emit TierUpgraded(tokenId, _newTier);
    }

    /**
     * @notice Get traveler profile by wallet
     */
    function getProfile(address _wallet) external view returns (TravelerProfile memory) {
        uint256 tokenId = walletToTokenId[_wallet];
        require(tokenId != 0, "Profile not found");
        return profiles[tokenId];
    }

    /**
     * @notice Check if wallet has verified SBT
     */
    function isVerified(address _wallet) external view returns (bool) {
        return walletToTokenId[_wallet] != 0;
    }

    /**
     * @notice Get verification tier
     */
    function getVerificationTier(address _wallet) external view returns (VerificationTier) {
        uint256 tokenId = walletToTokenId[_wallet];
        if (tokenId == 0) return VerificationTier.None;
        return profiles[tokenId].tier;
    }

    /**
     * @notice Override transfer to make soulbound (non-transferable)
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        // Allow minting and burning, but not transfers
        if (from != address(0) && to != address(0)) {
            revert("SBT: Token is soulbound and non-transferable");
        }

        return super._update(to, tokenId, auth);
    }

    /**
     * @notice Disable approvals (soulbound tokens cannot be approved)
     */
    function approve(address /*to*/, uint256 /*tokenId*/) public pure override {
        revert("SBT: Approvals disabled for soulbound tokens");
    }

    /**
     * @notice Disable setApprovalForAll (soulbound tokens cannot be approved)
     */
    function setApprovalForAll(address /*operator*/, bool /*approved*/) public pure override {
        revert("SBT: Approvals disabled for soulbound tokens");
    }
}
