"use client";
import { Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import Starfield from "@/components/starfield";

export const ConnectWalletPrompt = () => (
  <div
    className="relative min-h-screen grid place-items-center text-white overflow-hidden"
    // ... (style background dari kode asli)
  >
    <Starfield density={0.0014} baseSpeed={0.06} maxParallax={14} className="z-0" />
    <Card className="w-full max-w-md bg-white/[0.05] border border-white/10 backdrop-blur-sm">
      <CardContent className="p-8 text-center">
        <Wallet className="w-16 h-16 mx-auto mb-4 text-indigo-300/80" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-slate-300/85 mb-6">Connect your wallet to access your dashboard.</p>
        <WalletConnectButton className="w-full border border-indigo-300/40 text-indigo-200 hover:bg-indigo-400/10" />
      </CardContent>
    </Card>
  </div>
);
