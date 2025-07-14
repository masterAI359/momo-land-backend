"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X, ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface Story {
  id: string
  content?: string
  mediaUrl?: string
  mediaType: "TEXT" | "IMAGE" | "VIDEO"
  duration: number
  backgroundColor?: string
  textColor?: string
  fontSize?: string
  fontStyle?: string
  stickers?: any[]
  createdAt: string
  author: {
    id: string
    nickname: string
    avatar?: string
    femaleProfile?: {
      stageName: string
    }
  }
  _count: {
    views: number
  }
  hasViewed: boolean
}

interface StoryGroup {
  author: {
    id: string
    nickname: string
    avatar?: string
    femaleProfile?: {
      stageName: string
    }
  }
  stories: Story[]
  hasUnviewed: boolean
}

interface StoryViewerProps {
  isOpen: boolean
  onClose: () => void
  storyGroups: StoryGroup[]
  initialGroupIndex?: number
  initialStoryIndex?: number
}

export default function StoryViewer({
  isOpen,
  onClose,
  storyGroups,
  initialGroupIndex = 0,
  initialStoryIndex = 0,
}: StoryViewerProps) {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const currentGroup = storyGroups[currentGroupIndex]
  const currentStory = currentGroup?.stories[currentStoryIndex]

  const startProgress = useCallback(() => {
    if (!currentStory || isPaused) return

    const duration =
      currentStory.mediaType === "VIDEO"
        ? (videoRef.current?.duration || currentStory.duration) * 1000
        : currentStory.duration * 1000

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100 / (duration / 100)
        if (newProgress >= 100) {
          nextStory()
          return 0
        }
        return newProgress
      })
    }, 100)
  }, [currentStory, isPaused])

  const stopProgress = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }, [])

  const resetProgress = useCallback(() => {
    setProgress(0)
    stopProgress()
  }, [stopProgress])

  const nextStory = useCallback(() => {
    if (!currentGroup) return

    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1)
      resetProgress()
    } else if (currentGroupIndex < storyGroups.length - 1) {
      setCurrentGroupIndex((prev) => prev + 1)
      setCurrentStoryIndex(0)
      resetProgress()
    } else {
      onClose()
    }
  }, [currentGroup, currentStoryIndex, currentGroupIndex, storyGroups.length, onClose, resetProgress])

  const previousStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1)
      resetProgress()
    } else if (currentGroupIndex > 0) {
      const prevGroup = storyGroups[currentGroupIndex - 1]
      setCurrentGroupIndex((prev) => prev - 1)
      setCurrentStoryIndex(prevGroup.stories.length - 1)
      resetProgress()
    }
  }, [currentStoryIndex, currentGroupIndex, storyGroups, resetProgress])

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev)
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPaused])

  const handleTap = useCallback(
    (event: React.MouseEvent) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const width = rect.width

      if (x < width / 3) {
        previousStory()
      } else if (x > (width * 2) / 3) {
        nextStory()
      } else {
        togglePause()
      }
    },
    [previousStory, nextStory, togglePause],
  )

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }, [])

  useEffect(() => {
    if (isOpen && currentStory) {
      resetProgress()
      setTimeout(() => startProgress(), 100)
    }
    return () => stopProgress()
  }, [isOpen, currentStory, startProgress, stopProgress, resetProgress])

  useEffect(() => {
    if (isPaused) {
      stopProgress()
    } else if (isOpen && currentStory) {
      startProgress()
    }
  }, [isPaused, isOpen, currentStory, startProgress, stopProgress])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case "ArrowLeft":
          previousStory()
          break
        case "ArrowRight":
        case " ":
          event.preventDefault()
          nextStory()
          break
        case "Escape":
          onClose()
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isOpen, previousStory, nextStory, onClose])

  if (!currentGroup || !currentStory) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-screen p-0 bg-black border-0 rounded-none">
        <div
          className="relative w-full h-full overflow-hidden cursor-pointer"
          onClick={handleTap}
          onMouseMove={showControlsTemporarily}
        >
          {/* Progress Bars */}
          <div className="absolute top-2 left-2 right-2 z-20 flex gap-1">
            {currentGroup.stories.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{
                    width: index < currentStoryIndex ? "100%" : index === currentStoryIndex ? `${progress}%` : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-12 left-4 right-4 z-20 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border-2 border-white">
                    <AvatarImage src={currentGroup.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white">
                      {currentGroup.author.femaleProfile?.stageName?.charAt(0) ||
                        currentGroup.author.nickname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-white font-medium text-sm">
                      {currentGroup.author.femaleProfile?.stageName || currentGroup.author.nickname}
                    </div>
                    <div className="text-white/70 text-xs">
                      {new Date(currentStory.createdAt).toLocaleString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentStory.mediaType === "VIDEO" && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          togglePause()
                        }}
                        className="text-white hover:bg-white/20 p-2"
                      >
                        {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsMuted(!isMuted)
                          if (videoRef.current) {
                            videoRef.current.muted = !isMuted
                          }
                        }}
                        className="text-white hover:bg-white/20 p-2"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                    </>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      onClose()
                    }}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Story Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {currentStory.mediaType === "TEXT" && (
              <div
                className="w-full h-full flex items-center justify-center p-8"
                style={{ backgroundColor: currentStory.backgroundColor || "#FF69B4" }}
              >
                <div
                  className={`text-center break-words max-w-full ${
                    currentStory.fontSize === "small"
                      ? "text-lg"
                      : currentStory.fontSize === "large"
                        ? "text-3xl"
                        : "text-xl"
                  } ${
                    currentStory.fontStyle === "bold"
                      ? "font-bold"
                      : currentStory.fontStyle === "italic"
                        ? "italic"
                        : "font-normal"
                  }`}
                  style={{ color: currentStory.textColor || "#FFFFFF" }}
                >
                  {currentStory.content}
                </div>
              </div>
            )}

            {currentStory.mediaType === "IMAGE" && currentStory.mediaUrl && (
              <img
                src={currentStory.mediaUrl || "/placeholder.svg"}
                alt="Story"
                className="w-full h-full object-cover"
                onLoad={() => setIsLoading(false)}
                onLoadStart={() => setIsLoading(true)}
              />
            )}

            {currentStory.mediaType === "VIDEO" && currentStory.mediaUrl && (
              <video
                ref={videoRef}
                src={currentStory.mediaUrl}
                className="w-full h-full object-cover"
                autoPlay
                muted={isMuted}
                playsInline
                onLoadStart={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
                onEnded={nextStory}
              />
            )}

            {/* Stickers */}
            {currentStory.stickers?.map((sticker: any, index: number) => (
              <div
                key={index}
                className="absolute pointer-events-none"
                style={{
                  left: sticker.x,
                  top: sticker.y,
                  transform: `scale(${sticker.scale || 1}) rotate(${sticker.rotation || 0}deg)`,
                }}
              >
                <span className="text-3xl">{sticker.emoji}</span>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <AnimatePresence>
            {showControls && (
              <>
                {(currentStoryIndex > 0 || currentGroupIndex > 0) && (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      previousStory()
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </motion.button>
                )}

                {(currentStoryIndex < currentGroup.stories.length - 1 ||
                  currentGroupIndex < storyGroups.length - 1) && (
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      nextStory()
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </motion.button>
                )}
              </>
            )}
          </AnimatePresence>

          {/* Bottom Info */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 right-4 z-20"
              >
                <div className="flex items-center justify-between text-white/70 text-sm">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{currentStory._count.views} 回視聴</span>
                  </div>

                  <div className="text-xs">
                    {currentStoryIndex + 1} / {currentGroup.stories.length}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Tap Areas for Navigation */}
          <div className="absolute inset-0 flex">
            <div className="flex-1" />
            <div className="flex-1" />
            <div className="flex-1" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
