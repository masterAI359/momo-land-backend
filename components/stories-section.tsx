"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import StoryRing from "./story-ring"
import StoryViewer from "./story-viewer"
import StoryCreator from "./story-creator"
import { motion } from "framer-motion"
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

export default function StoriesSection() {
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchStories = async () => {
    try {
      const response = await fetch("/api/stories", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch stories")
      }

      const stories = await response.json()
      setStoryGroups(stories)
    } catch (error) {
      console.error("Error fetching stories:", error)
      toast({
        title: "エラー",
        description: "ストーリーの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const user = await response.json()
        setCurrentUser(user)
      }
    } catch (error) {
      console.error("Error fetching current user:", error)
    }
  }

  useEffect(() => {
    fetchStories()
    fetchCurrentUser()
  }, [])

  const handleStoryCreated = (newStory: Story) => {
    fetchStories() // Refresh stories after creation
  }

  const handleStoryRingClick = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex)
    setIsViewerOpen(true)
  }

  const ownStoryGroup = storyGroups.find((group) => group.author.id === currentUser?.id)
  const otherStoryGroups = storyGroups.filter((group) => group.author.id !== currentUser?.id)

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl mb-8">
        <CardContent className="p-6">
          <div className="flex gap-4 overflow-x-auto">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
                <div className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl mb-8">
        <CardContent className="p-6">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {/* Own Story Ring */}
            {currentUser && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-shrink-0"
              >
                {ownStoryGroup ? (
                  <StoryRing
                    user={currentUser}
                    hasUnviewed={false}
                    isOwn={true}
                    onClick={() => {
                      const ownGroupIndex = storyGroups.findIndex((g) => g.author.id === currentUser.id)
                      handleStoryRingClick(ownGroupIndex)
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <StoryCreator onStoryCreated={handleStoryCreated} />
                    <span className="text-xs text-center max-w-[70px] truncate text-gray-700">あなた</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Other Users' Story Rings */}
            {otherStoryGroups.map((group, index) => (
              <motion.div
                key={group.author.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0"
              >
                <StoryRing
                  user={group.author}
                  hasUnviewed={group.hasUnviewed}
                  onClick={() => {
                    const actualIndex = storyGroups.findIndex((g) => g.author.id === group.author.id)
                    handleStoryRingClick(actualIndex)
                  }}
                />
              </motion.div>
            ))}

            {/* Empty State */}
            {storyGroups.length === 0 && (
              <div className="flex items-center justify-center w-full py-8">
                <div className="text-center text-gray-500">
                  <p className="text-sm">まだストーリーがありません</p>
                  <p className="text-xs mt-1">最初のストーリーを投稿してみましょう！</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Story Viewer */}
      <StoryViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        storyGroups={storyGroups}
        initialGroupIndex={selectedGroupIndex}
      />
    </>
  )
}
