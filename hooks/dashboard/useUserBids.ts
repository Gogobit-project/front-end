import { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "@/lib/web3-context";
import { UserBid, BidStatusUI } from "@/lib/types";
// Import semua fungsi on-chain Anda
import { getBidsByUserFromEvents } from "@/lib/auction-contract";
import { fetchAuctionData } from "@/lib/fetchAuctionData";
import { getAuctionDetail } from "@/lib/get-auction-detail";
import { getBidHistory } from "@/lib/get-bid-history";
import { formatTimeLeft } from "@/lib/utils";

const mapLogicStatusToUI = (s: "highest bid" | "outbid" | "won" | "lost"): BidStatusUI => (s === "highest bid" ? "winning" : s);

export const useUserBids = () => {
  const { account, isConnected } = useWeb3();
  const [userBids, setUserBids] = useState<UserBid[]>([]);
  const [isLoadingBids, setIsLoadingBids] = useState(true);

  const fetchAndSetUserBids = useCallback(async () => {
    if (!account || !isConnected) return;

    setIsLoadingBids(true);
    try {
      const participatedAuctions = await getBidsByUserFromEvents(account);
      if (participatedAuctions.length === 0) {
        setUserBids([]);
        return;
      }

      const rows = await Promise.all(
        participatedAuctions.map(async ({ tokenId }: { tokenId: string }) => {
          try {
            const [onchainData, subgraphData, bidHistory] = await Promise.all([fetchAuctionData(tokenId), getAuctionDetail(tokenId), getBidHistory(tokenId)]);

            if (!onchainData || !subgraphData) return null;

            const myHighestBid = bidHistory
              .filter((b: any) => b.bidder.toLowerCase() === account!.toLowerCase())
              .reduce((max: number, b: any) => {
                const amt = parseFloat(b.amount);
                return amt > max ? amt : max;
              }, 0);

            let logicStatus: "highest bid" | "outbid" | "won" | "lost" = "lost";
            if (formatTimeLeft(onchainData.endTime) !== "Expired") {
              logicStatus = onchainData.highestBidder.toLowerCase() === account!.toLowerCase() ? "highest bid" : "outbid";
            } else {
              logicStatus = onchainData.highestBidder.toLowerCase() === account!.toLowerCase() ? "won" : "lost";
            }

            const statusUI = mapLogicStatusToUI(logicStatus);

            return {
              id: tokenId,
              domain: subgraphData.name,
              currentBid: parseFloat(onchainData.highestBid),
              myBid: myHighestBid,
              status: statusUI,
              timeLeft: formatTimeLeft(onchainData.endTime),
              auctionId: tokenId,
            } as UserBid;
          } catch (e) {
            console.error(`Failed to build row for tokenId ${tokenId}:`, e);
            return null;
          }
        })
      );

      setUserBids(rows.filter(Boolean) as UserBid[]);
    } catch (e) {
      console.error("Failed to fetch user bids:", e);
      setUserBids([]);
    } finally {
      setIsLoadingBids(false);
    }
  }, [account, isConnected]);

  useEffect(() => {
    fetchAndSetUserBids();
  }, [fetchAndSetUserBids]);

  return { userBids, isLoadingBids, refetchBids: fetchAndSetUserBids };
};
