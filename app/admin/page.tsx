"use client"

<<<<<<< HEAD
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, MessageSquare, AlertTriangle, TrendingUp, Activity } from "lucide-react"

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalPosts: number
  pendingPosts: number
  totalMessages: number
  blockedMessages: number
  totalReports: number
  pendingReports: number
  onlineUsers: number
  activeRooms: number
}

interface RecentActivity {
  id: string
  type: string
  description: string
  timestamp: string
  status: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        fetch("/api/admin/dashboard/stats"),
        fetch("/api/admin/dashboard/activity"),
      ])

      if (statsRes.ok && activityRes.ok) {
        const statsData = await statsRes.json()
        const activityData = await activityRes.json()
        setStats(statsData)
        setRecentActivity(activityData.activities)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
=======
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import api from "@/api/axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Users, 
  FileText, 
  MessageSquare, 
  AlertTriangle,
  Settings,
  TrendingUp,
  Shield,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw
} from "lucide-react"
import {AgCharts} from "ag-charts-react"

interface DashboardStats {
  users: {
    total: number
    active: number
    suspended: number
    registrationTrend: { createdAt: string; _count: { id: number } }[]
  }
  content: {
    posts: {
      total: number
      pending: number
      statusBreakdown: { status: string; _count: { id: number } }[]
    }
    comments: number
    chatRooms: number
    messages: number
  }
  moderation: {
    reports: {
      total: number
      pending: number
    }
  }
  recentActivities: {
    id: string
    userId: string
    action: string
    details: any
    createdAt: string
  }[]
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Reset loading state when component unmounts
  useEffect(() => {
    return () => {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Check if user is admin
    if (!user) {
      router.push("/")
      return
    }

    if (!["ADMIN", "MODERATOR", "SUPER_ADMIN"].includes(user.role)) {
      router.push("/")
      return
    }

    fetchDashboardData()
  }, [user, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get("/admin/dashboard", {
        timeout: 10000 // 10 second timeout
      })
      setStats(response.data.stats)
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error)
      
      let errorMessage = "ダッシュボードデータの読み込みに失敗しました"
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = "リクエストがタイムアウトしました。もう一度お試しください。"
      } else if (error.response?.status === 403) {
        errorMessage = "権限がありません"
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      }
      
      setError(errorMessage)
    } finally {
      // Ensure state is always reset
      setTimeout(() => setLoading(false), 100)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "REJECTED": return "bg-red-100 text-red-800"
      case "FLAGGED": return "bg-orange-100 text-orange-800"
      case "HIDDEN": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "login": return <UserCheck className="h-4 w-4" />
      case "logout": return <UserX className="h-4 w-4" />
      case "page_view": return <Eye className="h-4 w-4" />
      case "post_created": return <FileText className="h-4 w-4" />
      case "comment_added": return <MessageSquare className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
    }
  }

  if (loading) {
<<<<<<< HEAD
    return <div className="flex justify-center items-center h-64">読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">管理者ダッシュボード</h1>
        <p className="text-gray-600 mt-2">システム全体の状況を確認できます</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
=======
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button 
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            fetchDashboardData()
          }} 
          className="mt-4"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          再試行
        </Button>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              管理者ダッシュボード
            </h1>
            <p className="text-gray-600 mt-2">
              システムの状態とユーザー活動を監視
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-sm">
              <Shield className="h-4 w-4 mr-1" />
              {user?.role}
            </Badge>
            <Button 
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                fetchDashboardData()
              }} 
              variant="outline" 
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              更新
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総ユーザー数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
<<<<<<< HEAD
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">アクティブ: {stats?.activeUsers || 0}</p>
=======
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">
                {stats.users.active} アクティブ
              </span>
              {stats.users.suspended > 0 && (
                <span className="text-red-600 ml-2">
                  {stats.users.suspended} 停止中
                </span>
              )}
            </div>
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">投稿数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
<<<<<<< HEAD
            <div className="text-2xl font-bold">{stats?.totalPosts || 0}</div>
            <p className="text-xs text-muted-foreground">承認待ち: {stats?.pendingPosts || 0}</p>
=======
            <div className="text-2xl font-bold">{stats.content.posts.total}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.content.posts.pending > 0 && (
                <span className="text-yellow-600">
                  {stats.content.posts.pending} 承認待ち
                </span>
              )}
            </div>
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">メッセージ数</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
<<<<<<< HEAD
            <div className="text-2xl font-bold">{stats?.totalMessages || 0}</div>
            <p className="text-xs text-muted-foreground">ブロック済み: {stats?.blockedMessages || 0}</p>
=======
            <div className="text-2xl font-bold">{stats.content.messages}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.content.chatRooms} チャットルーム
            </div>
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">報告数</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
<<<<<<< HEAD
            <div className="text-2xl font-bold">{stats?.totalReports || 0}</div>
            <p className="text-xs text-muted-foreground">未処理: {stats?.pendingReports || 0}</p>
=======
            <div className="text-2xl font-bold">{stats.moderation.reports.total}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.moderation.reports.pending > 0 && (
                <span className="text-red-600">
                  {stats.moderation.reports.pending} 未対応
                </span>
              )}
            </div>
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
          </CardContent>
        </Card>
      </div>

<<<<<<< HEAD
      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              リアルタイム統計
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">オンラインユーザー</span>
                <Badge variant="secondary">{stats?.onlineUsers || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">アクティブルーム</span>
                <Badge variant="secondary">{stats?.activeRooms || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              最近のアクティビティ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                  <Badge variant={activity.status === "completed" ? "default" : "secondary"}>{activity.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
=======
      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="users">ユーザー</TabsTrigger>
          <TabsTrigger value="content">コンテンツ</TabsTrigger>
          <TabsTrigger value="reports">報告</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>コンテンツ状態</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.content.posts.statusBreakdown.map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <span className="text-sm">{item._count.id} 件</span>
                      </div>
                      <div className="w-24">
                        <Progress 
                          value={(item._count.id / stats.content.posts.total) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>最近の活動</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentActivities.slice(0, 6).map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>ユーザー状態分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <AgCharts
                    options={{
                      data: [
                        {
                          category: 'アクティブ',
                          value: stats.users.active,
                          color: '#10b981'
                        },
                        {
                          category: '非アクティブ',
                          value: stats.users.total - stats.users.active - stats.users.suspended,
                          color: '#6b7280'
                        },
                        {
                          category: '停止中',
                          value: stats.users.suspended,
                          color: '#ef4444'
                        }
                      ],
                      series: [{
                        type: 'donut' as const,
                        angleKey: 'value',
                        innerRadiusRatio: 0.6,
                        fills: ['#10b981', '#6b7280', '#ef4444'],
                        strokes: ['#ffffff', '#ffffff', '#ffffff'],
                        strokeWidth: 2,
                        calloutLabelKey: 'category',
                        sectorLabelKey: 'value',
                        calloutLabel: {
                          enabled: true,
                          fontSize: 12,
                          color: '#374151'
                        },
                        sectorLabel: {
                          enabled: true,
                          fontSize: 14,
                          fontWeight: 'bold',
                          color: '#ffffff',
                          formatter: ({ value }: any) => `${value}`
                        },
                        tooltip: {
                          renderer: ({ datum }: any) => ({
                            content: `${datum.category}: ${datum.value}人 (${((datum.value / stats.users.total) * 100).toFixed(1)}%)`
                          })
                        },
                        shadow: {
                          enabled: true,
                          color: 'rgba(0, 0, 0, 0.1)',
                          xOffset: 0,
                          yOffset: 2,
                          blur: 4
                        }
                      }],
                      background: {
                        fill: 'transparent'
                      },
                      legend: {
                        enabled: true,
                        position: 'bottom' as const,
                        spacing: 20,
                        item: {
                          label: {
                            fontSize: 12,
                            color: '#374151'
                          },
                          marker: {
                            size: 12
                          }
                        }
                      }
                    } as any}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ユーザー統計詳細</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stats.users.total}</div>
                    <div className="text-sm text-gray-600">総ユーザー数</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-800">アクティブユーザー</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{stats.users.active}</div>
                        <div className="text-xs text-green-600">
                          {((stats.users.active / stats.users.total) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-800">非アクティブユーザー</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-600">{stats.users.total - stats.users.active - stats.users.suspended}</div>
                        <div className="text-xs text-gray-600">
                          {(((stats.users.total - stats.users.active - stats.users.suspended) / stats.users.total) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-red-800">停止中ユーザー</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">{stats.users.suspended}</div>
                        <div className="text-xs text-red-600">
                          {((stats.users.suspended / stats.users.total) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>ユーザー登録傾向</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <AgCharts
                    options={{
                      data: stats.users.registrationTrend.map(item => ({
                        date: new Date(item.createdAt).toLocaleDateString('ja-JP', { 
                          month: 'short', 
                          day: 'numeric' 
                        }),
                        registrations: item._count.id,
                        fullDate: item.createdAt
                      })),
                                              series: [{
                          type: 'area' as const,
                          xKey: 'date',
                          yKey: 'registrations',
                          fill: '#3b82f6',
                          fillOpacity: 0.1,
                          stroke: '#3b82f6',
                          strokeWidth: 2,
                          marker: {
                            fill: '#3b82f6',
                            stroke: '#ffffff',
                            strokeWidth: 2,
                            size: 5,
                          },
                          shadow: {
                            enabled: true,
                            color: 'rgba(59, 130, 246, 0.3)',
                            xOffset: 0,
                            yOffset: 2,
                            blur: 4
                          }
                        }],
                      axes: [
                        {
                          type: 'category' as const,
                          position: 'bottom' as const,
                          title: {
                            text: '日付'
                          },
                          label: {
                            rotation: 45
                          }
                        },
                        {
                          type: 'number' as const,
                          position: 'left' as const,
                          title: {
                            text: '登録者数'
                          },
                          label: {
                            formatter: ({ value }: any) => `${value}人`
                          }
                        }
                      ],
                      background: {
                        fill: 'transparent'
                      },
                      legend: {
                        enabled: false
                      }
                    } as any}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>コンテンツ統計</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">総投稿数</span>
                    <span className="font-semibold">{stats.content.posts.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">承認待ち</span>
                    <span className="font-semibold text-yellow-600">{stats.content.posts.pending}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">コメント数</span>
                    <span className="font-semibold">{stats.content.comments}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">チャットメッセージ</span>
                    <span className="font-semibold">{stats.content.messages}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>クイックアクション</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => router.push("/admin/posts")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    投稿管理
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => router.push("/admin/users")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    ユーザー管理
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => router.push("/admin/reports")}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    報告管理
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => router.push("/admin/settings")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    システム設定
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>報告統計</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">総報告数</span>
                    <span className="font-semibold">{stats.moderation.reports.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">未対応</span>
                    <span className="font-semibold text-red-600">{stats.moderation.reports.pending}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">対応済み</span>
                    <span className="font-semibold text-green-600">
                      {stats.moderation.reports.total - stats.moderation.reports.pending}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>モデレーション</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => router.push("/admin/reports")}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    報告を確認
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => router.push("/admin/moderation")}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    モデレーション履歴
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
