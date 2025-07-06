"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageSquare, Clock, User, Wifi, WifiOff, RefreshCw, Eye } from "lucide-react"
import Link from "next/link"
import AffiliateBanner from "@/components/affiliate-banner"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import api from "@/api/axios"
import socketService from "@/lib/socket"

interface TimelinePost {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  likesCount: number
  commentsCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
  author: {
    id: string
    nickname: string
  }
}

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
        title: "エラー",
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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) {
      return "たった今"
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}分前`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}時間前`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days}日前`
    }
  }

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "初心者向け":
        return "bg-green-100 text-green-800"
      case "上級者向け":
        return "bg-red-100 text-red-800"
      case "おすすめ":
        return "bg-blue-100 text-blue-800"
      case "レビュー":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Initial load
  useEffect(() => {
    fetchTimelinePosts()
  }, [])

  // WebSocket connection and real-time updates
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("token")
      if (token) {
        console.log("📱 Timeline: Setting up WebSocket connection")
        socketService.connect(token)
        socketService.joinBlogRoom()
        
        // Real-time event handlers
        const handlePostLike = (data: { postId: string; likesCount: number; isLiked: boolean }) => {
          console.log("📱 Timeline: Post liked", data)
          setTimelinePosts(prevPosts => 
            prevPosts.map(post => 
              post.id === data.postId 
                ? { ...post, likesCount: data.likesCount }
                : post
            )
          )
          
          toast({
            title: "🔥 リアルタイム更新",
            description: "投稿にいいねが付きました！",
          })
        }

        const handleNewPost = (newPost: any) => {
          console.log("📱 Timeline: New post received", newPost)
          setTimelinePosts(prevPosts => {
            // Check if post already exists
            const exists = prevPosts.some(post => post.id === newPost.id)
            if (exists) return prevPosts
            
            return [newPost, ...prevPosts]
          })
          
          toast({
            title: "📝 新しい投稿",
            description: `${newPost.author.nickname}さんが新しい投稿を公開しました！`,
          })
        }

        const handleNewComment = (comment: any) => {
          console.log("📱 Timeline: New comment received", comment)
          setTimelinePosts(prevPosts => 
            prevPosts.map(post => 
              post.id === comment.postId 
                ? { ...post, commentsCount: post.commentsCount + 1 }
                : post
            )
          )
          
          toast({
            title: "💬 新しいコメント",
            description: "投稿にコメントが追加されました！",
          })
        }

        socketService.onPostLike(handlePostLike)
        socketService.onNewPost(handleNewPost)
        socketService.onNewComment(handleNewComment)

        // Update connection status
        const checkConnection = () => {
          setIsConnected(socketService.isConnectedToServer())
        }
        const connectionInterval = setInterval(checkConnection, 1000)

        return () => {
          socketService.leaveBlogRoom()
          socketService.offPostLike(handlePostLike)
          socketService.offNewPost(handleNewPost)
          socketService.offNewComment(handleNewComment)
          clearInterval(connectionInterval)
        }
      }
    }
  }, [user, toast])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">📅 タイムライン</h1>
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

        <AffiliateBanner size="large" position="content" />

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
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">タイムラインを読み込み中...</p>
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
              timelinePosts.map((post, index) => (
                <div key={post.id} className="relative">
                  {/* Timeline Line */}
                  {index !== timelinePosts.length - 1 && (
                    <div className="absolute left-4 top-16 w-0.5 h-full bg-gray-200 -z-10"></div>
                  )}

                  {/* Timeline Item */}
                  <div className="flex items-start space-x-4">
                    {/* Timeline Dot */}
                    <div className="flex-shrink-0 w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center mt-2">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>

                    {/* Content */}
                    <Card className="flex-1 hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`text-xs ${getCategoryColor(post.category)}`}>
                            {post.category}
                          </Badge>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(post.createdAt)}</span>
                            <Eye className="w-3 h-3" />
                            <span>{post.viewCount}</span>
                          </div>
                        </div>
                        <Link href={`/blogs/${post.id}`}>
                          <CardTitle className="text-lg hover:text-pink-600 transition-colors line-clamp-2">
                            {post.title}
                          </CardTitle>
                        </Link>
                        <CardDescription className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {post.author.nickname}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Heart className="w-4 h-4 mr-1 text-red-500" />
                              <span className="font-semibold">{post.likesCount}</span>
                            </span>
                            <span className="flex items-center">
                              <MessageSquare className="w-4 h-4 mr-1 text-blue-500" />
                              <span>{post.commentsCount}</span>
                            </span>
                          </div>
                          <Link href={`/blogs/${post.id}`}>
                            <Button variant="ghost" size="sm" className="text-pink-600 hover:text-pink-700">
                              続きを読む →
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <AffiliateBanner size="medium" position="content" />

        {/* Load More Button */}
        {!loading && hasMore && (
          <div className="text-center">
            <Button 
              onClick={loadMorePosts} 
              disabled={loadingMore}
              variant="outline" 
              size="lg"
              className="min-w-40"
            >
              {loadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600 mr-2"></div>
                  読み込み中...
                </>
              ) : (
                "さらに読み込む"
              )}
            </Button>
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
      </div>
    </div>
  )
}
