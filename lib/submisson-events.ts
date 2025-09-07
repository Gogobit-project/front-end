// /lib/submission-events.ts
"use client";

import { ethers } from "ethers";
import AbiAuction from "@/app/abis/AuctionPool.json";

export async function getAllSubmissionRelatedEvents(sellerAddress: string) {
  if (typeof window.ethereum === "undefined") {
    console.error("Browser wallet tidak terdeteksi.");
    return { submittedLogs: [], startedLogs: [], endedLogs: [], bidLogs: [] };
  }

  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const contract = new ethers.Contract(process.env.NEXT_PUBLIC_AUCTION_CONTRACT!, AbiAuction, provider);

  // Siapkan semua filter event
  const submittedFilter = contract.filters.DomainSubmitted(sellerAddress);
  const startedFilter = contract.filters.AuctionStarted();
  const endedFilter = contract.filters.AuctionEnded();
  const bidFilter = contract.filters.BidPlaced();

  // Ambil semua event secara paralel untuk efisiensi
  const [submittedLogs, startedLogs, endedLogs, bidLogs] = await Promise.all([
    contract.queryFilter(submittedFilter),
    contract.queryFilter(startedFilter),
    contract.queryFilter(endedFilter),
    contract.queryFilter(bidFilter),
  ]);

  return { submittedLogs, startedLogs, endedLogs, bidLogs };
}
