"use client";

import { useState } from "react";
import { ethers } from "ethers";
import auctionAbi from "../abis/AuctionPool.json";

const AUCTION_CONTRACT = process.env.NEXT_PUBLIC_AUCTION_CONTRACT!;
const CHAIN_ID_DEC = Number(process.env.NEXT_PUBLIC_DOMA_CHAIN_ID_DEC); // 97476
const CHAIN_ID_HEX = process.env.NEXT_PUBLIC_DOMA_CHAIN_ID_HEX!;       // "0x17cc4"
const RPC_URL      = process.env.NEXT_PUBLIC_RPC_URL!;
const CHAIN_NAME   = "Doma Testnet"; // sesuaikan
const NATIVE       = { name: "Test ETH", symbol: "tETH", decimals: 18 }; // sesuaikan

type TxState = { loading: boolean; hash?: string; error?: string };

export function useApproveAndStartAuction() {
  const [tx, setTx] = useState<TxState>({ loading: false });

  const submit = async (tokenId: string) => {
    try {
      setTx({ loading: true });

      if (!AUCTION_CONTRACT) throw new Error("Missing contract address");
      if (!(window as any).ethereum) throw new Error("Wallet not found");

      // --- init provider & minta akun
      let provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send("eth_requestAccounts", []);
      let net = await provider.getNetwork();

      // --- pastikan chain benar
      if (Number(net.chainId) !== CHAIN_ID_DEC) {
        try {
          await (window as any).ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: CHAIN_ID_HEX }],
          });
        } catch (e: any) {
          // 4902 = chain belum terdaftar → add dulu
          if (e?.code === 4902) {
            await (window as any).ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: CHAIN_ID_HEX,
                chainName: CHAIN_NAME,
                rpcUrls: [RPC_URL],
                nativeCurrency: NATIVE,
              }],
            });
          } else {
            throw e;
          }
        }

        // re-init setelah switch
        provider = new ethers.BrowserProvider((window as any).ethereum);
        net = await provider.getNetwork();
        if (Number(net.chainId) !== CHAIN_ID_DEC) {
          throw new Error("Failed to switch network");
        }
      }

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(AUCTION_CONTRACT, auctionAbi, signer);
      const id = BigInt(tokenId); // uint256 aman

      // ---------- Preflight checks ----------
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
        // jika tak ada owner(), lewati
      }

      // 2) item.exists & item.active?
      try {
        if (typeof contract.auctionItems === "function") {
          const item = await contract.auctionItems(id);
          const active = (item.active ?? item[4]) as boolean; // indeks sesuai struct-mu
          const exists = (item.exists ?? item[6]) as boolean; // sesuaikan index jika berbeda
          if (!exists) throw new Error("Domain not submitted (item.exists = false)");
          if (active) throw new Error("Auction already active (item.active = true)");
        }
      } catch {
        // jika getter tidak tersedia, lewati
      }

      // 3) static call untuk deteksi revert + custom error
      try {
        await contract.approveAndStartAuction.staticCall(id);
      } catch (e: any) {
        const data = e?.data ?? e?.error?.data;
        if (data) {
          try {
            const parsed = contract.interface.parseError(data);
            throw new Error(`Reverted: ${parsed.name}(${parsed.args?.map(String).join(", ")})`);
          } catch {
            // tidak bisa decode → lempar error asli
          }
        }
        throw e;
      }
      // -------------------------------------

      // Estimasi gas + override gasLimit
      let txResp;
      try {
        const gas: bigint = await contract.approveAndStartAuction.estimateGas(id);
        txResp = await contract.approveAndStartAuction(id, {
          gasLimit: (gas * 11n) / 10n, // +10%
        });
      } catch {
        throw new Error("Gas estimation failed. Cek onlyOwner / exists / active / chain.");
      }

      setTx({ loading: true, hash: txResp.hash });
      const receipt = await txResp.wait();
      setTx({ loading: false, hash: receipt?.hash });
    } catch (err: any) {
      const code = err?.code;
      const msg =
        code === 4001
          ? "Tanda tangan dibatalkan di MetaMask."
          : err?.reason || err?.shortMessage || err?.message || "Failed to submit transaction";
      console.error("approveAndStartAuction error:", err);
      setTx({ loading: false, error: msg });
    }
  };

  return { submit, tx };
}
