// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./StudentNFT.sol";

contract PointsManager {
    StudentNFT public studentNFT;
    
    mapping(string => uint256) public pointsPerActivity;
    mapping(uint256 => bool) public contentProcessed; // To prevent double rewards
    
    event PointsAwarded(address indexed user, uint256 points, string activity);
    
    constructor(address _studentNFT) {
        studentNFT = StudentNFT(_studentNFT);
        
        // Set default point values
        pointsPerActivity["discussion_post"] = 10;
        pointsPerActivity["discussion_reply"] = 5;
        pointsPerActivity["wiki_edit"] = 15;
    }
    
    function awardDiscussionPoints(address user, uint256 contentId, bool isPost) external {
        require(!contentProcessed[contentId], "Points already awarded for this content");
        require(studentNFT.hasNFT(user), "User must have student NFT");
        
        contentProcessed[contentId] = true;
        
        uint256 points = isPost ? pointsPerActivity["discussion_post"] : pointsPerActivity["discussion_reply"];
        
        (, StudentNFT.Student memory studentData) = studentNFT.getStudentByAddress(user);
        uint256 tokenId = studentNFT.studentTokens(user);
        
        studentNFT.addPoints(tokenId, points);
        
        emit PointsAwarded(user, points, isPost ? "discussion_post" : "discussion_reply");
    }
    
    function awardWikipediaPoints(address user, uint256 editId) external {
        require(!contentProcessed[editId], "Points already awarded for this edit");
        require(studentNFT.hasNFT(user), "User must have student NFT");
        
        contentProcessed[editId] = true;
        
        uint256 points = pointsPerActivity["wiki_edit"];
        uint256 tokenId = studentNFT.studentTokens(user);
        
        studentNFT.addPoints(tokenId, points);
        
        emit PointsAwarded(user, points, "wiki_edit");
    }
    
    function setPointsPerActivity(string memory activity, uint256 points) external {
        // In a full implementation, this would have access control
        pointsPerActivity[activity] = points;
    }
}