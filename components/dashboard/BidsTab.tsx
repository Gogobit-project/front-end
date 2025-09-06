// /components/dashboard/BidsTab.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { useUserBids } from "@/hooks/dashboard/useUserBids";
import { getAuctionContractWithSigner } from "@/lib/auction-contract";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, MoreHorizontal, Gavel, Trophy, Clock, Eye } from "lucide-react";
import { getStatusColor } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const BidsTab = () => {
  const { userBids, isLoadingBids, refetchBids } = useUserBids();
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimStatus, setClaimStatus] = useState<{ success?: string; error?: string } | null>(null);

  const handleClaim = async (tokenId: string) => {
    setClaimingId(tokenId);
    setClaimStatus(null);
    try {
      const contract = await getAuctionContractWithSigner();
      const tx = await contract.endAuction(tokenId);
      const receipt = await tx.wait();
      setClaimStatus({ success: `Domain claimed successfully! ` });
      await refetchBids();
    } catch (err: any) {
      console.error("Failed to claim domain:", err);
      setClaimStatus({ error: err?.reason || "An error occurred during claim." });
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <Card className="bg-white/[0.05] border border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Active Bids & History</CardTitle>
        {claimStatus?.success && <div className="text-green-400 text-sm mt-2">{claimStatus.success}</div>}
        {claimStatus?.error && <div className="text-red-400 text-sm mt-2">{claimStatus.error}</div>}
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>My Bid</TableHead>
              <TableHead>Current Bid</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time Left</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingBids ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading your bids...
                </TableCell>
              </TableRow>
            ) : userBids.length > 0 ? (
              userBids.map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{bid.domain}</span>
                      <Shield className="w-4 h-4 text-indigo-300" />
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{Number.isFinite(bid.myBid) ? bid.myBid.toFixed(6) : "0.000000"} ETH</TableCell>
                  <TableCell className="font-semibold text-indigo-300">
                    {Number.isFinite(bid.currentBid) ? bid.currentBid.toFixed(6) : "0.000000"} ETH
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(bid.status)}>
                      {bid.status === "winning" && <Trophy className="w-3 h-3 mr-1" />}
                      {bid.status === "outbid" && <Clock className="w-3 h-3 mr-1" />}
                      {bid.status === "won" && <Trophy className="w-3 h-3 mr-1" />}
                      {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{bid.timeLeft}</TableCell>
                  <TableCell className="text-right">
                    {bid.status === "won" ? (
                      <Button
                        onClick={() => handleClaim(bid.auctionId)}
                        disabled={claimingId === bid.auctionId}
                        size="sm"
                        className="bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30"
                      >
                        {claimingId === bid.auctionId ? "Claiming..." : "Claim"}
                      </Button>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/auctions/${bid.auctionId}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Auction
                            </Link>
                          </DropdownMenuItem>
                          {(bid.status === "winning" || bid.status === "outbid") && (
                            <DropdownMenuItem>
                              <Gavel className="mr-2 h-4 w-4" />
                              Increase Bid
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-300">
                  You haven't placed any bids yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
