// /app/dashboard/page.tsx
"use client";

import { useState } from "react";
// Hooks
import { useWeb3 } from "@/lib/web3-context";
import { usePendingReturns } from "@/hooks/dashboard/usePendingReturns";

// Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectWalletPrompt } from "@/components/dashboard/ConnectWalletPrompt";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { BidsTab } from "@/components/dashboard/BidsTab";
import { SubmissionsTab } from "@/components/dashboard/SubmissionsTab";
import { CollectionTab } from "@/components/dashboard/CollectionTab";
import { UserMenu } from "@/components/dashboard/UserMenu";
import Starfield from "@/components/starfield";

// Constants
import { USER_STATS } from "@/lib/constans";
import { Navbar } from "@/components/navbar";

export default function DashboardPage() {
  const { isConnected, account, balance, disconnect } = useWeb3();
  const { withdrawableAmount, isWithdrawing, handleWithdraw } = usePendingReturns();
  const [activeTab, setActiveTab] = useState("bids");

  if (!isConnected || !account) {
    return <ConnectWalletPrompt />;
  }

  return (
    <div
      className="relative min-h-screen text-white overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(1200px 600px at 50% -10%, rgba(124,58,237,0.10), transparent 60%),
          radial-gradient(1200px 600px at 100% 120%, rgba(59,130,246,0.10), transparent 60%),
          linear-gradient(180deg,#120c20 0%,#17112a 50%,#120e22 100%)
        `,
      }}
    >
      <Starfield density={0.0014} speed={0.5} maxParallax={14} className="z-0" />
      <br />
      <br />
      {/* <Navbar /> */}

      <main className="max-w-7xl mx-auto px-6 py-8">
        <DashboardHeader account={account} balance={balance!} />

        <StatsCards stats={USER_STATS} withdrawableAmount={withdrawableAmount} isWithdrawing={isWithdrawing} onWithdraw={handleWithdraw} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
            <TabsTrigger value="bids">My Bids</TabsTrigger>
            <TabsTrigger value="submissions">My Submissions</TabsTrigger>
            <TabsTrigger value="collection">My Collection</TabsTrigger>
          </TabsList>

          <TabsContent value="bids">
            <BidsTab />
          </TabsContent>
          <TabsContent value="submissions">
            <SubmissionsTab />
          </TabsContent>
          <TabsContent value="collection">
            <CollectionTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
