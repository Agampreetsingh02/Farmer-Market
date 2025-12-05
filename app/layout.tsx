import type React from "react"
// ... existing code ...
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Krishi Connect - Farmer's Marketplace & MSP Assurance",
  description: "Connect farmers with buyers, access MSP prices, and ensure fair crop sales with government support",
  keywords: "agriculture, farmer, marketplace, MSP, crop sales, India",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
