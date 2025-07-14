"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Search, Trash2, Users, MessageSquare, Settings, Ban } from "lucide-react"

interface ChatRoom {
  id: string
  name: string
  description: string
  atmosphere: string
  status: string
  requiredRole: string
  maxMembers: number
  createdAt: string
  creator: {
    id: string
    nickname: string
  }
  participantCount: number
  onlineCount: number
  messageCount: number
}

interface ChatMessage {
  id: string
  content: string
  type: string
  status: string
  createdAt: string
  user: {
    id: string
    nickname: string
  }
  room: {
    id: string
    name: string
  }
}

export default function ChatManagement() {
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [filteredRooms, setFilteredRooms] = useState<ChatRoom[]>([])
  const [filteredMessages, setFilteredMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"rooms" | "messages">("rooms")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (activeTab === "rooms") {
      filterRooms()
    } else {
      filterMessages()
    }
  }, [rooms, messages, searchTerm, statusFilter, activeTab])

  const fetchData = async () => {
    try {
      const [roomsRes, messagesRes] = await Promise.all([
        fetch("/api/admin/chat/rooms"),
        fetch("/api/admin/chat/messages"),
      ])

      if (roomsRes.ok && messagesRes.ok) {
        const roomsData = await roomsRes.json()
        const messagesData = await messagesRes.json()
        setRooms(roomsData.rooms)
        setMessages(messagesData.messages)
      }
    } catch (error) {
      console.error("Failed to fetch chat data:", error)
      toast({
        title: "エラー",
        description: "チャットデータの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterRooms = () => {
    let filtered = rooms

    if (searchTerm) {
      filtered = filtered.filter(
        (room) =>
          room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.creator.nickname.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((room) => room.status === statusFilter)
    }

    setFilteredRooms(filtered)
  }

  const filterMessages = () => {
    let filtered = messages

    if (searchTerm) {
      filtered = filtered.filter(
        (message) =>
          message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.user.nickname.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((message) => message.status === statusFilter)
    }

    setFilteredMessages(filtered)
  }

  const updateRoomStatus = async (roomId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/chat/rooms/${roomId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "ルームステータスを更新しました",
        })
        fetchData()
      }
    } catch (error) {
      console.error("Failed to update room status:", error)
      toast({
        title: "エラー",
        description: "ステータス更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  const updateRoomSettings = async (roomId: string, settings: any) => {
    try {
      const response = await fetch(`/api/admin/chat/rooms/${roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "ルーム設定を更新しました",
        })
        setEditDialogOpen(false)
        fetchData()
      }
    } catch (error) {
      console.error("Failed to update room settings:", error)
      toast({
        title: "エラー",
        description: "設定更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  const updateMessageStatus = async (messageId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/chat/messages/${messageId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "メッセージステータスを更新しました",
        })
        fetchData()
      }
    } catch (error) {
      console.error("Failed to update message status:", error)
      toast({
        title: "エラー",
        description: "ステータス更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  const deleteRoom = async (roomId: string) => {
    if (!confirm("本当にこのルームを削除しますか？")) return

    try {
      const response = await fetch(`/api/admin/chat/rooms/${roomId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "ルームを削除しました",
        })
        fetchData()
      }
    } catch (error) {
      console.error("Failed to delete room:", error)
      toast({
        title: "エラー",
        description: "ルーム削除に失敗しました",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVE: "default",
      SUSPENDED: "secondary",
      CLOSED: "destructive",
      SENT: "default",
      BLOCKED: "destructive",
      DELETED: "secondary",
    }
    return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status}</Badge>
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      USER: "outline",
      MODERATOR: "secondary",
      ADMIN: "default",
      SUPER_ADMIN: "destructive",
    }
    return <Badge variant={variants[role as keyof typeof variants] || "outline"}>{role}</Badge>
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">チャット管理</h1>
        <p className="text-gray-600 mt-2">チャットルームとメッセージの管理</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4">
        <Button variant={activeTab === "rooms" ? "default" : "outline"} onClick={() => setActiveTab("rooms")}>
          <Users className="h-4 w-4 mr-2" />
          ルーム管理
        </Button>
        <Button variant={activeTab === "messages" ? "default" : "outline"} onClick={() => setActiveTab("messages")}>
          <MessageSquare className="h-4 w-4 mr-2" />
          メッセージ管理
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>フィルター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={
                    activeTab === "rooms" ? "ルーム名または作成者で検索..." : "メッセージ内容またはユーザーで検索..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのステータス</SelectItem>
                {activeTab === "rooms" ? (
                  <>
                    <SelectItem value="ACTIVE">アクティブ</SelectItem>
                    <SelectItem value="SUSPENDED">停止中</SelectItem>
                    <SelectItem value="CLOSED">閉鎖</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="SENT">送信済み</SelectItem>
                    <SelectItem value="BLOCKED">ブロック済み</SelectItem>
                    <SelectItem value="DELETED">削除済み</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Tab */}
      {activeTab === "rooms" && (
        <Card>
          <CardHeader>
            <CardTitle>チャットルーム一覧 ({filteredRooms.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ルーム名</th>
                    <th className="text-left p-2">作成者</th>
                    <th className="text-left p-2">ステータス</th>
                    <th className="text-left p-2">必要権限</th>
                    <th className="text-left p-2">参加者</th>
                    <th className="text-left p-2">メッセージ数</th>
                    <th className="text-left p-2">作成日</th>
                    <th className="text-left p-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.map((room) => (
                    <tr key={room.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{room.name}</div>
                          <div className="text-sm text-gray-500">{room.description}</div>
                        </div>
                      </td>
                      <td className="p-2">{room.creator.nickname}</td>
                      <td className="p-2">{getStatusBadge(room.status)}</td>
                      <td className="p-2">{getRoleBadge(room.requiredRole)}</td>
                      <td className="p-2">
                        <div className="text-sm">
                          <div>
                            総数: {room.participantCount}/{room.maxMembers}
                          </div>
                          <div>オンライン: {room.onlineCount}</div>
                        </div>
                      </td>
                      <td className="p-2">{room.messageCount}</td>
                      <td className="p-2">{new Date(room.createdAt).toLocaleDateString("ja-JP")}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRoom(room)
                              setEditDialogOpen(true)
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Select onValueChange={(value) => updateRoomStatus(room.id, value)}>
                            <SelectTrigger className="w-20">
                              <Ban className="h-4 w-4" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ACTIVE">アクティブ</SelectItem>
                              <SelectItem value="SUSPENDED">停止</SelectItem>
                              <SelectItem value="CLOSED">閉鎖</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="destructive" onClick={() => deleteRoom(room.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <Card>
          <CardHeader>
            <CardTitle>メッセージ一覧 ({filteredMessages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">メッセージ</th>
                    <th className="text-left p-2">ユーザー</th>
                    <th className="text-left p-2">ルーム</th>
                    <th className="text-left p-2">タイプ</th>
                    <th className="text-left p-2">ステータス</th>
                    <th className="text-left p-2">送信日時</th>
                    <th className="text-left p-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map((message) => (
                    <tr key={message.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="max-w-xs truncate">{message.content}</div>
                      </td>
                      <td className="p-2">{message.user.nickname}</td>
                      <td className="p-2">{message.room.name}</td>
                      <td className="p-2">
                        <Badge variant="outline">{message.type}</Badge>
                      </td>
                      <td className="p-2">{getStatusBadge(message.status)}</td>
                      <td className="p-2">{new Date(message.createdAt).toLocaleString("ja-JP")}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Select onValueChange={(value) => updateMessageStatus(message.id, value)}>
                            <SelectTrigger className="w-20">
                              <Ban className="h-4 w-4" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SENT">送信済み</SelectItem>
                              <SelectItem value="BLOCKED">ブロック</SelectItem>
                              <SelectItem value="DELETED">削除</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Room Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ルーム設定編集</DialogTitle>
          </DialogHeader>
          {selectedRoom && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const settings = {
                  name: formData.get("name"),
                  description: formData.get("description"),
                  atmosphere: formData.get("atmosphere"),
                  maxMembers: Number.parseInt(formData.get("maxMembers") as string),
                  requiredRole: formData.get("requiredRole"),
                  status: formData.get("status"),
                }
                updateRoomSettings(selectedRoom.id, settings)
              }}
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">ルーム名</Label>
                  <Input id="name" name="name" defaultValue={selectedRoom.name} required />
                </div>
                <div>
                  <Label htmlFor="description">説明</Label>
                  <Textarea id="description" name="description" defaultValue={selectedRoom.description} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="atmosphere">雰囲気</Label>
                    <Select name="atmosphere" defaultValue={selectedRoom.atmosphere}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="romantic">ロマンチック</SelectItem>
                        <SelectItem value="intimate">親密</SelectItem>
                        <SelectItem value="friendly">フレンドリー</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maxMembers">最大参加者数</Label>
                    <Input
                      id="maxMembers"
                      name="maxMembers"
                      type="number"
                      min="2"
                      max="100"
                      defaultValue={selectedRoom.maxMembers}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="requiredRole">必要権限</Label>
                    <Select name="requiredRole" defaultValue={selectedRoom.requiredRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">ユーザー</SelectItem>
                        <SelectItem value="MODERATOR">モデレーター</SelectItem>
                        <SelectItem value="ADMIN">管理者</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">ステータス</Label>
                    <Select name="status" defaultValue={selectedRoom.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">アクティブ</SelectItem>
                        <SelectItem value="SUSPENDED">停止中</SelectItem>
                        <SelectItem value="CLOSED">閉鎖</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button type="submit">保存</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
