import { ethers, BigNumberish } from "ethers";
import AuctionABI from "../app/abis/AuctionPool.json";

const AUCTION_CONTRACT = "0xe8431e91C3911870E7b218A5336b211E53A03b4C";

// Provider publik (server side, read-only)
const provider = new ethers.JsonRpcProvider("https://rpc-testnet.doma.xyz/");

// Kontrak read-only (untuk query)
export const auctionContract = new ethers.Contract(AUCTION_CONTRACT, AuctionABI, provider);

// Kontrak dengan signer (untuk transaksi write seperti placeBid)
export async function getAuctionContractWithSigner() {
  const { ethereum } = window as any;
  if (!ethereum) throw new Error("Wallet not found");

  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(AUCTION_CONTRACT, AuctionABI, signer);
}

export function getAuctionContract(signer: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(AUCTION_CONTRACT, AuctionABI, signer);
}

export async function getBidsByUserFromEvents(userAddress: string): Promise<{ tokenId: string }[]> {
  try {
    // 1. Buat filter untuk event BidPlaced.
    // `userAddress` adalah argumen pertama yang diindeks (bidder), jadi kita bisa memfilter berdasarkan itu.
    const bidFilter = auctionContract.filters.BidPlaced(userAddress);

    // 2. Pindai blockchain dari blok pertama ('genesis') hingga terbaru ('latest') untuk semua event yang cocok.
    // Ini adalah panggilan RPC yang mungkin intensif jika riwayatnya sangat panjang.
    const pastBids = await auctionContract.queryFilter(bidFilter, 0, "latest");

    // 3. Gunakan Set untuk memastikan setiap tokenId hanya muncul sekali.
    // Pengguna bisa menawar berkali-kali di lelang yang sama.
    const uniqueTokenIdSet = new Set<string>();
    pastBids.forEach((event) => {
      if ("args" in event && event.args) {
        const eventArgs = event.args as unknown as { tokenId: ethers.BigNumberish };
        if (eventArgs.tokenId) {
          uniqueTokenIdSet.add(eventArgs.tokenId.toString());
        }
      }
    });

    // 4. Ubah Set kembali ke format array yang diharapkan oleh komponen UI.
    return Array.from(uniqueTokenIdSet).map((tokenId) => ({ tokenId }));
  } catch (error) {
    console.error("Error fetching bid events by user:", error);
    // Kembalikan array kosong jika terjadi kesalahan (misalnya, RPC node timeout)
    // agar aplikasi tidak crash.
    return [];
  }
}

export async function getPendingReturns(userAddress: string): Promise<BigNumberish> {
  try {
    // Panggil mapping 'pendingReturns' publik dari kontrak
    const pendingAmount = await auctionContract.pendingReturns(userAddress);
    return pendingAmount;
  } catch (error) {
    console.error("Failed to get pending returns:", error);
    return ethers.parseEther("0"); // Kembalikan 0 jika terjadi error
  }
}
