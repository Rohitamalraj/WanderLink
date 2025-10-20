// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title TripNFT
 * @notice Commemorative NFT minted after successful trip completion
 * @dev Stores trip metadata and verification proofs on-chain
 */
contract TripNFT is ERC721, Ownable {
    using Strings for uint256;

    struct TripMetadata {
        uint256 tokenId;
        uint256 tripId;
        address traveler;
        string destination;
        uint256 startDate;
        uint256 endDate;
        uint256 synergyScore;
        bytes32 verificationProofHash;
        string[] mediaHashes; // IPFS/Lighthouse hashes
        uint256 mintedAt;
    }

    // State
    uint256 private _tokenIdCounter;
    mapping(uint256 => TripMetadata) public tripMetadata;
    mapping(address => uint256[]) public travelerTrips;
    
    string private _baseTokenURI;

    // Events
    event TripNFTMinted(
        uint256 indexed tokenId,
        uint256 indexed tripId,
        address indexed traveler,
        string destination
    );

    constructor(string memory baseURI) ERC721("WanderLink Trip Memory", "WMTRIP") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }

    /**
     * @notice Mint a TripNFT after successful trip completion
     * @param _traveler Traveler address
     * @param _tripId Trip ID from TripEscrow
     * @param _destination Trip destination
     * @param _startDate Trip start timestamp
     * @param _endDate Trip end timestamp
     * @param _synergyScore Group compatibility score (0-100)
     * @param _proofHash Hash of verification proofs
     * @param _mediaHashes Array of IPFS/Lighthouse media hashes
     */
    function mintTripNFT(
        address _traveler,
        uint256 _tripId,
        string memory _destination,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _synergyScore,
        bytes32 _proofHash,
        string[] memory _mediaHashes
    ) external onlyOwner returns (uint256) {
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(_traveler, tokenId);

        tripMetadata[tokenId] = TripMetadata({
            tokenId: tokenId,
            tripId: _tripId,
            traveler: _traveler,
            destination: _destination,
            startDate: _startDate,
            endDate: _endDate,
            synergyScore: _synergyScore,
            verificationProofHash: _proofHash,
            mediaHashes: _mediaHashes,
            mintedAt: block.timestamp
        });

        travelerTrips[_traveler].push(tokenId);

        emit TripNFTMinted(tokenId, _tripId, _traveler, _destination);
        return tokenId;
    }

    /**
     * @notice Get all trips for a traveler
     */
    function getTravelerTrips(address _traveler) external view returns (uint256[] memory) {
        return travelerTrips[_traveler];
    }

    /**
     * @notice Get trip metadata
     */
    function getTripMetadata(uint256 _tokenId) external view returns (TripMetadata memory) {
        require(ownerOf(_tokenId) != address(0), "Token does not exist");
        return tripMetadata[_tokenId];
    }

    /**
     * @notice Update base URI for metadata
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @notice Get token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return string(abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json"));
    }

    /**
     * @notice Get total trips minted
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
}
