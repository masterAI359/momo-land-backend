"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, MessageSquare, Clock, User, Trophy, Medal, Award, Wifi, WifiOff, RefreshCw } from "lucide-react"
import Link from "next/link"
import AffiliateBanner from "@/components/affiliate-banner"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import api from "@/api/axios"
import socketService from "@/lib/socket"

interface RankingPost {
  id: string
  title: string
  excerpt: string
  likesCount: number
  commentsCount: number
  viewCount: number
  category: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    nickname: string
  }
  rank: number
}

export default function RankingPage() {
  const [rankingPosts, setRankingPosts] = useState<RankingPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [testing, setTesting] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const fetchRankingData = async (showLoading = true, retryCount = 0): Promise<void> => {
    try {
      if (showLoading) setLoading(true)
      
      // Add a small delay to avoid race conditions
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
      }
      
      console.log(`🔄 Fetching ranking data (attempt ${retryCount + 1})`)
      
      // Try with explicit URL construction to avoid baseURL issues
      const baseURL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001/api' 
        : (process.env.SERVER_URL || 'http://localhost:3001/api')
      
      const response = await api.get("/posts/ranking", {
        timeout: 10000, // 10 second timeout
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      console.log("✅ Ranking data fetched successfully")
      const posts = response.data.posts
      setRankingPosts(posts)
    } catch (error: any) {
      console.error(`❌ Failed to fetch ranking data (attempt ${retryCount + 1}):`, error)
      
      // Retry up to 3 times for network errors
      if (retryCount < 2 && (
        error.code === 'NETWORK_ERROR' || 
        error.message?.includes('Network Error') ||
        error.message?.includes('ERR_NETWORK') ||
        !error.response
      )) {
        console.log(`🔄 Retrying... (${retryCount + 1}/3)`)
        return fetchRankingData(showLoading, retryCount + 1)
      }
      
      // Show specific error messages based on error type
      let errorMessage = "ランキングデータの取得に失敗しました"
      
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        errorMessage = "ネットワーク接続に問題があります。しばらくしてから再試行してください。"
      } else if (error.response?.status === 404) {
        errorMessage = "ランキングエンドポイントが見つかりません。"
      } else if (error.response?.status >= 500) {
        errorMessage = "サーバーエラーが発生しました。管理者にお問い合わせください。"
      }
      
      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive",
      })
      
      // Set empty array on final failure
      if (retryCount >= 2) {
        setRankingPosts([])
      }
    } finally {
      if (showLoading) setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchRankingData(false)
  }

  const testConnection = async () => {
    setTesting(true)
    try {
      console.log("🧪 Testing API connectivity...")
      
      // Test health endpoint first
      const healthResponse = await api.get("/health")
      console.log("✅ Health check passed:", healthResponse.data)
      
      // Test ranking endpoint
      const rankingResponse = await api.get("/posts/ranking")
      console.log("✅ Ranking endpoint test passed:", rankingResponse.data)
      
      toast({
        title: "接続テスト成功",
        description: "APIエンドポイントへの接続は正常です",
      })
      
      // Refresh data after successful test
      fetchRankingData(false)
      
    } catch (error: any) {
      console.error("❌ Connection test failed:", error)
      toast({
        title: "接続テスト失敗",
        description: `API接続に問題があります: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    fetchRankingData()
  }, [])

  // Set up WebSocket for real-time updates
  useEffect(() => {
    if (user) {
      console.log("🔗 Setting up WebSocket for ranking page")
      setIsConnected(socketService.isConnectedToServer())

      const handlePostLike = (data: { postId: string; likesCount: number; isLiked: boolean }) => {
        console.log("📊 Ranking: Post like received", data)
        setRankingPosts(prevPosts => {
          const updatedPosts = prevPosts.map(post => 
            post.id === data.postId 
              ? { ...post, likesCount: data.likesCount }
              : post
          )
          // Re-sort and update ranks
          return updatedPosts
            .sort((a, b) => b.likesCount - a.likesCount)
            .map((post, index) => ({ ...post, rank: index + 1 }))
        })
      }

      const handleNewPost = (newPost: any) => {
        setRankingPosts(prevPosts => {
          const updatedPosts = [newPost, ...prevPosts]
          // Re-sort and update ranks
          return updatedPosts
            .sort((a, b) => b.likesCount - a.likesCount)
            .map((post, index) => ({ ...post, rank: index + 1 }))
            .slice(0, 50) // Keep top 50
        })
      }

      const handleNewComment = (comment: any) => {
        setRankingPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === comment.postId 
              ? { ...post, commentsCount: post.commentsCount + 1 }
              : post
          )
        )
      }

      socketService.onPostLike(handlePostLike)
      socketService.onNewPost(handleNewPost)
      socketService.onNewComment(handleNewComment)

      // Update connection status
      const checkConnection = () => {
        setIsConnected(socketService.isConnectedToServer())
      }
      const connectionInterval = setInterval(checkConnection, 5000)

      return () => {
        socketService.offPostLike(handlePostLike)
        socketService.offNewPost(handleNewPost)
        socketService.offNewComment(handleNewComment)
        clearInterval(connectionInterval)
      }
    }
  }, [user])

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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-500">#{rank}</span>
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">🏆 人気ランキング</h1>
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
                  className="ml-2"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  onClick={testConnection}
                  disabled={testing}
                  variant="outline"
                  size="sm"
                  className="ml-2"
                >
                  {testing ? "テスト中..." : "接続テスト"}
                </Button>
              </div>
            )}
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            いいね数に基づいた人気のライブチャット体験記ランキングです。
            多くのユーザーから支持を得ている投稿をチェックしてみましょう。
            {user && " リアルタイムでランキングが更新されます。"}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">ランキングを読み込み中...</p>
          </div>
        ) : rankingPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">まだ投稿がありません。</p>
            <Link href="/post">
              <Button className="mt-4 bg-pink-600 hover:bg-pink-700">
                最初の投稿を作成する
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">

        <AffiliateBanner size="large" position="content" />

        {/* Top 3 Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {rankingPosts.slice(0, 3).map((post) => (
            <Card
              key={post.id}
              className={`relative overflow-hidden border-2 ${
                post.rank === 1
                  ? "border-yellow-300 bg-gradient-to-b from-yellow-50 to-yellow-100"
                  : post.rank === 2
                    ? "border-gray-300 bg-gradient-to-b from-gray-50 to-gray-100"
                    : "border-amber-300 bg-gradient-to-b from-amber-50 to-amber-100"
              }`}
            >
              <div className="absolute top-4 right-4">{getRankIcon(post.rank)}</div>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className={`text-xs ${getRankBadgeColor(post.rank)}`}>#{post.rank} 位</Badge>
                  <Badge className="text-xs bg-pink-100 text-pink-800 border-pink-200">{post.category}</Badge>
                </div>
                <CardTitle className="text-lg">{post.title}</CardTitle>
                <CardDescription className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {post.author.nickname}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4 text-gray-500">
                    <span className="flex items-center font-semibold text-red-600">
                      <Heart className="w-4 h-4 mr-1 fill-current" />
                      {post.likesCount}
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1 text-blue-500" />
                      {post.commentsCount}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </div>
                <Link href={`/blogs/${post.id}`} className="block mt-3">
                  <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                    詳細を見る
                  </button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Full Ranking List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>完全ランキング</span>
            </CardTitle>
            <CardDescription>すべての人気投稿を順位順で表示しています</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rankingPosts.map((post) => (
              <div
                key={post.id}
                className={`flex items-center space-x-4 p-4 rounded-lg border transition-colors hover:bg-gray-50 ${
                  post.rank <= 3
                    ? "bg-gradient-to-r from-yellow-50 to-pink-50 border-yellow-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex-shrink-0 w-12 text-center">
                  {post.rank <= 3 ? (
                    getRankIcon(post.rank)
                  ) : (
                    <span className="text-lg font-bold text-gray-500">#{post.rank}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge className={`text-xs ${getRankBadgeColor(post.rank)}`}>#{post.rank}</Badge>
                    <Badge className="text-xs bg-pink-100 text-pink-800 border-pink-200">{post.category}</Badge>
                  </div>
                  <Link href={`/blogs/${post.id}`} className="block hover:text-pink-600 transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{post.excerpt}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {post.author.nickname}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </Link>
                </div>

                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="flex items-center font-semibold text-red-600">
                      <Heart className="w-4 h-4 mr-1 fill-current" />
                      {post.likesCount}
                    </span>
                    <span className="flex items-center text-blue-600">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {post.commentsCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <AffiliateBanner size="medium" position="content" />

        {/* Ranking Info */}
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
          <CardHeader>
            <CardTitle className="text-pink-800">📊 ランキングについて</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-pink-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">🏆 ランキングの仕組み</h4>
                <ul className="text-sm space-y-1">
                  <li>• いいね数に基づいて順位を決定</li>
                  <li>• 毎日自動更新されます</li>
                  <li>• 上位3位は特別表示</li>
                  <li>• 全ての投稿が対象です</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">💡 人気投稿のコツ</h4>
                <ul className="text-sm space-y-1">
                  <li>• 詳細で具体的な体験談を書く</li>
                  <li>• 読みやすい文章構成を心がける</li>
                  <li>• 有益な情報を含める</li>
                  <li>• 他のユーザーとの交流を大切に</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
          </div>
        )}
      </div>
    </div>
  )
}
