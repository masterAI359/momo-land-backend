"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TroubleReportModalProps {
  open: boolean
  onClose: () => void
}

export default function TroubleReportModal({ open, onClose }: TroubleReportModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleReport = async () => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setIsSubmitted(true)

    toast({
      title: "トラブル報告を送信しました",
      description: "運営チームが確認次第、登録されたメールアドレスにご連絡いたします。",
    })

    // Auto close after 2 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      onClose()
    }, 2000)
  }

  const handleClose = () => {
    setIsSubmitted(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span>トラブル報告</span>
          </DialogTitle>
          <DialogDescription>技術的な問題やサイト内でのトラブルを報告できます。</DialogDescription>
        </DialogHeader>

        {!isSubmitted ? (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                <strong>報告内容について：</strong>
                <br />• 技術的な問題（サイトの不具合など）
                <br />• サイト内でのトラブル
                <br />• 不適切な投稿やコメント
                <br />• その他運営に関するお問い合わせ
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                報告を送信すると、運営チームが内容を確認し、
                登録されたメールアドレスに詳細をお伺いするご連絡をいたします。
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleReport}
                disabled={isSubmitting}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {isSubmitting ? "送信中..." : "トラブルを報告"}
              </Button>
              <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                キャンセル
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">報告を送信しました</h3>
            <p className="text-sm text-green-600">運営チームが確認次第、ご連絡いたします。</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
