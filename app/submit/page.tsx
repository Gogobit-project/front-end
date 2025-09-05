"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { useWeb3 } from "@/lib/web3-context";
import {
  Globe,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
  DollarSign,
  Clock,
  Gavel,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { ethers } from "ethers";
import { getAuctionContract, getAuctionContractWithSigner } from "@/lib/auction-contract";
import { getUserDomains } from "@/lib/get-user-domain";
import { getDomaContract } from "@/lib/doma-contract";
import Starfield from "@/components/starfield";

export default function SubmitDomainPage() {
  const { account, isConnected } = useWeb3();
  const [userDomains, setUserDomains] = useState<{ name: string; tokenId: string }[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(false);

  const [formData, setFormData] = useState({
    tokenId: "",
    category: "",
    startingBid: "",
    reservePrice: "",
    auctionDuration: "3", // days
    description: "",
    agreeToTerms: false,
    agreeToFees: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const submissionFee = 0.05; // ETH
  const platformFee = 2.5; // %

  // load owned domains
  useEffect(() => {
    if (!account) return;
    (async () => {
      setLoadingDomains(true);
      try {
        const result = await getUserDomains(account);
        setUserDomains(
          result.map((d: any) => ({
            name: d.name,
            tokenId: d.tokens?.[0]?.tokenId,
          }))
        );
      } catch (err) {
        console.error("Error fetching domains", err);
      } finally {
        setLoadingDomains(false);
      }
    })();
  }, [account]);

  const isFormValid =
    !!formData.tokenId &&
    !!formData.category &&
    !!formData.startingBid &&
    formData.agreeToTerms &&
    formData.agreeToFees;

  // submit tx flow
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !account || !isFormValid) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const doma = getDomaContract(signer);
      const auction = getAuctionContract(signer);

      const tokenId = BigInt(formData.tokenId);

      // 1) approve NFT to AuctionPool
      const tx1 = await doma.approve(auction.target.toString(), tokenId);
      await tx1.wait();

      // 2) submit domain (di kontrak kamu cukup tokenId)
      const tx2 = await auction.submitDomain(
        tokenId
        // { value: ethers.parseEther(submissionFee.toString()) }
      );
      await tx2.wait();

      setSubmitSuccess(true);
    } catch (err: any) {
      console.error("Submit failed:", err);
      setSubmitError(err?.message || "Transaction failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div
        className="relative min-h-screen text-white"
        style={{
          backgroundImage: `
            radial-gradient(1200px 600px at 50% -10%, rgba(124,58,237,0.10), transparent 60%),
            radial-gradient(1200px 600px at 100% 120%, rgba(59,130,246,0.10), transparent 60%),
            linear-gradient(180deg,#120c20 0%,#17112a 50%,#120e22 100%)
          `,
        }}
      >
       <Starfield
             density={0.0014}
             baseSpeed={0.06}
             maxParallax={14}
             className="z-0"
           />

        <nav className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg grid place-items-center bg-gradient-to-br from-indigo-500 to-violet-500 ring-1 ring-indigo-300/30">
                <img src="/gogobit.png" className="h-5" />
              </div>
              <span className="text-xl font-bold">
                Gogo<span className="text-indigo-300">Bid</span>
              </span>
            </Link>
            <WalletConnectButton className="border border-indigo-300/40 text-indigo-200 hover:bg-indigo-400/10" />
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full grid place-items-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Submission Successful!</h1>
          <p className="text-slate-300/85 mb-8 leading-relaxed">
            Your domain has been submitted for review. Our curation team will review your submission within 24–48 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:brightness-110">
              <Link href="/dashboard">View My Submissions</Link>
            </Button>
            <Button variant="outline" asChild className="border-white/20 bg-transparent hover:bg-white/10">
              <Link href="/auctions">Browse Auctions</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
       <Starfield
             density={0.0014}
             baseSpeed={0.06}
             maxParallax={14}
             className="z-0"
           />

      {/* NAV */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/30 backdrop-blur-xl">
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
            <Link href="/auctions" className="text-indigo-300 font-medium">
              Auctions
            </Link>
            <Link href="/vote" className="text-slate-300/70 hover:text-white">
              Vote
            </Link>
            <span className="text-white">Submit Domain</span>
          </div>
          <WalletConnectButton className="border border-indigo-300/40 text-indigo-200 hover:bg-indigo-400/10" />
        </div>
      </nav>

      {/* BREADCRUMB */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-slate-300/80 hover:text-white flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              Home
            </Link>
            <span className="text-slate-500">/</span>
            <span className="font-medium">Submit Domain</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Submit Your Domain</h1>
          <p className="text-slate-300/85 text-lg leading-relaxed max-w-2xl mx-auto">
            Submit your premium domain for curation and auction on GogoBid. Our expert team reviews each submission to
            ensure quality and authenticity.
          </p>
        </div>

        {!isConnected ? (
          <Card className="max-w-md mx-auto bg-white/[0.05] border border-white/10 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Globe className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
              <p className="text-slate-300/80 mb-6">
                Connect your wallet to verify domain ownership and submit for auction.
              </p>
              <WalletConnectButton className="w-full" />
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* MAIN FORM */}
              <div className="lg:col-span-2 space-y-6">
                {/* Domain Info */}
                <Card className="bg-white/[0.05] border border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Domain Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Domain *</Label>
                      {loadingDomains ? (
                        <p className="text-sm text-slate-400">Loading domains...</p>
                      ) : userDomains.length === 0 ? (
                        <Alert className="bg-white/[0.04] border-white/10">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>No domains found for this wallet</AlertDescription>
                        </Alert>
                      ) : (
                        <Select
                          value={formData.tokenId}
                          onValueChange={(val) => setFormData((s) => ({ ...s, tokenId: val }))}
                        >
                          <SelectTrigger className="bg-black/30 border-white/10 text-white">
                            <SelectValue placeholder="Select your domain" />
                          </SelectTrigger>
                          <SelectContent>
                            {userDomains.map((d) => (
                              <SelectItem key={d.tokenId} value={String(d.tokenId)}>
                                {d.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData((s) => ({ ...s, category: value }))}
                      >
                        <SelectTrigger className="bg-black/30 border-white/10 text-white">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="finance">Finance & DeFi</SelectItem>
                          <SelectItem value="tech">Technology</SelectItem>
                          <SelectItem value="gaming">Gaming & Metaverse</SelectItem>
                          <SelectItem value="art">Art & NFTs</SelectItem>
                          <SelectItem value="governance">Governance & DAOs</SelectItem>
                          <SelectItem value="brand">Brand & Marketing</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Description *</Label>
                      <Textarea
                        placeholder="Describe your domain, its potential use cases, and why it would be valuable to bidders..."
                        value={formData.description}
                        onChange={(e) => setFormData((s) => ({ ...s, description: e.target.value }))}
                        className="bg-black/30 border-white/10 min-h-[120px] text-white placeholder:text-slate-500"
                      />
                      <p className="text-xs text-slate-400">
                        Minimum 50 characters. Be specific about the domain's value proposition.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Auction Params */}
                <Card className="bg-white/[0.05] border border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gavel className="w-5 h-5" />
                      Auction Parameters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Starting Bid (ETH) *</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          placeholder="1.0"
                          value={formData.startingBid}
                          onChange={(e) => setFormData((s) => ({ ...s, startingBid: e.target.value }))}
                          className="bg-black/30 border-white/10 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Reserve Price (ETH)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="Optional"
                          value={formData.reservePrice}
                          onChange={(e) => setFormData((s) => ({ ...s, reservePrice: e.target.value }))}
                          className="bg-black/30 border-white/10 text-white placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Auction Duration</Label>
                      <Select
                        value={formData.auctionDuration}
                        onValueChange={(value) => setFormData((s) => ({ ...s, auctionDuration: value }))}
                      >
                        <SelectTrigger className="bg-black/30 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Day</SelectItem>
                          <SelectItem value="3">3 Days (Recommended)</SelectItem>
                          <SelectItem value="7">7 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Alert className="bg-white/[0.04] border-white/10">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Reserve price is the minimum amount you're willing to accept. If not met, the auction will not
                        complete and the domain remains with you.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* Terms */}
                <Card className="bg-white/[0.05] border border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Terms & Conditions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) =>
                          setFormData((s) => ({ ...s, agreeToTerms: checked as boolean }))
                        }
                      />
                      <Label htmlFor="agreeToTerms" className="text-sm font-normal cursor-pointer">
                        I agree to the{" "}
                        <Link href="#" className="text-indigo-300 hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and confirm that I own this domain and have the right to auction it.
                      </Label>
                    </div>

                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="agreeToFees"
                        checked={formData.agreeToFees}
                        onCheckedChange={(checked) =>
                          setFormData((s) => ({ ...s, agreeToFees: checked as boolean }))
                        }
                      />
                      <Label htmlFor="agreeToFees" className="text-sm font-normal cursor-pointer">
                        I understand and agree to pay the submission fee ({submissionFee} ETH) and platform fee (
                        {platformFee}% of final sale price).
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* SIDEBAR */}
              <div className="space-y-6">
                {/* Fees */}
                <Card className="bg-white/[0.05] border border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Fee Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Submission Fee</span>
                        <span className="font-semibold">{submissionFee} ETH</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Platform Fee</span>
                        <span className="font-semibold">{platformFee}% of sale</span>
                      </div>
                      <Separator className="bg-white/10" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Due Now</span>
                        <span className="font-semibold text-indigo-300">{submissionFee} ETH</span>
                      </div>
                    </div>

                    <Alert className="bg-white/[0.04] border-white/10">
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Submission fee is non-refundable and covers curation costs. Platform fee is only charged on
                        successful sales.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card className="bg-white/[0.05] border border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Process Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { title: "Submit Domain", sub: "Pay submission fee", active: true },
                      { title: "Curation Review", sub: "24–48 hours" },
                      { title: "Auction Goes Live", sub: "If approved" },
                      { title: "Auction Ends", sub: "Transfer & payment" },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${s.active ? "bg-indigo-400" : "bg-white/30"}`} />
                        <div>
                          <div className="text-sm font-medium">{s.title}</div>
                          <div className="text-xs text-slate-400">{s.sub}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Submit */}
                <Card className="bg-white/[0.05] border border-white/10 backdrop-blur-sm">
                  <CardContent className="p-4">
                    {submitError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{submitError}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:brightness-110"
                      size="lg"
                      disabled={!isFormValid || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Domain
                          <Badge className="ml-2 bg-white/20 text-white">{submissionFee} ETH</Badge>
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-slate-500 text-center mt-2">
                      By submitting, you agree to transfer domain ownership upon successful auction completion.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
