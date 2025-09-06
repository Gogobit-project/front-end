// /hooks/usePendingReturns.ts
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "@/lib/web3-context";
import { getAuctionContractWithSigner, getPendingReturns } from "@/lib/auction-contract";

export const usePendingReturns = () => {
  const { account, isConnected } = useWeb3();
  const [withdrawableAmount, setWithdrawableAmount] = useState("0.0");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawStatus, setWithdrawStatus] = useState<{ success?: string; error?: string } | null>(null);

  const fetchPendingReturnsAmount = useCallback(async () => {
    if (account && isConnected) {
      try {
        const amount = await getPendingReturns(account);
        setWithdrawableAmount(ethers.formatEther(amount));
      } catch (error) {
        console.error("Failed to fetch pending returns:", error);
        setWithdrawableAmount("0.0");
      }
    }
  }, [account, isConnected]);

  useEffect(() => {
    fetchPendingReturnsAmount();
  }, [fetchPendingReturnsAmount]);

  const handleWithdraw = async () => {
    if (parseFloat(withdrawableAmount) <= 0) return;
    setIsWithdrawing(true);
    setWithdrawStatus(null);
    try {
      const contract = await getAuctionContractWithSigner();
      const tx = await contract.withdraw();
      await tx.wait();
      setWithdrawStatus({ success: "Withdrawal successful!" });
      await fetchPendingReturnsAmount(); // Re-fetch after successful withdrawal
    } catch (err: any) {
      console.error("Withdraw error:", err);
      setWithdrawStatus({ error: err?.reason || "An error occurred during withdrawal." });
    } finally {
      setIsWithdrawing(false);
    }
  };

  return {
    withdrawableAmount,
    isWithdrawing,
    withdrawStatus,
    handleWithdraw,
  };
};
