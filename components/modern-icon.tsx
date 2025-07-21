import React from 'react'
import { 
  HappyFace, 
  LoveFace, 
  HeartIcon, 
  FireIcon, 
  SparklesIcon,
  SunIcon,
  RainbowIcon,
  CoffeeIcon,
  StarIcon
} from './svg-emoticons'

interface ModernIconProps {
  emoji: string
  size?: number
  className?: string
  fallback?: boolean // Show unicode emoji as fallback
}

// Modern SVG icon mapping for common emojis
const emojiToSVGMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  '😊': HappyFace,
  '💕': LoveFace,
  '❤️': HeartIcon,
  '🔥': FireIcon,
  '✨': SparklesIcon,
  '☀️': SunIcon,
  '🌈': RainbowIcon,
  '☕': CoffeeIcon,
  '⭐': StarIcon,
  '🌹': HeartIcon, // Use heart for rose as well
  '💬': HappyFace // Use happy face for chat
}

export default function ModernIcon({ 
  emoji, 
  size = 20, 
  className = "", 
  fallback = true 
}: ModernIconProps) {
  const SVGComponent = emojiToSVGMap[emoji]
  
  if (SVGComponent) {
    return <SVGComponent size={size} className={`modern-svg-icon ${className}`} />
  }
  
  if (fallback) {
    return (
      <span 
        className={`inline-block ${className}`} 
        style={{ fontSize: `${size}px`, lineHeight: 1 }}
      >
        {emoji}
      </span>
    )
  }
  
  return null
}

// Utility component for inline emoji replacement
interface EmojiTextProps {
  text: string
  iconSize?: number
  className?: string
}

export function EmojiText({ text, iconSize = 16, className = "" }: EmojiTextProps) {
  // Split text by emoji patterns and replace with SVG components
  const emojiRegex = /(😊|💕|❤️|🔥|✨|☀️|🌈|☕|⭐|🌹|💬)/g
  const parts = text.split(emojiRegex)
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (emojiToSVGMap[part]) {
          return (
            <ModernIcon 
              key={index} 
              emoji={part} 
              size={iconSize} 
              className="inline-block mx-0.5" 
            />
          )
        }
        return <span key={index}>{part}</span>
      })}
    </span>
  )
}

// Export the emoji mapping for external use
export { emojiToSVGMap } 