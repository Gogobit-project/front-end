"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { useWeb3 } from "@/lib/web3-context";
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
  ArchiveRestore,
} from "lucide-react";
import Link from "next/link";
import { getBidsByUserFromEvents, getAuctionContractWithSigner, getPendingReturns } from "@/lib/auction-contract";
import { fetchAuctionData } from "@/lib/fetchAuctionData";
import { getAuctionDetail } from "@/lib/get-auction-detail";
import { getBidHistory } from "@/lib/get-bid-history";
import { formatTimeLeft } from "../page";

interface UserBid {
  id: string;
  domain: string;
  currentBid: number;
  myBid: number;
  status: "highest bid" | "outbid" | "won" | "lost";
  timeLeft: string;
  auctionId: string;
}

interface UserSubmission {
  id: string;
  domain: string;
  status: "pending" | "approved" | "rejected" | "live";
  submittedDate: string;
  startingBid: number;
  currentBid?: number;
}

interface UserCollection {
  id: string;
  domain: string;
  purchasePrice: number;
  purchaseDate: string;
  estimatedValue: number;
  status: "owned" | "listed";
}

export default function DashboardPage() {
  const { account, isConnected, balance, disconnect } = useWeb3();
  const [activeTab, setActiveTab] = useState("bids");

  // --- State dinamis untuk data "My Bids" ---
  const [userBids, setUserBids] = useState<UserBid[]>([]);
  const [isLoadingBids, setIsLoadingBids] = useState(true);

  const [claimingId, setClaimingId] = useState<string | null>(null); // Menyimpan ID token yang sedang diklaim
  const [claimStatus, setClaimStatus] = useState<{ success?: string; error?: string } | null>(null);

  const [withdrawableAmount, setWithdrawableAmount] = useState("0.0");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawStatus, setWithdrawStatus] = useState<{ success?: string; error?: string } | null>(null);

  const handleWithdraw = async () => {
    if (parseFloat(withdrawableAmount) <= 0) {
      alert("No funds to withdraw.");
      return;
    }

    setIsWithdrawing(true);
    setWithdrawStatus(null);

    try {
      const contract = await getAuctionContractWithSigner();
      const tx = await contract.withdraw();
      await tx.wait();

      setWithdrawStatus({ success: "Withdrawal successful! Your funds are back in your wallet." });
      // Refresh saldo setelah berhasil withdraw
      fetchPendingReturns();
    } catch (err: any) {
      console.error("Withdraw error:", err);
      setWithdrawStatus({ error: err.reason || "An error occurred during withdrawal." });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const fetchPendingReturns = async () => {
    if (account) {
      const amount = await getPendingReturns(account);
      setWithdrawableAmount(ethers.formatEther(amount));
    }
  };

  const handleClaim = async (tokenId: string) => {
    if (!isConnected || !account) {
      alert("Please connect your wallet first.");
      return;
    }

    setClaimingId(tokenId); // Mulai loading untuk baris ini
    setClaimStatus(null); // Hapus pesan status lama

    try {
      // Dapatkan kontrak dengan signer karena ini adalah transaksi 'write'
      const contract = await getAuctionContractWithSigner();

      console.log(`Attempting to call endAuction for tokenId: ${tokenId}`);

      const tx = await contract.endAuction(tokenId);

      // Tunggu hingga transaksi di-mine
      const receipt = await tx.wait();

      console.log("Claim transaction successful:", receipt);
      setClaimStatus({ success: `Domain claimed successfully! Tx: ${receipt.transactionHash.slice(0, 10)}...` });

      // PENTING: Refresh data setelah klaim berhasil agar statusnya terupdate
      // Anda bisa memanggil ulang fungsi fetch utama di sini.
      fetchAndSetUserBids(); // <-- uncomment jika Anda ingin refresh otomatis
    } catch (err: any) {
      console.error("Failed to claim domain:", err);
      // Menampilkan pesan error yang lebih mudah dibaca dari kontrak
      setClaimStatus({ error: err.reason || "An error occurred during claim." });
    } finally {
      setClaimingId(null); // Selesai loading
    }
  };

  async function fetchAndSetUserBids() {
    console.log("--- 1. Memulai fetchAndSetUserBids ---");
    setIsLoadingBids(true);
    try {
      // 1. Pindai event untuk mendapatkan daftar lelang yang diikuti pengguna
      const participatedAuctions = await getBidsByUserFromEvents(account!);
      console.log("2. Hasil dari getBidsByUserFromEvents:", participatedAuctions);
      if (participatedAuctions.length === 0) {
        console.log("3a. Tidak ada lelang yang diikuti, mengatur state menjadi kosong.");
        setUserBids([]);
        setIsLoadingBids(false);
        return;
      }

      // 2. Untuk setiap lelang, ambil detail datanya secara paralel
      const bidsDataPromises = participatedAuctions.map(async ({ tokenId }) => {
        // Ambil semua data yang dibutuhkan untuk satu baris tabel secara bersamaan
        try {
          const [onchainData, subgraphData, bidHistory] = await Promise.all([
            fetchAuctionData(tokenId),
            getAuctionDetail(tokenId), // Untuk mendapatkan nama domain
            getBidHistory(tokenId), // Untuk mencari tawaran tertinggi pengguna
          ]);

          console.log("sampe sini ngga ya");

          // Jika salah satu data gagal diambil, lewati item ini
          if (!onchainData || !subgraphData) {
            console.warn(`Skipping token ${tokenId} due to missing data.`);
            return null;
          }

          // 3. Kalkulasi data spesifik untuk tampilan
          const myHighestBid = bidHistory
            .filter((bid) => bid.bidder.toLowerCase() === account!.toLowerCase())
            .reduce((max, bid) => (parseFloat(bid.amount) > max ? parseFloat(bid.amount) : max), 0);

          let status: UserBid["status"] = "lost"; // Default status
          if (formatTimeLeft(onchainData.endTime) !== "Expired") {
            // Jika lelang masih aktif dan user adalah penawar tertinggi, statusnya "highest bid"
            status = onchainData.highestBidder.toLowerCase() === account!.toLowerCase() ? "highest bid" : "outbid";
          } else {
            // Jika lelang sudah selesai dan user adalah pemenang, statusnya "won"
            status = onchainData.highestBidder.toLowerCase() === account!.toLowerCase() ? "won" : "lost";
          }

          console.log("liat hasil fetch: ", tokenId, subgraphData.name, onchainData.highestBid, myHighestBid, status);

          // 4. Susun objek akhir yang akan di-render
          return {
            id: tokenId,
            domain: subgraphData.name, // Dari Subgraph
            currentBid: parseFloat(onchainData.highestBid), // Dari on-chain
            myBid: myHighestBid, // Dari riwayat bid
            status: status, // Hasil kalkulasi
            timeLeft: formatTimeLeft(onchainData.endTime), // Menggunakan utilitas
            auctionId: tokenId,
          };
        } catch (innerError) {
          // Jika terjadi error saat memproses SATU tokenId, catat errornya dan lanjutkan
          console.error(`Gagal memproses detail untuk tokenId ${tokenId}:`, innerError);
          return null; // Kembalikan null agar item ini bisa disaring nanti
        }
      });

      // Tunggu semua promise selesai
      const settledBidsData = await Promise.all(bidsDataPromises);
      const finalBids = settledBidsData.filter(Boolean) as UserBid[];

      console.log("3b. Data final yang akan diatur ke state:", finalBids);

      // Saring data yang null (jika ada error) dan perbarui state
      setUserBids(settledBidsData.filter(Boolean) as UserBid[]);
      console.log("4. setUserBids TELAH DIPANGGIL dengan data.");
    } catch (error) {
      console.error("Failed to fetch user bids:", error);
      setUserBids([]); // Kosongkan data jika terjadi error
    } finally {
      setIsLoadingBids(false);
    }
  }

  // --- Fungsi utama untuk mengambil dan memproses data ---
  useEffect(() => {
    // Pastikan wallet terhubung dan alamat tersedia sebelum fetch
    if (!isConnected || !account) {
      return;
    }

    fetchAndSetUserBids();
    fetchPendingReturns(); // Panggil fungsi fetch saat komponen dimuat
  }, [account, isConnected]);

  // Mock user data
  const userStats = {
    totalBids: 23,
    wonAuctions: 5,
    totalSpent: 45.7,
    portfolioValue: 78.3,
  };

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
  ];

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
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "highest bid":
      case "won":
      case "approved":
      case "live":
      case "owned":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "outbid":
      case "lost":
      case "rejected":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "listed":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">Connect your wallet to access your dashboard and manage your auctions.</p>
            <WalletConnectButton className="w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    console.log(userBids),
    (
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

            <Card className="bg-card border-border/50 col-span-2 md:col-span-1">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <ArchiveRestore className="w-5 h-5 text-blue-400" />
                      <div className="text-sm text-muted-foreground">Pending Returns</div>
                    </div>
                    <div className="text-2xl font-bold">{parseFloat(withdrawableAmount).toFixed(5)} ETH</div>
                  </div>
                  <Button
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || parseFloat(withdrawableAmount) === 0}
                    size="sm"
                    className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                  >
                    {isWithdrawing ? "Withdrawing..." : "Withdraw"}
                  </Button>
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
                      {/* --- Tampilan dinamis berdasarkan state --- */}
                      {isLoadingBids ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Loading your bids...
                          </TableCell>
                        </TableRow>
                      ) : userBids.length > 0 ? (
                        userBids.map((bid) => (
                          <TableRow key={bid.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className="font-mono font-medium">{bid.domain}</span>
                                <Shield className="w-4 h-4 text-primary" />
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">{bid.myBid.toFixed(6)} ETH</TableCell>
                            <TableCell className="font-semibold text-primary">{bid.currentBid.toFixed(6)} ETH</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(bid.status)}>
                                {/* Ikon trofi sekarang muncul untuk "highest bid" */}
                                {bid.status === "highest bid" && <Trophy className="w-3 h-3 mr-1" />}
                                {bid.status === "won" && <Trophy className="w-3 h-3 mr-1" />}
                                {bid.status === "outbid" && <Clock className="w-3 h-3 mr-1" />}
                                {/* Teks akan otomatis menjadi "Highest bid" */}
                                {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{bid.timeLeft}</TableCell>
                            <TableCell className="text-right">
                              {bid.status === "won" ? (
                                <Button
                                  onClick={() => handleClaim(bid.auctionId)}
                                  disabled={claimingId === bid.auctionId} // Nonaktifkan tombol saat sedang proses
                                  size="sm"
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  {claimingId === bid.auctionId ? "Claiming..." : "Claim"}
                                </Button>
                              ) : (
                                // Tampilkan dropdown menu untuk status lainnya
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
                                    {bid.status === "highest bid" || bid.status === "outbid" ? (
                                      <DropdownMenuItem>
                                        <Gavel className="mr-2 h-4 w-4" />
                                        Increase Bid
                                      </DropdownMenuItem>
                                    ) : null}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            You haven't placed any bids yet.
                          </TableCell>
                        </TableRow>
                      )}
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
                          <TableCell className="font-semibold text-primary">{submission.currentBid ? `${submission.currentBid} ETH` : "-"}</TableCell>
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
                        const pnl = item.estimatedValue - item.purchasePrice;
                        const pnlPercentage = ((pnl / item.purchasePrice) * 100).toFixed(1);
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
                              <Badge className={getStatusColor(item.status)}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Badge>
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
                        );
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
  );
}
