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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
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
  Settings,
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  MoreHorizontal,
  Shield,
  Globe,
  Database,
  Bell,
  CreditCard,
  Users,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye,
  EyeOff,
  Download,
  Upload,
  Filter,
  X,
  Copy,
  ExternalLink,
  Zap,
  Lock,
  Unlock,
  Palette,
  Monitor,
  Smartphone,
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  Activity,
  TrendingUp,
  FileText,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SystemSetting {
  id: string
  key: string
  value: string
  description?: string
  category: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

interface GroupedSettings {
  [category: string]: SystemSetting[]
}

const categoryConfig = {
  general: {
    icon: Globe,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    textColor: "text-blue-700 dark:text-blue-300",
    borderColor: "border-blue-200 dark:border-blue-800",
    name: "一般設定",
    description: "サイトの基本設定とアプリケーション設定"
  },
  security: {
    icon: Shield,
    color: "from-red-500 to-pink-500",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    textColor: "text-red-700 dark:text-red-300",
    borderColor: "border-red-200 dark:border-red-800",
    name: "セキュリティ",
    description: "認証、暗号化、アクセス制御設定"
  },
  moderation: {
    icon: Users,
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    textColor: "text-yellow-700 dark:text-yellow-300",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    name: "モデレーション",
    description: "コンテンツとユーザーモデレーション設定"
  },
  payment: {
    icon: CreditCard,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    textColor: "text-green-700 dark:text-green-300",
    borderColor: "border-green-200 dark:border-green-800",
    name: "決済設定",
    description: "支払い処理と請求設定"
  },
  notification: {
    icon: Bell,
    color: "from-purple-500 to-violet-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    textColor: "text-purple-700 dark:text-purple-300",
    borderColor: "border-purple-200 dark:border-purple-800",
    name: "通知設定",
    description: "メール、プッシュ、SMS通知設定"
  },
  system: {
    icon: Database,
    color: "from-gray-500 to-slate-500",
    bgColor: "bg-gray-50 dark:bg-gray-950/20",
    textColor: "text-gray-700 dark:text-gray-300",
    borderColor: "border-gray-200 dark:border-gray-800",
    name: "システム",
    description: "データベース、ログ、バックアップ設定"
  }
}

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [settings, setSettings] = useState<GroupedSettings>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showPublicOnly, setShowPublicOnly] = useState(false)
  
  // Selection and bulk operations
  const [selectedSettings, setSelectedSettings] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [bulkOperationMode, setBulkOperationMode] = useState(false)
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkEditModal, setShowBulkEditModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedSetting, setSelectedSetting] = useState<SystemSetting | null>(null)
  
  // Form states
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    description: "",
    category: "general",
    isPublic: false
  })
  const [bulkEditData, setBulkEditData] = useState({
    category: "",
    isPublic: undefined as boolean | undefined
  })
  const [submitting, setSubmitting] = useState(false)
  
  // Advanced features
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
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

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get("/admin/settings")
      setSettings(response.data.settings)
    } catch (error: any) {
      console.error("Failed to fetch settings:", error)
      setError(error.response?.data?.error || "設定の取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleCreateSetting = async () => {
    try {
      setSubmitting(true)
      
      await api.post("/admin/settings", formData)
      
      setShowCreateModal(false)
      setFormData({
        key: "",
        value: "",
        description: "",
        category: "general",
        isPublic: false
      })
      
      await fetchSettings()
      
      // Show success animation
      setRecentlyUpdated(new Set([formData.key]))
      setTimeout(() => setRecentlyUpdated(new Set()), 3000)
    } catch (error: any) {
      console.error("Failed to create setting:", error)
      setError(error.response?.data?.error || "設定の作成に失敗しました")
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateSetting = async () => {
    if (!selectedSetting) return
    
    try {
      setSubmitting(true)
      
      await api.put(`/admin/settings/${selectedSetting.key}`, {
        value: formData.value,
        description: formData.description,
        category: formData.category,
        isPublic: formData.isPublic
      })
      
      setShowEditModal(false)
      setSelectedSetting(null)
      
      await fetchSettings()
      
      // Show success animation
      setRecentlyUpdated(new Set([selectedSetting.key]))
      setTimeout(() => setRecentlyUpdated(new Set()), 3000)
    } catch (error: any) {
      console.error("Failed to update setting:", error)
      setError(error.response?.data?.error || "設定の更新に失敗しました")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSetting = async () => {
    if (!selectedSetting) return
    
    try {
      setSubmitting(true)
      
      await api.delete(`/admin/settings/${selectedSetting.key}`)
      
      setShowDeleteModal(false)
      setSelectedSetting(null)
      
      await fetchSettings()
    } catch (error: any) {
      console.error("Failed to delete setting:", error)
      setError(error.response?.data?.error || "設定の削除に失敗しました")
    } finally {
      setSubmitting(false)
    }
  }

  const handleBulkUpdate = async () => {
    try {
      setSubmitting(true)
      
      const settingsToUpdate = Array.from(selectedSettings).map(key => {
        const setting = Object.values(settings).flat().find(s => s.key === key)
        if (!setting) return null
        
        return {
          key: setting.key,
          value: setting.value,
          ...(bulkEditData.category && { category: bulkEditData.category }),
          ...(bulkEditData.isPublic !== undefined && { isPublic: bulkEditData.isPublic })
        }
      }).filter(Boolean)
      
      await api.put("/admin/settings", { settings: settingsToUpdate })
      
      setShowBulkEditModal(false)
      setBulkOperationMode(false)
      setSelectedSettings(new Set())
      setBulkEditData({ category: "", isPublic: undefined })
      
      await fetchSettings()
      
      // Show success animation
      setRecentlyUpdated(new Set(selectedSettings))
      setTimeout(() => setRecentlyUpdated(new Set()), 3000)
    } catch (error: any) {
      console.error("Failed to bulk update settings:", error)
      setError(error.response?.data?.error || "一括更新に失敗しました")
    } finally {
      setSubmitting(false)
    }
  }

  const handleExportSettings = () => {
    const allSettings = Object.values(settings).flat()
    const dataStr = JSON.stringify(allSettings, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `settings_backup_${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const openEditModal = (setting: SystemSetting) => {
    setSelectedSetting(setting)
    setFormData({
      key: setting.key,
      value: setting.value,
      description: setting.description || "",
      category: setting.category,
      isPublic: setting.isPublic
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (setting: SystemSetting) => {
    setSelectedSetting(setting)
    setShowDeleteModal(true)
  }

  const toggleSettingSelection = (key: string) => {
    const newSelection = new Set(selectedSettings)
    if (newSelection.has(key)) {
      newSelection.delete(key)
    } else {
      newSelection.add(key)
    }
    setSelectedSettings(newSelection)
  }

  const toggleSelectAll = () => {
    const allKeys = Object.values(filteredSettings).flat().map(s => s.key)
    if (selectAll) {
      setSelectedSettings(new Set())
    } else {
      setSelectedSettings(new Set(allKeys))
    }
    setSelectAll(!selectAll)
  }

  const toggleRowExpansion = (key: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedRows(newExpanded)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Filter settings based on search and category
  const filteredSettings = Object.entries(settings).reduce((acc, [category, categorySettings]) => {
    if (selectedCategory !== "all" && selectedCategory !== category) {
      return acc
    }
    
    let filtered = categorySettings.filter(setting => {
      const matchesSearch = setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setting.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setting.value.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesPublicFilter = !showPublicOnly || setting.isPublic
      
      return matchesSearch && matchesPublicFilter
    })
    
    if (filtered.length > 0) {
      acc[category] = filtered
    }
    
    return acc
  }, {} as GroupedSettings)

  const categories = Object.keys(settings)
  const totalSettings = Object.values(settings).flat().length
  const filteredCount = Object.values(filteredSettings).flat().length

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-64" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Modern Header with Gradient */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white">
            <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:20px_20px]" />
            <div className="relative">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <Settings className="h-8 w-8" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                        システム設定
                      </h1>
                      <p className="text-blue-100 text-lg">
                        アプリケーションの設定を管理・カスタマイズ
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Database className="h-4 w-4" />
                      <span>総設定数: {totalSettings}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Filter className="h-4 w-4" />
                      <span>表示中: {filteredCount}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Globe className="h-4 w-4" />
                      <span>カテゴリ: {categories.length}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={handleExportSettings}
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    エクスポート
                  </Button>
                  
                  {bulkOperationMode ? (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setShowBulkEditModal(true)}
                        disabled={selectedSettings.size === 0}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        一括編集 ({selectedSettings.size})
                      </Button>
                      <Button 
                        onClick={() => {
                          setBulkOperationMode(false)
                          setSelectedSettings(new Set())
                          setSelectAll(false)
                        }}
                        variant="secondary"
                        className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                      >
                        <X className="h-4 w-4 mr-2" />
                        キャンセル
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button 
                        onClick={() => setBulkOperationMode(true)}
                        variant="secondary"
                        className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        一括操作
                      </Button>
                      <Button 
                        onClick={() => setShowCreateModal(true)}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        新しい設定
                      </Button>
                    </>
                  )}
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

          {/* Advanced Search and Filter */}
          <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      placeholder="設定をキー、値、説明で検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 text-base border-0 bg-white/50 dark:bg-gray-800/50 focus:bg-white dark:focus:bg-gray-800 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48 h-12 border-0 bg-white/50 dark:bg-gray-800/50">
                      <SelectValue placeholder="カテゴリ選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          全カテゴリ
                        </div>
                      </SelectItem>
                      {Object.entries(categoryConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className="h-4 w-4" />
                            {config.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-4 rounded-lg h-12">
                    <Switch
                      id="publicOnly"
                      checked={showPublicOnly}
                      onCheckedChange={setShowPublicOnly}
                    />
                    <Label htmlFor="publicOnly" className="text-sm font-medium">公開のみ</Label>
                  </div>
                  
                  <Button variant="outline" onClick={fetchSettings} className="h-12 px-6">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    更新
                  </Button>
                </div>
              </div>
              
              {bulkOperationMode && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={toggleSelectAll}
                      />
                      <span className="text-sm font-medium">
                        {selectedSettings.size > 0 
                          ? `${selectedSettings.size}件選択中` 
                          : "全選択"
                        }
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        一括操作モード
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings Categories */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 h-auto p-2 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white py-3 px-4 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">全て</span>
                </div>
              </TabsTrigger>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:text-white py-3 px-4 rounded-lg transition-all duration-200"
                  style={{
                    background: selectedCategory === key ? `linear-gradient(to right, ${config.color.split(' ')[1]}, ${config.color.split(' ')[3]})` : undefined
                  }}
                >
                  <div className="flex items-center gap-2">
                    <config.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{config.name.split('設定')[0]}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6 space-y-6">
              {Object.entries(filteredSettings).map(([category, categorySettings]) => {
                const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.general
                const Icon = config.icon
                
                return (
                  <Card 
                    key={category} 
                    className={cn(
                      "border-0 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl",
                      config.bgColor
                    )}
                  >
                    <CardHeader className={cn("border-b", config.borderColor)}>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl bg-gradient-to-r", config.color, "text-white")}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className={cn("text-xl font-bold", config.textColor)}>
                              {config.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {config.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn("border-2", config.borderColor, config.textColor)}>
                            {categorySettings.length}件
                          </Badge>
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            設定済み
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-0 bg-white/50 dark:bg-gray-800/50">
                              {bulkOperationMode && (
                                <TableHead className="w-12">
                                  <span className="sr-only">選択</span>
                                </TableHead>
                              )}
                              <TableHead className="font-semibold">キー</TableHead>
                              <TableHead className="font-semibold">値</TableHead>
                              <TableHead className="font-semibold">説明</TableHead>
                              <TableHead className="font-semibold">公開</TableHead>
                              <TableHead className="font-semibold">更新日時</TableHead>
                              <TableHead className="font-semibold">操作</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {categorySettings.map((setting) => (
                              <TableRow 
                                key={setting.id} 
                                className={cn(
                                  "border-0 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200",
                                  recentlyUpdated.has(setting.key) && "bg-green-50 dark:bg-green-950/20 animate-pulse",
                                  selectedSettings.has(setting.key) && "bg-blue-50 dark:bg-blue-950/20"
                                )}
                              >
                                {bulkOperationMode && (
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedSettings.has(setting.key)}
                                      onCheckedChange={() => toggleSettingSelection(setting.key)}
                                    />
                                  </TableCell>
                                )}
                                
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <code className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                      {setting.key}
                                    </code>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(setting.key)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                                
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="max-w-xs">
                                      {expandedRows.has(setting.key) ? (
                                        <div className="text-sm whitespace-pre-wrap break-words">
                                          {setting.value}
                                        </div>
                                      ) : (
                                        <div className="truncate text-sm">
                                          {setting.value.length > 50 
                                            ? `${setting.value.substring(0, 50)}...` 
                                            : setting.value
                                          }
                                        </div>
                                      )}
                                    </div>
                                    
                                    {setting.value.length > 50 && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleRowExpansion(setting.key)}
                                        className="h-6 w-6 p-0"
                                      >
                                        {expandedRows.has(setting.key) ? (
                                          <ChevronDown className="h-3 w-3" />
                                        ) : (
                                          <ChevronRight className="h-3 w-3" />
                                        )}
                                      </Button>
                                    )}
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(setting.value)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                                
                                <TableCell>
                                  <div className="max-w-xs">
                                    <div className="text-sm text-muted-foreground">
                                      {setting.description || "説明なし"}
                                    </div>
                                  </div>
                                </TableCell>
                                
                                <TableCell>
                                  {setting.isPublic ? (
                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                      <Eye className="h-3 w-3 mr-1" />
                                      公開
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">
                                      <EyeOff className="h-3 w-3 mr-1" />
                                      非公開
                                    </Badge>
                                  )}
                                </TableCell>
                                
                                <TableCell>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(setting.updatedAt).toLocaleDateString('ja-JP')}
                                  </div>
                                </TableCell>
                                
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuItem onClick={() => openEditModal(setting)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        編集
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => copyToClipboard(`${setting.key}=${setting.value}`)}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        キー=値をコピー
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      {user?.role === "SUPER_ADMIN" && (
                                        <DropdownMenuItem 
                                          onClick={() => openDeleteModal(setting)}
                                          className="text-red-600 focus:text-red-600"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          削除
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              
              {Object.keys(filteredSettings).length === 0 && (
                <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-900/70">
                  <CardContent className="p-12 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Search className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold">設定が見つかりません</h3>
                      <p className="text-muted-foreground">
                        検索条件に一致する設定がありません。検索キーワードやフィルターを調整してください。
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" onClick={() => setSearchTerm("")}>
                          検索をクリア
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedCategory("all")}>
                          全カテゴリ表示
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Create Setting Modal */}
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  新しい設定を作成
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="key" className="text-sm font-medium">キー *</Label>
                    <Input
                      id="key"
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                      placeholder="setting_key"
                      pattern="^[a-z0-9_]+$"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      英小文字、数字、アンダースコアのみ使用可能
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="value" className="text-sm font-medium">値 *</Label>
                    <Textarea
                      id="value"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder="設定値"
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium">説明</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="設定の説明"
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category" className="text-sm font-medium">カテゴリ *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <config.icon className="h-4 w-4" />
                              {config.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                    />
                    <Label htmlFor="isPublic" className="text-sm font-medium">公開設定</Label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    キャンセル
                  </Button>
                  <Button 
                    onClick={handleCreateSetting} 
                    disabled={submitting || !formData.key || !formData.value}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        作成中...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        作成
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Setting Modal */}
          <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  設定を編集
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-key" className="text-sm font-medium">キー</Label>
                    <Input
                      id="edit-key"
                      value={formData.key}
                      disabled
                      className="mt-1 bg-muted"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-value" className="text-sm font-medium">値 *</Label>
                    <Textarea
                      id="edit-value"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-description" className="text-sm font-medium">説明</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-category" className="text-sm font-medium">カテゴリ</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <config.icon className="h-4 w-4" />
                              {config.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                    />
                    <Label htmlFor="edit-isPublic" className="text-sm font-medium">公開設定</Label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowEditModal(false)}>
                    キャンセル
                  </Button>
                  <Button 
                    onClick={handleUpdateSetting} 
                    disabled={submitting || !formData.value}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        更新中...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        更新
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Setting Modal */}
          <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  設定を削除
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-950/20 rounded-full flex items-center justify-center">
                    <Trash2 className="h-8 w-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">本当に削除しますか？</h3>
                    <p className="text-muted-foreground">
                      設定「<code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{selectedSetting?.key}</code>」を削除します。
                      この操作は取り消せません。
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                    キャンセル
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteSetting} 
                    disabled={submitting}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        削除中...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        削除
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Bulk Edit Modal */}
          <Dialog open={showBulkEditModal} onOpenChange={setShowBulkEditModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  一括編集
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {selectedSettings.size}件の設定を一括編集します
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="bulk-category" className="text-sm font-medium">カテゴリ変更</Label>
                    <Select 
                      value={bulkEditData.category} 
                      onValueChange={(value) => setBulkEditData({ ...bulkEditData, category: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="変更しない" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <config.icon className="h-4 w-4" />
                              {config.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">公開設定変更</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="bulk-public-no-change"
                          name="bulk-public"
                          checked={bulkEditData.isPublic === undefined}
                          onChange={() => setBulkEditData({ ...bulkEditData, isPublic: undefined })}
                        />
                        <Label htmlFor="bulk-public-no-change" className="text-sm">変更しない</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="bulk-public-true"
                          name="bulk-public"
                          checked={bulkEditData.isPublic === true}
                          onChange={() => setBulkEditData({ ...bulkEditData, isPublic: true })}
                        />
                        <Label htmlFor="bulk-public-true" className="text-sm">公開に設定</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="bulk-public-false"
                          name="bulk-public"
                          checked={bulkEditData.isPublic === false}
                          onChange={() => setBulkEditData({ ...bulkEditData, isPublic: false })}
                        />
                        <Label htmlFor="bulk-public-false" className="text-sm">非公開に設定</Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowBulkEditModal(false)}>
                    キャンセル
                  </Button>
                  <Button 
                    onClick={handleBulkUpdate} 
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
                        <Zap className="h-4 w-4" />
                        一括更新
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