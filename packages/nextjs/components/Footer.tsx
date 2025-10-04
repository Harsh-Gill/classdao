import React from "react";
import Link from "next/link";
import { hardhat } from "viem/chains";
import { CurrencyDollarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { BuidlGuidlLogo } from "~~/components/assets/BuidlGuidlLogo";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useGlobalState } from "~~/services/store/store";

/**
 * Site footer
 */
export const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <footer className="relative mt-16 py-8 px-4">
      {/* Professional gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-50/80 via-white/80 to-gray-50/80 dark:from-gray-900/80 dark:via-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700" />
      
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Top section with tools */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-3">
            {nativeCurrencyPrice > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 shadow-md transition-all hover:scale-105 hover:shadow-lg">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <CurrencyDollarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-gray-900 dark:text-white">${nativeCurrencyPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
            {isLocalNetwork && (
              <>
                <div className="rounded-xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20 shadow-md transition-all hover:scale-105">
                  <Faucet />
                </div>
                <Link href="/blockexplorer" passHref className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-bold shadow-md transition-all hover:scale-105 hover:shadow-lg">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">Block Explorer</span>
                </Link>
              </>
            )}
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 shadow-md transition-all hover:scale-105">
            <SwitchTheme className="" />
          </div>
        </div>
        
        {/* Bottom section with links */}
        <div className="flex flex-wrap justify-center items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <a href="https://github.com/scaffold-eth/se-2" target="_blank" rel="noreferrer" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            🍴 Fork me
          </a>
          <span className="text-gray-400 dark:text-gray-600">·</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">Built with</span>
            <HeartIcon className="inline-block h-4 w-4 text-red-500" />
            <span className="font-medium">at</span>
            <a
              className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              href="https://buidlguidl.com/"
              target="_blank"
              rel="noreferrer"
            >
              <BuidlGuidlLogo className="w-3 h-5 pb-1" />
              <span>BuidlGuidl</span>
            </a>
          </div>
          <span className="text-gray-400 dark:text-gray-600">·</span>
          <a href="https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA" target="_blank" rel="noreferrer" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            💬 Support
          </a>
        </div>
      </div>
    </footer>
  );
};
