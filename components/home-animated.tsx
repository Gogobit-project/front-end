"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Users, Shield } from "lucide-react";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import Starfield from "@/components/starfield";

type Auction = {
  id: string;
  domain: string;
  verified?: boolean;
  currentBid: string;
  timeLeft: string;
  bidders: number;
  explorerUrl?: string;
};

// ===== spotlight pointer
function useSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 120, damping: 20 });
  const sy = useSpring(y, { stiffness: 120, damping: 20 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      x.set(e.clientX - r.left);
      y.set(e.clientY - r.top);
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, [x, y]);

  const bg = useTransform(
    [sx, sy],
    ([mx, my]) =>
      `radial-gradient(220px 220px at ${mx}px ${my}px, rgba(99,102,241,0.16), transparent 60%)`
  );
  return { ref, bg };
}

function useCounter(target: number, duration = 800) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const s = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - s) / duration);
      setV(Math.floor(p * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

// ====== main
export default function HomeAnimated({
  featuredAuctions,
}: {
  featuredAuctions: Auction[];
}) {
  const { ref: spotRef, bg } = useSpotlight();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const marqueeDomains = useMemo(
    () =>
      (featuredAuctions ?? [])
        .map((a) => a.domain)
        .slice(0, 8)
        .concat(["d3.doma", "prime.doma", "vault.doma"]),
    [featuredAuctions]
  );

  const d1 = useCounter(70165, 900);
  const d7 = useCounter(1152929, 900);
  const s1 = useCounter(4934, 900);
  const s7 = useCounter(91279, 900);

  const nf = useMemo(() => new Intl.NumberFormat("en-US"), []);
  const usd = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }),
    []
  );

  return (
    <div
      ref={spotRef}
      className="relative min-h-screen overflow-hidden"
      style={{
        // gradien dasar ungu navy + vignette halus
        backgroundImage: `
          radial-gradient(1200px 600px at 50% -10%, rgba(124,58,237,0.10), transparent 60%),
          radial-gradient(1200px 600px at 100% 120%, rgba(59,130,246,0.10), transparent 60%),
          linear-gradient(180deg, #120c20 0%, #17112a 50%, #120e22 100%)
        `,
      }}
    >
      {/* starfield ala D3 */}
      <Starfield
        density={0.0014}
        baseSpeed={0.06}
        maxParallax={14}
        className="z-0"
      />

      {/* spotlight pointer */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{ background: bg }}
      />

      {/* NAV */}
      <nav
        className={[
          "sticky top-0 z-40 border-b transition-all duration-300",
          scrolled
            ? "border-white/10 bg-[rgba(17,12,32,0.55)] backdrop-blur-xl"
            : "border-white/5 bg-[rgba(17,12,32,0.28)] backdrop-blur-md",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-6 py-3.5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-400/15 ring-1 ring-indigo-300/25">
                <Image
                  src="/gogobit.png"
                  alt="GogoBid"
                  width={18}
                  height={18}
                />
              </div>
              <span className="text-[20px] font-semibold tracking-wide text-white">
                Gogo<span className="text-indigo-300">Bid</span>
              </span>
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              <Link
                href="/auctions"
                className="text-slate-300/75 hover:text-white"
              >
                Auctions
              </Link>
              <Link href="/vote" className="text-slate-300/75 hover:text-white">
                Vote
              </Link>
              <Link
                href="/submit"
                className="text-slate-300/75 hover:text-white"
              >
                Submit Domain
              </Link>
            </div>

            <WalletConnectButton className="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1.5 text-sm text-white shadow hover:brightness-110" />
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="px-6 pt-16 pb-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* heading */}
          <h1
            className="mb-4 text-5xl font-extrabold leading-tight tracking-wide text-white md:text-6xl"
            style={{ fontFamily: "Space Grotesk, ui-sans-serif, system-ui" }}
          >
            Domain Auction
            <br />
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Experience premium NFT domain trading in a trusted,
              community-curated marketplace. Every domain is verified, every
              auction is transparent.
            </p>
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg"
            >
              <Link href="/auctions">Explore Auctions</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-border text-foreground hover:bg-muted px-8 py-3 text-lg bg-transparent"
            >
              Learn More
            </Button>
          </div>

          {/* marquee kecil (opsional) */}
          <div className="relative mx-auto mb-14 max-w-4xl overflow-hidden rounded-xl border border-white/10 bg-white/5 py-2 backdrop-blur-sm">
            <motion.div
              className="flex gap-8 whitespace-nowrap px-6 text-sm"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              {[...marqueeDomains, ...marqueeDomains].map((d, i) => (
                <span key={i} className="text-slate-300/75">
                  ★ {d}
                </span>
              ))}
            </motion.div>
          </div>

          {/* stats strip mirip */}
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <StatBox label="Domains Sold" value={usd.format(d1)} />
              <StatBox label="ETH Volume" value={usd.format(d7 + 0.21)} />
              <StatBox label="Active Bidder" value={nf.format(s1)} />
              <StatBox label="Verified" value={"100%"} />
            
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED AUCTIONS (tetap punyamu, hanya skin) */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 text-center text-3xl font-bold text-white">
            Featured Auctions
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredAuctions.map((a, i) => (
              <Card
                key={a.id ?? i}
                className="overflow-hidden border-white/10 bg-white/[0.05] backdrop-blur-sm"
              >
                <CardContent className="p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-semibold text-white">
                        {a.domain}
                      </span>
                      {a.verified && (
                        <Shield className="h-4 w-4 text-indigo-300" />
                      )}
                    </div>
                    <Badge className="border-indigo-300/30 bg-indigo-400/10 text-indigo-200">
                      Live
                    </Badge>
                  </div>

                  <div className="space-y-3 text-sm">
                    <Row
                      label="Current Bid"
                      valueClass="text-indigo-300"
                      value={a.currentBid}
                    />
                    <Row
                      label="Time Left"
                      valueClass="text-slate-100"
                      value={a.timeLeft}
                      icon={<Clock className="h-3 w-3" />}
                    />
                    <Row
                      label="Bidders"
                      valueClass="text-slate-100"
                      value={String(a.bidders)}
                      icon={<Users className="h-3 w-3" />}
                    />
                  </div>

                  <Button className="mt-5 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:brightness-110">
                    Place Bid
                  </Button>
                </CardContent>
                  <div className="text-center mt-8">
            <Button variant="outline" size="lg" className="border-primary/20 text-primary hover:bg-primary/10 bg-transparent">
              <Link href="/auctions">View All Auctions</Link>
            </Button>
          </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

<section className="py-10 px-4 border-t border-border/50 bg-purple-900/5 backdrop-blur-sm rounded-2xl">
  <div className="max-w-3xl mx-auto">
    <div className="grid md:grid-cols-3 gap-6 text-center">
      <div className="space-y-3 p-4">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-white">Curated Quality</h3>
        <p className="text-slate-300/80 text-sm">
          Every domain is hand-picked and verified by our community of experts
        </p>
      </div>

      <div className="space-y-3 p-4">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-white">Transparent Bidding</h3>
        <p className="text-slate-300/80 text-sm">
          All bids are on-chain with complete transparency and immutable history
        </p>
      </div>

      <div className="space-y-3 p-4">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-white">Trusted Community</h3>
        <p className="text-slate-300/80 text-sm">
          Join experienced domainers and Web3 enthusiasts in premium auctions
        </p>
      </div>
    </div>
  </div>
</section>





    </div>
  );
}

function Row({
  label,
  value,
  valueClass = "",
  icon,
}: {
  label: string;
  value: string;
  valueClass?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1 text-slate-300/75">
        {icon} {label}
      </span>
      <span className={`font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="text-[11px] tracking-widest text-indigo-300/80">
        {label}
      </div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}
