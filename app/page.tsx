"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageSquare, Clock, Users, TrendingUp, Heart } from "lucide-react"
import Link from "next/link"
import AffiliateBanner from "@/components/affiliate-banner"
import FeatureCard from "@/components/feature-card"
import api from "@/api/axios"

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
  createdAt: string
}

export default function HomePage() {
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        setLoading(true)
        const response = await api.get('/posts?limit=3&sortBy=createdAt')
        setRecentPosts(response.data.posts)
        setError(null)
      } catch (error: any) {
        console.error("Failed to fetch recent posts:", error)
        setError("最新の投稿を取得できませんでした。")
      } finally {
        setLoading(false)
      }
    }

    fetchRecentPosts()
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
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-50 to-purple-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
              ライブチャット体験記を共有しよう
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2">
              あなたのライブチャット体験を投稿して、他のユーザーと情報を共有しませんか？
              <br className="hidden sm:inline" />
              リアルな口コミと体験談で、より良いライブチャットライフを。
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-lg mx-auto px-4">
              <Link href="/blogs" className="w-full sm:w-auto">
                <Button size="lg" className="w-full text-sm sm:text-base bg-pink-600 hover:bg-pink-700 py-3 sm:py-2">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  ブログを見る
                </Button>
              </Link>
              <Link href="/timeline" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full text-sm sm:text-base bg-transparent py-3 sm:py-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  タイムライン
                </Button>
              </Link>
              <Link href="/chat" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full text-sm sm:text-base bg-transparent border-pink-200 text-pink-600 hover:bg-pink-50 py-3 sm:py-2"
                >
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  グループチャット
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <AffiliateBanner size="large" position="header" src="/images/banner/main_header.jpg" alt="Affiliate Banner" link="https://www.j-live.tv/LiveChat/acs.php?si=jw10000&pid=MLA5563" />

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <FeatureCard
            icon={<MessageSquare className="w-6 h-6 text-pink-600" />}
            title="体験記投稿"
            description="あなたのライブチャット体験を詳しく投稿して、他のユーザーと共有できます。"
            href="/post"
            requiresAuth={true}
          />

          <FeatureCard
            icon={<Users className="w-6 h-6 text-pink-600" />}
            title="コミュニティ"
            description="いいねやコメント機能で、ユーザー同士の交流を深めることができます。"
            href="/blogs"
            requiresAuth={false}
          />

          <FeatureCard
            icon={<TrendingUp className="w-6 h-6 text-pink-600" />}
            title="人気ランキング"
            description="いいね数に基づいた人気の体験記ランキングをチェックできます。"
            href="/ranking"
            requiresAuth={false}
          />

          <FeatureCard
            icon={<Users className="w-6 h-6 text-pink-600" />}
            title="グループチャット"
            description="リアルタイムでユーザー同士が交流できるロマンチックなチャットルーム機能です。"
            href="/chat"
            requiresAuth={true}
          />
        </div>
      </section>

      {/* User Registration Section */}
      <section className="bg-white py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-center text-lg sm:text-xl md:text-2xl">投稿を始める</CardTitle>
              <CardDescription className="text-center text-sm sm:text-base leading-relaxed px-2">
                ニックネームと連絡用メールアドレスを入力して、投稿を開始しましょう。
                <br className="hidden sm:inline" />
                ※メールアドレスはトラブル報告時の連絡用です。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <FeatureCard
                  icon={<MessageSquare className="w-4 h-4 mr-2" />}
                  title="ブログを投稿"
                  href="/post"
                  requiresAuth={true}
                  isButton={true}
                  buttonClass="flex-1 bg-pink-600 hover:bg-pink-700"
                />
                <Link href="/timeline" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Clock className="w-4 h-4 mr-2" />
                    タイムラインを見る
                  </Button>
                </Link>
                <FeatureCard
                  icon={<Users className="w-4 h-4 mr-2" />}
                  title="チャットに参加"
                  href="/chat"
                  requiresAuth={true}
                  isButton={true}
                  buttonClass="flex-1 bg-transparent border-pink-200 text-pink-600 hover:bg-pink-50"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <AffiliateBanner size="medium" position="content" src="/images/banner/main_footer.jpg" link="https://www.j-live.tv/LiveChat/acs.php?si=jw10000&pid=MLA5563" alt="Affiliate Banner" />

      {/* Recent Posts Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">最新の投稿</h2>
          <p className="text-sm sm:text-base text-gray-600 px-2">最近投稿された体験記をチェックしてみましょう</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {loading ? (
            // Loading skeletons
            [...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-full text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                再読み込み
              </Button>
            </div>
          ) : recentPosts.length > 0 ? (
            // Real posts from API
            recentPosts.map((post) => (
              <Link key={post.id} href={`/blogs/${post.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                    <CardTitle className="text-base sm:text-lg hover:text-pink-600 transition-colors line-clamp-2 leading-tight">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">投稿者: {post.author.nickname}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 sm:pt-4">
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <span className="flex items-center">
                          <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-red-500" />
                          <span className="text-xs sm:text-sm">{post.likesCount}</span>
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-500" />
                          <span className="text-xs sm:text-sm">{post.commentsCount}</span>
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-pink-600 hover:text-pink-700 p-0 text-xs sm:text-sm">
                        続きを読む →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            // No posts state
            <div className="col-span-full text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">まだ投稿がありません</p>
              <FeatureCard
                icon={<MessageSquare className="w-4 h-4 mr-2" />}
                title="最初の投稿をする"
                href="/post"
                requiresAuth={true}
                isButton={true}
                buttonClass="bg-pink-600 hover:bg-pink-700"
              />
            </div>
          )}
        </div>

        <div className="text-center">
          <Link href="/blogs">
            <Button variant="outline" size="lg">
              すべての投稿を見る
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
