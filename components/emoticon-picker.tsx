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
import { Smile, Meh } from "lucide-react"
import { modernEmoticons, type ModernEmoticon, type SVGEmoticonProps } from "./svg-emoticons"

interface EmoticonPickerProps {
  onSelect: (emoticon: ModernEmoticon) => void
  selectedEmoticons?: ModernEmoticon[]
}

const categories = [
  { id: "emotions", name: "感情", icon: Smile, color: "text-yellow-500" },
  { id: "special", name: "特別", color: "text-pink-400" },
  { id: "activities", name: "活動", color: "text-purple-400" },
  { id: "nature", name: "自然", color: "text-green-400" },
  { id: "food", name: "食べ物", color: "text-red-500" }
]

export default function EmoticonPicker({ onSelect, selectedEmoticons = [] }: EmoticonPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState("emotions")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredEmoticons = modernEmoticons.filter(emoticon => {
    const matchesCategory = selectedCategory === "all" || emoticon.category === selectedCategory
    const matchesSearch = searchTerm === "" || 
      emoticon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emoticon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emoticon.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const isSelected = (emoticon: ModernEmoticon) => {
    return selectedEmoticons.some(selected => selected.id === emoticon.id)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50 transition-all duration-200 hover:shadow-md">
          <Smile className="h-4 w-4 mr-2" />
          エモーティコン
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 shadow-2xl border-0 bg-white/95 backdrop-blur-sm" side="top">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 p-4 border-b border-pink-100">
          <h3 className="font-bold text-pink-800 mb-3 text-lg">✨ エモーティコンを選択</h3>
          <div className="relative">
          <input
            type="text"
              placeholder="検索... (例: 嬉しい, happy)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 placeholder:text-pink-400"
          />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Smile className="h-4 w-4 text-pink-400" />
            </div>
          </div>
        </div>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1 p-3 border-b bg-gradient-to-r from-white to-pink-50">
          <Button
            variant={selectedCategory === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
            className={`
              transition-all duration-200 rounded-lg font-medium
              ${selectedCategory === "all" 
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg hover:shadow-xl" 
                : "text-gray-600 hover:text-pink-600 hover:bg-pink-50"
              }
            `}
          >
            🌟 すべて
          </Button>
          {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              className={`
                transition-all duration-200 rounded-lg font-medium
                ${selectedCategory === category.id 
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg hover:shadow-xl" 
                  : "text-gray-600 hover:text-pink-600 hover:bg-pink-50"
                }
              `}
            >
                {category.name}
              </Button>
          ))}
        </div>

        {/* Emoticons Grid */}
        <div className="max-h-80 overflow-y-auto p-3 bg-gradient-to-b from-white to-pink-50/30">
          {filteredEmoticons.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Meh className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium mb-2">エモーティコンが見つかりませんでした</p>
              <p className="text-sm text-gray-400">別のキーワードで検索してみてください</p>
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-3">
              {filteredEmoticons.map(emoticon => {
                const EmoticonComponent = emoticon.component
                return (
                  <Button
                    key={emoticon.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelect(emoticon)}
                    className={`
                      relative h-16 w-16 p-2 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95
                      ${isSelected(emoticon) 
                        ? 'bg-gradient-to-br from-pink-100 to-purple-100 ring-2 ring-pink-400 shadow-lg' 
                        : 'hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 hover:shadow-md'
                      }
                    `}
                    title={`${emoticon.unicode} ${emoticon.description}`}
                  >
                    <EmoticonComponent size={32} className="transition-all duration-200" />
                    {isSelected(emoticon) && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs font-bold">✓</span>
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
          <div className="border-t bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 p-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedEmoticons.map(emoticon => {
                const EmoticonComponent = emoticon.component
                return (
                  <Badge
                    key={emoticon.id}
                    variant="secondary"
                    className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 hover:from-pink-200 hover:to-purple-200 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 border border-pink-200 px-3 py-2 rounded-lg"
                    onClick={() => onSelect(emoticon)}
                  >
                    <EmoticonComponent size={16} className="mr-2" />
                    <span className="font-medium">{emoticon.unicode}</span>
                  </Badge>
                )
              })}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-medium">
              {selectedEmoticons.length} 個のエモーティコンが選択されています
              </span>
              <div className="flex items-center text-pink-600">
                <span className="animate-pulse">✨</span>
                <span className="ml-1 text-xs">クリックで削除</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 px-4 py-2 text-center border-t border-pink-200">
          <p className="text-xs text-pink-700 font-medium">
            🎨 高品質SVGエモーティコン • より美しく、より表現豊かに
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Export the emoticons for use in other components
export { modernEmoticons }
export type { ModernEmoticon } 