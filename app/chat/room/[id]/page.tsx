"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Users, Send, Wifi, WifiOff, Heart, Copy, UserPlus, Sparkles, MapPin, Phone, Video, Smile, Bell, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import api from "@/api/axios"
import socketService from "@/lib/socket"

interface Message {
  id: string
  content: string
  type: "message" | "join" | "leave"
  user: {
    id: string
    nickname: string
  }
  createdAt: string
  reactions?: Array<{
    emoji: string
    userId: string
    nickname: string
  }>
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
    }
  }>
  messages: Message[]
}

interface TypingUser {
  userId: string
  nickname: string
  roomId: string
}

interface Notification {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
}

export default function ChatRoomPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [room, setRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [onlineUsers, setOnlineUsers] = useState<Array<{ id: string; nickname: string }>>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [sharedLocations, setSharedLocations] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
    try {
      await api.post(`/chat/rooms/${params.id}/leave`)
      socketService.leaveChatRoom(params.id as string)
    } catch (error: any) {
      console.error("Failed to leave room:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      socketService.sendMessage(params.id as string, newMessage)
      setNewMessage("")
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      socketService.stopTypingIndicator(params.id as string)
      
      // Track activity
      socketService.reportUserActivity("message_sent", {
        roomId: params.id,
        messageLength: newMessage.length
      })
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

  const handleTyping = (value: string) => {
    setNewMessage(value)
    
    // Send typing indicator
    socketService.sendTypingIndicator(params.id as string)
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTypingIndicator(params.id as string)
    }, 2000)
  }

  const addReaction = (messageId: string, emoji: string) => {
    socketService.sendReaction(params.id as string, messageId, emoji)
  }

  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setUserLocation(location)
        socketService.shareLocation(params.id as string, location)
        toast({
          title: "位置情報を共有しました",
          description: "他のユーザーに位置情報が共有されました",
        })
      }, (error) => {
        toast({
          title: "エラー",
          description: "位置情報の取得に失敗しました",
          variant: "destructive",
        })
      })
    } else {
      toast({
        title: "エラー",
        description: "このブラウザは位置情報に対応していません",
        variant: "destructive",
      })
    }
  }

  const initiateCall = (type: 'voice' | 'video') => {
    socketService.initiateCall(params.id as string, type)
    toast({
      title: `${type === 'video' ? 'ビデオ' : '音声'}通話を開始`,
      description: "他のユーザーに通話の招待を送信しました",
    })
  }

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "リンクをコピーしました",
      description: "チャットルームのリンクをクリップボードにコピーしました",
    })
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
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
        
        toast({
          title: "ユーザーが参加しました",
          description: `${data.user.nickname}さんがチャットルームに参加しました`,
        })
      }

      const handleUserLeft = (data: { user: any; timestamp: Date }) => {
        setOnlineUsers(prevUsers => 
          prevUsers.filter(u => u.id !== data.user.id)
        )
        
        toast({
          title: "ユーザーが退出しました",
          description: `${data.user.nickname}さんがチャットルームから退出しました`,
        })
      }

      const handleTypingStart = (data: TypingUser) => {
        if (data.userId !== user.id) {
          setTypingUsers(prevUsers => {
            const exists = prevUsers.find(u => u.userId === data.userId)
            if (!exists) {
              return [...prevUsers, data]
            }
            return prevUsers
          })
        }
      }

      const handleTypingStop = (data: { userId: string; roomId: string }) => {
        setTypingUsers(prevUsers => prevUsers.filter(u => u.userId !== data.userId))
      }

      const handleReactionAdded = (data: { messageId: string; emoji: string; userId: string; nickname: string }) => {
        setMessages(prevMessages => 
          prevMessages.map(msg => {
            if (msg.id === data.messageId) {
              const reactions = msg.reactions || []
              const existingReaction = reactions.find(r => r.userId === data.userId && r.emoji === data.emoji)
              if (!existingReaction) {
                return {
                  ...msg,
                  reactions: [...reactions, {
                    emoji: data.emoji,
                    userId: data.userId,
                    nickname: data.nickname
                  }]
                }
              }
            }
            return msg
          })
        )
      }

      const handleNotification = (notification: any) => {
        setNotifications(prev => [...prev, {
          id: Date.now().toString(),
          ...notification
        }])
      }

      const handleSystemAnnouncement = (announcement: any) => {
        toast({
          title: "システムアナウンス",
          description: announcement.message,
          duration: 8000,
        })
      }

      const handleLocationShared = (data: { userId: string; nickname: string; location: any; timestamp: Date }) => {
        setSharedLocations(prev => [...prev, data])
        toast({
          title: "位置情報が共有されました",
          description: `${data.nickname}さんが位置情報を共有しました`,
        })
      }

      const handleCallInitiated = (data: { roomId: string; callType: string; initiator: any }) => {
        toast({
          title: `${data.callType === 'video' ? 'ビデオ' : '音声'}通話の招待`,
          description: `${data.initiator.nickname}さんから${data.callType === 'video' ? 'ビデオ' : '音声'}通話の招待が来ています`,
          duration: 10000,
        })
      }

      // Set up all event listeners
      socketService.onNewMessage(handleNewMessage)
      socketService.onUserJoined(handleUserJoined)
      socketService.onUserLeft(handleUserLeft)
      socketService.onTypingStart(handleTypingStart)
      socketService.onTypingStop(handleTypingStop)
      socketService.onReactionAdded(handleReactionAdded)
      socketService.onNotification(handleNotification)
      socketService.onSystemAnnouncement(handleSystemAnnouncement)
      socketService.onLocationShared(handleLocationShared)
      socketService.onCallInitiated(handleCallInitiated)

      const checkConnection = () => {
        setIsConnected(socketService.isConnectedToServer())
      }
      const connectionInterval = setInterval(checkConnection, 5000)

      return () => {
        socketService.offNewMessage(handleNewMessage)
        socketService.offUserJoined(handleUserJoined)
        socketService.offUserLeft(handleUserLeft)
        socketService.offTypingStart(handleTypingStart)
        socketService.offTypingStop(handleTypingStop)
        socketService.offReactionAdded(handleReactionAdded)
        socketService.offNotification(handleNotification)
        socketService.offSystemAnnouncement(handleSystemAnnouncement)
        socketService.offLocationShared(handleLocationShared)
        socketService.offCallInitiated(handleCallInitiated)
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
        return "ロマンチック"
      case "intimate":
        return "親密"
      case "friendly":
        return "フレンドリー"
      default:
        return "その他"
    }
  }

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

  if (!room) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">チャットルームが見つかりません</h2>
          <Link href="/chat">
            <Button>チャット一覧に戻る</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/chat">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              チャット一覧
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "接続中" : "切断中"}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{room.name}</h1>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getAtmosphereColor(room.atmosphere)}>
                {getAtmosphereLabel(room.atmosphere)}
              </Badge>
              {room.isPrivate && <Badge variant="secondary">プライベート</Badge>}
            </div>
            <p className="text-gray-600">{room.description}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={copyRoomLink} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              リンクをコピー
            </Button>
            <Button onClick={shareLocation} variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              位置情報を共有
            </Button>
            <Button onClick={() => initiateCall('voice')} variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              音声通話
            </Button>
            <Button onClick={() => initiateCall('video')} variant="outline" size="sm">
              <Video className="h-4 w-4 mr-2" />
              ビデオ通話
            </Button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mb-6">
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border-l-4 ${
                  notification.type === 'error' ? 'border-red-500 bg-red-50' :
                  notification.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  notification.type === 'success' ? 'border-green-500 bg-green-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <div className="text-sm">{notification.message}</div>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                チャット
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Messages */}
                <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback>
                          {message.user.nickname[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{message.user.nickname}</span>
                          <span className="text-xs text-gray-500">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                        <div className="text-sm bg-gray-50 rounded-lg p-2 mb-2">
                          {message.content}
                        </div>
                        
                        {/* Reactions */}
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {['❤️', '👍', '😂', '😮', '🎉'].map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => addReaction(message.id, emoji)}
                                className="text-sm hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                                title={`Add ${emoji} reaction`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                          
                          {/* Display reactions */}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="flex gap-1 ml-2">
                              {message.reactions.map((reaction, idx) => (
                                <div
                                  key={idx}
                                  className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
                                  title={`${reaction.nickname} reacted with ${reaction.emoji}`}
                                >
                                  {reaction.emoji}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Typing Indicators */}
                {typingUsers.length > 0 && (
                  <div className="text-sm text-gray-500 italic px-4">
                    {typingUsers.map(user => user.nickname).join(', ')} が入力中...
                  </div>
                )}

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    placeholder="メッセージを入力..."
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    disabled={sending}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={sending || !newMessage.trim()}
                    className="px-4"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Online Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                オンライン ({onlineUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {onlineUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {user.nickname[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.nickname}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Room Info */}
          <Card>
            <CardHeader>
              <CardTitle>ルーム情報</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">作成者:</span> {room.creator.nickname}
                </div>
                <div>
                  <span className="font-medium">最大人数:</span> {room.maxMembers}人
                </div>
                <div>
                  <span className="font-medium">雰囲気:</span> {getAtmosphereLabel(room.atmosphere)}
                </div>
                {room.isPrivate && (
                  <div>
                    <span className="font-medium">プライベートルーム</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shared Locations */}
          {sharedLocations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  共有された位置情報
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sharedLocations.map((location, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="font-medium">{location.nickname}</div>
                      <div className="text-gray-500 text-xs">
                        {location.location.lat.toFixed(4)}, {location.location.lng.toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Location */}
          {userLocation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  あなたの位置情報
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div className="text-gray-500">
                    {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
