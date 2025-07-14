"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download, TrendingUp, Users, MessageSquare, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AnalyticsData {
  userGrowth: Array<{ date: string; users: number; activeUsers: number }>
  contentStats: Array<{ date: string; posts: number; comments: number; messages: number }>
  revenueData: Array<{ date: string; revenue: number; femaleEarnings: number }>
  userDistribution: Array<{ role: string; count: number; color: string }>
  topPerformers: Array<{ id: string; name: string; earnings: number; followers: number }>
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
      toast({
        title: "エラー",
        description: "分析データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const exportData = async (format: string) => {
    try {
      const response = await fetch(`/api/admin/analytics/export?format=${format}&range=${timeRange}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `analytics_${timeRange}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "成功",
          description: "データをエクスポートしました",
        })
      }
    } catch (error) {
      console.error("Failed to export data:", error)
      toast({
        title: "エラー",
        description: "エクスポートに失敗しました",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">読み込み中...</div>
  }

  if (!data) {
    return <div className="flex justify-center items-center h-64">データが見つかりません</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">詳細分析</h1>
          <p className="text-gray-600 mt-2">システムの詳細な統計と分析データ</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7日間</SelectItem>
              <SelectItem value="30d">30日間</SelectItem>
              <SelectItem value="90d">90日間</SelectItem>
              <SelectItem value="1y">1年間</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportData("csv")}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => exportData("xlsx")}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総ユーザー数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.userGrowth[data.userGrowth.length - 1]?.users || 0}</div>
            <p className="text-xs text-muted-foreground">
              アクティブ: {data.userGrowth[data.userGrowth.length - 1]?.activeUsers || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総投稿数</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.contentStats.reduce((sum, item) => sum + item.posts, 0)}</div>
            <p className="text-xs text-muted-foreground">
              今月: {data.contentStats[data.contentStats.length - 1]?.posts || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総収益</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{data.revenueData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              今月: ¥{data.revenueData[data.revenueData.length - 1]?.revenue.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成長率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">前月比</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>ユーザー成長</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#8884d8" name="総ユーザー" />
                <Line type="monotone" dataKey="activeUsers" stroke="#82ca9d" name="アクティブユーザー" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Content Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>コンテンツ統計</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.contentStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="posts" fill="#8884d8" name="投稿" />
                <Bar dataKey="comments" fill="#82ca9d" name="コメント" />
                <Bar dataKey="messages" fill="#ffc658" name="メッセージ" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>収益推移</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`¥${Number(value).toLocaleString()}`, ""]} />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="総収益" />
                <Line type="monotone" dataKey="femaleEarnings" stroke="#82ca9d" name="女性収益" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>ユーザー分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.userDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ role, percent }) => `${role} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>トップパフォーマー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">順位</th>
                  <th className="text-left p-2">名前</th>
                  <th className="text-left p-2">収益</th>
                  <th className="text-left p-2">フォロワー数</th>
                  <th className="text-left p-2">成長率</th>
                </tr>
              </thead>
              <tbody>
                {data.topPerformers.map((performer, index) => (
                  <tr key={performer.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-bold">#{index + 1}</td>
                    <td className="p-2">{performer.name}</td>
                    <td className="p-2">¥{performer.earnings.toLocaleString()}</td>
                    <td className="p-2">{performer.followers.toLocaleString()}</td>
                    <td className="p-2">
                      <span className="text-green-600">+15.2%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
