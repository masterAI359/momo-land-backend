"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Heart,
  Star,
  Users,
  MessageCircle,
  Camera,
  Gift,
  MapPin,
  Music,
  Palette,
  Book,
  Sparkles,
  Crown,
  Send,
  ImageIcon,
  ArrowLeft,
  Share,
  Bell,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import BlogPostCard from "@/components/blog-post-card"

interface BlogPost {
  id: string
  title: string
  content: string
  images: string[]
  createdAt: string
  likes: number
  comments: number
  mood: string
  author: {
    name: string
    avatar: string
    stageName: string
  }
}

interface GalleryImage {
  id: string
  url: string
  caption: string
  createdAt: string
  likes: number
}

export default function PreDebutArtistProfile({ params }: { params: { id: string } }) {
  const [artist, setArtist] = useState<any>(null)
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [gallery, setGallery] = useState<GalleryImage[]>([])
  const [activeTab, setActiveTab] = useState("profile")
  const [isFollowing, setIsFollowing] = useState(false)
  const [supportMessage, setSupportMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Sample data for the artist
    const sampleArtist = {
      id: params.id,
      stageName: "桜花 みお",
      realName: "田中 美桜",
      age: 18,
      description: "夢に向かって頑張る18歳です💕 皆さんの応援が私の力になります✨",
      avatar: "/placeholder.svg?height=150&width=150",
      coverImage: "/placeholder.svg?height=300&width=800",
      followerCount: 1250,
      postCount: 45,
      dreamGoal: "トップアイドルになること",
      personality: ["明るい", "優しい", "努力家", "ロマンチック"],
      favoriteThings: ["歌うこと", "ダンス", "お花", "スイーツ", "映画鑑賞"],
      hobbies: ["ピアノ", "絵を描くこと", "料理", "読書"],
      isOnline: true,
      joinedDate: "2024-01-15",
      supportLevel: 85,
      fanClubName: "桜花ファミリー",
      birthPlace: "東京都",
      bloodType: "A型",
      height: "158cm",
      specialSkills: ["歌", "ダンス", "ピアノ", "英会話"],
      favoriteColor: "ピンク",
      favoriteFood: "いちごケーキ",
      motto: "笑顔で頑張る！",
      socialMedia: {
        twitter: "@sakura_mio",
        instagram: "@sakura.mio.official",
      },
    }

    const sampleBlogPosts: BlogPost[] = [
      {
        id: "1",
        title: "今日のレッスン頑張りました！✨",
        content:
          "今日はダンスレッスンでした💃 新しい振り付けを覚えるのは大変だけど、とても楽しいです！皆さんの応援があるから頑張れます💕 明日は歌のレッスンです🎵",
        images: ["/placeholder.svg?height=200&width=300", "/placeholder.svg?height=200&width=300"],
        createdAt: "2024-01-20T10:30:00Z",
        likes: 89,
        comments: 23,
        mood: "excited",
        author: {
          name: "田中 美桜",
          avatar: "/placeholder.svg?height=48&width=48",
          stageName: "桜花 みお",
        },
      },
      {
        id: "2",
        title: "お花見に行ってきました🌸",
        content:
          "桜がとても綺麗でした🌸 春の訪れを感じて、新しいことにチャレンジしたい気持ちになりました！皆さんも素敵な春をお過ごしください💖",
        images: ["/placeholder.svg?height=200&width=300"],
        createdAt: "2024-01-18T15:45:00Z",
        likes: 156,
        comments: 34,
        mood: "peaceful",
        author: {
          name: "田中 美桜",
          avatar: "/placeholder.svg?height=48&width=48",
          stageName: "桜花 みお",
        },
      },
      {
        id: "3",
        title: "新しい衣装の試着をしました👗",
        content:
          "とても可愛い衣装で、着ているだけで気分が上がります✨ 早く皆さんにお披露目したいです！どんな色がお似合いだと思いますか？",
        images: [
          "/placeholder.svg?height=200&width=300",
          "/placeholder.svg?height=200&width=300",
          "/placeholder.svg?height=200&width=300",
        ],
        createdAt: "2024-01-16T12:20:00Z",
        likes: 203,
        comments: 67,
        mood: "happy",
        author: {
          name: "田中 美桜",
          avatar: "/placeholder.svg?height=48&width=48",
          stageName: "桜花 みお",
        },
      },
      {
        id: "4",
        title: "今日は特別な日でした💕",
        content:
          "ファンの皆さんからたくさんの応援メッセージをいただいて、本当に嬉しかったです😭 一つ一つ大切に読ませていただきました。皆さんの優しさに心が温まります🥰",
        images: ["/placeholder.svg?height=200&width=300"],
        createdAt: "2024-01-14T18:00:00Z",
        likes: 312,
        comments: 89,
        mood: "grateful",
        author: {
          name: "田中 美桜",
          avatar: "/placeholder.svg?height=48&width=48",
          stageName: "桜花 みお",
        },
      },
      {
        id: "5",
        title: "夢に向かって一歩ずつ✨",
        content:
          "今日はオーディションでした！結果はまだわからないけど、精一杯頑張りました💪 どんな結果でも、この経験を糧にして成長していきたいと思います🌱",
        images: ["/placeholder.svg?height=200&width=300", "/placeholder.svg?height=200&width=300"],
        createdAt: "2024-01-12T14:30:00Z",
        likes: 445,
        comments: 156,
        mood: "determined",
        author: {
          name: "田中 美桜",
          avatar: "/placeholder.svg?height=48&width=48",
          stageName: "桜花 みお",
        },
      },
    ]

    const sampleGallery: GalleryImage[] = [
      {
        id: "1",
        url: "/placeholder.svg?height=300&width=300",
        caption: "レッスン後の一枚📸",
        createdAt: "2024-01-20T11:00:00Z",
        likes: 145,
      },
      {
        id: "2",
        url: "/placeholder.svg?height=300&width=300",
        caption: "お気に入りのカフェで☕",
        createdAt: "2024-01-19T14:30:00Z",
        likes: 98,
      },
      {
        id: "3",
        url: "/placeholder.svg?height=300&width=300",
        caption: "新しいヘアスタイル💇‍♀️",
        createdAt: "2024-01-18T09:15:00Z",
        likes: 234,
      },
      {
        id: "4",
        url: "/placeholder.svg?height=300&width=300",
        caption: "練習風景🎵",
        createdAt: "2024-01-17T16:45:00Z",
        likes: 167,
      },
    ]

    setTimeout(() => {
      setArtist(sampleArtist)
      setBlogPosts(sampleBlogPosts)
      setGallery(sampleGallery)
      setLoading(false)
    }, 1000)
  }, [params.id])

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    toast({
      title: isFollowing ? "フォローを解除しました" : "フォローしました！",
      description: isFollowing ? "" : `${artist.stageName}さんの最新情報をお届けします💕`,
    })
  }

  const handleSendSupport = () => {
    if (!supportMessage.trim()) return

    toast({
      title: "応援メッセージを送信しました！",
      description: `${artist.stageName}さんに気持ちが届きました💖`,
    })
    setSupportMessage("")
  }

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

  if (!artist) {
    return <div>Artist not found</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-pink-300 rounded-full opacity-30"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            style={{
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="mb-6">
          <Link href="/pre-debut">
            <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
          </Link>
        </motion.div>

        {/* Profile Header */}
        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
          <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-2xl mb-8">
            {/* Cover Image */}
            <div className="relative h-64 overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-pink-400/80 via-purple-400/80 to-indigo-400/80"
                animate={{
                  background: [
                    "linear-gradient(45deg, rgba(236, 72, 153, 0.8), rgba(168, 85, 247, 0.8), rgba(99, 102, 241, 0.8))",
                    "linear-gradient(45deg, rgba(99, 102, 241, 0.8), rgba(236, 72, 153, 0.8), rgba(168, 85, 247, 0.8))",
                    "linear-gradient(45deg, rgba(168, 85, 247, 0.8), rgba(99, 102, 241, 0.8), rgba(236, 72, 153, 0.8))",
                  ],
                }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
              <img
                src={artist.coverImage || "/placeholder.svg"}
                alt={artist.stageName}
                className="w-full h-full object-cover mix-blend-overlay"
              />

              {/* Online Status */}
              {artist.isOnline && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="absolute top-6 right-6"
                >
                  <Badge className="bg-green-500 text-white border-0 shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                    オンライン
                  </Badge>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="absolute top-6 left-6 flex gap-2">
                <Button size="sm" variant="outline" className="bg-white/80 border-0">
                  <Share className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="bg-white/80 border-0">
                  <Bell className="w-4 h-4" />
                </Button>
              </div>

              {/* Avatar */}
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="absolute -bottom-12 left-8">
                <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                  <AvatarImage src={artist.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white text-2xl">
                    {artist.stageName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </div>

            <CardContent className="pt-16 pb-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      {artist.stageName}
                    </h1>
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
                      <Crown className="w-3 h-3 mr-1" />
                      {artist.supportLevel}%
                    </Badge>
                  </div>

                  <p className="text-gray-600 mb-4 leading-relaxed">{artist.description}</p>

                  {/* Stats */}
                  <div className="flex gap-6 mb-4">
                    <div className="text-center">
                      <div className="flex items-center text-pink-500 mb-1">
                        <Heart className="w-4 h-4 mr-1" />
                        <span className="font-bold text-lg">{artist.followerCount.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-500">フォロワー</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center text-purple-500 mb-1">
                        <Camera className="w-4 h-4 mr-1" />
                        <span className="font-bold text-lg">{artist.postCount}</span>
                      </div>
                      <div className="text-xs text-gray-500">投稿</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center text-indigo-500 mb-1">
                        <Eye className="w-4 h-4 mr-1" />
                        <span className="font-bold text-lg">12.5K</span>
                      </div>
                      <div className="text-xs text-gray-500">総閲覧数</div>
                    </div>
                  </div>

                  {/* Fan Club */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span className="font-semibold text-purple-700">ファンクラブ: {artist.fanClubName}</span>
                    </div>
                    <p className="text-sm text-purple-600">限定コンテンツや特別なメッセージをお届けします💕</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 md:ml-8 mt-4 md:mt-0">
                  <Button
                    onClick={handleFollow}
                    className={`${
                      isFollowing
                        ? "bg-gray-500 hover:bg-gray-600"
                        : "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    } text-white border-0 shadow-lg transform transition-all duration-200 hover:scale-105`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFollowing ? "fill-current" : ""}`} />
                    {isFollowing ? "フォロー中" : "フォローする"}
                  </Button>

                  <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 bg-transparent">
                    <Gift className="w-4 h-4 mr-2" />
                    ギフトを贈る
                  </Button>

                  <Button
                    variant="outline"
                    className="border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    メッセージ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-2">
              <div className="flex gap-2 overflow-x-auto">
                {[
                  { id: "profile", label: "プロフィール", icon: Star },
                  { id: "blog", label: "ブログ", icon: Book },
                  { id: "gallery", label: "ギャラリー", icon: ImageIcon },
                  { id: "support", label: "応援", icon: Heart },
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                        : "text-gray-600 hover:bg-pink-50"
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Info */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-pink-700">
                      <Star className="w-5 h-5" />
                      基本情報
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">本名</div>
                        <div className="font-medium">{artist.realName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">年齢</div>
                        <div className="font-medium">{artist.age}歳</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">出身地</div>
                        <div className="font-medium flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {artist.birthPlace}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">血液型</div>
                        <div className="font-medium">{artist.bloodType}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">身長</div>
                        <div className="font-medium">{artist.height}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">好きな色</div>
                        <div className="font-medium flex items-center">
                          <Palette className="w-3 h-3 mr-1" />
                          {artist.favoriteColor}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-2">座右の銘</div>
                      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-3">
                        <div className="font-medium text-gray-700 flex items-center">
                          <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                          {artist.motto}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills & Hobbies */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-700">
                      <Music className="w-5 h-5" />
                      特技・趣味
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="text-sm text-gray-500 mb-3">特技</div>
                      <div className="flex flex-wrap gap-2">
                        {artist.specialSkills.map((skill: string, index: number) => (
                          <motion.div
                            key={skill}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Badge className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border-pink-200">
                              {skill}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-3">趣味</div>
                      <div className="flex flex-wrap gap-2">
                        {artist.hobbies.map((hobby: string, index: number) => (
                          <motion.div
                            key={hobby}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200">
                              {hobby}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-3">好きなもの</div>
                      <div className="flex flex-wrap gap-2">
                        {artist.favoriteThings.map((thing: string, index: number) => (
                          <motion.div
                            key={thing}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200">
                              {thing}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === "blog" && (
            <motion.div
              key="blog"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {blogPosts.map((post, index) => (
                <BlogPostCard key={post.id} post={post} index={index} />
              ))}
            </motion.div>
          )}

          {activeTab === "gallery" && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
                      <div className="relative">
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={image.caption}
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-white text-sm font-medium">{image.caption}</p>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <Button variant="ghost" size="sm" className="text-pink-600 hover:bg-pink-50">
                            <Heart className="w-4 h-4 mr-1" />
                            {image.likes}
                          </Button>
                          <div className="text-sm text-gray-500">
                            {new Date(image.createdAt).toLocaleDateString("ja-JP")}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "support" && (
            <motion.div
              key="support"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-pink-700">
                    <Heart className="w-5 h-5" />
                    応援メッセージを送る
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-800 mb-2">{artist.stageName}さんへの応援をお願いします💕</h3>
                    <p className="text-gray-600 text-sm">
                      あなたの温かい応援メッセージが、{artist.stageName}さんの夢を叶える力になります。
                      どんな小さなメッセージでも、きっと喜んでくれるはずです✨
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Textarea
                      placeholder={`${artist.stageName}さんへの応援メッセージを書いてください...`}
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      rows={4}
                      className="border-pink-200 focus:border-pink-400 bg-white/90"
                    />

                    <div className="flex gap-3">
                      <Button
                        onClick={handleSendSupport}
                        disabled={!supportMessage.trim()}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0 shadow-lg"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        応援メッセージを送る
                      </Button>

                      <Button
                        variant="outline"
                        className="border-pink-200 text-pink-600 hover:bg-pink-50 bg-transparent"
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        ギフトを贈る
                      </Button>
                    </div>
                  </div>

                  {/* Support Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-pink-600">{artist.supportLevel}%</div>
                      <div className="text-sm text-gray-500">応援レベル</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">1,234</div>
                      <div className="text-sm text-gray-500">応援メッセージ</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">567</div>
                      <div className="text-sm text-gray-500">ギフト数</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
