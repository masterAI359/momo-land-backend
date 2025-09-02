import type React from "react"
import type { Metadata, Viewport } from "next"
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
          <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
<<<<<<< HEAD
            <main className="flex-1">{children}</main>
=======
            <div className="flex flex-col flex-1 max-w-full overflow-x-hidden mt-16">
              {children}
            </div>
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
            <Footer />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
