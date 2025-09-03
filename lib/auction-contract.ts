import { ethers } from "ethers";
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
