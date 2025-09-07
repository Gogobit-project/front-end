"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { useWeb3 } from "@/lib/web3-context";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import Starfield from "@/components/starfield";
import { Navbar } from "@/components/navbar";
import { getNames } from "@/lib/get-names";
import { fetchAuctionData } from "@/lib/fetchAuctionData";
import { getBidderCount } from "@/lib/get-bidder-count";
import { ArrowUpCircle, Search, SlidersHorizontal, Shield, CheckCircle2 } from "lucide-react";
import { getSubmittedDomains } from "@/lib/get-domain-submitted";
import { getNameMap } from "@/lib/get-name-map";
import { getAuctionStarted } from "@/lib/get-auction-started";
import { useApproveAndStartAuction } from "./handleSubmit";
import { AuctionSkeletonCard } from "@/components/loading-data";
// import { handleSubmit, useApproveAndStartAuction } from "./handleSubmit";

// --------- MOCK DATA (replace with real fetch) ----------
type DomainItem = {
  id: string;
  name: string;
  category: string;
  verified?: boolean;
  votes: number;
};

export default function VotePage() {
  const { account, isConnected, connect } = useWeb3();
  const { toast } = useToast();

  const [domains, setDomains] = useState<DomainItem[]>([]);

  const [voted, setVoted] = useState<Record<string, boolean>>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("ending-soon");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [auctions, setAuctions] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { submit, tx } = useApproveAndStartAuction();

  type SubmittedVM = {
    tokenId: string;
    seller: string;
    name: string; // kosongkan saja "" kalau null
  };

  const [submitted, setSubmitted] = useState<SubmittedVM[]>([]);

  useEffect(() => {
    async function load() {
      setIsInitialLoading(true);
      try {
        // 1) Ambil semua submitted events (punyamu sendiri)
        const events = await getSubmittedDomains(); // [{ tokenId, seller }, ...]
        const tokenIds = events.map((e) => String(e.tokenId));

        // 2) Ambil name untuk masing-masing tokenId
        const namesMap = await getNameMap(tokenIds); // Map<string, string>

        // 3) Ambil event AuctionStarted untuk tokenIds tsb
        const eventsByToken = await getAuctionStarted(tokenIds, 0, "latest");
        // bentuk: { "123": [ {..row..}, ... ], "456": [], ... }

        // 4) Buat set token yang SUDAH punya AuctionStarted
        const startedSet = new Set(Object.keys(eventsByToken).filter((id) => (eventsByToken[id]?.length ?? 0) > 0));

        // 5) Bangun view: hanya token yang TIDAK ada di startedSet
        const view: SubmittedVM[] = events
          .filter((e) => !startedSet.has(String(e.tokenId)))
          .map((e) => ({
            tokenId: String(e.tokenId),
            seller: String(e.seller),
            name: namesMap.get(String(e.tokenId)) ?? "",
          }));

        setSubmitted(view);
      } catch (err) {
        console.error("Failed load submitted domains", err);
      } finally {
        setIsInitialLoading(false);
      }
    }
    load();
  }, []);

  // Filter & sort
  const filteredAndSortedAuctions = useMemo(() => {
    const filtered = auctions.filter((a) => {
      if (searchQuery && !a.domain.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterCategory !== "all" && a.category !== filterCategory) return false;
      if (filterStatus !== "all" && a.status !== filterStatus) return false;

      if (priceRange !== "all") {
        const b = a.currentBid;
        if (priceRange === "under-5") return b < 5;
        if (priceRange === "5-15") return b >= 5 && b <= 15;
        if (priceRange === "15-30") return b >= 15 && b <= 30;
        if (priceRange === "over-30") return b > 30;
      }
      return true;
    });

    switch (sortBy) {
      case "ending-soon":
        return filtered.sort((a, b) => a.timeLeftHours - b.timeLeftHours);
      case "highest-bid":
        return filtered.sort((a, b) => b.currentBid - a.currentBid);
      case "lowest-bid":
        return filtered.sort((a, b) => a.currentBid - b.currentBid);
      case "most-bidders":
        return filtered.sort((a, b) => b.bidders - a.bidders);
      case "newest":
        return filtered.sort((a, b) => b.timeLeftHours - a.timeLeftHours);
      default:
        return filtered;
    }
  }, [searchQuery, sortBy, filterCategory, filterStatus, priceRange, auctions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ending-soon":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "new":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-indigo-400/15 text-indigo-300 border-indigo-300/30";
    }
  };

  const filtered = useMemo(() => {
    const s = searchQuery.trim().toLowerCase();
    let arr = domains.filter((d) => (s ? d.name.toLowerCase().includes(s) : true));
    if (sortBy === "most") arr = arr.sort((a, b) => b.votes - a.votes);
    if (sortBy === "least") arr = arr.sort((a, b) => a.votes - b.votes);
    if (sortBy === "az") arr = arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [domains, searchQuery, sortBy]);

  const handleVote = async (domain: DomainItem) => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet belum terhubung",
        description: "Hubungkan wallet untuk melakukan vote.",
        action: (
          <ToastAction altText="Connect" onClick={connect}>
            Connect
          </ToastAction>
        ),
      });
      return;
    }
    if (voted[domain.id]) return;

    // TODO: call your API/contract here
    setDomains((prev) => prev.map((d) => (d.id === domain.id ? { ...d, votes: d.votes + 1 } : d)));
    setVoted((prev) => ({ ...prev, [domain.id]: true }));

    toast({
      description: (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span>{domain.name} menerima suaramu.</span>
        </div>
      ),
    });
  };

  return (
    <div
      className="relative min-h-screen text-white overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(1200px 600px at 50% -10%, rgba(124,58,237,0.10), transparent 60%),
          radial-gradient(1200px 600px at 100% 120%, rgba(59,130,246,0.10), transparent 60%),
          linear-gradient(180deg,#120c20 0%,#17112a 50%,#120e22 100%)
        `,
      }}
    >
      <Starfield density={0.0014} speed={0.5} maxParallax={14} className="z-0" />
      <br />
      <br />

      {/* NAV */}
      {/* <Navbar /> */}

      {/* HEADER */}
      <section className="py-12 px-6 border-b border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold bg-[linear-gradient(90deg,#60a5fa,#a78bfa)] bg-clip-text text-transparent">Community Vote</h1>
            <p className="text-slate-300/85">Select and support your favorite domain</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search domains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/30 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-[180px] bg-black/30 border-white/10 text-white">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="most">Most Votes</SelectItem>
                <SelectItem value="least">Least Votes</SelectItem>
                <SelectItem value="az">A → Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          {isInitialLoading ? (
             <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <AuctionSkeletonCard key={i} />
                    ))}
                  </div>
          ) : submitted.length === 0 ? (
            <div className="text-center py-20 text-slate-400">Nothing domain ready to be vote.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {submitted.map((s) => (
                <Card key={s.tokenId} className="group bg-white/[0.05] border border-white/10 backdrop-blur-sm hover:border-indigo-300/40 transition">
                  <CardHeader>
                    <span className="font-mono text-lg font-semibold">{s.name ? s.name : `Token #${s.tokenId.slice(0, 6)}...`}</span>

                    {/* kalau mau tampilkan seller */}
                    <div className="text-xs text-slate-400 mt-1">
                      Seller: {s.seller.slice(0, 6)}...{s.seller.slice(-4)}
                    </div>
                      <div className="text-center mt-8">
                    <Button
                      onClick={() => submit(s.tokenId)}
                      variant="outline"
                      size="lg"
                      className="mt-5 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:brightness-110"
                    >
                      Up vote
                    </Button>
                  </div>
                  </CardHeader>
                
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
