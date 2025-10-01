"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  SparklesIcon,
  ArrowTrendingUpIcon,
  RocketLaunchIcon,
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type ProposalTypeValue = "APP_CHANGES" | "GENERAL_CONSENSUS" | "OTHER";

// Component to display edit history for a wiki page
const WikiEditHistory = ({ pageId, pageData }: { pageId: bigint; pageData?: any }) => {
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

  const hasEdits = editHistory && editHistory.length > 0;
  const showOriginal = pageData && pageData.contributors && pageData.contributors.length > 0;

  if (!hasEdits && !showOriginal) {
    return <div className="rounded-2xl border border-base-content/10 bg-base-content/5 p-3 text-sm text-base-content/60">No edit history yet.</div>;
  }

  return (
    <div className="max-h-96 space-y-3 overflow-y-auto">
      <h5 className="text-sm font-semibold text-base-content/70">Version history</h5>
      
      {/* Show subsequent edits first (newest to oldest) */}
      {hasEdits && editHistory.map((editId: bigint, index: number) => (
        <WikiEditItem key={`edit-${index}`} editId={editId} onLikeEdit={handleLikeEdit} />
      ))}
      
      {/* Show original version last */}
      {showOriginal && (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-amber-300/40 bg-amber-400/20 px-2 py-0.5 text-xs uppercase tracking-wider text-amber-100">
                  Original
                </span>
                <Address address={pageData.contributors[0]} />
              </div>
              <p className="text-sm text-base-content/80">
                {pageData.currentContent?.length > 140
                  ? `${pageData.currentContent.substring(0, 140)}...`
                  : pageData.currentContent || "Initial wiki entry"}
              </p>
              <p className="text-xs text-base-content/50">
                Created {pageData.lastEditTime ? new Date(Number(pageData.lastEditTime) * 1000).toLocaleString() : "recently"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="rounded-full border border-base-content/15 bg-base-content/10 px-3 py-1 text-xs text-base-content/70">
                📖 First edition
              </span>
              <p className="text-xs text-base-content/50">No likes on originals</p>
            </div>
          </div>
        </div>
      )}
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
    return <div className="text-sm text-base-content/60">Loading edit...</div>;
  }

  return (
    <div className="rounded-2xl border border-base-content/10 bg-base-content/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Address address={editData.editor} />
          <p className="text-sm text-base-content/80">
            {editData.content.length > 140 ? `${editData.content.substring(0, 140)}...` : editData.content}
          </p>
          <p className="text-xs text-base-content/50">{new Date(Number(editData.timestamp) * 1000).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-base-content/15 bg-base-content/10 px-3 py-1 text-xs text-base-content/70">
            {Number(editData.likes)} ❤️
          </span>
          <button
            className="btn btn-xs border border-base-content/20 bg-base-content/10 text-base-content hover:border-base-content/40 hover:bg-base-content/20"
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
    <div className="mt-4 space-y-2 border-l border-base-content/20 pl-4">
      <h5 className="text-sm font-semibold text-base-content/70">Replies ({replyIds.length})</h5>
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
    <div className="rounded-2xl border border-base-content/10 bg-base-content/5 p-4 shadow-inner backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Address address={reply.author} />
          <p className="text-sm text-base-content/80">{reply.content}</p>
          <p className="text-xs text-base-content/50">
            {new Date(Number(reply.timestamp) * 1000).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-base-content/15 bg-base-content/10 px-3 py-1 text-xs font-semibold text-base-content/80">
            {Number(reply.likes)} ❤️
          </span>
          <button className="btn btn-xs border border-base-content/20 bg-base-content/10 text-base-content hover:border-base-content/40 hover:bg-base-content/20" onClick={onLike}>
            Like
          </button>
        </div>
      </div>
    </div>
  );
};

export const ClassDAOApp = () => {
  const { address: connectedAddress } = useAccount();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";
  const [petName, setPetName] = useState("");
  const [postContent, setPostContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalDescription, setProposalDescription] = useState("");
  const [proposalType, setProposalType] = useState<ProposalTypeValue>("APP_CHANGES");
  const [wikiTxnHash, setWikiTxnHash] = useState("");
  const [wikiContent, setWikiContent] = useState("");
  const [wikiSearch, setWikiSearch] = useState("");
  const [showReplyForm, setShowReplyForm] = useState<number | null>(null);
  const [replyingToPost, setReplyingToPost] = useState<bigint | null>(null);
  const [editingWikiPage, setEditingWikiPage] = useState<number | null>(null);
  const [wikiEditContent, setWikiEditContent] = useState("");
  const [showWikiHistory, setShowWikiHistory] = useState<number | null>(null);
  const [discussionSearch, setDiscussionSearch] = useState("");
  const [likedWikiPages, setLikedWikiPages] = useState<Set<number>>(new Set());

  // Contract hooks
  const { data: studentNFT } = useScaffoldContract({
    contractName: "StudentNFT",
  });

  const { data: pointsManager } = useScaffoldContract({
    contractName: "PointsManager", 
  });

  const { data: discussionForum } = useScaffoldContract({
    contractName: "DiscussionForum",
  });

  const { data: classDAO } = useScaffoldContract({
    contractName: "ClassDAO",
  });

  const { data: wikipediaManager } = useScaffoldContract({
    contractName: "WikipediaManager",
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
      const typeValue = proposalTypeValueMap[proposalType];
      await createProposal({
        functionName: "createProposal",
        args: [proposalTitle, proposalDescription, typeValue],
      });
      setProposalTitle("");
      setProposalDescription("");
      setProposalType("APP_CHANGES");
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
      // Parse content to extract metadata fields (Date, Type, Sources, etc.) and summary
      const lines = wikiContent.split('\n');
      const metadataLines: string[] = [];
      const summaryLines: string[] = [];
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        // Check if line starts with emoji indicators for metadata
        if (trimmedLine.match(/^[📅🏷️🔗📌]/)) {
          metadataLines.push(trimmedLine);
        } else if (trimmedLine.startsWith('📝 Summary:')) {
          summaryLines.push(trimmedLine.replace('📝 Summary:', '').trim());
        } else if (summaryLines.length > 0 || trimmedLine.length > 0) {
          summaryLines.push(trimmedLine);
        }
      });
      
      const metadata = metadataLines.join('\n');
      const summary = summaryLines.join('\n').trim();
      
      await createWikiPage({
        functionName: "createWikiPage",
        args: [wikiTxnHash, summary || wikiContent, metadata],
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
      // Parse edit content to extract metadata and summary
      const lines = wikiEditContent.split('\n');
      const metadataLines: string[] = [];
      const summaryLines: string[] = [];
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.match(/^[📅🏷️🔗📌]/)) {
          metadataLines.push(trimmedLine);
        } else if (trimmedLine.startsWith('📝 Summary:')) {
          summaryLines.push(trimmedLine.replace('📝 Summary:', '').trim());
        } else if (summaryLines.length > 0 || trimmedLine.length > 0) {
          summaryLines.push(trimmedLine);
        }
      });
      
      const metadata = metadataLines.join('\n');
      const summary = summaryLines.join('\n').trim();
      
      await editWikiPage({
        functionName: "editWikiPage",
        args: [pageId, summary || wikiEditContent, metadata],
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

  const handleLikeWikiPage = (pageIndex: number) => {
    setLikedWikiPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageIndex)) {
        newSet.delete(pageIndex);
      } else {
        newSet.add(pageIndex);
      }
      return newSet;
    });
  };

  const formatWikiContent = (content: string) => {
    if (!content) return content;
    
    let formatted = content;
    
    // Convert URLs to clickable links
    formatted = formatted.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-sky-300 hover:text-sky-200 underline">$1</a>'
    );
    
    // Convert **bold** to <strong>
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-base-content">$1</strong>');
    
    // Convert *italic* to <em>
    formatted = formatted.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
    
    // Convert line breaks to <br/>
    formatted = formatted.replace(/\n/g, '<br/>');
    
    return formatted;
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

  const getPetStageLabel = (level: number) => {
    if (level <= 3) return "Hatchling";
    if (level <= 6) return "Apprentice";
    if (level <= 10) return "Scholar";
    if (level <= 15) return "Guardian";
    return "Legend";
  };

  const ownsNFT = Boolean(hasNFT);
  const studentStats = studentData?.[1];
  const studentTokenId = studentData ? Number(studentData[0]) : undefined;
  const level = studentStats ? Number(studentStats.level) : 0;
  const totalPoints = studentStats ? Number(studentStats.totalPoints) : 0;
  const pointsIntoCurrentLevel = totalPoints % 5;
  const pointsNeededForNextLevel = pointsIntoCurrentLevel === 0 && totalPoints !== 0 ? 5 : 5 - pointsIntoCurrentLevel;
  const xpProgressPercent = (pointsIntoCurrentLevel / 5) * 100;
  const petEmoji = getPetEmoji(level);
  const petStage = getPetStageLabel(level);
  const normalizedAddress = connectedAddress?.toLowerCase();
  const heroSectionId = ownsNFT ? undefined : "mint-nft";
  const floatingPanelBase =
    "relative overflow-hidden rounded-3xl border border-base-content/10 bg-base-content/5 text-base-content backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(99,102,241,0.4)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_24px_70px_-20px_rgba(99,102,241,0.5)]";
  const floatingCardBase =
    "relative rounded-2xl border border-base-content/10 bg-base-content/5 text-base-content backdrop-blur-lg shadow-[0_8px_32px_-8px_rgba(99,102,241,0.3)] transition-all duration-300 hover:scale-[1.02]";
  const inputFieldClass =
    "w-full rounded-xl border border-base-content/10 bg-base-content/5 px-4 py-3 text-sm text-base-content placeholder:text-base-content/40 focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 transition-all";
  const textareaFieldClass =
    "w-full rounded-xl border border-base-content/10 bg-base-content/5 px-4 py-3 text-sm text-base-content placeholder:text-base-content/40 focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 transition-all";
  const proposalTypeValueMap: Record<ProposalTypeValue, number> = {
    APP_CHANGES: 0,
    GENERAL_CONSENSUS: 1,
    OTHER: 2,
  };
  const proposalTypeOptions: { value: ProposalTypeValue; label: string; hint: string }[] = [
    {
      value: "APP_CHANGES",
      label: "App changes",
      hint: "Product or interface tweaks",
    },
    {
      value: "GENERAL_CONSENSUS",
      label: "Consensus",
      hint: "Signals and social coordination",
    },
    {
      value: "OTHER",
      label: "Other",
      hint: "Experiments or misc notes",
    },
  ];
  const proposalTypeLabelMap = {
    "0": "App changes",
    "1": "Consensus",
    "2": "Other",
  } as const;
  const proposalTypeStyleMap = {
    "0": "border-sky-400/40 bg-sky-400/15 text-sky-100",
    "1": "border-emerald-400/40 bg-emerald-400/15 text-emerald-100",
    "2": "border-fuchsia-400/40 bg-fuchsia-400/15 text-fuchsia-100",
  } as const;
  const filteredPosts = useMemo(() => {
    if (!Array.isArray(allPosts)) return [] as any[];
    if (!discussionSearch.trim()) return allPosts;
    const term = discussionSearch.toLowerCase();
    return allPosts.filter((post: any) => {
      const content = String(post.content ?? "").toLowerCase();
      const author = String(post.author ?? "").toLowerCase();
      return content.includes(term) || author.includes(term);
    });
  }, [allPosts, discussionSearch]);

  const proposalTypeCounts = useMemo(() => {
    const base = { "0": 0, "1": 0, "2": 0 };
    if (!Array.isArray(allProposals)) return base;
    return allProposals.reduce((acc, proposal: any) => {
      const key = String(Number(proposal.proposalType ?? 0)) as keyof typeof acc;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, { ...base });
  }, [allProposals]);

  const filteredWikiPages = useMemo(() => {
    if (!Array.isArray(allWikiPages)) return [] as any[];
    if (!wikiSearch.trim()) return allWikiPages;
    const term = wikiSearch.toLowerCase();
    return allWikiPages.filter((page: any) => {
      const hash = String(page.txnHash ?? "").toLowerCase();
      const content = String(page.currentContent ?? "").toLowerCase();
      const contributors = Array.isArray(page.contributors)
        ? page.contributors.some((addr: string) => addr?.toLowerCase().includes(term))
        : false;
      return hash.includes(term) || content.includes(term) || contributors;
    });
  }, [allWikiPages, wikiSearch]);

  const selectedProposalType = proposalTypeOptions.find(option => option.value === proposalType);

  const recentActivity = useMemo(() => {
    const items: { type: string; title: string; timestamp: number; tab?: string }[] = [];

    if (normalizedAddress && Array.isArray(allPosts)) {
      allPosts
        .filter((post: any) => String(post.author).toLowerCase() === normalizedAddress)
        .forEach((post: any) => {
          items.push({
            type: "Discussion",
            title: post.content?.slice(0, 80) || "Discussion post",
            timestamp: Number(post.timestamp) * 1000,
            tab: "discussion",
          });
        });
    }

    if (normalizedAddress && Array.isArray(allProposals)) {
      allProposals
        .filter((proposal: any) => String(proposal.proposer).toLowerCase() === normalizedAddress)
        .forEach((proposal: any) => {
          items.push({
            type: "Proposal",
            title: proposal.title || "DAO proposal",
            timestamp: Number(proposal.createdAt) * 1000,
            tab: "dao",
          });
        });
    }

    if (normalizedAddress && Array.isArray(allWikiPages)) {
      allWikiPages
        .filter((page: any) =>
          Array.isArray(page.contributors) &&
          page.contributors.some((addr: string) => addr.toLowerCase() === normalizedAddress)
        )
        .forEach((page: any) => {
          items.push({
            type: "Wiki",
            title: `Updated ${page.txnHash?.slice(0, 12)}...`,
            timestamp: Number(page.lastEditTime) * 1000,
            tab: "wiki",
          });
        });
    }

    return items
      .filter((item) => !Number.isNaN(item.timestamp))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  }, [allPosts, allProposals, allWikiPages, normalizedAddress]);

  const activeGovernancePrompts = useMemo(() => {
    if (!Array.isArray(allProposals)) return [] as any[];

    const now = Date.now();
    return allProposals
      .filter((proposal: any) => !proposal.executed && Number(proposal.deadline) * 1000 > now)
      .slice(0, 3);
  }, [allProposals]);

  const quickActions = useMemo(() => {
    const actions: { label: string; description: string; tab?: string; anchor?: string }[] = [];

    if (!ownsNFT) {
      actions.push({
        label: "Mint your student NFT",
        description: "Choose a pet companion and claim your ClassDAO identity.",
        anchor: "mint-nft",
      });
      actions.push({
        label: "Learn how the DAO works",
        description: "Read our quick guide and see how proposals are created and executed.",
        tab: "dao",
      });
    } else {
      actions.push({
        label: "Earn points in Discussions",
        description: "Share an insight or reply to earn XP and level up your pet.",
        tab: "discussion",
      });

      if (pointsNeededForNextLevel > 0) {
        actions.push({
          label: `Only ${pointsNeededForNextLevel} point${pointsNeededForNextLevel === 1 ? "" : "s"} to next level`,
          description: "Create a post or update the TXN wiki to push your pet forward.",
          tab: "wiki",
        });
      }

      if (activeGovernancePrompts.length > 0) {
        actions.push({
          label: `Vote on ${activeGovernancePrompts.length} proposal${activeGovernancePrompts.length > 1 ? "s" : ""}`,
          description: "Help steer ClassDAO by casting your vote before deadlines expire.",
          tab: "dao",
        });
      }
    }

    return actions.slice(0, 3);
  }, [activeGovernancePrompts.length, ownsNFT, pointsNeededForNextLevel]);

  const tabLink = (tab: string) => ({ pathname: "/", query: { tab } });

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
    <div className="relative min-h-screen overflow-hidden bg-base-200">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_55%)] dark:opacity-100 opacity-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(6,182,212,0.12),_transparent_60%)] dark:opacity-100 opacity-0" />
      <div className="relative z-10 pb-16">
        <header className="flex justify-center px-4 pt-12">
          <div className="relative flex w-full max-w-6xl items-center justify-between overflow-hidden rounded-2xl border border-base-content/10 bg-base-content/5 px-8 py-6 text-base-content shadow-[0_8px_32px_-8px_rgba(99,102,241,0.4)] backdrop-blur-xl">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">ClassDAO</span>
              <h1 className="text-xl font-semibold sm:text-2xl">Student command center</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden text-xs font-medium uppercase tracking-[0.2em] text-base-content/50 sm:inline">Connected</span>
              <div className="flex items-center gap-2 rounded-full border border-base-content/10 bg-base-content/10 px-4 py-2">
                <Address address={connectedAddress} format="short" />
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto my-12 w-full max-w-6xl px-4 sm:px-6">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-10">
            <section className={`${floatingPanelBase} p-8 sm:p-10`}>
              <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
                <SparklesIcon className="h-4 w-4" />
                How it works
              </span>
              <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
                <div className="space-y-5 text-base text-base-content/75">
                  <h2 className="text-2xl font-semibold text-base-content">Collect, collaborate, govern.</h2>
                  <p>
                    Mint a student NFT to prove you&apos;re part of the cohort, earn XP for useful contributions, and unlock
                    voting power to steer the roadmap. Every action you take feeds your pet companion and builds the shared
                    knowledge base.
                  </p>
                  <p>
                    Three systems power the experience: the Student NFT establishes identity, the Points Manager tracks XP,
                    and the DAO plus TXN Wiki let the class propose changes and document crypto-native learnings together.
                  </p>
                </div>
                <div className="grid gap-4 text-sm">
                  <div className="group rounded-2xl border border-base-content/10 bg-gradient-to-br from-base-content/5 to-base-content/[0.02] p-5 transition-all hover:border-cyan-400/30 hover:shadow-[0_0_20px_-5px_rgba(34,211,238,0.3)]">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">1. Mint</p>
                    <p className="mt-3 text-base-content/80">Claim your on-chain passport + pet buddy.</p>
                  </div>
                  <div className="group rounded-2xl border border-base-content/10 bg-gradient-to-br from-base-content/5 to-base-content/[0.02] p-5 transition-all hover:border-cyan-400/30 hover:shadow-[0_0_20px_-5px_rgba(34,211,238,0.3)]">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">2. Contribute</p>
                    <p className="mt-3 text-base-content/80">Post, reply, and co-write the TXN wiki to earn XP.</p>
                  </div>
                  <div className="group rounded-2xl border border-base-content/10 bg-gradient-to-br from-base-content/5 to-base-content/[0.02] p-5 transition-all hover:border-cyan-400/30 hover:shadow-[0_0_20px_-5px_rgba(34,211,238,0.3)]">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">3. Govern</p>
                    <p className="mt-3 text-base-content/80">Use proposal types to guide what the class ships next.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id={heroSectionId} className="relative overflow-hidden rounded-3xl p-0">
              <div className="relative flex flex-col gap-12 p-10 sm:p-12 lg:flex-row lg:items-center lg:gap-16">
                {ownsNFT ? (
                  <>
                    <div className="flex-1 space-y-7">
                      <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
                        <SparklesIcon className="h-4 w-4" />
                        Welcome back
                      </span>
                      <h1 className="text-4xl font-semibold sm:text-5xl text-base-content">Hey {studentStats?.petName || "Explorer"}!</h1>
                      <p className="text-base text-base-content/70 sm:text-lg">
                        Keep completing quests to evolve your companion and grow your voting power.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Link href={tabLink("discussion")} className="btn btn-secondary btn-sm sm:btn-md shadow-lg">
                          Earn XP
                        </Link>
                        <Link
                          href={tabLink("dao")}
                          className="btn btn-outline btn-sm sm:btn-md border-base-content/40 hover:bg-base-content/10"
                        >
                          View proposals
                        </Link>
                      </div>
                      <div className="grid gap-4 pt-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-base-content/15 bg-base-content/5 p-4">
                          <p className="text-xs uppercase tracking-[0.3em] text-base-content/60">Total XP</p>
                          <p className="mt-3 text-2xl font-semibold">{totalPoints}</p>
                          <p className="mt-1 text-sm text-base-content/60">
                            {studentTokenId !== undefined ? `Token #${studentTokenId}` : "Fetching token ID..."}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-base-content/15 bg-base-content/5 p-4">
                          <p className="text-xs uppercase tracking-[0.3em] text-base-content/60">Next milestone</p>
                          <p className="mt-3 text-2xl font-semibold">
                            {pointsNeededForNextLevel === 0 ? "Evolution ready" : `${pointsNeededForNextLevel} XP`}
                          </p>
                          <p className="mt-1 text-sm text-base-content/60">{pointsIntoCurrentLevel}/5 XP this level</p>
                        </div>
                      </div>
                    </div>
                    {/* Holographic NFT Card */}
                    <div className="group relative w-full max-w-sm">
                      {/* Holographic border glow */}
                      <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-500 opacity-60 blur-md transition-all duration-500 group-hover:opacity-100 group-hover:blur-lg" />
                      
                      {/* Main NFT card */}
                      <div className="relative flex flex-col items-center gap-5 rounded-3xl border border-white/20 dark:border-white/20 bg-gradient-to-br from-indigo-950/90 via-indigo-900/80 to-cyan-950/90 p-8 backdrop-blur-xl transition-all duration-300 group-hover:scale-[1.02]">
                        {/* Shine overlay on hover */}
                        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        
                        {/* Pet with animated glow */}
                        <div className="relative">
                          <div className="absolute -inset-8 animate-pulse rounded-full bg-cyan-400/30 blur-3xl" />
                          <span className="relative z-10 block text-7xl transition-transform duration-300 group-hover:scale-110">{petEmoji}</span>
                        </div>
                        
                        {/* Stage label */}
                        <div className="relative z-10 space-y-1 text-center">
                          <p className="text-xs font-medium uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-400">{petStage}</p>
                          <p className="text-3xl font-bold text-base-content">Level {level}</p>
                        </div>
                        
                        {/* XP Progress bar */}
                        <div className="relative z-10 w-full space-y-2">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-base-content/10">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-all duration-500"
                              style={{ width: `${xpProgressPercent}%` }}
                            />
                          </div>
                          <p className="text-center text-xs text-base-content/70">
                            {pointsNeededForNextLevel === 0
                              ? "🎉 Evolution ready!"
                              : `${pointsIntoCurrentLevel}/5 XP • ${pointsNeededForNextLevel} to evolve`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-600 dark:text-cyan-400">
                      <RocketLaunchIcon className="h-4 w-4" />
                      Start your journey
                    </span>
                    <h1 className="text-3xl font-semibold sm:text-4xl text-base-content">Mint your ClassDAO student NFT</h1>
                    <p className="text-sm text-base-content/70 sm:text-base">
                      Choose a name for your pet companion and unlock XP, quests, and voting rights.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                      <label className="text-sm text-base-content/70">
                        Pet name
                        <input
                          type="text"
                          className="mt-2 w-full rounded-xl border border-base-content/30 bg-base-content/10 p-3 text-base-content placeholder:text-base-content/40 focus:border-base-content focus:outline-none"
                          placeholder="e.g., Fluffy"
                          value={petName}
                          onChange={(e) => setPetName(e.target.value)}
                        />
                      </label>
                      <button className="btn btn-secondary" onClick={handleMintNFT} disabled={!petName.trim()}>
                        Mint student NFT
                      </button>
                    </div>
                    <p className="text-sm text-base-content/70">
                      Already minted?{" "}
                      <Link href={tabLink("discussion")} className="underline decoration-base-content/40 hover:decoration-base-content">
                        Jump into the discussion feed
                      </Link>
                      .
                    </p>
                  </div>
                )}
              </div>
            </section>

            {ownsNFT ? (
              <>
                {/* Unified Stats Dashboard */}
                <section className={`${floatingPanelBase} overflow-hidden p-0`}>
                  <div className="grid divide-x divide-base-content/10 md:grid-cols-2 xl:grid-cols-4">
                    <div className="group p-8 transition-colors hover:bg-base-content/5">
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">Level</p>
                      <p className="mt-4 text-4xl font-bold text-base-content">{level}</p>
                      <p className="mt-3 text-sm text-base-content/60">Keep contributing to evolve</p>
                    </div>
                    <div className="group p-8 transition-colors hover:bg-base-content/5">
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">Total XP</p>
                      <p className="mt-4 text-4xl font-bold text-base-content">{totalPoints}</p>
                      <p className="mt-3 text-sm text-base-content/60">Earn likes to level up</p>
                    </div>
                    <div className="group p-8 transition-colors hover:bg-base-content/5">
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">Next level</p>
                      <p className="mt-4 text-4xl font-bold text-base-content">
                        {pointsNeededForNextLevel === 0 ? "✓" : pointsNeededForNextLevel}
                      </p>
                      <p className="mt-3 text-sm text-base-content/60">{pointsIntoCurrentLevel}/5 XP this level</p>
                    </div>
                    <div className="group p-8 transition-colors hover:bg-base-content/5">
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">Token ID</p>
                      <p className="mt-4 text-4xl font-bold text-base-content">
                        {studentTokenId !== undefined ? `#${studentTokenId}` : "..."}
                      </p>
                      <p className="mt-3 text-sm text-base-content/60">Your on-chain record</p>
                    </div>
                  </div>
                </section>

                <section className="grid gap-5 lg:grid-cols-2">
                  <div className={`${floatingPanelBase} p-6`}>
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-400">Quick actions</span>
                    <h3 className="mt-3 text-2xl font-semibold text-base-content">Momentum builders</h3>
                    <p className="text-sm text-base-content/70">Pulled from live on-chain data to help you level faster.</p>
                    <ul className="mt-6 space-y-3">
                      {quickActions.length > 0 ? (
                        quickActions.map((action, index) => (
                          <li
                            key={index}
                            className="flex items-start justify-between gap-3 rounded-2xl border border-base-content/15 bg-base-content/5 p-4 transition duration-200 hover:bg-base-content/10"
                          >
                            <div className="space-y-1">
                              <p className="font-medium text-base-content">{action.label}</p>
                              <p className="text-sm text-base-content/70">{action.description}</p>
                            </div>
                            <Link
                              href={action.anchor ? `#${action.anchor}` : action.tab ? tabLink(action.tab) : "/"}
                              className="btn btn-ghost btn-circle btn-sm hover:bg-base-content/10"
                            >
                              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                            </Link>
                          </li>
                        ))
                      ) : (
                        <li className="rounded-2xl bg-base-content/10 p-4 text-sm text-base-content/70">
                          You’re all set for now. Check back after the next class session.
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className={`${floatingPanelBase} p-6`}>
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-base-content/60">Recent activity</span>
                    <h3 className="mt-3 text-2xl font-semibold">Your latest moves</h3>
                    <p className="text-sm text-base-content/70">Keep an eye on what you’ve shipped across the DAO.</p>
                    <ul className="mt-6 space-y-3">
                      {recentActivity.length > 0 ? (
                        recentActivity.map((activity, index) => (
                          <li
                            key={index}
                            className="rounded-2xl border border-base-content/15 bg-base-content/5 p-4 transition duration-200 hover:bg-base-content/10"
                          >
                            <p className="text-xs uppercase tracking-[0.3em] text-base-content/60">{activity.type}</p>
                            <p className="mt-1 text-sm font-medium text-base-content">{activity.title}</p>
                            <p className="text-xs text-base-content/60">{new Date(activity.timestamp).toLocaleString()}</p>
                            <div className="mt-3">
                              <Link
                                href={activity.tab ? tabLink(activity.tab) : "/"}
                                className="inline-flex items-center gap-2 text-sm font-medium text-base-content hover:text-base-content/80"
                              >
                                Open section
                                <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                              </Link>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="rounded-2xl bg-base-content/10 p-4 text-sm text-base-content/70">
                          No on-chain activity yet. Try a quick action to get started.
                        </li>
                      )}
                    </ul>
                  </div>
                </section>

                <section className={`${floatingPanelBase} p-6`}>
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-base-content/60">Contract center</span>
                  <h3 className="mt-3 text-2xl font-semibold">Everything powering ClassDAO</h3>
                  <p className="text-sm text-base-content/70">One tap access to every core contract.</p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-base-content/15 bg-base-content/5 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-base-content/60">Student NFT</p>
                      <div className="mt-2">
                        <Address address={studentNFT?.address} format="short" />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-base-content/15 bg-base-content/5 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-base-content/60">Points manager</p>
                      <div className="mt-2">
                        <Address address={pointsManager?.address} format="short" />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-base-content/15 bg-base-content/5 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-base-content/60">Discussion forum</p>
                      <div className="mt-2">
                        <Address address={discussionForum?.address} format="short" />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-base-content/15 bg-base-content/5 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-base-content/60">ClassDAO</p>
                      <div className="mt-2">
                        <Address address={classDAO?.address} format="short" />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-base-content/15 bg-base-content/5 p-4 sm:col-span-2">
                      <p className="text-xs uppercase tracking-[0.3em] text-base-content/60">Wikipedia manager</p>
                      <div className="mt-2">
                        <Address address={wikipediaManager?.address} format="short" />
                      </div>
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <section className="grid gap-5 lg:grid-cols-3">
                <div className={`${floatingPanelBase} p-6 lg:col-span-2`}>
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-base-content/60">Why mint?</span>
                  <h3 className="mt-3 text-2xl font-semibold">Claim your on-chain identity</h3>
                  <ul className="mt-4 space-y-3 text-sm text-base-content/70">
                    <li>✅ Unlock a custom pet companion and on-chain identity.</li>
                    <li>✅ Earn XP from posts, replies, and wiki edits that the community upvotes.</li>
                    <li>✅ Gain voting power to steer the ClassDAO roadmap.</li>
                  </ul>
                </div>
                <div className={`${floatingPanelBase} p-6`}>
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-base-content/60">Need help?</span>
                  <h3 className="mt-3 text-2xl font-semibold">Explore the DAO first</h3>
                  <p className="mt-3 text-sm text-base-content/70">
                    Check the DAO tab for proposal walkthroughs or the discussion feed to see how others are earning XP.
                  </p>
                  <div className="mt-5 flex flex-col gap-3">
                    <Link href={tabLink("dao")} className="btn btn-outline btn-sm border-base-content/40 text-base-content hover:bg-base-content/10">
                      Explore DAO
                    </Link>
                    <Link href={tabLink("discussion")} className="btn btn-outline btn-sm border-base-content/40 text-base-content hover:bg-base-content/10">
                      Peek at discussions
                    </Link>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {/* Discussion Tab */}
        {activeTab === "discussion" && (
          <div className="space-y-8">
            {hasNFT ? (
              <>
                <section className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-semibold text-base-content">Discussion arena</h2>
                    <p className="text-base text-base-content/65">Share updates, answer questions, and earn XP when peers react.</p>
                  </div>
                  <div className="relative w-full md:w-80">
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-400/60" />
                    <input
                      type="search"
                      className={`pl-11 ${inputFieldClass}`}
                      placeholder="Search posts or authors"
                      value={discussionSearch}
                      onChange={(e) => setDiscussionSearch(e.target.value)}
                    />
                  </div>
                </section>

                <section className={`${floatingPanelBase} p-8`}> 
                  <div className="flex flex-col gap-5">
                    <div>
                      <h2 className="text-xl font-semibold">Share something new 📝</h2>
                      <p className="text-sm text-base-content/65">Spark a conversation and earn XP when your classmates react.</p>
                    </div>
                    <textarea
                      className={`${textareaFieldClass} min-h-[140px]`}
                      placeholder="Drop your latest insight, question, or resource..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <button
                        className="btn btn-secondary px-6"
                        onClick={handleCreatePost}
                        disabled={!postContent.trim()}
                      >
                        Post 📤
                      </button>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-base-content">Community feed</h3>
                    <span className="text-xs uppercase tracking-[0.3em] text-base-content/50">Live</span>
                  </div>
                  {(() => {
                    if (!Array.isArray(allPosts)) {
                      return <div className={`${floatingPanelBase} p-6 text-sm text-base-content/70`}>Loading posts...</div>;
                    }

                    if (filteredPosts.length === 0) {
                      return (
                        <div className={`${floatingPanelBase} p-6 text-sm text-base-content/70`}>
                          {discussionSearch.trim()
                            ? "No posts match your search. Try a different keyword."
                            : "No posts yet. Be the first to share something and earn XP! 🚀"}
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {filteredPosts.map((post: any, index: number) => (
                          <article key={index} className={`${floatingPanelBase} p-5`}>
                            <div className="flex flex-col gap-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 space-y-2">
                                  <Address address={post.author} />
                                  <p className="text-sm leading-relaxed text-base-content/80">{post.content}</p>
                                  <time className="block text-xs text-base-content/50">
                                    {new Date(Number(post.timestamp) * 1000).toLocaleString()}
                                  </time>
                                </div>
                                <div className="flex flex-col items-end gap-2 text-sm text-base-content/60">
                                  <span className="rounded-full border border-base-content/15 bg-base-content/10 px-3 py-1 font-semibold text-base-content/80">
                                    {Number(post.likes)} ❤️
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      className="btn btn-xs border border-base-content/20 bg-base-content/10 text-base-content hover:border-base-content/40 hover:bg-base-content/20"
                                      onClick={() => handleLikePost(post.id)}
                                    >
                                      Like
                                    </button>
                                    <button
                                      className="btn btn-xs border border-base-content/20 bg-secondary/20 text-base-content hover:border-base-content/40 hover:bg-secondary/30"
                                      onClick={() => handleShowReplyForm(index, post.id)}
                                    >
                                      Reply
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <PostReplies postId={post.id} />

                              {showReplyForm === index && (
                                <div className="rounded-2xl border border-base-content/10 bg-base-content/5 p-4 backdrop-blur-xl">
                                  <h4 className="text-sm font-semibold text-base-content/80">Reply to this post</h4>
                                  <textarea
                                    className={`${textareaFieldClass} mt-3 min-h-[110px]`}
                                    placeholder="Write your reply..."
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                  />
                                  <div className="mt-3 flex justify-end gap-2">
                                    <button
                                      className="btn btn-sm border border-base-content/20 bg-base-content/10 text-base-content hover:border-base-content/40 hover:bg-base-content/20"
                                      onClick={() => {
                                        setShowReplyForm(null);
                                        setReplyContent("");
                                        setReplyingToPost(null);
                                      }}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      className="btn btn-sm btn-secondary"
                                      onClick={() => replyingToPost && handleCreateReply(replyingToPost)}
                                      disabled={!replyContent.trim()}
                                    >
                                      Post Reply 📤
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                    );
                  })()}
                </section>
              </>
            ) : (
              <div className={`${floatingPanelBase} p-6 text-white`}>
                <h3 className="text-lg font-semibold">Mint your student NFT to join the conversation</h3>
                <p className="mt-2 text-sm text-base-content/70">
                  Claim your ClassDAO identity in the Profile tab and unlock the ability to post, reply, and earn XP.
                </p>
              </div>
            )}
          </div>
        )}

        {/* DAO Tab */}
        {activeTab === "dao" && (
          <div className="space-y-8">
            {hasNFT ? (
              <>
                <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-semibold text-base-content">Governance hub</h2>
                    <p className="text-sm text-base-content/60">Route decisions with proposal types and rally classmates to vote.</p>
                  </div>
                  <div className="grid w-full gap-3 sm:grid-cols-3 md:w-auto">
                    {Object.entries(proposalTypeLabelMap).map(([key, label]) => {
                      const style = proposalTypeStyleMap[key as keyof typeof proposalTypeStyleMap] ??
                        "border-base-content/15 bg-base-content/10 text-base-content/70";
                      const count = proposalTypeCounts[key as keyof typeof proposalTypeCounts] ?? 0;
                      return (
                        <div
                          key={key}
                          className={`rounded-2xl border px-4 py-3 text-sm ${style}`}
                        >
                          <p className="text-xs uppercase tracking-[0.3em]">{label}</p>
                          <p className="mt-2 text-lg font-semibold text-base-content">{count}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className={`${floatingPanelBase} p-8`}>
                  <div className="flex flex-col gap-5">
                    <div>
                      <h2 className="text-xl font-semibold">Create a proposal 🗳️</h2>
                      <p className="text-sm text-base-content/65">Set the agenda for your cohort and rally votes from fellow builders.</p>
                    </div>
                    <input
                      type="text"
                      className={inputFieldClass}
                      placeholder="Proposal title"
                      value={proposalTitle}
                      onChange={(e) => setProposalTitle(e.target.value)}
                    />
                    <div className="flex flex-col gap-1">
                      <label className="text-xs uppercase tracking-[0.3em] text-base-content/45">Proposal type</label>
                      <select
                        className={`${inputFieldClass} appearance-none`}
                        value={proposalType}
                        onChange={(e) => setProposalType(e.target.value as ProposalTypeValue)}
                      >
                        {proposalTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-base-content/50">{selectedProposalType?.hint}</p>
                    </div>
                    <textarea
                      className={`${textareaFieldClass} min-h-[140px]`}
                      placeholder="Describe the change, impact, and any resources..."
                      value={proposalDescription}
                      onChange={(e) => setProposalDescription(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <button
                        className="btn btn-secondary px-6"
                        onClick={handleCreateProposal}
                        disabled={!proposalTitle.trim() || !proposalDescription.trim()}
                      >
                        Launch proposal 📋
                      </button>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-base-content">Active proposals</h3>
                    <span className="text-xs uppercase tracking-[0.3em] text-base-content/50">
                      {Array.isArray(allProposals) ? `${allProposals.length} live` : "Loading"}
                    </span>
                  </div>
                  {Array.isArray(allProposals) && allProposals.length > 0 ? (
                    <div className="space-y-4">
                      {allProposals.map((proposal: any, index: number) => {
                        const deadline = Number(proposal.deadline) * 1000;
                        const typeIndex = Number(proposal.proposalType ?? 0);
                        const typeKey = String(typeIndex) as keyof typeof proposalTypeLabelMap;
                        const typeLabel = proposalTypeLabelMap[typeKey] ?? "App changes";
                        const typeBadgeClass = proposalTypeStyleMap[typeKey] ?? "border-base-content/15 bg-base-content/10 text-base-content/70";
                        return (
                          <article key={index} className={`${floatingPanelBase} p-6`}>
                            <div className="flex flex-col gap-5">
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-2">
                                  <h4 className="text-lg font-semibold text-base-content">{proposal.title || "Untitled proposal"}</h4>
                                  <p className="text-sm leading-relaxed text-base-content/75">{proposal.description}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2 text-right">
                                  <span className="rounded-full border border-base-content/15 bg-base-content/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-base-content/60">
                                    #{Number(proposal.id)}
                                  </span>
                                  <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.3em] ${typeBadgeClass}`}>
                                    {typeLabel}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 text-sm text-base-content/60">
                                <span className="text-xs uppercase tracking-[0.25em] text-base-content/45">Proposer</span>
                                <Address address={proposal.proposer} />
                                {deadline > 0 && (
                                  <span className="text-xs text-base-content/45">Closes {new Date(deadline).toLocaleString()}</span>
                                )}
                              </div>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-4 text-emerald-100">
                                  <p className="text-xs uppercase tracking-[0.3em]">For</p>
                                  <p className="mt-2 text-2xl font-semibold text-base-content">{Number(proposal.votesFor)}</p>
                                </div>
                                <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-4 text-rose-100">
                                  <p className="text-xs uppercase tracking-[0.3em]">Against</p>
                                  <p className="mt-2 text-2xl font-semibold text-base-content">{Number(proposal.votesAgainst)}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap justify-end gap-2">
                                <button
                                  className="btn btn-sm border border-emerald-300/40 bg-emerald-500/20 text-emerald-50 hover:border-emerald-300/60 hover:bg-emerald-500/30"
                                  onClick={() => handleVote(proposal.id, true)}
                                >
                                  Vote For ✅
                                </button>
                                <button
                                  className="btn btn-sm border border-rose-300/40 bg-rose-500/20 text-rose-50 hover:border-rose-300/60 hover:bg-rose-500/30"
                                  onClick={() => handleVote(proposal.id, false)}
                                >
                                  Vote Against ❌
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={`${floatingPanelBase} p-6 text-sm text-base-content/70`}>
                      No proposals yet. Launch the first vote to shape ClassDAO’s roadmap! 🚀
                    </div>
                  )}
                </section>
              </>
            ) : (
              <div className={`${floatingPanelBase} p-6 text-white`}>
                <h3 className="text-lg font-semibold">Mint your student NFT to access governance</h3>
                <p className="mt-2 text-sm text-base-content/70">
                  Only verified students can create proposals and vote. Head to the Profile tab, mint your NFT, and unlock
                  your governance powers.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Wiki Tab */}
        {activeTab === "wiki" && (
          <div className="space-y-10">
            {hasNFT ? (
              <>
                <section className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-semibold text-base-content">TXN wiki library</h2>
                    <p className="text-base text-base-content/65">
                      Chronicle on-chain moments, cite sources, and leave breadcrumbs for the next cohort.
                    </p>
                  </div>
                  <div className="relative w-full md:w-80">
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-400/60" />
                    <input
                      type="search"
                      className={`pl-11 ${inputFieldClass}`}
                      placeholder="Search hashes, keywords, or contributors"
                      value={wikiSearch}
                      onChange={(e) => setWikiSearch(e.target.value)}
                    />
                  </div>
                </section>

                <section className={`${floatingPanelBase} p-8`}>
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
                    <div className="flex-1 space-y-5">
                      <h3 className="text-xl font-semibold text-base-content">Publish a new entry</h3>
                      <p className="text-sm text-base-content/70">
                        Drop the transaction hash, summarize what happened, and link any resources. Peers can extend your work and
                        upvote edits that deserve XP.
                      </p>
                      <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-base-content/45">
                        Transaction hash
                        <input
                          type="text"
                          className={inputFieldClass}
                          placeholder="0x1234..."
                          value={wikiTxnHash}
                          onChange={(e) => setWikiTxnHash(e.target.value)}
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-base-content/45">
                        Entry details
                        <textarea
                          className={`${textareaFieldClass} min-h-[240px] font-mono text-sm`}
                          placeholder={`📅 Date: YYYY-MM-DD\n🏷️ Type: DeFi | NFT | Governance | Security | Other\n📝 Summary: Explain what happened and why it matters\n🔗 Sources: Links to explorers, docs, or articles\n📌 Notes: Future TODOs or related transactions`}
                          value={wikiContent}
                          onChange={(e) => setWikiContent(e.target.value)}
                        />
                      </label>
                      <div className="rounded-2xl border border-base-content/10 bg-base-content/5 p-3 text-sm text-base-content/70">
                        💡 <strong>Tip:</strong> Follow the template format above to make entries consistent and searchable. Include dates, transaction types, and sources for better documentation.
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 rounded-2xl border border-base-content/10 bg-base-content/5 p-4 text-sm text-base-content/70 lg:w-60">
                      <p className="text-xs uppercase tracking-[0.3em] text-base-content/50">Entry checklist</p>
                      <ul className="space-y-2">
                        <li>✅ Valid hash (0x...)</li>
                        <li>✅ Date included</li>
                        <li>✅ Type specified</li>
                        <li>✅ Clear summary</li>
                        <li>✅ Sources cited</li>
                      </ul>
                      <button
                        className="btn btn-secondary mt-2"
                        onClick={handleCreateWikiPage}
                        disabled={!wikiTxnHash.trim() || !wikiContent.trim()}
                      >
                        Create wiki page 📖
                      </button>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-base-content">Knowledge base</h3>
                    <span className="text-xs uppercase tracking-[0.3em] text-base-content/50">
                      {Array.isArray(allWikiPages) ? `${allWikiPages.length} entries` : "Loading"}
                    </span>
                  </div>
                  {filteredWikiPages.length > 0 ? (
                    <div className="space-y-5">
                      {filteredWikiPages.map((page: any, index: number) => {
                        const isEditing = editingWikiPage === index;
                        const historyOpen = showWikiHistory === index;
                        return (
                          <article key={index} className={`${floatingPanelBase} overflow-hidden p-0`}> 
                            <div className="relative grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_220px]">
                              <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400/50 via-violet-400/60 to-fuchsia-400/50" />
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <p className="text-xs uppercase tracking-[0.35em] text-base-content/45">Transaction</p>
                                  <h4 className="text-xl font-semibold text-base-content">
                                    {page.title?.length ? page.title : page.txnHash.slice(0, 12) + "..."}
                                  </h4>
                                  <code className="block rounded-lg bg-black/30 px-3 py-2 text-xs text-sky-200">
                                    {page.txnHash}
                                  </code>
                                </div>
                                {page.metadata && page.metadata.trim() && (
                                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs font-mono text-base-content/70">
                                    <div className="space-y-1">
                                      {page.metadata.split('\n').map((line: string, i: number) => (
                                        <div key={i}>{line}</div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="rounded-2xl border border-base-content/10 bg-base-content/5 p-4 text-sm leading-relaxed text-base-content/80">
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-xs uppercase tracking-[0.3em] text-base-content/50">Summary</h5>
                                    <button
                                      className={`btn btn-xs gap-1 ${
                                        likedWikiPages.has(index)
                                          ? 'border-rose-300/40 bg-rose-500/20 text-rose-100 hover:border-rose-300/60 hover:bg-rose-500/30'
                                          : 'border-base-content/20 bg-base-content/10 text-base-content hover:border-base-content/40 hover:bg-base-content/20'
                                      }`}
                                      onClick={() => handleLikeWikiPage(index)}
                                    >
                                      {likedWikiPages.has(index) ? '❤️' : '🤍'} Like
                                    </button>
                                  </div>
                                  <div
                                    className="mt-2"
                                    dangerouslySetInnerHTML={{ __html: formatWikiContent(page.currentContent) }}
                                  />
                                </div>
                                {isEditing && (
                                  <div className="rounded-2xl border border-base-content/10 bg-base-content/5 p-4">
                                    <h4 className="text-sm font-semibold text-base-content/80">Propose an update</h4>
                                    <textarea
                                      className={`${textareaFieldClass} mt-3 min-h-[200px] font-mono text-sm`}
                                      placeholder={`📅 Date: YYYY-MM-DD\n🏷️ Type: DeFi | NFT | Governance | Security | Other\n📝 Summary: Updated information or corrections\n🔗 Sources: Additional links\n📌 Notes: What changed and why`}
                                      value={wikiEditContent}
                                      onChange={(e) => setWikiEditContent(e.target.value)}
                                    />
                                    <div className="mt-3 flex justify-end gap-2">
                                      <button
                                        className="btn btn-sm border border-base-content/20 bg-base-content/10 text-base-content hover:border-base-content/40 hover:bg-base-content/20"
                                        onClick={() => {
                                          setEditingWikiPage(null);
                                          setWikiEditContent("");
                                        }}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => handleEditWikiPage(page.id)}
                                        disabled={!wikiEditContent.trim()}
                                      >
                                        Save edit 💾
                                      </button>
                                    </div>
                                  </div>
                                )}
                                {historyOpen && (
                                  <div className="rounded-2xl border border-base-content/10 bg-base-content/5 p-4">
                                    <WikiEditHistory pageId={page.id} pageData={page} />
                                  </div>
                                )}
                              </div>
                              <aside className="space-y-4 rounded-2xl border border-base-content/10 bg-base-content/5 p-4 text-sm text-base-content/70">
                                <div className="space-y-1">
                                  <p className="text-xs uppercase tracking-[0.3em] text-base-content/50">Stats</p>
                                  <p>{Number(page.totalEdits)} edits logged</p>
                                  <p>Last updated {new Date(Number(page.lastEditTime) * 1000).toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.3em] text-base-content/50">Contributors</p>
                                  <div className="mt-2 space-y-1">
                                    {Array.isArray(page.contributors) && page.contributors.length > 0 ? (
                                      page.contributors.slice(0, 4).map((addr: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 rounded-lg border border-base-content/10 bg-base-content/5 px-3 py-1.5">
                                          <Address address={addr} />
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-xs text-base-content/50">No contributors yet</p>
                                    )}
                                    {Array.isArray(page.contributors) && page.contributors.length > 4 && (
                                      <p className="text-xs text-base-content/50">+{page.contributors.length - 4} more</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <button
                                    className="btn btn-sm border border-base-content/20 bg-base-content/10 text-base-content hover:border-base-content/40 hover:bg-base-content/20"
                                    onClick={() => handleShowEditForm(index, page.currentContent)}
                                  >
                                    {isEditing ? "Close editor" : "Edit content ✏️"}
                                  </button>
                                  <button
                                    className="btn btn-sm border border-base-content/20 bg-base-content/10 text-base-content hover:border-base-content/40 hover:bg-base-content/20"
                                    onClick={() => setShowWikiHistory(historyOpen ? null : index)}
                                  >
                                    {historyOpen ? "Hide history" : "View history 📚"}
                                  </button>
                                </div>
                              </aside>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={`${floatingPanelBase} p-6 text-sm text-base-content/70`}>
                      {wikiSearch.trim()
                        ? "No wiki entries match your search. Try different keywords or hashes."
                        : "No wiki pages yet. Document the first transaction and kick off the knowledge base! 📚"}
                    </div>
                  )}
                </section>
              </>
            ) : (
              <div className={`${floatingPanelBase} p-6 text-white`}>
                <h3 className="text-lg font-semibold">Mint your student NFT to contribute</h3>
                <p className="mt-2 text-sm text-base-content/70">
                  The TXN wiki is maintained by verified students. Mint your profile NFT in the Profile tab to start publishing
                  and editing entries.
                </p>
              </div>
            )}
          </div>
        )}
        </main>
      </div>
    </div>
  );
};