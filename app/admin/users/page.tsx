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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
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
  Users, 
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Ban,
  Clock,
  Shield,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react"

interface User {
  id: string
  nickname: string
  email: string
  avatar?: string
  fullName?: string
  bio?: string
  age?: number
  location?: string
  phone?: string
  website?: string
  gender?: string
  occupation?: string
  interests?: string[]
  role: "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN"
  isActive: boolean
  isBlocked: boolean
  isSuspended: boolean
  suspendReason?: string
  createdAt: string
  lastLoginAt?: string
  lastActiveAt?: string
  stats: {
    postsCount: number
    commentsCount: number
    reportsCount: number
    adminActionsCount: number
  }
  permissions: {
    id: string
    name: string
    description: string
    category: string
    grantedAt: string
    expiresAt?: string
  }[]
}

interface UserFilters {
  search: string
  role: string
  status: string
  sortBy: string
  sortOrder: string
}

export default function UserManagement() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<UserFilters>({
    search: "",
    role: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  })

  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [showEditUser, setShowEditUser] = useState(false)
  const [showSuspendUser, setShowSuspendUser] = useState(false)
  const [showBlockUser, setShowBlockUser] = useState(false)

  // Form states
  const [suspendReason, setSuspendReason] = useState("")
  const [suspendDuration, setSuspendDuration] = useState("7")
  const [isPermanent, setIsPermanent] = useState(false)
  const [blockReason, setBlockReason] = useState("")
  const [editForm, setEditForm] = useState<Partial<User>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset states when component unmounts
  useEffect(() => {
    return () => {
      setIsSubmitting(false)
      setLoading(false)
    }
  }, [])

  // Function to reset all form states
  const resetAllStates = () => {
    setIsSubmitting(false)
    setError(null)
    setShowUserDetails(false)
    setShowEditUser(false)
    setShowSuspendUser(false)
    setShowBlockUser(false)
    setSelectedUser(null)
    setSuspendReason("")
    setSuspendDuration("7")
    setIsPermanent(false)
    setBlockReason("")
    setEditForm({})
  }

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (!["ADMIN", "MODERATOR", "SUPER_ADMIN"].includes(user.role)) {
      router.push("/")
      return
    }

    fetchUsers()
  }, [user, router, currentPage, filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build params object, filtering out empty values
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20"
      })

      // Only add filter params if they have values
      if (filters.search.trim()) params.append("search", filters.search)
      if (filters.role) params.append("role", filters.role)
      if (filters.status) params.append("status", filters.status)
      if (filters.sortBy) params.append("sortBy", filters.sortBy)
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder)

      const response = await api.get(`/admin/users?${params}`, {
        timeout: 10000
      })
      setUsers(response.data.users || [])
      setTotalPages(response.data.pagination?.pages || 1)
    } catch (error: any) {
      console.error("Failed to fetch users:", error)
      
      let errorMessage = "ユーザー一覧の読み込みに失敗しました"
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = "リクエストがタイムアウトしました。もう一度お試しください。"
      } else if (error.response?.status === 403) {
        errorMessage = "権限がありません"
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      }
      
      setError(errorMessage)
    } finally {
      setTimeout(() => setLoading(false), 100)
    }
  }

  const handleUserAction = async (action: string, userId: string, data?: any) => {
    if (isSubmitting) return
    
    try {
      setIsSubmitting(true)
      setError(null)
      
      let response
      switch (action) {
        case "suspend":
          response = await api.post(`/admin/users/${userId}/suspend`, {
            reason: suspendReason,
            duration: isPermanent ? undefined : parseInt(suspendDuration),
            permanent: isPermanent
          }, { timeout: 8000 })
          break
        case "unsuspend":
          response = await api.post(`/admin/users/${userId}/unsuspend`, {}, { timeout: 8000 })
          break
        case "block":
          response = await api.post(`/admin/users/${userId}/block`, {
            reason: blockReason
          }, { timeout: 8000 })
          break
        case "unblock":
          response = await api.post(`/admin/users/${userId}/unblock`, {}, { timeout: 8000 })
          break
        case "update":
          response = await api.put(`/admin/users/${userId}`, data, { timeout: 8000 })
          break
        case "delete":
          if (confirm("本当にこのユーザーを削除しますか？この操作は取り消せません。")) {
            response = await api.delete(`/admin/users/${userId}`, { timeout: 8000 })
          }
          break
      }

      if (response) {
        await fetchUsers()
        // Close modals and reset states
        resetAllStates()
      }
    } catch (error: any) {
      console.error(`Failed to ${action} user:`, error)
      
      let errorMessage = `ユーザーの${action}に失敗しました`
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = "リクエストがタイムアウトしました。もう一度お試しください。"
      } else if (error.response?.status === 404) {
        errorMessage = "ユーザーが見つかりません"
      } else if (error.response?.status === 403) {
        errorMessage = "権限がありません"
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      }
      
      setError(errorMessage)
    } finally {
      setTimeout(() => setIsSubmitting(false), 100)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN": return "bg-red-100 text-red-800"
      case "ADMIN": return "bg-purple-100 text-purple-800"
      case "MODERATOR": return "bg-blue-100 text-blue-800"
      case "USER": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (user: User) => {
    if (user.isBlocked) return "bg-red-100 text-red-800"
    if (user.isSuspended) return "bg-yellow-100 text-yellow-800"
    if (user.isActive) return "bg-green-100 text-green-800"
    return "bg-gray-100 text-gray-800"
  }

  const getStatusText = (user: User) => {
    if (user.isBlocked) return "ブロック済み"
    if (user.isSuspended) return "停止中"
    if (user.isActive) return "アクティブ"
    return "非アクティブ"
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "なし"
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex space-x-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ユーザー管理</h1>
            <p className="text-gray-600 mt-2">
              ユーザーアカウントの管理と監視
            </p>
          </div>
          <Button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              fetchUsers()
            }} 
            variant="outline" 
            size="sm"
            disabled={loading || isSubmitting}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            更新
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
          <Button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setError(null)
              fetchUsers()
            }} 
            className="mt-2"
            size="sm"
            disabled={loading || isSubmitting}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            再試行
          </Button>
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>フィルター</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">検索</Label>
              <Input
                id="search"
                placeholder="ニックネーム、メール、名前"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="role">役割</Label>
              <Select value={filters.role || "all"} onValueChange={(value) => setFilters({ ...filters, role: value === "all" ? "" : value })}>
                <SelectTrigger>
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="USER">ユーザー</SelectItem>
                  <SelectItem value="MODERATOR">モデレーター</SelectItem>
                  <SelectItem value="ADMIN">管理者</SelectItem>
                  <SelectItem value="SUPER_ADMIN">スーパー管理者</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">状態</Label>
              <Select value={filters.status || "all"} onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? "" : value })}>
                <SelectTrigger>
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="active">アクティブ</SelectItem>
                  <SelectItem value="inactive">非アクティブ</SelectItem>
                  <SelectItem value="suspended">停止中</SelectItem>
                  <SelectItem value="blocked">ブロック済み</SelectItem>
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
                  <SelectItem value="createdAt">作成日</SelectItem>
                  <SelectItem value="lastLoginAt">最終ログイン</SelectItem>
                  <SelectItem value="nickname">ニックネーム</SelectItem>
                  <SelectItem value="email">メール</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sortOrder">順序</Label>
              <Select value={filters.sortOrder} onValueChange={(value) => setFilters({ ...filters, sortOrder: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">降順</SelectItem>
                  <SelectItem value="asc">昇順</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>ユーザー一覧</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ユーザー</TableHead>
                  <TableHead>役割</TableHead>
                  <TableHead>状態</TableHead>
                  <TableHead>活動統計</TableHead>
                  <TableHead>最終ログイン</TableHead>
                  <TableHead>作成日</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar ? user.avatar : "/images/avatar/default.png"} alt={user.nickname} />
                          <AvatarFallback>{user.nickname.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.nickname}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.fullName && (
                            <div className="text-xs text-gray-400">{user.fullName}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user)}>
                        {getStatusText(user)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>投稿: {user.stats.postsCount}</div>
                        <div>コメント: {user.stats.commentsCount}</div>
                        {user.stats.reportsCount > 0 && (
                          <div className="text-red-600">報告: {user.stats.reportsCount}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(user.lastLoginAt)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(user.createdAt)}</div>
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
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setSelectedUser(user)
                              setShowUserDetails(true)
                            }}
                            disabled={isSubmitting}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            詳細表示
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setSelectedUser(user)
                              setEditForm(user)
                              setShowEditUser(true)
                            }}
                            disabled={isSubmitting}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            編集
                          </DropdownMenuItem>
                          {user.isSuspended ? (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleUserAction("unsuspend", user.id)
                              }}
                              disabled={isSubmitting}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              停止解除
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setSelectedUser(user)
                                setShowSuspendUser(true)
                              }}
                              disabled={isSubmitting}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              停止
                            </DropdownMenuItem>
                          )}
                          {user.isBlocked ? (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleUserAction("unblock", user.id)
                              }}
                              disabled={isSubmitting}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              ブロック解除
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setSelectedUser(user)
                                setShowBlockUser(true)
                              }}
                              disabled={isSubmitting}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              ブロック
                            </DropdownMenuItem>
                          )}
                          {user.role === "USER" && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleUserAction("delete", user.id)
                              }}
                              disabled={isSubmitting}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              削除
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              ページ {currentPage} / {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setCurrentPage(Math.max(1, currentPage - 1))
                }}
                disabled={currentPage === 1 || loading || isSubmitting}
              >
                前へ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }}
                disabled={currentPage === totalPages || loading || isSubmitting}
              >
                次へ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <Dialog open={showUserDetails} onOpenChange={(open) => {
          setShowUserDetails(open)
          if (!open) {
            setError(null)
            setSelectedUser(null)
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>ユーザー詳細</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar ? selectedUser.avatar : "/images/avatar/default.png"} alt={selectedUser.nickname} />
                  <AvatarFallback>{selectedUser.nickname.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.nickname}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getRoleColor(selectedUser.role)}>
                      {selectedUser.role}
                    </Badge>
                    <Badge className={getStatusColor(selectedUser)}>
                      {getStatusText(selectedUser)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">基本情報</h4>
                  <div className="space-y-1 text-sm">
                    {selectedUser.fullName && <p>名前: {selectedUser.fullName}</p>}
                    {selectedUser.age && <p>年齢: {selectedUser.age}</p>}
                    {selectedUser.gender && <p>性別: {selectedUser.gender}</p>}
                    {selectedUser.location && <p>住所: {selectedUser.location}</p>}
                    {selectedUser.occupation && <p>職業: {selectedUser.occupation}</p>}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">活動統計</h4>
                  <div className="space-y-1 text-sm">
                    <p>投稿数: {selectedUser.stats.postsCount}</p>
                    <p>コメント数: {selectedUser.stats.commentsCount}</p>
                    <p>報告数: {selectedUser.stats.reportsCount}</p>
                    <p>作成日: {formatDate(selectedUser.createdAt)}</p>
                    <p>最終ログイン: {formatDate(selectedUser.lastLoginAt)}</p>
                  </div>
                </div>
              </div>

              {selectedUser.bio && (
                <div>
                  <h4 className="font-medium mb-2">自己紹介</h4>
                  <p className="text-sm text-gray-600">{selectedUser.bio}</p>
                </div>
              )}

              {selectedUser.interests && selectedUser.interests.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">興味・関心</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.interests.map((interest, index) => (
                      <Badge key={index} variant="outline">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedUser.permissions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">権限</h4>
                  <div className="space-y-1 text-sm">
                    {selectedUser.permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between">
                        <span>{permission.name}</span>
                        <Badge variant="outline">{permission.category}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Suspend User Modal */}
      {selectedUser && (
        <Dialog open={showSuspendUser} onOpenChange={(open) => {
          setShowSuspendUser(open)
          if (!open) {
            setError(null)
            setIsSubmitting(false)
            setSuspendReason("")
            setSuspendDuration("7")
            setIsPermanent(false)
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ユーザー停止</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                ユーザー「{selectedUser.nickname}」を停止しますか？
              </p>
              <div>
                <Label htmlFor="suspendReason">停止理由</Label>
                <Textarea
                  id="suspendReason"
                  placeholder="停止理由を入力してください"
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label htmlFor="suspendDuration">停止期間（日数）</Label>
                  <Input
                    id="suspendDuration"
                    type="number"
                    value={suspendDuration}
                    onChange={(e) => setSuspendDuration(e.target.value)}
                    disabled={isPermanent}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="permanent"
                    checked={isPermanent}
                    onChange={(e) => setIsPermanent(e.target.checked)}
                  />
                  <Label htmlFor="permanent">永久停止</Label>
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowSuspendUser(false)
                  }}
                  disabled={isSubmitting}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleUserAction("suspend", selectedUser.id)
                  }}
                  disabled={!suspendReason || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      停止中...
                    </>
                  ) : (
                    '停止'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Block User Modal */}
      {selectedUser && (
        <Dialog open={showBlockUser} onOpenChange={(open) => {
          setShowBlockUser(open)
          if (!open) {
            setError(null)
            setIsSubmitting(false)
            setBlockReason("")
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ユーザーブロック</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                ユーザー「{selectedUser.nickname}」をブロックしますか？
              </p>
              <div>
                <Label htmlFor="blockReason">ブロック理由</Label>
                <Textarea
                  id="blockReason"
                  placeholder="ブロック理由を入力してください"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                />
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowBlockUser(false)
                  }}
                  disabled={isSubmitting}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleUserAction("block", selectedUser.id)
                  }}
                  disabled={!blockReason || isSubmitting}
                  variant="destructive"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ブロック中...
                    </>
                  ) : (
                    'ブロック'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 