"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  account: string | null;
  balance: string | number;
}

export function DashboardHeader({ account, balance }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-slate-300/85">Manage your bids, submissions, and collection</p>
      </div>
      <div className="flex items-center gap-4">
        <Avatar className="w-12 h-12 ring-1 ring-white/10">
          <AvatarImage src="/generic-user-avatar.png" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </div>
          <div className="text-sm text-slate-300/75">{balance} ETH • Connected</div>
        </div>
      </div>
    </div>
  );
}
