"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
<<<<<<< HEAD
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Send, Heart, ArrowLeft, Copy, UserPlus, Sparkles } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
=======
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Users, Send, Wifi, WifiOff, Heart, Copy, UserPlus, Sparkles } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import api from "@/api/axios"
import socketService from "@/lib/socket"
import { EmojiText } from "@/components/modern-icon"
import { Skeleton } from "@/components/ui/skeleton"
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4

interface Message {
  id: string
  user: string
  content: string
  timestamp: Date
  type: "message" | "join" | "leave"
}

interface User {
  id: string
  name: string
<<<<<<< HEAD
  isOnline: boolean
  joinedAt: Date
=======
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
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
}

export default function ChatRoomPage({ params }: { params: { id: string } }) {
  const roomId = params.id
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
<<<<<<< HEAD
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState("ゲストユーザー")
=======
  const [onlineUsers, setOnlineUsers] = useState<Array<{ id: string; nickname: string; avatar: string }>>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Sample room data
  const roomData = {
    id: roomId,
    name:
      roomId === "room-1"
        ? "初心者向け雑談ルーム"
        : roomId === "room-2"
          ? "おすすめサイト情報交換"
          : "プライベートルーム",
    description: "ライブチャット愛好者のためのロマンチックなチャットルーム",
    atmosphere: "romantic",
    participants: 5,
  }

  // Initialize chat room
  useEffect(() => {
    // Simulate connection
    setIsConnected(true)

    // Sample initial messages
    const initialMessages: Message[] = [
      {
        id: "1",
        user: "ユーザー1",
        content: "こんにちは！このルームへようこそ 💕",
        timestamp: new Date(Date.now() - 300000),
        type: "message",
      },
      {
        id: "2",
        user: "ユーザー2",
        content: "素敵な雰囲気のルームですね ✨",
        timestamp: new Date(Date.now() - 240000),
        type: "message",
      },
      {
        id: "3",
        user: "システム",
        content: `${currentUser}さんがルームに参加しました`,
        timestamp: new Date(),
        type: "join",
      },
    ]

    const initialUsers: User[] = [
      { id: "1", name: "ユーザー1", isOnline: true, joinedAt: new Date(Date.now() - 3600000) },
      { id: "2", name: "ユーザー2", isOnline: true, joinedAt: new Date(Date.now() - 1800000) },
      { id: "3", name: currentUser, isOnline: true, joinedAt: new Date() },
    ]

    setMessages(initialMessages)
    setUsers(initialUsers)
  }, [currentUser])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    if (!message.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      user: currentUser,
      content: message,
      timestamp: new Date(),
      type: "message",
    }

    setMessages((prev) => [...prev, newMessage])
    setMessage("")

<<<<<<< HEAD
    // Simulate response after 2-3 seconds
    setTimeout(
      () => {
        const responses = [
          "それは興味深いですね！ 💖",
          "同感です ✨",
          "詳しく教えてください 🌹",
          "素晴らしい体験談ですね 💕",
          "私も似たような経験があります 😊",
        ]
=======
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
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4

        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          user: "ユーザー" + (Math.floor(Math.random() * 3) + 1),
          content: randomResponse,
          timestamp: new Date(),
          type: "message",
        }

<<<<<<< HEAD
        setMessages((prev) => [...prev, responseMessage])
      },
      2000 + Math.random() * 1000,
=======
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
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
    )
  }

  const copyInviteUrl = () => {
    const inviteUrl = `${window.location.origin}/chat/room/${roomId}?invite=true`
    navigator.clipboard.writeText(inviteUrl)

    toast({
      title: "招待URLをコピーしました",
      description: "友達にURLを共有してルームに招待しましょう！",
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getMessageBubbleStyle = (user: string) => {
    if (user === currentUser) {
      return "bg-gradient-to-r from-pink-500 to-rose-500 text-white ml-auto"
    } else if (user === "システム") {
      return "bg-gray-100 text-gray-600 mx-auto text-center text-sm"
    } else {
      return "bg-white border border-pink-200 text-gray-800"
    }
  }

  return (
<<<<<<< HEAD
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px] max-h-[80vh]">
        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col">
=======
    <div className="max-w-full w-1/2 mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="flex flex-col lg:flex-row gap-8 h-full">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
          {/* Header */}
          <Card className="mb-4 bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Link href="/chat">
                    <Button variant="ghost" size="sm" className="text-pink-600">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      戻る
                    </Button>
                  </Link>
                  <div>
                    <CardTitle className="flex items-center space-x-2 text-pink-800">
                      <Sparkles className="w-5 h-5" />
                      <span>{roomData.name}</span>
                    </CardTitle>
                    <p className="text-sm text-pink-600 mt-1">{roomData.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge className="bg-pink-100 text-pink-800 border-pink-200">💕 ロマンチック</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyInviteUrl}
                    className="border-pink-200 text-pink-600 hover:bg-pink-50 bg-transparent"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    招待
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Messages */}
<<<<<<< HEAD
          <Card className="flex-1 flex flex-col">
            <CardContent className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-pink-25 to-rose-25 max-h-[400px]">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.user === currentUser ? "justify-end" : msg.type === "join" || msg.type === "leave" ? "justify-center" : "justify-start"}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${getMessageBubbleStyle(msg.user)}`}>
                      {msg.user !== currentUser && msg.type === "message" && (
                        <div className="text-xs text-pink-600 mb-1 font-medium">{msg.user}</div>
                      )}
                      <div className="break-words">{msg.content}</div>
                      <div className={`text-xs mt-1 ${msg.user === currentUser ? "text-pink-100" : "text-gray-500"}`}>
                        {formatTime(msg.timestamp)}
=======
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
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t bg-white sticky bottom-0">
              <div className="flex space-x-2">
                <Input
                  placeholder="メッセージを入力... 💕"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 border-pink-200 focus:border-pink-400"
                />
                <Button onClick={sendMessage} disabled={!message.trim()} className="bg-pink-600 hover:bg-pink-700">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
<<<<<<< HEAD
        <div className="space-y-4">
          {/* Online Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-pink-800">
                <Users className="w-5 h-5" />
                <span>参加者 ({users.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-pink-100 text-pink-600 text-xs">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{user.name}</span>
                      {user.isOnline && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                    </div>
                    <div className="text-xs text-gray-500">{formatTime(user.joinedAt)}に参加</div>
=======
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
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Room Info */}
          <Card className="bg-gradient-to-b from-pink-50 to-rose-50 border-pink-200">
            <CardHeader>
              <CardTitle className="text-pink-800 text-sm">💖 ルーム情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">雰囲気:</span>
                <Badge className="bg-pink-100 text-pink-800 border-pink-200 text-xs">💕 ロマンチック</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">接続状態:</span>
                <span className={`text-xs ${isConnected ? "text-green-600" : "text-red-600"}`}>
                  {isConnected ? "✅ 接続中" : "❌ 切断"}
                </span>
              </div>
              <div className="pt-2 border-t border-pink-200">
                <p className="text-xs text-pink-600">🌹 素敵な出会いと楽しい会話をお楽しみください</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-pink-800">クイックアクション</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-pink-600 border-pink-200 hover:bg-pink-50 bg-transparent"
                onClick={copyInviteUrl}
              >
                <Copy className="w-4 h-4 mr-2" />
                招待URLコピー
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-pink-600 border-pink-200 hover:bg-pink-50 bg-transparent"
              >
                <Heart className="w-4 h-4 mr-2" />
                ルームをお気に入り
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
