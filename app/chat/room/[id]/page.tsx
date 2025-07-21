"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Users, Send, Wifi, WifiOff, Heart, Copy, UserPlus, Sparkles } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import api from "@/api/axios"
import socketService from "@/lib/socket"
import { EmojiText } from "@/components/modern-icon"
import { Skeleton } from "@/components/ui/skeleton"

interface Message {
  id: string
  content: string
  type: "message" | "join" | "leave"
  user: {
    id: string
    nickname: string
  }
  createdAt: string
}

interface ChatRoom {
  id: string
  name: string
  description: string
  atmosphere: string
  isPrivate: boolean
  maxMembers: number
  creator: {
    id: string
    nickname: string
  }
  members: Array<{
    user: {
      id: string
      nickname: string
      avatar: string
    }
  }>
  messages: Message[]
}

export default function ChatRoomPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [room, setRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [onlineUsers, setOnlineUsers] = useState<Array<{ id: string; nickname: string; avatar: string }>>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchRoomData = async () => {
    try {
      const response = await api.get(`/chat/rooms/${params.id}`)
      const roomData = response.data.room
      setRoom(roomData)
      setMessages(roomData.messages || [])
      setOnlineUsers(roomData.members?.map((m: any) => m.user) || [])
    } catch (error: any) {
      console.error("Failed to fetch room data:", error)
      toast({
        title: "エラー",
        description: "チャットルームの読み込みに失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const joinRoom = async () => {
    try {
      await api.post(`/chat/rooms/${params.id}/join`)
      socketService.joinChatRoom(params.id as string)
    } catch (error: any) {
      console.error("Failed to join room:", error)
      toast({
        title: "エラー",
        description: "ルームへの参加に失敗しました",
        variant: "destructive",
      })
    }
  }

  const leaveRoom = async () => {
    if (!user || !room) {
      toast({
        title: "エラー",
        description: "ルーム情報が取得できません",
        variant: "destructive",
      })
      return
    }

    try {
      await api.post(`/chat/rooms/${params.id}/leave`)
      socketService.leaveChatRoom(params.id as string)
      toast({
        title: "退出完了",
        description: "ルームから退出しました",
      })
    } catch (error: any) {
      console.error("Failed to leave room:", error)
      toast({
        title: "エラー",
        description: error.response?.data?.error || "ルームからの退出に失敗しました",
        variant: "destructive",
      })
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      socketService.sendMessage(params.id as string, newMessage)
      setNewMessage("")
    } catch (error: any) {
      console.error("Failed to send message:", error)
      toast({
        title: "エラー",
        description: "メッセージの送信に失敗しました",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchRoomData()
      joinRoom()
    }
  }, [user, params.id])

  useEffect(() => {
    if (user && room) {
      setIsConnected(socketService.isConnectedToServer())

      const handleNewMessage = (message: Message) => {
        setMessages(prevMessages => [...prevMessages, message])
      }

      const handleUserJoined = (data: { user: any; timestamp: Date }) => {
        setOnlineUsers(prevUsers => {
          const exists = prevUsers.some(u => u.id === data.user.id)
          if (!exists) {
            return [...prevUsers, data.user]
          }
          return prevUsers
        })
      }

      const handleUserLeft = (data: { user: any; timestamp: Date }) => {
        setOnlineUsers(prevUsers => 
          prevUsers.filter(u => u.id !== data.user.id)
        )
      }

      socketService.onNewMessage(handleNewMessage)
      socketService.onUserJoined(handleUserJoined)
      socketService.onUserLeft(handleUserLeft)

      const checkConnection = () => {
        setIsConnected(socketService.isConnectedToServer())
      }
      const connectionInterval = setInterval(checkConnection, 5000)

      return () => {
        socketService.offNewMessage(handleNewMessage)
        socketService.offUserJoined(handleUserJoined)
        socketService.offUserLeft(handleUserLeft)
        clearInterval(connectionInterval)
        leaveRoom()
      }
    }
  }, [user, room])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
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
        return (
          <EmojiText 
            text="💕 ロマンチック" 
            iconSize={16} 
            className="flex items-center" 
          />
        )
      case "intimate":
        return (
          <EmojiText 
            text="🌹 親密" 
            iconSize={16} 
            className="flex items-center" 
          />
        )
      case "friendly":
        return (
          <EmojiText 
            text="😊 フレンドリー" 
            iconSize={16} 
            className="flex items-center" 
          />
        )
      default:
        return (
          <EmojiText 
            text="💬 一般" 
            iconSize={16} 
            className="flex items-center" 
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-10 w-24" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Area Skeleton */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex space-x-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-6 w-full max-w-xs" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <Skeleton className="h-2 w-2 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">チャットルームが見つかりませんでした。</p>
          <Link href="/chat">
            <Button variant="outline" className="mt-4">
              チャット一覧に戻る
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-full w-1/2 mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="flex flex-col lg:flex-row gap-8 h-full">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href="/chat">
                <Button variant="ghost" size="sm" className="text-pink-600">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  戻る
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{room.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={`text-xs ${getAtmosphereColor(room.atmosphere)}`}>
                    {getAtmosphereLabel(room.atmosphere)}
                  </Badge>
                  {isConnected ? (
                    <div className="flex items-center text-green-600">
                      <Wifi className="w-3 h-3 mr-1" />
                      <span className="text-xs">リアルタイム</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <WifiOff className="w-3 h-3 mr-1" />
                      <span className="text-xs">接続なし</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <Card className="flex-1 flex flex-col border-none">
            <CardContent className="flex-1 overflow-hidden p-4">
              <div className="h-full overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === "message" ? "flex-col" : "justify-center"}`}>
                    {message.type === "message" ? (
                      <div className={`max-w-xs lg:max-w-md ${message.user.id === user?.id ? "self-end" : "self-start"}`}>
                        <div className={`rounded-lg px-4 py-2 ${
                          message.user.id === user?.id 
                            ? "bg-pink-600 text-white" 
                            : "bg-gray-100 text-gray-900"
                        }`}>
                          <p className="text-sm font-medium mb-1">{message.user.nickname}</p>
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.user.id === user?.id ? "text-pink-100" : "text-gray-500"
                          }`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-block">
                          {message.content}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
          </Card>

          {/* Message Input */}
          <div className="mt-4 flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="メッセージを入力..."
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1"
              disabled={sending}
            />
            <Button 
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-80 flex flex-col space-y-4 h-[calc(100vh-200px)]">
          {/* Room Info */}
          <Card className="flex-shrink-0">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900">ルーム情報</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-pink-600 mb-2 line-clamp-3 overflow-hidden text-ellipsis">{room.description}</p>
              <p className="text-xs text-gray-500">作成者: {room.creator.nickname}</p>
            </CardContent>
          </Card>

          {/* Online Users */}
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-lg flex items-center">
                <Users className="w-5 h-5 mr-2" />
                オンライン ({onlineUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {onlineUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src={user.avatar ? user.avatar : "/images/avatar/default.png"} />
                        <AvatarFallback>{user.nickname.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-900">{user.nickname}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
