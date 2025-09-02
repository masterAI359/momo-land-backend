"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, MessageCircle, Clock, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AffiliateBanner from "@/components/affiliate-banner"
import { useAuth } from "@/lib/auth"
import LoginModal from "@/components/login-modal"
<<<<<<< HEAD
=======
import api from "@/api/axios"
import socketService from "@/lib/socket"
import Link from "next/link"
import { EmojiText } from "@/components/modern-icon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
    avatar: string
  }
  createdAt: string
}
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4

export default function GroupChatPage() {
  const [newRoomName, setNewRoomName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { user } = useAuth()

<<<<<<< HEAD
  // Sample chat rooms data
  const [chatRooms, setChatRooms] = useState([
    {
      id: "room-1",
      name: "初心者向け雑談ルーム",
      description: "ライブチャット初心者の方向けの雑談ルームです",
      participants: 12,
      lastActivity: "5分前",
      isPrivate: false,
      atmosphere: "friendly",
      creator: "ユーザー1",
    },
    {
      id: "room-2",
      name: "おすすめサイト情報交換",
      description: "おすすめのライブチャットサイトについて情報交換しましょう",
      participants: 8,
      lastActivity: "15分前",
      isPrivate: false,
      atmosphere: "romantic",
      creator: "ユーザー2",
    },
    {
      id: "room-3",
      name: "プライベートルーム",
      description: "招待制のプライベートチャットルーム",
      participants: 3,
      lastActivity: "1時間前",
      isPrivate: true,
      atmosphere: "intimate",
      creator: "ユーザー3",
    },
  ])
=======
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

  const fetchChatRooms = async () => {
    try {
      setLoading(true)
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
      setLoading(false)
    }
  }
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4

  const createRoom = async () => {
    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "チャットルームを作成するには、ユーザー登録・ログインが必要です。",
        variant: "destructive",
      })
      setShowLoginModal(true)
      return
    }
    if (!newRoomName.trim()) return

    setIsCreating(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newRoom = {
      id: `room-${Date.now()}`,
      name: newRoomName,
      description: "新しく作成されたチャットルーム",
      participants: 1,
      lastActivity: "今",
      isPrivate: false,
      atmosphere: "romantic",
      creator: user.nickname,
    }

    setChatRooms([newRoom, ...chatRooms])
    setNewRoomName("")
    setIsCreating(false)

    toast({
      title: "チャットルームを作成しました",
      description: `「${newRoom.name}」が作成されました。招待URLをコピーして友達を招待しましょう！`,
    })
  }

<<<<<<< HEAD
=======
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

      return () => {
        socketService.offRoomUpdated(handleRoomUpdated)
        socketService.offRoomCreated(handleNewRoom)
        clearInterval(connectionInterval)
      }
    }
  }, [user])

>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
  const handleJoinRoom = (roomId: string) => {
    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "チャットルームに参加するには、ユーザー登録・ログインが必要です。",
        variant: "destructive",
        duration: 3000,
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
      variant: "success",
      duration: 3000,
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
        return <EmojiText text="💕 ロマンチック" iconSize={16} className="flex items-center" />
      case "intimate":
        return <EmojiText text="🌹 親密" iconSize={16} className="flex items-center" />
      case "friendly":
        return <EmojiText text="😊 フレンドリー" iconSize={16} className="flex items-center" />
      default:
        return <EmojiText text="💬 一般" iconSize={16} className="flex items-center" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">グループチャット</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            ライブチャット愛好者同士でリアルタイムに交流できるグループチャット機能です。
            既存のルームに参加するか、新しいルームを作成して友達を招待しましょう。
          </p>
        </div>

        <AffiliateBanner size="large" position="content" />

        {/* Create Room Section */}
        <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-pink-800">
              <Plus className="w-5 h-5" />
              <span>新しいチャットルームを作成</span>
            </CardTitle>
            <CardDescription className="text-pink-600">
              あなた専用のチャットルームを作成して、友達を招待しましょう
              {!user && " (ログインが必要です)"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="ルーム名を入力してください"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="flex-1 bg-white border-pink-200 focus:border-pink-400"
                onKeyPress={(e) => e.key === "Enter" && createRoom()}
                disabled={!user}
              />
              <Button
                onClick={createRoom}
                disabled={!newRoomName.trim() || isCreating}
                className="bg-pink-600 hover:bg-pink-700"
              >
                {isCreating ? "作成中..." : "ルーム作成"}
              </Button>
            </div>
            <p className="text-sm text-pink-600">作成後に招待URLが生成されます。URLを共有して友達を招待できます。</p>
          </CardContent>
        </Card>

        {/* Chat Rooms List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">参加可能なチャットルーム</h2>

<<<<<<< HEAD
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chatRooms.map((room) => (
              <Card
                key={room.id}
                className="hover:shadow-lg transition-all duration-300 border-2 hover:border-pink-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 text-gray-900">{room.name}</CardTitle>
                      <Badge className={`text-xs ${getAtmosphereColor(room.atmosphere)}`}>
                        {getAtmosphereLabel(room.atmosphere)}
                      </Badge>
=======
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">チャットルームを読み込み中...</p>
            </div>
          ) : chatRooms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">まだチャットルームがありません。</p>
              <p className="text-gray-600">最初のルームを作成してみましょう！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chatRooms.map((room) => (
                <Card
                  key={room.id}
                  className="hover:shadow-lg transition-all duration-300 border-2 hover:border-pink-200 flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between w-full">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 text-gray-900">{room.name}</CardTitle>
                        <div className="w-full flex justify-end items-center space-x-2">
                          <Badge className={`text-xs ${getAtmosphereColor(room.atmosphere)}`}>
                            {getAtmosphereLabel(room.atmosphere)}
                          </Badge>
                        </div>
                      </div>
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
                    </div>
                    {room.isPrivate && (
                      <Badge variant="secondary" className="w-full justify-center text-xs text-center">
                        🔒 プライベート
                      </Badge>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{room.description}</p>

<<<<<<< HEAD
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {room.participants}人
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {room.lastActivity}
                      </span>
=======
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {room.participantCount}人
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {room.lastActivity}
                        </span>
                      </div>
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
                    </div>

<<<<<<< HEAD
                  <div className="text-xs text-gray-400">作成者: {room.creator}</div>

                  <div className="flex space-x-2">
                    <Button className="flex-1 bg-pink-600 hover:bg-pink-700" onClick={() => handleJoinRoom(room.id)}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      参加する
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyInviteUrl(room.id, room.name)}
                      className="border-pink-200 text-pink-600 hover:bg-pink-50"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
=======
                    <div className="text-xs text-gray-400 flex justify-between items-center">作成者:
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarImage src={room.creator.avatar} />
                          <AvatarFallback>{room.creator.nickname.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {room.creator.nickname}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button className="flex-1 bg-pink-600 hover:bg-pink-700" onClick={() => handleJoinRoom(room.id)}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        参加する
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyInviteUrl(room.id, room.name)}
                        className="border-pink-200 text-pink-600 hover:bg-pink-50"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
        </div>

        <AffiliateBanner size="medium" position="content" />

        {/* Instructions */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800">
              <EmojiText text="💕 ロマンチックなチャット体験" iconSize={20} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-purple-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">🌹 チャットルームの特徴</h4>
                <ul className="text-sm space-y-1">
                  <li>• リアルタイムメッセージング</li>
                  <li>• ロマンチックな雰囲気のデザイン</li>
                  <li>• プライベートルーム作成可能</li>
                  <li>• 招待URL機能</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">💖 利用のマナー</h4>
                <ul className="text-sm space-y-1">
                  <li>• 相手を尊重した会話を心がけましょう</li>
                  <li>• 不適切な内容は控えましょう</li>
                  <li>• プライバシーを守りましょう</li>
                  <li>• 楽しい雰囲気作りにご協力ください</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  )
}
