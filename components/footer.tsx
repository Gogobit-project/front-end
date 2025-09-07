"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Twitter, Github, Send, MessageCircle } from "lucide-react";

type FooterProps = {
  logoSrc?: string;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: .35, ease: [0.22,1,0.36,1] } },
};

export default function Footer({
  logoSrc = "/gogobit.png",
}: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={[
        "relative mt-16",
        // transparan dengan gradient lembut ala web3
        "bg-[linear-gradient(180deg,rgba(124,58,237,0.10),rgba(59,130,246,0.08))]",
        "supports-[backdrop-filter]:backdrop-blur-sm",
      ].join(" ")}
    >
      {/* garis gradient tipis di atas */}
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto max-w-7xl px-6"
      >
        {/* ROW UTAMA: kiri brand, kanan 2 kolom link */}
        <div className="grid gap-10 lg:grid-cols-12 py-12">
          {/* KIRI: Brand + deskripsi + sosial */}
          <motion.div variants={fadeUp} className="lg:col-span-6 xl:col-span-7 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-400/15 ring-1 ring-indigo-300/25">
                <Image src={logoSrc} alt="GogoBid" width={18} height={18} />
              </div>
              <span className="text-xl font-semibold tracking-wide text-white">
                Gogo<span className="text-indigo-300">Bid</span>
              </span>
            </Link>

            <p className="text-slate-400 max-w-lg text-sm leading-relaxed">
              GogoBid saves your time with curated, on-chain domain auctions.
              Transparent, community-driven, and built for serious collectors.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <Social href="https://twitter.com" label="Twitter"><Twitter className="h-4 w-4" /></Social>
              <Social href="https://discord.gg" label="Discord"><MessageCircle className="h-4 w-4" /></Social>
              <Social href="https://t.me" label="Telegram"><Send className="h-4 w-4" /></Social>
              <Social href="https://github.com" label="GitHub"><Github className="h-4 w-4" /></Social>
            </div>
          </motion.div>

          {/* KANAN: 2 kolom link */}
          <motion.div variants={fadeUp} className="lg:col-span-6 xl:col-span-5">
            <div className="grid sm:grid-cols-2 gap-10">
              <FooterColumn
                title="Company"
                items={[
                  ["About Us", "/about"],
                  ["Pricing", "/pricing"],
                  ["Blog", "/blog"],
                  ["Careers", "/careers"],
                  ["Contact Us", "/contact"],
                  ["Press Kit", "/press"],
                  ["Partner Program", "/partners"],
                  ["Affiliate Program", "/affiliate"],
                  ["Service Level Agreement", "/sla"],
                ]}
              />
              <FooterColumn
                title="Resources"
                items={[
                  ["Documentation", "/docs"],
                  ["Github", "https://github.com"],
                  ["Request a Feature", "/request-feature"],
                  ["Testnet Faucets", "/faucets"],
                  ["Status", "https://status.gogobid.xyz"],
                  ["Free Dev Tools", "/tools"],
                  ["Example Apps", "/examples"],
                ]}
              />
            </div>
          </motion.div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-slate-500 text-sm">© {year} GogoBid. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link className="hover:text-slate-300" href="/legal/terms">Terms of Use</Link>
              <Link className="hover:text-slate-300" href="/legal/privacy">Privacy Policy</Link>
              <Link className="hover:text-slate-300" href="/legal/cookies">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}

/* ---------- sub-components ---------- */
function FooterColumn({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div className="space-y-3">
      <h5 className="text-white font-semibold">{title}</h5>
      <ul className="space-y-2">
        {items.map(([label, href]) => (
          <li key={label}>
            {href.startsWith("http") ? (
              <a href={href} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-200 text-sm">
                {label}
              </a>
            ) : (
              <Link href={href} className="text-slate-400 hover:text-slate-200 text-sm">
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/90 hover:bg-white/10"
    >
      {children}
    </a>
  );
}
