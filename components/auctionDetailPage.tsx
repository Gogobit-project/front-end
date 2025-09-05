"use client";

import { useState, useEffect } from "react";
import { getAuctionDetail } from "@/lib/get-auction-detail";
import { fetchAuctionData } from "@/lib/fetchAuctionData";
import { useWeb3 } from "@/lib/web3-context";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { getNames } from "@/lib/get-names";
import { Clock, Users, Shield, ChevronLeft, ExternalLink, Calendar, Globe, History, Gavel, AlertCircle, CheckCircle, Loader2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { auctionContract, getAuctionContractWithSigner } from "@/lib/auction-contract";
import { getBidHistory } from "@/lib/get-bid-history";

// ==================== Types ==================== //
interface Bid {
  id: string;
  bidder: string;
  amount: string;
  timestamp: string;
  txHash: string;
}

interface AuctionData {
  id: string;
  domain: string;
  verified?: boolean;
  currentBid: number;
  bidders: number;
  explorerUrl?: string;
  listings?: any[];
  highestBid: string;
  highestBidder: string;
  endTime: Date;
  active: boolean;
  bidHistory: Bid[];
  // tambahan supaya aman
  category: string;
  status: "live" | "ended" | "ending-soon" | "new";
  startingBid: number;
  reservePrice: number;
  reserveMet: boolean;
  description?: string;
  totalBids: number;

  domainInfo: {
    registrationDate: string;
    expiryDate: string;
    registrar: string;
    whoisInfo: string;
    dnsRecords: string[];
  };
}

function calculateDomainDates(endTime: Date) {
  const expiryDate = endTime;
  const registrationDate = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

  const format = (d: Date) => d.toISOString().replace("T", " ").split(".")[0];
  // hasil: "2025-09-03 11:32:00"

  return {
    registrationDate: format(registrationDate),
    expiryDate: format(expiryDate),
  };
}

export default function AuctionDetailPage({ tokenId }: { tokenId: string }) {
  const { account, isConnected } = useWeb3();
  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // 🔄 Fetch data
  useEffect(() => {
    async function load() {
      try {
        const subgraphData = await getAuctionDetail(tokenId);
        const onchainData = await fetchAuctionData(tokenId);
        const bidHistory = await getBidHistory(tokenId);

        if (!subgraphData) {
          setAuction(null);
          return;
        }

        const { registrationDate, expiryDate } = calculateDomainDates(onchainData.endTime);

        setAuction({
          id: tokenId,
          domain: subgraphData.name,
          verified: subgraphData.registrar?.name === "D3 Registrar",
          currentBid: parseFloat(onchainData.highestBid),
          bidders: onchainData.highestBidder !== ethers.ZeroAddress ? 1 : 0,
          highestBid: onchainData.highestBid,
          highestBidder: onchainData.highestBidder,
          endTime: onchainData.endTime,
          active: onchainData.active,
          explorerUrl: subgraphData.tokens?.[0]?.explorerUrl,
          listings: subgraphData.tokens?.[0]?.listings ?? [],
          bidHistory,
          // default agar tidak error

          category: "General",
          status: onchainData.active ? "live" : "ended",
          startingBid: 0,
          reservePrice: 0,
          reserveMet: false,
          totalBids: bidHistory.length,
          description:
            "Premium crypto domain perfect for DeFi projects, exchanges, or crypto-related businesses. This domain has significant SEO value and brand recognition in the cryptocurrency space.",

          domainInfo: {
            registrationDate,
            expiryDate,
            registrar: subgraphData.registrar?.name ?? "Unknown",
            whoisInfo: "Domain registered through ENS protocol",
            dnsRecords: [`A: 192.168.1.1`, `CNAME: www.${subgraphData.name}`],
          },
        });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [tokenId]);

  // ⏱ Countdown
  useEffect(() => {
    if (!auction?.endTime) return;
    const timer = setInterval(() => {
      const diff = auction.endTime.getTime() - Date.now();
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [auction]);

  if (loading) return <div className="p-10 text-center">Loading auction...</div>;
  if (!auction) return <div className="p-10 text-center">Auction not found</div>;

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
      default:
        return "Live";
    }
  };

  const handlePlaceBid = async () => {
    if (!isConnected || !account) {
      return;
    }

    setBidError(null);
    setBidSuccess(null);
    setIsPlacingBid(true);

    try {
      const contract = await getAuctionContractWithSigner();

      const tx = await contract.placeBid(BigInt(auction.id), {
        value: ethers.parseEther(bidAmount), // pastikan bidAmount string -> ETH
      });

      // ✅ tunggu mined
      const receipt = await tx.wait();

      setBidSuccess(`Bid placed successfully! TX Hash: ${receipt.hash}`);
      setBidAmount("");

      // optional: refresh auction state
      // const updatedAuction = await fetchAuctionData(auction.id);
      // setAuction({ ...auction, currentBid: parseFloat(updatedAuction.highestBid) });
    } catch (err: any) {
      console.error("Bid error:", err);
      setBidError(err.message || "Failed to place bid");
    } finally {
      setIsPlacingBid(false);
    }
  };

  const minBidAmount = auction.currentBid + 0.000001;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                     <img src={"/gogobit.png"} className="text-primary-foreground font-bold text-lg"></img>
              </div>
              <span className="text-xl font-bold text-foreground">GogoBid</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/auctions" className="text-primary font-medium">
                Auctions
              </Link>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Vote
              </a>
              <Link href="/submit" className="text-muted-foreground hover:text-foreground transition-colors">
                Submit Domain
              </Link>
            </div>
            <WalletConnectButton className="border-primary/20 text-primary hover:bg-primary/10 bg-transparent" />
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/auctions" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              Back to Auctions
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{auction.domain}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Domain Header */}
            <Card className="bg-card border-border/50">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <h1 className="text-4xl font-bold font-mono">{auction.domain}</h1>
                      {auction.verified && <Shield className="w-6 h-6 text-primary" />}
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(auction.status)}>{getStatusText(auction.status)}</Badge>
                      <Badge variant="secondary" className="text-xs">
                        {auction.category}
                      </Badge>
                      {/* {auction.reserveMet && (
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Reserve Met
                        </Badge>
                      )} */}
                    </div>
                    <p className="text-muted-foreground leading-relaxed max-w-2xl">{auction.description}</p>
                  </div>

                  {/* Domain Visual */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center border border-primary/10">
                      <Globe className="w-16 h-16 text-primary" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="bidding" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                <TabsTrigger value="bidding">Bidding History</TabsTrigger>
                <TabsTrigger value="domain-info">Domain Info</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="bidding" className="space-y-4">
                <Card className="bg-card border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Bid History ({auction.bidHistory.length} bids)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {auction.bidHistory.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No bids yet</p>
                    ) : (
                      auction.bidHistory.map((bid, index) => (
                        <div key={bid.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-primary">#{auction.bidHistory.length - index}</span>
                            </div>
                            <div>
                              <div className="font-mono text-sm">{bid.bidder}</div>
                              <div className="text-xs text-muted-foreground">{bid.timestamp}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-primary">{bid.amount} ETH</div>
                            <Link
                              href={`https://etherscan.io/tx/${bid.txHash}`}
                              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                              target="_blank"
                            >
                              View TX <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="domain-info" className="space-y-4">
                <Card className="bg-card border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Domain Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Registration Date</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{auction.domainInfo.registrationDate}</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{auction.domainInfo.expiryDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Registrar</label>
                          <div className="mt-1">{auction.domainInfo.registrar}</div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">WHOIS Info</label>
                          <div className="mt-1 text-sm">{auction.domainInfo.whoisInfo}</div>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">DNS Records</label>
                      <div className="space-y-2">
                        {auction.domainInfo.dnsRecords.map((record, index) => (
                          <div key={index} className="font-mono text-sm bg-muted/30 p-2 rounded border border-border/50">
                            {record}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card className="bg-card border-border/50">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Activity feed coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Auction Stats */}
            <Card className="bg-card border-border/50">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Current Bid */}
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Current Bid</div>
                    <div className="text-3xl font-bold text-primary">{auction.currentBid} ETH</div>
                    <div className="text-sm text-muted-foreground">≈ ${(auction.currentBid * 2500).toLocaleString()}</div>
                  </div>

                  <Separator />

                  {/* Time Left */}
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2 flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4" />
                      Time Remaining
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-muted/30 rounded-lg p-2">
                        <div className="text-lg font-bold">{timeLeft.days}</div>
                        <div className="text-xs text-muted-foreground">Days</div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-2">
                        <div className="text-lg font-bold">{timeLeft.hours}</div>
                        <div className="text-xs text-muted-foreground">Hours</div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-2">
                        <div className="text-lg font-bold">{timeLeft.minutes}</div>
                        <div className="text-xs text-muted-foreground">Min</div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-2">
                        <div className="text-lg font-bold">{timeLeft.seconds}</div>
                        <div className="text-xs text-muted-foreground">Sec</div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold">{auction.bidders}</div>
                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <Users className="w-3 h-3" />
                        Bidders
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{auction.totalBids}</div>
                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <Gavel className="w-3 h-3" />
                        Total Bids
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Bidding Interface */}
                  <div className="space-y-4">
                    {!isConnected ? (
                      <div className="text-center space-y-4">
                        <p className="text-sm text-muted-foreground">Connect your wallet to place bids</p>
                        <WalletConnectButton className="w-full" />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground mb-2 block">Your Bid (min: {minBidAmount} ETH)</label>
                          <Input
                            type="number"
                            placeholder={minBidAmount.toString()}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="bg-background border-border/50"
                            step="0.1"
                            min={minBidAmount}
                          />
                        </div>

                        {/* {!auction.reserveMet && (
                          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm text-yellow-400">Reserve price: {auction.reservePrice} ETH</span>
                          </div>
                        )} */}

                        {bidError && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{bidError}</AlertDescription>
                          </Alert>
                        )}

                        {bidSuccess && (
                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>{bidSuccess}</AlertDescription>
                          </Alert>
                        )}

                        <Button
                          onClick={handlePlaceBid}
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                          size="lg"
                          disabled={!bidAmount || Number.parseFloat(bidAmount) < minBidAmount || isPlacingBid}
                        >
                          {isPlacingBid ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Placing Bid...
                            </>
                          ) : (
                            "Place Bid"
                          )}
                        </Button>

                        <div className="text-xs text-muted-foreground text-center">By bidding, you agree to our terms and conditions</div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reserve Info */}
            {/* <Card className="bg-card border-border/50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Starting Bid</span>
                    <span className="text-sm font-medium">{auction.startingBid} ETH</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Reserve Price</span>
                    <span className="text-sm font-medium">{auction.reservePrice} ETH</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Reserve Status</span>
                    <Badge className={auction.reserveMet ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}>
                      {auction.reserveMet ? "Met" : "Not Met"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </div>
  );
}
