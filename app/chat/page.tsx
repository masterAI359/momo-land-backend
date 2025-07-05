"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Plus, MessageCircle, Clock, Copy, Wifi, WifiOff, Heart, Lock, Globe, Bell, Megaphone, Activity, RefreshCw, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AffiliateBanner from "@/components/affiliate-banner"
import { useAuth } from "@/lib/auth"
import LoginModal from "@/components/login-modal"
import api from "@/api/axios"
import socketService from "@/lib/socket"
import Link from "next/link"

interface ChatRoom {
  id: string
  name: string
  description: string
  atmosphere: string
  isPrivate: boolean
  maxMembers: number
  participantCount: number
  onlineCount: number
  messageCount: number
  lastActivity: string
  creator: {
    id: string
    nickname: string
  }
  createdAt: string
}

interface SystemNotification {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
}

export default function GroupChatPage() {
  const [loading, setLoading] = useState(true)
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const { toast } = useToast()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [userCount, setUserCount] = useState(0)
  const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return "1時間未満前"
    } else if (diffInHours < 24) {
      return `${diffInHours}時間前`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}日前`
    }
  }

  const fetchChatRooms = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const response = await api.get("/chat/rooms")
      const rooms = response.data.rooms.map((room: any) => ({
        ...room,
        lastActivity: formatDate(room.lastActivity),
      }))
      setChatRooms(rooms)
    } catch (error: any) {
      console.error("Failed to fetch chat rooms:", error)
      toast({
        title: "エラー",
        description: "チャットルームの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      if (showLoading) setLoading(false)
      setRefreshing(false)
    }
  }



  const refreshRooms = () => {
    setRefreshing(true)
    fetchChatRooms(false)
  }

  const dismissNotification = (id: string) => {
    setSystemNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return 'ℹ️'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-500 bg-green-50'
      case 'warning':
        return 'border-yellow-500 bg-yellow-50'
      case 'error':
        return 'border-red-500 bg-red-50'
      default:
        return 'border-blue-500 bg-blue-50'
    }
  }

  // Load chat rooms on mount
  useEffect(() => {
    fetchChatRooms()
  }, [])

  // Set up WebSocket connection when user is authenticated
  useEffect(() => {
    if (user) {
      console.log("🔗 Setting up WebSocket for chat rooms")
      setIsConnected(socketService.isConnectedToServer())

      const handleRoomUpdated = (room: ChatRoom) => {
        setChatRooms(prevRooms => 
          prevRooms.map(r => 
            r.id === room.id 
              ? { ...r, ...room, lastActivity: formatDate(room.lastActivity) }
              : r
          )
        )
      }

      const handleNewRoom = (room: ChatRoom) => {
        setChatRooms(prevRooms => [{
          ...room,
          lastActivity: formatDate(room.lastActivity)
        }, ...prevRooms])
      }

      socketService.onRoomUpdated(handleRoomUpdated)
      socketService.onRoomCreated(handleNewRoom)

      // Update connection status
      const checkConnection = () => {
        setIsConnected(socketService.isConnectedToServer())
      }
      const connectionInterval = setInterval(checkConnection, 5000)

      // Set up real-time event listeners
      const handleSystemAnnouncement = (announcement: any) => {
        const notification: SystemNotification = {
          id: Date.now().toString(),
          message: announcement.message,
          type: announcement.type || 'info',
          timestamp: new Date()
        }
        setSystemNotifications(prev => [notification, ...prev.slice(0, 4)]) // Keep only 5 notifications
        
        toast({
          title: "システムアナウンス",
          description: announcement.message,
          duration: 8000,
        })
      }

      const handleUserCountUpdate = (count: number) => {
        setUserCount(count)
      }

      socketService.onSystemAnnouncement(handleSystemAnnouncement)
      socketService.onUserCountUpdate(handleUserCountUpdate)

      return () => {
        socketService.offRoomUpdated(handleRoomUpdated)
        socketService.offRoomCreated(handleNewRoom)
        socketService.offSystemAnnouncement(handleSystemAnnouncement)
        socketService.offUserCountUpdate(handleUserCountUpdate)
        clearInterval(connectionInterval)
      }
    }
  }, [user])

  const handleJoinRoom = (roomId: string) => {
    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "チャットルームに参加するには、ユーザー登録・ログインが必要です。",
        variant: "destructive",
      })
      setShowLoginModal(true)
      return
    }
    // Navigate to room if user is logged in
    window.location.href = `/chat/room/${roomId}`
  }

  const copyInviteUrl = (roomId: string, roomName: string) => {
    const inviteUrl = `${window.location.origin}/chat/room/${roomId}?invite=true`
    navigator.clipboard.writeText(inviteUrl)

    toast({
      title: "招待URLをコピーしました",
      description: `「${roomName}」の招待URLがクリップボードにコピーされました。`,
    })
  }

  const getAtmosphereColor = (atmosphere: string) => {
    switch (atmosphere) {
      case "romantic":
        return "bg-pink-100 text-pink-800 border-pink-200"
      case "intimate":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "friendly":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getAtmosphereLabel = (atmosphere: string) => {
    switch (atmosphere) {
      case "romantic":
        return "💕 ロマンチック"
      case "intimate":
        return "🌹 親密"
      case "friendly":
        return "😊 フレンドリー"
      default:
        return "💬 一般"
    }
  }

  const filteredRooms = chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p>チャットルームを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">チャットルーム</h1>
          <p className="text-gray-600">リアルタイムでコミュニケーションを楽しもう</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "リアルタイム接続中" : "接続なし"}
            </Badge>
          </div>
          
          {/* User Count */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-sm">{userCount} ユーザーオンライン</span>
          </div>
          
          <Link href="/chat/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              ルーム作成
            </Button>
          </Link>
        </div>
      </div>

      {/* System Notifications */}
      {systemNotifications.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Megaphone className="h-5 w-5" />
            <h2 className="text-lg font-semibold">システム通知</h2>
          </div>
          <div className="space-y-2">
            {systemNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border-l-4 ${getNotificationColor(notification.type)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{notification.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {notification.timestamp.toLocaleTimeString('ja-JP')}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissNotification(notification.id)}
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Refresh */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="チャットルームを検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={refreshRooms} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          更新
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{chatRooms.length}</div>
                <div className="text-sm text-gray-500">総ルーム数</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{userCount}</div>
                <div className="text-sm text-gray-500">オンライン</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{filteredRooms.length}</div>
                <div className="text-sm text-gray-500">検索結果</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{systemNotifications.length}</div>
                <div className="text-sm text-gray-500">新しい通知</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">チャットルームがありません</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? "検索条件に一致するルームがありません" : "まだチャットルームがありません"}
            </p>
            <Link href="/chat/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                最初のルームを作成
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <Link key={room.id} href={`/chat/room/${room.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{room.name}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getAtmosphereColor(room.atmosphere)}>
                          {getAtmosphereLabel(room.atmosphere)}
                        </Badge>
                        {room.isPrivate && (
                          <Badge variant="secondary">
                            <Lock className="h-3 w-3 mr-1" />
                            プライベート
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Heart className="h-5 w-5 text-gray-400" />
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {room.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {room.creator.nickname[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span>{room.creator.nickname}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{room.participantCount || 0}/{room.maxMembers}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{room.messageCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 text-center">
        <div className="flex justify-center gap-4">
          <Link href="/demo-realtime">
            <Button variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              リアルタイム機能のデモ
            </Button>
          </Link>
          <Link href="/admin-announcements">
            <Button variant="outline">
              <Megaphone className="h-4 w-4 mr-2" />
              システムアナウンス管理
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
