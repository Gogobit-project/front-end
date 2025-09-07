"use client";

import { useState, useEffect, useMemo } from "react";
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
import {
  Clock,
  Users,
  Shield,
  ChevronLeft,
  ExternalLink,
  Calendar,
  Globe,
  History,
  Gavel,
  AlertCircle,
  CheckCircle,
  Loader2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { getBidHistory } from "@/lib/get-bid-history";
import { getAuctionContractWithSigner } from "@/lib/auction-contract";
import Starfield from "@/components/starfield";

// ===== types =====
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
  const fmt = (d: Date) => d.toISOString().replace("T", " ").split(".")[0];
  return { registrationDate: fmt(registrationDate), expiryDate: fmt(expiryDate) };
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

  // formatters
  const usd = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }),
    []
  );

  // fetch
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
          category: "General",
          status: onchainData.active ? "live" : "ended",
          startingBid: 0,
          reservePrice: 0,
          reserveMet: false,
          totalBids: bidHistory.length,
          description:
            "Premium crypto domain perfect for DeFi projects, exchanges, or crypto-related businesses. Verified on-chain with transparent bid history.",
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

  // countdown (client-only)
  useEffect(() => {
    if (!auction?.endTime) return;
    const id = setInterval(() => {
      const diff = auction.endTime.getTime() - Date.now();
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(id);
  }, [auction]);

  if (loading) {
    return (
      <div
        className="min-h-screen grid place-items-center text-white"
        style={{
          backgroundImage: `
            radial-gradient(1200px 600px at 50% -10%, rgba(124,58,237,0.10), transparent 60%),
            radial-gradient(1200px 600px at 100% 120%, rgba(59,130,246,0.10), transparent 60%),
            linear-gradient(180deg,#120c20 0%,#17112a 50%,#120e22 100%)
          `,
        }}
      >
        Loading auction…
      </div>
    );
  }
  if (!auction) {
    return (
      <div className="min-h-screen grid place-items-center text-white bg-[#0f0b1d]">
        Auction not found
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ending-soon":
        return "bg-red-500/15 text-red-400 border-red-500/30";
      case "new":
        return "bg-blue-500/15 text-blue-300 border-blue-500/30";
      default:
        return "bg-indigo-400/15 text-indigo-300 border border-indigo-300/30";
    }
  };
  const getStatusText = (status: string) =>
    status === "ending-soon" ? "Ending Soon" : status === "new" ? "New" : "Live";

  const handlePlaceBid = async () => {
    if (!isConnected || !account) return;
    setBidError(null);
    setBidSuccess(null);
    setIsPlacingBid(true);
    try {
      const contract = await getAuctionContractWithSigner();
      const tx = await contract.placeBid(BigInt(auction.id), {
        value: ethers.parseEther(bidAmount),
      });
      const receipt = await tx.wait();
      setBidSuccess(`Bid placed successfully! TX Hash: ${receipt.hash}`);
      setBidAmount("");
    } catch (err: any) {
      setBidError(err?.message || "Failed to place bid");
    } finally {
      setIsPlacingBid(false);
    }
  };

  const minBidAmount = auction.currentBid + 0.000001;

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
      {/* Starfield */}
        <Starfield
              density={0.0014}
              speed={0.5}
              maxParallax={14}
              className="z-0"
            />
      <br />
      <br />
      {/* Navbar */}
      {/* <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
             <Link href="/" className="flex items-center gap-2">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-400/15 ring-1 ring-indigo-300/25">
                <img
                  src="/gogobit.png"
                  alt="GogoBid"
                  width={18}
                  height={18}
                />
              </div>
              <span className="text-[20px] font-semibold tracking-wide text-white">
                Gogo<span className="text-indigo-300">Bid</span>
              </span>
            </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/auctions" className="text-indigo-300 font-medium">Auctions</Link>
            <Link href="/vote" className="text-slate-300/70 hover:text-white">Vote</Link>
            <Link href="/submit" className="text-slate-300/70 hover:text-white">Submit Domain</Link>
          </div>
          <WalletConnectButton className="border border-indigo-300/40 text-indigo-200 hover:bg-indigo-400/10" />
        </div>
      </nav> */}

      {/* Breadcrumb */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/auctions" className="text-slate-300/80 hover:text-white flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              Back to Auctions
            </Link>
            <span className="text-slate-500">/</span>
            <span className="font-medium">{auction.domain}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <Card className="bg-white/[0.05] border border-white/10 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h1 className="text-4xl font-bold font-mono">{auction.domain}</h1>
                      {auction.verified && <Shield className="w-6 h-6 text-indigo-300" />}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge className={getStatusColor(auction.status)}>{getStatusText(auction.status)}</Badge>
                      <Badge variant="secondary" className="bg-white/10 text-slate-300 border-white/20 text-xs">
                        {auction.category}
                      </Badge>
                    </div>
                    <p className="text-slate-300/80 leading-relaxed max-w-2xl">{auction.description}</p>
                  </div>

                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-2xl border border-indigo-300/25 bg-[radial-gradient(70%_70%_at_50%_30%,rgba(99,102,241,0.2),transparent)] grid place-items-center">
                      <Globe className="w-16 h-16 text-indigo-300" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="bidding" className="space-y-6">
              <TabsList className="bg-white/[0.05] border border-white/10 backdrop-blur-sm">
                <TabsTrigger value="bidding">Bidding History</TabsTrigger>
                <TabsTrigger value="domain-info">Domain Info</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="bidding" className="space-y-4">
                <Card className="bg-white/[0.05] border border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Bid History ({auction.bidHistory.length} bids)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {auction.bidHistory.length === 0 ? (
                      <p className="text-slate-400 text-sm">No bids yet</p>
                    ) : (
                      auction.bidHistory.map((bid, i) => (
                        <div
                          key={bid.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-white/[0.04] border border-white/10"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-indigo-400/15 rounded-full grid place-items-center">
                              <span className="text-xs font-semibold text-indigo-300">
                                #{auction.bidHistory.length - i}
                              </span>
                            </div>
                            <div>
                              <div className="font-mono text-sm">{bid.bidder}</div>
                              <div className="text-xs text-slate-400">{bid.timestamp}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-indigo-300">{bid.amount} ETH</div>
                            <Link
                              href={`https://etherscan.io/tx/${bid.txHash}`}
                              className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1"
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
                <Card className="bg-white/[0.05] border border-white/10 backdrop-blur-sm">
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
                          <label className="text-sm text-slate-400">Registration Date</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{auction.domainInfo.registrationDate}</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-slate-400">Expiry Date</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{auction.domainInfo.expiryDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-slate-400">Registrar</label>
                          <div className="mt-1">{auction.domainInfo.registrar}</div>
                        </div>
                        <div>
                          <label className="text-sm text-slate-400">WHOIS Info</label>
                          <div className="mt-1 text-sm">{auction.domainInfo.whoisInfo}</div>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <label className="text-sm text-slate-400 mb-2 block">DNS Records</label>
                      <div className="space-y-2">
                        {auction.domainInfo.dnsRecords.map((record, idx) => (
                          <div key={idx} className="font-mono text-sm bg-white/[0.04] p-2 rounded border border-white/10">
                            {record}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card className="bg-white/[0.05] border border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-slate-400">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-60" />
                      <p>Activity feed coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right / sidebar */}
          <div className="space-y-6">
            <Card className="bg-white/[0.05] border border-white/10 backdrop-blur-sm">
              <CardContent className="p-6 space-y-6">
                {/* current bid */}
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Current Bid</div>
                  <div className="text-3xl font-bold text-indigo-300">{auction.currentBid} ETH</div>
                  <div className="text-sm text-slate-400">≈ {usd.format(auction.currentBid * 2500)}</div>
                </div>

                <Separator />

                {/* countdown */}
                <div>
                  <div className="text-sm text-slate-400 mb-2 flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" />
                    Time Remaining
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { v: timeLeft.days, l: "Days" },
                      { v: timeLeft.hours, l: "Hours" },
                      { v: timeLeft.minutes, l: "Min" },
                      { v: timeLeft.seconds, l: "Sec" },
                    ].map((b) => (
                      <div key={b.l} className="rounded-lg p-2 bg-white/[0.04] border border-white/10 text-center">
                        <div className="text-lg font-bold">{b.v}</div>
                        <div className="text-[10px] text-slate-400">{b.l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold">{auction.bidders}</div>
                    <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                      <Users className="w-3 h-3" />
                      Bidders
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{auction.totalBids}</div>
                    <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                      <Gavel className="w-3 h-3" />
                      Total Bids
                    </div>
                  </div>
                </div>

                <Separator />

                {/* bid form */}
                <div className="space-y-4">
                  {!isConnected ? (
                    <div className="text-center space-y-4">
                      <p className="text-sm text-slate-400">Connect your wallet to place bids</p>
                      <WalletConnectButton className="w-full" />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="text-sm text-slate-400 mb-2 block">
                          Your Bid (min: {minBidAmount} ETH)
                        </label>
                        <Input
                          type="number"
                          placeholder={minBidAmount.toString()}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="bg-black/30 border-white/10 text-white"
                          step="0.000001"
                          min={minBidAmount}
                        />
                      </div>

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
                        size="lg"
                        disabled={!bidAmount || Number.parseFloat(bidAmount) < minBidAmount || isPlacingBid}
                        className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:brightness-110"
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

                      <div className="text-xs text-slate-500 text-center">
                        By bidding, you agree to our terms and conditions
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
