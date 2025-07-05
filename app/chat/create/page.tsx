"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, Users, Lock, Globe, Heart, Sparkles, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import api from "@/api/axios"

export default function CreateChatRoomPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  
  const [roomName, setRoomName] = useState("")
  const [roomDescription, setRoomDescription] = useState("")
  const [atmosphere, setAtmosphere] = useState("friendly")
  const [isPrivate, setIsPrivate] = useState(false)
  const [maxMembers, setMaxMembers] = useState("50")
  const [creating, setCreating] = useState(false)

  const atmosphereOptions = [
    { value: "romantic", label: "ロマンチック", color: "bg-pink-100 text-pink-800", emoji: "💕" },
    { value: "intimate", label: "親密", color: "bg-purple-100 text-purple-800", emoji: "🌹" },
    { value: "friendly", label: "フレンドリー", color: "bg-blue-100 text-blue-800", emoji: "😊" },
    { value: "casual", label: "カジュアル", color: "bg-green-100 text-green-800", emoji: "🎈" },
  ]

  const maxMemberOptions = [
    { value: "10", label: "10人 (小規模)" },
    { value: "25", label: "25人 (中規模)" },
    { value: "50", label: "50人 (大規模)" },
    { value: "100", label: "100人 (超大規模)" },
  ]

  const createRoom = async () => {
    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "チャットルームを作成するには、ログインが必要です。",
        variant: "destructive",
      })
      return
    }

    if (!roomName.trim()) {
      toast({
        title: "入力エラー",
        description: "ルーム名を入力してください。",
        variant: "destructive",
      })
      return
    }

    setCreating(true)

    try {
      const response = await api.post("/chat/rooms", {
        name: roomName.trim(),
        description: roomDescription.trim() || "新しく作成されたチャットルーム",
        atmosphere: atmosphere,
        isPrivate: isPrivate,
        maxMembers: parseInt(maxMembers),
      })

      const newRoom = response.data.room

      toast({
        title: "チャットルーム作成完了！",
        description: `「${newRoom.name}」が作成されました。`,
      })

      // Redirect to the created room
      router.push(`/chat/room/${newRoom.id}`)

    } catch (error: any) {
      console.error("Failed to create room:", error)
      
      let errorMessage = "チャットルームの作成に失敗しました"
      if (error.response?.status === 400) {
        errorMessage = "入力内容に問題があります。もう一度確認してください。"
      } else if (error.response?.status === 401) {
        errorMessage = "認証が必要です。ログインしてください。"
      } else if (error.response?.status >= 500) {
        errorMessage = "サーバーエラーが発生しました。しばらくしてから再試行してください。"
      }
      
      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const getAtmosphereOption = (value: string) => {
    return atmosphereOptions.find(option => option.value === value) || atmosphereOptions[2]
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">ログインが必要です</h3>
            <p className="text-gray-500 mb-4">
              チャットルームを作成するには、ログインが必要です。
            </p>
            <Link href="/">
              <Button>ログイン・登録</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/chat" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4" />
          チャット一覧に戻る
        </Link>
        <h1 className="text-3xl font-bold mb-2">新しいチャットルーム作成</h1>
        <p className="text-gray-600">
          新しいチャットルームを作成して、友達や他のユーザーと交流しましょう。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            ルーム詳細設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Room Name */}
          <div>
            <label htmlFor="roomName" className="text-sm font-medium mb-2 block">
              ルーム名 <span className="text-red-500">*</span>
            </label>
            <Input
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="例: 楽しいチャットルーム"
              maxLength={50}
            />
            <div className="text-xs text-gray-500 mt-1">
              {roomName.length}/50文字
            </div>
          </div>

          {/* Room Description */}
          <div>
            <label htmlFor="roomDescription" className="text-sm font-medium mb-2 block">
              ルーム説明
            </label>
            <Textarea
              id="roomDescription"
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
              placeholder="このチャットルームについて簡単に説明してください..."
              maxLength={200}
              className="min-h-[80px]"
            />
            <div className="text-xs text-gray-500 mt-1">
              {roomDescription.length}/200文字
            </div>
          </div>

          {/* Atmosphere */}
          <div>
            <label className="text-sm font-medium mb-2 block">雰囲気</label>
            <Select value={atmosphere} onValueChange={setAtmosphere}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {atmosphereOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.emoji}</span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-2">
              <Badge className={getAtmosphereOption(atmosphere).color}>
                {getAtmosphereOption(atmosphere).emoji} {getAtmosphereOption(atmosphere).label}
              </Badge>
            </div>
          </div>

          {/* Max Members */}
          <div>
            <label className="text-sm font-medium mb-2 block">最大参加人数</label>
            <Select value={maxMembers} onValueChange={setMaxMembers}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {maxMemberOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Privacy Settings */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPrivate"
                checked={isPrivate}
                onCheckedChange={(checked) => setIsPrivate(checked === true)}
              />
              <label htmlFor="isPrivate" className="text-sm font-medium cursor-pointer">
                プライベートルーム
              </label>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {isPrivate ? (
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>招待URLを知っている人のみが参加できます</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>すべてのユーザーが参加できます</span>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-2">プレビュー</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="font-medium">{roomName || "ルーム名"}</span>
                <Badge className={getAtmosphereOption(atmosphere).color}>
                  {getAtmosphereOption(atmosphere).emoji}
                </Badge>
                {isPrivate && (
                  <Badge variant="secondary">
                    <Lock className="h-3 w-3 mr-1" />
                    プライベート
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {roomDescription || "ルームの説明"}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>0/{maxMembers}</span>
                </div>
                <div>作成者: {user.nickname}</div>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <Button
            onClick={createRoom}
            disabled={creating || !roomName.trim()}
            className="w-full"
            size="lg"
          >
            {creating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>作成中...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>チャットルームを作成する</span>
              </div>
            )}
          </Button>

          <div className="text-xs text-gray-500 text-center">
            作成後、すぐにルームに参加できます。招待URLを友達に共有して一緒にチャットを楽しみましょう！
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 