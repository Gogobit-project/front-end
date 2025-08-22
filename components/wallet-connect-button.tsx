"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/lib/web3-context";
import { Wallet, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WalletConnectButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function WalletConnectButton({ variant = "outline", size = "default", className }: WalletConnectButtonProps) {
  const { account, isConnected, isConnecting, connect, error } = useWeb3();
  const [showError, setShowError] = useState(false);

  const handleConnect = async () => {
    setShowError(false);
    await connect();
    if (error) {
      setShowError(true);
    }
  };

  if (isConnected && account) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Wallet className="w-4 h-4 mr-2" />
        {account.slice(0, 6)}...{account.slice(-4)}
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button variant={variant} size={size} className={className} onClick={handleConnect} disabled={isConnecting}>
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
