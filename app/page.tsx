export const revalidate = 0;

import { getNames } from "@/lib/get-names";
import { fetchAuctionData } from "@/lib/fetchAuctionData";
import HomeAnimated from "@/components/home-animated";

function formatTimeLeft(endTime: Date) {
  const diff = endTime.getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return `${days}d ${hours}h`;
}

export default async function HomePage() {
  const names = await getNames();
  const featuredAuctions = await Promise.all(
    names.flatMap(async (nameItem: any) =>
      Promise.all(
        nameItem.tokens.map(async (token: any) => {
          const onchain = await fetchAuctionData(token.tokenId);
          if (!onchain.active || onchain.endTime.getTime() <= Date.now()) return null;
          return {
            id: token.tokenId,
            domain: nameItem.name,
            verified: nameItem.registrar?.name === "D3 Registrar",
            currentBid: `${onchain.highestBid} ETH`,
            timeLeft: formatTimeLeft(onchain.endTime),
            bidders: onchain.highestBidder !== "0x0000000000000000000000000000000000000000" ? 1 : 0,
            explorerUrl: token.explorerUrl,
          };
        })
      )
    )
  ).then((arr) => arr.flat()).then((list) => list.filter(Boolean));

  return <HomeAnimated featuredAuctions={featuredAuctions as any[]} />;
}
