"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Home, 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Mail, 
  Heart,
  ExternalLink
} from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  const navLinks = [
    { href: "/", label: "ホーム", icon: Home },
    { href: "/blogs", label: "ブログ一覧", icon: MessageSquare },
    { href: "/timeline", label: "タイムライン", icon: Clock },
    { href: "/ranking", label: "人気ランキング", icon: TrendingUp },
    { href: "/chat", label: "グループチャット", icon: Users },
    { href: "/post", label: "投稿する", icon: MessageSquare },
  ]

  const features = [
    "ライブチャット体験記共有",
    "リアルタイムチャット",
    "コミュニティ機能",
    "ユーザー評価システム"
  ]

  return (
    <footer className="mt-auto bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/images/logos/logo.png"
                  alt="momoLand Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">
              ライブチャット体験記を共有し、ユーザー同士の交流を促進するコミュニティサイトです。
              安全で楽しいプラットフォームを提供し、みんなで素晴らしい体験を共有しましょう。
            </p>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-200">主な機能</h4>
              <div className="flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Home className="w-4 h-4" />
              サイトマップ
            </h3>
            <nav className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 text-sm group"
                >
                  <link.icon className="w-4 h-4 group-hover:text-pink-400" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Support & Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              サポート
            </h3>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-gray-300 mb-2">
                  サイトに関するお問い合わせやトラブル報告は、下記の方法でお知らせください。
                </p>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    トラブル報告
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-gray-400">
                <p>営業時間: 平日 9:00 - 18:00</p>
                <p>※土日祝日は対応時間が異なります</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>&copy; {currentYear} momoLand. All rights reserved.</span>
              <Separator orientation="vertical" className="h-4 bg-gray-600" />
              <span>安全で楽しいコミュニティを目指して</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                サービス稼働中
              </Badge>
              <div className="flex items-center text-xs text-gray-400">
                <Heart className="w-3 h-3 mr-1 text-pink-500" />
                <span>Made with love</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              このサイトは18歳以上の方向けのサービスです。適切な利用を心がけてください。
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
