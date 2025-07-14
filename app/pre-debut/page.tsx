"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Heart, Star, Users, Search, Crown, MapPin, Sparkles, Camera, Gift, Eye, TrendingUp } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface PreDebutArtist {
  id: string
  stageName: string
  realName: string
  age: number
  description: string
  avatar: string
  coverImage: string
  followerCount: number
  postCount: number
  supportLevel: number
  personality: string[]
  favoriteThings: string[]
  isOnline: boolean
  joinedDate: string
  fanClubName: string
  dreamGoal: string
  location: string
  specialSkills: string[]
  mood: string
  lastActive: string
  totalViews: number
  monthlyGrowth: number
}

export default function PreDebutPage() {
  const [artists, setArtists] = useState<PreDebutArtist[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [sortBy, setSortBy] = useState("popularity")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Sample data for pre-debut artists
    const sampleArtists: PreDebutArtist[] = [
      {
        id: "1",
        stageName: "桜花 みお",
        realName: "田中 美桜",
        age: 18,
        description: "夢に向かって頑張る18歳です💕 皆さんの応援が私の力になります✨",
        avatar: "/placeholder.svg?height=150&width=150",
        coverImage: "/placeholder.svg?height=200&width=400",
        followerCount: 1250,
        postCount: 45,
        supportLevel: 85,
        personality: ["明るい", "優しい", "努力家", "ロマンチック"],
        favoriteThings: ["歌うこと", "ダンス", "お花", "スイーツ"],
        isOnline: true,
        joinedDate: "2024-01-15",
        fanClubName: "桜花ファミリー",
        dreamGoal: "トップアイドルになること",
        location: "東京都",
        specialSkills: ["歌", "ダンス", "ピアノ"],
        mood: "excited",
        lastActive: "2分前",
        totalViews: 12500,
        monthlyGrowth: 15.2,
      },
      {
        id: "2",
        stageName: "星空 あかり",
        realName: "佐藤 明里",
        age: 19,
        description: "星のように輝きたい✨ みんなで一緒に夢を叶えましょう🌟",
        avatar: "/placeholder.svg?height=150&width=150",
        coverImage: "/placeholder.svg?height=200&width=400",
        followerCount: 980,
        postCount: 32,
        supportLevel: 72,
        personality: ["夢見がち", "創造的", "情熱的", "神秘的"],
        favoriteThings: ["星空観察", "詩を書くこと", "音楽", "アート"],
        isOnline: false,
        joinedDate: "2024-01-20",
        fanClubName: "スターライト",
        dreamGoal: "シンガーソングライターになること",
        location: "大阪府",
        specialSkills: ["作詞", "作曲", "ギター"],
        mood: "dreamy",
        lastActive: "1時間前",
        totalViews: 8900,
        monthlyGrowth: 22.8,
      },
      {
        id: "3",
        stageName: "花音 りん",
        realName: "山田 凛",
        age: 17,
        description: "音楽と花が大好きな17歳🌸 皆さんと一緒に成長していきたいです💖",
        avatar: "/placeholder.svg?height=150&width=150",
        coverImage: "/placeholder.svg?height=200&width=400",
        followerCount: 1580,
        postCount: 67,
        supportLevel: 91,
        personality: ["純粋", "一生懸命", "可愛い", "天然"],
        favoriteThings: ["お花", "ケーキ作り", "猫", "読書"],
        isOnline: true,
        joinedDate: "2024-01-10",
        fanClubName: "花音ガーデン",
        dreamGoal: "みんなを笑顔にするアイドルになること",
        location: "神奈川県",
        specialSkills: ["バレエ", "料理", "フルート"],
        mood: "cute",
        lastActive: "オンライン",
        totalViews: 15600,
        monthlyGrowth: 18.5,
      },
      {
        id: "4",
        stageName: "月光 ゆめ",
        realName: "鈴木 夢",
        age: 20,
        description: "月のように美しく、夢のように儚く🌙 皆さんの心に残る存在になりたいです",
        avatar: "/placeholder.svg?height=150&width=150",
        coverImage: "/placeholder.svg?height=200&width=400",
        followerCount: 2100,
        postCount: 89,
        supportLevel: 94,
        personality: ["エレガント", "知的", "神秘的", "上品"],
        favoriteThings: ["クラシック音楽", "美術館", "紅茶", "本"],
        isOnline: false,
        joinedDate: "2024-01-05",
        fanClubName: "ムーンライト",
        dreamGoal: "世界で活躍するアーティストになること",
        location: "京都府",
        specialSkills: ["クラシックバレエ", "ピアノ", "英語"],
        mood: "elegant",
        lastActive: "30分前",
        totalViews: 21300,
        monthlyGrowth: 12.3,
      },
      {
        id: "5",
        stageName: "虹色 みらい",
        realName: "田村 未来",
        age: 18,
        description: "虹のようにカラフルな毎日を🌈 みんなで楽しい時間を過ごしましょう！",
        avatar: "/placeholder.svg?height=150&width=150",
        coverImage: "/placeholder.svg?height=200&width=400",
        followerCount: 1350,
        postCount: 54,
        supportLevel: 78,
        personality: ["元気", "ポジティブ", "面白い", "社交的"],
        favoriteThings: ["ダンス", "ゲーム", "アニメ", "お祭り"],
        isOnline: true,
        joinedDate: "2024-01-18",
        fanClubName: "レインボークラブ",
        dreamGoal: "みんなを元気にするエンターテイナーになること",
        location: "愛知県",
        specialSkills: ["ヒップホップダンス", "ゲーム実況", "声真似"],
        mood: "energetic",
        lastActive: "オンライン",
        totalViews: 11200,
        monthlyGrowth: 25.7,
      },
      {
        id: "6",
        stageName: "桃花 さくら",
        realName: "中村 桜",
        age: 19,
        description: "桃の花のように可愛く、桜のように美しく🌸 皆さんの応援が私の宝物です💎",
        avatar: "/placeholder.svg?height=150&width=150",
        coverImage: "/placeholder.svg?height=200&width=400",
        followerCount: 1750,
        postCount: 76,
        supportLevel: 88,
        personality: ["優雅", "温和", "思いやり", "上品"],
        favoriteThings: ["茶道", "着物", "和菓子", "庭園"],
        isOnline: false,
        joinedDate: "2024-01-12",
        fanClubName: "桃花会",
        dreamGoal: "日本の美しさを世界に伝えるアーティストになること",
        location: "奈良県",
        specialSkills: ["茶道", "華道", "日本舞踊"],
        mood: "peaceful",
        lastActive: "2時間前",
        totalViews: 14800,
        monthlyGrowth: 16.9,
      },
    ]

    setTimeout(() => {
      setArtists(sampleArtists)
      setLoading(false)
    }, 1000)
  }, [])

  const getMoodEmoji = (mood: string) => {
    const moods = {
      excited: "🎉",
      happy: "😊",
      peaceful: "😌",
      cute: "🥰",
      dreamy: "✨",
      elegant: "👑",
      energetic: "⚡",
      romantic: "💕",
    }
    return moods[mood as keyof typeof moods] || "💕"
  }

  const getMoodColor = (mood: string) => {
    const colors = {
      excited: "from-yellow-400 to-orange-400",
      happy: "from-pink-400 to-rose-400",
      peaceful: "from-blue-400 to-indigo-400",
      cute: "from-pink-300 to-purple-300",
      dreamy: "from-indigo-300 to-purple-300",
      elegant: "from-purple-400 to-pink-400",
      energetic: "from-green-400 to-blue-400",
      romantic: "from-rose-300 to-pink-300",
    }
    return colors[mood as keyof typeof colors] || "from-pink-400 to-purple-400"
  }

  const filteredArtists = artists.filter((artist) => {
    const matchesSearch =
      artist.stageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.description.toLowerCase().includes(searchTerm.toLowerCase())

    if (selectedFilter === "all") return matchesSearch
    if (selectedFilter === "online") return matchesSearch && artist.isOnline
    if (selectedFilter === "new")
      return matchesSearch && new Date(artist.joinedDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    if (selectedFilter === "popular") return matchesSearch && artist.supportLevel > 80

    return matchesSearch
  })

  const sortedArtists = [...filteredArtists].sort((a, b) => {
    switch (sortBy) {
      case "popularity":
        return b.supportLevel - a.supportLevel
      case "followers":
        return b.followerCount - a.followerCount
      case "newest":
        return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime()
      case "growth":
        return b.monthlyGrowth - a.monthlyGrowth
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-pink-300 rounded-full opacity-20"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            ✨ Pre-Debut Artists ✨
          </h1>
          <p className="text-xl text-gray-600 mb-8">夢に向かって頑張る女性アーティストたちを応援しよう💕</p>

          {/* Search and Filters */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl max-w-4xl mx-auto">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="アーティストを検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-pink-200 focus:border-pink-400 bg-white/90"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  {[
                    { id: "all", label: "すべて", icon: Star },
                    { id: "online", label: "オンライン", icon: Users },
                    { id: "new", label: "新人", icon: Sparkles },
                    { id: "popular", label: "人気", icon: Crown },
                  ].map((filter) => (
                    <Button
                      key={filter.id}
                      variant={selectedFilter === filter.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter(filter.id)}
                      className={`${
                        selectedFilter === filter.id
                          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                          : "border-pink-200 text-pink-600 hover:bg-pink-50"
                      }`}
                    >
                      <filter.icon className="w-4 h-4 mr-1" />
                      {filter.label}
                    </Button>
                  ))}
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-pink-200 rounded-md bg-white/90 text-gray-700 focus:border-pink-400 focus:outline-none"
                >
                  <option value="popularity">人気順</option>
                  <option value="followers">フォロワー順</option>
                  <option value="newest">新着順</option>
                  <option value="growth">成長率順</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {sortedArtists.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <Link href={`/pre-debut/${artist.id}`}>
                  <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer">
                    {/* Cover Image */}
                    <div className="relative h-48 overflow-hidden">
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${getMoodColor(artist.mood)} opacity-80`}
                        animate={{
                          opacity: [0.8, 0.9, 0.8],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      />
                      <img
                        src={artist.coverImage || "/placeholder.svg"}
                        alt={artist.stageName}
                        className="w-full h-full object-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-300"
                      />

                      {/* Online Status */}
                      {artist.isOnline && (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                          className="absolute top-4 right-4"
                        >
                          <Badge className="bg-green-500 text-white border-0 shadow-lg">
                            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                            オンライン
                          </Badge>
                        </motion.div>
                      )}

                      {/* Support Level */}
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 shadow-lg">
                          <Crown className="w-3 h-3 mr-1" />
                          {artist.supportLevel}%
                        </Badge>
                      </div>

                      {/* Mood Indicator */}
                      <div className="absolute bottom-4 right-4">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                          className="text-3xl"
                        >
                          {getMoodEmoji(artist.mood)}
                        </motion.div>
                      </div>

                      {/* Avatar */}
                      <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="absolute -bottom-8 left-6">
                        <Avatar className="w-16 h-16 border-4 border-white shadow-xl">
                          <AvatarImage src={artist.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white text-xl">
                            {artist.stageName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                    </div>

                    <CardContent className="pt-12 pb-6">
                      {/* Artist Info */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{artist.stageName}</h3>
                        <p className="text-sm text-gray-600 mb-2 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {artist.location} • {artist.age}歳
                        </p>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{artist.description}</p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center text-pink-500 mb-1">
                            <Heart className="w-4 h-4 mr-1" />
                            <span className="font-bold text-sm">{artist.followerCount.toLocaleString()}</span>
                          </div>
                          <div className="text-xs text-gray-500">フォロワー</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-purple-500 mb-1">
                            <Camera className="w-4 h-4 mr-1" />
                            <span className="font-bold text-sm">{artist.postCount}</span>
                          </div>
                          <div className="text-xs text-gray-500">投稿</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-indigo-500 mb-1">
                            <Eye className="w-4 h-4 mr-1" />
                            <span className="font-bold text-sm">{(artist.totalViews / 1000).toFixed(1)}K</span>
                          </div>
                          <div className="text-xs text-gray-500">閲覧数</div>
                        </div>
                      </div>

                      {/* Personality Tags */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {artist.personality.slice(0, 3).map((trait, i) => (
                            <motion.div
                              key={trait}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              <Badge className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border-pink-200 text-xs">
                                {trait}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Fan Club */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-500" />
                          <span className="font-medium text-purple-700 text-sm">{artist.fanClubName}</span>
                        </div>
                      </div>

                      {/* Growth Indicator */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          <span className="font-medium">+{artist.monthlyGrowth}%</span>
                        </div>
                        <div className="text-gray-500">{artist.isOnline ? "オンライン" : artist.lastActive}</div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* No Results */}
        {sortedArtists.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">アーティストが見つかりませんでした</h3>
            <p className="text-gray-500">検索条件を変更してもう一度お試しください</p>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <Card className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 shadow-2xl max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">✨ あなたも応援に参加しませんか？ ✨</h2>
              <p className="text-lg mb-6 opacity-90">
                夢に向かって頑張る女性アーティストたちを一緒に応援しましょう！ あなたの応援が彼女たちの力になります💕
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-pink-600 hover:bg-gray-100 font-bold">
                  <Heart className="w-5 h-5 mr-2" />
                  応援を始める
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 font-bold bg-transparent"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  ギフトを贈る
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
