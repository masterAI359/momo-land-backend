"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
<<<<<<< HEAD
import { MessageSquare, Home, Clock, AlertTriangle, Users, LogOut, User, TrendingUp } from "lucide-react"
=======
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuLink
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Home, Clock, AlertTriangle, Users, LogOut, User, TrendingUp, Menu, X, Shield, Settings, Activity } from "lucide-react"
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
import { useState } from "react"
import TroubleReportModal from "./trouble-report-modal"
import LoginModal from "./login-modal"
import { useAuth } from "@/lib/auth"
<<<<<<< HEAD
=======
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4

export default function Header() {
  const [showReportModal, setShowReportModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { user, logout } = useAuth()

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowLoginModal(true)
  }

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
  }

  const isAdmin = user && ["ADMIN", "MODERATOR", "SUPER_ADMIN"].includes(user.role)

  const NavigationItems = () => (
    <>
      <NavigationMenuItem>
        <Link href="/" legacyBehavior passHref>
          <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "gap-2")}>
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">ホーム</span>
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <Link href="/blogs" legacyBehavior passHref>
          <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "gap-2")}>
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">ブログ</span>
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <Link href="/timeline" legacyBehavior passHref>
          <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "gap-2")}>
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">タイムライン</span>
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <Link href="/ranking" legacyBehavior passHref>
          <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "gap-2")}>
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">ランキング</span>
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <Link href="/chat" legacyBehavior passHref>
          <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "gap-2")}>
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">チャット</span>
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>

      {/* Profile Navigation */}
      {user && (
        <NavigationMenuItem>
          <Link href="/profile" legacyBehavior passHref>
            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "gap-2")}>
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">プロフィール</span>
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      )}

      {/* Admin Navigation */}
      {isAdmin && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">管理</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-red-600" />
              <span>管理者機能</span>
              <Badge variant="outline" className="text-xs">
                {user.role}
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <div>
                  <div className="font-medium">ダッシュボード</div>
                  <div className="text-xs text-muted-foreground">システム統計と概要</div>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/admin/users" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <div>
                  <div className="font-medium">ユーザー管理</div>
                  <div className="text-xs text-muted-foreground">ユーザー一覧と管理</div>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/admin/posts" className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <div>
                  <div className="font-medium">投稿管理</div>
                  <div className="text-xs text-muted-foreground">投稿の管理とモデレーション</div>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/admin/comments" className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <div>
                  <div className="font-medium">コメント管理</div>
                  <div className="text-xs text-muted-foreground">コメントの管理とモデレーション</div>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/admin/chat" className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <div>
                  <div className="font-medium">チャット管理</div>
                  <div className="text-xs text-muted-foreground">チャットルームとメッセージ管理</div>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/admin/artists" className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <div>
                  <div className="font-medium">アーティスト管理</div>
                  <div className="text-xs text-muted-foreground">女性アーティストランキング管理</div>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/admin/monitoring" className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <div>
                  <div className="font-medium">システム監視</div>
                  <div className="text-xs text-muted-foreground">システム状態と活動監視</div>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/admin/reports" className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <div>
                  <div className="font-medium">報告管理</div>
                  <div className="text-xs text-muted-foreground">ユーザー報告の確認と処理</div>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/admin/permissions" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <div>
                  <div className="font-medium">権限管理</div>
                  <div className="text-xs text-muted-foreground">ユーザーロールと権限の管理</div>
                </div>
              </Link>
            </DropdownMenuItem>

            {user.role === "SUPER_ADMIN" && (
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <div>
                    <div className="font-medium">システム設定</div>
                    <div className="text-xs text-muted-foreground">システム設定とコンフィグ</div>
                  </div>
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  )

  return (
    <header className="bg-white shadow-sm fixed mt-0 z-50 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<<<<<<< HEAD
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              m
            </div>
            <span className="text-xl font-bold text-gray-900">momoLand</span>
=======
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img src="/images/logos/logo.png" alt="momoLand Logo" className="w-[100px] h-16 object-contain aspect-auto" />
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationItems />
              </NavigationMenuList>
            </NavigationMenu>

<<<<<<< HEAD
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-pink-600" />
                  <span className="text-sm font-medium text-gray-700">{user.nickname}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="text-gray-600">
=======
            <Separator orientation="vertical" className="h-6" />

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-orange-600 gap-2"
              onClick={() => setShowReportModal(true)}
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden lg:inline">トラブル報告</span>
            </Button>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1 bg-pink-50 rounded-full">
                  <Avatar className="w-6 h-6 text-pink-600">
                    <AvatarImage src={user.avatar ? user.avatar : "/images/avatar/default.png"} />
                    <AvatarFallback>{user.nickname.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {
                    !isAdmin && (
                      <span className="text-sm font-medium text-pink-700">{user.nickname}</span>
                    )
                  }
                  {user.isGuest && (
                    <Badge variant="secondary" className="text-xs">
                      ゲスト
                    </Badge>
                  )}
                  {isAdmin && (
                    <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                      {user.role}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600"
                >
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
<<<<<<< HEAD
                variant="outline"
                size="sm"
                onClick={handleLoginClick}
                className="bg-pink-600 text-white border-pink-600 hover:bg-pink-700"
=======
                onClick={handleLoginClick}
                className="bg-pink-600 hover:bg-pink-700 text-white"
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
              >
                ログイン・登録
              </Button>
            )}
          </div>
<<<<<<< HEAD
=======

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle className="text-left">メニュー</SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* User Info */}
                  {user ? (
                    <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                      <User className="w-5 h-5 text-pink-600" />
                      <div>
                        <p className="font-medium text-pink-700">{user.nickname}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {user.isGuest && (
                            <Badge variant="secondary" className="text-xs">
                              ゲストユーザー
                            </Badge>
                          )}
                          {isAdmin && (
                            <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                              {user.role}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={handleLoginClick}
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                    >
                      ログイン・登録
                    </Button>
                  )}

                  <Separator />

                  {/* Navigation Links */}
                  <div className="space-y-2">
                    <SheetClose asChild>
                      <Link
                        href="/"
                        className="flex items-center space-x-3 text-gray-700 hover:text-pink-600 transition-colors py-3 px-2 rounded-lg hover:bg-pink-50"
                      >
                        <Home className="w-5 h-5" />
                        <span className="font-medium">ホーム</span>
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link
                        href="/blogs"
                        className="flex items-center space-x-3 text-gray-700 hover:text-pink-600 transition-colors py-3 px-2 rounded-lg hover:bg-pink-50"
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span className="font-medium">ブログ</span>
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link
                        href="/timeline"
                        className="flex items-center space-x-3 text-gray-700 hover:text-pink-600 transition-colors py-3 px-2 rounded-lg hover:bg-pink-50"
                      >
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">タイムライン</span>
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link
                        href="/ranking"
                        className="flex items-center space-x-3 text-gray-700 hover:text-pink-600 transition-colors py-3 px-2 rounded-lg hover:bg-pink-50"
                      >
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-medium">人気ランキング</span>
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link
                        href="/chat"
                        className="flex items-center space-x-3 text-gray-700 hover:text-pink-600 transition-colors py-3 px-2 rounded-lg hover:bg-pink-50"
                      >
                        <Users className="w-5 h-5" />
                        <span className="font-medium">チャット</span>
                      </Link>
                    </SheetClose>

                    {/* Profile Navigation in Mobile */}
                    {user && (
                      <SheetClose asChild>
                        <Link
                          href="/profile"
                          className="flex items-center space-x-3 text-gray-700 hover:text-pink-600 transition-colors py-3 px-2 rounded-lg hover:bg-pink-50"
                        >
                          <User className="w-5 h-5" />
                          <span className="font-medium">プロフィール</span>
                        </Link>
                      </SheetClose>
                    )}

                    {/* Admin Navigation in Mobile */}
                    {isAdmin && (
                      <>
                        <Separator className="my-4" />
                        <div className="px-2 py-1">
                          <div className="flex items-center space-x-2 mb-3">
                            <Shield className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-red-700">管理者機能</span>
                          </div>
                        </div>

                        <SheetClose asChild>
                          <Link
                            href="/admin"
                            className="flex items-center space-x-3 text-gray-700 hover:text-red-600 transition-colors py-3 px-2 rounded-lg hover:bg-red-50"
                          >
                            <Shield className="w-5 h-5" />
                            <span className="font-medium">管理ダッシュボード</span>
                          </Link>
                        </SheetClose>

                        <SheetClose asChild>
                          <Link
                            href="/admin/users"
                            className="flex items-center space-x-3 text-gray-700 hover:text-red-600 transition-colors py-3 px-2 rounded-lg hover:bg-red-50"
                          >
                            <Users className="w-5 h-5" />
                            <span className="font-medium">ユーザー管理</span>
                          </Link>
                        </SheetClose>

                        <SheetClose asChild>
                          <Link
                            href="/admin/posts"
                            className="flex items-center space-x-3 text-gray-700 hover:text-red-600 transition-colors py-3 px-2 rounded-lg hover:bg-red-50"
                          >
                            <MessageSquare className="w-5 h-5" />
                            <span className="font-medium">投稿管理</span>
                          </Link>
                        </SheetClose>

                        <SheetClose asChild>
                          <Link
                            href="/admin/monitoring"
                            className="flex items-center space-x-3 text-gray-700 hover:text-red-600 transition-colors py-3 px-2 rounded-lg hover:bg-red-50"
                          >
                            <Activity className="w-5 h-5" />
                            <span className="font-medium">システム監視</span>
                          </Link>
                        </SheetClose>

                        <SheetClose asChild>
                          <Link
                            href="/admin/reports"
                            className="flex items-center space-x-3 text-gray-700 hover:text-red-600 transition-colors py-3 px-2 rounded-lg hover:bg-red-50"
                          >
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-medium">報告管理</span>
                          </Link>
                        </SheetClose>

                        <SheetClose asChild>
                          <Link
                            href="/admin/permissions"
                            className="flex items-center space-x-3 text-gray-700 hover:text-red-600 transition-colors py-3 px-2 rounded-lg hover:bg-red-50"
                          >
                            <Shield className="w-5 h-5" />
                            <span className="font-medium">権限管理</span>
                          </Link>
                        </SheetClose>

                        {user.role === "SUPER_ADMIN" && (
                          <SheetClose asChild>
                            <Link
                              href="/admin/settings"
                              className="flex items-center space-x-3 text-gray-700 hover:text-red-600 transition-colors py-3 px-2 rounded-lg hover:bg-red-50"
                            >
                              <Settings className="w-5 h-5" />
                              <span className="font-medium">システム設定</span>
                            </Link>
                          </SheetClose>
                        )}
                      </>
                    )}

                    <Separator className="my-4" />

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-gray-600 hover:text-orange-600 gap-3"
                      onClick={() => {
                        setShowReportModal(true)
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">トラブル報告</span>
                    </Button>

                    {user && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-start text-gray-600 hover:text-red-600 gap-3"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">ログアウト</span>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
        </div>
      </div>

      {/* Modals */}
      <TroubleReportModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </header>
  )
}
