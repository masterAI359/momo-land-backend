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
      <section className="bg-gradient-to-r from-pink-50 to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">ライブチャット体験記を共有しよう</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              あなたのライブチャット体験を投稿して、他のユーザーと情報を共有しませんか？
              リアルな口コミと体験談で、より良いライブチャットライフを。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <Link href="/blogs" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-pink-600 hover:bg-pink-700">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  ブログを見る
                </Button>
              </Link>
              <Link href="/timeline" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full bg-transparent">
                  <Clock className="w-5 h-5 mr-2" />
                  タイムライン
                </Button>
              </Link>
              <Link href="/chat" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full bg-transparent border-pink-200 text-pink-600 hover:bg-pink-50"
                >
                  <Users className="w-5 h-5 mr-2" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
      <section className="bg-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">投稿を始める</CardTitle>
              <CardDescription className="text-center">
                ニックネームと連絡用メールアドレスを入力して、投稿を開始しましょう。
                ※メールアドレスはトラブル報告時の連絡用です。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
                  ニックネーム
                </label>
                <Input id="nickname" placeholder="あなたのニックネームを入力" className="w-full" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  連絡用メールアドレス
                </label>
                <Input id="email" type="email" placeholder="example@email.com" className="w-full" />
              </div> */}
              <div className="flex flex-col sm:flex-row gap-4">
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
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">最新の投稿</h2>
          <p className="text-gray-600">最近投稿された体験記をチェックしてみましょう</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                    <CardTitle className="text-lg hover:text-pink-600 transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                    <CardDescription>投稿者: {post.author.nickname}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
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
                      <Button variant="ghost" size="sm" className="text-pink-600 hover:text-pink-700 p-0">
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
