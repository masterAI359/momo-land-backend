"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface LoginModalProps {
  open: boolean
  onClose: () => void
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const [nickname, setNickname] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!nickname.trim() || !email.trim()) {
      setError("ニックネームとメールアドレスを入力してください。")
      return
    }

    if (nickname.length < 2) {
      setError("ニックネームは2文字以上で入力してください。")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("有効なメールアドレスを入力してください。")
      return
    }

    setIsSubmitting(true)

    const result = await login(nickname.trim(), email.trim())

    if (result.success) {
      toast({
        title: "登録完了",
        description: `${nickname}さん、momoLandへようこそ！`,
      })
      setNickname("")
      setEmail("")
      onClose()
    } else {
      setError(result.error || "登録に失敗しました。")
    }

    setIsSubmitting(false)
  }

  const handleClose = () => {
    setNickname("")
    setEmail("")
    setError("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-pink-500" />
            <span>ユーザー登録</span>
          </DialogTitle>
          <DialogDescription>ニックネームとメールアドレスを入力して、momoLandに参加しましょう。</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
              ニックネーム *
            </label>
            <Input
              id="nickname"
              type="text"
              placeholder="あなたのニックネーム"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">※ニックネームは他のユーザーと重複できません</p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス *
            </label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">※トラブル報告時の連絡用です</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-800 mb-2">登録後にできること：</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• ライブチャット体験記の投稿</li>
              <li>• グループチャットへの参加・作成</li>
              <li>• いいねやコメントの投稿</li>
              <li>• プライベートチャットルームの作成</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-pink-600 hover:bg-pink-700">
              {isSubmitting ? "登録中..." : "登録する"}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
              キャンセル
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
