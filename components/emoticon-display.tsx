"use client"

import { useState, useEffect } from "react"
import { modernEmoticons, type ModernEmoticon } from "./emoticon-picker"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Heart, Smile, Sparkles, Star } from "lucide-react"

interface EmoticonDisplayProps {
  postId: string
  emoticons: string[] // Array of emoticon IDs
  onReaction?: (emoticonId: string) => void
  showReactionButton?: boolean
  animated?: boolean
  size?: "sm" | "md" | "lg"
}

interface ReactionCounts {
  [emoticonId: string]: number
}

export default function EmoticonDisplay({ 
  postId, 
  emoticons: selectedEmoticons = [], 
  onReaction,
  showReactionButton = true,
  animated = true,
  size = "md"
}: EmoticonDisplayProps) {
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts>({})
  const [userReactions, setUserReactions] = useState<string[]>([])
  const [floatingReactions, setFloatingReactions] = useState<Array<{ id: string; emoticon: ModernEmoticon; timestamp: number }>>([])

  // Get emoticon objects from IDs
  const getEmoticonById = (id: string): ModernEmoticon | undefined => {
    return modernEmoticons.find((emoticon: ModernEmoticon) => emoticon.id === id)
  }

  // Handle reaction click
  const handleReaction = (emoticonId: string) => {
    if (onReaction) {
      onReaction(emoticonId)
    }

    // Update local state
    setReactionCounts(prev => ({
      ...prev,
      [emoticonId]: (prev[emoticonId] || 0) + 1
    }))

    // Add to user reactions
    setUserReactions(prev => 
      prev.includes(emoticonId) 
        ? prev.filter(id => id !== emoticonId)
        : [...prev, emoticonId]
    )

    // Add floating animation
    if (animated) {
      const emoticon = getEmoticonById(emoticonId)
      if (emoticon) {
        setFloatingReactions(prev => [
          ...prev,
          { id: Math.random().toString(), emoticon, timestamp: Date.now() }
        ])
      }
    }
  }

  // Remove floating reactions after animation
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingReactions(prev => 
        prev.filter(reaction => Date.now() - reaction.timestamp < 2000)
      )
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // Size configurations for SVG emoticons
  const sizeConfig = {
    sm: { emoticon: 16, container: "text-xs" },
    md: { emoticon: 24, container: "text-sm" },
    lg: { emoticon: 32, container: "text-base" }
  }

  // Get popular reactions (most used emoticons)
  const popularReactions = [
    "happy", "love", "sparkles", "star", "fire", "heart",
    "laugh", "surprised", "sad", "angry", "coffee", "sun"
  ]

  const displayedEmoticons = selectedEmoticons.map(getEmoticonById).filter(Boolean) as ModernEmoticon[]

  return (
    <TooltipProvider>
      <div className={`relative ${sizeConfig[size].container}`}>
        {/* Floating Reactions Animation */}
        {animated && floatingReactions.map(reaction => {
          const EmoticonComponent = reaction.emoticon.component
          return (
            <div
              key={reaction.id}
              className="absolute pointer-events-none z-50"
              style={{
                animation: `float-up-${reaction.id} 2s ease-out forwards`,
                left: `${Math.random() * 100}%`,
                top: '0px',
                zIndex: 1000
              }}
            >
              <EmoticonComponent size={sizeConfig[size].emoticon} className="drop-shadow-lg" />
              <style jsx>{`
                @keyframes float-up-${reaction.id} {
                  0% {
                    transform: translateY(0px) scale(1) rotate(0deg);
                    opacity: 1;
                  }
                  50% {
                    transform: translateY(-30px) scale(1.3) rotate(180deg);
                    opacity: 0.9;
                  }
                  100% {
                    transform: translateY(-60px) scale(0.8) rotate(360deg);
                    opacity: 0;
                  }
                }
              `}</style>
            </div>
          )
        })}

        {/* Selected Emoticons Display */}
        {displayedEmoticons.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {displayedEmoticons.map(emoticon => {
              const EmoticonComponent = emoticon.component
              const count = reactionCounts[emoticon.id] || 0
              const isUserReaction = userReactions.includes(emoticon.id)
              
              return (
                <Tooltip key={emoticon.id}>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="secondary"
                      className={`
                        transition-all duration-300 cursor-pointer px-3 py-2 rounded-xl border-2
                        ${isUserReaction 
                          ? 'bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 border-pink-400 text-pink-800 shadow-lg ring-2 ring-pink-200' 
                          : 'bg-gradient-to-r from-gray-50 to-white hover:from-pink-50 hover:via-purple-50 hover:to-indigo-50 border-gray-200 text-gray-700 hover:text-pink-700 hover:border-pink-300'
                        }
                        ${animated ? 'hover:scale-110 hover:shadow-xl active:scale-95' : ''}
                      `}
                      onClick={() => handleReaction(emoticon.id)}
                    >
                      <EmoticonComponent size={sizeConfig[size].emoticon} className="mr-2 drop-shadow-sm" />
                      <span className="font-semibold">{emoticon.unicode}</span>
                      {count > 0 && (
                        <span className="ml-2 text-xs bg-white/80 px-2 py-1 rounded-full font-bold shadow-sm">
                          {count}
                        </span>
                      )}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{emoticon.unicode} {emoticon.description}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        )}

        {/* Quick Reaction Buttons */}
        {showReactionButton && (
          <Card className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 border-pink-200 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-pink-800 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-pink-600" />
                  感情を表現
                </h4>
                <div className="flex items-center text-xs text-gray-500">
                  <Heart className="h-3 w-3 mr-1 text-pink-500" />
                  <span>クリックしてリアクション</span>
                </div>
              </div>
              
              <div className="grid grid-cols-6 gap-2">
                {popularReactions.map(emoticonId => {
                  const emoticon = getEmoticonById(emoticonId)
                  if (!emoticon) return null
                  
                  const EmoticonComponent = emoticon.component
                  const count = reactionCounts[emoticonId] || 0
                  const isUserReaction = userReactions.includes(emoticonId)
                  
                  return (
                    <Tooltip key={emoticonId}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReaction(emoticonId)}
                          className={`
                            relative h-12 w-12 p-1 rounded-xl transition-all duration-300 group
                            ${isUserReaction 
                              ? 'bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 ring-2 ring-pink-400 shadow-lg' 
                              : 'hover:bg-gradient-to-br hover:from-pink-100 hover:via-purple-100 hover:to-indigo-100 hover:shadow-md'
                            }
                            ${animated ? 'hover:scale-110 active:scale-95' : ''}
                          `}
                        >
                          <EmoticonComponent 
                            size={sizeConfig[size].emoticon} 
                            className="transition-all duration-200 group-hover:drop-shadow-md" 
                          />
                          {count > 0 && (
                            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                              {count > 9 ? '9+' : count}
                            </span>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{emoticon.unicode} {emoticon.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
              
              {/* Reaction Summary */}
              {Object.keys(reactionCounts).length > 0 && (
                <div className="mt-3 pt-3 border-t border-pink-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium flex items-center">
                      <Star className="h-3 w-3 mr-1 text-pink-500" />
                      総リアクション数
                    </span>
                    <span className="font-bold text-pink-600 bg-white px-2 py-1 rounded-full shadow-sm">
                      {Object.values(reactionCounts).reduce((sum, count) => sum + count, 0)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Mood Indicator */}
        {displayedEmoticons.length > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 rounded-xl border border-pink-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-600">
                <Smile className="h-3 w-3 mr-1 text-pink-500" />
                <span className="font-medium">投稿者の気分</span>
              </div>
              <div className="flex items-center space-x-2">
                {displayedEmoticons.slice(0, 3).map(emoticon => {
                  const EmoticonComponent = emoticon.component
                  return (
                    <div key={emoticon.id} className="p-1.5 bg-white rounded-full shadow-sm border border-pink-100">
                      <EmoticonComponent size={16} />
                    </div>
                  )
                })}
                {displayedEmoticons.length > 3 && (
                  <div className="text-xs text-gray-500 ml-2 bg-white px-2 py-1 rounded-full shadow-sm font-medium">
                    +{displayedEmoticons.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
} 