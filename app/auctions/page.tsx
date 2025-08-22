"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { Clock, Users, Shield, Search, Filter, SlidersHorizontal } from "lucide-react"
import Link from "next/link"

interface Auction {
  id: string
  domain: string
  currentBid: number
  timeLeft: string
  timeLeftHours: number
  bidders: number
  verified: boolean
  category: string
  status: "live" | "ending-soon" | "new"
  startingBid: number
}

export default function AuctionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("ending-soon")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [priceRange, setPriceRange] = useState("all")

  // Mock auction data
  const allAuctions: Auction[] = [
    {
      id: "1",
      domain: "crypto.eth",
      currentBid: 12.5,
      timeLeft: "2d 14h",
      timeLeftHours: 62,
      bidders: 23,
      verified: true,
      category: "Finance",
      status: "live",
      startingBid: 5.0,
    },
    {
      id: "2",
      domain: "defi.eth",
      currentBid: 8.2,
      timeLeft: "1d 8h",
      timeLeftHours: 32,
      bidders: 17,
      verified: true,
      category: "Finance",
      status: "ending-soon",
      startingBid: 3.0,
    },
    {
      id: "3",
      domain: "nft.eth",
      currentBid: 15.7,
      timeLeft: "3d 2h",
      timeLeftHours: 74,
      bidders: 31,
      verified: true,
      category: "Art",
      status: "live",
      startingBid: 8.0,
    },
    {
      id: "4",
      domain: "gaming.eth",
      currentBid: 6.8,
      timeLeft: "4h 23m",
      timeLeftHours: 4,
      bidders: 12,
      verified: true,
      category: "Gaming",
      status: "ending-soon",
      startingBid: 2.5,
    },
    {
      id: "5",
      domain: "metaverse.eth",
      currentBid: 22.1,
      timeLeft: "5d 12h",
      timeLeftHours: 132,
      bidders: 45,
      verified: true,
      category: "Tech",
      status: "live",
      startingBid: 10.0,
    },
    {
      id: "6",
      domain: "dao.eth",
      currentBid: 4.3,
      timeLeft: "12h 45m",
      timeLeftHours: 12,
      bidders: 8,
      verified: true,
      category: "Governance",
      status: "ending-soon",
      startingBid: 1.5,
    },
    {
      id: "7",
      domain: "web3.eth",
      currentBid: 18.9,
      timeLeft: "6d 8h",
      timeLeftHours: 152,
      bidders: 38,
      verified: true,
      category: "Tech",
      status: "new",
      startingBid: 12.0,
    },
    {
      id: "8",
      domain: "ai.eth",
      currentBid: 35.2,
      timeLeft: "2d 6h",
      timeLeftHours: 54,
      bidders: 67,
      verified: true,
      category: "Tech",
      status: "live",
      startingBid: 20.0,
    },
  ]

  const filteredAndSortedAuctions = useMemo(() => {
    const filtered = allAuctions.filter((auction) => {
      // Search filter
      if (searchQuery && !auction.domain.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Category filter
      if (filterCategory !== "all" && auction.category !== filterCategory) {
        return false
      }

      // Status filter
      if (filterStatus !== "all" && auction.status !== filterStatus) {
        return false
      }

      // Price range filter
      if (priceRange !== "all") {
        const bid = auction.currentBid
        switch (priceRange) {
          case "under-5":
            return bid < 5
          case "5-15":
            return bid >= 5 && bid <= 15
          case "15-30":
            return bid >= 15 && bid <= 30
          case "over-30":
            return bid > 30
          default:
            return true
        }
      }

      return true
    })

    // Sort
    switch (sortBy) {
      case "ending-soon":
        return filtered.sort((a, b) => a.timeLeftHours - b.timeLeftHours)
      case "highest-bid":
        return filtered.sort((a, b) => b.currentBid - a.currentBid)
      case "lowest-bid":
        return filtered.sort((a, b) => a.currentBid - b.currentBid)
      case "most-bidders":
        return filtered.sort((a, b) => b.bidders - a.bidders)
      case "newest":
        return filtered.sort((a, b) => b.timeLeftHours - a.timeLeftHours)
      default:
        return filtered
    }
  }, [searchQuery, sortBy, filterCategory, filterStatus, priceRange, allAuctions])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ending-soon":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "new":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      default:
        return "bg-primary/10 text-primary border-primary/20"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ending-soon":
        return "Ending Soon"
      case "new":
        return "New"
      default:
        return "Live"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-bold text-foreground">GogoBid</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/auctions" className="text-primary font-medium">
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

      {/* Header */}
      <section className="py-12 px-6 border-b border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Domain Auctions</h1>
              <p className="text-muted-foreground">
                Discover and bid on premium curated domains • {filteredAndSortedAuctions.length} auctions available
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {allAuctions.filter((a) => a.status === "live").length} Live
              </Badge>
              <Badge variant="secondary" className="bg-red-500/10 text-red-400 border-red-500/20">
                {allAuctions.filter((a) => a.status === "ending-soon").length} Ending Soon
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 px-6 border-b border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search domains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border/50"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-background border-border/50">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ending-soon">Ending Soon</SelectItem>
                  <SelectItem value="highest-bid">Highest Bid</SelectItem>
                  <SelectItem value="lowest-bid">Lowest Bid</SelectItem>
                  <SelectItem value="most-bidders">Most Bidders</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[140px] bg-background border-border/50">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Tech">Tech</SelectItem>
                  <SelectItem value="Gaming">Gaming</SelectItem>
                  <SelectItem value="Art">Art</SelectItem>
                  <SelectItem value="Governance">Governance</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[120px] bg-background border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="ending-soon">Ending Soon</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-[140px] bg-background border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-5">Under 5 ETH</SelectItem>
                  <SelectItem value="5-15">5-15 ETH</SelectItem>
                  <SelectItem value="15-30">15-30 ETH</SelectItem>
                  <SelectItem value="over-30">Over 30 ETH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Auction Grid */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          {filteredAndSortedAuctions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No auctions found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedAuctions.map((auction) => (
                <Card
                  key={auction.id}
                  className="bg-card border-border/50 hover:border-primary/20 transition-all duration-300 group cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-lg font-semibold">{auction.domain}</span>
                        {auction.verified && <Shield className="w-4 h-4 text-primary" />}
                      </div>
                      <Badge className={getStatusColor(auction.status)}>{getStatusText(auction.status)}</Badge>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Current Bid</span>
                        <span className="font-semibold text-primary">{auction.currentBid} ETH</span>
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

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Category</span>
                        <Badge variant="secondary" className="text-xs">
                          {auction.category}
                        </Badge>
                      </div>
                    </div>

                    <Button className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <Link href={`/auctions/${auction.id}`} className="w-full">
                        View Auction
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
