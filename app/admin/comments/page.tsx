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
  MessageSquare, 
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Calendar,
  User,
  FileText,
  EyeOff
} from "lucide-react"

interface Comment {
  id: string
  content: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" | "HIDDEN"
  createdAt: string
  updatedAt: string
  moderationReason?: string
  moderatedAt?: string
  moderatedBy?: string
  isBlocked: boolean
  author: {
    id: string
    nickname: string
    email: string
  }
  post: {
    id: string
    title: string
  }
}

interface CommentFilters {
  search: string
  status: string
  sortBy: string
  sortOrder: string
}

export default function AdminCommentsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<CommentFilters>({
    search: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  })

  // Modal states
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [showEditComment, setShowEditComment] = useState(false)
  const [showDeleteComment, setShowDeleteComment] = useState(false)
  const [showModerationDialog, setShowModerationDialog] = useState(false)

  // Form states
  const [editContent, setEditContent] = useState("")
  const [moderationStatus, setModerationStatus] = useState("")
  const [moderationReason, setModerationReason] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (!["ADMIN", "MODERATOR", "SUPER_ADMIN"].includes(user.role)) {
      router.push("/")
      return
    }

    fetchComments()
  }, [user, router, currentPage, filters])

  const fetchComments = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      })

      const response = await api.get(`/admin/comments?${params}`)
      setComments(response.data.comments)
      setTotalPages(response.data.pagination.pages)
    } catch (error: any) {
      console.error("Failed to fetch comments:", error)
      setError(error.response?.data?.error || "Failed to load comments")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof CommentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleEditComment = (comment: Comment) => {
    setSelectedComment(comment)
    setEditContent(comment.content)
    setShowEditComment(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedComment) return

    try {
      await api.put(`/admin/comments/${selectedComment.id}`, {
        content: editContent
      })
      setShowEditComment(false)
      setSelectedComment(null)
      setEditContent("")
      await fetchComments()
    } catch (error: any) {
      console.error("Failed to update comment:", error)
      setError(error.response?.data?.error || "Failed to update comment")
    }
  }

  const handleDeleteComment = async () => {
    if (!selectedComment) return

    try {
      await api.delete(`/admin/comments/${selectedComment.id}`)
      setShowDeleteComment(false)
      setSelectedComment(null)
      await fetchComments()
    } catch (error: any) {
      console.error("Failed to delete comment:", error)
      setError(error.response?.data?.error || "Failed to delete comment")
    }
  }

  const handleModerationAction = async () => {
    if (!selectedComment || !moderationStatus) return

    try {
      await api.put(`/admin/comments/${selectedComment.id}`, {
        status: moderationStatus,
        moderationReason: moderationReason
      })
      setShowModerationDialog(false)
      setSelectedComment(null)
      setModerationStatus("")
      setModerationReason("")
      await fetchComments()
    } catch (error: any) {
      console.error("Failed to moderate comment:", error)
      setError(error.response?.data?.error || "Failed to moderate comment")
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED": return <CheckCircle className="h-4 w-4" />
      case "PENDING": return <AlertTriangle className="h-4 w-4" />
      case "REJECTED": return <XCircle className="h-4 w-4" />
      case "FLAGGED": return <Flag className="h-4 w-4" />
      case "HIDDEN": return <EyeOff className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16" />
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
        <Button onClick={fetchComments} className="mt-4">
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
              コメント管理
            </h1>
            <p className="text-gray-600 mt-2">
              コメントの編集、削除、モデレーション
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={fetchComments} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              更新
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総コメント数</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">承認待ち</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {comments.filter(c => c.status === "PENDING").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">フラグ付き</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {comments.filter(c => c.status === "FLAGGED").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ブロック済み</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {comments.filter(c => c.isBlocked).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>フィルター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">検索</Label>
              <Input
                id="search"
                placeholder="コメント内容で検索"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="status">ステータス</Label>
              <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange("status", value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="PENDING">承認待ち</SelectItem>
                  <SelectItem value="APPROVED">承認済み</SelectItem>
                  <SelectItem value="REJECTED">拒否済み</SelectItem>
                  <SelectItem value="FLAGGED">フラグ付き</SelectItem>
                  <SelectItem value="HIDDEN">非表示</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sortBy">並び順</Label>
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">作成日</SelectItem>
                  <SelectItem value="updatedAt">更新日</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sortOrder">順序</Label>
              <Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange("sortOrder", value)}>
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

      {/* Comments Table */}
      <Card>
        <CardHeader>
          <CardTitle>コメント一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>コメント内容</TableHead>
                  <TableHead>投稿者</TableHead>
                  <TableHead>投稿</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>作成日</TableHead>
                  <TableHead>アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="text-sm whitespace-pre-wrap break-words">
                          {comment.content.length > 150 
                            ? `${comment.content.substring(0, 150)}...` 
                            : comment.content}
                        </div>
                        {comment.isBlocked && (
                          <Badge variant="destructive" className="text-xs mt-1">
                            ブロック済み
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{comment.author.nickname}</div>
                          <div className="text-sm text-gray-500">{comment.author.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div className="max-w-xs">
                          <div className="font-medium truncate">{comment.post.title}</div>
                          <div className="text-sm text-gray-500">投稿ID: {comment.post.id.substring(0, 8)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(comment.status)}>
                        {getStatusIcon(comment.status)}
                        <span className="ml-1">{comment.status}</span>
                      </Badge>
                      {comment.moderationReason && (
                        <div className="text-xs text-gray-500 mt-1">
                          理由: {comment.moderationReason}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{formatDate(comment.createdAt)}</span>
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
                          <DropdownMenuItem onClick={() => handleEditComment(comment)}>
                            <Edit className="h-4 w-4 mr-2" />
                            編集
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedComment(comment)
                            setShowModerationDialog(true)
                          }}>
                            <Flag className="h-4 w-4 mr-2" />
                            モデレーション
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedComment(comment)
                            setShowDeleteComment(true)
                          }} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-gray-500">
              ページ {currentPage} / {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                前へ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                次へ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Comment Dialog */}
      <Dialog open={showEditComment} onOpenChange={setShowEditComment}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>コメントを編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-content">コメント内容</Label>
              <Textarea
                id="edit-content"
                rows={6}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditComment(false)}>
                キャンセル
              </Button>
              <Button onClick={handleSaveEdit}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Moderation Dialog */}
      <Dialog open={showModerationDialog} onOpenChange={setShowModerationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>コメントをモデレーション</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="moderation-status">ステータス</Label>
              <Select value={moderationStatus} onValueChange={setModerationStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="ステータスを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED">承認</SelectItem>
                  <SelectItem value="REJECTED">拒否</SelectItem>
                  <SelectItem value="FLAGGED">フラグ</SelectItem>
                  <SelectItem value="HIDDEN">非表示</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="moderation-reason">理由</Label>
              <Textarea
                id="moderation-reason"
                placeholder="モデレーション理由を入力してください"
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowModerationDialog(false)}>
                キャンセル
              </Button>
              <Button onClick={handleModerationAction}>
                適用
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteComment} onOpenChange={setShowDeleteComment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>コメントを削除</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>このコメントを削除してもよろしいですか？この操作は取り消せません。</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteComment(false)}>
                キャンセル
              </Button>
              <Button variant="destructive" onClick={handleDeleteComment}>
                削除
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 