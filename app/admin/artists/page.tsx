"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import api from "@/api/axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Crown,
  Star,
  TrendingUp,
  Heart,
  Users,
  MessageSquare,
  Eye,
  Trophy,
  Target,
  Sparkles,
  Calendar,
  User,
  MoreHorizontal,
  Edit,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Award,
  Zap,
  Flame,
  Diamond,
  Music,
  Camera,
  Palette,
  Wand2,
  Rocket,
  Rainbow,
  Gift
} from "lucide-react"

interface Artist {
  id: string
  nickname: string
  fullName?: string
  email: string
  bio?: string
  avatar?: string
  age?: number
  location?: string
  interests?: string[]
  socialLinks?: Record<string, string>
  profileVisibility: string
  profileCompleteness: number
  role: string
  isActive: boolean
  createdAt: string
  rank: number
  stats: {
    postsCount: number
    commentsCount: number
    likesCount: number
    totalViews: number
    avgLikesPerPost: number
    engagementRate: number
  }
  recentPosts: Array<{
    id: string
    title: string
    viewCount: number
    createdAt: string
    likesCount: number
    commentsCount: number
  }>
}

interface ArtistFilters {
  search: string
  category: string
  sortBy: string
  sortOrder: string
}

export default function ArtistsManagementPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("rankings")
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<ArtistFilters>({
    search: "",
    category: "",
    sortBy: "likes",
    sortOrder: "desc"
  })

  // Modal states
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [showTargetDialog, setShowTargetDialog] = useState(false)
  const [showPromoteDialog, setShowPromoteDialog] = useState(false)

  // Form states
  const [targetType, setTargetType] = useState("")
  const [targetPriority, setTargetPriority] = useState("50")
  const [targetDuration, setTargetDuration] = useState("7")
  const [targetDescription, setTargetDescription] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      router.push("/")
      return
    }

    fetchArtists()
  }, [user, router, currentPage, filters])

  const fetchArtists = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(filters.category && { category: filters.category }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      })

      const response = await api.get(`/admin/artists/rankings?${params}`)
      setArtists(response.data.artists)
      setTotalPages(response.data.pagination.pages)
    } catch (error: any) {
      console.error("Failed to fetch artists:", error)
      setError(error.response?.data?.error || "Failed to load artists")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof ArtistFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleSetTarget = async () => {
    if (!selectedArtist || !targetType) return

    try {
      await api.post(`/admin/artists/${selectedArtist.id}/set-target`, {
        targetType,
        priority: parseInt(targetPriority),
        duration: parseInt(targetDuration),
        description: targetDescription
      })
      setShowTargetDialog(false)
      setSelectedArtist(null)
      setTargetType("")
      setTargetPriority("50")
      setTargetDuration("7")
      setTargetDescription("")
      await fetchArtists()
    } catch (error: any) {
      console.error("Failed to set target:", error)
      setError(error.response?.data?.error || "Failed to set target")
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Award className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Trophy className="h-5 w-5 text-amber-600" />
    if (rank <= 10) return <Star className="h-5 w-5 text-purple-500" />
    return <User className="h-5 w-5 text-gray-400" />
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
    if (rank === 3) return "bg-gradient-to-r from-amber-500 to-amber-700 text-white"
    if (rank <= 10) return "bg-gradient-to-r from-purple-400 to-purple-600 text-white"
    return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700"
  }

  const getTargetBadge = (interests: string[]) => {
    if (interests.includes("target_featured")) {
      return (
        <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
          <Star className="h-3 w-3 mr-1" />
          注目
        </Badge>
      )
    }
    if (interests.includes("target_promoted")) {
      return (
        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <Rocket className="h-3 w-3 mr-1" />
          プロモート
        </Badge>
      )
    }
    if (interests.includes("target_trending")) {
      return (
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <TrendingUp className="h-3 w-3 mr-1" />
          トレンド
        </Badge>
      )
    }
    if (interests.includes("target_rising")) {
      return (
        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <Flame className="h-3 w-3 mr-1" />
          急上昇
        </Badge>
      )
    }
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchArtists} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          再試行
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Gradient Background */}
      <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 p-8 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-purple-400/20 backdrop-blur-sm"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
                <Crown className="inline-block h-8 w-8 mr-3 text-yellow-400" />
                女性アーティスト管理
              </h1>
              <p className="text-pink-100 text-lg">
                デビュー前からの美しいコミュニティ空間を管理
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Sparkles className="h-8 w-8 text-yellow-300" />
              </div>
              <Button onClick={fetchArtists} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0">
                <RefreshCw className="h-4 w-4 mr-2" />
                更新
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards with Colorful Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総アーティスト数</CardTitle>
            <Crown className="h-4 w-4 text-yellow-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{artists.length}</div>
            <div className="text-xs text-pink-100 mt-1">
              美しい才能の集まり
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総いいね数</CardTitle>
            <Heart className="h-4 w-4 text-red-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {artists.reduce((sum, artist) => sum + artist.stats.likesCount, 0).toLocaleString()}
            </div>
            <div className="text-xs text-purple-100 mt-1">
              愛されるコンテンツ
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総閲覧数</CardTitle>
            <Eye className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {artists.reduce((sum, artist) => sum + artist.stats.totalViews, 0).toLocaleString()}
            </div>
            <div className="text-xs text-cyan-100 mt-1">
              魅力的なコンテンツ
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均エンゲージメント</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {artists.length > 0 ? (
                (artists.reduce((sum, artist) => sum + artist.stats.engagementRate, 0) / artists.length).toFixed(1)
              ) : "0.0"}
            </div>
            <div className="text-xs text-emerald-100 mt-1">
              活発なコミュニティ
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters with Stylish Design */}
      <Card className="mb-6 bg-gradient-to-r from-white to-pink-50 border-pink-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-pink-800 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            フィルター
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search" className="text-pink-700">検索</Label>
              <Input
                id="search"
                placeholder="アーティスト名で検索"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="border-pink-300 focus:border-pink-500"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-pink-700">カテゴリー</Label>
              <Select value={filters.category || "all"} onValueChange={(value) => handleFilterChange("category", value === "all" ? "" : value)}>
                <SelectTrigger className="border-pink-300 focus:border-pink-500">
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="music">音楽</SelectItem>
                  <SelectItem value="art">アート</SelectItem>
                  <SelectItem value="performance">パフォーマンス</SelectItem>
                  <SelectItem value="modeling">モデリング</SelectItem>
                  <SelectItem value="dance">ダンス</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sortBy" className="text-pink-700">並び順</Label>
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                <SelectTrigger className="border-pink-300 focus:border-pink-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="likes">いいね数</SelectItem>
                  <SelectItem value="posts">投稿数</SelectItem>
                  <SelectItem value="followers">フォロワー数</SelectItem>
                  <SelectItem value="engagement">エンゲージメント</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sortOrder" className="text-pink-700">順序</Label>
              <Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange("sortOrder", value)}>
                <SelectTrigger className="border-pink-300 focus:border-pink-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">降順</SelectItem>
                  <SelectItem value="asc">昇順</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Artists Rankings with Beautiful Cards */}
      <div className="space-y-6">
        {artists.map((artist, index) => (
          <Card 
            key={artist.id} 
            className={`overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${
              artist.rank <= 3 ? "border-2 border-gold shadow-lg" : "border border-gray-200"
            }`}
          >
            <div className={`h-2 ${getRankColor(artist.rank)}`}></div>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  {/* Rank Badge */}
                  <div className={`flex items-center justify-center w-16 h-16 rounded-full ${getRankColor(artist.rank)} shadow-lg`}>
                    <div className="text-center">
                      {getRankIcon(artist.rank)}
                      <div className="text-xs font-bold mt-1">#{artist.rank}</div>
                    </div>
                  </div>

                  {/* Avatar */}
                  <Avatar className="w-20 h-20 border-4 border-gradient-to-r from-pink-400 to-purple-400 shadow-lg">
                    <AvatarImage src={artist.avatar} alt={artist.nickname} />
                    <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white text-xl font-bold">
                      {artist.nickname.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Artist Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{artist.nickname}</h3>
                      {artist.fullName && (
                        <span className="text-sm text-gray-500">({artist.fullName})</span>
                      )}
                      {getTargetBadge(artist.interests || [])}
                    </div>
                    <p className="text-gray-600 mb-3">{artist.bio || "自己紹介はまだありません"}</p>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-gradient-to-r from-pink-100 to-rose-100 rounded-lg">
                        <div className="text-2xl font-bold text-pink-600">{artist.stats.postsCount}</div>
                        <div className="text-xs text-pink-500">投稿</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{artist.stats.likesCount}</div>
                        <div className="text-xs text-purple-500">いいね</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg">
                        <div className="text-2xl font-bold text-cyan-600">{artist.stats.totalViews}</div>
                        <div className="text-xs text-cyan-500">閲覧</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">{artist.stats.engagementRate.toFixed(1)}</div>
                        <div className="text-xs text-emerald-500">エンゲージメント</div>
                      </div>
                    </div>

                    {/* Profile Completeness */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">プロフィール完成度</span>
                        <span className="text-sm font-semibold text-purple-600">{artist.profileCompleteness}%</span>
                      </div>
                      <Progress 
                        value={artist.profileCompleteness} 
                        className="h-2"
                        style={{
                          background: `linear-gradient(to right, #ec4899 0%, #8b5cf6 ${artist.profileCompleteness}%, #e5e7eb ${artist.profileCompleteness}%, #e5e7eb 100%)`
                        }}
                      />
                    </div>

                    {/* Recent Posts */}
                    {artist.recentPosts.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">最近の投稿</h4>
                        <div className="space-y-2">
                          {artist.recentPosts.map((post) => (
                            <div key={post.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900 truncate">{post.title}</div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(post.createdAt)} • {post.viewCount} 閲覧
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 text-xs">
                                <div className="flex items-center space-x-1">
                                  <Heart className="h-3 w-3 text-red-500" />
                                  <span>{post.likesCount}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MessageSquare className="h-3 w-3 text-blue-500" />
                                  <span>{post.commentsCount}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={() => {
                      setSelectedArtist(artist)
                      setShowTargetDialog(true)
                    }}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    ターゲット設定
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedArtist(artist)
                      setShowPromoteDialog(true)
                    }}
                    variant="outline"
                    className="border-pink-300 text-pink-600 hover:bg-pink-50"
                  >
                    <Rocket className="h-4 w-4 mr-2" />
                    プロモート
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-4 mt-8">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="border-pink-300 text-pink-600 hover:bg-pink-50"
        >
          前へ
        </Button>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            ページ {currentPage} / {totalPages}
          </span>
        </div>
        <Button
          variant="outline"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="border-pink-300 text-pink-600 hover:bg-pink-50"
        >
          次へ
        </Button>
      </div>

      {/* Target Setting Dialog */}
      <Dialog open={showTargetDialog} onOpenChange={setShowTargetDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-pink-800">ターゲット設定</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="target-type" className="text-pink-700">ターゲットタイプ</Label>
              <Select value={targetType} onValueChange={setTargetType}>
                <SelectTrigger className="border-pink-300 focus:border-pink-500">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>注目アーティスト</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="promoted">
                    <div className="flex items-center space-x-2">
                      <Rocket className="h-4 w-4 text-blue-500" />
                      <span>プロモート</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="trending">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>トレンド</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="rising">
                    <div className="flex items-center space-x-2">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span>急上昇</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="target-priority" className="text-pink-700">優先度 (1-100)</Label>
              <Input
                id="target-priority"
                type="number"
                min="1"
                max="100"
                value={targetPriority}
                onChange={(e) => setTargetPriority(e.target.value)}
                className="border-pink-300 focus:border-pink-500"
              />
            </div>
            <div>
              <Label htmlFor="target-duration" className="text-pink-700">期間（日数）</Label>
              <Input
                id="target-duration"
                type="number"
                min="1"
                value={targetDuration}
                onChange={(e) => setTargetDuration(e.target.value)}
                className="border-pink-300 focus:border-pink-500"
              />
            </div>
            <div>
              <Label htmlFor="target-description" className="text-pink-700">説明</Label>
              <Textarea
                id="target-description"
                placeholder="ターゲット設定の説明"
                value={targetDescription}
                onChange={(e) => setTargetDescription(e.target.value)}
                className="border-pink-300 focus:border-pink-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowTargetDialog(false)}>
                キャンセル
              </Button>
              <Button onClick={handleSetTarget} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                設定
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Promote Dialog */}
      <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-purple-800">プロモート設定</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">プロモート機能</h3>
              <p className="text-sm text-gray-600">
                この機能は現在開発中です。<br/>
                近日中にリリース予定です。
              </p>
            </div>
            <div className="flex justify-center">
              <Button onClick={() => setShowPromoteDialog(false)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                閉じる
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 