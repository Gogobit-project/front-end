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
import { ethers } from "ethers";
import { getBidderCount } from "@/lib/get-bidder-count";

// helper format waktu
function useTimeLeft(endTime: Date) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function update() {
      const diff = endTime.getTime() - Date.now();
      if (diff <= 0) return setTimeLeft("Expired");
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      setTimeLeft(`${days}d ${hours}h`);
    }

    update();
    const interval = setInterval(update, 60 * 1000); // update tiap menit
    return () => clearInterval(interval);
  }, [endTime]);

  return timeLeft;
}

function AuctionTime({ endTime }: { endTime: Date }) {
  const timeLeft = useTimeLeft(endTime);
  return <span className="font-mono text-sm">{timeLeft}</span>;
}

export default function AuctionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("ending-soon");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data dari subgraph + kontrak
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const names = await getNames();

        const results = await Promise.all(
          names.flatMap(async (nameItem: any) =>
            Promise.all(
              nameItem.tokens.map(async (token: any) => {
                const onchain = await fetchAuctionData(token.tokenId);

                // ❌ skip kalau auction sudah berakhir atau tidak aktif
                if (!onchain.active || onchain.endTime.getTime() <= Date.now()) {
                  return null;
                }

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
              })
            )
          )
        );

        setAuctions(results.flat().filter(Boolean)); // ✅ hapus null
      } catch (e) {
        console.error("Error loading auctions", e);
      } finally {
        setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 15000); // 🔄 refresh tiap 15 detik
    return () => clearInterval(interval);
  }, []);

  // Filtering & Sorting
  const filteredAndSortedAuctions = useMemo(() => {
    const filtered = auctions.filter((auction) => {
      if (searchQuery && !auction.domain.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterCategory !== "all" && auction.category !== filterCategory) return false;
      if (filterStatus !== "all" && auction.status !== filterStatus) return false;

      if (priceRange !== "all") {
        const bid = auction.currentBid;
        switch (priceRange) {
          case "under-5":
            return bid < 5;
          case "5-15":
            return bid >= 5 && bid <= 15;
          case "15-30":
            return bid >= 15 && bid <= 30;
          case "over-30":
            return bid > 30;
          default:
            return true;
        }
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
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "new":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ending-soon":
        return "Ending Soon";
      case "new":
        return "New";
      case "ended":
        return "Ended";
      default:
        return "Live";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-bold text-foreground">GogoBid</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/auctions" className="text-primary font-medium">
                Auctions
              </Link>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                How it Works
              </a>
              <Link href="/submit" className="text-muted-foreground hover:text-foreground transition-colors">
                Submit Domain
              </Link>
            </div>
            <WalletConnectButton className="border-primary/20 text-primary hover:bg-primary/10 bg-transparent" />
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-12 px-6 border-b border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Domain Auctions</h1>
              <p className="text-muted-foreground">Discover and bid on premium curated domains • {filteredAndSortedAuctions.length} auctions available</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {auctions.filter((a) => a.status === "live").length} Live
              </Badge>
              <Badge variant="secondary" className="bg-red-500/10 text-red-400 border-red-500/20">
                {auctions.filter((a) => a.status === "ending-soon").length} Ending Soon
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 px-6 border-b border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search domains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border/50"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-background border-border/50">
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
                <SelectTrigger className="w-[140px] bg-background border-border/50">
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
                <SelectTrigger className="w-[120px] bg-background border-border/50">
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
                <SelectTrigger className="w-[140px] bg-background border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-5">Under 5 ETH</SelectItem>
                  <SelectItem value="5-15">5-15 ETH</SelectItem>
                  <SelectItem value="15-30">15-30 ETH</SelectItem>
                  <SelectItem value="over-30">Over 30 ETH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Auction Grid */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          {filteredAndSortedAuctions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No auctions found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedAuctions.map((auction) => (
                <Card key={auction.id} className="bg-card border-border/50 hover:border-primary/20 transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-lg font-semibold">{auction.domain}</span>
                        {auction.verified && <Shield className="w-4 h-4 text-primary" />}
                      </div>
                      <Badge className={getStatusColor(auction.status)}>{getStatusText(auction.status)}</Badge>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Current Bid</span>
                        <span className="font-semibold text-primary">{auction.currentBid} ETH</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Time Left
                        </span>
                        <AuctionTime endTime={new Date(auction.endTime)} />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Bidders
                        </span>
                        <span className="text-sm">{auction.bidders}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Category</span>
                        <Badge variant="secondary" className="text-xs">
                          {auction.category}
                        </Badge>
                      </div>
                    </div>

                    <Button className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <Link href={`/auctions/${auction.id}`} className="w-full">
                        View Auction
                      </Link>
                    </Button>
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
