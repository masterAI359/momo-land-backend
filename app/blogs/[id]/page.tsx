"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageSquare, Clock, User, Eye, ArrowLeft } from "lucide-react"
import AffiliateBanner from "@/components/affiliate-banner"
import Link from "next/link"
import api from "@/api/axios"
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
  isLiked?: boolean
  createdAt: string
  updatedAt: string
  comments?: Comment[]
}

interface Comment {
  id: string
  content: string
  author: {
    id: string
    nickname: string
  }
  createdAt: string
}

export const metadata = {
  title: "ブログ詳細 - momoLand",
  description: "ライブチャット体験記の詳細ページ",
}

export default function BlogPostPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liking, setLiking] = useState(false)

  const fetchPost = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/posts/${params.id}`)
      setPost(response.data)
      setError(null)
    } catch (error: any) {
      console.error("Failed to fetch post:", error)
      setError("投稿の取得に失敗しました。")
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "いいねするにはログインしてください。",
        variant: "destructive",
      })
      return
    }

    try {
      setLiking(true)
      await api.post(`/posts/${params.id}/like`)
      
      // Update the post state
      setPost(prev => {
        if (!prev) return prev
        return {
          ...prev,
          isLiked: !prev.isLiked,
          likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1
        }
      })

      toast({
        title: post?.isLiked ? "いいねを取り消しました" : "いいねしました",
        description: "ありがとうございます！",
      })
    } catch (error: any) {
      console.error("Failed to like post:", error)
      toast({
        title: "エラー",
        description: "いいねの処理に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLiking(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    if (params.id) {
      fetchPost()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">投稿を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">{error || "投稿が見つかりませんでした。"}</p>
          <div className="mt-4 space-x-4">
            <Button onClick={fetchPost}>再試行</Button>
            <Link href="/blogs">
              <Button variant="outline">ブログ一覧に戻る</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/blogs">
          <Button variant="ghost" className="text-pink-600 hover:text-pink-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            ブログ一覧に戻る
          </Button>
        </Link>
      </div>

      {/* Post Content */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm bg-pink-100 text-pink-800 px-3 py-1 rounded-full">
              {post.category}
            </span>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {post.viewCount}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatDate(post.createdAt)}
              </span>
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {post.title}
          </CardTitle>
          <CardDescription className="text-base">
            投稿者: {post.author.nickname}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none mb-6">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {post.content}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                onClick={handleLike}
                disabled={liking}
                className={`flex items-center space-x-2 ${
                  post.isLiked ? "text-red-600" : "text-gray-600"
                }`}
              >
                <Heart className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
                <span>{post.likesCount}</span>
              </Button>
              <div className="flex items-center space-x-2 text-gray-600">
                <MessageSquare className="w-5 h-5" />
                <span>{post.commentsCount}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">コメント ({post.commentsCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-4">
              {post.comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{comment.author.nickname}</span>
                    <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">まだコメントがありません。</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
