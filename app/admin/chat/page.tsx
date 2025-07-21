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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
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
  MessageCircle, 
  Search,
  MoreHorizontal,
  Trash2,
  Ban,
  Users,
  Settings,
  AlertTriangle,
  RefreshCw,
  Calendar,
  User,
  Crown,
  Lock,
  Unlock,
  MessageSquare,
  Shield,
  Clock,
  Globe,
  Heart,
  Smile,
  UserPlus
} from "lucide-react"

interface ChatRoom {
  id: string
  name: string
  description?: string
  atmosphere: string
  isPrivate: boolean
  maxMembers: number
  createdAt: string
  updatedAt: string
  creator: {
    id: string
    nickname: string
    email: string
  }
  _count: {
    members: number
    messages: number
  }
}

interface ChatMessage {
  id: string
  content: string
  type: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" | "HIDDEN"
  createdAt: string
  moderationReason?: string
  moderatedAt?: string
  moderatedBy?: string
  isBlocked: boolean
  user: {
    id: string
    nickname: string
    email: string
  }
  room: {
    id: string
    name: string
  }
}

interface ChatFilters {
  search: string
  atmosphere: string
  isPrivate: string
}

interface MessageFilters {
  search: string
  status: string
  roomId: string
}

export default function AdminChatPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("rooms")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Chat Rooms
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [roomsCurrentPage, setRoomsCurrentPage] = useState(1)
  const [roomsTotalPages, setRoomsTotalPages] = useState(1)
  const [roomFilters, setRoomFilters] = useState<ChatFilters>({
    search: "",
    atmosphere: "",
    isPrivate: ""
  })

  // Chat Messages
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messagesCurrentPage, setMessagesCurrentPage] = useState(1)
  const [messagesTotalPages, setMessagesTotalPages] = useState(1)
  const [messageFilters, setMessageFilters] = useState<MessageFilters>({
    search: "",
    status: "",
    roomId: ""
  })

  // Modal states
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null)
  const [showDeleteRoom, setShowDeleteRoom] = useState(false)
  const [showDeleteMessage, setShowDeleteMessage] = useState(false)
  const [showRestrictUser, setShowRestrictUser] = useState(false)

  // Form states
  const [restrictUserId, setRestrictUserId] = useState("")
  const [restrictReason, setRestrictReason] = useState("")
  const [restrictDuration, setRestrictDuration] = useState("24")
  const [isPermanentRestriction, setIsPermanentRestriction] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (!["ADMIN", "MODERATOR", "SUPER_ADMIN"].includes(user.role)) {
      router.push("/")
      return
    }

    if (activeTab === "rooms") {
      fetchRooms()
    } else if (activeTab === "messages") {
      fetchMessages()
    }
  }, [user, router, activeTab, roomsCurrentPage, messagesCurrentPage, roomFilters, messageFilters])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        page: roomsCurrentPage.toString(),
        limit: "20",
        ...(roomFilters.search && { search: roomFilters.search })
      })

      const response = await api.get(`/admin/chat/rooms?${params}`)
      setRooms(response.data.rooms)
      setRoomsTotalPages(response.data.pagination.pages)
    } catch (error: any) {
      console.error("Failed to fetch rooms:", error)
      setError(error.response?.data?.error || "Failed to load rooms")
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        page: messagesCurrentPage.toString(),
        limit: "20",
        ...(messageFilters.search && { search: messageFilters.search }),
        ...(messageFilters.status && { status: messageFilters.status }),
        ...(messageFilters.roomId && { roomId: messageFilters.roomId })
      })

      const response = await api.get(`/admin/chat/messages?${params}`)
      setMessages(response.data.messages)
      setMessagesTotalPages(response.data.pagination.pages)
    } catch (error: any) {
      console.error("Failed to fetch messages:", error)
      setError(error.response?.data?.error || "Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return

    try {
      await api.delete(`/admin/chat/rooms/${selectedRoom.id}`)
      setShowDeleteRoom(false)
      setSelectedRoom(null)
      await fetchRooms()
    } catch (error: any) {
      console.error("Failed to delete room:", error)
      setError(error.response?.data?.error || "Failed to delete room")
    }
  }

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return

    try {
      await api.delete(`/admin/chat/messages/${selectedMessage.id}`)
      setShowDeleteMessage(false)
      setSelectedMessage(null)
      await fetchMessages()
    } catch (error: any) {
      console.error("Failed to delete message:", error)
      setError(error.response?.data?.error || "Failed to delete message")
    }
  }

  const handleRestrictUser = async () => {
    if (!selectedRoom || !restrictUserId || !restrictReason) return

    try {
      await api.post(`/admin/chat/rooms/${selectedRoom.id}/restrict/${restrictUserId}`, {
        reason: restrictReason,
        duration: parseInt(restrictDuration),
        permanent: isPermanentRestriction
      })
      setShowRestrictUser(false)
      setSelectedRoom(null)
      setRestrictUserId("")
      setRestrictReason("")
      setRestrictDuration("24")
      setIsPermanentRestriction(false)
    } catch (error: any) {
      console.error("Failed to restrict user:", error)
      setError(error.response?.data?.error || "Failed to restrict user")
    }
  }

  const getAtmosphereColor = (atmosphere: string) => {
    switch (atmosphere) {
      case "romantic": return "bg-pink-100 text-pink-800"
      case "intimate": return "bg-purple-100 text-purple-800"
      case "friendly": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getAtmosphereIcon = (atmosphere: string) => {
    switch (atmosphere) {
      case "romantic": return <Heart className="h-4 w-4" />
      case "intimate": return <Crown className="h-4 w-4" />
      case "friendly": return <Smile className="h-4 w-4" />
      default: return <MessageCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "REJECTED": return "bg-red-100 text-red-800"
      case "FLAGGED": return "bg-orange-100 text-orange-800"
      case "HIDDEN": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
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
            <Skeleton key={i} className="h-16" />
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
        <Button onClick={() => {
          if (activeTab === "rooms") fetchRooms()
          else fetchMessages()
        }} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          再試行
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              チャット管理
            </h1>
            <p className="text-gray-600 mt-2">
              チャットルーム・メッセージの管理とモデレーション
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => {
              if (activeTab === "rooms") fetchRooms()
              else fetchMessages()
            }} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              更新
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総ルーム数</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">プライベートルーム</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {rooms.filter(r => r.isPrivate).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総メッセージ</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms.reduce((sum, room) => sum + room._count.messages, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総参加者</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms.reduce((sum, room) => sum + room._count.members, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rooms">チャットルーム</TabsTrigger>
          <TabsTrigger value="messages">メッセージ</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="space-y-6">
          {/* Room Filters */}
          <Card>
            <CardHeader>
              <CardTitle>フィルター</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="room-search">検索</Label>
                  <Input
                    id="room-search"
                    placeholder="ルーム名で検索"
                    value={roomFilters.search}
                    onChange={(e) => setRoomFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="atmosphere">雰囲気</Label>
                  <Select value={roomFilters.atmosphere || "all"} onValueChange={(value) => setRoomFilters(prev => ({ ...prev, atmosphere: value === "all" ? "" : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="romantic">ロマンチック</SelectItem>
                      <SelectItem value="intimate">親密</SelectItem>
                      <SelectItem value="friendly">フレンドリー</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="privacy">プライバシー</Label>
                  <Select value={roomFilters.isPrivate || "all"} onValueChange={(value) => setRoomFilters(prev => ({ ...prev, isPrivate: value === "all" ? "" : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="true">プライベート</SelectItem>
                      <SelectItem value="false">パブリック</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rooms Table */}
          <Card>
            <CardHeader>
              <CardTitle>チャットルーム一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ルーム名</TableHead>
                      <TableHead>作成者</TableHead>
                      <TableHead>雰囲気</TableHead>
                      <TableHead>設定</TableHead>
                      <TableHead>統計</TableHead>
                      <TableHead>作成日</TableHead>
                      <TableHead>アクション</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium">{room.name}</div>
                            <div className="text-sm text-gray-500 truncate">
                              {room.description || "説明なし"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium">{room.creator.nickname}</div>
                              <div className="text-sm text-gray-500">{room.creator.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getAtmosphereColor(room.atmosphere)}>
                            {getAtmosphereIcon(room.atmosphere)}
                            <span className="ml-1 capitalize">{room.atmosphere}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {room.isPrivate ? (
                              <Badge variant="secondary">
                                <Lock className="h-3 w-3 mr-1" />
                                プライベート
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <Globe className="h-3 w-3 mr-1" />
                                パブリック
                              </Badge>
                            )}
                            <Badge variant="outline">
                              <UserPlus className="h-3 w-3 mr-1" />
                              最大{room.maxMembers}人
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>{room._count.members}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="h-4 w-4 text-gray-400" />
                              <span>{room._count.messages}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{formatDate(room.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedRoom(room)
                                setShowRestrictUser(true)
                              }}>
                                <Ban className="h-4 w-4 mr-2" />
                                ユーザー制限
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedRoom(room)
                                setShowDeleteRoom(true)
                              }} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                ルーム削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-gray-500">
                  ページ {roomsCurrentPage} / {roomsTotalPages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRoomsCurrentPage(Math.max(1, roomsCurrentPage - 1))}
                    disabled={roomsCurrentPage === 1}
                  >
                    前へ
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRoomsCurrentPage(Math.min(roomsTotalPages, roomsCurrentPage + 1))}
                    disabled={roomsCurrentPage === roomsTotalPages}
                  >
                    次へ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          {/* Message Filters */}
          <Card>
            <CardHeader>
              <CardTitle>フィルター</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="message-search">検索</Label>
                  <Input
                    id="message-search"
                    placeholder="メッセージ内容で検索"
                    value={messageFilters.search}
                    onChange={(e) => setMessageFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="message-status">ステータス</Label>
                  <Select value={messageFilters.status || "all"} onValueChange={(value) => setMessageFilters(prev => ({ ...prev, status: value === "all" ? "" : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="PENDING">承認待ち</SelectItem>
                      <SelectItem value="APPROVED">承認済み</SelectItem>
                      <SelectItem value="REJECTED">拒否済み</SelectItem>
                      <SelectItem value="FLAGGED">フラグ付き</SelectItem>
                      <SelectItem value="HIDDEN">非表示</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message-room">ルーム</Label>
                  <Select value={messageFilters.roomId || "all"} onValueChange={(value) => setMessageFilters(prev => ({ ...prev, roomId: value === "all" ? "" : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      {rooms.map(room => (
                        <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages Table */}
          <Card>
            <CardHeader>
              <CardTitle>メッセージ一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>メッセージ</TableHead>
                      <TableHead>送信者</TableHead>
                      <TableHead>ルーム</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>送信日</TableHead>
                      <TableHead>アクション</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="text-sm whitespace-pre-wrap break-words">
                              {message.content.length > 100 
                                ? `${message.content.substring(0, 100)}...` 
                                : message.content}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {message.type}
                              </Badge>
                              {message.isBlocked && (
                                <Badge variant="destructive" className="text-xs">
                                  ブロック済み
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium">{message.user.nickname}</div>
                              <div className="text-sm text-gray-500">{message.user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <MessageCircle className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium">{message.room.name}</div>
                              <div className="text-sm text-gray-500">ID: {message.room.id.substring(0, 8)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(message.status)}>
                            {message.status}
                          </Badge>
                          {message.moderationReason && (
                            <div className="text-xs text-gray-500 mt-1">
                              理由: {message.moderationReason}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{formatDate(message.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedMessage(message)
                                setShowDeleteMessage(true)
                              }} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-gray-500">
                  ページ {messagesCurrentPage} / {messagesTotalPages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMessagesCurrentPage(Math.max(1, messagesCurrentPage - 1))}
                    disabled={messagesCurrentPage === 1}
                  >
                    前へ
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMessagesCurrentPage(Math.min(messagesTotalPages, messagesCurrentPage + 1))}
                    disabled={messagesCurrentPage === messagesTotalPages}
                  >
                    次へ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Room Dialog */}
      <Dialog open={showDeleteRoom} onOpenChange={setShowDeleteRoom}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>チャットルームを削除</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>このチャットルームを削除してもよろしいですか？すべてのメッセージも削除されます。この操作は取り消せません。</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteRoom(false)}>
                キャンセル
              </Button>
              <Button variant="destructive" onClick={handleDeleteRoom}>
                削除
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Message Dialog */}
      <Dialog open={showDeleteMessage} onOpenChange={setShowDeleteMessage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>メッセージを削除</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>このメッセージを削除してもよろしいですか？この操作は取り消せません。</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteMessage(false)}>
                キャンセル
              </Button>
              <Button variant="destructive" onClick={handleDeleteMessage}>
                削除
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restrict User Dialog */}
      <Dialog open={showRestrictUser} onOpenChange={setShowRestrictUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ユーザーをチャットルームから制限</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="restrict-user-id">ユーザーID</Label>
              <Input
                id="restrict-user-id"
                placeholder="制限するユーザーのID"
                value={restrictUserId}
                onChange={(e) => setRestrictUserId(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="restrict-reason">理由</Label>
              <Textarea
                id="restrict-reason"
                placeholder="制限理由を入力してください"
                value={restrictReason}
                onChange={(e) => setRestrictReason(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="restrict-duration">期間（時間）</Label>
              <Input
                id="restrict-duration"
                type="number"
                min="1"
                value={restrictDuration}
                onChange={(e) => setRestrictDuration(e.target.value)}
                disabled={isPermanentRestriction}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="permanent-restriction"
                checked={isPermanentRestriction}
                onCheckedChange={setIsPermanentRestriction}
              />
              <Label htmlFor="permanent-restriction">永続的に制限</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowRestrictUser(false)}>
                キャンセル
              </Button>
              <Button onClick={handleRestrictUser}>
                制限を適用
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 