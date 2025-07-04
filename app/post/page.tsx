"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PenTool, Save, Eye, AlertCircle, Wifi, WifiOff } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import LoginModal from "@/components/login-modal"
import api from "@/api/axios"
import socketService from "@/lib/socket"

export default function PostPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("初心者向け")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const categories = ["初心者向け", "上級者向け", "おすすめ", "レビュー"]

  // Check WebSocket connection status
  useEffect(() => {
    if (user) {
      setIsConnected(socketService.isConnectedToServer())
      const checkConnection = () => {
        setIsConnected(socketService.isConnectedToServer())
      }
      const connectionInterval = setInterval(checkConnection, 5000)
      return () => clearInterval(connectionInterval)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setShowLoginModal(true)
      return
    }

    if (!title.trim() || !content.trim()) {
      toast({
        title: "入力エラー",
        description: "タイトルと内容を入力してください。",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post("/posts", {
        title: title.trim(),
        content: content.trim(),
        category,
      })

      console.log("response =================", response)
      
      toast({
        title: "投稿完了",
        description: "体験記が正常に投稿されました！",
      })

      // Clear form after successful submission
      setTitle("")
      setContent("")
      setCategory("初心者向け")
      
      // Optionally redirect to the new post
      // router.push(`/blogs/${response.data.post.id}`)
    } catch (error: any) {
      console.error("Post creation error:", error)
      toast({
        title: "投稿エラー",
        description: error.response?.data?.error || "投稿に失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center py-12">
          <CardContent>
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">ログインが必要です</h2>
            <p className="text-gray-600 mb-6">体験記を投稿するには、ユーザー登録・ログインが必要です。</p>
            <Button onClick={() => setShowLoginModal(true)} className="bg-pink-600 hover:bg-pink-700">
              ログイン・登録
            </Button>
          </CardContent>
        </Card>
        <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">✍️ 体験記投稿</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            あなたのライブチャット体験を詳しく投稿して、他のユーザーと共有しましょう。
            リアルな体験談は多くの人の参考になります。
          </p>
        </div>

        {/* Post Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PenTool className="w-5 h-5 text-pink-600" />
                <span>新しい体験記を作成</span>
              </div>
              {isConnected ? (
                <div className="flex items-center text-green-600">
                  <Wifi className="w-4 h-4 mr-1" />
                  <span className="text-sm">リアルタイム投稿</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <WifiOff className="w-4 h-4 mr-1" />
                  <span className="text-sm">接続なし</span>
                </div>
              )}
            </CardTitle>
            <CardDescription>投稿者: {user.nickname} として投稿されます</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  タイトル *
                </label>
                <Input
                  id="title"
                  type="text"
                  placeholder="体験記のタイトルを入力してください"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">{title.length}/100文字</p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリー</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge
                      key={cat}
                      className={`cursor-pointer transition-colors ${
                        category === cat ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-pink-100"
                      }`}
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  体験記の内容 *
                </label>
                <Textarea
                  id="content"
                  placeholder="あなたのライブチャット体験を詳しく書いてください。&#10;&#10;例：&#10;・どのサイトを利用したか&#10;・どんな体験をしたか&#10;・良かった点、改善点&#10;・他のユーザーへのアドバイス&#10;&#10;など、具体的で参考になる内容を心がけてください。"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">{content.length}文字</p>
              </div>

              {/* Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">📝 投稿ガイドライン</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• 実際の体験に基づいた内容を投稿してください</li>
                  <li>• 他のユーザーの参考になる具体的な情報を含めてください</li>
                  <li>• 不適切な内容や誹謗中傷は禁止されています</li>
                  <li>• 個人情報や特定の女性の情報は掲載しないでください</li>
                  <li>• AI監視システムにより不適切な投稿は自動的に検出されます</li>
                </ul>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !content.trim()}
                  className="flex-1 bg-pink-600 hover:bg-pink-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      投稿中...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      投稿する
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-transparent"
                  onClick={() => {
                    // Preview functionality could be added here
                    toast({
                      title: "プレビュー機能",
                      description: "プレビュー機能は今後実装予定です。",
                    })
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  プレビュー
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
          <CardHeader>
            <CardTitle className="text-pink-800">💡 人気投稿のコツ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-pink-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">✨ 内容のポイント</h4>
                <ul className="text-sm space-y-1">
                  <li>• 具体的な体験談を詳しく書く</li>
                  <li>• 良かった点と改善点を両方記載</li>
                  <li>• 料金や使いやすさなど実用的な情報</li>
                  <li>• 初心者向けのアドバイスを含める</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">📝 文章のコツ</h4>
                <ul className="text-sm space-y-1">
                  <li>• 読みやすい段落構成を心がける</li>
                  <li>• 見出しや箇条書きを活用する</li>
                  <li>• 感想だけでなく事実も含める</li>
                  <li>• 他のユーザーの立場に立って書く</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
