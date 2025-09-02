"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Heart, Clock, Wifi, WifiOff } from "lucide-react"
import Link from "next/link"
import AffiliateBanner from "@/components/affiliate-banner"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { usePosts, useApiSocket } from "@/hooks/use-api-socket"

export default function BlogsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  })
  const { user } = useAuth()
  const { toast } = useToast()
  
  // Use the integrated API-socket hook
  const { isConnected } = useApiSocket()
  const { 
    posts, 
    loading, 
    error, 
    fetchPosts, 
    likePost 
  } = usePosts()

  const handleFetchPosts = async (page: number = 1) => {
    const result = await fetchPosts({ 
      page, 
      limit: 10, 
      sortBy: "createdAt" 
    })
    
    if (result?.success && result.data) {
      setPagination(result.data.pagination)
      setCurrentPage(page)
    }
  }

  const handleLikePost = async (postId: string) => {
    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "いいねするにはログインしてください。",
        variant: "destructive",
      })
      return
    }

    // The usePosts hook handles optimistic updates automatically
    await likePost(postId)
  }

  useEffect(() => {
    handleFetchPosts(1)
  }, [])

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

  if (loading && posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">体験記一覧</h1>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center text-green-600">
                <Wifi className="h-4 w-4 mr-1" />
                <span className="text-sm">リアルタイム接続中</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <WifiOff className="h-4 w-4 mr-1" />
                <span className="text-sm">接続していません</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Loading skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error && posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">体験記一覧</h1>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center text-green-600">
                <Wifi className="h-4 w-4 mr-1" />
                <span className="text-sm">リアルタイム接続中</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <WifiOff className="h-4 w-4 mr-1" />
                <span className="text-sm">接続していません</span>
              </div>
            )}
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => handleFetchPosts(1)}>
              再試行
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">体験記一覧</h1>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center text-green-600">
              <Wifi className="h-4 w-4 mr-1" />
              <span className="text-sm">リアルタイム接続中</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <WifiOff className="h-4 w-4 mr-1" />
              <span className="text-sm">接続していません</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Affiliate Banner */}
          <div className="mb-6">
            <AffiliateBanner 
              src="/images/banner/timeline_header.jpg" 
              alt="Affiliate Banner" 
              link="https://www.j-live.tv/loginform_ssl.php"
              size="large"
            />
          </div>

          {posts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-600 mb-4">まだ投稿がありません。</p>
                <p className="text-sm text-gray-500">最初の体験記を投稿してみませんか？</p>
                <Link href="/post">
                  <Button className="mt-4">
                    投稿する
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Posts Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {posts.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">
                            <Link
                              href={`/blogs/${post.id}`}
                              className="hover:text-blue-600 transition-colors"
                            >
                              {post.title}
                            </Link>
                          </CardTitle>
                          <CardDescription className="mt-2">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                              {post.category}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>by {post.author.nickname}</span>
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {post.commentsCount}
                          </span>
                          <span>{post.viewCount} views</span>
                        </div>
                        <Button
                          variant={post.isLiked ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleLikePost(post.id)}
                          className="flex items-center space-x-1"
                        >
                          <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                          <span>{post.likesCount}</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleFetchPosts(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                    >
                      前へ
                    </Button>
                    <span className="flex items-center px-4 py-2 text-sm">
                      {currentPage} / {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => handleFetchPosts(currentPage + 1)}
                      disabled={currentPage === pagination.pages || loading}
                    >
                      次へ
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Popular Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">人気の投稿</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {posts
                    .sort((a, b) => b.likesCount - a.likesCount)
                    .slice(0, 5)
                    .map((post) => (
                      <div key={post.id} className="border-l-2 border-blue-500 pl-3">
                        <Link
                          href={`/blogs/${post.id}`}
                          className="text-sm font-medium hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          {post.title}
                        </Link>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Heart className="h-3 w-3 mr-1" />
                          {post.likesCount}
                          <MessageSquare className="h-3 w-3 ml-2 mr-1" />
                          {post.commentsCount}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">カテゴリ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {["初心者向け", "上級者向け", "おすすめ", "レビュー"].map((category) => {
                    const count = posts.filter(post => post.category === category).length
                    return (
                      <div key={category} className="flex justify-between items-center">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                          {category}
                        </span>
                        <span className="text-sm text-gray-500">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Affiliate Banner */}
            <AffiliateBanner 
              src="/images/banner/sidebar_banner.jpg" 
              alt="Sidebar Banner" 
              link="https://www.j-live.tv/LiveChat/acs.php?si=jw10000&pid=MLA5563"
              size="small"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
