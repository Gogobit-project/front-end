"use client";

import { ethers } from "ethers";
import AbiAuction from "@/app/abis/AuctionPool.json";

// Definisikan tipe data untuk hasil yang lebih jelas
export interface SubmissionEventLog {
  seller: string;
  tokenId: string;
  transactionHash: string;
}

/**
 * Mengambil histori event `DomainSubmitted` dari seorang pengguna
 * yang lelangnya belum dimulai.
 * @param sellerAddress Alamat wallet pengguna yang bertindak sebagai seller.
 * @returns Sebuah promise yang berisi array dari data submission yang pending.
 */
export const getSubmissionsByUser = async (sellerAddress: string): Promise<SubmissionEventLog[]> => {
  if (typeof window.ethereum === "undefined") {
    console.error("Browser wallet (seperti MetaMask) tidak terdeteksi.");
    return [];
  }

  try {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_AUCTION_CONTRACT!, AbiAuction, provider);

    // LANGKAH 1: Ambil semua event DomainSubmitted dari pengguna
    const submittedFilter = contract.filters.DomainSubmitted(sellerAddress);
    const submittedLogs = await contract.queryFilter(submittedFilter);

    // LANGKAH 2: Ambil semua event AuctionStarted yang pernah ada
    const startedFilter = contract.filters.AuctionStarted();
    const startedLogs = await contract.queryFilter(startedFilter);

    // LANGKAH 3: Buat Set dari semua tokenId yang lelangnya sudah dimulai agar pencarian lebih cepat
    const startedTokenIds = new Set(
      startedLogs
        .map((log) => {
          if ("args" in log) {
            return log.args.tokenId.toString();
          }
          return null;
        })
        .filter(Boolean) // Menghapus nilai null jika ada
    );

    // LANGKAH 4: Filter hasil `submittedLogs`
    const pendingSubmissions = submittedLogs
      .map((log) => {
        if ("args" in log) {
          const submission = {
            seller: log.args.seller,
            tokenId: log.args.tokenId.toString(),
            transactionHash: log.transactionHash,
          };

          // HANYA kembalikan submission jika tokenId-nya TIDAK ADA di dalam Set startedTokenIds
          if (!startedTokenIds.has(submission.tokenId)) {
            return submission;
          }
        }
        return null;
      })
      .filter(Boolean) as SubmissionEventLog[]; // Hapus entri null

    return pendingSubmissions;
  } catch (error) {
    console.error("Gagal mengambil event DomainSubmitted yang pending:", error);
    return [];
  }
};
