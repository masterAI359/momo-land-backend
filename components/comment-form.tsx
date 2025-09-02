"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, Send, AlertCircle, User } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import api from "@/api/axios"
import { Badge } from "@/components/ui/badge"
import { LoadingButton } from "@/components/ui/loading-states"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface CommentFormProps {
  postId: string
  onCommentAdded?: (comment: any) => void
}

const commentSchema = z.object({
  content: z
    .string()
    .min(1, "コメント内容を入力してください")
    .max(500, "コメントは500文字以内で入力してください"),
})

type CommentFormData = z.infer<typeof commentSchema>

export default function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [error, setError] = useState("")
  const { user } = useAuth()
  const { toast } = useToast()

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  })

  const handleSubmit = async (data: CommentFormData) => {
    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "コメントするにはログインしてください。",
        variant: "destructive",
      })
      return
    }

    try {
      setError("")
      const response = await api.post(`/posts/${postId}/comments`, {
        content: data.content.trim(),
      })

      const newComment = {
        id: response.data.comment.id,
        content: response.data.comment.content,
        createdAt: response.data.comment.createdAt,
        author: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar ? user.avatar : "/images/avatar/default.png",
        },
      }

      if (onCommentAdded) {
        onCommentAdded(newComment)
      }

      form.reset()
      
      toast({
        title: "コメント投稿完了",
        description: "コメントが投稿されました。",
      })
    } catch (error: any) {
      console.error("Comment error:", error)
      setError(error.response?.data?.error || "コメントの投稿に失敗しました")
    }
  }

  if (!user) {
    return (
      <Card className="border-dashed border-gray-300">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">コメントするにはログインが必要です</p>
            <Button
              onClick={() => {
                toast({
                  title: "ログインが必要です",
                  description: "コメント機能を使用するには、ログインしてください。",
                  variant: "destructive",
                })
              }}
              className="bg-pink-600 hover:bg-pink-700"
            >
              ログインする
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-pink-200 bg-pink-50/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <MessageSquare className="w-5 h-5 text-pink-600" />
          <span>コメントを投稿</span>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Avatar>
              <AvatarImage src={user.avatar ? user.avatar : "/images/avatar/default.png"} />
              <AvatarFallback>{user.nickname.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{user.nickname}</span>
            {user.isGuest && (
              <Badge variant="secondary" className="text-xs">
                ゲスト
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>コメント内容</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="この投稿についてのコメントを入力してください..."
                      className="min-h-[100px] resize-none border-pink-200 focus:border-pink-400"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {500 - field.value.length} 文字残り
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={form.formState.isSubmitting || !form.watch("content")}
              >
                クリア
              </Button>
              <LoadingButton
                type="submit"
                loading={form.formState.isSubmitting}
                loadingText="投稿中..."
                className="bg-pink-600 hover:bg-pink-700 gap-2"
              >
                <Send className="w-4 h-4" />
                コメント投稿
              </LoadingButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 