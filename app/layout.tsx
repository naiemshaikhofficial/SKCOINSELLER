import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Skoins - Premium Coins & Collectibles",
  description: "Discover and collect premium coins, rare collectibles, and investment-grade precious metals with Skoins",
  icons: {
    icon: [
      { url: "/skoins-logo.png", sizes: "any" },
      { url: "/skoins-logo.png", sizes: "16x16", type: "image/png" },
      { url: "/skoins-logo.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/skoins-logo.png",
    shortcut: "/skoins-logo.png",
  },
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased`}>{children}</body>
    </html>
  )
}
