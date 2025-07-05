"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  MessageCircle, 
  Users, 
  Wifi, 
  WifiOff, 
  Send,
  Globe,
  ArrowLeft
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import socketService from "@/lib/socket"
import Link from "next/link"

export default function DemoRealTimePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [isConnected, setIsConnected] = useState(false)
  const [userCount, setUserCount] = useState(0)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  
  useEffect(() => {
    if (user) {
      setIsConnected(socketService.isConnectedToServer())
      
      const connectionCheck = setInterval(() => {
        setIsConnected(socketService.isConnectedToServer())
      }, 5000)
      
      return () => {
        clearInterval(connectionCheck)
      }
    }
  }, [user])
  
  const sendMessage = () => {
    if (message.trim()) {
      socketService.sendMessage("demo-room", message)
      setMessage("")
    }
  }
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p>Please log in to see the real-time demo</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-2">Real-time Communication Demo</h1>
        <p className="text-gray-600">Experience the power of Socket.IO real-time features</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{userCount} users online</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Real-time Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-40 overflow-y-auto border rounded p-2 space-y-2">
                {messages.map((msg, idx) => (
                  <div key={idx} className="text-sm">
                    <strong>{msg.user?.nickname || 'User'}:</strong> {msg.content}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 