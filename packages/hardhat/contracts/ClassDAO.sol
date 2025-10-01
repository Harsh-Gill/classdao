// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./StudentNFT.sol";

contract ClassDAO {
    StudentNFT public studentNFT;
    
    enum ProposalType { APP_CHANGES, GENERAL_CONSENSUS, OTHER }
    
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        ProposalType proposalType;
        uint256 votesFor;
        uint256 votesAgainst;
        bool executed;
        uint256 deadline;
        uint256 createdAt;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => bool) public hasVotingPower;
    
    uint256 public nextProposalId = 1;
    uint256 public constant VOTING_PERIOD = 7 days;
    
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title, ProposalType proposalType);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId);
    
    constructor(address _studentNFT) {
        studentNFT = StudentNFT(_studentNFT);
    }
    
    modifier onlyStudents() {
        require(studentNFT.hasNFT(msg.sender), "Must be a student to participate in DAO");
        _;
    }
    
    function createProposal(
        string memory title,
        string memory description,
        ProposalType proposalType
    ) external onlyStudents returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        
        uint256 proposalId = nextProposalId++;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            proposalType: proposalType,
            votesFor: 0,
            votesAgainst: 0,
            executed: false,
            deadline: block.timestamp + VOTING_PERIOD,
            createdAt: block.timestamp
        });
        
        emit ProposalCreated(proposalId, msg.sender, title, proposalType);
        return proposalId;
    }
    
    function vote(uint256 proposalId, bool support) external onlyStudents {
        require(proposals[proposalId].id != 0, "Proposal does not exist");
        require(block.timestamp < proposals[proposalId].deadline, "Voting period has ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted on this proposal");
        
        hasVoted[proposalId][msg.sender] = true;
        
        if (support) {
            proposals[proposalId].votesFor++;
        } else {
            proposals[proposalId].votesAgainst++;
        }
        
        emit VoteCast(proposalId, msg.sender, support);
    }
    
    function executeProposal(uint256 proposalId) external {
        require(proposals[proposalId].id != 0, "Proposal does not exist");
        require(block.timestamp >= proposals[proposalId].deadline, "Voting period has not ended");
        require(!proposals[proposalId].executed, "Proposal already executed");
        require(proposals[proposalId].votesFor > proposals[proposalId].votesAgainst, "Proposal did not pass");
        
        proposals[proposalId].executed = true;
        
        emit ProposalExecuted(proposalId);
    }
    
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }
    
    function getAllProposals(uint256 limit) external view returns (Proposal[] memory) {
        uint256 totalProposals = nextProposalId - 1;
        uint256 returnCount = limit > 0 && limit < totalProposals ? limit : totalProposals;
        
        Proposal[] memory allProposals = new Proposal[](returnCount);
        
        for (uint256 i = 0; i < returnCount; i++) {
            uint256 proposalId = totalProposals - i; // Return newest first
            allProposals[i] = proposals[proposalId];
        }
        
        return allProposals;
    }
    
    function getProposalStatus(uint256 proposalId) external view returns (
        bool isActive,
        bool hasPassed,
        bool isExecuted,
        uint256 timeLeft
    ) {
        require(proposals[proposalId].id != 0, "Proposal does not exist");
        
        Proposal memory proposal = proposals[proposalId];
        
        isActive = block.timestamp < proposal.deadline;
        hasPassed = proposal.votesFor > proposal.votesAgainst;
        isExecuted = proposal.executed;
        timeLeft = proposal.deadline > block.timestamp ? proposal.deadline - block.timestamp : 0;
    }
}