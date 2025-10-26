// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title GroupRegistry
 * @dev Registry for travel group formations on Hedera
 */
contract GroupRegistry {
    struct TravelGroup {
        string groupId;
        string destination;
        uint256 memberCount;
        uint256 createdAt;
        bool exists;
        address registeredBy;
    }

    // Mapping from groupId to TravelGroup
    mapping(string => TravelGroup) public groups;
    
    // Array of all group IDs
    string[] public groupIds;
    
    // Events
    event GroupRegistered(
        string indexed groupId,
        string destination,
        uint256 memberCount,
        uint256 createdAt,
        address registeredBy
    );
    
    event GroupUpdated(
        string indexed groupId,
        string destination,
        uint256 memberCount
    );

    /**
     * @dev Register a new travel group
     */
    function registerGroup(
        string memory _groupId,
        string memory _destination,
        uint256 _memberCount,
        uint256 _createdAt
    ) public {
        require(bytes(_groupId).length > 0, "Group ID cannot be empty");
        require(bytes(_destination).length > 0, "Destination cannot be empty");
        require(_memberCount > 0, "Member count must be greater than 0");
        
        // If group doesn't exist, add to array
        if (!groups[_groupId].exists) {
            groupIds.push(_groupId);
        }
        
        groups[_groupId] = TravelGroup({
            groupId: _groupId,
            destination: _destination,
            memberCount: _memberCount,
            createdAt: _createdAt,
            exists: true,
            registeredBy: msg.sender
        });
        
        emit GroupRegistered(
            _groupId,
            _destination,
            _memberCount,
            _createdAt,
            msg.sender
        );
    }

    /**
     * @dev Get group information
     */
    function getGroup(string memory _groupId) 
        public 
        view 
        returns (
            string memory groupId,
            string memory destination,
            uint256 memberCount,
            uint256 createdAt,
            bool exists,
            address registeredBy
        ) 
    {
        TravelGroup memory group = groups[_groupId];
        return (
            group.groupId,
            group.destination,
            group.memberCount,
            group.createdAt,
            group.exists,
            group.registeredBy
        );
    }

    /**
     * @dev Check if group exists
     */
    function groupExists(string memory _groupId) public view returns (bool) {
        return groups[_groupId].exists;
    }

    /**
     * @dev Get total number of registered groups
     */
    function getTotalGroups() public view returns (uint256) {
        return groupIds.length;
    }

    /**
     * @dev Get group ID by index
     */
    function getGroupIdByIndex(uint256 index) public view returns (string memory) {
        require(index < groupIds.length, "Index out of bounds");
        return groupIds[index];
    }

    /**
     * @dev Update group member count
     */
    function updateMemberCount(string memory _groupId, uint256 _newMemberCount) public {
        require(groups[_groupId].exists, "Group does not exist");
        require(_newMemberCount > 0, "Member count must be greater than 0");
        
        groups[_groupId].memberCount = _newMemberCount;
        
        emit GroupUpdated(
            _groupId,
            groups[_groupId].destination,
            _newMemberCount
        );
    }
}
