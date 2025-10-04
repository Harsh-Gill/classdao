"use client";

import { useEffect, useMemo, useState } from "react";
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
import { PixelPet } from "~~/components/pets/PixelPet";
import { SpinWheel } from "~~/components/pets/SpinWheel";
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
  const [selectedPetType, setSelectedPetType] = useState<"cat" | "fox" | "dog" | "rabbit" | "owl" | "dragon" | "penguin" | "bear" | null>(null);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalDescription, setProposalDescription] = useState("");
  const [proposalType, setProposalType] = useState<ProposalTypeValue>("APP_CHANGES");
  const [wikiTxnHash, setWikiTxnHash] = useState("");
  const [wikiDate, setWikiDate] = useState("");
  const [wikiType, setWikiType] = useState("");
  const [wikiSummary, setWikiSummary] = useState("");
  const [wikiSources, setWikiSources] = useState("");
  const [wikiNotes, setWikiNotes] = useState("");
  const [wikiSearch, setWikiSearch] = useState("");
  const [wikiTypeFilter, setWikiTypeFilter] = useState("");
  const [showReplyForm, setShowReplyForm] = useState<number | null>(null);
  const [replyingToPost, setReplyingToPost] = useState<bigint | null>(null);
  const [editingWikiPage, setEditingWikiPage] = useState<number | null>(null);
  const [wikiEditContent, setWikiEditContent] = useState("");
  const [showWikiHistory, setShowWikiHistory] = useState<number | null>(null);
  const [discussionSearch, setDiscussionSearch] = useState("");
  const [discussionSortBy, setDiscussionSortBy] = useState<"recent" | "popular">("recent");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [likedWikiPages, setLikedWikiPages] = useState<Set<number>>(new Set());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  // Game state
  const [currentGame, setCurrentGame] = useState<"none" | "shooter" | "quiz">("none");
  const [gameScore, setGameScore] = useState(0);
  const [gameHighScore, setGameHighScore] = useState(0);
  
  // Alien Shooter game state
  const [aliens, setAliens] = useState<Array<{ id: number; x: number; y: number; hp: number }>>([]);
  const [bullets, setBullets] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [petX, setPetX] = useState(50);
  const [gameTime, setGameTime] = useState(0);
  
  // Quiz game state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);

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

  // Generate floating particles around pet
  useEffect(() => {
    if (!connectedAddress) return;
    
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      delay: Math.random() * 3,
    }));
    setParticles(newParticles);
  }, [connectedAddress]);

  // Track mouse position for pet cursor tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
    if (!petName.trim() || !selectedPetType) return;
    try {
      // Random scarf color
      const scarfColors = ["red", "blue", "green", "purple", "yellow"] as const;
      const randomScarf = scarfColors[Math.floor(Math.random() * scarfColors.length)];
      
      await mintStudentNFT({
        functionName: "mintStudentNFT",
        args: [connectedAddress, petName, selectedPetType, randomScarf],
      });
      setPetName("");
      setSelectedPetType(null);
      setShowSpinWheel(false);
    } catch (error) {
      console.error("Error minting NFT:", error);
    }
  };

  const handlePetSelected = (petType: "cat" | "fox" | "dog" | "rabbit" | "owl" | "dragon" | "penguin" | "bear") => {
    setSelectedPetType(petType);
    setShowSpinWheel(false);
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
    if (!wikiTxnHash.trim() || !wikiDate.trim() || !wikiType.trim() || !wikiSummary.trim()) return;
    try {
      // Build metadata string from separate fields
      const metadataParts = [
        `📅 Date: ${wikiDate}`,
        `🏷️ Type: ${wikiType}`,
      ];
      if (wikiSources.trim()) {
        metadataParts.push(`� Sources: ${wikiSources}`);
      }
      if (wikiNotes.trim()) {
        metadataParts.push(`📌 Notes: ${wikiNotes}`);
      }
      
      const metadata = metadataParts.join('\n');
      
      await createWikiPage({
        functionName: "createWikiPage",
        args: [wikiTxnHash, wikiSummary, metadata],
      });
      setWikiTxnHash("");
      setWikiDate("");
      setWikiType("");
      setWikiSummary("");
      setWikiSources("");
      setWikiNotes("");
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

  const getPetStageLabel = (petLevel: number) => {
    if (petLevel === 1) return "Starter";
    if (petLevel === 2) return "Explorer";
    if (petLevel === 3) return "Scholar";
    return "Legend";
  };

  const ownsNFT = Boolean(hasNFT);
  const studentStats = studentData?.[1];
  const studentTokenId = studentData ? Number(studentData[0]) : undefined;
  const level = studentStats ? Number(studentStats.level) : 0;
  const totalPoints = studentStats ? Number(studentStats.totalPoints) : 0;
  
  // Extract pet evolution data - handle BigInt values properly
  const petLevel = studentStats?.petLevel !== undefined ? Number(studentStats.petLevel) : 1;
  const hasPosted = studentStats?.hasPosted ?? false;
  const hasVoted = studentStats?.hasVoted ?? false;
  const hasWikiLikes = studentStats?.hasWikiLikes ?? false;
  
  const pointsIntoCurrentLevel = totalPoints % 5;
  const pointsNeededForNextLevel = pointsIntoCurrentLevel === 0 && totalPoints !== 0 ? 5 : 5 - pointsIntoCurrentLevel;
  const xpProgressPercent = (pointsIntoCurrentLevel / 5) * 100;
  const petEmoji = getPetEmoji(level);
  const petStage = getPetStageLabel(petLevel);
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
    
    // Filter by search term
    let filtered = allPosts;
    if (discussionSearch.trim()) {
      const term = discussionSearch.toLowerCase();
      filtered = allPosts.filter((post: any) => {
        const content = String(post.content ?? "").toLowerCase();
        const author = String(post.author ?? "").toLowerCase();
        return content.includes(term) || author.includes(term);
      });
    }
    
    // Sort posts
    const sorted = [...filtered].sort((a: any, b: any) => {
      if (discussionSortBy === "popular") {
        return Number(b.likes ?? 0) - Number(a.likes ?? 0);
      }
      // Sort by recent (timestamp descending)
      return Number(b.timestamp ?? 0) - Number(a.timestamp ?? 0);
    });
    
    return sorted;
  }, [allPosts, discussionSearch, discussionSortBy]);

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
    
    let filtered = allWikiPages;
    
    // Filter by search term
    if (wikiSearch.trim()) {
      const term = wikiSearch.toLowerCase();
      filtered = filtered.filter((page: any) => {
        const hash = String(page.txnHash ?? "").toLowerCase();
        const content = String(page.currentContent ?? "").toLowerCase();
        const contributors = Array.isArray(page.contributors)
          ? page.contributors.some((addr: string) => addr?.toLowerCase().includes(term))
          : false;
        return hash.includes(term) || content.includes(term) || contributors;
      });
    }
    
    // Filter by type
    if (wikiTypeFilter) {
      filtered = filtered.filter((page: any) => {
        try {
          const metadata = JSON.parse(page.metadata ?? "{}");
          return metadata.type === wikiTypeFilter;
        } catch {
          return false;
        }
      });
    }
    
    return filtered;
  }, [allWikiPages, wikiSearch, wikiTypeFilter]);

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
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Subtle background elements */}
        <div className="pointer-events-none absolute top-10 left-10 text-6xl opacity-5">🎓</div>
        <div className="pointer-events-none absolute top-20 right-20 text-5xl opacity-5">✨</div>
        <div className="pointer-events-none absolute bottom-20 left-20 text-5xl opacity-5">🚀</div>
        <div className="pointer-events-none absolute bottom-10 right-10 text-6xl opacity-5">💫</div>
        
        <div className="relative rounded-3xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 p-10 shadow-2xl backdrop-blur-xl w-96">
          <div className="space-y-6 text-center">
            <div className="text-6xl">🎓✨</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to ClassDAO!
            </h2>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
              🎨 Connect your wallet to start your learning adventure! 🚀
            </p>
            <div className="pt-4">
              <div className="inline-flex items-center gap-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 px-6 py-3 text-sm font-bold text-blue-600 dark:text-blue-300 shadow-md">
                👆 Click "Connect Wallet" above
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== GAME FUNCTIONS =====
  
  // Quiz questions
  const quizQuestions = [
    {
      question: "What does DAO stand for?",
      options: ["Decentralized Autonomous Organization", "Digital Asset Operation", "Data Analysis Online", "Distributed Application Object"],
      correct: 0,
    },
    {
      question: "What is a smart contract?",
      options: ["A legal document", "Self-executing code on blockchain", "A type of cryptocurrency", "An AI assistant"],
      correct: 1,
    },
    {
      question: "What blockchain is Ethereum based on?",
      options: ["Bitcoin", "Its own blockchain", "Litecoin", "Cardano"],
      correct: 1,
    },
    {
      question: "What does NFT stand for?",
      options: ["New Financial Technology", "Non-Fungible Token", "Network File Transfer", "Next Future Tech"],
      correct: 1,
    },
    {
      question: "What is gas in Ethereum?",
      options: ["Fuel for cars", "Transaction fee", "A cryptocurrency", "Mining reward"],
      correct: 1,
    },
  ];
  
  // Alien Shooter Game
  const startShooter = () => {
    setCurrentGame("shooter");
    setGameScore(0);
    setGameOver(false);
    setAliens([]);
    setBullets([]);
    setPetX(50);
    setGameTime(0);
    
    let alienId = 0;
    let bulletId = 0;
    let gameRunning = true;
    let currentPetX = 50;
    
    // Keyboard controls
    const keysPressed = new Set<string>();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.add(e.key);
      
      // Shoot on spacebar
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        setBullets(prev => [...prev, { id: bulletId++, x: currentPetX, y: 85 }]);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.delete(e.key);
    };
    
    // Movement loop
    const movementInterval = setInterval(() => {
      if (!gameRunning) return;
      
      let newX = currentPetX;
      if (keysPressed.has('ArrowLeft') || keysPressed.has('a') || keysPressed.has('A')) {
        newX = Math.max(5, currentPetX - 2);
      }
      if (keysPressed.has('ArrowRight') || keysPressed.has('d') || keysPressed.has('D')) {
        newX = Math.min(95, currentPetX + 2);
      }
      
      if (newX !== currentPetX) {
        currentPetX = newX;
        setPetX(newX);
      }
    }, 30);
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Spawn aliens
    const alienInterval = setInterval(() => {
      if (!gameRunning) return;
      const newAlien = {
        id: alienId++,
        x: Math.random() * 90 + 5,
        y: 0,
        hp: 1,
      };
      setAliens(prev => [...prev, newAlien]);
    }, 1500);
    
    // Move aliens down and bullets up
    const moveInterval = setInterval(() => {
      if (!gameRunning) return;
      
      setAliens(prev => {
        const moved = prev.map(a => ({ ...a, y: a.y + 1 }));
        // Check if any alien reached bottom (game over)
        if (moved.some(a => a.y >= 95)) {
          gameRunning = false;
          setGameOver(true);
          clearInterval(alienInterval);
          clearInterval(moveInterval);
          clearInterval(timeInterval);
          clearInterval(movementInterval);
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
        }
        return moved.filter(a => a.y < 100);
      });
      
      setBullets(prev => 
        prev.map(b => ({ ...b, y: b.y - 3 })).filter(b => b.y > 0)
      );
      
      // Collision detection
      setBullets(prevBullets => {
        const remainingBullets = [...prevBullets];
        setAliens(prevAliens => {
          let newAliens = [...prevAliens];
          let scoreIncrease = 0;
          
          prevBullets.forEach(bullet => {
            newAliens = newAliens.filter(alien => {
              const hit = Math.abs(bullet.x - alien.x) < 5 && Math.abs(bullet.y - alien.y) < 5;
              if (hit) {
                scoreIncrease += 10;
                const bulletIndex = remainingBullets.findIndex(b => b.id === bullet.id);
                if (bulletIndex > -1) remainingBullets.splice(bulletIndex, 1);
                return false;
              }
              return true;
            });
          });
          
          if (scoreIncrease > 0) {
            setGameScore(prev => {
              const newScore = prev + scoreIncrease;
              if (newScore > gameHighScore) setGameHighScore(newScore);
              return newScore;
            });
          }
          
          return newAliens;
        });
        
        return remainingBullets;
      });
    }, 50);
    
    // Timer
    const timeInterval = setInterval(() => {
      if (!gameRunning) return;
      setGameTime(prev => prev + 1);
    }, 1000);
    
    // Cleanup after 60 seconds
    setTimeout(() => {
      gameRunning = false;
      clearInterval(alienInterval);
      clearInterval(moveInterval);
      clearInterval(timeInterval);
      clearInterval(movementInterval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      setGameOver(true);
    }, 60000);
  };
  
  // Quiz Game
  const startQuiz = () => {
    setCurrentGame("quiz");
    setQuizScore(0);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowQuizResult(false);
    setGameOver(false);
  };
  
  const handleAnswerSelect = (index: number) => {
    if (showQuizResult) return;
    setSelectedAnswer(index);
    setShowQuizResult(true);
    
    if (index === quizQuestions[currentQuestion].correct) {
      setQuizScore(prev => prev + 20);
    }
    
    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowQuizResult(false);
      } else {
        setGameOver(true);
        const finalScore = quizScore + (index === quizQuestions[currentQuestion].correct ? 20 : 0);
        if (finalScore > gameHighScore) {
          setGameHighScore(finalScore);
        }
      }
    }, 1500);
  };

  const quitGame = () => {
    setCurrentGame("none");
    setGameScore(0);
    setGameOver(false);
    setAliens([]);
    setBullets([]);
    setQuizScore(0);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowQuizResult(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Subtle gradient orbs in background */}
      <div className="pointer-events-none absolute top-20 left-10 h-96 w-96 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-40 right-20 h-80 w-80 rounded-full bg-cyan-500/5 dark:bg-cyan-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-20 left-1/3 h-72 w-72 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[90px]" />
      
      <div className="relative z-10 pb-16">
        <header className="flex justify-center px-4 pt-12">
          <div className="group relative flex w-full max-w-6xl items-center justify-between overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 px-8 py-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl">
            <div className="relative flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎓</span>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">ClassDAO</span>
              </div>
              <h1 className="text-xl font-bold sm:text-2xl text-gray-900 dark:text-white">Your Learning Hub</h1>
            </div>
            <div className="relative flex items-center gap-4">
              <span className="hidden text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:inline">🔗 Connected</span>
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-5 py-2.5 shadow-md transition-all hover:scale-105">
                <span className="text-sm">👤</span>
                <Address address={connectedAddress} format="short" />
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto my-12 w-full max-w-6xl px-4 sm:px-6">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-10">
            <section className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 p-8 sm:p-10 shadow-xl backdrop-blur-sm">
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2 shadow-md">
                  <span className="text-lg">✨</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">How it works</span>
                </div>
              </div>
              <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
                <div className="space-y-6 text-base">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">🎮 Collect, Collaborate, Govern! 🏆</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    🎨 <strong className="text-blue-600 dark:text-blue-400">Mint your unique pet NFT</strong> to join the cohort! Earn <strong className="text-cyan-600 dark:text-cyan-400">XP points</strong> 💎 for awesome contributions, and watch your voting power grow! 📈 Every action feeds your adorable companion and helps build our shared knowledge base! 📚
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    🔮 Three magical systems power your journey: the <strong className="text-blue-600 dark:text-blue-400">Student NFT</strong> establishes your identity, the <strong className="text-indigo-600 dark:text-indigo-400">Points Manager</strong> tracks your XP adventure, and the <strong className="text-cyan-600 dark:text-cyan-400">DAO + TXN Wiki</strong> let you propose changes and document crypto learnings together! 🌟
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
              <div className="relative flex flex-col gap-8 p-10 sm:p-12">
                {ownsNFT ? (
                  <>
                    {/* Hero NFT Center Stage */}
                    <div className="flex flex-col items-center gap-8">
                      {/* Welcome Message */}
                      <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full border-2 border-pink-400/40 bg-gradient-to-r from-pink-100/80 to-purple-100/80 dark:from-pink-900/50 dark:to-purple-900/50 px-5 py-2 shadow-lg animate-bounce-slow">
                          <span className="text-xl">👋</span>
                          <span className="text-xs font-black uppercase tracking-[0.25em] bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent dark:from-pink-400 dark:to-purple-400">Welcome back!</span>
                        </div>
                        <h1 className="text-5xl font-black sm:text-6xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent dark:from-pink-400 dark:via-purple-400 dark:to-cyan-400 animate-pulse-fast">
                          🌟 {studentStats?.petName || "Explorer"} 🌟
                        </h1>
                        <p className="text-lg font-medium text-base-content/70 max-w-2xl mx-auto">
                          🎯 Keep completing quests to evolve your companion and unlock super voting powers! 🚀✨
                        </p>
                      </div>

                      {/* HUGE Center NFT Card */}
                      <div className="group relative w-full max-w-2xl">
                        {/* Rainbow outer glow effect */}
                        <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-r from-pink-500 via-purple-500 via-cyan-500 to-pink-500 opacity-40 blur-3xl transition-all duration-700 group-hover:opacity-70 group-hover:blur-[4rem] animate-pulse" style={{ backgroundSize: '200% 200%', animation: 'gradient 3s ease infinite' }} />
                        
                        {/* Main NFT showcase card */}
                        <div className="relative flex flex-col items-center gap-6 rounded-[2rem] border-4 border-white/30 dark:border-white/20 bg-gradient-to-br from-pink-100/95 via-purple-100/95 to-cyan-100/95 dark:from-pink-950/95 dark:via-purple-950/95 dark:to-cyan-950/95 p-12 backdrop-blur-xl shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-pink-500/30 overflow-hidden">
                          {/* Animated gradient shine overlay */}
                          <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{ backgroundSize: '200% 200%', animation: 'gradient 2s ease infinite' }} />
                          
                          {/* Floating particles */}
                          {particles.map((particle) => (
                            <div
                              key={particle.id}
                              className="pointer-events-none absolute rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 animate-float-particle"
                              style={{
                                width: `${Math.random() * 8 + 4}px`,
                                height: `${Math.random() * 8 + 4}px`,
                                left: `calc(50% + ${particle.x}px)`,
                                top: `calc(40% + ${particle.y}px)`,
                                animationDelay: `${particle.delay}s`,
                                animationDuration: `${3 + Math.random() * 2}s`,
                              }}
                            />
                          ))}
                          
                          {/* HUGE Pet Display */}
                          <div className="relative animate-float">
                            {/* Pulsing rainbow glow aura */}
                            <div className="absolute -inset-20 animate-pulse rounded-full bg-gradient-to-r from-pink-400/40 via-purple-400/40 via-cyan-400/40 to-pink-400/40 blur-[4rem]" style={{ backgroundSize: '200% 200%', animation: 'gradient 4s ease infinite, pulse 2s ease-in-out infinite' }} />
                            
                            {/* Sparkle effects for high level pets */}
                            {petLevel >= 3 && (
                              <>
                                <div className="absolute -top-10 -right-10 text-4xl animate-sparkle" style={{ animationDelay: '0s' }}>✨</div>
                                <div className="absolute -top-14 left-10 text-3xl animate-sparkle" style={{ animationDelay: '0.5s' }}>🌟</div>
                                <div className="absolute -bottom-10 -left-10 text-4xl animate-sparkle" style={{ animationDelay: '1s' }}>💫</div>
                                <div className="absolute -bottom-6 right-14 text-3xl animate-sparkle" style={{ animationDelay: '1.5s' }}>✨</div>
                                <div className="absolute top-0 -left-16 text-2xl animate-sparkle" style={{ animationDelay: '0.75s' }}>💖</div>
                                <div className="absolute bottom-0 -right-16 text-2xl animate-sparkle" style={{ animationDelay: '1.25s' }}>💜</div>
                              </>
                            )}
                            
                            {petLevel >= 2 && petLevel < 3 && (
                              <>
                                <div className="absolute -top-8 -right-8 text-3xl animate-sparkle" style={{ animationDelay: '0s' }}>✨</div>
                                <div className="absolute -bottom-8 -left-8 text-3xl animate-sparkle" style={{ animationDelay: '1s' }}>⭐</div>
                              </>
                            )}
                            
                            {/* Pet with cursor tracking */}
                            <div 
                              className="relative z-10 transition-all duration-500 group-hover:scale-110"
                              style={{
                                transform: `perspective(1000px) rotateY(${(mousePosition.x - window.innerWidth / 2) / 50}deg) rotateX(${-(mousePosition.y - window.innerHeight / 2) / 50}deg)`,
                              }}
                            >
                              <PixelPet 
                                petType={(studentStats?.petType as "cat" | "fox" | "dog") || "cat"} 
                                level={(petLevel as 1 | 2 | 3 | 4) || 1}
                                accessories={[
                                  ...(studentStats?.scarfColor ? [{ type: "scarf" as const, color: studentStats.scarfColor }] : []),
                                  ...(petLevel >= 3 ? [{ type: "crown" as const }] : []),
                                  ...(petLevel >= 4 ? [{ type: "book" as const }, { type: "sparkles" as const }] : [])
                                ]}
                                size={280}
                              />
                            </div>
                          </div>
                          
                          {/* Pet info */}
                          <div className="relative z-10 w-full space-y-4 text-center">
                            <div className="space-y-2">
                              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">{petStage}</p>
                              <p className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                Level {petLevel}
                              </p>
                              <p className="text-sm text-base-content/60">
                                Token #{studentTokenId !== undefined ? studentTokenId : "..."}
                              </p>
                            </div>
                            
                            {/* XP Progress bar */}
                            <div className="w-full space-y-2 px-8">
                              <div className="h-3 w-full overflow-hidden rounded-full bg-base-content/10 border border-cyan-400/20">
                                <div 
                                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 transition-all duration-700 shadow-[0_0_15px_rgba(34,211,238,0.6)]"
                                  style={{ width: `${xpProgressPercent}%` }}
                                />
                              </div>
                              <p className="text-sm font-medium text-base-content/80">
                                {pointsNeededForNextLevel === 0
                                  ? "🎉 Evolution ready!"
                                  : `${pointsIntoCurrentLevel}/5 XP • ${pointsNeededForNextLevel} XP to next level`}
                              </p>
                            </div>

                            {/* Stats row */}
                            <div className="grid grid-cols-2 gap-4 pt-4">
                              <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                                <p className="text-xs uppercase tracking-wider text-cyan-400/80">Total XP</p>
                                <p className="mt-2 text-3xl font-bold text-base-content">{totalPoints}</p>
                              </div>
                              <div className="rounded-xl border border-indigo-400/20 bg-indigo-400/5 p-4">
                                <p className="text-xs uppercase tracking-wider text-indigo-400/80">Next Goal</p>
                                <p className="mt-2 text-3xl font-bold text-base-content">
                                  {pointsNeededForNextLevel === 0 ? "✓" : pointsNeededForNextLevel}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-4 justify-center">
                        <Link href={tabLink("discussion")} className="group relative overflow-hidden rounded-full border-2 border-purple-400/40 bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 font-black text-white shadow-xl transition-all hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50">
                          <span className="relative z-10 flex items-center gap-2">
                            <span className="text-lg">💬</span>
                            Earn XP Now!
                            <span className="text-lg">💎</span>
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </Link>
                        <Link
                          href={tabLink("dao")}
                          className="group relative overflow-hidden rounded-full border-2 border-cyan-400/40 bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-3 font-black text-white shadow-xl transition-all hover:scale-110 hover:shadow-2xl hover:shadow-cyan-500/50"
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            <span className="text-lg">🗳️</span>
                            Vote on Ideas
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </Link>
                        <Link
                          href={tabLink("wiki")}
                          className="group relative overflow-hidden rounded-full border-2 border-amber-400/40 bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 font-black text-white shadow-xl transition-all hover:scale-110 hover:shadow-2xl hover:shadow-amber-500/50"
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            <span className="text-lg">📚</span>
                            Explore Wiki
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </Link>
                      </div>
                    </div>

                    {/* Quest Tracker - Horizontal cards below NFT */}
                    <div className="w-full max-w-4xl mx-auto">
                      <div className={`${floatingPanelBase} p-6`}>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-semibold text-base-content">Evolution Quests</h3>
                          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 rounded-full border border-cyan-400/30">
                            Stage {petLevel}/4
                          </span>
                        </div>
                        
                        <div className="grid gap-4 sm:grid-cols-3">
                          {/* Quest 1: First Post */}
                          <div className={`rounded-xl border p-4 transition-all ${
                            hasPosted 
                              ? 'border-green-400/40 bg-green-400/10 shadow-lg shadow-green-400/20' 
                              : petLevel === 1 
                                ? 'border-cyan-400/40 bg-cyan-400/5 ring-2 ring-cyan-400/30 shadow-lg shadow-cyan-400/10' 
                                : 'border-base-content/10 bg-base-content/5 opacity-50'
                          }`}>
                            <div className="flex flex-col items-center text-center gap-3">
                              <div className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${
                                hasPosted ? 'bg-green-400 text-white' : 'bg-cyan-400/20 text-cyan-400'
                              }`}>
                                {hasPosted ? '✓' : '💬'}
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-base-content">
                                  {hasPosted ? 'First Post ✅' : 'Discussion Post'}
                                </p>
                                <p className="text-xs text-base-content/60">
                                  {hasPosted 
                                    ? 'Level 2 Unlocked!' 
                                    : 'Share your thoughts'}
                                </p>
                              </div>
                              {!hasPosted && petLevel === 1 && (
                                <Link href="?tab=discussion" className="btn btn-xs btn-secondary">
                                  Start →
                                </Link>
                              )}
                            </div>
                          </div>

                          {/* Quest 2: First Vote */}
                          <div className={`rounded-xl border p-4 transition-all ${
                            hasVoted 
                              ? 'border-green-400/40 bg-green-400/10 shadow-lg shadow-green-400/20' 
                              : petLevel === 2 
                                ? 'border-cyan-400/40 bg-cyan-400/5 ring-2 ring-cyan-400/30 shadow-lg shadow-cyan-400/10' 
                                : 'border-base-content/10 bg-base-content/5 opacity-50'
                          }`}>
                            <div className="flex flex-col items-center text-center gap-3">
                              <div className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${
                                hasVoted ? 'bg-green-400 text-white' : 'bg-cyan-400/20 text-cyan-400'
                              }`}>
                                {hasVoted ? '✓' : '🗳️'}
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-base-content">
                                  {hasVoted ? 'First Vote ✅' : 'DAO Vote'}
                                </p>
                                <p className="text-xs text-base-content/60">
                                  {hasVoted 
                                    ? 'Level 3 Unlocked!' 
                                    : 'Vote on proposal'}
                                </p>
                              </div>
                              {!hasVoted && petLevel === 2 && (
                                <Link href="?tab=dao" className="btn btn-xs btn-secondary">
                                  Start →
                                </Link>
                              )}
                            </div>
                          </div>

                          {/* Quest 3: Wiki Likes */}
                          <div className={`rounded-xl border p-4 transition-all ${
                            hasWikiLikes 
                              ? 'border-green-400/40 bg-green-400/10 shadow-lg shadow-green-400/20' 
                              : petLevel === 3 
                                ? 'border-cyan-400/40 bg-cyan-400/5 ring-2 ring-cyan-400/30 shadow-lg shadow-cyan-400/10' 
                                : 'border-base-content/10 bg-base-content/5 opacity-50'
                          }`}>
                            <div className="flex flex-col items-center text-center gap-3">
                              <div className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${
                                hasWikiLikes ? 'bg-green-400 text-white' : 'bg-cyan-400/20 text-cyan-400'
                              }`}>
                                {hasWikiLikes ? '✓' : '📚'}
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-base-content">
                                  {hasWikiLikes ? 'Wiki Star ✅' : 'Wiki Likes'}
                                </p>
                                <p className="text-xs text-base-content/60">
                                  {hasWikiLikes 
                                    ? 'Level 4 Unlocked!' 
                                    : 'Get 5 likes'}
                                </p>
                              </div>
                              {!hasWikiLikes && petLevel === 3 && (
                                <Link href="?tab=wiki" className="btn btn-xs btn-secondary">
                                  Start →
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Evolution Preview */}
                        {petLevel < 4 && (
                          <div className="mt-6 rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/5 to-indigo-400/5 p-6">
                            <p className="mb-4 text-center text-sm font-semibold text-base-content/70">Next Evolution Preview</p>
                            <div className="flex items-center justify-center gap-8">
                              <div className="text-center">
                                <p className="mb-2 text-xs text-base-content/50">Current</p>
                                <PixelPet 
                                  petType={(studentStats?.petType as "cat" | "fox" | "dog") || "cat"} 
                                  level={(petLevel as 1 | 2 | 3 | 4)}
                                  accessories={[
                                    ...(studentStats?.scarfColor ? [{ type: "scarf" as const, color: studentStats.scarfColor }] : []),
                                    ...(petLevel >= 3 ? [{ type: "crown" as const }] : []),
                                    ...(petLevel >= 4 ? [{ type: "book" as const }, { type: "sparkles" as const }] : [])
                                  ]}
                                  size={80}
                                />
                              </div>
                              <div className="text-3xl text-cyan-400">→</div>
                              <div className="text-center">
                                <p className="mb-2 text-xs text-cyan-400 font-semibold">Next Level</p>
                                <PixelPet 
                                  petType={(studentStats?.petType as "cat" | "fox" | "dog") || "cat"} 
                                  level={((petLevel + 1) as 1 | 2 | 3 | 4)}
                                  accessories={[
                                    ...(studentStats?.scarfColor ? [{ type: "scarf" as const, color: studentStats.scarfColor }] : []),
                                    ...((petLevel + 1) >= 3 ? [{ type: "crown" as const }] : []),
                                    ...((petLevel + 1) >= 4 ? [{ type: "book" as const }, { type: "sparkles" as const }] : [])
                                  ]}
                                  size={80}
                                />
                              </div>
                            </div>
                            <p className="mt-4 text-center text-sm font-medium text-base-content/70">
                              {petLevel === 1 && "🧣 Enhanced scarf coming soon!"}
                              {petLevel === 2 && "👑 Royal crown awaits!"}
                              {petLevel === 3 && "📚 Legendary scholar with mystical book!"}
                            </p>
                          </div>
                        )}
                        
                        {petLevel === 4 && (
                          <div className="mt-6 rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-400/10 to-yellow-400/10 p-6 text-center">
                            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">🎉 Max Evolution Achieved!</p>
                            <p className="mt-2 text-sm text-base-content/60">Your pet is now a legendary scholar!</p>
                          </div>
                        )}
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
                      Choose a companion, pick a scarf color, and name your pixel buddy!
                    </p>
                    
                    {/* Spin Wheel Section */}
                    {!selectedPetType && !showSpinWheel && (
                      <button 
                        className="btn btn-secondary btn-lg w-full" 
                        onClick={() => setShowSpinWheel(true)}
                      >
                        🎰 Spin to Choose Your Companion!
                      </button>
                    )}
                    
                    {showSpinWheel && (
                      <div className="rounded-2xl border border-base-content/20 bg-base-content/5 p-6">
                        <SpinWheel onSelect={handlePetSelected} />
                      </div>
                    )}
                    
                    {/* Show preview and name/color inputs after pet selected */}
                    {selectedPetType && (
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400/10 to-indigo-400/10 p-6">
                          <p className="mb-4 text-center text-sm font-medium text-base-content/70">Your starter companion:</p>
                          <div className="flex justify-center">
                            <PixelPet petType={selectedPetType} level={1} accessories={[{ type: "scarf", color: "blue" }]} size={120} />
                          </div>
                          <p className="mt-3 text-center text-xs text-base-content/60">
                          </p>
                        </div>
                        
                        <div className="grid gap-4">
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
                          
                          <div className="flex gap-3">
                            <button 
                              className="btn btn-ghost flex-1" 
                              onClick={() => {
                                setSelectedPetType(null);
                                setShowSpinWheel(true);
                              }}
                            >
                              ← Choose Different Pet
                            </button>
                            <button 
                              className="btn btn-secondary flex-1" 
                              onClick={handleMintNFT} 
                              disabled={!petName.trim()}
                            >
                              Mint NFT
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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
                {/* Header Section */}
                <section className="flex flex-col gap-5">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
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
                  </div>
                  
                  {/* Collapsible Create Post Section */}
                  <div className={`${floatingPanelBase} overflow-hidden transition-all duration-300`}>
                    <button
                      onClick={() => setShowCreatePost(!showCreatePost)}
                      className="w-full flex items-center justify-between p-5 hover:bg-base-content/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📝</span>
                        <div className="text-left">
                          <h3 className="text-lg font-semibold text-base-content">Create New Post</h3>
                          <p className="text-sm text-base-content/65">Share your thoughts and earn XP</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-base-content/50">
                          {showCreatePost ? "Click to close" : "Click to expand"}
                        </span>
                        <svg
                          className={`w-6 h-6 text-base-content/70 transition-transform duration-300 ${showCreatePost ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    
                    <div
                      className={`transition-all duration-300 ${
                        showCreatePost ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="px-6 pb-6 border-t border-base-content/10">
                        <div className="pt-5 space-y-4">
                          <textarea
                            className={`${textareaFieldClass} min-h-[160px]`}
                            placeholder="Drop your latest insight, question, or resource..."
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                          />
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-base-content/50">
                              💡 Tip: Helpful posts get more likes and XP!
                            </p>
                            <button
                              className="btn btn-secondary px-8"
                              onClick={handleCreatePost}
                              disabled={!postContent.trim()}
                            >
                              Post 📤
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sort Controls */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-base-content/70">Sort by:</span>
                    <div className="flex gap-2">
                      <button
                        className={`btn btn-sm ${discussionSortBy === "recent" ? "btn-secondary" : "btn-ghost border border-base-content/20"}`}
                        onClick={() => setDiscussionSortBy("recent")}
                      >
                        🕐 Recent
                      </button>
                      <button
                        className={`btn btn-sm ${discussionSortBy === "popular" ? "btn-secondary" : "btn-ghost border border-base-content/20"}`}
                        onClick={() => setDiscussionSortBy("popular")}
                      >
                        ❤️ Popular
                      </button>
                    </div>
                    {filteredPosts.length > 0 && (
                      <span className="ml-auto text-sm text-base-content/50">
                        {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"}
                      </span>
                    )}
                  </div>
                </section>

                {/* Main Feed - Full Width */}
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
                <section className="relative overflow-hidden rounded-3xl border-2 border-cyan-400/30 bg-gradient-to-br from-cyan-50/80 via-blue-50/80 to-indigo-50/80 dark:from-cyan-950/40 dark:via-blue-950/40 dark:to-indigo-950/40 p-8 shadow-xl backdrop-blur-sm">
                  {/* Floating emojis */}
                  <div className="pointer-events-none absolute top-6 right-6 text-3xl opacity-20 animate-float" style={{ animationDelay: '0s' }}>🗳️</div>
                  <div className="pointer-events-none absolute bottom-6 left-6 text-2xl opacity-20 animate-float" style={{ animationDelay: '0.7s' }}>🏆</div>
                  
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 rounded-full border-2 border-cyan-400/40 bg-gradient-to-r from-cyan-100/80 to-blue-100/80 dark:from-cyan-900/50 dark:to-blue-900/50 px-4 py-2 shadow-lg">
                        <span className="text-xl">🏛️</span>
                        <span className="text-xs font-black uppercase tracking-[0.25em] bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent dark:from-cyan-400 dark:to-blue-400">Governance Hub</span>
                      </div>
                      <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400">🎓 Shape ClassDAO Together! 🚀</h2>
                      <p className="text-base font-medium text-base-content/70">Create proposals and vote to steer our learning adventure! 💪✨</p>
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

        {/* Wiki Tab - Wikipedia Style */}
        {activeTab === "wiki" && (
          <div className="space-y-6">
            {hasNFT ? (
              <>
                {/* Wikipedia-style Header */}
                <section className="relative border-b border-base-content/10 pb-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-base-content/20 bg-white dark:bg-gray-800">
                        <span className="text-2xl">�</span>
                      </div>
                      <div>
                        <h1 className="text-3xl font-serif font-bold text-base-content">ClassDAO Encyclopedia</h1>
                        <p className="text-sm text-base-content/60">The Free On-Chain Knowledge Repository</p>
                      </div>
                    </div>
                    <div className="text-sm text-base-content/50">
                      {Array.isArray(allWikiPages) ? `${allWikiPages.length} articles` : "Loading"}
                    </div>
                  </div>
                </section>

                {/* Wikipedia-style Two-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-6">
                  {/* Left Sidebar - Navigation & Categories (Wikipedia style) */}
                  <aside className="space-y-4">
                    {/* Search Box */}
                    <div className={`${floatingPanelBase} p-4`}>
                      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-base-content/70">Search</h3>
                      <div className="relative">
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
                        <input
                          type="search"
                          className="w-full rounded-lg border border-base-content/20 bg-white dark:bg-gray-800 py-2 pl-9 pr-3 text-sm text-base-content focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Search articles..."
                          value={wikiSearch}
                          onChange={(e) => setWikiSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Categories */}
                    <div className={`${floatingPanelBase} p-4`}>
                      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-base-content/70">Categories</h3>
                      <nav className="space-y-1">
                        <button
                          className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                            !wikiTypeFilter
                              ? "bg-blue-500 text-white font-semibold"
                              : "text-base-content/80 hover:bg-base-content/5"
                          }`}
                          onClick={() => setWikiTypeFilter("")}
                        >
                          📑 All Articles
                        </button>
                        <button
                          className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                            wikiTypeFilter === "DeFi"
                              ? "bg-blue-500 text-white font-semibold"
                              : "text-base-content/80 hover:bg-base-content/5"
                          }`}
                          onClick={() => setWikiTypeFilter("DeFi")}
                        >
                          💰 DeFi
                        </button>
                        <button
                          className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                            wikiTypeFilter === "NFT"
                              ? "bg-blue-500 text-white font-semibold"
                              : "text-base-content/80 hover:bg-base-content/5"
                          }`}
                          onClick={() => setWikiTypeFilter("NFT")}
                        >
                          🎨 NFTs & Collectibles
                        </button>
                        <button
                          className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                            wikiTypeFilter === "Governance"
                              ? "bg-blue-500 text-white font-semibold"
                              : "text-base-content/80 hover:bg-base-content/5"
                          }`}
                          onClick={() => setWikiTypeFilter("Governance")}
                        >
                          🏛️ Governance
                        </button>
                        <button
                          className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                            wikiTypeFilter === "Security"
                              ? "bg-blue-500 text-white font-semibold"
                              : "text-base-content/80 hover:bg-base-content/5"
                          }`}
                          onClick={() => setWikiTypeFilter("Security")}
                        >
                          🔒 Security
                        </button>
                        <button
                          className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                            wikiTypeFilter === "Token Transfer"
                              ? "bg-blue-500 text-white font-semibold"
                              : "text-base-content/80 hover:bg-base-content/5"
                          }`}
                          onClick={() => setWikiTypeFilter("Token Transfer")}
                        >
                          💸 Token Transfers
                        </button>
                        <button
                          className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                            wikiTypeFilter === "Smart Contract"
                              ? "bg-blue-500 text-white font-semibold"
                              : "text-base-content/80 hover:bg-base-content/5"
                          }`}
                          onClick={() => setWikiTypeFilter("Smart Contract")}
                        >
                          📜 Smart Contracts
                        </button>
                        <button
                          className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                            wikiTypeFilter === "Other"
                              ? "bg-blue-500 text-white font-semibold"
                              : "text-base-content/80 hover:bg-base-content/5"
                          }`}
                          onClick={() => setWikiTypeFilter("Other")}
                        >
                          📌 Other
                        </button>
                      </nav>
                    </div>

                    {/* Tools */}
                    <div className={`${floatingPanelBase} p-4`}>
                      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-base-content/70">Tools</h3>
                      <button
                        className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                        onClick={() => {
                          const createSection = document.getElementById('wiki-create-form');
                          createSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                      >
                        ✏️ Create Article
                      </button>
                    </div>

                    {/* Stats Box */}
                    <div className={`${floatingPanelBase} p-4`}>
                      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-base-content/70">Statistics</h3>
                      <div className="space-y-2 text-sm text-base-content/70">
                        <div className="flex justify-between">
                          <span>Total articles:</span>
                          <span className="font-semibold text-base-content">{Array.isArray(allWikiPages) ? allWikiPages.length : 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Showing:</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredWikiPages.length}</span>
                        </div>
                      </div>
                    </div>
                  </aside>

                  {/* Main Content Area */}
                  <main className="space-y-6">
                    {/* Create New Article Form (collapsible) */}
                    <section id="wiki-create-form" className={`${floatingPanelBase} overflow-hidden`}>
                      <div className="border-b border-base-content/10 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
                        <h2 className="text-lg font-serif font-bold text-base-content">Create New Article</h2>
                        <p className="text-sm text-base-content/60 mt-1">
                          Document important transactions with structured information.
                        </p>
                      </div>
                      <div className="p-6">
                        <div className="flex flex-col gap-6">
                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="flex flex-col gap-2 text-sm text-base-content/70">
                              Transaction Hash <span className="text-red-500">*</span>
                              <input
                                type="text"
                                className={inputFieldClass}
                                placeholder="0x1234..."
                                value={wikiTxnHash}
                                onChange={(e) => setWikiTxnHash(e.target.value)}
                                required
                              />
                            </label>
                            
                            <label className="flex flex-col gap-2 text-sm text-base-content/70">
                              Date <span className="text-red-500">*</span>
                              <input
                                type="date"
                                className={inputFieldClass}
                                value={wikiDate}
                                onChange={(e) => setWikiDate(e.target.value)}
                                required
                              />
                            </label>
                            
                            <label className="flex flex-col gap-2 text-sm text-base-content/70">
                              Type <span className="text-red-500">*</span>
                              <select
                                className={inputFieldClass}
                                value={wikiType}
                                onChange={(e) => setWikiType(e.target.value)}
                                required
                              >
                                <option value="">Select type...</option>
                                <option value="DeFi">DeFi</option>
                                <option value="NFT">NFT</option>
                                <option value="Governance">Governance</option>
                                <option value="Security">Security</option>
                                <option value="Token Transfer">Token Transfer</option>
                                <option value="Smart Contract">Smart Contract</option>
                                <option value="Other">Other</option>
                              </select>
                            </label>
                            
                            <label className="flex flex-col gap-2 text-sm text-base-content/70">
                              Sources <span className="text-base-content/50">(Optional)</span>
                              <input
                                type="text"
                                className={inputFieldClass}
                                placeholder="Links to explorers, docs..."
                                value={wikiSources}
                                onChange={(e) => setWikiSources(e.target.value)}
                              />
                            </label>
                          </div>
                          
                          <label className="flex flex-col gap-2 text-sm text-base-content/70">
                            Summary <span className="text-red-500">*</span>
                            <textarea
                              className={`${textareaFieldClass} min-h-[120px]`}
                              placeholder="Explain what happened and why it matters..."
                              value={wikiSummary}
                              onChange={(e) => setWikiSummary(e.target.value)}
                              required
                            />
                          </label>
                          
                          <label className="flex flex-col gap-2 text-sm text-base-content/70">
                            Additional Notes <span className="text-base-content/50">(Optional)</span>
                            <textarea
                              className={`${textareaFieldClass} min-h-[80px]`}
                              placeholder="Future TODOs, related transactions, or additional context..."
                              value={wikiNotes}
                              onChange={(e) => setWikiNotes(e.target.value)}
                            />
                          </label>
                          
                          <div className="flex items-center justify-between border-t border-base-content/10 pt-4">
                            <p className="text-sm text-base-content/60">
                              <span className="text-red-500">*</span> Required fields
                            </p>
                            <button
                              className="btn btn-secondary"
                              onClick={handleCreateWikiPage}
                              disabled={!wikiTxnHash.trim() || !wikiDate.trim() || !wikiType.trim() || !wikiSummary.trim()}
                            >
                              Publish Article 📖
                            </button>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Articles List */}
                    <section className="space-y-4">
                      {filteredWikiPages.length > 0 ? (
                        <div className="space-y-3">
                          {filteredWikiPages.map((page: any, index: number) => {
                            const isEditing = editingWikiPage === index;
                            const historyOpen = showWikiHistory === index;
                            return (
                              <article key={index} className={`${floatingPanelBase} overflow-hidden hover:shadow-lg transition-shadow`}>
                                {/* Article Header - Wikipedia style */}
                                <div className="border-b border-base-content/10 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <h2 className="text-2xl font-serif font-bold text-base-content mb-2">
                                        {page.title?.length ? page.title : `Transaction ${page.txnHash.slice(0, 12)}...`}
                                      </h2>
                                      <div className="flex flex-wrap items-center gap-3 text-xs text-base-content/60">
                                        <span className="rounded bg-blue-100 dark:bg-blue-900/30 px-2 py-1 font-semibold text-blue-700 dark:text-blue-300">
                                          {page.metadata?.split('\n').find((line: string) => line.includes('Type:'))?.replace('🏷️ Type:', '').trim() || 'Uncategorized'}
                                        </span>
                                        <span>•</span>
                                        <span>
                                          {page.metadata?.split('\n').find((line: string) => line.includes('Date:'))?.replace('📅 Date:', '').trim() || 'No date'}
                                        </span>
                                        <span>•</span>
                                        <span>{Array.isArray(page.contributors) ? page.contributors.length : 0} contributor(s)</span>
                                      </div>
                                    </div>
                                    <button
                                      className={`btn btn-sm gap-1 ${
                                        likedWikiPages.has(index)
                                          ? 'border-rose-300/40 bg-rose-500/20 text-rose-600 dark:text-rose-400'
                                          : 'border-base-content/20 bg-white dark:bg-gray-800'
                                      }`}
                                      onClick={() => handleLikeWikiPage(index)}
                                    >
                                      {likedWikiPages.has(index) ? '❤️' : '🤍'}
                                    </button>
                                  </div>
                                </div>

                                {/* Article Content */}
                                <div className="p-6">
                                  <div className="prose prose-sm max-w-none dark:prose-invert">
                                    {/* Transaction Hash */}
                                    <div className="mb-4 rounded-lg border border-base-content/10 bg-gray-50 dark:bg-gray-800/50 p-3">
                                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-base-content/50">Transaction Hash</p>
                                      <code className="block break-all text-xs text-blue-600 dark:text-blue-400">
                                        {page.txnHash}
                                      </code>
                                    </div>

                                    {/* Article Summary */}
                                    <div
                                      className="text-sm leading-relaxed text-base-content/80"
                                      dangerouslySetInnerHTML={{ __html: formatWikiContent(page.currentContent) }}
                                    />

                                    {/* Metadata Box */}
                                    {page.metadata && page.metadata.trim() && (
                                      <div className="mt-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-base-content/50">Article Information</p>
                                        <div className="space-y-1 text-sm font-mono text-base-content/70">
                                          {page.metadata.split('\n').map((line: string, i: number) => (
                                            <div key={i}>{line}</div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Edit Form */}
                                  {isEditing && (
                                    <div className="mt-6 rounded-lg border border-base-content/10 bg-base-content/5 p-4">
                                      <h4 className="mb-3 text-sm font-semibold text-base-content">Edit Article</h4>
                                      <textarea
                                        className={`${textareaFieldClass} min-h-[200px] font-mono text-sm`}
                                        placeholder={`📅 Date: YYYY-MM-DD\n🏷️ Type: DeFi | NFT | Governance | Security | Other\n📝 Summary: Updated information or corrections\n🔗 Sources: Additional links\n📌 Notes: What changed and why`}
                                        value={wikiEditContent}
                                        onChange={(e) => setWikiEditContent(e.target.value)}
                                      />
                                      <div className="mt-3 flex justify-end gap-2">
                                        <button
                                          className="btn btn-sm border border-base-content/20 bg-white dark:bg-gray-800"
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
                                          Save Edit 💾
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Article Footer - Contributors & Actions */}
                                <div className="border-t border-base-content/10 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
                                  <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex-1">
                                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-base-content/50">Contributors</p>
                                      <div className="flex flex-wrap gap-2">
                                        {Array.isArray(page.contributors) && page.contributors.length > 0 ? (
                                          page.contributors.slice(0, 3).map((addr: string, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2 rounded border border-base-content/10 bg-white dark:bg-gray-800 px-2 py-1 text-xs">
                                              <Address address={addr} />
                                            </div>
                                          ))
                                        ) : (
                                          <p className="text-xs text-base-content/50">No contributors yet</p>
                                        )}
                                        {Array.isArray(page.contributors) && page.contributors.length > 3 && (
                                          <span className="text-xs text-base-content/50">+{page.contributors.length - 3} more</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        className="btn btn-sm border border-base-content/20 bg-white dark:bg-gray-800"
                                        onClick={() => handleShowEditForm(index, page.currentContent)}
                                      >
                                        {isEditing ? "Cancel Edit" : "✏️ Edit"}
                                      </button>
                                      <button
                                        className="btn btn-sm border border-base-content/20 bg-white dark:bg-gray-800"
                                        onClick={() => setShowWikiHistory(historyOpen ? null : index)}
                                      >
                                        {historyOpen ? "Hide History" : "📚 History"}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      ) : (
                        <div className={`${floatingPanelBase} p-8 text-center text-sm text-base-content/70`}>
                          {wikiSearch.trim()
                            ? "No articles match your search. Try different keywords or browse by category."
                            : "No articles yet. Be the first to contribute to the knowledge base! 📚"}
                        </div>
                      )}
                    </section>
                  </main>
                </div>
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

        {/* Pet Game Tab - Working Games! */}
        {activeTab === "game" && (
          <div className="space-y-8">
            {hasNFT ? (
              <>
                {/* Game Header */}
                <section className="relative overflow-hidden rounded-3xl border-2 border-purple-400/30 bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-blue-50/80 dark:from-purple-950/40 dark:via-pink-950/40 dark:to-blue-950/40 p-8 shadow-xl backdrop-blur-sm">
                  <div className="pointer-events-none absolute top-6 right-6 text-3xl opacity-20 animate-float">🎮</div>
                  <div className="pointer-events-none absolute bottom-6 left-6 text-2xl opacity-20 animate-float" style={{ animationDelay: '0.7s' }}>⭐</div>
                  
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-3">
                      <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-pink-400 dark:to-blue-400">🎮 Pet Playground ✨</h2>
                      <p className="text-base font-medium text-base-content/70">
                        Take a study break with fun games! 🐾
                      </p>
                    </div>
                    
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border-2 border-purple-400/30 bg-white/80 dark:bg-purple-900/30 px-4 py-3 shadow-lg">
                        <p className="text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400">Score</p>
                        <p className="mt-1 text-2xl font-bold text-base-content">{gameScore}</p>
                      </div>
                      <div className="rounded-2xl border-2 border-pink-400/30 bg-white/80 dark:bg-pink-900/30 px-4 py-3 shadow-lg">
                        <p className="text-xs uppercase tracking-wider text-pink-600 dark:text-pink-400">Best</p>
                        <p className="mt-1 text-2xl font-bold text-base-content">{gameHighScore}</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Game Selection or Active Game */}
                {currentGame === "none" && (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {/* Your Pet */}
                    <div className={`${floatingPanelBase} p-8`}>
                      <h3 className="mb-6 text-xl font-semibold text-base-content text-center">🌟 Your Study Buddy</h3>
                      
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 animate-pulse rounded-full bg-purple-500/20 blur-3xl" />
                          <div 
                            className="relative animate-float"
                            style={{ width: '200px', height: '200px' }}
                          >
                            <PixelPet
                              petType={(studentStats?.petType as "cat" | "fox" | "dog") || "cat"}
                              level={petLevel as 1 | 2 | 3 | 4}
                              accessories={[
                                ...(studentStats?.scarfColor ? [{ type: "scarf" as const, color: studentStats.scarfColor }] : []),
                              ]}
                              size={200}
                            />
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <h4 className="text-2xl font-bold text-base-content">{studentStats?.petName || "Your Pet"}</h4>
                          <p className="text-sm text-base-content/60 mt-1">
                            {petLevel === 1 && "🥚 Hatchling"}
                            {petLevel === 2 && "🌱 Explorer"}
                            {petLevel === 3 && "⭐ Scholar"}
                            {petLevel === 4 && "👑 Legend"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Game Selection */}
                    <div className="space-y-4">
                      <div className={`${floatingPanelBase} p-6 hover:shadow-xl transition-all cursor-pointer group`}
                        onClick={startShooter}>
                        <div className="flex items-center gap-4">
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-3xl shadow-lg group-hover:scale-110 transition-transform">
                            👾
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-base-content text-lg">Alien Shooter</h4>
                            <p className="text-sm text-base-content/60 mt-1">Your pet defends against alien invaders! Move and shoot!</p>
                          </div>
                        </div>
                        <button className="btn btn-secondary w-full mt-4">
                          Play Now! 🎮
                        </button>
                      </div>

                      <div className={`${floatingPanelBase} p-6 hover:shadow-xl transition-all cursor-pointer group`}
                        onClick={startQuiz}>
                        <div className="flex items-center gap-4">
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-3xl shadow-lg group-hover:scale-110 transition-transform">
                            🧠
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-base-content text-lg">Knowledge Quiz</h4>
                            <p className="text-sm text-base-content/60 mt-1">Test your blockchain knowledge! Learn while you play!</p>
                          </div>
                        </div>
                        <button className="btn btn-secondary w-full mt-4">
                          Play Now! 📚
                        </button>
                      </div>

                      <div className={`${floatingPanelBase} p-4 border-2 border-dashed border-purple-300 dark:border-purple-700`}>
                        <p className="text-center text-sm text-purple-600 dark:text-purple-400 font-semibold">
                          💡 Want more games? Create a DAO proposal!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Alien Shooter Game */}
                {currentGame === "shooter" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <button onClick={quitGame} className="btn btn-sm btn-ghost">
                        ← Back
                      </button>
                      <div className="flex gap-4 text-sm font-semibold">
                        <span className="text-purple-600 dark:text-purple-400">Score: {gameScore}</span>
                        <span className="text-pink-600 dark:text-pink-400">Time: {gameTime}s</span>
                        <span className="text-blue-600 dark:text-blue-400">Best: {gameHighScore}</span>
                      </div>
                    </div>

                    {!gameOver ? (
                      <div 
                        className={`${floatingPanelBase} relative overflow-hidden bg-gradient-to-b from-purple-900 to-black`} 
                        style={{ height: '500px' }}
                      >
                        {/* Stars background */}
                        <div className="absolute inset-0 opacity-30">
                          {[...Array(30)].map((_, i) => (
                            <div 
                              key={i} 
                              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                              style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                              }}
                            />
                          ))}
                        </div>

                        {/* Aliens */}
                        {aliens.map(alien => (
                          <div
                            key={alien.id}
                            className="absolute text-4xl"
                            style={{
                              left: `${alien.x}%`,
                              top: `${alien.y}%`,
                              transform: 'translate(-50%, -50%)',
                            }}
                          >
                            👾
                          </div>
                        ))}

                        {/* Bullets */}
                        {bullets.map(bullet => (
                          <div
                            key={bullet.id}
                            className="absolute w-2 h-4 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"
                            style={{
                              left: `${bullet.x}%`,
                              top: `${bullet.y}%`,
                              transform: 'translate(-50%, -50%)',
                            }}
                          />
                        ))}

                        {/* Pet at bottom */}
                        <div
                          className="absolute bottom-4 transition-all duration-100"
                          style={{
                            left: `${petX}%`,
                            transform: 'translateX(-50%)',
                          }}
                        >
                          <div className="relative" style={{ width: '60px', height: '60px' }}>
                            <PixelPet
                              petType={(studentStats?.petType as "cat" | "fox" | "dog" | "rabbit" | "owl" | "dragon" | "penguin" | "bear") || "cat"}
                              level={petLevel as 1 | 2 | 3 | 4}
                              accessories={[
                                ...(studentStats?.scarfColor ? [{ type: "scarf" as const, color: studentStats.scarfColor }] : []),
                                ...(petLevel >= 3 ? [{ type: "crown" as const }] : []),
                              ]}
                              size={60}
                            />
                          </div>
                        </div>

                        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
                          <p className="text-xl font-bold text-white drop-shadow-lg">Use Arrow Keys (← →) or A/D to Move!</p>
                          <p className="text-sm text-white/80 mt-1">Press SPACEBAR to Shoot! 🚀</p>
                          <p className="text-xs text-white/60 mt-2">Don't let aliens reach the bottom!</p>
                        </div>
                      </div>
                    ) : (
                      <div className={`${floatingPanelBase} p-12 text-center`}>
                        <h3 className="text-3xl font-bold text-base-content mb-4">🎉 Mission Complete!</h3>
                        <p className="text-xl text-base-content/70 mb-2">Aliens Defeated: {gameScore / 10}</p>
                        <p className="text-lg text-base-content/70 mb-6">Final Score: {gameScore}</p>
                        <div className="flex gap-4 justify-center">
                          <button onClick={() => startShooter()} className="btn btn-primary">
                            Play Again
                          </button>
                          <button onClick={quitGame} className="btn btn-ghost">
                            Back to Games
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Knowledge Quiz Game */}
                {currentGame === "quiz" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <button onClick={quitGame} className="btn btn-sm btn-ghost">
                        ← Back
                      </button>
                      <div className="flex gap-4 text-sm font-semibold">
                        <span className="text-blue-600 dark:text-blue-400">Question: {currentQuestion + 1}/5</span>
                        <span className="text-cyan-600 dark:text-cyan-400">Score: {quizScore}</span>
                        <span className="text-purple-600 dark:text-purple-400">Best: {gameHighScore}</span>
                      </div>
                    </div>

                    {!gameOver ? (
                      <div className={`${floatingPanelBase} p-8`}>
                        {/* Pet thinking */}
                        <div className="flex justify-center mb-6">
                          <div className="relative" style={{ width: '100px', height: '100px' }}>
                            <PixelPet
                              petType={(studentStats?.petType as "cat" | "fox" | "dog" | "rabbit" | "owl" | "dragon" | "penguin" | "bear") || "cat"}
                              level={petLevel as 1 | 2 | 3 | 4}
                              accessories={[
                                ...(studentStats?.scarfColor ? [{ type: "scarf" as const, color: studentStats.scarfColor }] : []),
                                ...(petLevel >= 3 ? [{ type: "crown" as const }] : []),
                              ]}
                              size={100}
                            />
                            <div className="absolute -top-2 -right-2 text-2xl animate-bounce">�</div>
                          </div>
                        </div>

                        <div className="max-w-2xl mx-auto">
                          <h3 className="text-2xl font-bold text-base-content mb-6 text-center">
                            {quizQuestions[currentQuestion].question}
                          </h3>

                          <div className="space-y-3">
                            {quizQuestions[currentQuestion].options.map((option, index) => {
                              const isSelected = selectedAnswer === index;
                              const isCorrect = index === quizQuestions[currentQuestion].correct;
                              const showResult = showQuizResult;

                              return (
                                <button
                                  key={index}
                                  onClick={() => handleAnswerSelect(index)}
                                  disabled={showQuizResult}
                                  className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                                    !showResult
                                      ? 'bg-base-200 hover:bg-base-300 hover:scale-102'
                                      : isSelected && isCorrect
                                      ? 'bg-green-500 text-white'
                                      : isSelected && !isCorrect
                                      ? 'bg-red-500 text-white'
                                      : isCorrect
                                      ? 'bg-green-500 text-white'
                                      : 'bg-base-200 opacity-50'
                                  }`}
                                >
                                  <span className="mr-3">{String.fromCharCode(65 + index)}.</span>
                                  {option}
                                  {showResult && isCorrect && <span className="float-right">✓</span>}
                                  {showResult && isSelected && !isCorrect && <span className="float-right">✗</span>}
                                </button>
                              );
                            })}
                          </div>

                          {showQuizResult && (
                            <div className="mt-6 text-center">
                              <p className={`text-lg font-bold ${selectedAnswer === quizQuestions[currentQuestion].correct ? 'text-green-600' : 'text-red-600'}`}>
                                {selectedAnswer === quizQuestions[currentQuestion].correct ? '🎉 Correct! +20 points' : '❌ Wrong answer!'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className={`${floatingPanelBase} p-12 text-center`}>
                        <div className="mb-6">
                          <div className="flex justify-center mb-4">
                            <div className="relative" style={{ width: '120px', height: '120px' }}>
                              <PixelPet
                                petType={(studentStats?.petType as "cat" | "fox" | "dog") || "cat"}
                                level={petLevel as 1 | 2 | 3 | 4}
                                accessories={[
                                  ...(studentStats?.scarfColor ? [{ type: "scarf" as const, color: studentStats.scarfColor }] : []),
                                ]}
                                size={120}
                              />
                              <div className="absolute -top-2 -right-2 text-3xl">
                                {quizScore >= 80 ? '🏆' : quizScore >= 60 ? '⭐' : '💪'}
                              </div>
                            </div>
                          </div>
                          <h3 className="text-3xl font-bold text-base-content mb-4">
                            {quizScore >= 80 ? '🏆 Amazing!' : quizScore >= 60 ? '⭐ Good Job!' : '� Keep Learning!'}
                          </h3>
                          <p className="text-xl text-base-content/70 mb-2">You got {quizScore / 20} out of 5 correct!</p>
                          <p className="text-lg text-base-content/70 mb-6">Final Score: {quizScore}</p>
                        </div>
                        <div className="flex gap-4 justify-center">
                          <button onClick={() => startQuiz()} className="btn btn-info">
                            Try Again
                          </button>
                          <button onClick={quitGame} className="btn btn-ghost">
                            Back to Games
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className={`${floatingPanelBase} p-6`}>
                <h3 className="text-lg font-semibold text-base-content">Mint your student NFT to play!</h3>
                <p className="mt-2 text-sm text-base-content/70">
                  Get your study buddy in the Profile tab and unlock fun mini-games!
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