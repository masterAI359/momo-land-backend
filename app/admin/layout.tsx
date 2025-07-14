"use client"

import type React from "react"

import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Users, MessageSquare, FileText, Settings, BarChart3, AlertTriangle, Bell } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN" && user.role !== "MODERATOR")) {
      router.push("/")
    }
  }, [user, router])

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN" && user.role !== "MODERATOR")) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900">管理者パネル</h2>
          </div>
          <nav className="mt-6">
            <div className="px-3">
              <Link
                href="/admin"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                ダッシュボード
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                <Users className="w-5 h-5 mr-3" />
                ユーザー管理
              </Link>
              <Link
                href="/admin/posts"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                <FileText className="w-5 h-5 mr-3" />
                投稿管理
              </Link>
              <Link
                href="/admin/chat"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                <MessageSquare className="w-5 h-5 mr-3" />
                チャット管理
              </Link>
              <Link
                href="/admin/reports"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                <AlertTriangle className="w-5 h-5 mr-3" />
                報告管理
              </Link>
              <Link
                href="/admin/notifications"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                <Bell className="w-5 h-5 mr-3" />
                通知管理
              </Link>
              {user.role === "SUPER_ADMIN" && (
                <Link
                  href="/admin/settings"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  システム設定
                </Link>
              )}
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">{children}</div>
      </div>
    </div>
  )
}
