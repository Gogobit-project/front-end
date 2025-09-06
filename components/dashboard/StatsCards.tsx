"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArchiveRestore, Gavel, TrendingUp, Trophy } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalBids: number;
    wonAuctions: number;
    portfolioValue: number;
  };
  withdrawableAmount: string;
  isWithdrawing: boolean;
  onWithdraw: () => void;
}

export function StatsCards({ stats, withdrawableAmount, isWithdrawing, onWithdraw }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Gavel className="w-5 h-5 text-primary" />
            <div>
              <div className="text-2xl font-bold">{stats.totalBids}</div>
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
              <div className="text-2xl font-bold">{stats.wonAuctions}</div>
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
              onClick={onWithdraw}
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
              <div className="text-2xl font-bold">{stats.portfolioValue} ETH</div>
              <div className="text-sm text-muted-foreground">Portfolio Value</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
