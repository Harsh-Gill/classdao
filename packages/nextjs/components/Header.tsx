"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "👤 Profile",
    href: "/",
  },
  {
    label: "💬 Discussions", 
    href: "/?tab=discussion",
  },
  {
    label: "🗳️ DAO",
    href: "/?tab=dao", 
  },
  {
    label: "📚 TXN Wiki",
    href: "/?tab=wiki",
  },
  {
    label: "Debug Contracts",
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
              className={`group flex items-center gap-2 rounded-full border border-transparent px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "border-white/30 bg-white/15 text-white shadow-[0_10px_30px_-12px_rgba(56,189,248,0.65)]"
                  : "border-white/10 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white"
              }`}
            >
              {icon}
              <span>{label}</span>
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

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <header className="sticky top-3 z-30 mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b1120]/85 backdrop-blur-2xl shadow-[0_12px_60px_-18px_rgba(59,130,246,0.55)]">
        <span className="pointer-events-none absolute -top-10 left-20 h-24 w-24 rounded-full bg-indigo-500/25 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-14 right-16 h-28 w-28 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative z-10 flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <details className="dropdown lg:hidden" ref={burgerMenuRef}>
              <summary className="btn btn-ghost btn-sm hover:bg-white/10">
                <Bars3Icon className="h-5 w-5 text-white" />
              </summary>
              <ul
                className="menu dropdown-content mt-3 w-48 rounded-2xl border border-white/10 bg-[#0b1120]/95 p-3 shadow-lg backdrop-blur-xl"
                onClick={() => {
                  burgerMenuRef?.current?.removeAttribute("open");
                }}
              >
                <HeaderMenuLinks onNavigate={() => burgerMenuRef?.current?.removeAttribute("open")} />
              </ul>
            </details>
            <div className="hidden text-white/70 lg:flex lg:flex-col">
              <span className="text-[11px] uppercase tracking-[0.4em] text-white/40">ClassDAO</span>
              <span className="text-sm font-semibold">Control center</span>
            </div>
            <nav className="hidden lg:block">
              <ul className="flex items-center gap-2">
                <HeaderMenuLinks />
              </ul>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {isLocalNetwork && (
              <span className="hidden rounded-full border border-amber-200/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-100 sm:inline-flex">
                Hardhat
              </span>
            )}
            <div className="rounded-full border border-white/10 bg-white/10 px-2 py-1 backdrop-blur">
              <RainbowKitCustomConnectButton />
            </div>
            {isLocalNetwork && <FaucetButton />}
          </div>
        </div>
      </div>
    </header>
  );
};
