"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { PixelPet } from "./pets/PixelPet";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "🎨 Profile",
    href: "/",
  },
  {
    label: "💬 Discussions", 
    href: "/?tab=discussion",
  },
  {
    label: "🗳️ Vote",
    href: "/?tab=dao", 
  },
  {
    label: "📚 Wiki",
    href: "/?tab=wiki",
  },
  {
    label: "🎮 Pet Game",
    href: "/?tab=game",
  },
  {
    label: "🔧 Debug",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = ({ onNavigate }: { onNavigate?: () => void } = {}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get("tab") ?? undefined;

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        // Handle query parameter based navigation for ClassDAO tabs
        let isActive = false;
        if (pathname === "/" && href.includes("?tab=")) {
          const tabParam = href.split("?tab=")[1];
          isActive = currentTab === tabParam;
        } else if (pathname === "/" && href === "/") {
          isActive = !currentTab || currentTab === "profile";
        } else {
          isActive = pathname === href;
        }
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              onClick={onNavigate}
              className={`group relative overflow-hidden flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${
                isActive
                  ? "border-2 border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105"
                  : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105"
              }`}
            >
              {icon}
              <span className="relative z-10">{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const { address: connectedAddress } = useAccount();

  // Fetch student data for mini NFT display
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

  const studentStats = studentData?.[1];
  const petLevel = studentStats?.petLevel !== undefined ? Number(studentStats.petLevel) : 1;
  const level = studentStats ? Number(studentStats.level) : 0;

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <header className="sticky top-3 z-30 mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="group relative rounded-3xl border-2 border-gray-200/60 dark:border-gray-700/60 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl shadow-xl transition-all duration-500 hover:shadow-2xl">
        {/* Subtle glow orbs */}
        <span className="pointer-events-none absolute -top-12 left-20 h-28 w-28 rounded-full bg-blue-500/10 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-16 right-16 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
        
        {/* Shine overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        
        <div className="relative z-10 flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <details className="dropdown lg:hidden" ref={burgerMenuRef}>
              <summary className="btn btn-ghost btn-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 transition-all">
                <Bars3Icon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
              </summary>
              <ul
                className="menu dropdown-content mt-3 w-56 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/98 dark:bg-gray-900/98 p-4 shadow-2xl backdrop-blur-xl"
                onClick={() => {
                  burgerMenuRef?.current?.removeAttribute("open");
                }}
              >
                <HeaderMenuLinks onNavigate={() => burgerMenuRef?.current?.removeAttribute("open")} />
              </ul>
            </details>
            
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 px-5 py-2.5 shadow-md">
                <span className="text-2xl">🎓</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">ClassDAO</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">Learning Hub</span>
                </div>
              </div>
              
              {/* Mobile logo */}
              <div className="flex lg:hidden items-center gap-2">
                <span className="text-xl">🎓</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">ClassDAO</span>
              </div>
            </div>
            
            <nav className="hidden lg:block">
              <ul className="flex items-center gap-2">
                <HeaderMenuLinks />
              </ul>
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Mini NFT Display */}
            {hasNFT && studentStats && (
              <Link href="/?tab=profile" className="group">
                <div className="relative flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 shadow-md transition-all hover:scale-105 hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                  
                  {/* Pet container */}
                  <div className="relative z-10 h-10 w-10 animate-float">
                    <PixelPet
                      petType={(studentStats?.petType as "cat" | "fox" | "dog") || "cat"}
                      level={petLevel as 1 | 2 | 3 | 4}
                      accessories={[
                        ...(studentStats?.scarfColor ? [{ type: "scarf" as const, color: studentStats.scarfColor }] : []),
                      ]}
                      size={40}
                    />
                    {/* Level badge */}
                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white dark:border-gray-800 bg-blue-500 text-[10px] font-bold text-white shadow-lg">
                      {level}
                    </div>
                  </div>
                  
                  {/* Pet name (hidden on mobile) */}
                  <span className="hidden sm:block text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {studentStats?.petName || "Explorer"}
                  </span>
                </div>
              </Link>
            )}
            
            <div className="relative rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 shadow-md transition-all hover:scale-105 hover:shadow-lg">
              <RainbowKitCustomConnectButton />
            </div>
            {isLocalNetwork && (
              <div className="rounded-full border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/30 transition-all hover:scale-105">
                <FaucetButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
