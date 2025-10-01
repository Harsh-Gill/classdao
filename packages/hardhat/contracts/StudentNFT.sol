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
    }
    
    mapping(uint256 => Student) public students;
    mapping(address => uint256) public studentTokens; // Address to tokenId mapping
    
    address public pointsManager;
    
    uint256 public constant POINTS_PER_LEVEL = 5;
    
    event StudentMinted(address indexed student, uint256 tokenId);
    event PointsAdded(uint256 tokenId, uint256 points);
    event LevelUp(uint256 tokenId, uint256 newLevel);
    
    constructor(address initialOwner) ERC721("ClassDAO Student", "CDS") Ownable(initialOwner) {}
    
    function setPointsManager(address _pointsManager) external onlyOwner {
        pointsManager = _pointsManager;
    }
    
    modifier onlyPointsManager() {
        require(msg.sender == pointsManager, "Only PointsManager can call this");
        _;
    }
    
    function mintStudentNFT(address student, string memory petName) external returns (uint256) {
        require(studentTokens[student] == 0, "Student already has NFT");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(student, tokenId);
        
        students[tokenId] = Student({
            totalPoints: 0,
            level: 1,
            lastLevelUp: block.timestamp,
            petName: petName
        });
        
        studentTokens[student] = tokenId;
        
        emit StudentMinted(student, tokenId);
        return tokenId;
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