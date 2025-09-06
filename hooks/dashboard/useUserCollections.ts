// /hooks/useUserCollection.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "@/lib/web3-context";
import { UserCollection } from "@/lib/types";
import { getDomainUserSubgraph, getDomainNameByTokenId } from "@/lib/subgraphDashboard";
import { getSubmissionsByUser } from "@/lib/get-bid-submissions";

export const useUserCollection = () => {
  const { account } = useWeb3();
  const [collection, setCollection] = useState<UserCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCollection = useCallback(async () => {
    if (!account) return;

    setIsLoading(true);
    try {
      // Menjalankan kedua proses pengambilan data secara paralel untuk efisiensi
      const [ownedItemsResult, submittedEventsResult] = await Promise.all([
        getDomainUserSubgraph(account), // Proses 1: Ambil domain yang dimiliki
        getSubmissionsByUser(account), // Proses 2: Ambil event domain yang disubmit
      ]);

      console.log("submittedEventsResult", submittedEventsResult);

      // --- Memproses hasil dari data 'owned' ---
      const formattedOwned: UserCollection[] = ownedItemsResult.map((item) => ({
        id: item.tokens[0].tokenId,
        domain: item.name,
        // Placeholder, bisa Anda sesuaikan nanti
        purchasePrice: 14.5,
        purchaseDate: "2024-01-19",
        estimatedValue: 18.2,
        status: "owned",
      }));

      // --- Memproses hasil dari data 'listed' (membutuhkan query tambahan) ---
      let formattedListed: UserCollection[] = [];
      if (submittedEventsResult.length > 0) {
        formattedListed = await Promise.all(
          submittedEventsResult.map(async (event) => {
            const domainName = await getDomainNameByTokenId(event.tokenId);
            return {
              id: event.tokenId,
              domain: domainName || `Unknown #${event.tokenId.slice(0, 5)}`,
              // Untuk item yang 'listed', data harga belum ada
              purchasePrice: 0,
              purchaseDate: "N/A",
              estimatedValue: 0,
              status: "listed",
            };
          })
        );
      }

      // --- Menggabungkan kedua hasil menjadi satu array ---
      const combinedCollection = [...formattedOwned, ...formattedListed];
      setCollection(combinedCollection);
    } catch (error) {
      console.error("Gagal mengambil data koleksi gabungan:", error);
      setCollection([]);
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  return { collection, isLoading };
};
