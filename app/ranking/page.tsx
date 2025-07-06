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
  const { toast } = useToast()
  const { user } = useAuth()

  const fetchRankingData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const response = await api.get("/posts/ranking")
      const posts = response.data.posts
      setRankingPosts(posts)
    } catch (error: any) {
      console.error("Failed to fetch ranking data:", error)
      toast({
        title: "エラー",
        description: "ランキングデータの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      if (showLoading) setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchRankingData(false)
  }

  useEffect(() => {
    fetchRankingData()
  }, [])

  // Set up WebSocket for real-time updates
  useEffect(() => {
    if (user) {
      console.log("🔗 Setting up WebSocket for ranking page")
      
      // Connect to WebSocket if not already connected
      if (!socketService.isConnectedToServer()) {
        const token = localStorage.getItem("token")
        if (token) {
          socketService.connect(token)
        }
      }
      
      // Join blog room to receive real-time updates
      socketService.joinBlogRoom()
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
          const sortedPosts = updatedPosts
            .sort((a, b) => b.likesCount - a.likesCount)
            .map((post, index) => ({ ...post, rank: index + 1 }))
          
          console.log("📊 Rankings updated after like")
          return sortedPosts
        })

        toast({
          title: "ランキング更新",
          description: "投稿のいいね数が更新されました",
        })
      }

      const handleNewPost = (newPost: any) => {
        console.log("📊 Ranking: New post received", newPost)
        setRankingPosts(prevPosts => {
          // Add rank to new post and merge with existing
          const newPostWithRank = { ...newPost, rank: 0 }
          const updatedPosts = [newPostWithRank, ...prevPosts]
          
          // Re-sort and update ranks
          const sortedPosts = updatedPosts
            .sort((a, b) => b.likesCount - a.likesCount)
            .map((post, index) => ({ ...post, rank: index + 1 }))
            .slice(0, 50) // Keep top 50
          
          console.log("📊 Rankings updated after new post")
          return sortedPosts
        })

        toast({
          title: "新しい投稿",
          description: `${newPost.author.nickname}さんが新しい投稿をしました`,
        })
      }

      const handleNewComment = (comment: any) => {
        console.log("📊 Ranking: New comment received", comment)
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
      const connectionInterval = setInterval(checkConnection, 1000) // Check every second

      return () => {
        socketService.leaveBlogRoom()
        socketService.offPostLike(handlePostLike)
        socketService.offNewPost(handleNewPost)
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
              </div>
            )}
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            いいね数に基づいた人気の体験記ランキングです。
            {user && isConnected && (
              <span className="text-green-600 font-semibold"> リアルタイムで更新されます！</span>
            )}
          </p>
        </div>

        {/* Affiliate Banner */}
        <AffiliateBanner size="large" position="header" />

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">ランキングデータを読み込み中...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {rankingPosts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">まだランキングデータがありません</p>
              </div>
            ) : (
              rankingPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getRankIcon(post.rank)}
                        <div>
                          <Badge className={`${getRankBadgeColor(post.rank)} mb-2`}>
                            #{post.rank}
                          </Badge>
                          <Link href={`/blogs/${post.id}`}>
                            <CardTitle className="text-lg hover:text-pink-600 transition-colors line-clamp-2">
                              {post.title}
                            </CardTitle>
                          </Link>
                          <CardDescription className="flex items-center space-x-4 mt-2">
                            <span className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{post.author.nickname}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatDate(post.createdAt)}</span>
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-4">
                        {post.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-1 text-red-500">
                          <Heart className="w-4 h-4" />
                          <span className="font-semibold">{post.likesCount}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-blue-500">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.commentsCount}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{post.viewCount} 回閲覧</span>
                        </div>
                      </div>
                      <Link href={`/blogs/${post.id}`}>
                        <Button variant="outline" size="sm">
                          詳細を見る
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Affiliate Banner */}
        <AffiliateBanner size="medium" position="content" />
      </div>
    </div>
  )
}
