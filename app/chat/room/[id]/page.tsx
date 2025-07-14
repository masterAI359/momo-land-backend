"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Send, Heart, ArrowLeft, Copy, UserPlus, Sparkles } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

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
  isOnline: boolean
  joinedAt: Date
}

export default function ChatRoomPage({ params }: { params: { id: string } }) {
  const roomId = params.id
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState("ゲストユーザー")
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

        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          user: "ユーザー" + (Math.floor(Math.random() * 3) + 1),
          content: randomResponse,
          timestamp: new Date(),
          type: "message",
        }

        setMessages((prev) => [...prev, responseMessage])
      },
      2000 + Math.random() * 1000,
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px] max-h-[80vh]">
        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col">
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
