"use client";

import { useState } from "react";
import { ethers } from "ethers";
import auctionAbi from "../abis/AuctionPool.json";

const AUCTION_CONTRACT = process.env.NEXT_PUBLIC_AUCTION_CONTRACT!;
const RPC_CHAIN_ID_HEX = process.env.NEXT_PUBLIC_DOMA_CHAIN_ID_DEC; // FIX

type TxState = { loading: boolean; hash?: string; error?: string };

export function useApproveAndStartAuction() {
  const [tx, setTx] = useState<TxState>({ loading: false });

  const submit = async (tokenId: string) => {
    try {
      setTx({ loading: true });

      if (!AUCTION_CONTRACT) throw new Error("Missing contract address");
      if (!(window as any).ethereum) throw new Error("Wallet not found");

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      // pastikan chain benar
      const net = await provider.getNetwork();
      const want = BigInt(RPC_CHAIN_ID_HEX);
      if (net.chainId !== want) {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: RPC_CHAIN_ID_HEX }],
        });
      }

      const contract = new ethers.Contract(AUCTION_CONTRACT, auctionAbi, signer);
      const id = BigInt(tokenId); // FIX: pakai BigInt untuk uint256

      // ---------- Preflight checks (biar tahu alasan revert) ----------
      // 1) onlyOwner?
      try {
        if (typeof contract.owner === "function") {
          const owner: string = await contract.owner();
          const me = (await signer.getAddress()).toLowerCase();
          if (owner.toLowerCase() !== me) {
            throw new Error("onlyOwner: wallet bukan pemilik kontrak");
          }
        }
      } catch {
        // kalau ga ada owner(), lewati
      }

      // 2) item.exists & item.active?
      try {
        // kalau 'auctionItems' adalah mapping public, getter otomatis tersedia
        if (typeof contract.auctionItems === "function") {
          const item = await contract.auctionItems(id);
          // Sesuaikan index/field struct-mu:
          // contoh umum: [tokenId, endTime, active, exists] -> boolean di index 2/3
          const active = (item.active ?? item[2]) as boolean;
          const exists = (item.exists ?? item[3]) as boolean;
          if (!exists) throw new Error("Domain not submitted (item.exists = false)");
          if (active) throw new Error("Auction already active (item.active = true)");
        }
      } catch {
        // kalau tidak ada getter, skip
      }

      // 3) static call untuk decode custom error kalau bakal revert
      try {
        // ethers v6: gunakan .staticCall
        await contract.approveAndStartAuction.staticCall(id);
      } catch (e: any) {
        // coba decode custom error biar jelas
        const data = e?.data ?? e?.error?.data;
        if (data) {
          try {
            const parsed = contract.interface.parseError(data);
            throw new Error(`Reverted: ${parsed.name}(${parsed.args?.map(String).join(", ")})`);
          } catch {
            // tidak bisa decode → tetap lempar generic
          }
        }
        throw e;
      }
      // ---------------------------------------------------------------

      // Estimasi gas (setelah lolos staticCall, harusnya aman)
      const overrides: Record<string, bigint> = {};
      try {
        const g: bigint = await contract.approveAndStartAuction.estimateGas(id);
        overrides.gasLimit = (g * BigInt(11)) / BigInt(10); // +10%
      } catch (e) {
        // kalau masih gagal, beri pesan yang jelas
        throw new Error("Gas estimation failed. Cek onlyOwner / exists / active / chain.");
      }

      const txResp = await contract.approveAndStartAuction(id, overrides);
      setTx({ loading: true, hash: txResp.hash });

      const receipt = await txResp.wait();
      setTx({ loading: false, hash: receipt?.hash });
    } catch (err: any) {
      const msg =
        err?.reason ||
        err?.shortMessage ||
        err?.message ||
        "Failed to submit transaction";
      console.error("approveAndStartAuction error:", err);
      setTx({ loading: false, error: msg });
    }
  };

  return { submit, tx };
}
