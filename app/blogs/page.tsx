"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Heart, Clock, Wifi, WifiOff } from "lucide-react"
import Link from "next/link"
import AffiliateBanner from "@/components/affiliate-banner"
import api from "@/api/axios"
import socketService from "@/lib/socket"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

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
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchPosts = async (page: number = 1) => {
    try {
      setLoading(true)
      const response = await api.get(`/posts?page=${page}&limit=10&sortBy=createdAt`)
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

      const handlePostLike = (data: { postId: string; likesCount: number; isLiked: boolean }) => {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === data.postId 
              ? { ...post, likesCount: data.likesCount }
              : post
          )
        )
      }

      const handleNewComment = (comment: any) => {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === comment.postId 
              ? { ...post, commentsCount: post.commentsCount + 1 }
              : post
          )
        )
      }

      socketService.onNewPost(handleNewPost)
      socketService.onPostLike(handlePostLike)
      socketService.onNewComment(handleNewComment)

      // Update connection status
      const checkConnection = () => {
        setIsConnected(socketService.isConnectedToServer())
      }
      const connectionInterval = setInterval(checkConnection, 5000)

      return () => {
        socketService.leaveBlogRoom()
        socketService.offNewPost(handleNewPost)
        socketService.offPostLike(handlePostLike)
        socketService.offNewComment(handleNewComment)
        clearInterval(connectionInterval)
      }
    }
  }, [user, toast])

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

  if (loading && posts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">投稿を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={() => fetchPosts(currentPage)} 
            className="mt-4"
          >
            再試行
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">ブログ一覧</h1>
              {user && (
                <div className="flex items-center space-x-2">
                  {isConnected ? (
                    <div className="flex items-center text-green-600">
                      <Wifi className="w-4 h-4 mr-1" />
                      <span className="text-sm">リアルタイム接続中</span>
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
            <p className="text-gray-600">
              ユーザーが投稿したライブチャット体験記を一覧で確認できます。
              気になる投稿をクリックして詳細をチェックしてみましょう。
              {user && " リアルタイムで新しい投稿や更新を受け取ります。"}
            </p>
          </div>

          <AffiliateBanner src="" alt="Affiliate Banner" link="/" size="large" position="content" />

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={`/blogs/${post.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full">{post.category}</span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                    <CardTitle className="text-lg hover:text-pink-600 transition-colors">{post.title}</CardTitle>
                    <CardDescription>投稿者: {post.author.nickname}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Heart className="w-4 h-4 mr-1 text-red-500" />
                          {post.likesCount}
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1 text-blue-500" />
                          {post.commentsCount}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-pink-600 hover:text-pink-700">
                        続きを読む →
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center space-x-2">
            <Button 
              variant="outline" 
              disabled={currentPage <= 1 || loading}
              onClick={() => fetchPosts(currentPage - 1)}
            >
              前へ
            </Button>
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <Button 
                  key={pageNum}
                  variant="outline" 
                  className={currentPage === pageNum ? "bg-pink-600 text-white" : ""}
                  onClick={() => fetchPosts(pageNum)}
                  disabled={loading}
                >
                  {pageNum}
                </Button>
              )
            })}
            <Button 
              variant="outline"
              disabled={currentPage >= pagination.pages || loading}
              onClick={() => fetchPosts(currentPage + 1)}
            >
              次へ
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-80">
          <div className="sticky top-4 space-y-6">
            <AffiliateBanner src="" alt="Affiliate Banner" link="/" size="small" position="sidebar" />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">人気の投稿</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {posts
                  .slice(0, 5)
                  .sort((a, b) => b.likesCount - a.likesCount)
                  .map((post) => (
                    <div key={post.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                      <Link href={`/blogs/${post.id}`} className="block hover:text-pink-600 transition-colors">
                        <h4 className="font-medium text-sm mb-1">{post.title}</h4>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{post.author.nickname}</span>
                          <span className="flex items-center">
                            <Heart className="w-3 h-3 mr-1 text-red-500" />
                            {post.likesCount}
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">カテゴリー</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {["初心者向け", "上級者向け", "おすすめ", "レビュー"].map((category) => (
                    <Button key={category} variant="ghost" className="w-full justify-start text-sm">
                      {category}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
