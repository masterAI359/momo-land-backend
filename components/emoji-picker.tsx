"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Smile, Sparkles, Cake, Music, Star } from "lucide-react"

interface EmojiPickerProps {
  open: boolean
  onClose: () => void
  onEmojiSelect: (emoji: string) => void
  popularEmojis?: string[]
}

const emojiCategories = {
  hearts: {
    name: "ハート",
    icon: Heart,
    emojis: ["💕", "💖", "💗", "💘", "💝", "💞", "💟", "❤️", "🧡", "💛", "💚", "💙", "💜", "🤍", "🖤", "🤎"],
  },
  faces: {
    name: "表情",
    icon: Smile,
    emojis: ["🥰", "😍", "😘", "😊", "😌", "🤗", "🤭", "😋", "😉", "😇", "🥺", "😭", "😢", "😅", "😂", "🤣"],
  },
  cute: {
    name: "可愛い",
    icon: Star,
    emojis: ["🌸", "🌺", "🌻", "🌷", "🌹", "🦋", "🌿", "🐱", "🐰", "🐻", "🐼", "🦄", "🌙", "⭐", "🌟", "💫"],
  },
  sparkles: {
    name: "キラキラ",
    icon: Sparkles,
    emojis: ["✨", "⭐", "🌟", "💫", "🌈", "☀️", "🌞", "🌝", "🌛", "🌜", "💎", "👑", "🎀", "🎁", "🎉", "🎊"],
  },
  food: {
    name: "食べ物",
    icon: Cake,
    emojis: ["🍰", "🧁", "🍪", "🍫", "🍬", "🍭", "🍓", "🍒", "🍑", "🥝", "🍇", "🍉", "🍊", "🍋", "🍌", "🍍"],
  },
  activities: {
    name: "活動",
    icon: Music,
    emojis: ["🎵", "🎶", "🎤", "🎸", "🎹", "💃", "🕺", "🎭", "🎨", "📸", "💄", "👗", "👠", "💍", "🌺", "📚"],
  },
}

export default function EmojiPicker({ open, onClose, onEmojiSelect, popularEmojis = [] }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState("hearts")

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            絵文字を選択 ✨
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Popular Emojis */}
          {popularEmojis.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">人気の絵文字</h4>
              <div className="flex flex-wrap gap-2">
                {popularEmojis.slice(0, 8).map((emoji, index) => (
                  <motion.button
                    key={emoji}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEmojiClick(emoji)}
                    className="w-10 h-10 text-xl hover:bg-pink-100 rounded-lg transition-colors"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2">
            {["💕", "🥰", "✨", "🌸", "👏", "🎉"].map((emoji, index) => (
              <motion.button
                key={emoji}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleEmojiClick(emoji)}
                className="flex-1 h-12 text-2xl bg-gradient-to-r from-pink-100 to-purple-100 hover:from-pink-200 hover:to-purple-200 rounded-lg transition-all duration-200 shadow-sm"
              >
                {emoji}
              </motion.button>
            ))}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 bg-white/50 rounded-lg p-1">
            {Object.entries(emojiCategories).map(([key, category]) => {
              const IconComponent = category.icon
              return (
                <Button
                  key={key}
                  variant={activeCategory === key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveCategory(key)}
                  className={`flex-1 ${
                    activeCategory === key
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                      : "text-gray-600 hover:bg-pink-50"
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-1" />
                  <span className="text-xs">{category.name}</span>
                </Button>
              )
            })}
          </div>

          {/* Emoji Grid */}
          <div className="h-48 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-8 gap-2"
              >
                {emojiCategories[activeCategory as keyof typeof emojiCategories].emojis.map((emoji, index) => (
                  <motion.button
                    key={emoji}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    whileHover={{ scale: 1.3, rotate: 10 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleEmojiClick(emoji)}
                    className="w-10 h-10 text-xl hover:bg-pink-100 rounded-lg transition-all duration-200 flex items-center justify-center"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
