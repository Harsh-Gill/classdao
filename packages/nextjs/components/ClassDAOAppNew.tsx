"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { ProfilePage } from "./ProfilePage";
import { DiscussionPage } from "./DiscussionPage";
import { DAOPage } from "./DAOPage";
import { WikiPage } from "./WikiPage";

export const ClassDAOApp = () => {
  const { address: connectedAddress } = useAccount();
  const [activeTab, setActiveTab] = useState("profile");

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

  const renderPage = () => {
    switch (activeTab) {
      case "profile":
        return <ProfilePage />;
      case "discussion":
        return <DiscussionPage />;
      case "dao":
        return <DAOPage />;
      case "wiki":
        return <WikiPage />;
      default:
        return <ProfilePage />;
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">🎓 ClassDAO</h1>
        </div>
        <div className="flex-none">
          <Address address={connectedAddress} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tabs tabs-bordered justify-center p-4 bg-base-100 shadow-sm">
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

      {/* Page Content */}
      {renderPage()}
    </div>
  );
};