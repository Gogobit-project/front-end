// /hooks/useUserSubmissions.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers, EventLog } from "ethers";
import { useWeb3 } from "@/lib/web3-context";
import { UserSubmission } from "@/lib/types";
import { getAllSubmissionRelatedEvents } from "@/lib/submisson-events";
import { getDomainNameByTokenId } from "@/lib/subgraphDashboard";
import { MOCK_USER_SUBMISSIONS } from "@/lib/constans";

export const useUserSubmissions = () => {
  const { account } = useWeb3();
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    if (!account) return;
    setIsLoading(true);

    try {
      // 1. Ambil semua data event yang relevan dalam satu panggilan
      const { submittedLogs, startedLogs, endedLogs, bidLogs } = await getAllSubmissionRelatedEvents(account);

      if (submittedLogs.length === 0) {
        setSubmissions([]);
        return;
      }

      // 2. Proses data event untuk lookups yang cepat
      const startedMap = new Map(startedLogs.map((log) => [(log as EventLog).args.tokenId.toString(), log as EventLog]));
      const endedSet = new Set(endedLogs.map((log) => (log as EventLog).args.tokenId.toString()));

      const highestBids = new Map<string, ethers.BigNumberish>();
      bidLogs.forEach((log) => {
        const tokenId = (log as EventLog).args.tokenId.toString();
        const currentHighest = highestBids.get(tokenId) || 0;
        if ((log as EventLog).args.amount > currentHighest) {
          highestBids.set(tokenId, (log as EventLog).args.amount);
        }
      });

      // 3. Gabungkan semua informasi untuk setiap domain yang disubmit
      const finalSubmissions = await Promise.all(
        submittedLogs.map(async (log) => {
          const tokenId = (log as EventLog).args.tokenId.toString();

          // Tentukan Status
          let status: UserSubmission["status"];
          if (endedSet.has(tokenId)) {
            status = "Ended";
          } else if (startedMap.has(tokenId)) {
            status = "Live";
          } else {
            status = "Pending";
          }

          // Dapatkan Tanggal Submit dari timestamp blok
          const block = await log.getBlock();
          const submittedDate = new Date(block.timestamp * 1000).toLocaleDateString("id-ID");

          // Dapatkan Current Bid
          const currentBidWei = highestBids.get(tokenId) || "0";
          const currentBid = ethers.formatEther(currentBidWei);

          // Dapatkan Nama Domain dari Subgraph
          const domainName = await getDomainNameByTokenId(tokenId);

          return {
            id: tokenId,
            domain: domainName || `Unknown Domain #${tokenId.slice(0, 5)}`,
            status: status,
            submittedDate: submittedDate,
            currentBid: `${parseFloat(currentBid).toFixed(4)} ETH`,
          };
        })
      );

      setSubmissions(finalSubmissions);
    } catch (error) {
      console.error("Gagal memuat data submissions:", error);
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return { submissions, isLoading };
};
