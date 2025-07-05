"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { 
  Heart, 
  MessageCircle, 
  Users, 
  Wifi, 
  WifiOff, 
  Bell, 
  MapPin, 
  Phone, 
  Video, 
  Edit3,
  Smile,
  Send,
  Globe
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import socketService from "@/lib/socket"

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

interface Reaction {
  messageId: string
  emoji: string
  userId: string
  nickname: string
}

export default function RealTimeDemo() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false)
  const [userCount, setUserCount] = useState(0)
  
  // Chat features
  const [currentRoom, setCurrentRoom] = useState("demo-room")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [reactions, setReactions] = useState<Reaction[]>([])
  
  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([])
  
  // Document editing
  const [documentContent, setDocumentContent] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  
  // Location sharing
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)
  const [sharedLocations, setSharedLocations] = useState<any[]>([])
  
  // Typing indicator
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Initialize Socket.IO when component mounts
  useEffect(() => {
    if (user) {
      setIsConnected(socketService.isConnectedToServer())
      
      // Set up all event listeners
      setupEventListeners()
      
      // Join demo room
      socketService.joinChatRoom(currentRoom)
      
      // Check connection status periodically
      const connectionCheck = setInterval(() => {
        setIsConnected(socketService.isConnectedToServer())
      }, 5000)
      
      return () => {
        clearInterval(connectionCheck)
        cleanupEventListeners()
        socketService.leaveChatRoom(currentRoom)
      }
    }
  }, [user])
  
  const setupEventListeners = () => {
    // Chat events
    socketService.onNewMessage((message) => {
      setMessages(prev => [...prev, message])
    })
    
    socketService.onUserJoined((data) => {
      toast({
        title: "User Joined",
        description: `${data.user.nickname} joined the room`,
      })
    })
    
    socketService.onUserLeft((data) => {
      toast({
        title: "User Left",
        description: `${data.user.nickname} left the room`,
      })
    })
    
    // Enhanced features
    socketService.onTypingStart((data) => {
      if (data.userId !== user?.id) {
        setTypingUsers(prev => {
          const exists = prev.find(u => u.userId === data.userId)
          if (!exists) {
            return [...prev, data]
          }
          return prev
        })
      }
    })
    
    socketService.onTypingStop((data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
    })
    
    socketService.onReactionAdded((data) => {
      setReactions(prev => [...prev, data])
    })
    
    socketService.onNotification((notification) => {
      setNotifications(prev => [...prev, {
        id: Date.now().toString(),
        ...notification
      }])
    })
    
    socketService.onSystemAnnouncement((announcement) => {
      toast({
        title: "System Announcement",
        description: announcement.message,
        duration: 5000,
      })
    })
    
    socketService.onUserCountUpdate((count) => {
      setUserCount(count)
    })
    
    socketService.onDocumentChange((data) => {
      if (data.userId !== user?.id) {
        setDocumentContent(data.changes.content)
        toast({
          title: "Document Updated",
          description: `${data.nickname} made changes`,
        })
      }
    })
    
    socketService.onLocationShared((data) => {
      setSharedLocations(prev => [...prev, data])
    })
    
    socketService.onCallInitiated((data) => {
      toast({
        title: `${data.callType === 'video' ? 'Video' : 'Voice'} Call`,
        description: `${data.initiator.nickname} wants to start a call`,
        duration: 10000,
      })
    })
  }
  
  const cleanupEventListeners = () => {
    socketService.offNewMessage()
    socketService.offUserJoined()
    socketService.offUserLeft()
    socketService.offTypingStart()
    socketService.offTypingStop()
    socketService.offReactionAdded()
    socketService.offNotification()
    socketService.offSystemAnnouncement()
    socketService.offUserCountUpdate()
    socketService.offDocumentChange()
    socketService.offLocationShared()
    socketService.offCallInitiated()
  }
  
  const sendMessage = () => {
    if (message.trim()) {
      socketService.sendMessage(currentRoom, message)
      setMessage("")
      
      // Track user activity
      socketService.reportUserActivity("message_sent", { 
        roomId: currentRoom, 
        messageLength: message.length 
      })
    }
  }
  
  const handleTyping = (value: string) => {
    setMessage(value)
    
    // Send typing indicator
    socketService.sendTypingIndicator(currentRoom)
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTypingIndicator(currentRoom)
    }, 2000)
  }
  
  const addReaction = (messageId: string, emoji: string) => {
    socketService.sendReaction(currentRoom, messageId, emoji)
  }
  
  const startDocumentEditing = () => {
    setIsEditing(true)
    socketService.joinDocumentEdit("demo-post-id")
  }
  
  const updateDocument = (content: string) => {
    setDocumentContent(content)
    socketService.sendDocumentChange("demo-post-id", { content })
  }
  
  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setLocation(loc)
        socketService.shareLocation(currentRoom, loc)
      })
    }
  }
  
  const initiateCall = (type: 'voice' | 'video') => {
    socketService.initiateCall(currentRoom, type)
  }
  
  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }
  
  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Please log in to see the real-time demo</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {/* Connection Status */}
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
      
      {/* Chat Demo */}
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
                <div key={idx} className="flex gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>{msg.user.nickname[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{msg.user.nickname}</div>
                    <div className="text-sm">{msg.content}</div>
                    <div className="flex gap-1 mt-1">
                      {['❤️', '👍', '😂', '😮'].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => addReaction(msg.id, emoji)}
                          className="text-xs hover:bg-gray-100 px-1 rounded"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {typingUsers.length > 0 && (
              <div className="text-sm text-gray-500 italic">
                {typingUsers.map(u => u.nickname).join(', ')} typing...
              </div>
            )}
            
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => handleTyping(e.target.value)}
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
      
      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-2 rounded border-l-4 ${
                  notification.type === 'error' ? 'border-red-500 bg-red-50' :
                  notification.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  notification.type === 'success' ? 'border-green-500 bg-green-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="text-sm">{notification.message}</div>
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
        </CardContent>
      </Card>
      
      {/* Document Collaboration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Live Document Editing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!isEditing ? (
              <Button onClick={startDocumentEditing}>
                Start Collaborative Editing
              </Button>
            ) : (
              <Textarea
                value={documentContent}
                onChange={(e) => updateDocument(e.target.value)}
                placeholder="Start typing to see real-time collaboration..."
                className="min-h-[100px]"
              />
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Location & Calls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location & Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={shareLocation} variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                Share Location
              </Button>
              <Button onClick={() => initiateCall('voice')} variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Voice Call
              </Button>
              <Button onClick={() => initiateCall('video')} variant="outline">
                <Video className="h-4 w-4 mr-2" />
                Video Call
              </Button>
            </div>
            
            {location && (
              <div className="text-sm">
                Your location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </div>
            )}
            
            {sharedLocations.length > 0 && (
              <div className="text-sm">
                <div className="font-medium">Shared Locations:</div>
                {sharedLocations.map((loc, idx) => (
                  <div key={idx}>
                    {loc.nickname}: {loc.location.lat.toFixed(4)}, {loc.location.lng.toFixed(4)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* System Features */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            System Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userCount}</div>
              <div className="text-sm text-gray-500">Users Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{messages.length}</div>
              <div className="text-sm text-gray-500">Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{reactions.length}</div>
              <div className="text-sm text-gray-500">Reactions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 