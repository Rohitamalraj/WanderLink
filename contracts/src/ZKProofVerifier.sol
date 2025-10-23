// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ZKProofVerifier
 * @notice Stores and verifies zero-knowledge proofs for age verification
 * @dev This contract stores proof hashes on-chain while keeping actual data off-chain (IPFS/Lighthouse)
 */
contract ZKProofVerifier {
    
    // Struct to store proof metadata
    struct ProofMetadata {
        bytes32 proofHash;        // Hash of the proof data
        string lighthouseCID;     // IPFS/Lighthouse CID where full proof is stored
        uint256 timestamp;        // When the proof was submitted
        bool isVerified;          // Verification status
        uint256 expiresAt;        // Proof expiration timestamp
    }
    
    // Mapping from user address to their proof metadata
    mapping(address => ProofMetadata) public userProofs;
    
    // Mapping to track if a proof hash has been used (prevent replay)
    mapping(bytes32 => bool) public usedProofHashes;
    
    // Events
    event ProofSubmitted(
        address indexed user,
        bytes32 proofHash,
        string lighthouseCID,
        uint256 timestamp,
        uint256 expiresAt
    );
    
    event ProofVerified(
        address indexed user,
        bytes32 proofHash,
        uint256 timestamp
    );
    
    event ProofRevoked(
        address indexed user,
        bytes32 proofHash,
        uint256 timestamp
    );
    
    /**
     * @notice Submit a zero-knowledge proof on-chain
     * @param _proofHash Hash of the proof data (keccak256 of proof JSON)
     * @param _lighthouseCID IPFS/Lighthouse CID where full proof is stored
     * @param _expiresAt Timestamp when the proof expires
     */
    function submitProof(
        bytes32 _proofHash,
        string calldata _lighthouseCID,
        uint256 _expiresAt
    ) external {
        require(_proofHash != bytes32(0), "Invalid proof hash");
        require(bytes(_lighthouseCID).length > 0, "Invalid CID");
        require(_expiresAt > block.timestamp, "Proof already expired");
        require(!usedProofHashes[_proofHash], "Proof hash already used");
        
        // Store proof metadata
        userProofs[msg.sender] = ProofMetadata({
            proofHash: _proofHash,
            lighthouseCID: _lighthouseCID,
            timestamp: block.timestamp,
            isVerified: true,
            expiresAt: _expiresAt
        });
        
        // Mark proof hash as used
        usedProofHashes[_proofHash] = true;
        
        emit ProofSubmitted(
            msg.sender,
            _proofHash,
            _lighthouseCID,
            block.timestamp,
            _expiresAt
        );
        
        emit ProofVerified(msg.sender, _proofHash, block.timestamp);
    }
    
    /**
     * @notice Update an existing proof with a new one
     * @param _proofHash New proof hash
     * @param _lighthouseCID New Lighthouse CID
     * @param _expiresAt New expiration timestamp
     */
    function updateProof(
        bytes32 _proofHash,
        string calldata _lighthouseCID,
        uint256 _expiresAt
    ) external {
        require(userProofs[msg.sender].proofHash != bytes32(0), "No existing proof");
        require(_proofHash != bytes32(0), "Invalid proof hash");
        require(bytes(_lighthouseCID).length > 0, "Invalid CID");
        require(_expiresAt > block.timestamp, "Proof already expired");
        require(!usedProofHashes[_proofHash], "Proof hash already used");
        
        // Revoke old proof
        emit ProofRevoked(msg.sender, userProofs[msg.sender].proofHash, block.timestamp);
        
        // Update with new proof
        userProofs[msg.sender] = ProofMetadata({
            proofHash: _proofHash,
            lighthouseCID: _lighthouseCID,
            timestamp: block.timestamp,
            isVerified: true,
            expiresAt: _expiresAt
        });
        
        usedProofHashes[_proofHash] = true;
        
        emit ProofSubmitted(
            msg.sender,
            _proofHash,
            _lighthouseCID,
            block.timestamp,
            _expiresAt
        );
        
        emit ProofVerified(msg.sender, _proofHash, block.timestamp);
    }
    
    /**
     * @notice Check if a user has a valid proof
     * @param _user Address to check
     * @return bool True if user has a valid, non-expired proof
     */
    function hasValidProof(address _user) external view returns (bool) {
        ProofMetadata memory proof = userProofs[_user];
        return proof.isVerified && 
               proof.proofHash != bytes32(0) && 
               proof.expiresAt > block.timestamp;
    }
    
    /**
     * @notice Get proof metadata for a user
     * @param _user Address to query
     * @return ProofMetadata struct containing proof details
     */
    function getProof(address _user) external view returns (ProofMetadata memory) {
        return userProofs[_user];
    }
    
    /**
     * @notice Verify a specific proof hash matches the stored one
     * @param _user User address
     * @param _proofHash Proof hash to verify
     * @return bool True if proof hash matches and is valid
     */
    function verifyProofHash(address _user, bytes32 _proofHash) external view returns (bool) {
        ProofMetadata memory proof = userProofs[_user];
        return proof.proofHash == _proofHash && 
               proof.isVerified && 
               proof.expiresAt > block.timestamp;
    }
    
    /**
     * @notice Revoke your own proof
     */
    function revokeProof() external {
        require(userProofs[msg.sender].proofHash != bytes32(0), "No proof to revoke");
        
        emit ProofRevoked(msg.sender, userProofs[msg.sender].proofHash, block.timestamp);
        
        delete userProofs[msg.sender];
    }
    
    /**
     * @notice Get the Lighthouse CID for a user's proof
     * @param _user Address to query
     * @return string Lighthouse CID
     */
    function getProofCID(address _user) external view returns (string memory) {
        return userProofs[_user].lighthouseCID;
    }
    
    /**
     * @notice Check if a proof is expired
     * @param _user Address to check
     * @return bool True if proof is expired
     */
    function isProofExpired(address _user) external view returns (bool) {
        return userProofs[_user].expiresAt <= block.timestamp;
    }
}
