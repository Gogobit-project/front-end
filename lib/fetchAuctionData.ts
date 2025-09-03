import { ethers } from "ethers";
import { auctionContract } from "./auction-contract";

export async function fetchAuctionData(tokenId: string) {
  const item = await auctionContract.auctionItems(tokenId);

  return {
    tokenId,
    highestBid: ethers.formatEther(item.highestBid),
    highestBidder: item.highestBidder,
    endTime: new Date(Number(item.endTime) * 1000),
    active: item.active,
    exists: item.exists,
  };
}
