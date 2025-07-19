"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import api from "@/api/axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  AlertTriangle, 
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  TrendingUp,
  AlertCircle,
  ShieldAlert,
  MessageSquare,
  RefreshCw,
  Users,
  FileText,
  Bug,
  Flag,
  Zap,
  UserCheck,
  Target,
  PieChart,
  BarChart3
} from "lucide-react"

interface Report {
  id: string
  type: string
  description?: string
  status: "pending" | "reviewed" | "resolved" | "dismissed"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  targetType?: string
  targetId?: string
  assignedTo?: string
  resolvedBy?: string
  resolvedAt?: string
  resolution?: string
  createdAt: string
  updatedAt: string
  reporter: {
    id: string
    nickname: string
    email: string
    role: string
  }
}

interface ReportFilters {
  search: string
  status: string
  type: string
  priority: string
  sortBy: string
  sortOrder: string
}

interface ReportStats {
  overview: {
    total: number
    pending: number
    resolved: number
    resolutionRate: string
  }
  timeframes: {
    last24h: number
    last7d: number
    last30d: number
  }
  breakdown: {
    byType: { type: string; _count: { id: number } }[]
    byPriority: { priority: string; _count: { id: number } }[]
    byStatus: { status: string; _count: { id: number } }[]
  }
}

export default function AdminReportsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<ReportFilters>({
    search: "",
    status: "all",
    type: "all",
    priority: "all",
    sortBy: "createdAt",
    sortOrder: "desc"
  })

  // Modal states
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showReportDetails, setShowReportDetails] = useState(false)
  const [showUpdateStatus, setShowUpdateStatus] = useState(false)
  const [showDeleteReport, setShowDeleteReport] = useState(false)
  const [showAssignReport, setShowAssignReport] = useState(false)

  // Form states
  const [updateForm, setUpdateForm] = useState({
    status: "",
    priority: "",
    resolution: "",
    notes: ""
  })
  const [assignForm, setAssignForm] = useState({
    assignedTo: ""
  })
  const [availableAdmins, setAvailableAdmins] = useState<any[]>([])

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (!["ADMIN", "MODERATOR", "SUPER_ADMIN"].includes(user.role)) {
      router.push("/")
      return
    }

    if (activeTab === "overview") {
      fetchStats()
    } else if (activeTab === "reports") {
      fetchReports()
    }
  }, [user, router, activeTab, currentPage, filters])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get("/admin/reports/stats")
      setStats(response.data.stats)
    } catch (error: any) {
      console.error("Failed to fetch report stats:", error)
      setError(error.response?.data?.error || "Failed to load report statistics")
    } finally {
      setLoading(false)
    }
  }

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(filters.search && { search: filters.search }),
        ...(filters.status && filters.status !== "all" && { status: filters.status }),
        ...(filters.type && filters.type !== "all" && { type: filters.type }),
        ...(filters.priority && filters.priority !== "all" && { priority: filters.priority }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      })

      const response = await api.get(`/admin/reports?${params}`)
      setReports(response.data.reports)
      setTotalPages(response.data.pagination.pages)
    } catch (error: any) {
      console.error("Failed to fetch reports:", error)
      setError(error.response?.data?.error || "Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableAdmins = async () => {
    try {
      const response = await api.get("/admin/users?role=ADMIN&role=MODERATOR&role=SUPER_ADMIN&limit=100")
      setAvailableAdmins(response.data.users || [])
    } catch (error) {
      console.error("Failed to fetch available admins:", error)
    }
  }

  const handleUpdateReport = async () => {
    if (!selectedReport) return

    try {
      const response = await api.put(`/admin/reports/${selectedReport.id}`, updateForm)
      
      // Update the report in the list
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === selectedReport.id ? response.data.report : report
        )
      )
      
      setShowUpdateStatus(false)
      setUpdateForm({ status: "", priority: "", resolution: "", notes: "" })
      setSelectedReport(null)
      
      // Refresh stats if we're on overview tab
      if (activeTab === "overview") {
        fetchStats()
      }
    } catch (error: any) {
      console.error("Failed to update report:", error)
      setError(error.response?.data?.error || "Failed to update report")
    }
  }

  const handleDeleteReport = async () => {
    if (!selectedReport) return

    try {
      await api.delete(`/admin/reports/${selectedReport.id}`)
      
      // Remove from list
      setReports(prevReports => 
        prevReports.filter(report => report.id !== selectedReport.id)
      )
      
      setShowDeleteReport(false)
      setSelectedReport(null)
      
      // Refresh stats
      if (activeTab === "overview") {
        fetchStats()
      }
    } catch (error: any) {
      console.error("Failed to delete report:", error)
      setError(error.response?.data?.error || "Failed to delete report")
    }
  }

  const handleAssignReport = async () => {
    if (!selectedReport) return

    try {
      const response = await api.post(`/admin/reports/${selectedReport.id}/assign`, assignForm)
      
      // Update the report in the list
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === selectedReport.id ? response.data.report : report
        )
      )
      
      setShowAssignReport(false)
      setAssignForm({ assignedTo: "" })
      setSelectedReport(null)
    } catch (error: any) {
      console.error("Failed to assign report:", error)
      setError(error.response?.data?.error || "Failed to assign report")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      reviewed: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      dismissed: "bg-gray-100 text-gray-800"
    }
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  const getPriorityBadge = (priority: string) => {
    const variants = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      HIGH: "bg-orange-100 text-orange-800",
      URGENT: "bg-red-100 text-red-800"
    }
    return variants[priority as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "technical": return Bug
      case "inappropriate": return ShieldAlert
      case "spam": return Flag
      case "other": return MessageSquare
      default: return AlertTriangle
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

  if (loading && !stats && !reports.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
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
        <Button onClick={() => {
          if (activeTab === "overview") fetchStats()
          else fetchReports()
        }} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          再試行
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              報告管理
            </h1>
            <p className="text-gray-600 mt-2">
              ユーザーからの報告を管理・対応
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => {
              if (activeTab === "overview") fetchStats()
              else fetchReports()
            }} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              更新
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">概要・統計</TabsTrigger>
          <TabsTrigger value="reports">報告一覧</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {stats && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">総報告数</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.overview.total}</div>
                    <p className="text-xs text-muted-foreground">
                      解決率: {stats.overview.resolutionRate}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">未対応</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{stats.overview.pending}</div>
                    <p className="text-xs text-muted-foreground">
                      対応が必要
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">解決済み</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.overview.resolved}</div>
                    <p className="text-xs text-muted-foreground">
                      完了した報告
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">24時間以内</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.timeframes.last24h}</div>
                    <p className="text-xs text-muted-foreground">
                      新しい報告
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Type Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-5 w-5" />
                      <span>報告タイプ別</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.breakdown.byType.map((item) => (
                        <div key={item.type} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm capitalize">{item.type}</span>
                          </div>
                          <span className="font-semibold">{item._count.id}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Priority Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>優先度別</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.breakdown.byPriority.map((item) => (
                        <div key={item.priority} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityBadge(item.priority)}>
                              {item.priority}
                            </Badge>
                          </div>
                          <span className="font-semibold">{item._count.id}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Status Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>ステータス別</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.breakdown.byStatus.map((item) => (
                        <div key={item.status} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusBadge(item.status)}>
                              {item.status}
                            </Badge>
                          </div>
                          <span className="font-semibold">{item._count.id}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Time Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>期間別統計</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.timeframes.last24h}</div>
                      <p className="text-sm text-gray-600">24時間以内</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.timeframes.last7d}</div>
                      <p className="text-sm text-gray-600">7日以内</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{stats.timeframes.last30d}</div>
                      <p className="text-sm text-gray-600">30日以内</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Reports List Tab */}
        <TabsContent value="reports" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>フィルター</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="search">検索</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="報告内容で検索..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">ステータス</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="全て" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全て</SelectItem>
                      <SelectItem value="pending">未対応</SelectItem>
                      <SelectItem value="reviewed">確認中</SelectItem>
                      <SelectItem value="resolved">解決済み</SelectItem>
                      <SelectItem value="dismissed">却下</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">タイプ</Label>
                  <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="全て" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全て</SelectItem>
                      <SelectItem value="technical">技術的問題</SelectItem>
                      <SelectItem value="inappropriate">不適切なコンテンツ</SelectItem>
                      <SelectItem value="spam">スパム</SelectItem>
                      <SelectItem value="other">その他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">優先度</Label>
                  <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="全て" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全て</SelectItem>
                      <SelectItem value="LOW">低</SelectItem>
                      <SelectItem value="MEDIUM">中</SelectItem>
                      <SelectItem value="HIGH">高</SelectItem>
                      <SelectItem value="URGENT">緊急</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sortBy">並び順</Label>
                  <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">作成日時</SelectItem>
                      <SelectItem value="updatedAt">更新日時</SelectItem>
                      <SelectItem value="priority">優先度</SelectItem>
                      <SelectItem value="status">ステータス</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>報告一覧</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>条件に一致する報告がありません</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>タイプ</TableHead>
                        <TableHead>ステータス</TableHead>
                        <TableHead>優先度</TableHead>
                        <TableHead>報告者</TableHead>
                        <TableHead>作成日時</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => {
                        const TypeIcon = getTypeIcon(report.type)
                        return (
                          <TableRow key={report.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <TypeIcon className="h-4 w-4" />
                                <span className="capitalize">{report.type}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusBadge(report.status)}>
                                {report.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPriorityBadge(report.priority)}>
                                {report.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>{report.reporter.nickname}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(report.createdAt)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedReport(report)
                                      setShowReportDetails(true)
                                    }}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    詳細表示
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedReport(report)
                                      setUpdateForm({
                                        status: report.status,
                                        priority: report.priority,
                                        resolution: report.resolution || "",
                                        notes: ""
                                      })
                                      setShowUpdateStatus(true)
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    ステータス更新
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedReport(report)
                                      fetchAvailableAdmins()
                                      setShowAssignReport(true)
                                    }}
                                  >
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    担当者割り当て
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedReport(report)
                                      setShowDeleteReport(true)
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    削除
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between space-x-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    前へ
                  </Button>
                  <span className="text-sm text-gray-600">
                    {currentPage} / {totalPages} ページ
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    次へ
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Details Modal */}
      <Dialog open={showReportDetails} onOpenChange={setShowReportDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>報告詳細</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>タイプ</Label>
                  <p className="capitalize">{selectedReport.type}</p>
                </div>
                <div>
                  <Label>ステータス</Label>
                  <Badge className={getStatusBadge(selectedReport.status)}>
                    {selectedReport.status}
                  </Badge>
                </div>
                <div>
                  <Label>優先度</Label>
                  <Badge className={getPriorityBadge(selectedReport.priority)}>
                    {selectedReport.priority}
                  </Badge>
                </div>
                <div>
                  <Label>報告者</Label>
                  <p>{selectedReport.reporter.nickname} ({selectedReport.reporter.role})</p>
                </div>
                <div>
                  <Label>作成日時</Label>
                  <p>{formatDate(selectedReport.createdAt)}</p>
                </div>
                <div>
                  <Label>更新日時</Label>
                  <p>{formatDate(selectedReport.updatedAt)}</p>
                </div>
              </div>
              
              <div>
                <Label>報告内容</Label>
                <p className="mt-1 p-3 bg-gray-50 rounded-md">
                  {selectedReport.description || "詳細な説明がありません"}
                </p>
              </div>

              {selectedReport.resolution && (
                <div>
                  <Label>解決内容</Label>
                  <p className="mt-1 p-3 bg-green-50 rounded-md">
                    {selectedReport.resolution}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Modal */}
      <Dialog open={showUpdateStatus} onOpenChange={setShowUpdateStatus}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ステータス更新</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="updateStatus">ステータス</Label>
              <Select value={updateForm.status} onValueChange={(value) => setUpdateForm({ ...updateForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">未対応</SelectItem>
                  <SelectItem value="reviewed">確認中</SelectItem>
                  <SelectItem value="resolved">解決済み</SelectItem>
                  <SelectItem value="dismissed">却下</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="updatePriority">優先度</Label>
              <Select value={updateForm.priority} onValueChange={(value) => setUpdateForm({ ...updateForm, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">低</SelectItem>
                  <SelectItem value="MEDIUM">中</SelectItem>
                  <SelectItem value="HIGH">高</SelectItem>
                  <SelectItem value="URGENT">緊急</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="resolution">解決内容</Label>
              <Textarea
                id="resolution"
                placeholder="問題の解決方法や対応内容を入力..."
                value={updateForm.resolution}
                onChange={(e) => setUpdateForm({ ...updateForm, resolution: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="notes">メモ</Label>
              <Textarea
                id="notes"
                placeholder="内部用のメモや備考..."
                value={updateForm.notes}
                onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleUpdateReport} className="flex-1">
                更新
              </Button>
              <Button variant="outline" onClick={() => setShowUpdateStatus(false)} className="flex-1">
                キャンセル
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Report Modal */}
      <Dialog open={showAssignReport} onOpenChange={setShowAssignReport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>担当者割り当て</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="assignedTo">担当者</Label>
              <Select value={assignForm.assignedTo} onValueChange={(value) => setAssignForm({ ...assignForm, assignedTo: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="担当者を選択..." />
                </SelectTrigger>
                <SelectContent>
                  {availableAdmins.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.nickname} ({admin.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleAssignReport} className="flex-1">
                割り当て
              </Button>
              <Button variant="outline" onClick={() => setShowAssignReport(false)} className="flex-1">
                キャンセル
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteReport} onOpenChange={setShowDeleteReport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>報告削除の確認</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                この報告を削除すると、元に戻すことはできません。本当に削除しますか？
              </AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button variant="destructive" onClick={handleDeleteReport} className="flex-1">
                削除
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteReport(false)} className="flex-1">
                キャンセル
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 