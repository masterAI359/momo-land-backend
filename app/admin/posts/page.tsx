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
import { Switch } from "@/components/ui/switch"
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
  FileText, 
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Star,
  Calendar,
  User,
  Heart,
  MessageSquare,
  TrendingUp
} from "lucide-react"

interface Post {
  id: string
  title: string
  content: string
  category: string
  excerpt?: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" | "HIDDEN"
  isPublished: boolean
  isFeatured: boolean
  priority: number
  viewCount: number
  createdAt: string
  updatedAt: string
  moderationReason?: string
  moderatedAt?: string
  moderatedBy?: string
  author: {
    id: string
    nickname: string
    email: string
  }
  _count: {
    comments: number
    likes: number
  }
}

interface PostFilters {
  search: string
  status: string
  category: string
  sortBy: string
  sortOrder: string
}

export default function AdminPostsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<PostFilters>({
    search: "",
    status: "",
    category: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  })

  // Modal states
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showEditPost, setShowEditPost] = useState(false)
  const [showDeletePost, setShowDeletePost] = useState(false)
  const [showModerationDialog, setShowModerationDialog] = useState(false)

  // Form states
  const [editForm, setEditForm] = useState<Partial<Post>>({})
  const [moderationStatus, setModerationStatus] = useState("")
  const [moderationReason, setModerationReason] = useState("")
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
    setShowEditPost(false)
    setShowDeletePost(false)
    setShowModerationDialog(false)
    setSelectedPost(null)
    setEditForm({})
    setModerationStatus("")
    setModerationReason("")
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

    fetchPosts()
  }, [user, router, currentPage, filters])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      })

      const response = await api.get(`/admin/posts?${params}`, {
        timeout: 10000
      })
      setPosts(response.data.posts || [])
      setTotalPages(response.data.pagination?.pages || 1)
    } catch (error: any) {
      console.error("Failed to fetch posts:", error)
      
      let errorMessage = "投稿一覧の読み込みに失敗しました"
      
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

  const handleFilterChange = (key: keyof PostFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleEditPost = (post: Post) => {
    setSelectedPost(post)
    setEditForm({
      title: post.title,
      content: post.content,
      category: post.category,
      excerpt: post.excerpt,
      isPublished: post.isPublished,
      isFeatured: post.isFeatured,
      priority: post.priority
    })
    setShowEditPost(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedPost || isSubmitting) return

    try {
      setIsSubmitting(true)
      setError(null)
      
      await api.put(`/admin/posts/${selectedPost.id}`, editForm, {
        timeout: 8000
      })
      
      await fetchPosts()
      resetAllStates()
    } catch (error: any) {
      console.error("Failed to update post:", error)
      
      let errorMessage = "投稿の更新に失敗しました"
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = "リクエストがタイムアウトしました。もう一度お試しください。"
      } else if (error.response?.status === 404) {
        errorMessage = "投稿が見つかりません"
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

  const handleDeletePost = async () => {
    if (!selectedPost || isSubmitting) return

    try {
      setIsSubmitting(true)
      setError(null)
      
      await api.delete(`/admin/posts/${selectedPost.id}`, {
        timeout: 8000
      })
      
      await fetchPosts()
      resetAllStates()
    } catch (error: any) {
      console.error("Failed to delete post:", error)
      
      let errorMessage = "投稿の削除に失敗しました"
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = "リクエストがタイムアウトしました。もう一度お試しください。"
      } else if (error.response?.status === 404) {
        errorMessage = "投稿が見つかりません"
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

  const handleModerationAction = async () => {
    if (!selectedPost || !moderationStatus || isSubmitting) return

    try {
      setIsSubmitting(true)
      setError(null)
      
      await api.put(`/admin/posts/${selectedPost.id}/status`, {
        status: moderationStatus,
        reason: moderationReason
      }, { timeout: 8000 })
      
      await fetchPosts()
      resetAllStates()
    } catch (error: any) {
      console.error("Failed to moderate post:", error)
      
      let errorMessage = "投稿のモデレーションに失敗しました"
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = "リクエストがタイムアウトしました。もう一度お試しください。"
      } else if (error.response?.status === 404) {
        errorMessage = "投稿が見つかりません"
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
      default: return <FileText className="h-4 w-4" />
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
        <Button 
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setError(null)
            fetchPosts()
          }} 
          className="mt-4"
          disabled={loading || isSubmitting}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
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
              投稿管理
            </h1>
            <p className="text-gray-600 mt-2">
              投稿の編集、削除、モデレーション
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                fetchPosts()
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総投稿数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">承認待ち</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {posts.filter(p => p.status === "PENDING").length}
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
              {posts.filter(p => p.status === "FLAGGED").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">注目投稿</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {posts.filter(p => p.isFeatured).length}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">検索</Label>
              <Input
                id="search"
                placeholder="タイトルまたは内容で検索"
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
              <Label htmlFor="category">カテゴリー</Label>
              <Select value={filters.category || "all"} onValueChange={(value) => handleFilterChange("category", value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="初心者向け">初心者向け</SelectItem>
                  <SelectItem value="上級者向け">上級者向け</SelectItem>
                  <SelectItem value="おすすめ">おすすめ</SelectItem>
                  <SelectItem value="レビュー">レビュー</SelectItem>
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
                  <SelectItem value="viewCount">閲覧数</SelectItem>
                  <SelectItem value="priority">優先度</SelectItem>
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

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>投稿一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>タイトル</TableHead>
                  <TableHead>作成者</TableHead>
                  <TableHead>カテゴリー</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>統計</TableHead>
                  <TableHead>作成日</TableHead>
                  <TableHead>アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="font-medium truncate">{post.title}</div>
                        <div className="text-sm text-gray-500 truncate">
                          {post.excerpt || post.content.substring(0, 100)}...
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          {post.isPublished && (
                            <Badge variant="secondary" className="text-xs">
                              <Eye className="h-3 w-3 mr-1" />
                              公開
                            </Badge>
                          )}
                          {post.isFeatured && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              注目
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{post.author.nickname}</div>
                          <div className="text-sm text-gray-500">{post.author.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{post.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(post.status)}>
                        {getStatusIcon(post.status)}
                        <span className="ml-1">{post.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4 text-gray-400" />
                          <span>{post.viewCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4 text-gray-400" />
                          <span>{post._count.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                          <span>{post._count.comments}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{formatDate(post.createdAt)}</span>
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
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleEditPost(post)
                            }}
                            disabled={isSubmitting}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            編集
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setSelectedPost(post)
                              setShowModerationDialog(true)
                            }}
                            disabled={isSubmitting}
                          >
                            <Flag className="h-4 w-4 mr-2" />
                            モデレーション
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setSelectedPost(post)
                              setShowDeletePost(true)
                            }} 
                            disabled={isSubmitting}
                            className="text-red-600"
                          >
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

      {/* Edit Post Dialog */}
      <Dialog open={showEditPost} onOpenChange={(open) => {
        setShowEditPost(open)
        if (!open) {
          setError(null)
          setIsSubmitting(false)
          setEditForm({})
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>投稿を編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">タイトル</Label>
              <Input
                id="edit-title"
                value={editForm.title || ""}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-content">内容</Label>
              <Textarea
                id="edit-content"
                rows={10}
                value={editForm.content || ""}
                onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">カテゴリー</Label>
              <Select value={editForm.category || ""} onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="初心者向け">初心者向け</SelectItem>
                  <SelectItem value="上級者向け">上級者向け</SelectItem>
                  <SelectItem value="おすすめ">おすすめ</SelectItem>
                  <SelectItem value="レビュー">レビュー</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-excerpt">抜粋</Label>
              <Textarea
                id="edit-excerpt"
                rows={3}
                value={editForm.excerpt || ""}
                onChange={(e) => setEditForm(prev => ({ ...prev, excerpt: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-published"
                  checked={editForm.isPublished || false}
                  onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isPublished: checked }))}
                />
                <Label htmlFor="edit-published">公開</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-featured"
                  checked={editForm.isFeatured || false}
                  onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isFeatured: checked }))}
                />
                <Label htmlFor="edit-featured">注目</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-priority">優先度 (0-100)</Label>
              <Input
                id="edit-priority"
                type="number"
                min="0"
                max="100"
                value={editForm.priority || 0}
                onChange={(e) => setEditForm(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
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
                  setShowEditPost(false)
                }}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSaveEdit()
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    保存中...
                  </>
                ) : (
                  '保存'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Moderation Dialog */}
      <Dialog open={showModerationDialog} onOpenChange={(open) => {
        setShowModerationDialog(open)
        if (!open) {
          setError(null)
          setIsSubmitting(false)
          setModerationStatus("")
          setModerationReason("")
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>投稿をモデレーション</DialogTitle>
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
                  setShowModerationDialog(false)
                }}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleModerationAction()
                }}
                disabled={!moderationStatus || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    適用中...
                  </>
                ) : (
                  '適用'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeletePost} onOpenChange={(open) => {
        setShowDeletePost(open)
        if (!open) {
          setError(null)
          setIsSubmitting(false)
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>投稿を削除</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>この投稿を削除してもよろしいですか？この操作は取り消せません。</p>
            
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
                  setShowDeletePost(false)
                }}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button 
                variant="destructive" 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleDeletePost()
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    削除中...
                  </>
                ) : (
                  '削除'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 