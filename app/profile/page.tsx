'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Briefcase, 
  Heart, 
  Edit, 
  Camera, 
  Save, 
  X, 
  CalendarIcon,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Star,
  AlertTriangle,
  Activity,
  MessageSquare,
  FileText,
  TrendingUp,
  Calendar as CalendarActivity,
  Settings,
  Shield,
  Lock,
  Users,
  Award,
  Sparkles,
  Clock,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import api from '@/api/axios'
import { useToast } from '@/hooks/use-toast'

interface UserProfile {
  id: string
  nickname: string
  email: string
  avatar?: string
  fullName?: string
  bio?: string
  age?: number
  dateOfBirth?: string
  address?: string
  phone?: string
  website?: string
  location?: string
  gender?: string
  occupation?: string
  interests: string[]
  socialLinks?: {
    [key: string]: string
  }
  profileVisibility: string
  profileCompleteness: number
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  lastActiveAt?: string
  role: string
  _count?: {
    posts: number
    comments: number
    likes: number
    chatMessages: number
  }
}

interface ProfileSuggestion {
  field: string
  message: string
}

interface UserActivity {
  id: string
  action: string
  details: any
  createdAt: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [suggestions, setSuggestions] = useState<ProfileSuggestion[]>([])
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('profile')
  
  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    age: '',
    dateOfBirth: '',
    address: '',
    phone: '',
    website: '',
    location: '',
    gender: '',
    occupation: '',
    interests: [] as string[],
    socialLinks: {} as { [key: string]: string },
    profileVisibility: 'public'
  })
  
  const [newInterest, setNewInterest] = useState('')
  const [newSocialPlatform, setNewSocialPlatform] = useState('')
  const [newSocialUrl, setNewSocialUrl] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await api.get('/profile/me')
      const profileData = response.data.user
      
      setProfile(profileData)
      
      // Update form data
      setFormData({
        fullName: profileData.fullName || '',
        bio: profileData.bio || '',
        age: profileData.age?.toString() || '',
        dateOfBirth: profileData.dateOfBirth || '',
        address: profileData.address || '',
        phone: profileData.phone || '',
        website: profileData.website || '',
        location: profileData.location || '',
        gender: profileData.gender || '',
        occupation: profileData.occupation || '',
        interests: profileData.interests || [],
        socialLinks: profileData.socialLinks || {},
        profileVisibility: profileData.profileVisibility || 'public'
      })
      
      if (profileData.dateOfBirth) {
        setSelectedDate(new Date(profileData.dateOfBirth))
      }
    } catch (err: any) {
      console.error('Profile fetch error:', err)
      setError(err.response?.data?.error || 'プロフィールの取得に失敗しました')
      toast({
        title: "エラー",
        description: "プロフィールの取得に失敗しました",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch profile suggestions
  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/profile/me/suggestions')
      setSuggestions(response.data.suggestions || [])
    } catch (err) {
      console.error('Error fetching suggestions:', err)
    }
  }

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      // Try alternative endpoint for user stats
      const response = await api.get('/users/profile')
      if (response.data.user?.stats) {
        setProfile(prev => prev ? {
          ...prev,
          _count: {
            posts: response.data.user.stats.postsCount || 0,
            comments: response.data.user.stats.commentsCount || 0,
            likes: response.data.user.stats.likesCount || 0,
            chatMessages: 0
          }
        } : null)
      }
    } catch (err) {
      console.error('Error fetching user stats:', err)
      // Set default stats if the endpoint fails
      setProfile(prev => prev ? {
        ...prev,
        _count: {
          posts: 0,
          comments: 0,
          likes: 0,
          chatMessages: 0
        }
      } : null)
    }
  }

  // Update profile
  const updateProfile = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      const updateData = {
        fullName: formData.fullName.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        dateOfBirth: selectedDate?.toISOString() || undefined,
        address: formData.address.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        website: formData.website.trim() || undefined,
        location: formData.location.trim() || undefined,
        gender: formData.gender || undefined,
        occupation: formData.occupation.trim() || undefined,
        interests: formData.interests.filter(i => i.trim() !== ''),
        socialLinks: Object.fromEntries(
          Object.entries(formData.socialLinks).filter(([key, value]) => key.trim() !== '' && value.trim() !== '')
        ),
        profileVisibility: formData.profileVisibility
      }
      
      // Remove undefined values to avoid validation issues
      Object.keys(updateData).forEach(key => {
        const typedKey = key as keyof typeof updateData
        if (updateData[typedKey] === undefined || updateData[typedKey] === '') {
          delete updateData[typedKey]
        }
      })
      
      const response = await api.put('/profile/me', updateData)
      const updatedProfile = response.data.user
      
      setProfile(updatedProfile)
      setIsEditing(false)
      
      toast({
        title: "成功",
        description: "プロフィールが正常に更新されました",
      })
      
      // Refresh suggestions
      fetchSuggestions()
    } catch (err: any) {
      console.error('Profile update error:', err)
      const errorMessage = err.response?.data?.error || 'プロフィールの更新に失敗しました'
      setError(errorMessage)
      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "エラー",
        description: "ファイルサイズは5MB以下にしてください",
        variant: "destructive"
      })
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "エラー",
        description: "JPEG、PNG、GIF、WebP形式のファイルのみアップロード可能です",
        variant: "destructive"
      })
      return
    }

    try {
      setPhotoUploading(true)
      const formData = new FormData()
      formData.append('photo', file)
      
      const response = await api.post('/profile/me/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      setProfile(prev => prev ? { 
        ...prev, 
        avatar: response.data.avatar, 
        profileCompleteness: response.data.profileCompleteness 
      } : null)
      
      toast({
        title: "成功",
        description: "プロフィール写真が正常に更新されました",
      })
    } catch (err: any) {
      console.error('Photo upload error:', err)
      const errorMessage = err.response?.data?.error || '写真のアップロードに失敗しました'
      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setPhotoUploading(false)
    }
  }

  // Delete photo
  const handlePhotoDelete = async () => {
    try {
      await api.delete('/profile/me/photo')
      
      setProfile(prev => prev ? { 
        ...prev, 
        avatar: undefined
      } : null)
      
      toast({
        title: "成功",
        description: "プロフィール写真を削除しました",
      })
    } catch (err: any) {
      console.error('Photo delete error:', err)
      toast({
        title: "エラー",
        description: "写真の削除に失敗しました",
        variant: "destructive"
      })
    }
  }

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle interests
  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim()) && formData.interests.length < 10) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }))
      setNewInterest('')
    } else if (formData.interests.length >= 10) {
      toast({
        title: "制限",
        description: "興味・趣味は最大10個まで追加できます",
        variant: "destructive"
      })
    }
  }

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }))
  }

  // Handle social links
  const addSocialLink = () => {
    if (newSocialPlatform.trim() && newSocialUrl.trim() && Object.keys(formData.socialLinks).length < 5) {
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [newSocialPlatform.toLowerCase()]: newSocialUrl
        }
      }))
      setNewSocialPlatform('')
      setNewSocialUrl('')
    } else if (Object.keys(formData.socialLinks).length >= 5) {
      toast({
        title: "制限",
        description: "SNSリンクは最大5個まで追加できます",
        variant: "destructive"
      })
    }
  }

  const removeSocialLink = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: Object.fromEntries(
        Object.entries(prev.socialLinks).filter(([key]) => key !== platform)
      )
    }))
  }

  // Get social icon
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return <Twitter className="w-4 h-4" />
      case 'instagram': return <Instagram className="w-4 h-4" />
      case 'facebook': return <Facebook className="w-4 h-4" />
      case 'linkedin': return <Linkedin className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  // Get gender display
  const getGenderDisplay = (gender: string) => {
    switch (gender) {
      case 'male': return '男性'
      case 'female': return '女性'
      case 'other': return 'その他'
      case 'prefer_not_to_say': return '回答しない'
      default: return gender
    }
  }

  // Get visibility display
  const getVisibilityDisplay = (visibility: string) => {
    switch (visibility) {
      case 'public': return '公開'
      case 'friends': return '友達のみ'
      case 'private': return '非公開'
      default: return visibility
    }
  }

  // Get visibility icon
  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="w-4 h-4" />
      case 'friends': return <Users className="w-4 h-4" />
      case 'private': return <Lock className="w-4 h-4" />
      default: return <Eye className="w-4 h-4" />
    }
  }

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '不明'
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '不明'
    
    return format(date, 'yyyy年MM月dd日', { locale: ja })
  }

  // Format relative time
  const formatRelativeTime = (dateString: string | null | undefined) => {
    if (!dateString) return '不明'
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '不明'
    
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return '1時間未満前'
    if (diffInHours < 24) return `${diffInHours}時間前`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) return `${diffInDays}日前`
    
    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) return `${diffInMonths}ヶ月前`
    
    const diffInYears = Math.floor(diffInMonths / 12)
    return `${diffInYears}年前`
  }

  useEffect(() => {
    if (!user) return
    
    fetchProfile()
    fetchSuggestions()
    fetchUserStats()
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <div className="text-center">
              <Skeleton className="h-10 w-64 mx-auto mb-4" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-6">
                <Skeleton className="h-80 rounded-2xl" />
                <Skeleton className="h-64 rounded-2xl" />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-96 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive" className="border-red-200 bg-red-50/80 backdrop-blur-sm">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={fetchProfile} 
              className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              再試行
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Alert className="border-amber-200 bg-amber-50/80 backdrop-blur-sm">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                プロフィールが見つかりません
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
                プロフィール
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                あなたの情報を管理・編集して、より魅力的なプロフィールを作成しましょう
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  size="lg"
                >
                  <Edit className="w-5 h-5 mr-2" />
                  編集する
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={updateProfile} 
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        保存する
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    disabled={isSubmitting}
                    className="border-gray-300 hover:bg-gray-50 transition-all duration-300"
                    size="lg"
                  >
                    <X className="w-5 h-5 mr-2" />
                    キャンセル
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="space-y-8">
            {/* Profile Card */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
              <CardHeader className="text-center relative -mt-12 pb-6">
                <div className="relative mx-auto w-36 h-36 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-lg opacity-30"></div>
                  <Avatar className="w-36 h-36 border-4 border-white shadow-2xl relative z-10">
                    <AvatarImage src={profile.avatar} alt={profile.nickname} />
                    <AvatarFallback className="text-3xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                      {profile.nickname.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 z-20">
                      <Label htmlFor="photo-upload" className="cursor-pointer text-white hover:text-blue-200 transition-colors">
                        <Camera className="w-8 h-8" />
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          disabled={photoUploading}
                        />
                      </Label>
                    </div>
                  )}
                  
                  {photoUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <CardTitle className="text-2xl font-bold text-gray-900">{profile.nickname}</CardTitle>
                  {profile.fullName && (
                    <p className="text-gray-600 font-medium">{profile.fullName}</p>
                  )}
                  <div className="flex items-center justify-center space-x-2">
                    <div className="p-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100">
                      {getVisibilityIcon(profile.profileVisibility)}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {getVisibilityDisplay(profile.profileVisibility)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6 px-6 pb-6">
                {/* Role Badge */}
                <div className="flex justify-center">
                  <Badge 
                    variant={profile.role === 'ADMIN' ? 'destructive' : 'secondary'}
                    className={cn(
                      "px-4 py-2 text-sm font-semibold",
                      profile.role === 'ADMIN' && "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg",
                      profile.role === 'MODERATOR' && "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg",
                      profile.role === 'USER' && "bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-lg"
                    )}
                  >
                    {profile.role === 'ADMIN' ? '🛡️ 管理者' : 
                     profile.role === 'MODERATOR' ? '⚡ モデレーター' : '👤 ユーザー'}
                  </Badge>
                </div>

                {/* Profile Completeness */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">プロフィール完成度</span>
                    <span className="text-sm text-gray-600 font-bold">{profile.profileCompleteness}%</span>
                  </div>
                  <div className="relative">
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${profile.profileCompleteness}%` }}
                      ></div>
                    </div>
                    <div className="absolute inset-0 h-3 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Quick Stats */}
                {profile._count && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">{profile._count.posts}</div>
                      <div className="text-xs text-blue-700 font-medium">投稿</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                      <div className="text-2xl font-bold text-green-600">{profile._count.comments}</div>
                      <div className="text-xs text-green-700 font-medium">コメント</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
                      <div className="text-2xl font-bold text-red-600">{profile._count.likes}</div>
                      <div className="text-xs text-red-700 font-medium">いいね</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                      <div className="text-sm font-bold text-purple-600">
                        {formatRelativeTime(profile.lastActiveAt || profile.createdAt)}
                      </div>
                      <div className="text-xs text-purple-700 font-medium">最終活動</div>
                    </div>
                  </div>
                )}

                {/* Member Since */}
                <div className="text-center p-4 rounded-xl bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200">
                  <div className="flex items-center justify-center space-x-2 text-gray-600">
                    <CalendarActivity className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {formatDate(profile.createdAt)}より参加
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Suggestions */}
            {suggestions.length > 0 && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-200">
                  <CardTitle className="flex items-center text-amber-800">
                    <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                    プロフィール強化のヒント
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 hover:shadow-md transition-all duration-300">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 animate-pulse"></div>
                        <p className="text-sm text-yellow-800 font-medium leading-relaxed">{suggestion.message}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
                  <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm border border-gray-200 shadow-sm">
                    <TabsTrigger 
                      value="profile" 
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-md font-medium transition-all duration-300"
                    >
                      基本情報
                    </TabsTrigger>
                    <TabsTrigger 
                      value="details"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-md font-medium transition-all duration-300"
                    >
                      詳細情報
                    </TabsTrigger>
                    <TabsTrigger 
                      value="privacy"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-md font-medium transition-all duration-300"
                    >
                      プライバシー
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Basic Profile Tab */}
                <TabsContent value="profile" className="p-6 space-y-8">
                  <div className="space-y-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                        <User className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">基本情報</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nickname" className="text-sm font-semibold text-gray-700">ニックネーム</Label>
                        <Input
                          id="nickname"
                          value={profile.nickname}
                          disabled
                          className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500">ニックネームは変更できません</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">メールアドレス</Label>
                        <Input
                          id="email"
                          value={profile.email}
                          disabled
                          className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500">メールアドレスは変更できません</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">本名</Label>
                      <Input
                        id="fullName"
                        value={isEditing ? formData.fullName : profile.fullName || ''}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        disabled={!isEditing}
                        placeholder="山田太郎"
                        className={cn(
                          "transition-all duration-300",
                          isEditing ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" : "bg-gray-50 border-gray-200"
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">自己紹介</Label>
                      <Textarea
                        id="bio"
                        value={isEditing ? formData.bio : profile.bio || ''}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        disabled={!isEditing}
                        placeholder="あなたについて教えてください..."
                        rows={4}
                        maxLength={500}
                        className={cn(
                          "transition-all duration-300 resize-none",
                          isEditing ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" : "bg-gray-50 border-gray-200"
                        )}
                      />
                      {isEditing && (
                        <div className="flex justify-between">
                          <p className="text-xs text-gray-500">
                            {formData.bio.length}/500文字
                          </p>
                          <div className={cn(
                            "text-xs font-medium",
                            formData.bio.length > 450 ? "text-red-500" : formData.bio.length > 400 ? "text-yellow-500" : "text-green-500"
                          )}>
                            残り{500 - formData.bio.length}文字
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="age" className="text-sm font-semibold text-gray-700">年齢</Label>
                        <Input
                          id="age"
                          type="number"
                          value={isEditing ? formData.age : profile.age?.toString() || ''}
                          onChange={(e) => handleInputChange('age', e.target.value)}
                          disabled={!isEditing}
                          placeholder="25"
                          min="13"
                          max="120"
                          className={cn(
                            "transition-all duration-300",
                            isEditing ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" : "bg-gray-50 border-gray-200"
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-sm font-semibold text-gray-700">性別</Label>
                        <Select 
                          value={isEditing ? formData.gender : profile.gender || ''} 
                          onValueChange={(value) => handleInputChange('gender', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className={cn(
                            "transition-all duration-300",
                            isEditing ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" : "bg-gray-50 border-gray-200"
                          )}>
                            <SelectValue placeholder="選択してください" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">👨 男性</SelectItem>
                            <SelectItem value="female">👩 女性</SelectItem>
                            <SelectItem value="other">🌈 その他</SelectItem>
                            <SelectItem value="prefer_not_to_say">🤐 回答しない</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-700">生年月日</Label>
                        <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal transition-all duration-300",
                                !selectedDate && "text-muted-foreground",
                                isEditing ? "border-blue-300 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" : "bg-gray-50 border-gray-200 cursor-not-allowed"
                              )}
                              disabled={!isEditing}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "yyyy/MM/dd") : "選択してください"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 border-0 shadow-xl" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => {
                                setSelectedDate(date)
                                setShowDatePicker(false)
                              }}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                              className="rounded-xl border-0"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-semibold text-gray-700">所在地</Label>
                        <Input
                          id="location"
                          value={isEditing ? formData.location : profile.location || ''}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          disabled={!isEditing}
                          placeholder="東京都"
                          className={cn(
                            "transition-all duration-300",
                            isEditing ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" : "bg-gray-50 border-gray-200"
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="occupation" className="text-sm font-semibold text-gray-700">職業</Label>
                        <Input
                          id="occupation"
                          value={isEditing ? formData.occupation : profile.occupation || ''}
                          onChange={(e) => handleInputChange('occupation', e.target.value)}
                          disabled={!isEditing}
                          placeholder="エンジニア"
                          className={cn(
                            "transition-all duration-300",
                            isEditing ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" : "bg-gray-50 border-gray-200"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="space-y-6 pt-8 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                        <Heart className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">興味・趣味</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-3">
                        {(isEditing ? formData.interests : profile.interests).map((interest, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="text-sm px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 hover:shadow-md transition-all duration-300"
                          >
                            {interest}
                            {isEditing && (
                              <button
                                onClick={() => removeInterest(interest)}
                                className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </Badge>
                        ))}
                        {(isEditing ? formData.interests : profile.interests).length === 0 && (
                          <div className="text-center w-full py-8">
                            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">まだ興味・趣味が登録されていません</p>
                          </div>
                        )}
                      </div>

                      {isEditing && (
                        <div className="flex space-x-3">
                          <Input
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            placeholder="新しい興味・趣味を追加"
                            onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                            maxLength={50}
                            className="flex-1 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                          />
                          <Button 
                            onClick={addInterest} 
                            disabled={!newInterest.trim()}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="p-6 space-y-8">
                  <div className="space-y-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                        <Mail className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">連絡先情報</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">電話番号</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={isEditing ? formData.phone : profile.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={!isEditing}
                          placeholder="090-1234-5678"
                          className={cn(
                            "transition-all duration-300",
                            isEditing ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" : "bg-gray-50 border-gray-200"
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-sm font-semibold text-gray-700">ウェブサイト</Label>
                        <Input
                          id="website"
                          type="url"
                          value={isEditing ? formData.website : profile.website || ''}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          disabled={!isEditing}
                          placeholder="https://example.com"
                          className={cn(
                            "transition-all duration-300",
                            isEditing ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" : "bg-gray-50 border-gray-200"
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm font-semibold text-gray-700">住所</Label>
                        <Textarea
                          id="address"
                          value={isEditing ? formData.address : profile.address || ''}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          disabled={!isEditing}
                          placeholder="東京都渋谷区..."
                          rows={3}
                          className={cn(
                            "transition-all duration-300 resize-none",
                            isEditing ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" : "bg-gray-50 border-gray-200"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="space-y-6 pt-8 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white">
                        <Globe className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">SNSリンク</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-4">
                        {Object.entries(isEditing ? formData.socialLinks : profile.socialLinks || {}).map(([platform, url]) => (
                          <div key={platform} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-white shadow-sm">
                                {getSocialIcon(platform)}
                              </div>
                              <span className="font-semibold capitalize text-gray-700">{platform}</span>
                            </div>
                            <div className="flex-1">
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline truncate block font-medium transition-colors"
                              >
                                {url}
                              </a>
                            </div>
                            {isEditing && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeSocialLink(platform)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        
                        {Object.keys(isEditing ? formData.socialLinks : profile.socialLinks || {}).length === 0 && (
                          <div className="text-center py-8">
                            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">まだSNSリンクが登録されていません</p>
                          </div>
                        )}
                      </div>

                      {isEditing && (
                        <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                          <div className="flex space-x-3">
                            <Input
                              value={newSocialPlatform}
                              onChange={(e) => setNewSocialPlatform(e.target.value)}
                              placeholder="プラットフォーム名 (twitter, instagram...)"
                              className="flex-1 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                            <Input
                              value={newSocialUrl}
                              onChange={(e) => setNewSocialUrl(e.target.value)}
                              placeholder="URL"
                              className="flex-1 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                            <Button 
                              onClick={addSocialLink} 
                              disabled={!newSocialPlatform.trim() || !newSocialUrl.trim()}
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-blue-700 font-medium">
                            SNSリンクは最大5個まで追加できます
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Privacy Tab */}
                <TabsContent value="privacy" className="p-6 space-y-8">
                  <div className="space-y-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                        <Shield className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">プライバシー設定</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="profileVisibility" className="text-sm font-semibold text-gray-700">プロフィールの公開範囲</Label>
                        <Select 
                          value={isEditing ? formData.profileVisibility : profile.profileVisibility} 
                          onValueChange={(value) => handleInputChange('profileVisibility', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className={cn(
                            "transition-all duration-300",
                            isEditing ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" : "bg-gray-50 border-gray-200"
                          )}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">
                              🌍 公開 - 誰でも見ることができます
                            </SelectItem>
                            <SelectItem value="friends">
                              👥 友達のみ - 承認されたユーザーのみ
                            </SelectItem>
                            <SelectItem value="private">
                              🔒 非公開 - 自分のみ
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Current Privacy Status */}
                      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <h4 className="font-bold mb-4 flex items-center text-blue-800">
                          {getVisibilityIcon(profile.profileVisibility)}
                          <span className="ml-2">現在の設定: {getVisibilityDisplay(profile.profileVisibility)}</span>
                        </h4>
                        <div className="text-sm text-blue-800 space-y-2 leading-relaxed">
                          {profile.profileVisibility === 'public' && (
                            <>
                              <p className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-600" /> あなたのプロフィールは検索結果に表示されます</p>
                              <p className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-600" /> すべてのユーザーがあなたの基本情報を見ることができます</p>
                              <p className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-600" /> SNSリンクや詳細情報も公開されます</p>
                            </>
                          )}
                          {profile.profileVisibility === 'friends' && (
                            <>
                              <p className="flex items-center"><Users className="w-4 h-4 mr-2 text-blue-600" /> あなたが承認したユーザーのみがプロフィールを見ることができます</p>
                              <p className="flex items-center"><Eye className="w-4 h-4 mr-2 text-yellow-600" /> 基本情報（ニックネーム、写真）は表示される場合があります</p>
                              <p className="flex items-center"><Shield className="w-4 h-4 mr-2 text-green-600" /> 詳細情報やSNSリンクは友達のみに表示されます</p>
                            </>
                          )}
                          {profile.profileVisibility === 'private' && (
                            <>
                              <p className="flex items-center"><Lock className="w-4 h-4 mr-2 text-red-600" /> あなたのプロフィールは検索結果に表示されません</p>
                              <p className="flex items-center"><Lock className="w-4 h-4 mr-2 text-red-600" /> あなたのみがプロフィール情報を見ることができます</p>
                              <p className="flex items-center"><Eye className="w-4 h-4 mr-2 text-yellow-600" /> 基本情報（ニックネーム、写真）は表示される場合があります</p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Account Actions */}
                      <div className="pt-6 border-t border-gray-200">
                        <h4 className="font-bold mb-6 text-gray-900 text-lg">アカウント管理</h4>
                        <div className="space-y-4">
                          {profile.avatar && (
                            <Button 
                              variant="outline" 
                              onClick={handlePhotoDelete}
                              className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200 transition-all duration-300"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              プロフィール写真を削除
                            </Button>
                          )}
                          <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                            <div className="flex items-start space-x-3">
                              <Settings className="w-5 h-5 text-gray-500 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-700 font-medium mb-1">
                                  アカウントの詳細設定
                                </p>
                                <p className="text-sm text-gray-600">
                                  アカウントの削除やニックネーム変更については、管理者にお問い合わせください。
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 