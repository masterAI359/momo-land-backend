"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, Home, Clock, AlertTriangle, Users, LogOut, User, TrendingUp, Menu, X } from "lucide-react"
import { useState } from "react"
import TroubleReportModal from "./trouble-report-modal"
import LoginModal from "./login-modal"
import { useAuth } from "@/lib/auth"

export default function Header() {
  const [showReportModal, setShowReportModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowLoginModal(true)
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              m
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">momoLand</span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="flex items-center space-x-1 text-gray-700 hover:text-pink-600 transition-colors">
              <Home className="w-4 h-4" />
              <span>ホーム</span>
            </Link>
            <Link
              href="/blogs"
              className="flex items-center space-x-1 text-gray-700 hover:text-pink-600 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>ブログ</span>
            </Link>
            <Link
              href="/timeline"
              className="flex items-center space-x-1 text-gray-700 hover:text-pink-600 transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span>タイムライン</span>
            </Link>
            <Link
              href="/ranking"
              className="flex items-center space-x-1 text-gray-700 hover:text-pink-600 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              <span>人気ランキング</span>
            </Link>
            <Link
              href="/chat"
              className="flex items-center space-x-1 text-gray-700 hover:text-pink-600 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>グループチャット</span>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-1 bg-transparent"
              onClick={() => setShowReportModal(true)}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>トラブル報告</span>
            </Button>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop auth section */}
            <div className="hidden sm:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-pink-600" />
                    <span className="text-sm font-medium text-gray-700">{user.nickname}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={logout} className="text-gray-600">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoginClick}
                  className="bg-pink-600 text-white border-pink-600 hover:bg-pink-700"
                >
                  ログイン・登録
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-3">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                <span className="text-base">ホーム</span>
              </Link>
              <Link
                href="/blogs"
                className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-base">ブログ</span>
              </Link>
              <Link
                href="/timeline"
                className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Clock className="w-5 h-5" />
                <span className="text-base">タイムライン</span>
              </Link>
              <Link
                href="/ranking"
                className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="text-base">人気ランキング</span>
              </Link>
              <Link
                href="/chat"
                className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Users className="w-5 h-5" />
                <span className="text-base">グループチャット</span>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-transparent"
                onClick={() => {
                  setShowReportModal(true)
                  setIsMobileMenuOpen(false)
                }}
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                トラブル報告
              </Button>

              {/* Mobile auth section */}
              <div className="pt-3 border-t">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-pink-600" />
                      <span className="text-base font-medium text-gray-700">{user.nickname}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        logout()
                        setIsMobileMenuOpen(false)
                      }} 
                      className="w-full justify-start"
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      ログアウト
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      handleLoginClick(e)
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full bg-pink-600 text-white border-pink-600 hover:bg-pink-700"
                  >
                    ログイン・登録
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <TroubleReportModal open={showReportModal} onClose={() => setShowReportModal(false)} />
      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </header>
  )
}
