import { ethers, EventLog } from "ethers";
import auctionAbi from "../app/abis/AuctionPool.json";

const AUCTION_CONTRACT = process.env.NEXT_PUBLIC_AUCTION_CONTRACT!;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;

type AuctionStartedRow = {
  id: string;
  tokenId: string;
  endTimeUnix: number;
  endTimeISO: string;
  blockNumber: number;
  timestampISO: string | null;
  txHash: string;
};

/**
 * Ambil SEMUA event AuctionStarted dalam rentang blok, lalu filter hanya tokenIds yang kamu minta.
 * Cocok kalau tokenIds banyak tapi rentang blok masih wajar.
 */
export async function getAuctionStarted(
  tokenIds: Array<string | bigint>,
  fromBlock: number | bigint = 0,
  toBlock: number | "latest" = "latest"
): Promise<Record<string, AuctionStartedRow[]>> {
  if (!AUCTION_CONTRACT) throw new Error("Missing contract address");
  if (!RPC_URL) throw new Error("Missing RPC URL");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(AUCTION_CONTRACT, auctionAbi, provider);

  // Query semua AuctionStarted (tanpa filter argumen)
  const filter = contract.filters.AuctionStarted();
  const logs = await contract.queryFilter(filter, fromBlock, toBlock);

  const wanted = new Set(tokenIds.map((id) => id.toString()));
  const grouped: Record<string, AuctionStartedRow[]> = {};

  for (const log of logs) {
    const ev = log as EventLog;
    const { tokenId, endTime } = ev.args as unknown as {
      tokenId: bigint;
      endTime: bigint;
    };

    const idStr = tokenId.toString();
    if (!wanted.has(idStr)) continue;

    const block = await provider.getBlock(ev.blockNumber);

    const row: AuctionStartedRow = {
      id: `${ev.transactionHash}-${ev.index}`,
      tokenId: idStr,
      endTimeUnix: Number(endTime),
      endTimeISO: new Date(Number(endTime) * 1000).toISOString(),
      blockNumber: ev.blockNumber,
      timestampISO: block ? new Date(block.timestamp * 1000).toISOString() : null,
      txHash: ev.transactionHash,
    };

    (grouped[idStr] ??= []).push(row);
  }

  return grouped;
}

/**
 * Cek cepat apakah tiap tokenId SUDAH memiliki AuctionStarted dalam rentang blok.
 * Return: Map tokenId -> boolean
 */
export async function hasAuctionStartedForTokenIds(
  tokenIds: Array<string | bigint>,
  fromBlock: number | bigint = 0,
  toBlock: number | "latest" = "latest"
): Promise<Map<string, boolean>> {
  const grouped = await getAuctionStarted(tokenIds, fromBlock, toBlock);
  const result = new Map<string, boolean>();
  for (const id of tokenIds) {
    result.set(id.toString(), (grouped[id.toString()]?.length ?? 0) > 0);
  }
  return result;
}
