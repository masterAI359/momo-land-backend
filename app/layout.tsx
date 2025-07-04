import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { AuthProvider } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "momoLand - ライブチャット体験記共有サイト",
  description: "ライブチャットの体験記を共有し、ユーザー同士の交流を促進するコミュニティサイト",
  keywords: "ライブチャット, 体験記, 口コミ, レビュー, コミュニティ",
  openGraph: {
    title: "momoLand - ライブチャット体験記共有サイト",
    description: "ライブチャットの体験記を共有し、ユーザー同士の交流を促進するコミュニティサイト",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
