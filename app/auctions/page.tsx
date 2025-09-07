// app/auctions/page.tsx (atau komponen AuctionsPage)
"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { Clock, Users, Shield, Search, Filter, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { getNames } from "@/lib/get-names";
import { fetchAuctionData } from "@/lib/fetchAuctionData";
import { getBidderCount } from "@/lib/get-bidder-count";
import Starfield from "@/components/starfield";
import { AuctionSkeletonCard } from "@/components/loading-data";

// import { Navbar } from "@/components/navbar";

// ---------- helpers ----------
function useTimeLeft(endTime: Date) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const update = () => {
      const diff = endTime.getTime() - Date.now();
      if (diff <= 0) return setTimeLeft("Expired");
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      setTimeLeft(`${days}d ${hours}h`);
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [endTime]);
  return timeLeft;
}

function AuctionTime({ endTime }: { endTime: Date }) {
  const timeLeft = useTimeLeft(endTime);
  return <span className="font-mono text-sm">{timeLeft}</span>;
}

// ---------- page ----------
export default function AuctionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("ending-soon");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [auctions, setAuctions] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  function withTimeout<T>(p: Promise<T>, ms = 12000): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error("Timeout")), ms);
    p.then((v) => { clearTimeout(id); resolve(v); })
     .catch((e) => { clearTimeout(id); reject(e); });
  });
}


  // Fetch
useEffect(() => {
  let cancelled = false;
  const inFlight = { current: false } as { current: boolean }; // atau useRef(false)

  async function load(refresh: boolean) {
    if (inFlight.current) return;           // cegah overlap
    inFlight.current = true;

    if (refresh) setIsRefreshing(true);
    else setIsInitialLoading(true);

    try {
      const names = await withTimeout(getNames(), 12000);

      const promises = names.flatMap((nameItem: any) =>
        (nameItem.tokens ?? []).map((token: any) =>
          withTimeout(
            (async () => {
              const onchain = await fetchAuctionData(token.tokenId);
              if (!onchain?.active || onchain.endTime.getTime() <= Date.now()) return null;
              const bidderCount = await getBidderCount(token.tokenId);
              return {
                id: token.tokenId,
                domain: nameItem.name,
                verified: nameItem.registrar?.name === "D3 Registrar",
                currentBid: parseFloat(onchain.highestBid),
                endTime: onchain.endTime,
                timeLeftHours: Math.max(0, Math.floor((onchain.endTime.getTime() - Date.now()) / (1000 * 60 * 60))),
                bidders: bidderCount,
                category: "General",
                status: "live",
                startingBid: 0,
              };
            })(),
            12000
          )
        )
      );

      const settled = await Promise.allSettled(promises);
      const items = settled
        .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
        .map((r) => r.value)
        .filter(Boolean);

      if (!cancelled) setAuctions(items);
    } catch (e) {
      console.error("Error loading auctions", e);
    } finally {
      if (!cancelled) {
        refresh ? setIsRefreshing(false) : setIsInitialLoading(false);
      }
      inFlight.current = false;
    }
  }

  // initial
  load(false);

  // refresh loop TANPA setInterval (biar nunggu selesai dulu)
  let t: any;
  const tick = async () => {
    if (cancelled) return;
    await load(true);
    t = setTimeout(tick, 15000);
  };
  t = setTimeout(tick, 15000);

  return () => { cancelled = true; clearTimeout(t); };
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

  const getStatusText = (status: string) => {
    if (status === "ending-soon") return "Ending Soon";
    if (status === "new") return "New";
    if (status === "ended") return "Ended";
    return "Live";
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
      {/* Starfield di layer paling belakang */}
      <Starfield density={0.0014} speed={0.5} maxParallax={14} className="z-0" />
      <br />
      <br />
      {/* Navbar */}
      {/* <Navbar /> */}

      {/* Header */}
      <section className="py-12 px-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold bg-[linear-gradient(90deg,#60a5fa,#a78bfa)] bg-clip-text text-transparent">Domain Auctions</h1>
            <p className="text-slate-300/75">Discover and bid on premium curated domains • {filteredAndSortedAuctions.length} auctions available</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-indigo-400/15 text-indigo-300 border border-indigo-300/30">{auctions.filter((a) => a.status === "live").length} Live</Badge>
            <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">
              {auctions.filter((a) => a.status === "ending-soon").length} Ending Soon
            </Badge>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 px-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/30 border border-white/10 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-black/30 border-white/10 text-white">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ending-soon">Ending Soon</SelectItem>
                <SelectItem value="highest-bid">Highest Bid</SelectItem>
                <SelectItem value="lowest-bid">Lowest Bid</SelectItem>
                <SelectItem value="most-bidders">Most Bidders</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[140px] bg-black/30 border-white/10 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Tech">Tech</SelectItem>
                <SelectItem value="Gaming">Gaming</SelectItem>
                <SelectItem value="Art">Art</SelectItem>
                <SelectItem value="Governance">Governance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[120px] bg-black/30 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="ending-soon">Ending Soon</SelectItem>
                <SelectItem value="new">New</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-[140px] bg-black/30 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-5">Under 5 ETH</SelectItem>
                <SelectItem value="5-15">5–15 ETH</SelectItem>
                <SelectItem value="15-30">15–30 ETH</SelectItem>
                <SelectItem value="over-30">Over 30 ETH</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-8 px-6">
  <div className="max-w-7xl mx-auto">

    {/* SKELETON GRID */}
    {isInitialLoading ? (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <AuctionSkeletonCard key={i} />
        ))}
      </div>
    ) : filteredAndSortedAuctions.length === 0 ? (
      /* EMPTY STATE */
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-black/40 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No auctions found</h3>
        <p className="text-slate-400">Try adjusting your filters or search terms</p>
      </div>
    ) : (
      /* CONTENT GRID */
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedAuctions.map((auction) => (
          <Card
            key={auction.id}
            className="group bg-white/[0.05] border border-white/10 backdrop-blur-sm hover:border-indigo-300/40 transition relative overflow-hidden"
          >
            {/* hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(99,102,241,0.15),transparent_60%)]" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-semibold">{auction.domain}</span>
                  {auction.verified && <Shield className="w-4 h-4 text-indigo-300" />}
                </div>
                <Badge className={getStatusColor(auction.status)}>{getStatusText(auction.status)}</Badge>
              </div>

              <div className="space-y-3 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Bid</span>
                  <span className="font-semibold text-indigo-300">{auction.currentBid} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    Time Left
                  </span>
                  <AuctionTime endTime={new Date(auction.endTime)} />
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Users className="w-3 h-3" />
                    Bidders
                  </span>
                  <span>{auction.bidders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Category</span>
                  <Badge className="bg-white/10 text-slate-300 text-xs">{auction.category}</Badge>
                </div>
              </div>

              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  className="mt-5 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:brightness-110"
                >
                  <Link href={`/auctions/${auction.id}`}>
                    View Auction{/* (label sebelumnya “View All Auctions” kurang pas untuk detail item) */}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )}
  </div>
</section>

    </div>
  );
}
