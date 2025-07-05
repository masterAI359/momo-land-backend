"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Megaphone, 
  Send, 
  Wifi, 
  WifiOff, 
  Users,
  ArrowLeft,
  Bell,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import socketService from "@/lib/socket"
import Link from "next/link"

export default function AdminAnnouncementsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [isConnected, setIsConnected] = useState(false)
  const [userCount, setUserCount] = useState(0)
  const [message, setMessage] = useState("")
  const [announcementType, setAnnouncementType] = useState<'info' | 'success' | 'warning' | 'error'>('info')
  const [sending, setSending] = useState(false)
  
  useEffect(() => {
    if (user) {
      setIsConnected(socketService.isConnectedToServer())
      
      socketService.onUserCountUpdate((count) => {
        setUserCount(count)
      })
      
      const connectionCheck = setInterval(() => {
        setIsConnected(socketService.isConnectedToServer())
      }, 5000)
      
      return () => {
        clearInterval(connectionCheck)
        socketService.offUserCountUpdate()
      }
    }
  }, [user])
  
  const sendAnnouncement = () => {
    if (!message.trim() || sending) return
    
    setSending(true)
    try {
      const socket = socketService.getSocket()
      if (socket) {
        socket.emit("system-announcement", {
          message: message.trim(),
          type: announcementType
        })
        
        setMessage("")
        toast({
          title: "アナウンス送信完了",
          description: `${userCount}人のユーザーにアナウンスを送信しました`,
        })
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "アナウンスの送信に失敗しました",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p>管理者としてログインしてください</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4" />
          ホームに戻る
        </Link>
        <h1 className="text-3xl font-bold mb-2">システムアナウンス管理</h1>
        <p className="text-gray-600">全ユーザーにリアルタイムでアナウンスを送信できます</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                アナウンス送信
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">メッセージタイプ</label>
                  <Select value={announcementType} onValueChange={(value: any) => setAnnouncementType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">情報</SelectItem>
                      <SelectItem value="success">成功</SelectItem>
                      <SelectItem value="warning">警告</SelectItem>
                      <SelectItem value="error">エラー</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">メッセージ</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="全ユーザーに送信するメッセージを入力してください..."
                    className="min-h-[100px]"
                  />
                </div>
                
                <Button 
                  onClick={sendAnnouncement}
                  disabled={sending || !message.trim() || !isConnected}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? "送信中..." : `${userCount}人のユーザーに送信`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500" />
                )}
                接続状態
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? "接続中" : "切断中"}
                </Badge>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{userCount} ユーザーオンライン</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 