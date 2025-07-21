"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { MessageSquare, Heart, Clock, Wifi, WifiOff, Eye, User, Calendar, AlertCircle, Zap, Search, Filter, X, SortAsc, SortDesc } from "lucide-react"
import Link from "next/link"
import AffiliateBanner from "@/components/affiliate-banner"
import api from "@/api/axios"
import socketService from "@/lib/socket"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { PostGridSkeleton, SearchLoadingSkeleton, StatsLoadingSkeleton } from "@/components/ui/loading-states"
import { EnhancedPagination } from "@/components/ui/enhanced-pagination"

interface Post {
  id: string
  title: string
  content: string
  category: string
  excerpt: string
  author: {
    id: string
    nickname: string
  }
  likesCount: number
  commentsCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
}

interface PostsResponse {
  posts: Post[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "初心者向け":
      return "bg-green-100 text-green-800 border-green-200"
    case "上級者向け":
      return "bg-purple-100 text-purple-800 border-purple-200"
    case "おすすめ":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "レビュー":
      return "bg-orange-100 text-orange-800 border-orange-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days > 0) {
    return `${days}日前`
  } else if (hours > 0) {
    return `${hours}時間前`
  } else {
    return "1時間未満前"
  }
}

const PostCard = ({ post }: { post: Post }) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md hover:shadow-xl hover:-translate-y-1 bg-white overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={`/placeholder-user.jpg`} alt={post.author.nickname} />
              <AvatarFallback className="bg-pink-100 text-pink-600 font-semibold">
                {post.author.nickname.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{post.author.nickname}</span>
                <Badge variant="secondary" className="text-xs">
                  投稿者
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>
          <Badge className={getCategoryColor(post.category)}>
            {post.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <CardTitle className="text-xl mb-2 group-hover:text-pink-600 transition-colors line-clamp-2">
              <Link href={`/blogs/${post.id}`} className="hover:underline">
                {post.title}
              </Link>
            </CardTitle>
            <CardDescription className="text-gray-600 line-clamp-3 leading-relaxed">
              {post.excerpt}
            </CardDescription>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{post.viewCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{post.likesCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>{post.commentsCount}</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 transition-colors"
              asChild
            >
              <Link href={`/blogs/${post.id}`}>
                続きを読む
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



export default function BlogsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  })
  const [isConnected, setIsConnected] = useState(false)
  const [iframeLargeLoading, setIframeLargeLoading] = useState(true)
  const [iframeSidebarLoading, setIframeSidebarLoading] = useState(true)

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const { user } = useAuth()
  const { toast } = useToast()

  const categories = [
    { value: "all", label: "すべて" },
    { value: "初心者向け", label: "初心者向け" },
    { value: "上級者向け", label: "上級者向け" },
    { value: "おすすめ", label: "おすすめ" },
    { value: "レビュー", label: "レビュー" }
  ]

  const sortOptions = [
    { value: "createdAt", label: "投稿日時" },
    { value: "likesCount", label: "いいね数" },
    { value: "commentsCount", label: "コメント数" },
    { value: "viewCount", label: "閲覧数" }
  ]

  const fetchPosts = async (page: number = 1, category?: string, search?: string, sortBy?: string) => {
    try {
      setLoading(true)
      let url = `/posts?page=${page}&limit=10&sortBy=${sortBy || "createdAt"}`

      if (category && category !== "all") {
        url += `&category=${encodeURIComponent(category)}`
      }

      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`
      }

      const response = await api.get(url)
      const data: PostsResponse = response.data

      setPosts(data.posts)
      setPagination(data.pagination)
      setCurrentPage(page)
      setError(null)
    } catch (error: any) {
      console.error("Failed to fetch posts:", error)
      setError("投稿の取得に失敗しました。")
    } finally {
      setLoading(false)
    }
  }

  // Filter posts locally for better performance
  const filteredPosts = useMemo(() => {
    let filtered = [...posts]

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.author.nickname.toLowerCase().includes(searchLower)
      )
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(post => post.category === selectedCategory)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case "likesCount":
          aValue = a.likesCount
          bValue = b.likesCount
          break
        case "commentsCount":
          aValue = a.commentsCount
          bValue = b.commentsCount
          break
        case "viewCount":
          aValue = a.viewCount
          bValue = b.viewCount
          break
        default:
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })

    return filtered
  }, [posts, searchTerm, selectedCategory, sortBy, sortOrder])

  useEffect(() => {
    fetchPosts(1)
  }, [])

  // Real-time WebSocket setup
  useEffect(() => {
    if (user) {
      console.log("🔗 Setting up WebSocket for blogs page")
      // Check connection status
      setIsConnected(socketService.isConnectedToServer())
      console.log("📡 WebSocket connected:", socketService.isConnectedToServer())

      // Join blog room for real-time updates
      socketService.joinBlogRoom()

      // Set up real-time event listeners
      const handleNewPost = (newPost: Post) => {
        setPosts(prevPosts => [newPost, ...prevPosts.slice(0, 9)]) // Keep only 10 posts
        setPagination(prev => ({ ...prev, total: prev.total + 1 }))

        toast({
          title: "新しい投稿",
          description: `${newPost.author.nickname}さんが新しい投稿をしました: ${newPost.title}`,
        })
      }

      const handlePostLike = (data: { postId: string; likesCount: number }) => {
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === data.postId
              ? { ...post, likesCount: data.likesCount }
              : post
          )
        )
      }

      const handleNewComment = (data: { postId: string; commentsCount: number }) => {
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === data.postId
              ? { ...post, commentsCount: data.commentsCount }
              : post
          )
        )
      }

      // Register event listeners
      socketService.onNewPost(handleNewPost)
      socketService.onPostLike(handlePostLike)
      socketService.onNewComment(handleNewComment)

      // Cleanup function
      return () => {
        socketService.offNewPost(handleNewPost)
        socketService.offPostLike(handlePostLike)
        socketService.offNewComment(handleNewComment)
      }
    }
  }, [user, toast])

  const handlePageChange = (page: number) => {
    fetchPosts(page, selectedCategory, searchTerm, sortBy)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRetry = () => {
    setError(null)
    fetchPosts(currentPage, selectedCategory, searchTerm, sortBy)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
    fetchPosts(1, category, searchTerm, sortBy)
  }

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy)
    setCurrentPage(1)
    fetchPosts(1, selectedCategory, searchTerm, newSortBy)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSortBy("createdAt")
    setSortOrder("desc")
    setCurrentPage(1)
    fetchPosts(1)
  }

  const hasActiveFilters = searchTerm.trim() || selectedCategory !== "all" || sortBy !== "createdAt"

  return (
    <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">ブログ一覧</h1>
              {user && (
                <div className="flex items-center space-x-2">
                  {isConnected ? (
                    <div className="flex items-center text-green-600">
                      <Wifi className="w-4 h-4 mr-1" />
                      <span className="text-sm">リアルタイム更新</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <WifiOff className="w-4 h-4 mr-1" />
                      <span className="text-sm">接続なし</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              ライブチャットに関する様々な体験記やレビューを閲覧できます。
              {user && isConnected && (
                <span className="text-green-600 font-semibold"> リアルタイムで更新されます！</span>
              )}
            </p>
          </div>

          {/* Search and Filter Bar */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>検索・フィルター</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="投稿を検索..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリーを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort Filter */}
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="並び替え" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort Order and Clear Filters */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="flex-1"
                  >
                    {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </Button>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="flex-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
                  <span className="text-sm text-gray-500">フィルター:</span>
                  {searchTerm.trim() && (
                    <Badge variant="secondary" className="gap-1">
                      検索: {searchTerm}
                      <button
                        onClick={() => handleSearch("")}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedCategory !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      カテゴリー: {selectedCategory}
                      <button
                        onClick={() => handleCategoryChange("all")}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {sortBy !== "createdAt" && (
                    <Badge variant="secondary" className="gap-1">
                      並び替え: {sortOptions.find(opt => opt.value === sortBy)?.label}
                      <button
                        onClick={() => handleSortChange("createdAt")}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Affiliate Banner */}
            <div className="relative">
              {iframeLargeLoading && (
                <div className="absolute inset-0 z-10">
                  <Skeleton className="w-full h-[273px] bg-pink-100 border-2 border-dashed border-pink-300 rounded flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                      <p className="text-sm text-pink-600 font-medium">バナーを読み込み中...</p>
                    </div>
                  </Skeleton>
                </div>
              )}
            <Link href="https://www.j-live.tv/loginform_ssl.php" className="relative" style={{ minHeight: '275px', aspectRatio: '1176/273' }}>
                <div>
                <div className="absolute inset-0 z-10 w-full h-full">
                </div>
                <iframe
                  className={`border-dashed border-pink-300 rounded w-full h-auto max-w-full transition-opacity duration-300 ${iframeLargeLoading ? 'opacity-0' : 'opacity-100'}`}
                  src='https://hananokai.tv/lib/online-banner_make_balloon_slide.php?site=j&taiki=1&normal=1&two=1&h=275&w=1176&count=7&pid=MLA5563&hd_flg=0&v=0&clr=ffffff&size=0&bln=t&ani_flg=f&slide=t&dir=v&col=7&seika=10000'
                  width='1176'
                  height='273'
                  style={{ minHeight: '275px', aspectRatio: '1176/273' }}
                  onLoad={() => {
                    setTimeout(() => setIframeLargeLoading(false), 500)
                  }}
                ></iframe>
                </div>
              </Link>
            </div>

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button onClick={handleRetry} variant="outline" size="sm">
                  再試行
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {loading ? (
                  <PostGridSkeleton count={6} />
                ) : filteredPosts.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        {filteredPosts.length} 件の投稿が見つかりました
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>並び替え: {sortOptions.find(opt => opt.value === sortBy)?.label}</span>
                        <span>({sortOrder === "asc" ? "昇順" : "降順"})</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
                    <EnhancedPagination
                      currentPage={currentPage}
                      totalPages={pagination.pages}
                      onPageChange={handlePageChange}
                      itemsPerPage={pagination.limit}
                      totalItems={pagination.total}
                      showPageInfo={true}
                      showTotalInfo={true}
                      className="mt-8"
                    />
                  </>
                ) : (
                  <div className="text-center py-16">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {hasActiveFilters ? "条件に合う投稿がありません" : "投稿がありません"}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {hasActiveFilters
                        ? "フィルターを変更して再度検索してください。"
                        : "まだ投稿がありません。最初の投稿をしてみませんか？"
                      }
                    </p>
                    {hasActiveFilters ? (
                      <Button onClick={clearFilters} variant="outline">
                        <X className="w-4 h-4 mr-2" />
                        フィルターをクリア
            </Button>
                    ) : (
                      <Button asChild className="bg-pink-600 hover:bg-pink-700">
                        <Link href="/post">
                          <Zap className="w-4 h-4 mr-2" />
                          投稿する
                        </Link>
                </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
            <Card>
              <CardHeader>
                  <CardTitle className="text-lg">クイックアクション</CardTitle>
              </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full bg-pink-600 hover:bg-pink-700">
                    <Link href="/post">
                      <Zap className="w-4 h-4 mr-2" />
                      新しい投稿
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/timeline">
                      <Clock className="w-4 h-4 mr-2" />
                      タイムライン
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/ranking">
                      <Heart className="w-4 h-4 mr-2" />
                      人気ランキング
                      </Link>
                  </Button>
              </CardContent>
            </Card>

              {/* Search Stats */}
            <Card>
              <CardHeader>
                  <CardTitle className="text-lg">検索結果</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">表示中</span>
                      <Badge variant="secondary">{filteredPosts.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">総投稿数</span>
                      <Badge variant="secondary">{pagination.total}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">現在のページ</span>
                      <Badge variant="secondary">{currentPage} / {pagination.pages}</Badge>
                    </div>
                    {user && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">接続状態</span>
                        <Badge variant={isConnected ? "default" : "destructive"}>
                          {isConnected ? "オンライン" : "オフライン"}
                        </Badge>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>

              {/* Sidebar Affiliate Banner */}
              <div className="space-y-4">
                <div className="relative">
                  {iframeSidebarLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600 mx-auto"></div>
                        <p className="text-xs text-gray-500 mt-2">Loading...</p>
                      </div>
                    </div>
                  )}
                  <iframe
                    src="https://hananokai.tv/lib/online-banner_make_balloon_slide.php?w=250&h=250&bgcolor=fce4ec&txtcolor=d81b60&key=jw10000&pid=MLA5563"
                    width="250"
                    height="250"
                    frameBorder="0"
                    scrolling="no"
                    className="w-full rounded-lg shadow-sm"
                    style={{ aspectRatio: '1/1' }}
                    onLoad={() => setIframeSidebarLoading(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
