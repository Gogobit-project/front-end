"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { useWeb3 } from "@/lib/web3-context";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import Starfield from "@/components/starfield";

import { ArrowUpCircle, Search, SlidersHorizontal, Shield, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/navbar";

// --------- MOCK DATA (replace with real fetch) ----------
type DomainItem = {
  id: string;
  name: string;
  category: string;
  verified?: boolean;
  votes: number;
};
async function fetchDomains(): Promise<DomainItem[]> {
  return [
    { id: "1", name: "alpha.doma", category: "Tech", verified: true, votes: 12 },
    { id: "2", name: "nexus.doma", category: "Finance", votes: 7 },
    { id: "3", name: "playzone.doma", category: "Gaming", votes: 20 },
    { id: "4", name: "gallery.doma", category: "Art", votes: 5 },
  ];
}
const votedKey = (account?: string | null) => `votedDomains:${account ?? "guest"}`;

export default function VotePage() {
  const { account, isConnected, connect } = useWeb3();
  const { toast } = useToast();

  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"most" | "least" | "az">("most");
  const [voted, setVoted] = useState<Record<string, boolean>>({});

  // initial load
  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchDomains();
      setDomains(data);
      setLoading(false);
    })();
  }, []);

  // load voted map for current account
  useEffect(() => {
    try {
      const raw = localStorage.getItem(votedKey(account));
      setVoted(raw ? JSON.parse(raw) : {});
    } catch {
      setVoted({});
    }
  }, [account]);

  // persist voted
  useEffect(() => {
    try {
      localStorage.setItem(votedKey(account), JSON.stringify(voted));
    } catch {}
  }, [voted, account]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    let arr = domains.filter((d) => (s ? d.name.toLowerCase().includes(s) : true));
    if (sortBy === "most") arr = arr.sort((a, b) => b.votes - a.votes);
    if (sortBy === "least") arr = arr.sort((a, b) => a.votes - b.votes);
    if (sortBy === "az") arr = arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [domains, search, sortBy]);

  const handleVote = async (domain: DomainItem) => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet belum terhubung",
        description: "Hubungkan wallet untuk melakukan vote.",
        action: (
          <ToastAction altText="Connect" onClick={connect}>
            Connect
          </ToastAction>
        ),
      });
      return;
    }
    if (voted[domain.id]) return;

    // TODO: call your API/contract here
    setDomains((prev) => prev.map((d) => (d.id === domain.id ? { ...d, votes: d.votes + 1 } : d)));
    setVoted((prev) => ({ ...prev, [domain.id]: true }));

    toast({
      description: (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span>{domain.name} menerima suaramu.</span>
        </div>
      ),
    });
  };

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
      <Starfield density={0.0014} baseSpeed={0.06} maxParallax={14} className="z-0" />

      {/* NAV */}
      <Navbar />

      {/* HEADER */}
      <section className="py-12 px-6 border-b border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Community Vote</h1>
            <p className="text-slate-300/85">Pilih domain favoritmu — satu suara per domain per akun.</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search domains..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-black/30 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-[180px] bg-black/30 border-white/10 text-white">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="most">Most Votes</SelectItem>
                <SelectItem value="least">Least Votes</SelectItem>
                <SelectItem value="az">A → Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20 text-slate-400">Loading domains…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">No domains found.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((d) => {
                const isVoted = !!voted[d.id];
                return (
                  <Card
                    key={d.id}
                    className="bg-white/[0.05] border border-white/10 backdrop-blur-sm hover:border-indigo-300/30 transition relative overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-tr from-indigo-400/10 via-transparent to-violet-400/10" />
                    <CardHeader className="pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg font-semibold">{d.name}</span>
                          {d.verified && <Shield className="w-4 h-4 text-indigo-300" />}
                        </div>
                        <Badge variant="secondary" className="bg-white/10 text-slate-200 border-white/15">
                          {d.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-slate-300/80">Total Votes</div>
                        <div className="text-base font-semibold">{d.votes}</div>
                      </div>

                      <Button
                        className="w-full rounded-xl bg-indigo-400/15 text-indigo-200 border border-indigo-300/30 hover:bg-indigo-500 hover:text-white hover:border-indigo-400 transition disabled:opacity-60"
                        onClick={() => handleVote(d)}
                        disabled={isVoted}
                      >
                        {isVoted ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Voted
                          </>
                        ) : (
                          <>
                            <ArrowUpCircle className="w-4 h-4 mr-2" />
                            Upvote
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
