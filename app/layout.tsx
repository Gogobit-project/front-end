import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Web3Provider } from "@/lib/web3-context"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "GogoBid - Curated On-Chain Domain Auctions",
  description: "A modern Web3 dApp for high-end NFT domain auctions. Emphasizing trust, quality, and seamless bidding.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="font-sans antialiased">
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  )
}
