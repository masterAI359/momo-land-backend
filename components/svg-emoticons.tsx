import React from 'react'

// SVG Emoticon Component Props
export interface SVGEmoticonProps {
  size?: number
  className?: string
}

// Basic Emotion SVG Emoticons
export const HappyFace = ({ size = 24, className = "" }: SVGEmoticonProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <radialGradient id="happy-grad" cx="0.5" cy="0.3" r="0.7">
        <stop offset="0%" stopColor="#FFE55C" />
        <stop offset="100%" stopColor="#FFCC02" />
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#happy-grad)" stroke="#FFA000" strokeWidth="2"/>
    <circle cx="22" cy="25" r="3" fill="#333"/>
    <circle cx="42" cy="25" r="3" fill="#333"/>
    <path d="M20 40 Q32 50 44 40" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M18 35 Q20 32 22 35" stroke="#FFA000" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M42 35 Q44 32 46 35" stroke="#FFA000" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
)

export const LoveFace = ({ size = 24, className = "" }: SVGEmoticonProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <radialGradient id="love-grad" cx="0.5" cy="0.3" r="0.7">
        <stop offset="0%" stopColor="#FFB3BA" />
        <stop offset="100%" stopColor="#FF6B8A" />
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#love-grad)" stroke="#E91E63" strokeWidth="2"/>
    <path d="M18 22 C18 18, 22 18, 24 22 C26 18, 30 18, 30 22 C30 28, 24 32, 24 32 C24 32, 18 28, 18 22 Z" fill="#E91E63"/>
    <path d="M34 22 C34 18, 38 18, 40 22 C42 18, 46 18, 46 22 C46 28, 40 32, 40 32 C40 32, 34 28, 34 22 Z" fill="#E91E63"/>
    <path d="M20 42 Q32 52 44 42" stroke="#E91E63" strokeWidth="3" fill="none" strokeLinecap="round"/>
  </svg>
)

export const SadFace = ({ size = 24, className = "" }: SVGEmoticonProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <radialGradient id="sad-grad" cx="0.5" cy="0.3" r="0.7">
        <stop offset="0%" stopColor="#B3D9FF" />
        <stop offset="100%" stopColor="#64B5F6" />
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#sad-grad)" stroke="#1976D2" strokeWidth="2"/>
    <circle cx="22" cy="26" r="3" fill="#333"/>
    <circle cx="42" cy="26" r="3" fill="#333"/>
    <path d="M44 46 Q32 36 20 46" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M25 20 L28 30" stroke="#64B5F6" strokeWidth="2" strokeLinecap="round"/>
    <path d="M39 20 L36 30" stroke="#64B5F6" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const AngryFace = ({ size = 24, className = "" }: SVGEmoticonProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <radialGradient id="angry-grad" cx="0.5" cy="0.3" r="0.7">
        <stop offset="0%" stopColor="#FFAB91" />
        <stop offset="100%" stopColor="#F44336" />
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#angry-grad)" stroke="#C62828" strokeWidth="2"/>
    <circle cx="22" cy="28" r="3" fill="#333"/>
    <circle cx="42" cy="28" r="3" fill="#333"/>
    <path d="M20 48 Q32 38 44 48" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M16 20 L26 24" stroke="#C62828" strokeWidth="3" strokeLinecap="round"/>
    <path d="M48 20 L38 24" stroke="#C62828" strokeWidth="3" strokeLinecap="round"/>
  </svg>
)

export const SurprisedFace = ({ size = 24, className = "" }: SVGEmoticonProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <radialGradient id="surprised-grad" cx="0.5" cy="0.3" r="0.7">
        <stop offset="0%" stopColor="#E1BEE7" />
        <stop offset="100%" stopColor="#9C27B0" />
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#surprised-grad)" stroke="#7B1FA2" strokeWidth="2"/>
    <circle cx="22" cy="24" r="4" fill="#333"/>
    <circle cx="42" cy="24" r="4" fill="#333"/>
    <ellipse cx="32" cy="44" rx="6" ry="8" fill="#333"/>
  </svg>
)

export const LaughFace = ({ size = 24, className = "" }: SVGEmoticonProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <radialGradient id="laugh-grad" cx="0.5" cy="0.3" r="0.7">
        <stop offset="0%" stopColor="#FFCC80" />
        <stop offset="100%" stopColor="#FF9800" />
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#laugh-grad)" stroke="#F57F17" strokeWidth="2"/>
    <path d="M18 22 C22 18, 28 22, 28 22 C28 26, 22 26, 18 22 Z" fill="#333"/>
    <path d="M36 22 C40 18, 46 22, 46 22 C46 26, 40 26, 36 22 Z" fill="#333"/>
    <path d="M16 38 Q32 54 48 38" stroke="#333" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <circle cx="20" cy="45" r="2" fill="#F57F17"/>
    <circle cx="44" cy="45" r="2" fill="#F57F17"/>
  </svg>
)

// Special & Nature SVG Emoticons
export const StarIcon = ({ size = 24, className = "" }: SVGEmoticonProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <radialGradient id="star-grad" cx="0.5" cy="0.3" r="0.7">
        <stop offset="0%" stopColor="#FFF59D" />
        <stop offset="100%" stopColor="#FFD600" />
      </radialGradient>
    </defs>
    <path d="M32 8 L36 24 L52 24 L40 34 L44 50 L32 40 L20 50 L24 34 L12 24 L28 24 Z" 
          fill="url(#star-grad)" stroke="#FFA000" strokeWidth="2"/>
    <circle cx="32" cy="32" r="2" fill="#FFA000"/>
  </svg>
)

export const SparklesIcon = ({ size = 24, className = "" }: SVGEmoticonProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <radialGradient id="sparkles-grad" cx="0.5" cy="0.3" r="0.7">
        <stop offset="0%" stopColor="#F8BBD9" />
        <stop offset="100%" stopColor="#E91E63" />
      </radialGradient>
    </defs>
    <path d="M32 4 L34 14 L44 12 L36 20 L46 26 L36 32 L44 40 L34 38 L32 48 L30 38 L20 40 L28 32 L18 26 L28 20 L20 12 L30 14 Z" 
          fill="url(#sparkles-grad)"/>
    <circle cx="16" cy="16" r="3" fill="#E91E63"/>
    <circle cx="48" cy="16" r="3" fill="#E91E63"/>
    <circle cx="16" cy="48" r="3" fill="#E91E63"/>
    <circle cx="48" cy="48" r="3" fill="#E91E63"/>
  </svg>
)

export const FireIcon = ({ size = 24, className = "" }: SVGEmoticonProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <linearGradient id="fire-grad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#FF5722" />
        <stop offset="50%" stopColor="#FF9800" />
        <stop offset="100%" stopColor="#FFE082" />
      </linearGradient>
    </defs>
    <path d="M32 8 C38 12, 44 20, 44 32 C44 44, 38 52, 32 52 C26 52, 20 44, 20 32 C20 20, 26 12, 32 8 Z" 
          fill="url(#fire-grad)"/>
    <path d="M32 16 C34 18, 36 22, 36 28 C36 34, 34 38, 32 38 C30 38, 28 34, 28 28 C28 22, 30 18, 32 16 Z" 
          fill="#FFECB3"/>
    <circle cx="30" cy="26" r="2" fill="#FF8F00"/>
    <circle cx="34" cy="30" r="1" fill="#FF8F00"/>
  </svg>
)

export const HeartIcon = ({ size = 24, className = "" }: SVGEmoticonProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <radialGradient id="heart-grad" cx="0.5" cy="0.3" r="0.8">
        <stop offset="0%" stopColor="#FFB3BA" />
        <stop offset="100%" stopColor="#E91E63" />
      </radialGradient>
    </defs>
    <path d="M32 16 C28 10, 18 10, 18 22 C18 34, 32 48, 32 48 C32 48, 46 34, 46 22 C46 10, 36 10, 32 16 Z" 
          fill="url(#heart-grad)" stroke="#C2185B" strokeWidth="1"/>
    <circle cx="26" cy="20" r="2" fill="#FCE4EC" opacity="0.8"/>
    <circle cx="38" cy="24" r="1.5" fill="#FCE4EC" opacity="0.8"/>
  </svg>
)

// Food & Fruit SVG Emoticons
export const CherryIcon = ({ size = 24, className = "" }: SVGEmoticonProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <radialGradient id="cherry-grad" cx="0.3" cy="0.3" r="0.7">
        <stop offset="0%" stopColor="#FFCDD2" />
        <stop offset="100%" stopColor="#E53935" />
      </radialGradient>
    </defs>
    <path d="M20 12 Q30 8, 40 12" stroke="#4CAF50" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="22" cy="36" r="12" fill="url(#cherry-grad)" stroke="#C62828" strokeWidth="1"/>
    <circle cx="42" cy="32" r="10" fill="url(#cherry-grad)" stroke="#C62828" strokeWidth="1"/>
    <circle cx="18" cy="32" r="2" fill="#FFEBEE" opacity="0.8"/>
    <circle cx="38" cy="28" r="1.5" fill="#FFEBEE" opacity="0.8"/>
    <path d="M14 28 Q16 26, 18 28" stroke="#4CAF50" strokeWidth="2" fill="none"/>
    <path d="M36 24 Q38 22, 40 24" stroke="#4CAF50" strokeWidth="2" fill="none"/>
  </svg>
)

export const AppleIcon = ({ size = 24, className = "" }: SVGEmoticonProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <radialGradient id="apple-grad" cx="0.3" cy="0.3" r="0.8">
        <stop offset="0%" stopColor="#FFCDD2" />
        <stop offset="100%" stopColor="#D32F2F" />
      </radialGradient>
    </defs>
    <path d="M32 16 C20 16, 16 24, 16 36 C16 48, 20 56, 32 56 C44 56, 48 48, 48 36 C48 24, 44 16, 32 16 Z" 
          fill="url(#apple-grad)" stroke="#B71C1C" strokeWidth="1"/>
    <path d="M32 8 Q36 12, 32 16" stroke="#4CAF50" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M28 12 Q32 8, 36 12" stroke="#4CAF50" strokeWidth="2" fill="none"/>
    <circle cx="26" cy="28" r="3" fill="#FFEBEE" opacity="0.7"/>
    <circle cx="38" cy="32" r="2" fill="#FFEBEE" opacity="0.7"/>
  </svg>
)

// Drink SVG Emoticons
export const CoffeeIcon = ({ size = 24, className = "" }: SVGEmoticonProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <linearGradient id="coffee-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#D7CCC8" />
        <stop offset="100%" stopColor="#8D6E63" />
      </linearGradient>
    </defs>
    <rect x="16" y="20" width="32" height="32" rx="4" fill="url(#coffee-grad)" stroke="#5D4037" strokeWidth="2"/>
    <rect x="18" y="22" width="28" height="8" fill="#4A2C2A"/>
    <path d="M48 28 C52 28, 54 32, 54 36 C54 40, 52 44, 48 44" stroke="#5D4037" strokeWidth="2" fill="none"/>
    <path d="M24 12 Q26 8, 24 12" stroke="#757575" strokeWidth="1" opacity="0.7"/>
    <path d="M32 12 Q34 8, 32 12" stroke="#757575" strokeWidth="1" opacity="0.7"/>
    <path d="M40 12 Q42 8, 40 12" stroke="#757575" strokeWidth="1" opacity="0.7"/>
  </svg>
)

// Nature SVG Emoticons
export const SunIcon = ({ size = 24, className = "" }: SVGEmoticonProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <radialGradient id="sun-grad" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#FFF59D" />
        <stop offset="100%" stopColor="#FFB300" />
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="16" fill="url(#sun-grad)" stroke="#FF8F00" strokeWidth="2"/>
    <g stroke="#FFB300" strokeWidth="3" strokeLinecap="round">
      <line x1="32" y1="4" x2="32" y2="12"/>
      <line x1="32" y1="52" x2="32" y2="60"/>
      <line x1="4" y1="32" x2="12" y2="32"/>
      <line x1="52" y1="32" x2="60" y2="32"/>
      <line x1="11.7" y1="11.7" x2="17.4" y2="17.4"/>
      <line x1="46.6" y1="46.6" x2="52.3" y2="52.3"/>
      <line x1="11.7" y1="52.3" x2="17.4" y2="46.6"/>
      <line x1="46.6" y1="17.4" x2="52.3" y2="11.7"/>
    </g>
    <circle cx="28" cy="28" r="2" fill="#FF8F00"/>
    <circle cx="36" cy="36" r="1.5" fill="#FF8F00"/>
  </svg>
)

export const RainbowIcon = ({ size = 24, className = "" }: SVGEmoticonProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <linearGradient id="rainbow-grad" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stopColor="#F44336" />
        <stop offset="16.66%" stopColor="#FF9800" />
        <stop offset="33.33%" stopColor="#FFEB3B" />
        <stop offset="50%" stopColor="#4CAF50" />
        <stop offset="66.66%" stopColor="#2196F3" />
        <stop offset="83.33%" stopColor="#9C27B0" />
        <stop offset="100%" stopColor="#E91E63" />
      </linearGradient>
    </defs>
    <path d="M8 48 Q32 16, 56 48" stroke="url(#rainbow-grad)" strokeWidth="8" fill="none" strokeLinecap="round"/>
    <circle cx="12" cy="52" r="3" fill="#BBDEFB"/>
    <circle cx="52" cy="52" r="3" fill="#BBDEFB"/>
    <circle cx="16" cy="56" r="2" fill="#E3F2FD"/>
    <circle cx="48" cy="56" r="2" fill="#E3F2FD"/>
  </svg>
)

// Modern SVG Emoticon Definition
export interface ModernEmoticon {
  id: string
  name: string
  component: React.ComponentType<SVGEmoticonProps>
  category: string
  description: string
  keywords: string[]
  unicode?: string
}

// Modern SVG Emoticons Array
export const modernEmoticons: ModernEmoticon[] = [
  // Basic Emotions
  { 
    id: "happy", 
    name: "😊", 
    component: HappyFace, 
    category: "emotions", 
    description: "幸せ", 
    keywords: ["happy", "smile", "joy", "嬉しい", "幸せ"],
    unicode: "😊"
  },
  { 
    id: "love", 
    name: "💕", 
    component: LoveFace, 
    category: "emotions", 
    description: "愛", 
    keywords: ["love", "heart", "romance", "愛", "恋"],
    unicode: "💕"
  },
  { 
    id: "sad", 
    name: "😢", 
    component: SadFace, 
    category: "emotions", 
    description: "悲しい", 
    keywords: ["sad", "cry", "tear", "悲しい", "涙"],
    unicode: "😢"
  },
  { 
    id: "angry", 
    name: "😠", 
    component: AngryFace, 
    category: "emotions", 
    description: "怒り", 
    keywords: ["angry", "mad", "rage", "怒り", "腹立つ"],
    unicode: "😠"
  },
  { 
    id: "surprised", 
    name: "😮", 
    component: SurprisedFace, 
    category: "emotions", 
    description: "驚き", 
    keywords: ["surprised", "shock", "wow", "驚き", "びっくり"],
    unicode: "😮"
  },
  { 
    id: "laugh", 
    name: "😂", 
    component: LaughFace, 
    category: "emotions", 
    description: "笑い", 
    keywords: ["laugh", "funny", "lol", "笑い", "面白い"],
    unicode: "😂"
  },

  // Special & Sparkly
  { 
    id: "star", 
    name: "⭐", 
    component: StarIcon, 
    category: "special", 
    description: "星", 
    keywords: ["star", "favorite", "special", "星", "お気に入り"],
    unicode: "⭐"
  },
  { 
    id: "sparkles", 
    name: "✨", 
    component: SparklesIcon, 
    category: "special", 
    description: "キラキラ", 
    keywords: ["sparkles", "magic", "glitter", "キラキラ", "魔法"],
    unicode: "✨"
  },
  { 
    id: "fire", 
    name: "🔥", 
    component: FireIcon, 
    category: "special", 
    description: "火", 
    keywords: ["fire", "hot", "lit", "火", "熱い"],
    unicode: "🔥"
  },
  { 
    id: "heart", 
    name: "❤️", 
    component: HeartIcon, 
    category: "special", 
    description: "ハート", 
    keywords: ["heart", "love", "like", "ハート", "愛"],
    unicode: "❤️"
  },

  // Food & Fruits
  { 
    id: "cherry", 
    name: "🍒", 
    component: CherryIcon, 
    category: "food", 
    description: "さくらんぼ", 
    keywords: ["cherry", "fruit", "sweet", "さくらんぼ", "果物"],
    unicode: "🍒"
  },
  { 
    id: "apple", 
    name: "🍎", 
    component: AppleIcon, 
    category: "food", 
    description: "りんご", 
    keywords: ["apple", "fruit", "healthy", "りんご", "果物"],
    unicode: "🍎"
  },

  // Activities
  { 
    id: "coffee", 
    name: "☕", 
    component: CoffeeIcon, 
    category: "activities", 
    description: "コーヒー", 
    keywords: ["coffee", "cafe", "drink", "コーヒー", "カフェ"],
    unicode: "☕"
  },

  // Nature
  { 
    id: "sun", 
    name: "☀️", 
    component: SunIcon, 
    category: "nature", 
    description: "太陽", 
    keywords: ["sun", "sunny", "bright", "太陽", "晴れ"],
    unicode: "☀️"
  },
  { 
    id: "rainbow", 
    name: "🌈", 
    component: RainbowIcon, 
    category: "nature", 
    description: "虹", 
    keywords: ["rainbow", "colorful", "beautiful", "虹", "カラフル"],
    unicode: "🌈"
  }
]

// Components are already exported above 