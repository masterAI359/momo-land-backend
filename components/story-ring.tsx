"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"

interface StoryRingProps {
  user: {
    id: string
    nickname: string
    avatar?: string
    femaleProfile?: {
      stageName: string
    }
  }
  hasUnviewed: boolean
  isOwn?: boolean
  onClick: () => void
  className?: string
}

export default function StoryRing({ user, hasUnviewed, isOwn = false, onClick, className = "" }: StoryRingProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (hasUnviewed) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [hasUnviewed])

  const displayName = user.femaleProfile?.stageName || user.nickname

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClick} className="relative">
        {/* Gradient Ring */}
        <div
          className={`absolute inset-0 rounded-full p-0.5 ${
            hasUnviewed ? "bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500" : "bg-gray-300"
          } ${isAnimating ? "animate-pulse" : ""}`}
        >
          <div className="w-full h-full bg-white rounded-full p-0.5">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white">
                {displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Add Icon for Own Story */}
        {isOwn && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
            <Plus className="w-3 h-3 text-white" />
          </div>
        )}

        {/* Unviewed Indicator */}
        {hasUnviewed && !isOwn && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
          />
        )}
      </motion.button>

      <span className="text-xs text-center max-w-[70px] truncate text-gray-700">{isOwn ? "あなた" : displayName}</span>
    </div>
  )
}
