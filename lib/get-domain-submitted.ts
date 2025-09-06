import { ethers, EventLog } from "ethers";
import AuctionPoolABI from "../app/abis/AuctionPool.json"; // ABI kontrak kamu

const CONTRACT_ADDRESS = "0xe8431e91C3911870E7b218A5336b211E53A03b4C"; // alamat kontrak di testnet

export async function getSubmittedDomains() {
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, AuctionPoolABI, provider);

  const events = await contract.queryFilter("DomainSubmitted", 0, "latest");

  return events
    .filter((e): e is EventLog => (e as EventLog).args !== undefined)
    .map((e) => ({
      seller: e.args.seller,
      tokenId: e.args.tokenId.toString(),
      blockNumber: e.blockNumber,
      txHash: e.transactionHash,
    }));
}
