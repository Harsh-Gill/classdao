"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// Component to display edit history for a wiki page
const WikiEditHistory = ({ pageId }: { pageId: bigint }) => {
  const { data: editHistory } = useScaffoldReadContract({
    contractName: "WikipediaManager",
    functionName: "getPageEditHistory",
    args: [pageId],
  });

  const { writeContractAsync: likeEdit } = useScaffoldWriteContract("WikipediaManager");

  const handleLikeEdit = async (editId: bigint) => {
    try {
      await likeEdit({
        functionName: "likeEdit",
        args: [editId],
      });
    } catch (error) {
      console.error("Error liking edit:", error);
    }
  };

  if (!editHistory || editHistory.length === 0) {
    return (
      <div className="text-sm text-gray-500 p-2">
        No edit history available
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      <h5 className="font-semibold text-sm">Edit History:</h5>
      {editHistory.map((editId: bigint, index: number) => (
        <WikiEditItem key={index} editId={editId} onLikeEdit={handleLikeEdit} />
      ))}
    </div>
  );
};

// Component to display individual wiki edit
const WikiEditItem = ({ editId, onLikeEdit }: { editId: bigint; onLikeEdit: (editId: bigint) => void }) => {
  const { data: editData } = useScaffoldReadContract({
    contractName: "WikipediaManager",
    functionName: "getWikiEdit",
    args: [editId],
  });

  if (!editData) {
    return <div className="text-sm text-gray-500">Loading edit...</div>;
  }

  return (
    <div className="border-l-2 border-gray-300 pl-3 py-2">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Address address={editData.editor} />
          <p className="text-sm mt-1 bg-gray-100 p-2 rounded">
            {editData.content.length > 100 
              ? `${editData.content.substring(0, 100)}...` 
              : editData.content
            }
          </p>
          <p className="text-xs text-gray-500">
            {new Date(Number(editData.timestamp) * 1000).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-2">
          <span className="badge badge-sm">{Number(editData.likes)} ❤️</span>
          <button 
            className="btn btn-xs btn-outline"
            onClick={() => onLikeEdit(editId)}
          >
            Like
          </button>
        </div>
      </div>
    </div>
  );
};

// Component to display replies for a specific post
const PostReplies = ({ postId }: { postId: bigint }) => {
  const { data: replyIds } = useScaffoldReadContract({
    contractName: "DiscussionForum",
    functionName: "getPostReplies",
    args: [postId],
  });

  const { writeContractAsync: likeReply } = useScaffoldWriteContract("DiscussionForum");

  const handleLikeReply = async (replyId: bigint) => {
    try {
      await likeReply({
        functionName: "likeReply",
        args: [replyId],
      });
    } catch (error) {
      console.error("Error liking reply:", error);
    }
  };

  if (!replyIds || replyIds.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pl-4 border-l-2 border-base-300">
      <h5 className="font-semibold text-sm mb-2">Replies ({replyIds.length})</h5>
      {replyIds.map((replyId: bigint, index: number) => (
        <ReplyItem key={index} replyId={replyId} onLike={() => handleLikeReply(replyId)} />
      ))}
    </div>
  );
};

// Component to display individual reply
const ReplyItem = ({ replyId, onLike }: { replyId: bigint; onLike: () => void }) => {
  const { data: reply } = useScaffoldReadContract({
    contractName: "DiscussionForum",
    functionName: "getReply",
    args: [replyId],
  });

  if (!reply) {
    return <div className="text-sm text-gray-500">Loading reply...</div>;
  }

  return (
    <div className="bg-base-100 p-3 rounded-lg mb-2 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Address address={reply.author} />
          <p className="mt-1 text-sm">{reply.content}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(Number(reply.timestamp) * 1000).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="badge badge-sm">{Number(reply.likes)} ❤️</span>
          <button 
            className="btn btn-xs btn-outline"
            onClick={onLike}
          >
            Like
          </button>
        </div>
      </div>
    </div>
  );
};

export const ClassDAOApp = () => {
  const { address: connectedAddress } = useAccount();
  const [activeTab, setActiveTab] = useState("profile");
  const [petName, setPetName] = useState("");
  const [postContent, setPostContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalDescription, setProposalDescription] = useState("");
  const [wikiTxnHash, setWikiTxnHash] = useState("");
  const [wikiContent, setWikiContent] = useState("");
  const [showReplyForm, setShowReplyForm] = useState<number | null>(null);
  const [replyingToPost, setReplyingToPost] = useState<bigint | null>(null);
  const [editingWikiPage, setEditingWikiPage] = useState<number | null>(null);
  const [wikiEditContent, setWikiEditContent] = useState("");
  const [showWikiHistory, setShowWikiHistory] = useState<number | null>(null);

  // Contract hooks
  const { data: studentNFT } = useScaffoldContract({
    contractName: "StudentNFT",
  });

  const { data: hasNFT } = useScaffoldReadContract({
    contractName: "StudentNFT",
    functionName: "hasNFT",
    args: [connectedAddress],
  });

  const { data: studentData } = useScaffoldReadContract({
    contractName: "StudentNFT",
    functionName: "getStudentByAddress",
    args: [connectedAddress],
    query: {
      enabled: !!hasNFT,
    },
  });

  const { data: allPosts } = useScaffoldReadContract({
    contractName: "DiscussionForum",
    functionName: "getAllPosts",
    args: [10n], // Limit to 10 posts
  });

  const { data: allProposals } = useScaffoldReadContract({
    contractName: "ClassDAO",
    functionName: "getAllProposals",
    args: [10n], // Limit to 10 proposals
  });

  const { data: allWikiPages } = useScaffoldReadContract({
    contractName: "WikipediaManager",
    functionName: "getAllWikiPages",
    args: [10n], // Limit to 10 pages
  });

  // State to store replies for each post
  const [postReplies, setPostReplies] = useState<{[key: string]: any[]}>({});

  // Write functions
  const { writeContractAsync: mintStudentNFT } = useScaffoldWriteContract("StudentNFT");
  const { writeContractAsync: createPost } = useScaffoldWriteContract("DiscussionForum");
  const { writeContractAsync: createReply } = useScaffoldWriteContract("DiscussionForum");
  const { writeContractAsync: likePost } = useScaffoldWriteContract("DiscussionForum");
  const { writeContractAsync: createProposal } = useScaffoldWriteContract("ClassDAO");
  const { writeContractAsync: vote } = useScaffoldWriteContract("ClassDAO");
  const { writeContractAsync: createWikiPage } = useScaffoldWriteContract("WikipediaManager");
  const { writeContractAsync: editWikiPage } = useScaffoldWriteContract("WikipediaManager");
  const { writeContractAsync: likeEdit } = useScaffoldWriteContract("WikipediaManager");

  const handleMintNFT = async () => {
    if (!petName.trim()) return;
    try {
      await mintStudentNFT({
        functionName: "mintStudentNFT",
        args: [connectedAddress, petName],
      });
      setPetName("");
    } catch (error) {
      console.error("Error minting NFT:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    try {
      await createPost({
        functionName: "createPost",
        args: [postContent],
      });
      setPostContent("");
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleLikePost = async (postId: bigint) => {
    try {
      await likePost({
        functionName: "likePost",
        args: [postId],
      });
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleCreateReply = async (postId: bigint) => {
    if (!replyContent.trim()) return;
    try {
      await createReply({
        functionName: "createReply",
        args: [postId, replyContent],
      });
      setReplyContent("");
      setShowReplyForm(null);
      setReplyingToPost(null);
    } catch (error) {
      console.error("Error creating reply:", error);
    }
  };

  const handleShowReplyForm = (postIndex: number, postId: bigint) => {
    setShowReplyForm(postIndex);
    setReplyingToPost(postId);
    setReplyContent("");
  };

  const handleCreateProposal = async () => {
    if (!proposalTitle.trim() || !proposalDescription.trim()) return;
    try {
      await createProposal({
        functionName: "createProposal",
        args: [proposalTitle, proposalDescription, 0], // 0 = APP_CHANGES
      });
      setProposalTitle("");
      setProposalDescription("");
    } catch (error) {
      console.error("Error creating proposal:", error);
    }
  };

  const handleVote = async (proposalId: bigint, support: boolean) => {
    try {
      await vote({
        functionName: "vote",
        args: [proposalId, support],
      });
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleCreateWikiPage = async () => {
    if (!wikiTxnHash.trim() || !wikiContent.trim()) return;
    try {
      await createWikiPage({
        functionName: "createWikiPage",
        args: [wikiTxnHash, wikiContent],
      });
      setWikiTxnHash("");
      setWikiContent("");
    } catch (error) {
      console.error("Error creating wiki page:", error);
    }
  };

  const handleEditWikiPage = async (pageId: bigint) => {
    if (!wikiEditContent.trim()) return;
    try {
      await editWikiPage({
        functionName: "editWikiPage",
        args: [pageId, wikiEditContent],
      });
      setWikiEditContent("");
      setEditingWikiPage(null);
    } catch (error) {
      console.error("Error editing wiki page:", error);
    }
  };

  const handleLikeWikiEdit = async (editId: bigint) => {
    try {
      await likeEdit({
        functionName: "likeEdit",
        args: [editId],
      });
    } catch (error) {
      console.error("Error liking wiki edit:", error);
    }
  };

  const handleShowEditForm = (pageIndex: number, currentContent: string) => {
    setEditingWikiPage(pageIndex);
    setWikiEditContent(currentContent);
  };

  const getPetEmoji = (level: number) => {
    if (level <= 3) return "🐣";
    else if (level <= 6) return "🐰";
    else if (level <= 10) return "🦊";
    else if (level <= 15) return "🐺";
    else return "🐉";
  };

  if (!connectedAddress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title">Welcome to ClassDAO! 🎓</h2>
            <p>Please connect your wallet to get started</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">🎓 ClassDAO</h1>
        </div>
        <div className="flex-none">
          <Address address={connectedAddress} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tabs tabs-bordered justify-center p-4">
        <button 
          className={`tab tab-lg ${activeTab === "profile" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          👤 Profile
        </button>
        <button 
          className={`tab tab-lg ${activeTab === "discussion" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("discussion")}
        >
          💬 Discussions
        </button>
        <button 
          className={`tab tab-lg ${activeTab === "dao" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("dao")}
        >
          🗳️ DAO
        </button>
        <button 
          className={`tab tab-lg ${activeTab === "wiki" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("wiki")}
        >
          📚 TXN Wiki
        </button>
      </div>

      <div className="container mx-auto p-6">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {!hasNFT ? (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body items-center text-center">
                  <h2 className="card-title">Get Your Student NFT! 🎒</h2>
                  <p>Join ClassDAO by minting your student NFT with a pet companion!</p>
                  
                  <div className="form-control w-full max-w-xs">
                    <label className="label">
                      <span className="label-text">Choose your pet name:</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g., Fluffy" 
                      className="input input-bordered w-full max-w-xs"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                    />
                  </div>
                  
                  <div className="card-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={handleMintNFT}
                      disabled={!petName.trim()}
                    >
                      Mint Student NFT 🎓
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              studentData && (
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body items-center text-center">
                    <h2 className="card-title">Your Student Profile 📊</h2>
                    
                    <div className="stats stats-vertical lg:stats-horizontal shadow">
                      <div className="stat">
                        <div className="stat-title">Pet</div>
                        <div className="stat-value text-4xl">
                          {getPetEmoji(Number(studentData[1].level))}
                        </div>
                        <div className="stat-desc">{studentData[1].petName}</div>
                      </div>
                      
                      <div className="stat">
                        <div className="stat-title">Level</div>
                        <div className="stat-value">{Number(studentData[1].level)}</div>
                        <div className="stat-desc">Keep earning points!</div>
                      </div>
                      
                      <div className="stat">
                        <div className="stat-title">Total Points</div>
                        <div className="stat-value">{Number(studentData[1].totalPoints)}</div>
                        <div className="stat-desc">
                          Next level: {5 - (Number(studentData[1].totalPoints) % 5)} points
                        </div>
                      </div>
                    </div>
                    
                    <div className="alert alert-info">
                      <span>💡 Earn points by creating posts, replies, and wiki edits that get 1+ likes! Level up every 5 points!</span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Discussion Tab */}
        {activeTab === "discussion" && (
          <div className="space-y-6">
            {hasNFT ? (
              <>
                {/* Create Post */}
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title">Create a Post 📝</h2>
                    <textarea 
                      className="textarea textarea-bordered h-24"
                      placeholder="Share your thoughts..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                    />
                    <div className="card-actions justify-end">
                      <button 
                        className="btn btn-primary"
                        onClick={handleCreatePost}
                        disabled={!postContent.trim()}
                      >
                        Post 📤
                      </button>
                    </div>
                  </div>
                </div>

                {/* Posts List */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Recent Posts 📋</h3>
                  {allPosts && allPosts.length > 0 ? (
                    allPosts.map((post: any, index: number) => (
                      <div key={index} className="card bg-base-100 shadow-md">
                        <div className="card-body">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <Address address={post.author} />
                              <p className="mt-2">{post.content}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(Number(post.timestamp) * 1000).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="badge">{Number(post.likes)} ❤️</span>
                              <button 
                                className="btn btn-sm btn-outline"
                                onClick={() => handleLikePost(post.id)}
                              >
                                Like
                              </button>
                              <button 
                                className="btn btn-sm btn-primary"
                                onClick={() => handleShowReplyForm(index, post.id)}
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                          
                          {/* Replies Section */}
                          <PostReplies postId={post.id} />
                          
                          {/* Reply Form */}
                          {showReplyForm === index && (
                            <div className="mt-4 p-4 bg-base-200 rounded-lg">
                              <h4 className="font-semibold mb-2">Reply to this post:</h4>
                              <textarea 
                                className="textarea textarea-bordered w-full h-20"
                                placeholder="Write your reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                              />
                              <div className="flex justify-end space-x-2 mt-2">
                                <button 
                                  className="btn btn-sm btn-outline"
                                  onClick={() => {
                                    setShowReplyForm(null);
                                    setReplyContent("");
                                    setReplyingToPost(null);
                                  }}
                                >
                                  Cancel
                                </button>
                                <button 
                                  className="btn btn-sm btn-primary"
                                  onClick={() => replyingToPost && handleCreateReply(replyingToPost)}
                                  disabled={!replyContent.trim()}
                                >
                                  Post Reply 📤
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="alert">
                      <span>No posts yet. Be the first to post! 🚀</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="alert alert-warning">
                <span>⚠️ You need a Student NFT to participate in discussions!</span>
              </div>
            )}
          </div>
        )}

        {/* DAO Tab */}
        {activeTab === "dao" && (
          <div className="space-y-6">
            {hasNFT ? (
              <>
                {/* Create Proposal */}
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title">Create Proposal 🗳️</h2>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Proposal Title</span>
                      </label>
                      <input 
                        type="text" 
                        className="input input-bordered"
                        placeholder="e.g., Add new features to the app"
                        value={proposalTitle}
                        onChange={(e) => setProposalTitle(e.target.value)}
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Description</span>
                      </label>
                      <textarea 
                        className="textarea textarea-bordered h-24"
                        placeholder="Detailed description of your proposal..."
                        value={proposalDescription}
                        onChange={(e) => setProposalDescription(e.target.value)}
                      />
                    </div>
                    
                    <div className="card-actions justify-end">
                      <button 
                        className="btn btn-primary"
                        onClick={handleCreateProposal}
                        disabled={!proposalTitle.trim() || !proposalDescription.trim()}
                      >
                        Create Proposal 📋
                      </button>
                    </div>
                  </div>
                </div>

                {/* Proposals List */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Active Proposals 🏛️</h3>
                  {allProposals && allProposals.length > 0 ? (
                    allProposals.map((proposal: any, index: number) => (
                      <div key={index} className="card bg-base-100 shadow-md">
                        <div className="card-body">
                          <h4 className="card-title">{proposal.title}</h4>
                          <p>{proposal.description}</p>
                          <Address address={proposal.proposer} />
                          
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="stat bg-success text-success-content rounded">
                              <div className="stat-title">For</div>
                              <div className="stat-value text-lg">{Number(proposal.votesFor)}</div>
                            </div>
                            <div className="stat bg-error text-error-content rounded">
                              <div className="stat-title">Against</div>
                              <div className="stat-value text-lg">{Number(proposal.votesAgainst)}</div>
                            </div>
                          </div>
                          
                          <div className="card-actions justify-end mt-4">
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => handleVote(proposal.id, true)}
                            >
                              Vote For ✅
                            </button>
                            <button 
                              className="btn btn-error btn-sm"
                              onClick={() => handleVote(proposal.id, false)}
                            >
                              Vote Against ❌
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="alert">
                      <span>No proposals yet. Create the first one! 🚀</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="alert alert-warning">
                <span>⚠️ You need a Student NFT to participate in DAO governance!</span>
              </div>
            )}
          </div>
        )}

        {/* Wiki Tab */}
        {activeTab === "wiki" && (
          <div className="space-y-6">
            {hasNFT ? (
              <>
                {/* Create Wiki Page */}
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title">Add New TXN Wiki Page 📚</h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Create a wiki page to explain any blockchain transaction. Help others understand the transaction's purpose, significance, or technical details.
                    </p>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Transaction Hash</span>
                        <span className="label-text-alt">Must be unique</span>
                      </label>
                      <input 
                        type="text" 
                        className="input input-bordered"
                        placeholder="0x1234567890abcdef..."
                        value={wikiTxnHash}
                        onChange={(e) => setWikiTxnHash(e.target.value)}
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Initial Wiki Content</span>
                        <span className="label-text-alt">Earn points when people like your edits!</span>
                      </label>
                      <textarea 
                        className="textarea textarea-bordered h-32"
                        placeholder="Explain this transaction - its purpose, significance, technical details, or historical context..."
                        value={wikiContent}
                        onChange={(e) => setWikiContent(e.target.value)}
                      />
                    </div>
                    
                    <div className="alert alert-info">
                      <span>💡 Other students can edit this page later. Get 1+ likes on your edits to earn points!</span>
                    </div>
                    
                    <div className="card-actions justify-end">
                      <button 
                        className="btn btn-primary"
                        onClick={handleCreateWikiPage}
                        disabled={!wikiTxnHash.trim() || !wikiContent.trim()}
                      >
                        Create Wiki Page 📖
                      </button>
                    </div>
                  </div>
                </div>

                {/* Wiki Pages List */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Recent Wiki Pages 📖</h3>
                  {allWikiPages && allWikiPages.length > 0 ? (
                    allWikiPages.map((page: any, index: number) => (
                      <div key={index} className="card bg-base-100 shadow-md">
                        <div className="card-body">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="card-title">
                                📄 Transaction: {page.txnHash.substring(0, 20)}...
                              </h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="badge badge-outline">
                                  {Number(page.totalEdits)} edits
                                </span>
                                <span className="text-sm text-gray-500">
                                  Last edited: {new Date(Number(page.lastEditTime) * 1000).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                className="btn btn-sm btn-outline btn-primary"
                                onClick={() => handleShowEditForm(index, page.currentContent)}
                              >
                                Edit ✏️
                              </button>
                              <button 
                                className="btn btn-sm btn-outline"
                                onClick={() => setShowWikiHistory(showWikiHistory === index ? null : index)}
                              >
                                {showWikiHistory === index ? 'Hide History' : 'Show History'} 📚
                              </button>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-3 rounded-lg mb-3">
                            <h5 className="font-semibold mb-2">Current Content:</h5>
                            <p>{page.currentContent}</p>
                          </div>

                          {/* Edit Form */}
                          {editingWikiPage === index && (
                            <div className="mt-4 p-4 bg-base-200 rounded-lg">
                              <h4 className="font-semibold mb-2">Edit this wiki page:</h4>
                              <textarea 
                                className="textarea textarea-bordered w-full h-32"
                                placeholder="Update the wiki content..."
                                value={wikiEditContent}
                                onChange={(e) => setWikiEditContent(e.target.value)}
                              />
                              <div className="flex justify-end space-x-2 mt-2">
                                <button 
                                  className="btn btn-sm btn-outline"
                                  onClick={() => {
                                    setEditingWikiPage(null);
                                    setWikiEditContent("");
                                  }}
                                >
                                  Cancel
                                </button>
                                <button 
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handleEditWikiPage(page.id)}
                                  disabled={!wikiEditContent.trim()}
                                >
                                  Save Edit 💾
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Edit History */}
                          {showWikiHistory === index && (
                            <div className="mt-4 p-4 bg-base-200 rounded-lg">
                              <WikiEditHistory pageId={page.id} />
                            </div>
                          )}

                          <div className="flex justify-between items-center mt-3">
                            <div className="text-sm text-gray-600">
                              Contributors: {page.contributors.length}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="alert">
                      <span>No wiki pages yet. Create the first one! 📚</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="alert alert-warning">
                <span>⚠️ You need a Student NFT to contribute to the wiki! Mint your NFT in the Profile tab to get started.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};