"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Heart } from "lucide-react"
import EmojiPicker from "./emoji-picker"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface EmojiReaction {
  emoji: string
  count: number
  users: Array<{
    id: string
    nickname: string
    avatar?: string
  }>
}

interface EmojiReactionsProps {
  postId?: string
  commentId?: string
  reactions: EmojiReaction[]
  onReactionChange?: () => void
}

export default function EmojiReactions({ postId, commentId, reactions, onReactionChange }: EmojiReactionsProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [popularEmojis, setPopularEmojis] = useState<string[]>([])
  const [flyingEmojis, setFlyingEmojis] = useState<Array<{ id: string; emoji: string; x: number; y: number }>>([])
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchPopularEmojis()
  }, [])

  const fetchPopularEmojis = async () => {
    try {
      const response = await fetch("/api/emoji/popular")
      if (response.ok) {
        const data = await response.json()
        setPopularEmojis(data.popularEmojis.map((item: any) => item.emoji))
      }
    } catch (error) {
      console.error("Failed to fetch popular emojis:", error)
    }
  }

  const handleEmojiSelect = async (emoji: string) => {
    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "絵文字リアクションを使用するにはログインしてください。",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/emoji/react", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          emoji,
          postId,
          commentId,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Add flying emoji animation
        const rect = document.getElementById(`reactions-${postId || commentId}`)?.getBoundingClientRect()
        if (rect) {
          const flyingEmoji = {
            id: Date.now().toString(),
            emoji,
            x: rect.left + Math.random() * rect.width,
            y: rect.top + rect.height / 2,
          }
          setFlyingEmojis((prev) => [...prev, flyingEmoji])

          // Remove flying emoji after animation
          setTimeout(() => {
            setFlyingEmojis((prev) => prev.filter((fe) => fe.id !== flyingEmoji.id))
          }, 2000)
        }

        toast({
          title: data.action === "added" ? "リアクションを追加しました！" : "リアクションを削除しました",
          description: `${emoji} ${data.action === "added" ? "を追加しました" : "を削除しました"}`,
        })

        onReactionChange?.()
      }
    } catch (error) {
      console.error("Failed to react:", error)
      toast({
        title: "エラー",
        description: "リアクションの送信に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const handleReactionClick = (emoji: string) => {
    handleEmojiSelect(emoji)
  }

  const getUserReaction = (reaction: EmojiReaction) => {
    return user ? reaction.users.find((u) => u.id === user.id) : null
  }

  return (
    <div className="relative">
      <div id={`reactions-${postId || commentId}`} className="flex items-center gap-2 flex-wrap">
        {/* Existing Reactions */}
        <AnimatePresence>
          {reactions.map((reaction) => {
            const isUserReacted = getUserReaction(reaction)
            return (
              <motion.button
                key={reaction.emoji}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleReactionClick(reaction.emoji)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all duration-200 ${
                  isUserReacted
                    ? "bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300 shadow-md"
                    : "bg-gray-100 hover:bg-pink-50 border border-gray-200"
                }`}
              >
                <span className="text-base">{reaction.emoji}</span>
                <span className={`font-medium ${isUserReacted ? "text-pink-700" : "text-gray-600"}`}>
                  {reaction.count}
                </span>
              </motion.button>
            )
          })}
        </AnimatePresence>

        {/* Add Reaction Button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEmojiPicker(true)}
            className="border-dashed border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400 transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-1" />
            <Heart className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Popular Emoji Shortcuts */}
        {reactions.length === 0 && (
          <div className="flex gap-1 ml-2">
            {["💕", "🥰", "✨", "👏"].map((emoji, index) => (
              <motion.button
                key={emoji}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.2, rotate: 10 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => handleEmojiSelect(emoji)}
                className="w-8 h-8 text-lg hover:bg-pink-100 rounded-full transition-all duration-200 flex items-center justify-center"
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Flying Emoji Animations */}
      <AnimatePresence>
        {flyingEmojis.map((flyingEmoji) => (
          <motion.div
            key={flyingEmoji.id}
            initial={{
              x: flyingEmoji.x,
              y: flyingEmoji.y,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              x: flyingEmoji.x + (Math.random() - 0.5) * 200,
              y: flyingEmoji.y - 100,
              scale: [1, 1.5, 0],
              opacity: [1, 1, 0],
              rotate: [0, 360],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="fixed pointer-events-none z-50 text-2xl"
            style={{ left: 0, top: 0 }}
          >
            {flyingEmoji.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Emoji Picker */}
      <EmojiPicker
        open={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelect={handleEmojiSelect}
        popularEmojis={popularEmojis}
      />
    </div>
  )
}
