import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
<<<<<<< HEAD
import { Heart, MessageSquare, Clock, User, Trophy, Medal, Award } from "lucide-react"
import Link from "next/link"
import AffiliateBanner from "@/components/affiliate-banner"

export const metadata = {
  title: "人気ランキング - momoLand",
  description: "いいね数に基づいた人気のライブチャット体験記ランキング",
=======
import { Button } from "@/components/ui/button"
import { Heart, MessageSquare, Clock, Trophy, Medal, Award, Wifi, WifiOff, RefreshCw, Eye } from "lucide-react"
import Link from "next/link"
import AffiliateBanner from "@/components/affiliate-banner"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import api from "@/api/axios"
import { Skeleton } from "@/components/ui/skeleton"
import socketService from "@/lib/socket"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

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
    avatar: string
  }
  rank: number
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
}

export default function RankingPage() {
  // Sample ranking data
  const rankingPosts = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `人気体験記 ${i + 1}`,
    author: `ユーザー${Math.floor(Math.random() * 20) + 1}`,
    excerpt: "この体験記は多くのユーザーから支持を得ている人気の投稿です。詳細な体験談と有益な情報が含まれています...",
    likes: Math.floor(Math.random() * 200) + 50,
    comments: Math.floor(Math.random() * 50) + 10,
    createdAt: `${Math.floor(Math.random() * 30) + 1}日前`,
    category: ["初心者向け", "上級者向け", "おすすめ", "レビュー"][Math.floor(Math.random() * 4)],
    rank: i + 1,
  }))
    .sort((a, b) => b.likes - a.likes)
    .map((post, index) => ({ ...post, rank: index + 1 }))

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-500">{rank}</span>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🏆 人気ランキング</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            いいね数に基づいた人気のライブチャット体験記ランキングです。
            多くのユーザーから支持を得ている投稿をチェックしてみましょう。
          </p>
        </div>

        <AffiliateBanner size="large" position="content" />

<<<<<<< HEAD
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
                  {post.author}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4 text-gray-500">
                    <span className="flex items-center font-semibold text-red-600">
                      <Heart className="w-4 h-4 mr-1 fill-current" />
                      {post.likes}
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1 text-blue-500" />
                      {post.comments}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {post.createdAt}
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
                        {post.author}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {post.createdAt}
                      </span>
                    </div>
                  </Link>
                </div>

                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="flex items-center font-semibold text-red-600">
                      <Heart className="w-4 h-4 mr-1 fill-current" />
                      {post.likes}
                    </span>
                    <span className="flex items-center text-blue-600">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {post.comments}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
=======
        {/* Content */}
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="w-full">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12">
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                        <div className="flex items-center space-x-2 w-10 h-10 border-2 border-pink-100 bg-pink-50 rounded-full justify-center items-center">
                          {getRankIcon(post.rank)}
                        </div>
                        <div>
                          <Link href={`/blogs/${post.id}`}>
                            <CardTitle className="text-lg hover:text-pink-600 transition-colors line-clamp-2">
                              {post.title}
                            </CardTitle>
                          </Link>
                          <CardDescription className="flex items-center space-x-4 mt-2">
                            <span className="flex items-center space-x-1">
                              <Avatar>
                                <AvatarImage src={post.author.avatar ? post.author.avatar : "/images/avatar/default.png"} />
                                <AvatarFallback>{post.author.nickname.charAt(0)}</AvatarFallback>
                              </Avatar>
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
                          <Eye className="w-4 h-4 text-blue-500" />
                          <span>{post.viewCount} 回閲覧</span>
                        </div>
                      </div>
                      <Link href={`/blogs/${post.id}`}>
                        <Button variant="outline" size="sm" className="hover:bg-pink-50 hover:text-pink-600 text-sm">
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
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4

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
    </div>
  )
}
