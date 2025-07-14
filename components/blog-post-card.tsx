"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageCircle, Share, Play, Pause, Volume2 } from "lucide-react"
import EmojiReactions from "./emoji-reactions"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface BlogPost {
  id: string
  title: string
  content: string
  images?: string[]
  createdAt: string
  likes: number
  comments: number
  mood: string
  author: {
    name: string
    avatar: string
    stageName: string
  }
  mediaAttachments?: Array<{
    id: string
    url: string
    type: "IMAGE" | "VIDEO" | "AUDIO"
    originalName: string
    caption?: string
  }>
  reactions?: Array<{
    emoji: string
    count: number
    users: Array<{
      id: string
      nickname: string
      avatar?: string
    }>
  }>
}

interface BlogPostCardProps {
  post: BlogPost
  index: number
}

export default function BlogPostCard({ post, index }: BlogPostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const getMoodEmoji = (mood: string) => {
    const moods = {
      excited: "🎉",
      happy: "😊",
      peaceful: "😌",
      grateful: "🙏",
      determined: "💪",
    }
    return moods[mood as keyof typeof moods] || "💕"
  }

  const getMoodColor = (mood: string) => {
    const colors = {
      excited: "from-yellow-400 to-orange-400",
      happy: "from-pink-400 to-rose-400",
      peaceful: "from-blue-400 to-indigo-400",
      grateful: "from-purple-400 to-pink-400",
      determined: "from-red-400 to-pink-400",
    }
    return colors[mood as keyof typeof colors] || "from-pink-400 to-purple-400"
  }

  const handleAudioPlay = (audioId: string) => {
    if (playingAudio === audioId) {
      setPlayingAudio(null)
    } else {
      setPlayingAudio(audioId)
    }
  }

  const handleVideoPlay = (videoId: string) => {
    if (playingVideo === videoId) {
      setPlayingVideo(null)
    } else {
      setPlayingVideo(videoId)
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
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: data.isLiked ? "いいねしました！" : "いいねを取り消しました",
          description: data.isLiked ? "💕" : "",
        })
        // Refresh post data here
      }
    } catch (error) {
      console.error("Like error:", error)
      toast({
        title: "エラー",
        description: "いいねの処理に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const handleComment = async () => {
    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "コメントするにはログインしてください。",
        variant: "destructive",
      })
      return
    }

    if (!newComment.trim()) return

    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ content: newComment }),
      })

      if (response.ok) {
        setNewComment("")
        toast({
          title: "コメントを投稿しました！",
          description: "💬",
        })
        // Refresh comments here
      }
    } catch (error) {
      console.error("Comment error:", error)
      toast({
        title: "エラー",
        description: "コメントの投稿に失敗しました。",
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
        {/* Header with Mood */}
        <CardHeader className={`bg-gradient-to-r ${getMoodColor(post.mood)} text-white relative overflow-hidden`}>
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full"
                animate={{
                  x: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
                  y: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                style={{
                  left: Math.random() * 100 + "%",
                  top: Math.random() * 100 + "%",
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-white/50">
                <AvatarImage src={post.author.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-white/20 text-white">{post.author.stageName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg">{post.author.stageName}</h3>
                <p className="text-white/80 text-sm">{post.author.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{getMoodEmoji(post.mood)}</span>
              <Badge className="bg-white/20 text-white border-0">
                {new Date(post.createdAt).toLocaleDateString("ja-JP")}
              </Badge>
            </div>
          </div>

          <CardTitle className="mt-4 text-xl font-bold relative z-10">{post.title}</CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {/* Content */}
          <p className="text-gray-700 leading-relaxed mb-6">{post.content}</p>

          {/* Media Attachments */}
          {post.mediaAttachments && post.mediaAttachments.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {post.mediaAttachments.map((media) => (
                  <motion.div
                    key={media.id}
                    whileHover={{ scale: 1.02 }}
                    className="relative overflow-hidden rounded-lg"
                  >
                    {media.type === "IMAGE" && (
                      <img
                        src={media.url || "/placeholder.svg"}
                        alt={media.originalName}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}

                    {media.type === "VIDEO" && (
                      <div className="relative">
                        <video
                          src={media.url}
                          className="w-full h-48 object-cover rounded-lg"
                          controls={playingVideo === media.id}
                          poster="/placeholder.svg?height=200&width=300"
                        />
                        {playingVideo !== media.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                            <Button
                              size="lg"
                              onClick={() => handleVideoPlay(media.id)}
                              className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                            >
                              <Play className="w-8 h-8" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {media.type === "AUDIO" && (
                      <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            onClick={() => handleAudioPlay(media.id)}
                            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                          >
                            {playingAudio === media.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Volume2 className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">{media.originalName}</span>
                            </div>
                          </div>
                        </div>
                        {playingAudio === media.id && (
                          <audio
                            src={media.url}
                            autoPlay
                            controls
                            className="w-full mt-3"
                            onEnded={() => setPlayingAudio(null)}
                          />
                        )}
                      </div>
                    )}

                    {media.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <p className="text-white text-sm">{media.caption}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Legacy Images Support */}
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {post.images.map((image, imgIndex) => (
                <motion.div key={imgIndex} whileHover={{ scale: 1.05 }} className="relative overflow-hidden rounded-lg">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Blog image ${imgIndex + 1}`}
                    className="w-full h-48 object-cover"
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Emoji Reactions */}
          <div className="mb-4">
            <EmojiReactions
              postId={post.id}
              reactions={post.reactions || []}
              onReactionChange={() => {
                // Refresh post data
                window.location.reload()
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleLike} className="text-pink-600 hover:bg-pink-50">
                <Heart className="w-4 h-4 mr-1" />
                {post.likes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="text-blue-600 hover:bg-blue-50"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                {post.comments}
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-50">
                <Share className="w-4 h-4 mr-1" />
                シェア
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleTimeString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="space-y-4">
                  {/* Add Comment */}
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white text-sm">
                        {user?.nickname?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="コメントを書く..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={2}
                        className="border-pink-200 focus:border-pink-400 bg-white/90"
                      />
                      <Button
                        size="sm"
                        onClick={handleComment}
                        disabled={!newComment.trim()}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                      >
                        コメント
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
