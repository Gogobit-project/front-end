"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Users, Shield } from "lucide-react";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import Starfield from "@/components/starfield";
import Reveal from "./Reveal";
import Footer from "./footer";


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
        .concat([
          "rare.doma",
          "genesis.doma",
          "vault.doma",
          "prime.doma",
          "brand.doma",
        ]),
    [featuredAuctions]
  );


 const staggerParent: Variants = {
  hidden: {},
  show: {
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.06,
    },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }, // bezier aman untuk semua versi
  },
};

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
        speed={0.5}
        maxParallax={14}
        className="z-0"
      />

      {/* spotlight pointer */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{ background: bg }}
      />

      <br />
      <br />

      {/* HERO */}
<motion.section>
  <section className="px-6 pt-16 pb-10">
    <div className="mx-auto max-w-4xl text-center">
      {/* heading */}
      <h1
        className="mb-3 text-5xl font-extrabold leading-tight tracking-wide text-white md:text-6xl"
        style={{ fontFamily: "Space Grotesk, ui-sans-serif, system-ui" }}
      >
        Own the Future of the Web
      </h1>
      <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
        Secure rare Web3 domains in the most transparent, community-driven
        auction platform. Every bid is on-chain, every name is verified —
        no secrets, just fair play.
      </p>

      {/* CTA */}
      <div className="mb-16 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        {/* PRIMARY */}
        <Button
          asChild
          size="lg"
          className="rounded-xl px-8 py-3 text-lg text-white
                     bg-gradient-to-r from-violet-500 to-indigo-500
                     shadow-[0_12px_32px_-12px_rgba(99,102,241,.55)]
                     ring-1 ring-white/10
                     hover:brightness-110 hover:shadow-[0_18px_40px_-12px_rgba(99,102,241,.70)]
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70
                     active:scale-[0.98] transition"
        >
          <Link href="/auctions">Start Bidding</Link>
        </Button>

        {/* SECONDARY (glass) */}
        <Button
          asChild
          size="lg"
          variant="outline"
          className="rounded-xl px-8 py-3 text-lg
                     border border-white/15 text-slate-100
                     bg-white/8 backdrop-blur
                     hover:bg-white/14 hover:border-white/25 hover:text-white
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/50
                     active:scale-[0.98] transition"
        >
          <Link href="#how-it-works">Discover How It Works</Link>
        </Button>
      </div>

      {/* marquee */}
      <Reveal delay={0.05}>
        <div className="relative mx-auto mb-14 max-w-4xl overflow-hidden rounded-xl border border-white/10 bg-white/5 py-2 backdrop-blur-sm">
          <motion.div
            className="flex gap-8 whitespace-nowrap px-6 text-sm"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            {[...marqueeDomains, ...marqueeDomains].map((d, i) => (
              <span key={i} className="text-slate-300/75">★ {d}</span>
            ))}
          </motion.div>
        </div>
      </Reveal>

      {/* stats (stagger) */}
      <Reveal delay={0.1}>
        <div className="mx-auto max-w-5xl">
          <motion.div
            className="grid grid-cols-2 gap-3 md:grid-cols-5"
            variants={staggerParent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              ["Domains Claimed", "70,165+"],
              ["ETH Volume", "1.15M+"],
              ["Active Bidders", "4,900+"],
              ["Verified Trust", "100%"],
              ["Auctions Live Now", "128"],
              ["Highest Bid", "32.5 ETH"],
              ["Auctions Closed", "5,200+"],
              ["Community Members", "12,450+"],
              ["Countries Reached", "42+"],
              ["Avg. Auction Time", "24h"],
            ].map(([label, value], i) => (
              <motion.div key={i}  variants={staggerItem}>
                <StatBox label={label} value={value} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Reveal>
    </div>
  </section>
</motion.section>


   

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
                  <div className="text-center mt-8">
                    <Button
                      variant="outline"
                      size="lg"
                      className="mt-5 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:brightness-110"
                    >
                      <Link href="/auctions">View All Auctions</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

     <Reveal>
  <div className="max-w-5xl mx-auto text-center" id="how-it-works">
    <h2 className="text-3xl font-bold text-white mb-10">How It Works</h2>

    <motion.div
      className="grid items-stretch md:grid-cols-4 gap-8 text-left"
      variants={staggerParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {[
        { n: 1, title: "Connect Wallet", desc: "Use MetaMask, WalletConnect, or your favorite Web3 wallet to join." },
        { n: 2, title: "Browse Domains", desc: "Explore rare, curated Web3 domains verified by the community." },
        { n: 3, title: "Place Your Bid", desc: "Submit your offer on-chain. Every bid is transparent and immutable." },
        { n: 4, title: "Win & Own", desc: "If you win, the domain is yours — fully decentralized, forever." },
      ].map((s) => (
        <motion.div
          key={s.n}
          variants={staggerItem}
          className="group relative h-full space-y-3 rounded-xl border border-white/10 bg-white/5 p-5"
        >
          <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
            <span className="text-indigo-300 font-bold">{s.n}</span>
          </div>
          <h3 className="text-white font-semibold">{s.title}</h3>
          <p className="text-slate-300/80 text-sm">{s.desc}</p>
        </motion.div>
      ))}
    </motion.div>
  </div>
</Reveal>
      <br />
      <br />

      <section className="">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join the Community
          </h2>
          <p className="text-slate-300/80 text-lg mb-8">
            Be part of 12,000+ Web3 pioneers shaping the future of digital
            ownership. Get early access to premium domains, live auction alerts,
            and community rewards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://discord.gg/yourlink"
              className="rounded-lg bg-indigo-500 px-6 py-3 text-white font-semibold shadow hover:brightness-110"
            >
              Join Discord
            </a>
            <a
              href="https://t.me/yourlink"
              className="rounded-lg border border-white/20 px-6 py-3 text-white font-semibold hover:bg-white/10"
            >
              Join Telegram
            </a>
          </div>
        </div>
      </section>

      <br />
      <br />

      <section >
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 text-center items-stretch">
            <div className="space-y-3 p-6 border border-white/10 bg-white/5 rounded-xl h-full flex flex-col">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Curated by Experts
              </h3>
              <p className="text-slate-300/80 text-sm flex-grow">
                Only the most valuable domains are hand-picked and approved by
                the community.
              </p>
            </div>

            <div className="space-y-3 p-6 border border-white/10 bg-white/5 rounded-xl h-full flex flex-col">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                100% On-Chain Transparency
              </h3>
              <p className="text-slate-300/80 text-sm flex-grow">
                Every bid, every history — forever secured on-chain. Nothing
                hidden.
              </p>
            </div>

            <div className="space-y-3 p-6 border border-white/10 bg-white/5 rounded-xl h-full flex flex-col">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Win with the Community
              </h3>
              <p className="text-slate-300/80 text-sm flex-grow">
                Join a growing network of pioneers, domainers, and Web3
                believers.
              </p>
            </div>
          </div>
        </div>
         <Footer/>
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
