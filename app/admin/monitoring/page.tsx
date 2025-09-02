<<<<<<< HEAD
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Eye, Ban, Trash2, Flag, Shield } from "lucide-react"

interface ModerationItem {
  id: string
  type: "post" | "comment" | "message"
  content: string
  author: {
    id: string
    nickname: string
  }
  flaggedReason: string
  severity: number
  status: string
  createdAt: string
  autoFlagged: boolean
}

interface ModerationRule {
  id: string
  name: string
  pattern: string
  action: string
  targetType: string
  isActive: boolean
  severity: number
}

export default function AutoMonitoring() {
  const [flaggedItems, setFlaggedItems] = useState<ModerationItem[]>([])
  const [moderationRules, setModerationRules] = useState<ModerationRule[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"flagged" | "rules">("flagged")
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [flaggedRes, rulesRes] = await Promise.all([
        fetch("/api/admin/monitoring/flagged"),
        fetch("/api/admin/monitoring/rules"),
      ])

      if (flaggedRes.ok && rulesRes.ok) {
        const flaggedData = await flaggedRes.json()
        const rulesData = await rulesRes.json()
        setFlaggedItems(flaggedData.items)
        setModerationRules(rulesData.rules)
      }
    } catch (error) {
      console.error("Failed to fetch monitoring data:", error)
      toast({
        title: "エラー",
        description: "監視データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const takeAction = async (itemId: string, action: string, reason?: string) => {
    try {
      const response = await fetch(`/api/admin/monitoring/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, action, reason }),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "アクションを実行しました",
        })
        setActionDialogOpen(false)
        fetchData()
      }
    } catch (error) {
      console.error("Failed to take action:", error)
      toast({
        title: "エラー",
        description: "アクション実行に失敗しました",
        variant: "destructive",
      })
    }
  }

  const createRule = async (ruleData: any) => {
    try {
      const response = await fetch("/api/admin/monitoring/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ruleData),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "監視ルールを作成しました",
        })
        setRuleDialogOpen(false)
        fetchData()
      }
    } catch (error) {
      console.error("Failed to create rule:", error)
      toast({
        title: "エラー",
        description: "ルール作成に失敗しました",
        variant: "destructive",
      })
    }
  }

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/monitoring/rules/${ruleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "ルールを更新しました",
        })
        fetchData()
      }
    } catch (error) {
      console.error("Failed to toggle rule:", error)
      toast({
        title: "エラー",
        description: "ルール更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  const getSeverityBadge = (severity: number) => {
    const variants = {
      1: "outline",
      2: "secondary",
      3: "default",
      4: "destructive",
      5: "destructive",
    }
    const colors = {
      1: "低",
      2: "中",
      3: "高",
      4: "重大",
      5: "緊急",
    }
    return (
      <Badge variant={variants[severity as keyof typeof variants] || "outline"}>
        {colors[severity as keyof typeof colors] || "不明"}
      </Badge>
    )
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">自動監視システム</h1>
        <p className="text-gray-600 mt-2">不適切なコンテンツの自動検出と管理</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4">
        <Button variant={activeTab === "flagged" ? "default" : "outline"} onClick={() => setActiveTab("flagged")}>
          <Flag className="h-4 w-4 mr-2" />
          フラグ付きコンテンツ
        </Button>
        <Button variant={activeTab === "rules" ? "default" : "outline"} onClick={() => setActiveTab("rules")}>
          <Shield className="h-4 w-4 mr-2" />
          監視ルール
        </Button>
      </div>

      {/* Flagged Content Tab */}
      {activeTab === "flagged" && (
        <Card>
          <CardHeader>
            <CardTitle>フラグ付きコンテンツ ({flaggedItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">コンテンツ</th>
                    <th className="text-left p-2">作成者</th>
                    <th className="text-left p-2">タイプ</th>
                    <th className="text-left p-2">理由</th>
                    <th className="text-left p-2">重要度</th>
                    <th className="text-left p-2">検出方法</th>
                    <th className="text-left p-2">日時</th>
                    <th className="text-left p-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="max-w-xs truncate">{item.content}</div>
                      </td>
                      <td className="p-2">{item.author.nickname}</td>
                      <td className="p-2">
                        <Badge variant="outline">{item.type}</Badge>
                      </td>
                      <td className="p-2">{item.flaggedReason}</td>
                      <td className="p-2">{getSeverityBadge(item.severity)}</td>
                      <td className="p-2">
                        <Badge variant={item.autoFlagged ? "default" : "secondary"}>
                          {item.autoFlagged ? "自動" : "手動"}
                        </Badge>
                      </td>
                      <td className="p-2">{new Date(item.createdAt).toLocaleString("ja-JP")}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedItem(item)
                              setActionDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => takeAction(item.id, "block", "不適切なコンテンツ")}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => takeAction(item.id, "delete", "規約違反")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Moderation Rules Tab */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">監視ルール</h2>
            <Button onClick={() => setRuleDialogOpen(true)}>
              <Shield className="h-4 w-4 mr-2" />
              新規ルール作成
            </Button>
          </div>

          <Card>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ルール名</th>
                      <th className="text-left p-2">パターン</th>
                      <th className="text-left p-2">対象</th>
                      <th className="text-left p-2">アクション</th>
                      <th className="text-left p-2">重要度</th>
                      <th className="text-left p-2">状態</th>
                      <th className="text-left p-2">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moderationRules.map((rule) => (
                      <tr key={rule.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{rule.name}</td>
                        <td className="p-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">{rule.pattern}</code>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">{rule.targetType}</Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant="secondary">{rule.action}</Badge>
                        </td>
                        <td className="p-2">{getSeverityBadge(rule.severity)}</td>
                        <td className="p-2">
                          <Badge variant={rule.isActive ? "default" : "secondary"}>
                            {rule.isActive ? "有効" : "無効"}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Button size="sm" variant="outline" onClick={() => toggleRule(rule.id, !rule.isActive)}>
                            {rule.isActive ? "無効化" : "有効化"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
=======
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import api from '@/api/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RefreshCw, Activity, MessageSquare, Heart, AlertTriangle, Database, Users, Clock, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

// Types
interface UserActivity {
  id: string
  userId: string
  action: string
  details: any
  ipAddress: string
  userAgent: string
  createdAt: string
  user: {
    id: string
    nickname: string
    email: string
    role: string
  }
}

interface ChatMessage {
  id: string
  content: string
  type: string
  status: string
  moderationReason?: string
  isBlocked: boolean
  createdAt: string
  user: {
    id: string
    nickname: string
    email: string
    role: string
  }
  room: {
    id: string
    name: string
    atmosphere: string
  }
}

interface SystemHealth {
  database: {
    status: string
    connection: string
  }
  users: {
    total: number
    active24h: number
    activityTrend: Array<{
      date: string
      count: number
    }>
  }
  content: {
    posts: {
      total: number
      last24h: number
    }
    messages: {
      total: number
      last24h: number
    }
    moderationStats: Array<{
      status: string
      _count: { id: number }
    }>
  }
  reports: {
    total: number
    pending: number
  }
  system: {
    errors24h: number
    moderationActions24h: number
    uptime: number
    memoryUsage: {
      rss: number
      heapUsed: number
      heapTotal: number
    }
    nodeVersion: string
  }
}

interface RealtimeData {
  timestamp: string
  metrics: {
    activeUsers: number
    recentMessages: number
    recentReports: number
    onlineUsers: number
    systemErrors: number
  }
  recentActivities: UserActivity[]
  alerts: Array<{
    type: string
    message: string
    timestamp: string
  }>
  systemInfo?: {
    totalUsers: number
    totalPosts: number
    totalChatRooms: number
    dailyStats: {
      newUsers: number
      newPosts: number
      newComments: number
    }
    serverInfo: {
      uptime: number
      memoryUsage: {
        used: number
        total: number
        percent: number
      }
      nodeVersion: string
    }
  }
}

export default function MonitoringPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data states
  const [userActivities, setUserActivities] = useState<UserActivity[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null)

  // Filter states
  const [activityFilters, setActivityFilters] = useState({
    page: 1,
    limit: 20,
    userId: '',
    action: '',
    dateFrom: '',
    dateTo: ''
  })

  const [messageFilters, setMessageFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    roomId: '',
    dateFrom: '',
    dateTo: ''
  })

  // Pagination states
  const [activityPagination, setActivityPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  const [messagePagination, setMessagePagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  // Auto-refresh
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds

  // API calls
  const fetchUserActivities = async () => {
    try {
      setError(null)
      const queryParams = new URLSearchParams({
        page: activityFilters.page.toString(),
        limit: activityFilters.limit.toString(),
        ...(activityFilters.userId && { userId: activityFilters.userId }),
        ...(activityFilters.action && { action: activityFilters.action }),
        ...(activityFilters.dateFrom && { dateFrom: activityFilters.dateFrom }),
        ...(activityFilters.dateTo && { dateTo: activityFilters.dateTo })
      })

      const response = await api.get(`/admin/monitoring/activities?${queryParams}`)
      setUserActivities(response.data.activities)
      setActivityPagination(response.data.pagination)
    } catch (err: any) {
      console.error('Error fetching user activities:', err)
      setError(err.response?.data?.error || 'ユーザー活動の取得に失敗しました')
    }
  }

  const fetchChatMessages = async () => {
    try {
      setError(null)
      const queryParams = new URLSearchParams({
        page: messageFilters.page.toString(),
        limit: messageFilters.limit.toString(),
        ...(messageFilters.status && { status: messageFilters.status }),
        ...(messageFilters.roomId && { roomId: messageFilters.roomId }),
        ...(messageFilters.dateFrom && { dateFrom: messageFilters.dateFrom }),
        ...(messageFilters.dateTo && { dateTo: messageFilters.dateTo })
      })

      const response = await api.get(`/admin/monitoring/messages?${queryParams}`)
      setChatMessages(response.data.messages)
      setMessagePagination(response.data.pagination)
    } catch (err: any) {
      console.error('Error fetching chat messages:', err)
      setError(err.response?.data?.error || 'チャットメッセージの取得に失敗しました')
    }
  }

  const fetchSystemHealth = async () => {
    try {
      setError(null)
      const response = await api.get('/admin/monitoring/health')
      setSystemHealth(response.data.health)
    } catch (err: any) {
      console.error('Error fetching system health:', err)
      setError(err.response?.data?.error || 'システムヘルスの取得に失敗しました')
    }
  }

  const fetchRealtimeData = async () => {
    try {
      setError(null)
      const response = await api.get('/admin/monitoring/realtime')
      setRealtimeData(response.data)
    } catch (err: any) {
      console.error('Error fetching realtime data:', err)
      setError(err.response?.data?.error || 'リアルタイムデータの取得に失敗しました')
    }
  }

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        await Promise.all([
          fetchUserActivities(),
          fetchChatMessages(),
          fetchSystemHealth(),
          fetchRealtimeData()
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load monitoring data')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [activityFilters, messageFilters])

  // Auto-refresh effect
  useEffect(() => {
    if (!isAutoRefresh) return

    const interval = setInterval(() => {
      fetchRealtimeData()
      if (activeTab === 'activities') {
        fetchUserActivities()
      } else if (activeTab === 'messages') {
        fetchChatMessages()
      } else if (activeTab === 'health') {
        fetchSystemHealth()
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [isAutoRefresh, refreshInterval, activeTab, activityFilters, messageFilters])

  // Handlers
  const handleRefresh = async () => {
    await Promise.all([
      fetchUserActivities(),
      fetchChatMessages(),
      fetchSystemHealth(),
      fetchRealtimeData()
    ])
  }

  const handleActivityPageChange = (page: number) => {
    setActivityFilters(prev => ({ ...prev, page }))
  }

  const handleMessagePageChange = (page: number) => {
    setMessageFilters(prev => ({ ...prev, page }))
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'flagged': return 'bg-orange-100 text-orange-800'
      case 'hidden': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800'
      case 'ADMIN': return 'bg-blue-100 text-blue-800'
      case 'MODERATOR': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const formatMemory = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">読み込み中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">システム監視</h1>
          <p className="mt-2 text-gray-600">
            ユーザー活動、メッセージ状態、システム状態を監視します
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="auto-refresh">自動更新</Label>
            <input
              id="auto-refresh"
              type="checkbox"
              checked={isAutoRefresh}
              onChange={(e) => setIsAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            更新
          </Button>
        </div>
      </div>

      {/* Real-time Alerts */}
      {realtimeData?.alerts && realtimeData.alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {realtimeData.alerts.map((alert, index) => (
            <Alert key={index} className={
              alert.type === 'error' ? 'border-red-200 bg-red-50' : 
              alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' : 
              'border-blue-200 bg-blue-50'
            }>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {alert.message}
                <span className="ml-2 text-sm text-gray-500">
                  {format(new Date(alert.timestamp), 'HH:mm:ss')}
                </span>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Real-time Metrics */}
      {realtimeData && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">アクティブユーザー</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {realtimeData.metrics.activeUsers}
              </div>
              <p className="text-xs text-gray-500 mt-1">過去15分間</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">最新メッセージ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {realtimeData.metrics.recentMessages}
              </div>
              <p className="text-xs text-gray-500 mt-1">過去5分間</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">オンラインユーザー</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {realtimeData.metrics.onlineUsers}
              </div>
              <p className="text-xs text-gray-500 mt-1">現在</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">未処理レポート</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {realtimeData.metrics.recentReports}
              </div>
              <p className="text-xs text-gray-500 mt-1">過去1時間</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">システムエラー</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {realtimeData.metrics.systemErrors}
              </div>
              <p className="text-xs text-gray-500 mt-1">過去1時間</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Information */}
      {realtimeData?.systemInfo && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">システム統計</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">総ユーザー数</span>
                <span className="font-semibold">{realtimeData.systemInfo.totalUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">総投稿数</span>
                <span className="font-semibold">{realtimeData.systemInfo.totalPosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">チャットルーム数</span>
                <span className="font-semibold">{realtimeData.systemInfo.totalChatRooms.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">本日の活動</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">新規ユーザー</span>
                <span className="font-semibold text-blue-600">{realtimeData.systemInfo.dailyStats.newUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">新規投稿</span>
                <span className="font-semibold text-green-600">{realtimeData.systemInfo.dailyStats.newPosts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">新規コメント</span>
                <span className="font-semibold text-purple-600">{realtimeData.systemInfo.dailyStats.newComments}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">サーバー情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">稼働時間</span>
                <span className="font-semibold">{Math.floor(realtimeData.systemInfo.serverInfo.uptime / 3600)}時間</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">メモリ使用量</span>
                <span className="font-semibold">
                  {realtimeData.systemInfo.serverInfo.memoryUsage.used}MB / {realtimeData.systemInfo.serverInfo.memoryUsage.total}MB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Node.js</span>
                <span className="font-semibold">{realtimeData.systemInfo.serverInfo.nodeVersion}</span>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-600">メモリ使用率</span>
                  <span className="text-xs text-gray-600">{realtimeData.systemInfo.serverInfo.memoryUsage.percent.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={realtimeData.systemInfo.serverInfo.memoryUsage.percent} 
                  className="h-2"
                />
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
              </div>
            </CardContent>
          </Card>
        </div>
      )}

<<<<<<< HEAD
      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>コンテンツアクション</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <Label>コンテンツ</Label>
                <div className="p-3 bg-gray-100 rounded">{selectedItem.content}</div>
              </div>
              <div>
                <Label>作成者</Label>
                <div>{selectedItem.author.nickname}</div>
              </div>
              <div>
                <Label>フラグ理由</Label>
                <div>{selectedItem.flaggedReason}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => takeAction(selectedItem.id, "approve", "問題なし")}
                  className="flex-1"
                >
                  承認
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => takeAction(selectedItem.id, "block", "不適切")}
                  className="flex-1"
                >
                  ブロック
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => takeAction(selectedItem.id, "delete", "削除")}
                  className="flex-1"
                >
                  削除
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Rule Dialog */}
      <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新規監視ルール作成</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const ruleData = {
                name: formData.get("name"),
                pattern: formData.get("pattern"),
                action: formData.get("action"),
                targetType: formData.get("targetType"),
                severity: Number.parseInt(formData.get("severity") as string),
              }
              createRule(ruleData)
            }}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">ルール名</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="pattern">パターン（正規表現またはキーワード）</Label>
                <Input id="pattern" name="pattern" placeholder="例: (暴力|脅迫|詐欺)" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetType">対象タイプ</Label>
                  <Select name="targetType" defaultValue="post">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="post">投稿</SelectItem>
                      <SelectItem value="comment">コメント</SelectItem>
                      <SelectItem value="message">メッセージ</SelectItem>
=======
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="activities">ユーザー活動</TabsTrigger>
          <TabsTrigger value="messages">メッセージ監視</TabsTrigger>
          <TabsTrigger value="health">システム状態</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  最新活動
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {realtimeData?.recentActivities.map((activity) => (
                    <div key={activity.id} className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{activity.user.nickname}</span>
                            <Badge variant="outline" className={getRoleColor(activity.user.role)}>
                              {activity.user.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{activity.action}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {format(new Date(activity.createdAt), 'MM/dd HH:mm')}
                        </span>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* System Health Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  システム状態
                </CardTitle>
              </CardHeader>
              <CardContent>
                {systemHealth && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">データベース</span>
                      <Badge className={
                        systemHealth.database.status === 'healthy' ? 
                        'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }>
                        {systemHealth.database.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">稼働時間</span>
                      <span className="text-sm text-gray-600">
                        {formatUptime(systemHealth.system.uptime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">メモリ使用量</span>
                      <span className="text-sm text-gray-600">
                        {formatMemory(systemHealth.system.memoryUsage.heapUsed)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">過去24時間のエラー</span>
                      <span className="text-sm font-semibold text-red-600">
                        {systemHealth.system.errors24h}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          {/* Activity Filters */}
          <Card>
            <CardHeader>
              <CardTitle>フィルター</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="activity-action">アクション</Label>
                  <Input
                    id="activity-action"
                    placeholder="アクション名で検索"
                    value={activityFilters.action}
                    onChange={(e) => setActivityFilters(prev => ({ ...prev, action: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="activity-date-from">開始日</Label>
                  <Input
                    id="activity-date-from"
                    type="date"
                    value={activityFilters.dateFrom}
                    onChange={(e) => setActivityFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="activity-date-to">終了日</Label>
                  <Input
                    id="activity-date-to"
                    type="date"
                    value={activityFilters.dateTo}
                    onChange={(e) => setActivityFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={() => setActivityFilters({
                    page: 1,
                    limit: 20,
                    userId: '',
                    action: '',
                    dateFrom: '',
                    dateTo: ''
                  })}>
                    リセット
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activities Table */}
          <Card>
            <CardHeader>
              <CardTitle>ユーザー活動履歴</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ユーザー</th>
                      <th className="text-left p-2">アクション</th>
                      <th className="text-left p-2">詳細</th>
                      <th className="text-left p-2">IPアドレス</th>
                      <th className="text-left p-2">時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userActivities.map((activity) => (
                      <tr key={activity.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{activity.user.nickname}</span>
                            <Badge variant="outline" className={getRoleColor(activity.user.role)}>
                              {activity.user.role}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">{activity.action}</Badge>
                        </td>
                        <td className="p-2">
                          {activity.details ? (
                            <pre className="text-xs text-gray-600">
                              {JSON.stringify(activity.details, null, 2)}
                            </pre>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-2 text-sm text-gray-600">{activity.ipAddress || '-'}</td>
                        <td className="p-2 text-sm text-gray-600">
                          {format(new Date(activity.createdAt), 'MM/dd HH:mm:ss')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {activityPagination.total} 件中 {((activityPagination.page - 1) * activityPagination.limit) + 1} - {Math.min(activityPagination.page * activityPagination.limit, activityPagination.total)} 件を表示
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleActivityPageChange(activityPagination.page - 1)}
                    disabled={activityPagination.page === 1}
                  >
                    前へ
                  </Button>
                  <span className="text-sm">
                    {activityPagination.page} / {activityPagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleActivityPageChange(activityPagination.page + 1)}
                    disabled={activityPagination.page === activityPagination.totalPages}
                  >
                    次へ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          {/* Message Filters */}
          <Card>
            <CardHeader>
              <CardTitle>フィルター</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="message-status">ステータス</Label>
                  <Select value={messageFilters.status || "all"} onValueChange={(value) => 
                    setMessageFilters(prev => ({ ...prev, status: value === "all" ? "" : value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="全てのステータス" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全てのステータス</SelectItem>
                      <SelectItem value="PENDING">承認待ち</SelectItem>
                      <SelectItem value="APPROVED">承認済み</SelectItem>
                      <SelectItem value="REJECTED">拒否</SelectItem>
                      <SelectItem value="FLAGGED">フラグ付き</SelectItem>
                      <SelectItem value="HIDDEN">非表示</SelectItem>
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
                    </SelectContent>
                  </Select>
                </div>
                <div>
<<<<<<< HEAD
                  <Label htmlFor="action">アクション</Label>
                  <Select name="action" defaultValue="flag">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flag">フラグ付け</SelectItem>
                      <SelectItem value="block">自動ブロック</SelectItem>
                      <SelectItem value="delete">自動削除</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="severity">重要度 (1-5)</Label>
                <Select name="severity" defaultValue="3">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - 低</SelectItem>
                    <SelectItem value="2">2 - 中</SelectItem>
                    <SelectItem value="3">3 - 高</SelectItem>
                    <SelectItem value="4">4 - 重大</SelectItem>
                    <SelectItem value="5">5 - 緊急</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setRuleDialogOpen(false)}>
                キャンセル
              </Button>
              <Button type="submit">作成</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
=======
                  <Label htmlFor="message-date-from">開始日</Label>
                  <Input
                    id="message-date-from"
                    type="date"
                    value={messageFilters.dateFrom}
                    onChange={(e) => setMessageFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="message-date-to">終了日</Label>
                  <Input
                    id="message-date-to"
                    type="date"
                    value={messageFilters.dateTo}
                    onChange={(e) => setMessageFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={() => setMessageFilters({
                    page: 1,
                    limit: 20,
                    status: '',
                    roomId: '',
                    dateFrom: '',
                    dateTo: ''
                  })}>
                    リセット
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages Table */}
          <Card>
            <CardHeader>
              <CardTitle>メッセージ監視</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ユーザー</th>
                      <th className="text-left p-2">ルーム</th>
                      <th className="text-left p-2">メッセージ</th>
                      <th className="text-left p-2">ステータス</th>
                      <th className="text-left p-2">ブロック</th>
                      <th className="text-left p-2">時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chatMessages.map((message) => (
                      <tr key={message.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{message.user.nickname}</span>
                            <Badge variant="outline" className={getRoleColor(message.user.role)}>
                              {message.user.role}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-2">
                          <div>
                            <span className="font-medium">{message.room.name}</span>
                            <div className="text-xs text-gray-500">{message.room.atmosphere}</div>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="max-w-xs truncate">{message.content}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Type: {message.type}
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge className={getStatusColor(message.status)}>
                            {message.status}
                          </Badge>
                          {message.moderationReason && (
                            <div className="text-xs text-gray-500 mt-1">
                              {message.moderationReason}
                            </div>
                          )}
                        </td>
                        <td className="p-2">
                          {message.isBlocked ? (
                            <Badge className="bg-red-100 text-red-800">ブロック済み</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">正常</Badge>
                          )}
                        </td>
                        <td className="p-2 text-sm text-gray-600">
                          {format(new Date(message.createdAt), 'MM/dd HH:mm:ss')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {messagePagination.total} 件中 {((messagePagination.page - 1) * messagePagination.limit) + 1} - {Math.min(messagePagination.page * messagePagination.limit, messagePagination.total)} 件を表示
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMessagePageChange(messagePagination.page - 1)}
                    disabled={messagePagination.page === 1}
                  >
                    前へ
                  </Button>
                  <span className="text-sm">
                    {messagePagination.page} / {messagePagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMessagePageChange(messagePagination.page + 1)}
                    disabled={messagePagination.page === messagePagination.totalPages}
                  >
                    次へ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          {systemHealth && (
            <>
              {/* Database Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    データベース状態
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">接続状態</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className={`w-3 h-3 rounded-full ${systemHealth.database.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm">{systemHealth.database.status}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">接続タイプ</Label>
                      <div className="text-sm mt-1">{systemHealth.database.connection}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    システムメトリクス
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium">稼働時間</Label>
                      <div className="text-lg font-semibold text-blue-600 mt-1">
                        {formatUptime(systemHealth.system.uptime)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">メモリ使用量</Label>
                      <div className="text-lg font-semibold text-purple-600 mt-1">
                        {formatMemory(systemHealth.system.memoryUsage.heapUsed)}
                      </div>
                      <div className="text-xs text-gray-500">
                        / {formatMemory(systemHealth.system.memoryUsage.heapTotal)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">過去24時間のエラー</Label>
                      <div className="text-lg font-semibold text-red-600 mt-1">
                        {systemHealth.system.errors24h}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">モデレーション実行回数</Label>
                      <div className="text-lg font-semibold text-orange-600 mt-1">
                        {systemHealth.system.moderationActions24h}
                      </div>
                      <div className="text-xs text-gray-500">過去24時間</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Activity Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    ユーザー活動傾向
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label className="text-sm font-medium">総ユーザー数</Label>
                      <div className="text-2xl font-bold text-blue-600 mt-1">
                        {systemHealth.users.total}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">過去24時間アクティブ</Label>
                      <div className="text-2xl font-bold text-green-600 mt-1">
                        {systemHealth.users.active24h}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">アクティビティ率</Label>
                      <div className="text-2xl font-bold text-purple-600 mt-1">
                        {((systemHealth.users.active24h / systemHealth.users.total) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label className="text-sm font-medium mb-2 block">過去7日間の活動</Label>
                    <div className="grid grid-cols-7 gap-2">
                      {systemHealth.users.activityTrend.map((item, index) => (
                        <div key={index} className="text-center">
                          <div className="text-xs text-gray-600 mb-1">
                            {format(new Date(item.date), 'MM/dd')}
                          </div>
                          <div className="bg-blue-100 rounded p-2">
                            <div className="text-sm font-semibold text-blue-700">
                              {item.count}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    コンテンツ統計
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">投稿統計</Label>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">総投稿数</span>
                          <span className="font-semibold">{systemHealth.content.posts.total}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">過去24時間</span>
                          <span className="font-semibold text-green-600">{systemHealth.content.posts.last24h}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">メッセージ統計</Label>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">総メッセージ数</span>
                          <span className="font-semibold">{systemHealth.content.messages.total}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">過去24時間</span>
                          <span className="font-semibold text-green-600">{systemHealth.content.messages.last24h}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Label className="text-sm font-medium mb-2 block">モデレーション統計</Label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {systemHealth.content.moderationStats.map((stat, index) => (
                        <div key={index} className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-600">{stat.status}</div>
                          <div className="text-sm font-semibold">{stat._count.id}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
