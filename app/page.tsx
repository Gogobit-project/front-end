export const revalidate = 0; // selalu fetch fresh data

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Users, Shield } from "lucide-react";
import Link from "next/link";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { getNames } from "@/lib/get-names";
import { fetchAuctionData } from "@/lib/fetchAuctionData";
import { ethers } from "ethers";

// helper untuk format sisa waktu
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

          // ✅ Skip auction yang sudah tidak aktif atau sudah lewat endTime
          if (!onchain.active || onchain.endTime.getTime() <= Date.now()) {
            return null;
          }

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
  )
    .then((arr) => arr.flat())
    .then((list) => list.filter(Boolean)); // hapus null

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <img src={"/gogobit.png"} className="text-primary-foreground font-bold text-lg"></img>
              </div>
              <span className="text-xl font-bold text-foreground">GogoBid</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/auctions" className="text-muted-foreground hover:text-foreground transition-colors">
                Auctions
              </Link>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                How it Works
              </a>
              <Link href="/submit" className="text-muted-foreground hover:text-foreground transition-colors">
                Submit Domain
              </Link>
            </div>
            <WalletConnectButton className="border-primary/20 text-primary hover:bg-primary/10 bg-transparent" />
            
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mb-4">
              Curated • Trusted • Premium
            </Badge>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Curated On-Chain
            <br />
            <span className="text-primary">Domain Auctions</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience premium NFT domain trading in a trusted, community-curated marketplace. Every domain is verified, every auction is transparent.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg">
              <Link href="/auctions">Explore Auctions</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-border text-foreground hover:bg-muted px-8 py-3 text-lg bg-transparent">
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">247</div>
              <div className="text-sm text-muted-foreground">Domains Sold</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">1,420</div>
              <div className="text-sm text-muted-foreground">ETH Volume</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">89</div>
              <div className="text-sm text-muted-foreground">Active Bidders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Verified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Auctions</h2>
            <p className="text-muted-foreground">Premium domains ending soon</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredAuctions.map((auction, index) => (
              <Card key={index} className="bg-card border-border/50 hover:border-primary/20 transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-lg font-semibold">{auction.domain}</span>
                      {auction.verified && <Shield className="w-4 h-4 text-primary" />}
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Live
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current Bid</span>
                      <span className="font-semibold text-primary">{auction.currentBid}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Time Left
                      </span>
                      <span className="font-mono text-sm">{auction.timeLeft}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Bidders
                      </span>
                      <span className="text-sm">{auction.bidders}</span>
                    </div>
                  </div>

                  <Button className="w-full mt-4 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    Place Bid
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" size="lg" className="border-primary/20 text-primary hover:bg-primary/10 bg-transparent">
              <Link href="/auctions">View All Auctions</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Curated Quality</h3>
              <p className="text-muted-foreground">Every domain is hand-picked and verified by our community of experts</p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Transparent Bidding</h3>
              <p className="text-muted-foreground">All bids are on-chain with complete transparency and immutable history</p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Trusted Community</h3>
              <p className="text-muted-foreground">Join experienced domainers and Web3 enthusiasts in premium auctions</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
