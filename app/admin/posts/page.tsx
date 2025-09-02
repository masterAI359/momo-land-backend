"use client"

<<<<<<< HEAD
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Search, Edit, Trash2, Check, X, Plus } from "lucide-react"
=======
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
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4

interface Post {
  id: string
  title: string
  content: string
  category: string
<<<<<<< HEAD
  status: string
  viewCount: number
  createdAt: string
  author: {
    id: string
    nickname: string
  }
  _count: {
    likes: number
    comments: number
  }
}

export default function PostsManagement() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [posts, searchTerm, statusFilter, categoryFilter])

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/admin/posts")
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error)
      toast({
        title: "エラー",
        description: "投稿情報の取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterPosts = () => {
    let filtered = posts

    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.author.nickname.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((post) => post.status === statusFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((post) => post.category === categoryFilter)
    }

    setFilteredPosts(filtered)
  }

  const updatePostStatus = async (postId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "投稿ステータスを更新しました",
        })
        fetchPosts()
      }
    } catch (error) {
      console.error("Failed to update post status:", error)
      toast({
        title: "エラー",
        description: "ステータス更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  const updatePost = async (postId: string, postData: any) => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "投稿を更新しました",
        })
        setEditDialogOpen(false)
        fetchPosts()
      }
    } catch (error) {
      console.error("Failed to update post:", error)
      toast({
        title: "エラー",
        description: "投稿更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  const createPost = async (postData: any) => {
    try {
      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "投稿を作成しました",
        })
        setCreateDialogOpen(false)
        fetchPosts()
      }
    } catch (error) {
      console.error("Failed to create post:", error)
      toast({
        title: "エラー",
        description: "投稿作成に失敗しました",
        variant: "destructive",
      })
    }
  }

  const deletePost = async (postId: string) => {
    if (!confirm("本当にこの投稿を削除しますか？")) return

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "投稿を削除しました",
        })
        fetchPosts()
      }
    } catch (error) {
      console.error("Failed to delete post:", error)
      toast({
        title: "エラー",
        description: "投稿削除に失敗しました",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PUBLISHED: "default",
      DRAFT: "secondary",
      BLOCKED: "destructive",
      PENDING_REVIEW: "outline",
    }
    return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status}</Badge>
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">投稿管理</h1>
          <p className="text-gray-600 mt-2">投稿の管理、承認、編集</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新規投稿
        </Button>
      </div>

      {/* Filters */}
      <Card>
=======
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
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
        <CardHeader>
          <CardTitle>フィルター</CardTitle>
        </CardHeader>
        <CardContent>
<<<<<<< HEAD
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="タイトルまたは作者で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのステータス</SelectItem>
                <SelectItem value="PUBLISHED">公開済み</SelectItem>
                <SelectItem value="DRAFT">下書き</SelectItem>
                <SelectItem value="BLOCKED">ブロック済み</SelectItem>
                <SelectItem value="PENDING_REVIEW">承認待ち</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="カテゴリ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのカテゴリ</SelectItem>
                <SelectItem value="初心者向け">初心者向け</SelectItem>
                <SelectItem value="上級者向け">上級者向け</SelectItem>
                <SelectItem value="おすすめ">おすすめ</SelectItem>
                <SelectItem value="レビュー">レビュー</SelectItem>
              </SelectContent>
            </Select>
=======
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
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
<<<<<<< HEAD
          <CardTitle>投稿一覧 ({filteredPosts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">タイトル</th>
                  <th className="text-left p-2">作者</th>
                  <th className="text-left p-2">カテゴリ</th>
                  <th className="text-left p-2">ステータス</th>
                  <th className="text-left p-2">統計</th>
                  <th className="text-left p-2">作成日</th>
                  <th className="text-left p-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="font-medium">{post.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{post.content.substring(0, 100)}...</div>
                    </td>
                    <td className="p-2">{post.author.nickname}</td>
                    <td className="p-2">
                      <Badge variant="outline">{post.category}</Badge>
                    </td>
                    <td className="p-2">{getStatusBadge(post.status)}</td>
                    <td className="p-2">
                      <div className="text-sm">
                        <div>閲覧: {post.viewCount}</div>
                        <div>いいね: {post._count.likes}</div>
                        <div>コメント: {post._count.comments}</div>
                      </div>
                    </td>
                    <td className="p-2">{new Date(post.createdAt).toLocaleDateString("ja-JP")}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPost(post)
                            setEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {post.status === "PENDING_REVIEW" && (
                          <>
                            <Button size="sm" variant="default" onClick={() => updatePostStatus(post.id, "PUBLISHED")}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updatePostStatus(post.id, "BLOCKED")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => deletePost(post.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
=======
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
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
          </div>
        </CardContent>
      </Card>

      {/* Edit Post Dialog */}
<<<<<<< HEAD
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>投稿編集</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const postData = {
                  title: formData.get("title"),
                  content: formData.get("content"),
                  category: formData.get("category"),
                  status: formData.get("status"),
                }
                updatePost(selectedPost.id, postData)
              }}
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">タイトル</Label>
                  <Input id="title" name="title" defaultValue={selectedPost.title} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">カテゴリ</Label>
                    <Select name="category" defaultValue={selectedPost.category}>
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
                    <Label htmlFor="status">ステータス</Label>
                    <Select name="status" defaultValue={selectedPost.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLISHED">公開済み</SelectItem>
                        <SelectItem value="DRAFT">下書き</SelectItem>
                        <SelectItem value="BLOCKED">ブロック済み</SelectItem>
                        <SelectItem value="PENDING_REVIEW">承認待ち</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="content">内容</Label>
                  <Textarea id="content" name="content" defaultValue={selectedPost.content} rows={10} required />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button type="submit">保存</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Post Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>新規投稿作成</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const postData = {
                title: formData.get("title"),
                content: formData.get("content"),
                category: formData.get("category"),
                status: formData.get("status"),
              }
              createPost(postData)
            }}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">タイトル</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">カテゴリ</Label>
                  <Select name="category" defaultValue="初心者向け">
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
                  <Label htmlFor="status">ステータス</Label>
                  <Select name="status" defaultValue="PUBLISHED">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLISHED">公開済み</SelectItem>
                      <SelectItem value="DRAFT">下書き</SelectItem>
                      <SelectItem value="PENDING_REVIEW">承認待ち</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="content">内容</Label>
                <Textarea id="content" name="content" rows={10} required />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                キャンセル
              </Button>
              <Button type="submit">作成</Button>
            </div>
          </form>
=======
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
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
        </DialogContent>
      </Dialog>
    </div>
  )
<<<<<<< HEAD
}
=======
} 
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
