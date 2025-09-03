import { ethers, EventLog } from "ethers";
import auctionAbi from "../app/abis/AuctionPool.json"; // pastikan ABI kontrak kamu ada di sini

// alamat kontrak auction
const AUCTION_CONTRACT = process.env.NEXT_PUBLIC_AUCTION_CONTRACT!;

export async function getBidHistory(tokenId: string) {
  if (!AUCTION_CONTRACT) throw new Error("Missing contract address");

  // provider → bisa pakai Infura, Alchemy, atau RPC publik
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

  // kontrak instance
  const contract = new ethers.Contract(AUCTION_CONTRACT, auctionAbi, provider);

  // filter event BidPlaced untuk tokenId tertentu
  const filter = contract.filters.BidPlaced(null, BigInt(tokenId));
  const events = await contract.queryFilter(filter, 0, "latest");

  // mapping hasil log
  return Promise.all(
    events.map(async (event, idx) => {
      const eventLog = event as EventLog;
      const { bidder, tokenId, amount } = eventLog.args;
      return {
        id: `${idx}-${tokenId.toString()}`,
        bidder,
        amount: ethers.formatEther(amount),
        timestamp: new Date((await eventLog.getBlock()).timestamp * 1000).toISOString(),
        txHash: eventLog.transactionHash,
      };
    })
  );
}
