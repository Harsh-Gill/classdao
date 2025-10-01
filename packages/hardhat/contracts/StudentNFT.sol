// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StudentNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId = 1;
    
    struct Student {
        uint256 totalPoints;
        uint256 level;
        uint256 lastLevelUp;
        string petName;
        string petType; // "cat", "fox", or "dog"
        string scarfColor; // "red", "blue", "green", "purple", "yellow"
        uint256 petLevel; // 1-4 visual evolution level
        bool hasPosted; // Unlocks level 2
        bool hasVoted; // Unlocks level 3
        bool hasWikiLikes; // Unlocks level 4 (5+ likes on wiki)
    }
    
    mapping(uint256 => Student) public students;
    mapping(address => uint256) public studentTokens; // Address to tokenId mapping
    
    address public pointsManager;
    mapping(address => bool) public authorizedContracts; // Contracts allowed to trigger evolutions
    
    uint256 public constant POINTS_PER_LEVEL = 5;
    
    event StudentMinted(address indexed student, uint256 tokenId);
    event PointsAdded(uint256 tokenId, uint256 points);
    event LevelUp(uint256 tokenId, uint256 newLevel);
    
    constructor(address initialOwner) ERC721("ClassDAO Student", "CDS") Ownable(initialOwner) {}
    
    function setPointsManager(address _pointsManager) external onlyOwner {
        pointsManager = _pointsManager;
    }
    
    function setAuthorizedContract(address _contract, bool _authorized) external onlyOwner {
        authorizedContracts[_contract] = _authorized;
    }
    
    modifier onlyPointsManager() {
        require(msg.sender == pointsManager, "Only PointsManager can call this");
        _;
    }
    
    modifier onlyAuthorized() {
        require(msg.sender == pointsManager || authorizedContracts[msg.sender], "Not authorized");
        _;
    }
    
    function mintStudentNFT(address student, string memory petName, string memory petType, string memory scarfColor) external returns (uint256) {
        require(studentTokens[student] == 0, "Student already has NFT");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(student, tokenId);
        
        students[tokenId] = Student({
            totalPoints: 0,
            level: 1,
            lastLevelUp: block.timestamp,
            petName: petName,
            petType: petType,
            scarfColor: scarfColor,
            petLevel: 1,
            hasPosted: false,
            hasVoted: false,
            hasWikiLikes: false
        });
        
        studentTokens[student] = tokenId;
        
        emit StudentMinted(student, tokenId);
        return tokenId;
    }
    
    // Evolution functions - can be called by authorized contracts
    function evolvePetFromPost(uint256 tokenId) external onlyAuthorized {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        if (!students[tokenId].hasPosted) {
            students[tokenId].hasPosted = true;
            if (students[tokenId].petLevel < 2) {
                students[tokenId].petLevel = 2;
            }
        }
    }
    
    function evolvePetFromVote(uint256 tokenId) external onlyAuthorized {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        if (!students[tokenId].hasVoted) {
            students[tokenId].hasVoted = true;
            if (students[tokenId].petLevel < 3) {
                students[tokenId].petLevel = 3;
            }
        }
    }
    
    function evolvePetFromWikiLikes(uint256 tokenId) external onlyAuthorized {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        if (!students[tokenId].hasWikiLikes) {
            students[tokenId].hasWikiLikes = true;
            if (students[tokenId].petLevel < 4) {
                students[tokenId].petLevel = 4;
            }
        }
    }
    
    function addPoints(uint256 tokenId, uint256 points) external onlyPointsManager {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        students[tokenId].totalPoints += points;
        emit PointsAdded(tokenId, points);
        
        // Check if level up is needed
        uint256 currentLevel = students[tokenId].level;
        uint256 newLevel = (students[tokenId].totalPoints / POINTS_PER_LEVEL) + 1;
        
        if (newLevel > currentLevel) {
            students[tokenId].level = newLevel;
            students[tokenId].lastLevelUp = block.timestamp;
            emit LevelUp(tokenId, newLevel);
        }
    }
    
    function getStudentData(uint256 tokenId) external view returns (Student memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return students[tokenId];
    }
    
    function getStudentByAddress(address student) external view returns (uint256 tokenId, Student memory studentData) {
        tokenId = studentTokens[student];
        require(tokenId != 0, "Student does not have NFT");
        studentData = students[tokenId];
    }
    
    function hasNFT(address student) external view returns (bool) {
        return studentTokens[student] != 0;
    }
    
    function getTokenIdByAddress(address student) external view returns (uint256) {
        return studentTokens[student];
    }
    
    function getPetImage(uint256 level) public pure returns (string memory) {
        if (level <= 5) return "Baby"; // Baby pet
        else if (level <= 10) return "Young"; // Young pet
        else if (level <= 20) return "Adult"; // Adult pet
        else if (level <= 50) return "Mature"; // Mature pet
        else return "Legendary"; // Legendary pet
    }
    
    // Override required by Solidity
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}