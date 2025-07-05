"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import api from "@/api/axios"

interface CommentFormProps {
  postId: string
  onCommentAdded?: (comment: any) => void
}

export default function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "コメントするにはログインしてください。",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: "入力エラー",
        description: "コメント内容を入力してください。",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post(`/posts/${postId}/comments`, {
        content: content.trim(),
      })

      toast({
        title: "コメント投稿完了",
        description: "コメントが正常に投稿されました！",
      })

      // Clear form after successful submission
      setContent("")
      
      // Call callback if provided
      if (onCommentAdded) {
        onCommentAdded(response.data.comment)
      }
    } catch (error: any) {
      console.error("Comment creation error:", error)
      toast({
        title: "コメント投稿エラー",
        description: error.response?.data?.error || "コメントの投稿に失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-gray-500 text-center">
            コメントするにはログインが必要です。
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <span>コメントを追加</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder="コメントを入力してください..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">{content.length}/1000文字</p>
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  投稿中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  コメント投稿
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 