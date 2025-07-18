"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Heart,
  Smile,
  Frown,
  Meh,
  Angry,
  Surprised,
  Laugh,
  Cry,
  Kiss,
  Wink,
  Sleeping,
  Confused,
  Cool,
  Sick,
  Dizzy,
  Star,
  Sparkles,
  Crown,
  Gift,
  Music,
  Camera,
  Palette,
  Coffee,
  Cake,
  Rainbow,
  Sun,
  Moon,
  Cloud,
  Umbrella,
  Snowflake,
  Fire,
  Zap,
  Gem,
  Rose,
  Tulip,
  Cherry,
  Grape,
  Strawberry,
  Peach,
  Pineapple,
  Apple,
  Banana,
  Lemon,
  Watermelon,
  Avocado,
  Tomato,
  Carrot,
  Corn,
  Mushroom,
  Bread,
  Cheese,
  Meat,
  Poultry,
  Egg,
  Milk,
  Honey,
  Wine,
  Beer,
  Cocktail,
  Soda
} from "lucide-react"

interface Emoticon {
  id: string
  name: string
  icon: React.ComponentType<any>
  category: string
  color: string
  description: string
  keywords: string[]
}

interface EmoticonPickerProps {
  onSelect: (emoticon: Emoticon) => void
  selectedEmoticons?: Emoticon[]
}

const emoticons: Emoticon[] = [
  // Basic Emotions
  { id: "happy", name: "😊", icon: Smile, category: "emotions", color: "text-yellow-500", description: "幸せ", keywords: ["happy", "smile", "joy", "嬉しい", "幸せ"] },
  { id: "love", name: "💕", icon: Heart, category: "emotions", color: "text-pink-500", description: "愛", keywords: ["love", "heart", "romance", "愛", "恋"] },
  { id: "sad", name: "😢", icon: Cry, category: "emotions", color: "text-blue-500", description: "悲しい", keywords: ["sad", "cry", "tear", "悲しい", "涙"] },
  { id: "angry", name: "😠", icon: Angry, category: "emotions", color: "text-red-500", description: "怒り", keywords: ["angry", "mad", "rage", "怒り", "腹立つ"] },
  { id: "surprised", name: "😮", icon: Surprised, category: "emotions", color: "text-purple-500", description: "驚き", keywords: ["surprised", "shock", "wow", "驚き", "びっくり"] },
  { id: "laugh", name: "😂", icon: Laugh, category: "emotions", color: "text-orange-500", description: "笑い", keywords: ["laugh", "funny", "lol", "笑い", "面白い"] },
  { id: "confused", name: "😕", icon: Confused, category: "emotions", color: "text-gray-500", description: "困惑", keywords: ["confused", "puzzled", "困惑", "わからない"] },
  { id: "cool", name: "😎", icon: Cool, category: "emotions", color: "text-indigo-500", description: "クール", keywords: ["cool", "awesome", "sunglasses", "クール", "かっこいい"] },
  { id: "kiss", name: "😘", icon: Kiss, category: "emotions", color: "text-pink-600", description: "キス", keywords: ["kiss", "love", "romance", "キス", "愛情"] },
  { id: "wink", name: "😉", icon: Wink, category: "emotions", color: "text-green-500", description: "ウィンク", keywords: ["wink", "flirt", "playful", "ウィンク", "いたずら"] },
  { id: "sleeping", name: "😴", icon: Sleeping, category: "emotions", color: "text-blue-400", description: "眠い", keywords: ["sleep", "tired", "zzz", "眠い", "疲れた"] },
  { id: "sick", name: "🤒", icon: Sick, category: "emotions", color: "text-green-600", description: "病気", keywords: ["sick", "ill", "fever", "病気", "風邪"] },
  { id: "dizzy", name: "😵", icon: Dizzy, category: "emotions", color: "text-yellow-600", description: "めまい", keywords: ["dizzy", "confused", "spiral", "めまい", "混乱"] },
  { id: "neutral", name: "😐", icon: Meh, category: "emotions", color: "text-gray-400", description: "普通", keywords: ["neutral", "meh", "ok", "普通", "まあまあ"] },
  { id: "frown", name: "😞", icon: Frown, category: "emotions", color: "text-blue-600", description: "がっかり", keywords: ["frown", "disappointed", "sad", "がっかり", "残念"] },

  // Special & Sparkly
  { id: "star", name: "⭐", icon: Star, category: "special", color: "text-yellow-400", description: "星", keywords: ["star", "favorite", "special", "星", "お気に入り"] },
  { id: "sparkles", name: "✨", icon: Sparkles, category: "special", color: "text-pink-400", description: "キラキラ", keywords: ["sparkles", "magic", "glitter", "キラキラ", "魔法"] },
  { id: "crown", name: "👑", icon: Crown, category: "special", color: "text-yellow-600", description: "王冠", keywords: ["crown", "queen", "princess", "王冠", "女王"] },
  { id: "gift", name: "🎁", icon: Gift, category: "special", color: "text-red-400", description: "プレゼント", keywords: ["gift", "present", "surprise", "プレゼント", "贈り物"] },
  { id: "gem", name: "💎", icon: Gem, category: "special", color: "text-cyan-400", description: "宝石", keywords: ["gem", "diamond", "precious", "宝石", "ダイヤモンド"] },
  { id: "fire", name: "🔥", icon: Fire, category: "special", color: "text-orange-600", description: "火", keywords: ["fire", "hot", "lit", "火", "熱い"] },
  { id: "zap", name: "⚡", icon: Zap, category: "special", color: "text-yellow-300", description: "稲妻", keywords: ["lightning", "zap", "electric", "稲妻", "電気"] },

  // Activities & Hobbies
  { id: "music", name: "🎵", icon: Music, category: "activities", color: "text-purple-400", description: "音楽", keywords: ["music", "song", "melody", "音楽", "歌"] },
  { id: "camera", name: "📸", icon: Camera, category: "activities", color: "text-gray-600", description: "写真", keywords: ["camera", "photo", "picture", "写真", "カメラ"] },
  { id: "art", name: "🎨", icon: Palette, category: "activities", color: "text-indigo-400", description: "アート", keywords: ["art", "paint", "create", "アート", "絵"] },
  { id: "coffee", name: "☕", icon: Coffee, category: "activities", color: "text-amber-600", description: "コーヒー", keywords: ["coffee", "cafe", "drink", "コーヒー", "カフェ"] },
  { id: "cake", name: "🍰", icon: Cake, category: "activities", color: "text-pink-300", description: "ケーキ", keywords: ["cake", "dessert", "sweet", "ケーキ", "デザート"] },

  // Nature & Weather
  { id: "rainbow", name: "🌈", icon: Rainbow, category: "nature", color: "text-pink-500", description: "虹", keywords: ["rainbow", "colorful", "beautiful", "虹", "カラフル"] },
  { id: "sun", name: "☀️", icon: Sun, category: "nature", color: "text-yellow-500", description: "太陽", keywords: ["sun", "sunny", "bright", "太陽", "晴れ"] },
  { id: "moon", name: "🌙", icon: Moon, category: "nature", color: "text-blue-300", description: "月", keywords: ["moon", "night", "romantic", "月", "夜"] },
  { id: "cloud", name: "☁️", icon: Cloud, category: "nature", color: "text-gray-300", description: "雲", keywords: ["cloud", "sky", "weather", "雲", "空"] },
  { id: "umbrella", name: "☂️", icon: Umbrella, category: "nature", color: "text-blue-600", description: "傘", keywords: ["umbrella", "rain", "weather", "傘", "雨"] },
  { id: "snowflake", name: "❄️", icon: Snowflake, category: "nature", color: "text-cyan-300", description: "雪", keywords: ["snow", "winter", "cold", "雪", "冬"] },

  // Flowers & Plants
  { id: "rose", name: "🌹", icon: Rose, category: "flowers", color: "text-red-500", description: "バラ", keywords: ["rose", "flower", "love", "バラ", "花"] },
  { id: "tulip", name: "🌷", icon: Tulip, category: "flowers", color: "text-pink-400", description: "チューリップ", keywords: ["tulip", "flower", "spring", "チューリップ", "春"] },

  // Food & Fruits
  { id: "cherry", name: "🍒", icon: Cherry, category: "food", color: "text-red-400", description: "さくらんぼ", keywords: ["cherry", "fruit", "sweet", "さくらんぼ", "果物"] },
  { id: "grape", name: "🍇", icon: Grape, category: "food", color: "text-purple-500", description: "ぶどう", keywords: ["grape", "fruit", "wine", "ぶどう", "果物"] },
  { id: "strawberry", name: "🍓", icon: Strawberry, category: "food", color: "text-red-300", description: "いちご", keywords: ["strawberry", "fruit", "sweet", "いちご", "果物"] },
  { id: "peach", name: "🍑", icon: Peach, category: "food", color: "text-orange-300", description: "桃", keywords: ["peach", "fruit", "soft", "桃", "果物"] },
  { id: "pineapple", name: "🍍", icon: Pineapple, category: "food", color: "text-yellow-600", description: "パイナップル", keywords: ["pineapple", "fruit", "tropical", "パイナップル", "果物"] },
  { id: "apple", name: "🍎", icon: Apple, category: "food", color: "text-red-600", description: "りんご", keywords: ["apple", "fruit", "healthy", "りんご", "果物"] },
  { id: "banana", name: "🍌", icon: Banana, category: "food", color: "text-yellow-400", description: "バナナ", keywords: ["banana", "fruit", "yellow", "バナナ", "果物"] },
  { id: "lemon", name: "🍋", icon: Lemon, category: "food", color: "text-yellow-500", description: "レモン", keywords: ["lemon", "fruit", "sour", "レモン", "果物"] },
  { id: "watermelon", name: "🍉", icon: Watermelon, category: "food", color: "text-green-400", description: "スイカ", keywords: ["watermelon", "fruit", "summer", "スイカ", "果物"] },
  { id: "avocado", name: "🥑", icon: Avocado, category: "food", color: "text-green-500", description: "アボカド", keywords: ["avocado", "fruit", "healthy", "アボカド", "果物"] },

  // Drinks
  { id: "wine", name: "🍷", icon: Wine, category: "drinks", color: "text-red-700", description: "ワイン", keywords: ["wine", "drink", "romantic", "ワイン", "お酒"] },
  { id: "beer", name: "🍺", icon: Beer, category: "drinks", color: "text-amber-500", description: "ビール", keywords: ["beer", "drink", "party", "ビール", "お酒"] },
  { id: "cocktail", name: "🍹", icon: Cocktail, category: "drinks", color: "text-pink-400", description: "カクテル", keywords: ["cocktail", "drink", "party", "カクテル", "お酒"] },
  { id: "soda", name: "🥤", icon: Soda, category: "drinks", color: "text-blue-400", description: "ソーダ", keywords: ["soda", "drink", "fizzy", "ソーダ", "炭酸"] },

  // More Foods
  { id: "bread", name: "🍞", icon: Bread, category: "food", color: "text-amber-700", description: "パン", keywords: ["bread", "food", "bakery", "パン", "食べ物"] },
  { id: "cheese", name: "🧀", icon: Cheese, category: "food", color: "text-yellow-700", description: "チーズ", keywords: ["cheese", "food", "dairy", "チーズ", "食べ物"] },
  { id: "meat", name: "🥩", icon: Meat, category: "food", color: "text-red-800", description: "肉", keywords: ["meat", "food", "protein", "肉", "食べ物"] },
  { id: "poultry", name: "🍗", icon: Poultry, category: "food", color: "text-orange-700", description: "鶏肉", keywords: ["chicken", "poultry", "food", "鶏肉", "食べ物"] },
  { id: "egg", name: "🥚", icon: Egg, category: "food", color: "text-yellow-200", description: "卵", keywords: ["egg", "food", "protein", "卵", "食べ物"] },
  { id: "milk", name: "🥛", icon: Milk, category: "food", color: "text-blue-100", description: "牛乳", keywords: ["milk", "drink", "dairy", "牛乳", "飲み物"] },
  { id: "honey", name: "🍯", icon: Honey, category: "food", color: "text-amber-600", description: "蜂蜜", keywords: ["honey", "sweet", "natural", "蜂蜜", "甘い"] },
  { id: "tomato", name: "🍅", icon: Tomato, category: "food", color: "text-red-500", description: "トマト", keywords: ["tomato", "vegetable", "red", "トマト", "野菜"] },
  { id: "carrot", name: "🥕", icon: Carrot, category: "food", color: "text-orange-500", description: "にんじん", keywords: ["carrot", "vegetable", "orange", "にんじん", "野菜"] },
  { id: "corn", name: "🌽", icon: Corn, category: "food", color: "text-yellow-600", description: "とうもろこし", keywords: ["corn", "vegetable", "yellow", "とうもろこし", "野菜"] },
  { id: "mushroom", name: "🍄", icon: Mushroom, category: "food", color: "text-amber-800", description: "きのこ", keywords: ["mushroom", "vegetable", "fungi", "きのこ", "野菜"] }
]

const categories = [
  { id: "emotions", name: "感情", icon: Smile, color: "text-yellow-500" },
  { id: "special", name: "特別", icon: Sparkles, color: "text-pink-400" },
  { id: "activities", name: "活動", icon: Music, color: "text-purple-400" },
  { id: "nature", name: "自然", icon: Sun, color: "text-green-400" },
  { id: "flowers", name: "花", icon: Rose, color: "text-pink-500" },
  { id: "food", name: "食べ物", icon: Apple, color: "text-red-500" },
  { id: "drinks", name: "飲み物", icon: Wine, color: "text-purple-600" }
]

export default function EmoticonPicker({ onSelect, selectedEmoticons = [] }: EmoticonPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState("emotions")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredEmoticons = emoticons.filter(emoticon => {
    const matchesCategory = selectedCategory === "all" || emoticon.category === selectedCategory
    const matchesSearch = searchTerm === "" || 
      emoticon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emoticon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emoticon.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const isSelected = (emoticon: Emoticon) => {
    return selectedEmoticons.some(selected => selected.id === emoticon.id)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50">
          <Smile className="h-4 w-4 mr-2" />
          エモーティコン
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" side="top">
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 border-b">
          <h3 className="font-semibold text-pink-800 mb-2">エモーティコンを選択</h3>
          <input
            type="text"
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1 p-2 border-b bg-white">
          <Button
            variant={selectedCategory === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
            className={selectedCategory === "all" ? "bg-pink-500 text-white" : "text-gray-600 hover:text-pink-600"}
          >
            すべて
          </Button>
          {categories.map(category => {
            const IconComponent = category.icon
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "bg-pink-500 text-white" : "text-gray-600 hover:text-pink-600"}
              >
                <IconComponent className="h-3 w-3 mr-1" />
                {category.name}
              </Button>
            )
          })}
        </div>

        {/* Emoticons Grid */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredEmoticons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Meh className="h-8 w-8 mx-auto mb-2" />
              <p>エモーティコンが見つかりませんでした</p>
            </div>
          ) : (
            <div className="grid grid-cols-8 gap-1">
              {filteredEmoticons.map(emoticon => {
                const IconComponent = emoticon.icon
                return (
                  <Button
                    key={emoticon.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelect(emoticon)}
                    className={`
                      relative h-10 w-10 p-0 hover:bg-pink-50 transition-all duration-200
                      ${isSelected(emoticon) ? 'bg-pink-100 ring-2 ring-pink-400' : ''}
                    `}
                    title={`${emoticon.name} ${emoticon.description}`}
                  >
                    <IconComponent className={`h-5 w-5 ${emoticon.color}`} />
                    {isSelected(emoticon) && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </Button>
                )
              })}
            </div>
          )}
        </div>

        {/* Selected Emoticons Display */}
        {selectedEmoticons.length > 0 && (
          <div className="border-t bg-gradient-to-r from-pink-50 to-purple-50 p-3">
            <div className="flex flex-wrap gap-1 mb-2">
              {selectedEmoticons.map(emoticon => {
                const IconComponent = emoticon.icon
                return (
                  <Badge
                    key={emoticon.id}
                    variant="secondary"
                    className="bg-pink-100 text-pink-800 hover:bg-pink-200 cursor-pointer"
                    onClick={() => onSelect(emoticon)}
                  >
                    <IconComponent className={`h-3 w-3 mr-1 ${emoticon.color}`} />
                    {emoticon.name}
                  </Badge>
                )
              })}
            </div>
            <p className="text-xs text-gray-600">
              {selectedEmoticons.length} 個のエモーティコンが選択されています
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export type { Emoticon }
export { emoticons } 