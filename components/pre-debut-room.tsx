"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Users, MessageCircle, Crown, Video, Settings, Share } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PreDebutRoomProps {
  artistId: string
  roomType: "live" | "chat" | "showcase"
}

export default function PreDebutRoom({ artistId, roomType }: PreDebutRoomProps) {
  const [isLive, setIsLive] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [gifts, setGifts] = useState<any[]>([])

  // Animated background particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    color: ["pink", "purple", "blue", "yellow"][Math.floor(Math.random() * 4)],
  }))

  useEffect(() => {
    // Simulate live viewer count changes
    const interval = setInterval(() => {
      setViewerCount((prev) => prev + Math.floor(Math.random() * 10) - 5)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message = {
      id: Date.now(),
      user: "あなた",
      content: newMessage,
      timestamp: new Date(),
      type: "message",
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  const sendGift = (giftType: string) => {
    const gift = {
      id: Date.now(),
      user: "あなた",
      type: giftType,
      timestamp: new Date(),
    }

    setGifts((prev) => [...prev, gift])

    // Remove gift after animation
    setTimeout(() => {
      setGifts((prev) => prev.filter((g) => g.id !== gift.id))
    }, 3000)
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className={`absolute w-${particle.size} h-${particle.size} bg-${particle.color}-400 rounded-full opacity-30`}
            animate={{
              x: [particle.x + "%", particle.x + 20 + "%", particle.x + "%"],
              y: [particle.y + "%", particle.y - 20 + "%", particle.y + "%"],
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{
              left: particle.x + "%",
              top: particle.y + "%",
            }}
          />
        ))}
      </div>

      {/* Aurora Effect */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%), radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%), radial-gradient(circle at 60% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%), radial-gradient(circle at 60% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      <div className="relative z-10 h-screen flex">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-black/30 backdrop-blur-md border-b border-white/10 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 border-2 border-pink-400">
                  <AvatarImage src="/placeholder.svg?height=48&width=48" />
                  <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white">
                    桜
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-white font-bold text-lg">桜花 みお</h2>
                  <div className="flex items-center gap-2">
                    {isLive && <Badge className="bg-red-500 text-white animate-pulse">🔴 LIVE</Badge>}
                    <Badge className="bg-white/20 text-white">
                      <Users className="w-3 h-3 mr-1" />
                      {viewerCount.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                  <Share className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Video/Content Area */}
          <div className="flex-1 relative bg-black/20 backdrop-blur-sm">
            {roomType === "live" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="text-center"
                >
                  <div className="w-32 h-32 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Video className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">ライブ配信準備中</h3>
                  <p className="text-white/70">まもなく配信が始まります✨</p>
                </motion.div>
              </div>
            )}

            {roomType === "showcase" && (
              <div className="absolute inset-0 p-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden cursor-pointer"
                    >
                      <img
                        src={`/placeholder.svg?height=200&width=200`}
                        alt={`Showcase ${i}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Gift Animations */}
            <AnimatePresence>
              {gifts.map((gift) => (
                <motion.div
                  key={gift.id}
                  initial={{ x: -100, y: "50%", opacity: 0, scale: 0 }}
                  animate={{
                    x: "50vw",
                    y: ["-10%", "-50%", "-10%"],
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    rotate: [0, 360, 720],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 3, ease: "easeOut" }}
                  className="absolute pointer-events-none z-20"
                >
                  <div className="text-6xl">
                    {gift.type === "heart" && "💖"}
                    {gift.type === "star" && "⭐"}
                    {gift.type === "flower" && "🌸"}
                    {gift.type === "crown" && "👑"}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Bottom Controls */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-black/30 backdrop-blur-md border-t border-white/10 p-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex-1 flex items-center gap-2">
                <Input
                  placeholder="応援メッセージを送ろう..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Button
                  onClick={sendMessage}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => sendGift("heart")}
                  className="bg-red-500/80 hover:bg-red-500 text-white"
                >
                  💖
                </Button>
                <Button
                  size="sm"
                  onClick={() => sendGift("star")}
                  className="bg-yellow-500/80 hover:bg-yellow-500 text-white"
                >
                  ⭐
                </Button>
                <Button
                  size="sm"
                  onClick={() => sendGift("flower")}
                  className="bg-pink-500/80 hover:bg-pink-500 text-white"
                >
                  🌸
                </Button>
                <Button
                  size="sm"
                  onClick={() => sendGift("crown")}
                  className="bg-purple-500/80 hover:bg-purple-500 text-white"
                >
                  👑
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Chat Sidebar */}
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-80 bg-black/40 backdrop-blur-md border-l border-white/10 flex flex-col"
        >
          {/* Chat Header */}
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              チャット
            </h3>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/10 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-pink-300 font-medium text-sm">{message.user}</span>
                    <span className="text-white/50 text-xs">
                      {message.timestamp.toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-white text-sm">{message.content}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Fan Rankings */}
          <div className="p-4 border-t border-white/10">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-400" />
              トップファン
            </h4>
            <div className="space-y-2">
              {[
                { name: "ファン1", level: 95, gifts: 234 },
                { name: "ファン2", level: 87, gifts: 189 },
                { name: "ファン3", level: 76, gifts: 156 },
              ].map((fan, index) => (
                <div key={fan.name} className="flex items-center gap-3">
                  <div className="text-yellow-400 font-bold">#{index + 1}</div>
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white text-xs">
                      {fan.name.charAt(-1)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-white text-sm">{fan.name}</div>
                    <div className="text-white/50 text-xs">
                      Lv.{fan.level} • {fan.gifts}ギフト
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
