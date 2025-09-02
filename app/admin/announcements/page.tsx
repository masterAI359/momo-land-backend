"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface Announcement {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  sentBy: string
}

export default function AnnouncementsAdminPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [isConnected, setIsConnected] = useState(false)
  const [userCount, setUserCount] = useState(0)
  const [message, setMessage] = useState("")
  const [announcementType, setAnnouncementType] = useState<'info' | 'success' | 'warning' | 'error'>('info')
  const [sending, setSending] = useState(false)
  const [sentAnnouncements, setSentAnnouncements] = useState<Announcement[]>([])
  
  useEffect(() => {
    if (user) {
      setIsConnected(socketService.isConnectedToServer())
      
      // Set up event listeners
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
      // Use the socket service to emit system announcement
      // Note: This would need to be implemented in the backend to check for admin permissions
      const socket = socketService.getSocket()
      if (socket) {
        socket.emit("system-announcement", {
          message: message.trim(),
          type: announcementType
        })
        
        // Add to local history
        const newAnnouncement: Announcement = {
          id: Date.now().toString(),
          message: message.trim(),
          type: announcementType,
          timestamp: new Date(),
          sentBy: user?.nickname || 'Admin'
        }
        setSentAnnouncements(prev => [newAnnouncement, ...prev])
        
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
  
  const sendQuickAnnouncement = (quickMessage: string, type: 'info' | 'success' | 'warning' | 'error') => {
    setMessage(quickMessage)
    setAnnouncementType(type)
    // Auto-send after a short delay
    setTimeout(() => {
      if (quickMessage.trim()) {
        sendAnnouncement()
      }
    }, 100)
  }
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }
  
  const getTypeColor = (type: string) => {
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
        {/* Send Announcement */}
        <div className="lg:col-span-2 space-y-6">
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
                      <SelectItem value="info">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-500" />
                          情報
                        </div>
                      </SelectItem>
                      <SelectItem value="success">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          成功
                        </div>
                      </SelectItem>
                      <SelectItem value="warning">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          警告
                        </div>
                      </SelectItem>
                      <SelectItem value="error">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          エラー
                        </div>
                      </SelectItem>
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
          
          {/* Quick Announcements */}
          <Card>
            <CardHeader>
              <CardTitle>クイックアナウンス</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => sendQuickAnnouncement("システムメンテナンスのため、5分後にサーバーが再起動されます。", "warning")}
                  className="justify-start text-left h-auto p-3"
                >
                  <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500 flex-shrink-0" />
                  <span className="text-sm">メンテナンス通知</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => sendQuickAnnouncement("新機能がリリースされました！チャットルームで新しい機能をお試しください。", "success")}
                  className="justify-start text-left h-auto p-3"
                >
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                  <span className="text-sm">新機能通知</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => sendQuickAnnouncement("現在サーバーに高負荷が発生しています。接続が不安定になる可能性があります。", "error")}
                  className="justify-start text-left h-auto p-3"
                >
                  <XCircle className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
                  <span className="text-sm">システム障害</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => sendQuickAnnouncement("本日は多くのユーザーにご利用いただき、ありがとうございます！", "info")}
                  className="justify-start text-left h-auto p-3"
                >
                  <Info className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                  <span className="text-sm">感謝メッセージ</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Announcement History */}
          <Card>
            <CardHeader>
              <CardTitle>送信履歴</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {sentAnnouncements.length === 0 ? (
                  <p className="text-gray-500 text-sm">まだアナウンスを送信していません</p>
                ) : (
                  sentAnnouncements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className={`p-3 rounded-lg border-l-4 ${getTypeColor(announcement.type)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          {getTypeIcon(announcement.type)}
                          <div className="flex-1">
                            <div className="text-sm">{announcement.message}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {announcement.timestamp.toLocaleString('ja-JP')} - {announcement.sentBy}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Status Sidebar */}
        <div className="space-y-4">
          {/* Connection Status */}
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
          
          {/* System Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                システム統計
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>送信済みアナウンス:</span>
                  <span className="font-medium">{sentAnnouncements.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>アクティブユーザー:</span>
                  <span className="font-medium">{userCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>接続状態:</span>
                  <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isConnected ? 'オンライン' : 'オフライン'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle>管理者アクション</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/chat">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    チャットルーム
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 