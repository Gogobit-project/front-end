import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { Web3Provider } from "@/lib/web3-context"
import RouteTransition from "@/components/route_transition"
import NextTopLoader from "nextjs-toploader";
import { Navbar } from "@/components/navbar"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
});

export const metadata: Metadata = {
  title: "GogoBid - Curated On-Chain Domain Auctions",
  icons: "/gogobit.png",
  description: "A modern Web3 dApp for high-end NFT domain auctions. Emphasizing trust, quality, and seamless bidding.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable} dark`}>
   <body className="font-sans antialiased">
  <Web3Provider>
    <NextTopLoader color="#8b5cf6" height={2} showSpinner={false} />
    <Navbar />
    <RouteTransition>{children}</RouteTransition>
  </Web3Provider>
</body>

    </html>
  )
}
