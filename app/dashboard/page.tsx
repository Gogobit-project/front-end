"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { useWeb3 } from "@/lib/web3-context"
import {
  Wallet,
  TrendingUp,
  Shield,
  ExternalLink,
  MoreHorizontal,
  Copy,
  Settings,
  LogOut,
  Gavel,
  Trophy,
  Clock,
  DollarSign,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"
import Link from "next/link"

interface UserBid {
  id: string
  domain: string
  currentBid: number
  myBid: number
  status: "winning" | "outbid" | "won" | "lost"
  timeLeft: string
  auctionId: string
}

interface UserSubmission {
  id: string
  domain: string
  status: "pending" | "approved" | "rejected" | "live"
  submittedDate: string
  startingBid: number
  currentBid?: number
}

interface UserCollection {
  id: string
  domain: string
  purchasePrice: number
  purchaseDate: string
  estimatedValue: number
  status: "owned" | "listed"
}

export default function DashboardPage() {
  const { account, isConnected, balance, disconnect } = useWeb3()
  const [activeTab, setActiveTab] = useState("bids")

  // Mock user data
  const userStats = {
    totalBids: 23,
    wonAuctions: 5,
    totalSpent: 45.7,
    portfolioValue: 78.3,
  }

  const userBids: UserBid[] = [
    {
      id: "1",
      domain: "crypto.eth",
      currentBid: 12.5,
      myBid: 11.8,
      status: "outbid",
      timeLeft: "2d 14h",
      auctionId: "1",
    },
    {
      id: "2",
      domain: "defi.eth",
      currentBid: 8.2,
      myBid: 8.2,
      status: "winning",
      timeLeft: "1d 8h",
      auctionId: "2",
    },
    {
      id: "3",
      domain: "web3.eth",
      currentBid: 15.0,
      myBid: 14.5,
      status: "won",
      timeLeft: "Ended",
      auctionId: "3",
    },
  ]

  const userSubmissions: UserSubmission[] = [
    {
      id: "1",
      domain: "myproject.eth",
      status: "live",
      submittedDate: "2024-01-15",
      startingBid: 2.0,
      currentBid: 3.5,
    },
    {
      id: "2",
      domain: "innovation.eth",
      status: "pending",
      submittedDate: "2024-01-20",
      startingBid: 5.0,
    },
    {
      id: "3",
      domain: "future.eth",
      status: "approved",
      submittedDate: "2024-01-18",
      startingBid: 3.0,
    },
  ]

  const userCollection: UserCollection[] = [
    {
      id: "1",
      domain: "web3.eth",
      purchasePrice: 14.5,
      purchaseDate: "2024-01-19",
      estimatedValue: 18.2,
      status: "owned",
    },
    {
      id: "2",
      domain: "blockchain.eth",
      purchasePrice: 8.7,
      purchaseDate: "2024-01-10",
      estimatedValue: 12.1,
      status: "owned",
    },
    {
      id: "3",
      domain: "nft.eth",
      purchasePrice: 22.5,
      purchaseDate: "2024-01-05",
      estimatedValue: 28.0,
      status: "listed",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "winning":
      case "won":
      case "approved":
      case "live":
      case "owned":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "outbid":
      case "lost":
      case "rejected":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "listed":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to access your dashboard and manage your auctions.
            </p>
            <WalletConnectButton className="w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <img src={"/gogobit.png"} className="text-primary-foreground font-bold text-lg"></img>
              </div>
              <span className="text-xl font-bold text-foreground">GogoBid</span>
            </Link>
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
              {/* <Link href="/dashboard" className="text-primary font-medium">
                Dashboard
              </Link> */}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10 bg-transparent">
                  <Avatar className="w-6 h-6 mr-2">
                    <AvatarImage src="/generic-user-avatar.png" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={copyAddress}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Address
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={disconnect}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Manage your bids, submissions, and collection</p>
          </div>
          <div className="flex items-center space-x-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src="/generic-user-avatar.png" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </div>
              <div className="text-sm text-muted-foreground">{balance} ETH • Connected</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Gavel className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{userStats.totalBids}</div>
                  <div className="text-sm text-muted-foreground">Total Bids</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-2xl font-bold">{userStats.wonAuctions}</div>
                  <div className="text-sm text-muted-foreground">Won Auctions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold">{userStats.totalSpent} ETH</div>
                  <div className="text-sm text-muted-foreground">Total Spent</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{userStats.portfolioValue} ETH</div>
                  <div className="text-sm text-muted-foreground">Portfolio Value</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="bids">My Bids</TabsTrigger>
            <TabsTrigger value="submissions">My Submissions</TabsTrigger>
            <TabsTrigger value="collection">My Collection</TabsTrigger>
          </TabsList>

          <TabsContent value="bids" className="space-y-4">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle>Active Bids & History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>My Bid</TableHead>
                      <TableHead>Current Bid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time Left</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userBids.map((bid) => (
                      <TableRow key={bid.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-medium">{bid.domain}</span>
                            <Shield className="w-4 h-4 text-primary" />
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">{bid.myBid} ETH</TableCell>
                        <TableCell className="font-semibold text-primary">{bid.currentBid} ETH</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(bid.status)}>
                            {bid.status === "winning" && <Trophy className="w-3 h-3 mr-1" />}
                            {bid.status === "outbid" && <Clock className="w-3 h-3 mr-1" />}
                            {bid.status === "won" && <Trophy className="w-3 h-3 mr-1" />}
                            {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{bid.timeLeft}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/auctions/${bid.auctionId}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Auction
                                </Link>
                              </DropdownMenuItem>
                              {bid.status === "winning" || bid.status === "outbid" ? (
                                <DropdownMenuItem>
                                  <Gavel className="mr-2 h-4 w-4" />
                                  Increase Bid
                                </DropdownMenuItem>
                              ) : null}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Domain Submissions</CardTitle>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/submit">Submit New Domain</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Starting Bid</TableHead>
                      <TableHead>Current Bid</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <span className="font-mono font-medium">{submission.domain}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{submission.submittedDate}</TableCell>
                        <TableCell className="font-semibold">{submission.startingBid} ETH</TableCell>
                        <TableCell className="font-semibold text-primary">
                          {submission.currentBid ? `${submission.currentBid} ETH` : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {submission.status === "pending" && (
                                <>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Submission
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Cancel Submission
                                  </DropdownMenuItem>
                                </>
                              )}
                              {submission.status === "live" && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/auctions/${submission.id}`}>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    View Auction
                                  </Link>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collection" className="space-y-4">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle>My Domain Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>Purchase Price</TableHead>
                      <TableHead>Purchase Date</TableHead>
                      <TableHead>Estimated Value</TableHead>
                      <TableHead>P&L</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userCollection.map((item) => {
                      const pnl = item.estimatedValue - item.purchasePrice
                      const pnlPercentage = ((pnl / item.purchasePrice) * 100).toFixed(1)
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-medium">{item.domain}</span>
                              <Shield className="w-4 h-4 text-primary" />
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{item.purchasePrice} ETH</TableCell>
                          <TableCell>{item.purchaseDate}</TableCell>
                          <TableCell className="font-semibold text-primary">{item.estimatedValue} ETH</TableCell>
                          <TableCell>
                            <div className={`font-semibold ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {pnl >= 0 ? "+" : ""}
                              {pnl.toFixed(1)} ETH
                              <div className="text-xs opacity-75">({pnlPercentage}%)</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Domain
                                </DropdownMenuItem>
                                {item.status === "owned" && (
                                  <DropdownMenuItem>
                                    <Gavel className="mr-2 h-4 w-4" />
                                    List for Auction
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View on ENS
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
