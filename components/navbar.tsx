"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useWeb3 } from "@/lib/web3-context";
import { WalletConnectButton } from "./wallet-connect-button";

export const Navbar = () => {
  const { account, disconnect } = useWeb3();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/auctions", label: "Auctions" },
    { href: "/vote", label: "Vote" },
    { href: "/submit", label: "Submit Domain" },
  ];

  return (
    <nav
      className={`fixed top-0 z-50 w-full border-b transition-colors duration-300 ${
        scrolled
          ? "border-indigo-500/40 bg-indigo-900/30 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-400/15 ring-1 ring-indigo-300/25">
            <img src="/gogobit.png" alt="GogoBid" width={18} height={18} />
          </div>
          <span className="text-[20px] font-semibold tracking-wide text-white">
            Gogo<span className="text-indigo-300">Bid</span>
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative text-sm font-medium transition-colors ${
                  active
                    ? "text-white"
                    : "text-slate-300/70 hover:text-white"
                }`}
              >
                {label}
                {/* underline indicator */}
                <span
                  className={`absolute left-0 -bottom-1 h-[2px] w-full rounded-full transition-transform duration-300 ${
                    active
                      ? "scale-x-100 bg-indigo-400"
                      : "scale-x-0 bg-indigo-400 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* Wallet */}
        <WalletConnectButton className="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1.5 text-sm text-white shadow hover:brightness-110" />
      </div>
    </nav>
  );
};
