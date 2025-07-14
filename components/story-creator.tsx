"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ImageIcon, Type, Smile, Send, X, Plus, Video } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface Sticker {
  id: string
  type: string
  emoji: string
  x: number
  y: number
  scale: number
  rotation: number
}

interface StoryCreatorProps {
  onStoryCreated?: (story: any) => void
}

export default function StoryCreator({ onStoryCreated }: StoryCreatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [storyType, setStoryType] = useState<"text" | "image" | "video" | null>(null)
  const [content, setContent] = useState("")
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [backgroundColor, setBackgroundColor] = useState("#FF69B4")
  const [textColor, setTextColor] = useState("#FFFFFF")
  const [fontSize, setFontSize] = useState("medium")
  const [fontStyle, setFontStyle] = useState("normal")
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showStickerPicker, setShowStickerPicker] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const backgroundColors = [
    "#FF69B4",
    "#FF1493",
    "#FF6347",
    "#FF4500",
    "#FFA500",
    "#FFD700",
    "#ADFF2F",
    "#00FF7F",
    "#00CED1",
    "#1E90FF",
    "#9370DB",
    "#8A2BE2",
    "#FF69B4",
    "#DC143C",
    "#000000",
  ]

  const availableStickers = [
    { type: "emoji", emoji: "💕", label: "Heart" },
    { type: "emoji", emoji: "✨", label: "Sparkles" },
    { type: "emoji", emoji: "🌸", label: "Cherry Blossom" },
    { type: "emoji", emoji: "🎵", label: "Music" },
    { type: "emoji", emoji: "⭐", label: "Star" },
    { type: "emoji", emoji: "🌙", label: "Moon" },
    { type: "emoji", emoji: "🦋", label: "Butterfly" },
    { type: "emoji", emoji: "🌈", label: "Rainbow" },
    { type: "emoji", emoji: "💫", label: "Dizzy" },
    { type: "emoji", emoji: "🎀", label: "Ribbon" },
    { type: "emoji", emoji: "👑", label: "Crown" },
    { type: "emoji", emoji: "💎", label: "Diamond" },
  ]

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = event.target.files?.[0]
    if (!file) return

    setMediaFile(file)
    setStoryType(type)

    const reader = new FileReader()
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const addSticker = (sticker: { type: string; emoji: string; label: string }) => {
    const newSticker: Sticker = {
      id: Date.now().toString(),
      type: sticker.type,
      emoji: sticker.emoji,
      x: Math.random() * 200 + 50,
      y: Math.random() * 200 + 50,
      scale: 1,
      rotation: 0,
    }
    setStickers((prev) => [...prev, newSticker])
    setShowStickerPicker(false)
  }

  const removeSticker = (stickerId: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== stickerId))
  }

  const handleStickerDrag = (stickerId: string, x: number, y: number) => {
    setStickers((prev) => prev.map((s) => (s.id === stickerId ? { ...s, x, y } : s)))
  }

  const createStory = async () => {
    if (!storyType || (storyType === "text" && !content.trim()) || (storyType !== "text" && !mediaFile)) {
      toast({
        title: "エラー",
        description: "ストーリーの内容を入力してください",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()

      if (storyType === "text") {
        formData.append("content", content)
        formData.append("mediaType", "TEXT")
        formData.append("backgroundColor", backgroundColor)
        formData.append("textColor", textColor)
        formData.append("fontSize", fontSize)
        formData.append("fontStyle", fontStyle)
      } else {
        formData.append("media", mediaFile!)
        formData.append("mediaType", storyType.toUpperCase())
      }

      if (stickers.length > 0) {
        formData.append("stickers", JSON.stringify(stickers))
      }

      const response = await fetch("/api/stories", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to create story")
      }

      const story = await response.json()

      toast({
        title: "ストーリーを投稿しました！",
        description: "24時間後に自動的に削除されます",
      })

      onStoryCreated?.(story)
      resetForm()
      setIsOpen(false)
    } catch (error) {
      console.error("Error creating story:", error)
      toast({
        title: "エラー",
        description: "ストーリーの投稿に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setStoryType(null)
    setContent("")
    setMediaFile(null)
    setMediaPreview(null)
    setBackgroundColor("#FF69B4")
    setTextColor("#FFFFFF")
    setFontSize("medium")
    setFontStyle("normal")
    setStickers([])
    setShowStickerPicker(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0 shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          ストーリー作成
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md p-0 bg-black text-white border-0">
        <DialogHeader className="p-4 border-b border-gray-800">
          <DialogTitle className="text-center">ストーリーを作成</DialogTitle>
        </DialogHeader>

        <div className="p-4">
          {!storyType ? (
            <div className="space-y-4">
              <h3 className="text-center text-gray-300 mb-6">作成方法を選択</h3>

              <div className="grid grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStoryType("text")}
                  className="flex flex-col items-center p-6 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl"
                >
                  <Type className="w-8 h-8 mb-2" />
                  <span className="text-sm">テキスト</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl"
                >
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-sm">写真</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => videoInputRef.current?.click()}
                  className="flex flex-col items-center p-6 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl"
                >
                  <Video className="w-8 h-8 mb-2" />
                  <span className="text-sm">動画</span>
                </motion.button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, "image")}
                className="hidden"
              />

              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => handleFileSelect(e, "video")}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Story Preview */}
              <div className="relative">
                <div
                  ref={canvasRef}
                  className="relative w-full h-96 rounded-xl overflow-hidden"
                  style={{
                    backgroundColor: storyType === "text" ? backgroundColor : "transparent",
                  }}
                >
                  {storyType === "text" && (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <div
                        className={`text-center break-words max-w-full ${
                          fontSize === "small" ? "text-lg" : fontSize === "large" ? "text-3xl" : "text-xl"
                        } ${fontStyle === "bold" ? "font-bold" : fontStyle === "italic" ? "italic" : "font-normal"}`}
                        style={{ color: textColor }}
                      >
                        {content || "ここにテキストを入力..."}
                      </div>
                    </div>
                  )}

                  {(storyType === "image" || storyType === "video") && mediaPreview && (
                    <>
                      {storyType === "image" ? (
                        <img
                          src={mediaPreview || "/placeholder.svg"}
                          alt="Story preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video src={mediaPreview} className="w-full h-full object-cover" controls />
                      )}
                    </>
                  )}

                  {/* Stickers */}
                  {stickers.map((sticker) => (
                    <motion.div
                      key={sticker.id}
                      drag
                      dragMomentum={false}
                      onDrag={(_, info) => handleStickerDrag(sticker.id, info.point.x, info.point.y)}
                      className="absolute cursor-move select-none"
                      style={{
                        left: sticker.x,
                        top: sticker.y,
                        transform: `scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
                      }}
                      whileHover={{ scale: sticker.scale * 1.1 }}
                    >
                      <div className="relative group">
                        <span className="text-3xl">{sticker.emoji}</span>
                        <button
                          onClick={() => removeSticker(sticker.id)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Add Sticker Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowStickerPicker(!showStickerPicker)}
                  className="absolute top-2 right-2 bg-black/50 border-white/20 text-white hover:bg-black/70"
                >
                  <Smile className="w-4 h-4" />
                </Button>
              </div>

              {/* Sticker Picker */}
              <AnimatePresence>
                {showStickerPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="bg-gray-900 rounded-lg p-4"
                  >
                    <div className="grid grid-cols-6 gap-2">
                      {availableStickers.map((sticker) => (
                        <button
                          key={sticker.emoji}
                          onClick={() => addSticker(sticker)}
                          className="p-2 text-2xl hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          {sticker.emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Text Story Controls */}
              {storyType === "text" && (
                <div className="space-y-4">
                  <Textarea
                    placeholder="ストーリーのテキストを入力..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white resize-none"
                    rows={3}
                  />

                  {/* Background Colors */}
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">背景色</label>
                    <div className="flex gap-2 flex-wrap">
                      {backgroundColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setBackgroundColor(color)}
                          className={`w-8 h-8 rounded-full border-2 ${
                            backgroundColor === color ? "border-white" : "border-gray-600"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Text Controls */}
                  <div className="flex gap-4">
                    <div>
                      <label className="text-sm text-gray-300 mb-1 block">文字色</label>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-12 h-8 rounded border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-300 mb-1 block">サイズ</label>
                      <select
                        value={fontSize}
                        onChange={(e) => setFontSize(e.target.value)}
                        className="bg-gray-900 border-gray-700 text-white rounded px-2 py-1"
                      >
                        <option value="small">小</option>
                        <option value="medium">中</option>
                        <option value="large">大</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-300 mb-1 block">スタイル</label>
                      <select
                        value={fontStyle}
                        onChange={(e) => setFontStyle(e.target.value)}
                        className="bg-gray-900 border-gray-700 text-white rounded px-2 py-1"
                      >
                        <option value="normal">標準</option>
                        <option value="bold">太字</option>
                        <option value="italic">斜体</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    setStoryType(null)
                  }}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  戻る
                </Button>

                <Button
                  onClick={createStory}
                  disabled={isUploading}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  {isUploading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      投稿中...
                    </div>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      投稿する
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
