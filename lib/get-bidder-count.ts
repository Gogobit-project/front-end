// lib/get-bidder-count.ts
import { ethers } from "ethers";
import AuctionABI from "../app/abis/AuctionPool.json";

const AUCTION_CONTRACT = "0xe8431e91C3911870E7b218A5336b211E53A03b4C";
const provider = new ethers.JsonRpcProvider("https://rpc-testnet.doma.xyz/");
const contract = new ethers.Contract(AUCTION_CONTRACT, AuctionABI, provider);

export async function getBidderCount(tokenId: string): Promise<number> {
  const filter = contract.filters.BidPlaced(null, tokenId);
  const logs = await contract.queryFilter(filter, 0, "latest");

  const uniqueBidders = new Set(logs.filter((log): log is ethers.EventLog => "args" in log).map((log) => log.args?.bidder?.toLowerCase() ?? ""));

  return uniqueBidders.size;
}
