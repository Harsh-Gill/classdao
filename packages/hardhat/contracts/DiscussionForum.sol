// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./StudentNFT.sol";
import "./PointsManager.sol";

contract DiscussionForum {
    StudentNFT public studentNFT;
    PointsManager public pointsManager;
    
    struct Post {
        uint256 id;
        address author;
        string content;
        uint256 timestamp;
        uint256 likes;
        bool pointsAwarded;
    }
    
    struct Reply {
        uint256 id;
        uint256 postId;
        address author;
        string content;
        uint256 timestamp;
        uint256 likes;
        bool pointsAwarded;
    }
    
    mapping(uint256 => Post) public posts;
    mapping(uint256 => Reply) public replies;
    mapping(uint256 => uint256[]) public postReplies; // postId => replyIds
    mapping(address => mapping(uint256 => bool)) public hasLikedPost;
    mapping(address => mapping(uint256 => bool)) public hasLikedReply;
    
    uint256 public nextPostId = 1;
    uint256 public nextReplyId = 1;
    uint256 public constant LIKE_THRESHOLD = 1;
    
    event PostCreated(uint256 indexed postId, address indexed author, string content);
    event ReplyCreated(uint256 indexed replyId, uint256 indexed postId, address indexed author, string content);
    event PostLiked(uint256 indexed postId, address indexed liker);
    event ReplyLiked(uint256 indexed replyId, address indexed liker);
    
    constructor(address _studentNFT, address _pointsManager) {
        studentNFT = StudentNFT(_studentNFT);
        pointsManager = PointsManager(_pointsManager);
    }
    
    modifier onlyStudents() {
        require(studentNFT.hasNFT(msg.sender), "Must be a student to participate");
        _;
    }
    
    function createPost(string memory content) external onlyStudents returns (uint256) {
        uint256 postId = nextPostId++;
        
        posts[postId] = Post({
            id: postId,
            author: msg.sender,
            content: content,
            timestamp: block.timestamp,
            likes: 0,
            pointsAwarded: false
        });
        
        // 🎮 EVOLUTION TRIGGER: First post evolves pet to Level 2 (adds scarf accessory)
        uint256 tokenId = studentNFT.getTokenIdByAddress(msg.sender);
        studentNFT.evolvePetFromPost(tokenId);
        
        emit PostCreated(postId, msg.sender, content);
        return postId;
    }
    
    function createReply(uint256 postId, string memory content) external onlyStudents returns (uint256) {
        require(posts[postId].id != 0, "Post does not exist");
        
        uint256 replyId = nextReplyId++;
        
        replies[replyId] = Reply({
            id: replyId,
            postId: postId,
            author: msg.sender,
            content: content,
            timestamp: block.timestamp,
            likes: 0,
            pointsAwarded: false
        });
        
        postReplies[postId].push(replyId);
        
        emit ReplyCreated(replyId, postId, msg.sender, content);
        return replyId;
    }
    
    function likePost(uint256 postId) external onlyStudents {
        require(posts[postId].id != 0, "Post does not exist");
        require(!hasLikedPost[msg.sender][postId], "Already liked this post");
        require(posts[postId].author != msg.sender, "Cannot like your own post");
        
        hasLikedPost[msg.sender][postId] = true;
        posts[postId].likes++;
        
        // Award points if threshold reached and not already awarded
        if (posts[postId].likes >= LIKE_THRESHOLD && !posts[postId].pointsAwarded) {
            posts[postId].pointsAwarded = true;
            pointsManager.awardDiscussionPoints(posts[postId].author, postId, true);
        }
        
        emit PostLiked(postId, msg.sender);
    }
    
    function likeReply(uint256 replyId) external onlyStudents {
        require(replies[replyId].id != 0, "Reply does not exist");
        require(!hasLikedReply[msg.sender][replyId], "Already liked this reply");
        require(replies[replyId].author != msg.sender, "Cannot like your own reply");
        
        hasLikedReply[msg.sender][replyId] = true;
        replies[replyId].likes++;
        
        // Award points if threshold reached and not already awarded
        if (replies[replyId].likes >= LIKE_THRESHOLD && !replies[replyId].pointsAwarded) {
            replies[replyId].pointsAwarded = true;
            pointsManager.awardDiscussionPoints(replies[replyId].author, replyId, false);
        }
        
        emit ReplyLiked(replyId, msg.sender);
    }
    
    function getPost(uint256 postId) external view returns (Post memory) {
        return posts[postId];
    }
    
    function getReply(uint256 replyId) external view returns (Reply memory) {
        return replies[replyId];
    }
    
    function getPostReplies(uint256 postId) external view returns (uint256[] memory) {
        return postReplies[postId];
    }
    
    function getAllPosts(uint256 limit) external view returns (Post[] memory) {
        uint256 totalPosts = nextPostId - 1;
        uint256 returnCount = limit > 0 && limit < totalPosts ? limit : totalPosts;
        
        Post[] memory allPosts = new Post[](returnCount);
        
        for (uint256 i = 0; i < returnCount; i++) {
            uint256 postId = totalPosts - i; // Return newest first
            allPosts[i] = posts[postId];
        }
        
        return allPosts;
    }
}