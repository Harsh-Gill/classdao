// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./StudentNFT.sol";
import "./PointsManager.sol";

contract WikipediaManager {
    StudentNFT public studentNFT;
    PointsManager public pointsManager;
    
    struct WikiPage {
        uint256 id;
        string txnHash;
        string currentContent;
        address[] contributors;
        uint256 lastEditTime;
        uint256 totalEdits;
    }
    
    struct WikiEdit {
        uint256 id;
        uint256 pageId;
        address editor;
        string content;
        uint256 timestamp;
        uint256 likes;
        bool pointsAwarded;
    }
    
    mapping(uint256 => WikiPage) public wikiPages;
    mapping(string => uint256) public txnHashToPageId; // txnHash => pageId
    mapping(uint256 => WikiEdit) public wikiEdits;
    mapping(uint256 => uint256[]) public pageEditHistory; // pageId => editIds
    mapping(address => mapping(uint256 => bool)) public hasLikedEdit;
    
    uint256 public nextPageId = 1;
    uint256 public nextEditId = 1;
    uint256 public constant LIKE_THRESHOLD = 1;
    
    event WikiPageCreated(uint256 indexed pageId, string indexed txnHash, address indexed creator);
    event WikiEditMade(uint256 indexed editId, uint256 indexed pageId, address indexed editor);
    event WikiEditLiked(uint256 indexed editId, address indexed liker);
    
    constructor(address _studentNFT, address _pointsManager) {
        studentNFT = StudentNFT(_studentNFT);
        pointsManager = PointsManager(_pointsManager);
    }
    
    modifier onlyStudents() {
        require(studentNFT.hasNFT(msg.sender), "Must be a student to participate");
        _;
    }
    
    function createWikiPage(string memory txnHash, string memory content) external onlyStudents returns (uint256) {
        require(txnHashToPageId[txnHash] == 0, "Wiki page for this transaction already exists");
        require(bytes(txnHash).length > 0, "Transaction hash cannot be empty");
        
        uint256 pageId = nextPageId++;
        
        wikiPages[pageId] = WikiPage({
            id: pageId,
            txnHash: txnHash,
            currentContent: content,
            contributors: new address[](0),
            lastEditTime: block.timestamp,
            totalEdits: 0
        });
        
        wikiPages[pageId].contributors.push(msg.sender);
        txnHashToPageId[txnHash] = pageId;
        
        emit WikiPageCreated(pageId, txnHash, msg.sender);
        return pageId;
    }
    
    function editWikiPage(uint256 pageId, string memory newContent) external onlyStudents returns (uint256) {
        require(wikiPages[pageId].id != 0, "Wiki page does not exist");
        require(bytes(newContent).length > 0, "Content cannot be empty");
        
        uint256 editId = nextEditId++;
        
        wikiEdits[editId] = WikiEdit({
            id: editId,
            pageId: pageId,
            editor: msg.sender,
            content: newContent,
            timestamp: block.timestamp,
            likes: 0,
            pointsAwarded: false
        });
        
        // Update the page
        wikiPages[pageId].currentContent = newContent;
        wikiPages[pageId].lastEditTime = block.timestamp;
        wikiPages[pageId].totalEdits++;
        
        // Add contributor if not already added
        bool isNewContributor = true;
        for (uint256 i = 0; i < wikiPages[pageId].contributors.length; i++) {
            if (wikiPages[pageId].contributors[i] == msg.sender) {
                isNewContributor = false;
                break;
            }
        }
        if (isNewContributor) {
            wikiPages[pageId].contributors.push(msg.sender);
        }
        
        pageEditHistory[pageId].push(editId);
        
        emit WikiEditMade(editId, pageId, msg.sender);
        return editId;
    }
    
    function likeEdit(uint256 editId) external onlyStudents {
        require(wikiEdits[editId].id != 0, "Edit does not exist");
        require(!hasLikedEdit[msg.sender][editId], "Already liked this edit");
        require(wikiEdits[editId].editor != msg.sender, "Cannot like your own edit");
        
        hasLikedEdit[msg.sender][editId] = true;
        wikiEdits[editId].likes++;
        
        // Award points if threshold reached and not already awarded
        if (wikiEdits[editId].likes >= LIKE_THRESHOLD && !wikiEdits[editId].pointsAwarded) {
            wikiEdits[editId].pointsAwarded = true;
            pointsManager.awardWikipediaPoints(wikiEdits[editId].editor, editId);
        }
        
        emit WikiEditLiked(editId, msg.sender);
    }
    
    function getWikiPage(uint256 pageId) external view returns (WikiPage memory) {
        return wikiPages[pageId];
    }
    
    function getWikiPageByTxnHash(string memory txnHash) external view returns (WikiPage memory) {
        uint256 pageId = txnHashToPageId[txnHash];
        require(pageId != 0, "Wiki page not found for this transaction");
        return wikiPages[pageId];
    }
    
    function getWikiEdit(uint256 editId) external view returns (WikiEdit memory) {
        return wikiEdits[editId];
    }
    
    function getPageEditHistory(uint256 pageId) external view returns (uint256[] memory) {
        return pageEditHistory[pageId];
    }
    
    function getAllWikiPages(uint256 limit) external view returns (WikiPage[] memory) {
        uint256 totalPages = nextPageId - 1;
        uint256 returnCount = limit > 0 && limit < totalPages ? limit : totalPages;
        
        WikiPage[] memory allPages = new WikiPage[](returnCount);
        
        for (uint256 i = 0; i < returnCount; i++) {
            uint256 pageId = totalPages - i; // Return newest first
            allPages[i] = wikiPages[pageId];
        }
        
        return allPages;
    }
}