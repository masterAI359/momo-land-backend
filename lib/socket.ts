import { io, Socket } from "socket.io-client"

class SocketService {
  private socket: Socket | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect(token: string) {
    if (this.socket?.connected) {
      console.log("WebSocket already connected")
      return
    }

    const serverUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    console.log("Connecting to WebSocket server:", serverUrl)
    console.log("Using token:", token ? "Token provided" : "No token")

    this.socket = io(serverUrl, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
    })

    this.socket.on("connect", () => {
      console.log("✅ Connected to WebSocket server")
      this.isConnected = true
      this.reconnectAttempts = 0
    })

    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected from WebSocket server:", reason)
      this.isConnected = false
      
      if (reason === "io server disconnect") {
        // Server disconnected, try to reconnect
        this.handleReconnect(token)
      }
    })

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error)
      this.isConnected = false
      this.handleReconnect(token)
    })

    this.socket.on("error", (error) => {
      console.error("WebSocket error:", error)
    })
  }

  private handleReconnect(token: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      
      setTimeout(() => {
        this.connect(token)
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error("Max reconnection attempts reached")
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.reconnectAttempts = 0
    }
  }

  // Blog post events
  joinBlogRoom() {
    if (this.socket?.connected) {
      console.log("📢 Joining blog room")
      this.socket.emit("join-blog-room")
    } else {
      console.log("❌ Cannot join blog room - not connected")
    }
  }

  leaveBlogRoom() {
    if (this.socket?.connected) {
      console.log("📢 Leaving blog room")
      this.socket.emit("leave-blog-room")
    }
  }

  joinPostRoom(postId: string) {
    if (this.socket?.connected) {
      console.log("📢 Joining post room:", postId)
      this.socket.emit("join-post-room", postId)
    } else {
      console.log("❌ Cannot join post room - not connected")
    }
  }

  leavePostRoom(postId: string) {
    if (this.socket?.connected) {
      console.log("📢 Leaving post room:", postId)
      this.socket.emit("leave-post-room", postId)
    }
  }

  // Event listeners
  onNewPost(callback: (post: any) => void) {
    if (this.socket) {
      console.log("🎧 Setting up new-post listener")
      this.socket.on("new-post", (data) => {
        console.log("📨 Received new-post event:", data)
        callback(data)
      })
    }
  }

  onPostUpdate(callback: (post: any) => void) {
    if (this.socket) {
      console.log("🎧 Setting up post-updated listener")
      this.socket.on("post-updated", (data) => {
        console.log("📨 Received post-updated event:", data)
        callback(data)
      })
    }
  }

  onPostLike(callback: (data: { postId: string; likesCount: number; isLiked: boolean }) => void) {
    if (this.socket) {
      console.log("🎧 Setting up post-liked listener")
      this.socket.on("post-liked", (data) => {
        console.log("📨 Received post-liked event:", data)
        callback(data)
      })
    }
  }

  onNewComment(callback: (comment: any) => void) {
    if (this.socket) {
      console.log("🎧 Setting up new-comment listener")
      this.socket.on("new-comment", (data) => {
        console.log("📨 Received new-comment event:", data)
        callback(data)
      })
    }
  }

  onUserOnline(callback: (data: { userId: string; nickname: string }) => void) {
    if (this.socket) {
      this.socket.on("user-online", callback)
    }
  }

  onUserOffline(callback: (data: { userId: string; nickname: string }) => void) {
    if (this.socket) {
      this.socket.on("user-offline", callback)
    }
  }

  // Remove event listeners
  offNewPost(callback?: (post: any) => void) {
    if (this.socket) {
      this.socket.off("new-post", callback)
    }
  }

  offPostUpdate(callback?: (post: any) => void) {
    if (this.socket) {
      this.socket.off("post-updated", callback)
    }
  }

  offPostLike(callback?: (data: { postId: string; likesCount: number; isLiked: boolean }) => void) {
    if (this.socket) {
      this.socket.off("post-liked", callback)
    }
  }

  offNewComment(callback?: (comment: any) => void) {
    if (this.socket) {
      this.socket.off("new-comment", callback)
    }
  }

  offUserOnline(callback?: (data: { userId: string; nickname: string }) => void) {
    if (this.socket) {
      this.socket.off("user-online", callback)
    }
  }

  offUserOffline(callback?: (data: { userId: string; nickname: string }) => void) {
    if (this.socket) {
      this.socket.off("user-offline", callback)
    }
  }

  // Chat room events
  joinChatRoom(roomId: string) {
    if (this.socket?.connected) {
      console.log("📢 Joining chat room:", roomId)
      this.socket.emit("join-room", roomId)
    } else {
      console.log("❌ Cannot join chat room - not connected")
    }
  }

  leaveChatRoom(roomId: string) {
    if (this.socket?.connected) {
      console.log("📢 Leaving chat room:", roomId)
      this.socket.emit("leave-room", roomId)
    }
  }

  sendMessage(roomId: string, content: string) {
    if (this.socket?.connected) {
      console.log("📤 Sending message to room:", roomId)
      this.socket.emit("send-message", { roomId, content })
    } else {
      console.log("❌ Cannot send message - not connected")
    }
  }

  // Chat room event listeners
  onRoomJoined(callback: (data: any) => void) {
    if (this.socket) {
      console.log("🎧 Setting up room-joined listener")
      this.socket.on("room-joined", (data) => {
        console.log("📨 Received room-joined event:", data)
        callback(data)
      })
    }
  }

  onUserJoined(callback: (data: { user: any; timestamp: Date }) => void) {
    if (this.socket) {
      console.log("🎧 Setting up user-joined listener")
      this.socket.on("user-joined", (data) => {
        console.log("📨 Received user-joined event:", data)
        callback(data)
      })
    }
  }

  onNewMessage(callback: (message: any) => void) {
    if (this.socket) {
      console.log("🎧 Setting up new-message listener")
      this.socket.on("new-message", (data) => {
        console.log("📨 Received new-message event:", data)
        callback(data)
      })
    }
  }

  onUserLeft(callback: (data: { user: any; timestamp: Date }) => void) {
    if (this.socket) {
      console.log("🎧 Setting up user-left listener")
      this.socket.on("user-left", (data) => {
        console.log("📨 Received user-left event:", data)
        callback(data)
      })
    }
  }

  onRoomUpdated(callback: (room: any) => void) {
    if (this.socket) {
      console.log("🎧 Setting up room-updated listener")
      this.socket.on("room-updated", (data) => {
        console.log("📨 Received room-updated event:", data)
        callback(data)
      })
    }
  }

  onRoomCreated(callback: (room: any) => void) {
    if (this.socket) {
      console.log("🎧 Setting up room-created listener")
      this.socket.on("room-created", (data) => {
        console.log("📨 Received room-created event:", data)
        callback(data)
      })
    }
  }

  // Remove chat room event listeners
  offRoomJoined(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off("room-joined", callback)
    }
  }

  offUserJoined(callback?: (data: { user: any; timestamp: Date }) => void) {
    if (this.socket) {
      this.socket.off("user-joined", callback)
    }
  }

  offNewMessage(callback?: (message: any) => void) {
    if (this.socket) {
      this.socket.off("new-message", callback)
    }
  }

  offUserLeft(callback?: (data: { user: any; timestamp: Date }) => void) {
    if (this.socket) {
      this.socket.off("user-left", callback)
    }
  }

  offRoomUpdated(callback?: (room: any) => void) {
    if (this.socket) {
      this.socket.off("room-updated", callback)
    }
  }

  offRoomCreated(callback?: (room: any) => void) {
    if (this.socket) {
      this.socket.off("room-created", callback)
    }
  }

  // Utility methods
  isConnectedToServer(): boolean {
    return this.isConnected && this.socket?.connected === true
  }

  getSocket(): Socket | null {
    return this.socket
  }
}

// Export singleton instance
export const socketService = new SocketService()
export default socketService 