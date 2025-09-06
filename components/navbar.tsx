"use client";

import Link from "next/link";
import { UserMenu } from "./dashboard/UserMenu";
import { useWeb3 } from "@/lib/web3-context";

export const Navbar = () => {
  const { account, disconnect } = useWeb3();

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-400/15 ring-1 ring-indigo-300/25">
            <img src="/gogobit.png" alt="GogoBid" width={18} height={18} />
          </div>
          <span className="text-[20px] font-semibold tracking-wide text-white">
            Gogo<span className="text-indigo-300">Bid</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/auctions" className="text-slate-300/70 hover:text-white">
            Auctions
          </Link>
          <Link href="/vote" className="text-slate-300/70 hover:text-white">
            Vote
          </Link>
          <Link href="/submit" className="text-slate-300/70 hover:text-white">
            Submit Domain
          </Link>
        </div>

        <UserMenu account={account} disconnect={disconnect} />
      </div>
    </nav>
  );
};
