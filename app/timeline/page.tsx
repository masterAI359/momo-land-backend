"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, MessageSquare, Clock, User, Wifi, WifiOff, RefreshCw, Eye } from "lucide-react"
import Link from "next/link"
import AffiliateBanner from "@/components/affiliate-banner"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import api from "@/api/axios"
import socketService from "@/lib/socket"
import { EmojiText } from "@/components/modern-icon"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface TimelinePost {
  id: string
  title: string
  content: string
  author: {
    id: string
    nickname: string
    avatar: string
  }
  category?: string
  likesCount: number
  commentsCount: number
  viewCount: number
  createdAt: string
  isLiked?: boolean
}

// Skeleton Components for Timeline
const TimelinePostSkeleton = () => (
  <Card className="w-full">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-3/4" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </CardContent>
  </Card>
)

const TimelineHeaderSkeleton = () => (
  <div className="text-center space-y-4">
    <div className="flex items-center justify-center space-x-4">
      <Skeleton className="h-9 w-40" />
      <div className="flex items-center space-x-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
    <Skeleton className="h-5 w-96 mx-auto" />
  </div>
)

const LoadMoreSkeleton = () => (
  <div className="text-center">
    <Skeleton className="h-12 w-40 mx-auto" />
  </div>
)

export default function TimelinePage() {
  const [timelinePosts, setTimelinePosts] = useState<TimelinePost[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  // Fetch timeline posts
  const fetchTimelinePosts = async (pageNum = 1, showLoading = true) => {
    try {
      if (showLoading) {
        pageNum === 1 ? setLoading(true) : setLoadingMore(true)
      }
      setError(null)

      const response = await api.get(`/posts?page=${pageNum}&limit=10&sortBy=createdAt`)
      const posts = response.data.posts
      const pagination = response.data.pagination

      if (pageNum === 1) {
        setTimelinePosts(posts)
      } else {
        setTimelinePosts(prev => [...prev, ...posts])
      }

      setHasMore(pagination.page < pagination.pages)
      setPage(pageNum)
    } catch (error: any) {
      console.error("❌ Timeline: Failed to fetch posts", error)
      setError("投稿の取得に失敗しました。しばらくしてから再度お試しください。")
      toast({
        title: "🔥 リアルタイム更新",
        description: "投稿の取得に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setRefreshing(false)
    }
  }

  // Load more posts
  const loadMorePosts = () => {
    if (!loadingMore && hasMore) {
      fetchTimelinePosts(page + 1, false)
    }
  }

  // Refresh timeline
  const handleRefresh = () => {
    setRefreshing(true)
    fetchTimelinePosts(1, false)
  }

  // Like/Unlike post
  const handleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "いいねするにはログインしてください。",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await api.post(`/posts/${postId}/like`)

      setTimelinePosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likesCount: response.data.likesCount,
            isLiked: response.data.isLiked
          }
        }
        return post
      }))

      toast({
        title: "🔥 リアルタイム更新",
        description: "投稿にいいねが付きました！",
      })
    } catch (error: any) {
      console.error("Failed to like post:", error)
      toast({
        title: "エラー",
        description: "いいねの処理に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return "1時間未満前"
    } else if (diffInHours < 24) {
      return `${diffInHours}時間前`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}日前`
    }
  }

  useEffect(() => {
    fetchTimelinePosts()

    // Setup socket connection for real-time updates
    if (user) {
      console.log("📡 Timeline: Setting up WebSocket connection")

      const token = localStorage.getItem("token")
      if (token) {
        socketService.connect(token)
        socketService.joinBlogRoom()

        // Connection status monitoring
        const connectionInterval = setInterval(() => {
          const connected = socketService.isConnectedToServer()
          setIsConnected(connected)
          console.log(`📡 Timeline: Connection status - ${connected ? 'Connected' : 'Disconnected'}`)
        }, 2000)

        // Listen for real-time post updates
        socketService.onPostLike((data) => {
          console.log("📡 Timeline: Received like update", data)
          setTimelinePosts(prev => prev.map(post => {
            if (post.id === data.postId) {
              return { ...post, likesCount: data.likesCount }
            }
            return post
          }))

          toast({
            title: "🔥 リアルタイム更新",
            description: "投稿にいいねが付きました！",
          })
        })

        socketService.onNewComment((data) => {
          console.log("📡 Timeline: Received comment update", data)
          setTimelinePosts(prev => prev.map(post => {
            if (post.id === data.postId) {
              return { ...post, commentsCount: data.commentsCount }
            }
            return post
          }))

          toast({
            title: "🔥 リアルタイム更新",
            description: "新しいコメントが投稿されました！",
          })
        })

        return () => {
          console.log("📡 Timeline: Cleaning up WebSocket connection")
          socketService.leaveBlogRoom()
          socketService.offPostLike()
          socketService.offNewComment()
          clearInterval(connectionInterval)
        }
      }
    }
  }, [user, toast])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        {loading ? (
          <TimelineHeaderSkeleton />
        ) : (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">タイムライン</h1>
              {user && (
                <div className="flex items-center space-x-2">
                  {isConnected ? (
                    <div className="flex items-center text-green-600">
                      <Wifi className="w-4 h-4 mr-1" />
                      <span className="text-sm">リアルタイム更新中</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <WifiOff className="w-4 h-4 mr-1" />
                      <span className="text-sm">接続なし</span>
                    </div>
                  )}
                  <Button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              最新のライブチャット体験記を時系列で確認できます。
              {user && isConnected && (
                <span className="text-green-600 font-semibold"> リアルタイムで更新されます！</span>
              )}
            </p>
          </div>
        )}

        <AffiliateBanner src="/images/banner/timeline_header.jpg" alt="Affiliate Banner" link="https://www.j-live.tv/LiveChat/acs.php?si=jw10000&pid=MLA5563" size="large" position="content" />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center">
            <p>{error}</p>
            <Button onClick={() => fetchTimelinePosts(1)} variant="outline" size="sm" className="mt-2">
              再試行
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <TimelinePostSkeleton key={index} />
            ))}
          </div>
        ) : (
          /* Timeline */
          <div className="space-y-6">
            {timelinePosts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">まだ投稿がありません</p>
                <p className="text-sm text-gray-500 mt-2">
                  最初の投稿を作成して、タイムラインを活気づけましょう！
                </p>
              </div>
            ) : (
              timelinePosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">
                            <Link href={`/blogs/${post.id}`} className="hover:text-pink-600 transition-colors">
                              {post.title}
                            </Link>
                          </CardTitle>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Avatar>
                            <AvatarImage src={post.author.avatar ? post.author.avatar : "/images/avatar/default.png"} />
                            <AvatarFallback>{post.author.nickname.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{post.author.nickname}</span>
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                      {post.category && (
                        <Badge variant="secondary">{post.category}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 text-gray-700 leading-relaxed">
                      {post.content.slice(0, 200)}{post.content.length > 200 && "..."}
                    </CardDescription>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant={post.isLiked ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          className={post.isLiked ? "bg-pink-600 hover:bg-pink-700" : ""}
                        >
                          <Heart className={`w-4 h-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                          {post.likesCount}
                        </Button>
                        <div className="flex items-center text-sm text-gray-500">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {post.commentsCount}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Eye className="w-4 h-4 mr-1" />
                          {post.viewCount}
                        </div>
                      </div>

                      <Link href={`/blogs/${post.id}`}>
                        <Button variant="outline" size="sm">
                          続きを読む
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Load More */}
        {!loading && hasMore && (
          <div className="text-center">
            {loadingMore ? (
              <LoadMoreSkeleton />
            ) : (
              <Button
                onClick={loadMorePosts}
                disabled={loadingMore}
                variant="outline"
                size="lg"
                className="min-w-40"
              >
                さらに読み込む
              </Button>
            )}
          </div>
        )}

        {/* End of Timeline */}
        {!loading && !hasMore && timelinePosts.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="border-t border-gray-200 pt-8">
              <p className="text-sm">すべての投稿を表示しました</p>
            </div>
          </div>
        )}

        <AffiliateBanner src="/images/banner/timeline_footer.jpg" alt="Timeline Footer Banner" link="https://www.j-live.tv/LiveChat/acs.php?si=jw10000&pid=MLA5563" size="large" position="content" />
      </div>
    </div>
  )
}
