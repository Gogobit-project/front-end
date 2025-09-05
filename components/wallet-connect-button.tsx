"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Wallet,
  Loader2,
  AlertCircle,
  Copy,
  Settings,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useWeb3 } from "@/lib/web3-context";
import router from "next/router";
import Link from "next/link";

interface WalletConnectButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

function truncate(addr?: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function WalletConnectButton({
  variant = "outline",
  size = "default",
  className,
}: WalletConnectButtonProps) {
  const { account, isConnected, isConnecting, connect, disconnect, error } =
    useWeb3();
  const [showError, setShowError] = useState(false);

  const handleConnect = async () => {
    setShowError(false);
    await connect();
    if (error) setShowError(true);
  };

  const copyAddress = async () => {
    if (!account) return;
    try {
      await navigator.clipboard.writeText(account);
      // optional: toast sukses
    } catch {}
  };

  // ✅ Jika sudah connect → tampilkan avatar + dropdown
  if (isConnected && account) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={
              className ??
              "border-primary/20 text-primary hover:bg-primary/10 bg-transparent"
            }
          >
            <Avatar className="w-6 h-6 mr-2">
              <AvatarImage src="/generic-user-avatar.png" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            {truncate(account)}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyAddress}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="flex items-center">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
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
    );
  }

  // 🔌 Belum connect → tombol connect
  return (
    <div className="space-y-2">
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleConnect}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </>
        )}
      </Button>

      {showError && error && (
        <Alert variant="destructive" className="max-w-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
