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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { 
  Users,
  Search,
  Filter,
  Star,
  Trophy,
  Crown,
  Eye,
  Edit,
  MoreHorizontal,
  TrendingUp,
  MessageSquare,
  Heart,
  FileText,
  Calendar,
  MapPin,
  Briefcase,
  Mail,
  UserPlus,
  UserMinus,
  Award,
  Zap,
  Activity,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  UserCheck,
  Sparkles,
  Globe,
  Clock,
  ExternalLink,
  Copy,
  X,
  ChevronDown,
  ChevronUp,
  Phone,
  Link,
  Palette,
  Settings,
  ArrowUp,
  ArrowDown,
  Flame,
  Target,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Artist {
  id: string
  nickname: string
  email: string
  fullName?: string
  bio?: string
  avatar?: string
  age?: number
  location?: string
  gender?: string
  occupation?: string
  interests: string[]
  role: string
  isActive: boolean
  isBlocked: boolean
  isSuspended: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  lastActiveAt?: string
  ranking: number
  stats: {
    postsCount: number
    commentsCount: number
    likesCount: number
    messagesCount: number
    totalActivity: number
  }
  isArtist: boolean
}

interface ArtistDetails extends Omit<Artist, 'stats'> {
  stats: {
    postsCount: number
    commentsCount: number
    likesCount: number
    messagesCount: number
    reportsCount: number
    totalViews: number
    totalInteractions: number
    avgViewsPerPost: number
    totalActivity: number
  }
  recentPosts: Array<{
    id: string
    title: string
    category: string
    viewCount: number
    createdAt: string
    stats: {
      comments: number
      likes: number
    }
  }>
}

interface ArtistRankings {
  rankings: Array<{
    id: string
    nickname: string
    avatar?: string
    bio?: string
    interests: string[]
    stats: {
      posts: number
      comments: number
      likes: number
      views: number
      score: number
    }
    rank: number
    isFeatured: boolean
    isVerified: boolean
  }>
  stats: {
    totalArtists: number
    featuredArtists: number
    verifiedArtists: number
    period: string
    category: string
    topScore: number
    avgScore: number
  }
  generatedAt: string
}

const rankColors = {
  1: "from-yellow-400 to-yellow-600",
  2: "from-gray-400 to-gray-600", 
  3: "from-amber-600 to-amber-800"
}

const roleConfig = {
  USER: { label: "ユーザー", color: "bg-gray-100 text-gray-800" },
  MODERATOR: { label: "モデレーター", color: "bg-blue-100 text-blue-800" },
  ADMIN: { label: "管理者", color: "bg-purple-100 text-purple-800" },
  SUPER_ADMIN: { label: "スーパー管理者", color: "bg-red-100 text-red-800" }
}

export default function AdminArtistsPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [artists, setArtists] = useState<Artist[]>([])
  const [rankings, setRankings] = useState<ArtistRankings | null>(null)
  const [selectedArtist, setSelectedArtist] = useState<ArtistDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [rankingsLoading, setRankingsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  
  // Rankings filters
  const [rankingPeriod, setRankingPeriod] = useState("month")
  const [rankingCategory, setRankingCategory] = useState("activity")
  
  // Modal states
  const [showArtistDetails, setShowArtistDetails] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showFeatureModal, setShowFeatureModal] = useState(false)
  
  // Form states
  const [statusFormData, setStatusFormData] = useState({
    isArtist: false,
    artistRole: "standard",
    reason: ""
  })
  const [featureFormData, setFeatureFormData] = useState({
    featured: false,
    reason: ""
  })
  const [submitting, setSubmitting] = useState(false)
  
  // UI states
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [recentlyUpdated, setRecentlyUpdated] = useState<Set<string>>(new Set())

  // Check admin permissions
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.push("/")
      return
    }
  }, [user, router])

  const fetchArtists = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(searchTerm && { search: searchTerm }),
        ...(isActiveFilter !== "all" && { isActive: isActiveFilter }),
        sortBy,
        sortOrder
      })

      const response = await api.get(`/admin/artists?${params}`)
      
      if (response.data && response.data.artists) {
        setArtists(response.data.artists)
        setTotalPages(response.data.pagination?.pages || 1)
      } else {
        setArtists([])
        setTotalPages(1)
      }
    } catch (error: any) {
      console.error("Failed to fetch artists:", error)
      setError(error.response?.data?.error || "アーティストの取得に失敗しました")
      setArtists([])
    } finally {
      setLoading(false)
    }
  }

  const fetchRankings = async () => {
    try {
      setRankingsLoading(true)
      const params = new URLSearchParams({
        period: rankingPeriod,
        category: rankingCategory
      })

      const response = await api.get(`/admin/artists/rankings/stats?${params}`)
      
      if (response.data) {
        setRankings(response.data)
      }
    } catch (error: any) {
      console.error("Failed to fetch rankings:", error)
      // Don't show error for rankings as it's not critical
    } finally {
      setRankingsLoading(false)
    }
  }

  const fetchArtistDetails = async (artistId: string) => {
    try {
      setLoading(true)
      
      const response = await api.get(`/admin/artists/${artistId}`)
      
      if (response.data && response.data.artist) {
        setSelectedArtist(response.data.artist)
        setShowArtistDetails(true)
      }
    } catch (error: any) {
      console.error("Failed to fetch artist details:", error)
      setError(error.response?.data?.error || "アーティスト詳細の取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArtists()
  }, [currentPage, searchTerm, isActiveFilter, sortBy, sortOrder])

  useEffect(() => {
    fetchRankings()
  }, [rankingPeriod, rankingCategory])

  const handleUpdateArtistStatus = async () => {
    if (!selectedArtist) return
    
    try {
      setSubmitting(true)
      
      await api.patch(`/admin/artists/${selectedArtist.id}/status`, statusFormData)
      
      setShowStatusModal(false)
      await fetchArtists()
      
      // Show success animation
      setRecentlyUpdated(new Set([selectedArtist.id]))
      setTimeout(() => setRecentlyUpdated(new Set()), 3000)
      
      // Update selected artist if details are open
      if (showArtistDetails) {
        await fetchArtistDetails(selectedArtist.id)
      }
    } catch (error: any) {
      console.error("Failed to update artist status:", error)
      setError(error.response?.data?.error || "アーティストステータスの更新に失敗しました")
    } finally {
      setSubmitting(false)
    }
  }

  const handleFeatureArtist = async () => {
    if (!selectedArtist) return
    
    try {
      setSubmitting(true)
      
      await api.patch(`/admin/artists/${selectedArtist.id}/feature`, featureFormData)
      
      setShowFeatureModal(false)
      await fetchArtists()
      await fetchRankings()
      
      // Show success animation
      setRecentlyUpdated(new Set([selectedArtist.id]))
      setTimeout(() => setRecentlyUpdated(new Set()), 3000)
      
      // Update selected artist if details are open
      if (showArtistDetails) {
        await fetchArtistDetails(selectedArtist.id)
      }
    } catch (error: any) {
      console.error("Failed to feature artist:", error)
      setError(error.response?.data?.error || "アーティストの注目設定に失敗しました")
    } finally {
      setSubmitting(false)
    }
  }

  const openStatusModal = (artist: Artist) => {
    // Convert Artist to ArtistDetails for modal use
    const artistDetails: ArtistDetails = {
      ...artist,
      stats: {
        ...artist.stats,
        reportsCount: 0,
        totalViews: 0,
        totalInteractions: 0,
        avgViewsPerPost: 0
      },
      recentPosts: []
    }
    setSelectedArtist(artistDetails)
    setStatusFormData({
      isArtist: artist.interests?.includes("artist") || false,
      artistRole: artist.interests?.find(i => i.startsWith("artist_"))?.replace("artist_", "") || "standard",
      reason: ""
    })
    setShowStatusModal(true)
  }

  const openFeatureModal = (artist: Artist) => {
    // Convert Artist to ArtistDetails for modal use
    const artistDetails: ArtistDetails = {
      ...artist,
      stats: {
        ...artist.stats,
        reportsCount: 0,
        totalViews: 0,
        totalInteractions: 0,
        avgViewsPerPost: 0
      },
      recentPosts: []
    }
    setSelectedArtist(artistDetails)
    setFeatureFormData({
      featured: artist.interests?.includes("featured_artist") || false,
      reason: ""
    })
    setShowFeatureModal(true)
  }

  const getArtistBadges = (artist: Artist) => {
    const badges = []
    
    if (artist.interests?.includes("featured_artist")) {
      badges.push({ text: "注目", color: "yellow", icon: Star, gradient: "from-yellow-400 to-yellow-600" })
    }
    if (artist.interests?.includes("artist_verified")) {
      badges.push({ text: "認証済み", color: "blue", icon: CheckCircle, gradient: "from-blue-400 to-blue-600" })
    }
    if (artist.interests?.includes("artist_premium")) {
      badges.push({ text: "プレミアム", color: "purple", icon: Crown, gradient: "from-purple-400 to-purple-600" })
    }
    if (artist.role === "ADMIN" || artist.role === "MODERATOR") {
      badges.push({ text: "スタッフ", color: "red", icon: Shield, gradient: "from-red-400 to-red-600" })
    }
    
    return badges
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "未設定"
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "今日"
    if (diffDays === 2) return "昨日"
    if (diffDays <= 7) return `${diffDays}日前`
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}週間前`
    if (diffDays <= 365) return `${Math.ceil(diffDays / 30)}ヶ月前`
    return `${Math.ceil(diffDays / 365)}年前`
  }

  const toggleCardExpansion = (artistId: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(artistId)) {
      newExpanded.delete(artistId)
    } else {
      newExpanded.add(artistId)
    }
    setExpandedCards(newExpanded)
  }

  const calculateActivityScore = (artist: Artist) => {
    return (artist.stats.postsCount * 3) + 
           (artist.stats.commentsCount * 2) + 
           (artist.stats.likesCount * 1) + 
           (artist.stats.messagesCount * 0.5)
  }

  const getActivityLevel = (score: number) => {
    if (score >= 100) return { level: "非常に活発", color: "text-green-600", bg: "bg-green-100" }
    if (score >= 50) return { level: "活発", color: "text-blue-600", bg: "bg-blue-100" }
    if (score >= 20) return { level: "普通", color: "text-yellow-600", bg: "bg-yellow-100" }
    return { level: "低い", color: "text-gray-600", bg: "bg-gray-100" }
  }

  if (loading && artists.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 dark:from-slate-950 dark:via-purple-950 dark:to-pink-950">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-80" />
                <Skeleton className="h-6 w-96" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 rounded-2xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 dark:from-slate-950 dark:via-purple-950 dark:to-pink-950">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Modern Header with Gradient */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 p-8 text-white">
            <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:20px_20px]" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 via-pink-600/80 to-indigo-600/80" />
            <div className="relative">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <Users className="h-10 w-10" />
                    </div>
                    <div>
                      <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                        アーティスト管理
                      </h1>
                      <p className="text-purple-100 text-xl mt-2">
                        クリエイターコミュニティの管理・サポート
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Users className="h-4 w-4" />
                      <span>総アーティスト: {artists.length}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Star className="h-4 w-4" />
                      <span>注目: {artists.filter(a => a.interests?.includes("featured_artist")).length}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Activity className="h-4 w-4" />
                      <span>アクティブ: {artists.filter(a => a.isActive).length}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => fetchArtists()}
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    更新
                  </Button>
                  
                  <Button 
                    onClick={() => fetchRankings()}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    ランキング更新
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setError(null)}
                className="ml-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          )}

          {/* Tabs */}
          <Tabs defaultValue="artists" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-auto p-2 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
              <TabsTrigger 
                value="artists" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white py-3 px-6 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="font-semibold">アーティスト一覧</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="rankings" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white py-3 px-6 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  <span className="font-semibold">ランキング</span>
                </div>
              </TabsTrigger>
            </TabsList>

            {/* Artists List Tab */}
            <TabsContent value="artists" className="space-y-6">
              {/* Advanced Search and Filter */}
              <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input
                          placeholder="アーティストを名前、メール、バイオで検索..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-12 h-12 text-base border-0 bg-white/50 dark:bg-gray-800/50 focus:bg-white dark:focus:bg-gray-800 transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
                        <SelectTrigger className="w-48 h-12 border-0 bg-white/50 dark:bg-gray-800/50">
                          <SelectValue placeholder="ステータス" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全ステータス</SelectItem>
                          <SelectItem value="true">アクティブ</SelectItem>
                          <SelectItem value="false">非アクティブ</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-48 h-12 border-0 bg-white/50 dark:bg-gray-800/50">
                          <SelectValue placeholder="並び順" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="createdAt">登録日</SelectItem>
                          <SelectItem value="lastLoginAt">最終ログイン</SelectItem>
                          <SelectItem value="nickname">名前</SelectItem>
                          <SelectItem value="email">メールアドレス</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-32 h-12 border-0 bg-white/50 dark:bg-gray-800/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">
                            <div className="flex items-center gap-2">
                              <ArrowDown className="h-4 w-4" />
                              降順
                            </div>
                          </SelectItem>
                          <SelectItem value="asc">
                            <div className="flex items-center gap-2">
                              <ArrowUp className="h-4 w-4" />
                              昇順
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Artists Grid */}
              {artists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artists.map((artist) => {
                    const badges = getArtistBadges(artist)
                    const activityScore = calculateActivityScore(artist)
                    const activityLevel = getActivityLevel(activityScore)
                    const isExpanded = expandedCards.has(artist.id)
                    const isRecent = recentlyUpdated.has(artist.id)
                    
                    return (
                      <Card 
                        key={artist.id} 
                        className={cn(
                          "group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 overflow-hidden",
                          "bg-gradient-to-br from-white via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950/50",
                          isRecent && "ring-4 ring-green-400 ring-opacity-75 animate-pulse",
                          isExpanded && "lg:col-span-2"
                        )}
                        onClick={() => !isExpanded && toggleCardExpansion(artist.id)}
                      >
                        <CardHeader className="pb-4 relative">
                          {/* Background decoration */}
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-indigo-500/5 rounded-t-lg" />
                          
                          <div className="relative">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <Avatar className="h-16 w-16 ring-4 ring-white shadow-lg">
                                    <AvatarImage src={artist.avatar} alt={artist.nickname} />
                                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl font-bold">
                                      {artist.nickname.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  {artist.isActive && (
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg truncate group-hover:text-purple-600 transition-colors">
                                      {artist.nickname}
                                    </h3>
                                    <Badge 
                                      variant="outline" 
                                      className="text-xs font-bold bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200"
                                    >
                                      #{artist.ranking}
                                    </Badge>
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground truncate">
                                    {artist.fullName || artist.email}
                                  </p>
                                  
                                  <div className="flex items-center gap-1 mt-1">
                                    <Badge 
                                      variant="outline" 
                                      className={cn("text-xs", roleConfig[artist.role as keyof typeof roleConfig]?.color)}
                                    >
                                      {roleConfig[artist.role as keyof typeof roleConfig]?.label}
                                    </Badge>
                                    <Badge 
                                      variant="outline" 
                                      className={cn("text-xs", activityLevel.color, activityLevel.bg)}
                                    >
                                      {activityLevel.level}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleCardExpansion(artist.id)
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            </div>
                            
                            {/* Badges */}
                            {badges.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {badges.map((badge, index) => {
                                  const Icon = badge.icon
                                  return (
                                    <Badge 
                                      key={index} 
                                      variant="outline" 
                                      className={cn(
                                        "text-xs font-semibold bg-gradient-to-r text-white border-0 shadow-md",
                                        badge.gradient
                                      )}
                                    >
                                      <Icon className="h-3 w-3 mr-1" />
                                      {badge.text}
                                    </Badge>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0 space-y-4">
                          {/* Bio */}
                          {artist.bio && (
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {artist.bio}
                              </p>
                            </div>
                          )}
                          
                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-lg p-3 text-center">
                              <div className="text-2xl font-bold text-blue-600">{artist.stats.postsCount}</div>
                              <div className="text-xs text-blue-600/80 font-medium">投稿</div>
                            </div>
                            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 rounded-lg p-3 text-center">
                              <div className="text-2xl font-bold text-red-600">{artist.stats.likesCount}</div>
                              <div className="text-xs text-red-600/80 font-medium">いいね</div>
                            </div>
                          </div>
                          
                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-lg p-3 text-center">
                                  <div className="text-xl font-bold text-green-600">{artist.stats.commentsCount}</div>
                                  <div className="text-xs text-green-600/80 font-medium">コメント</div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-lg p-3 text-center">
                                  <div className="text-xl font-bold text-purple-600">{artist.stats.messagesCount}</div>
                                  <div className="text-xs text-purple-600/80 font-medium">メッセージ</div>
                                </div>
                              </div>
                              
                              {/* Additional Info */}
                              <div className="space-y-2 text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                {artist.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span>{artist.location}</span>
                                  </div>
                                )}
                                {artist.occupation && (
                                  <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-gray-400" />
                                    <span>{artist.occupation}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span>登録: {formatDate(artist.createdAt)}</span>
                                </div>
                                {artist.lastLoginAt && (
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span>最終ログイン: {formatDate(artist.lastLoginAt)}</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Activity Score */}
                              <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">アクティビティスコア</span>
                                  <span className="text-lg font-bold text-purple-600">{Math.round(activityScore)}</span>
                                </div>
                                <Progress 
                                  value={Math.min(activityScore, 100)} 
                                  className="h-2 bg-purple-200"
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* Status Indicators */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex gap-2">
                              {artist.isActive ? (
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                  <Activity className="h-3 w-3 mr-1" />
                                  アクティブ
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">
                                  <Clock className="h-3 w-3 mr-1" />
                                  非アクティブ
                                </Badge>
                              )}
                              {artist.isBlocked && (
                                <Badge variant="destructive" className="text-xs">ブロック済み</Badge>
                              )}
                              {artist.isSuspended && (
                                <Badge variant="destructive" className="text-xs">停止中</Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation()
                                fetchArtistDetails(artist.id)
                              }}
                              className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              詳細
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                  className="bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => openStatusModal(artist)}>
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  ステータス変更
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openFeatureModal(artist)}>
                                  <Star className="h-4 w-4 mr-2" />
                                  注目設定
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(artist.email)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  メールをコピー
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-900/70">
                  <CardContent className="p-12 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold">アーティストが見つかりません</h3>
                      <p className="text-muted-foreground">
                        検索条件に一致するアーティストがいません。フィルターを調整してください。
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" onClick={() => setSearchTerm("")}>
                          検索をクリア
                        </Button>
                        <Button variant="outline" onClick={() => setIsActiveFilter("all")}>
                          全ステータス表示
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-6"
                  >
                    前のページ
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            "w-10 h-10",
                            currentPage === page && "bg-gradient-to-r from-purple-500 to-pink-500"
                          )}
                        >
                          {page}
                        </Button>
                      )
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="px-2">...</span>
                        <Button
                          variant={currentPage === totalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className={cn(
                            "w-10 h-10",
                            currentPage === totalPages && "bg-gradient-to-r from-purple-500 to-pink-500"
                          )}
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-6"
                  >
                    次のページ
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Rankings Tab */}
            <TabsContent value="rankings" className="space-y-6">
              {/* Rankings Controls */}
              <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div>
                      <Label htmlFor="period" className="text-sm font-medium">期間</Label>
                      <Select value={rankingPeriod} onValueChange={setRankingPeriod}>
                        <SelectTrigger className="w-full sm:w-32 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">週間</SelectItem>
                          <SelectItem value="month">月間</SelectItem>
                          <SelectItem value="year">年間</SelectItem>
                          <SelectItem value="all">全期間</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="category" className="text-sm font-medium">カテゴリ</Label>
                      <Select value={rankingCategory} onValueChange={setRankingCategory}>
                        <SelectTrigger className="w-full sm:w-40 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="activity">総合活動</SelectItem>
                          <SelectItem value="posts">投稿数</SelectItem>
                          <SelectItem value="likes">いいね数</SelectItem>
                          <SelectItem value="comments">コメント数</SelectItem>
                          <SelectItem value="views">閲覧数</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex-1" />
                    
                    <Button 
                      onClick={fetchRankings} 
                      disabled={rankingsLoading}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      {rankingsLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          更新中...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4" />
                          更新
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Rankings Stats */}
              {rankings && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500 rounded-xl">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-blue-600">{rankings.stats.totalArtists}</div>
                          <div className="text-sm text-blue-600/80 font-medium">総アーティスト数</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/30">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-500 rounded-xl">
                          <Star className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-yellow-600">{rankings.stats.featuredArtists}</div>
                          <div className="text-sm text-yellow-600/80 font-medium">注目アーティスト</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-500 rounded-xl">
                          <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-green-600">{rankings.stats.verifiedArtists}</div>
                          <div className="text-sm text-green-600/80 font-medium">認証済み</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500 rounded-xl">
                          <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-purple-600">{rankings.stats.avgScore}</div>
                          <div className="text-sm text-purple-600/80 font-medium">平均スコア</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Rankings Table */}
              {rankings && rankings.rankings.length > 0 ? (
                <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-6 w-6 text-yellow-600" />
                      アーティストランキング
                      <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800">
                        {rankingPeriod === "week" && "週間"}
                        {rankingPeriod === "month" && "月間"}
                        {rankingPeriod === "year" && "年間"}
                        {rankingPeriod === "all" && "全期間"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-0 bg-gray-50 dark:bg-gray-800/50">
                            <TableHead className="font-semibold">順位</TableHead>
                            <TableHead className="font-semibold">アーティスト</TableHead>
                            <TableHead className="font-semibold">ステータス</TableHead>
                            <TableHead className="font-semibold">投稿</TableHead>
                            <TableHead className="font-semibold">いいね</TableHead>
                            <TableHead className="font-semibold">コメント</TableHead>
                            <TableHead className="font-semibold">閲覧数</TableHead>
                            <TableHead className="font-semibold">スコア</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rankings.rankings.map((rankedArtist) => (
                            <TableRow 
                              key={rankedArtist.id} 
                              className="border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {rankedArtist.rank <= 3 && (
                                    <div className={cn(
                                      "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg",
                                      `bg-gradient-to-r ${rankColors[rankedArtist.rank as keyof typeof rankColors] || "from-gray-400 to-gray-600"}`
                                    )}>
                                      {rankedArtist.rank}
                                    </div>
                                  )}
                                  {rankedArtist.rank > 3 && (
                                    <span className="font-bold text-lg">#{rankedArtist.rank}</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
                                    <AvatarImage src={rankedArtist.avatar} alt={rankedArtist.nickname} />
                                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                                      {rankedArtist.nickname.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-semibold">{rankedArtist.nickname}</div>
                                    {rankedArtist.bio && (
                                      <div className="text-sm text-muted-foreground truncate max-w-32">
                                        {rankedArtist.bio}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {rankedArtist.isFeatured && (
                                    <Badge 
                                      variant="outline" 
                                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0 shadow-sm"
                                    >
                                      <Star className="h-3 w-3 mr-1" />
                                      注目
                                    </Badge>
                                  )}
                                  {rankedArtist.isVerified && (
                                    <Badge 
                                      variant="outline" 
                                      className="bg-gradient-to-r from-blue-400 to-blue-600 text-white border-0 shadow-sm"
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      認証
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-semibold">
                                  {rankedArtist.stats.posts}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-semibold text-red-600 border-red-200">
                                  {rankedArtist.stats.likes}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-semibold text-green-600 border-green-200">
                                  {rankedArtist.stats.comments}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-semibold text-purple-600 border-purple-200">
                                  {rankedArtist.stats.views}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className="font-bold bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200"
                                >
                                  {rankedArtist.stats.score}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-900/70">
                  <CardContent className="p-12 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold">ランキングデータなし</h3>
                      <p className="text-muted-foreground">
                        {rankingsLoading ? "ランキングを読み込み中..." : "選択した期間のランキングデータがありません。"}
                      </p>
                      <Button onClick={fetchRankings} disabled={rankingsLoading}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        再読み込み
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Artist Details Modal */}
          <Dialog open={showArtistDetails} onOpenChange={setShowArtistDetails}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  アーティスト詳細
                </DialogTitle>
              </DialogHeader>
              {selectedArtist && (
                <div className="space-y-6">
                  {/* Profile Section */}
                  <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl">
                    <Avatar className="h-24 w-24 ring-4 ring-white shadow-xl">
                      <AvatarImage src={selectedArtist.avatar} alt={selectedArtist.nickname} />
                      <AvatarFallback className="text-3xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {selectedArtist.nickname.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold mb-2">{selectedArtist.nickname}</h2>
                      {selectedArtist.fullName && (
                        <p className="text-xl text-muted-foreground mb-2">{selectedArtist.fullName}</p>
                      )}
                      <div className="flex items-center gap-2 mb-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedArtist.email}</span>
                      </div>
                      
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        {getArtistBadges(selectedArtist).map((badge, index) => {
                          const Icon = badge.icon
                          return (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className={cn(
                                "font-semibold bg-gradient-to-r text-white border-0 shadow-md",
                                badge.gradient
                              )}
                            >
                              <Icon className="h-3 w-3 mr-1" />
                              {badge.text}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {selectedArtist.bio && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">自己紹介</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">{selectedArtist.bio}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30">
                      <CardContent className="p-4 text-center">
                        <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-blue-600">{selectedArtist.stats.postsCount}</div>
                        <div className="text-sm text-blue-600/80 font-medium">投稿数</div>
                      </CardContent>
                    </Card>
                    <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30">
                      <CardContent className="p-4 text-center">
                        <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-red-600">{selectedArtist.stats.likesCount}</div>
                        <div className="text-sm text-red-600/80 font-medium">いいね</div>
                      </CardContent>
                    </Card>
                    <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30">
                      <CardContent className="p-4 text-center">
                        <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-green-600">{selectedArtist.stats.commentsCount}</div>
                        <div className="text-sm text-green-600/80 font-medium">コメント</div>
                      </CardContent>
                    </Card>
                    <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30">
                      <CardContent className="p-4 text-center">
                        <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-purple-600">{selectedArtist.stats.totalViews}</div>
                        <div className="text-sm text-purple-600/80 font-medium">総閲覧数</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Additional Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          基本情報
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {selectedArtist.age && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">年齢:</span>
                            <span className="font-medium">{selectedArtist.age}歳</span>
                          </div>
                        )}
                        {selectedArtist.gender && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">性別:</span>
                            <span className="font-medium">{selectedArtist.gender}</span>
                          </div>
                        )}
                        {selectedArtist.location && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">所在地:</span>
                            <span className="font-medium">{selectedArtist.location}</span>
                          </div>
                        )}
                        {selectedArtist.occupation && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">職業:</span>
                            <span className="font-medium">{selectedArtist.occupation}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">登録日:</span>
                          <span className="font-medium">{formatDate(selectedArtist.createdAt)}</span>
                        </div>
                        {selectedArtist.lastLoginAt && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">最終ログイン:</span>
                            <span className="font-medium">{formatDate(selectedArtist.lastLoginAt)}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          アクティビティ統計
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">平均閲覧数/投稿:</span>
                          <span className="font-medium">{selectedArtist.stats.avgViewsPerPost}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">総インタラクション:</span>
                          <span className="font-medium">{selectedArtist.stats.totalInteractions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">メッセージ数:</span>
                          <span className="font-medium">{selectedArtist.stats.messagesCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">報告数:</span>
                          <span className="font-medium">{selectedArtist.stats.reportsCount}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Posts */}
                  {selectedArtist.recentPosts && selectedArtist.recentPosts.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          最近の投稿
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedArtist.recentPosts.slice(0, 5).map((post) => (
                            <div key={post.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg hover:shadow-md transition-shadow">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg mb-1">{post.title}</h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(post.createdAt)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    {post.viewCount}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Heart className="h-3 w-3" />
                                    {post.stats.likes}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3" />
                                    {post.stats.comments}
                                  </span>
                                </div>
                              </div>
                              <Badge variant="outline" className="ml-4">{post.category}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Status Update Modal */}
          <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  アーティストステータス変更
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="isArtist"
                      checked={statusFormData.isArtist}
                      onCheckedChange={(checked) => setStatusFormData({ ...statusFormData, isArtist: checked })}
                    />
                    <Label htmlFor="isArtist" className="font-medium">アーティスト指定</Label>
                  </div>
                  
                  {statusFormData.isArtist && (
                    <div>
                      <Label htmlFor="artistRole" className="text-sm font-medium">アーティストレベル</Label>
                      <Select 
                        value={statusFormData.artistRole} 
                        onValueChange={(value) => setStatusFormData({ ...statusFormData, artistRole: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">スタンダード</SelectItem>
                          <SelectItem value="verified">認証済み</SelectItem>
                          <SelectItem value="premium">プレミアム</SelectItem>
                          <SelectItem value="featured">注目</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="reason" className="text-sm font-medium">理由</Label>
                    <Textarea
                      id="reason"
                      value={statusFormData.reason}
                      onChange={(e) => setStatusFormData({ ...statusFormData, reason: e.target.value })}
                      placeholder="変更理由を入力..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowStatusModal(false)}>
                    キャンセル
                  </Button>
                  <Button 
                    onClick={handleUpdateArtistStatus} 
                    disabled={submitting}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        更新中...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        更新
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Feature Modal */}
          <Dialog open={showFeatureModal} onOpenChange={setShowFeatureModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  アーティスト注目設定
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="featured"
                      checked={featureFormData.featured}
                      onCheckedChange={(checked) => setFeatureFormData({ ...featureFormData, featured: checked })}
                    />
                    <Label htmlFor="featured" className="font-medium">注目アーティストに設定</Label>
                  </div>
                  
                  <div>
                    <Label htmlFor="featureReason" className="text-sm font-medium">理由</Label>
                    <Textarea
                      id="featureReason"
                      value={featureFormData.reason}
                      onChange={(e) => setFeatureFormData({ ...featureFormData, reason: e.target.value })}
                      placeholder="注目設定の理由を入力..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowFeatureModal(false)}>
                    キャンセル
                  </Button>
                  <Button 
                    onClick={handleFeatureArtist} 
                    disabled={submitting}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        更新中...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        更新
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
} 