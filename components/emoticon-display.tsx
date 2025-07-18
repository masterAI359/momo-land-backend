"use client"

import { useState, useEffect } from "react"
import { type Emoticon, emoticons } from "./emoticon-picker"
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
  [key: string]: number
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
  const [floatingReactions, setFloatingReactions] = useState<Array<{ id: string; emoticon: Emoticon; timestamp: number }>>([])

  // Get emoticon objects from IDs
  const getEmoticonById = (id: string) => {
    return emoticons.find(emoticon => emoticon.id === id)
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

  // Size classes
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }

  const containerSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }

  // Get popular reactions (most used emoticons)
  const popularReactions = [
    "happy", "love", "sparkles", "star", "fire", "heart",
    "laugh", "surprised", "crown", "gem", "rainbow", "music"
  ]

  const displayedEmoticons = selectedEmoticons.map(getEmoticonById).filter(Boolean) as Emoticon[]

  return (
    <TooltipProvider>
      <div className={`relative ${containerSizeClasses[size]}`}>
        {/* Floating Reactions Animation */}
        {animated && floatingReactions.map(reaction => {
          const IconComponent = reaction.emoticon.icon
          return (
            <div
              key={reaction.id}
              className="absolute pointer-events-none animate-bounce"
              style={{
                animation: `float-up-${reaction.id} 2s ease-out forwards`,
                left: `${Math.random() * 100}%`,
                top: '0px',
                zIndex: 1000
              }}
            >
              <IconComponent className={`${sizeClasses[size]} ${reaction.emoticon.color}`} />
              <style jsx>{`
                @keyframes float-up-${reaction.id} {
                  0% {
                    transform: translateY(0px) scale(1);
                    opacity: 1;
                  }
                  50% {
                    transform: translateY(-30px) scale(1.2);
                    opacity: 0.8;
                  }
                  100% {
                    transform: translateY(-60px) scale(0.8);
                    opacity: 0;
                  }
                }
              `}</style>
            </div>
          )
        })}

        {/* Selected Emoticons Display */}
        {displayedEmoticons.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {displayedEmoticons.map(emoticon => {
              const IconComponent = emoticon.icon
              const count = reactionCounts[emoticon.id] || 0
              const isUserReaction = userReactions.includes(emoticon.id)
              
              return (
                <Tooltip key={emoticon.id}>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="secondary"
                      className={`
                        transition-all duration-200 cursor-pointer
                        ${isUserReaction 
                          ? 'bg-gradient-to-r from-pink-100 to-purple-100 border-pink-300 text-pink-800 shadow-md' 
                          : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-pink-50 hover:to-purple-50 border-gray-200 text-gray-700 hover:text-pink-700'
                        }
                        ${animated ? 'hover:scale-110 hover:shadow-lg' : ''}
                      `}
                      onClick={() => handleReaction(emoticon.id)}
                    >
                      <IconComponent className={`${sizeClasses[size]} mr-1 ${emoticon.color}`} />
                      <span className="font-medium">{emoticon.name}</span>
                      {count > 0 && (
                        <span className="ml-1 text-xs bg-white/50 px-1 rounded-full">
                          {count}
                        </span>
                      )}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{emoticon.description}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        )}

        {/* Quick Reaction Buttons */}
        {showReactionButton && (
          <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-pink-800 flex items-center">
                  <Sparkles className="h-4 w-4 mr-1 text-pink-600" />
                  感情を表現
                </h4>
                <div className="flex items-center text-xs text-gray-500">
                  <Heart className="h-3 w-3 mr-1" />
                  <span>クリックしてリアクション</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {popularReactions.map(emoticonId => {
                  const emoticon = getEmoticonById(emoticonId)
                  if (!emoticon) return null
                  
                  const IconComponent = emoticon.icon
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
                            relative h-8 w-8 p-0 rounded-full transition-all duration-200
                            ${isUserReaction 
                              ? 'bg-gradient-to-r from-pink-200 to-purple-200 ring-2 ring-pink-400' 
                              : 'hover:bg-gradient-to-r hover:from-pink-100 hover:to-purple-100'
                            }
                            ${animated ? 'hover:scale-110 active:scale-95' : ''}
                          `}
                        >
                          <IconComponent className={`${sizeClasses[size]} ${emoticon.color}`} />
                          {count > 0 && (
                            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                              {count > 9 ? '9+' : count}
                            </span>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{emoticon.name} {emoticon.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
              
              {/* Reaction Summary */}
              {Object.keys(reactionCounts).length > 0 && (
                <div className="mt-2 pt-2 border-t border-pink-200">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>総リアクション数</span>
                    <span className="font-medium text-pink-600">
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
          <div className="mt-3 p-2 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-600">
                <Smile className="h-3 w-3 mr-1 text-pink-500" />
                <span>投稿者の気分</span>
              </div>
              <div className="flex items-center space-x-1">
                {displayedEmoticons.slice(0, 3).map(emoticon => {
                  const IconComponent = emoticon.icon
                  return (
                    <div key={emoticon.id} className="p-1 bg-white rounded-full shadow-sm">
                      <IconComponent className={`h-3 w-3 ${emoticon.color}`} />
                    </div>
                  )
                })}
                {displayedEmoticons.length > 3 && (
                  <div className="text-xs text-gray-500 ml-1">
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

export type { ReactionCounts } 