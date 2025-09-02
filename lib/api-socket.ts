import api from "@/api/axios"
import socketService from "./socket"
import { useToast } from "@/hooks/use-toast"

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

interface PostData {
  id: string
  title: string
  content: string
  category: string
  excerpt: string
  author: {
    id: string
    nickname: string
  }
  likesCount: number
  commentsCount: number
  viewCount: number
  isLiked?: boolean
  createdAt: string
  updatedAt: string
  comments?: CommentData[]
}

interface CommentData {
  id: string
  content: string
  author: {
    id: string
    nickname: string
  }
  createdAt: string
  updatedAt: string
}

interface ChatRoomData {
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
  }
  createdAt: string
}

class ApiSocketService {
  private isConnected = false
  private eventCallbacks: Map<string, Function[]> = new Map()

  constructor() {
    this.setupSocketListeners()
  }

  private setupSocketListeners() {
    // Monitor socket connection status
    if (typeof window !== 'undefined') {
      const checkConnection = () => {
        this.isConnected = socketService.isConnectedToServer()
      }
      setInterval(checkConnection, 5000)
    }
  }

  // Event management
  private addEventCallback(event: string, callback: Function) {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, [])
    }
    this.eventCallbacks.get(event)?.push(callback)
  }

  private removeEventCallback(event: string, callback: Function) {
    const callbacks = this.eventCallbacks.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  // Posts API with Socket Integration
  async createPost(postData: {
    title: string
    content: string
    category: string
    excerpt?: string
  }): Promise<ApiResponse<PostData>> {
    try {
      // Make API call
      const response = await api.post("/posts", postData)
      const newPost = response.data.post

      // Setup socket listeners for this post
      socketService.joinPostRoom(newPost.id)
      
      // Real-time event will be automatically emitted by backend
      console.log("✅ Post created successfully:", newPost.title)
      
      return {
        success: true,
        data: newPost
      }
    } catch (error: any) {
      console.error("❌ Failed to create post:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Failed to create post"
      }
    }
  }

  async updatePost(postId: string, updates: {
    title?: string
    content?: string
    category?: string
    excerpt?: string
  }): Promise<ApiResponse<PostData>> {
    try {
      const response = await api.put(`/posts/${postId}`, updates)
      const updatedPost = response.data.post

      console.log("✅ Post updated successfully:", updatedPost.title)
      
      return {
        success: true,
        data: updatedPost
      }
    } catch (error: any) {
      console.error("❌ Failed to update post:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Failed to update post"
      }
    }
  }

  async deletePost(postId: string): Promise<ApiResponse> {
    try {
      await api.delete(`/posts/${postId}`)
      
      // Leave the post room since it's deleted
      socketService.leavePostRoom(postId)
      
      console.log("✅ Post deleted successfully")
      
      return {
        success: true
      }
    } catch (error: any) {
      console.error("❌ Failed to delete post:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Failed to delete post"
      }
    }
  }

  async likePost(postId: string, optimisticUpdate?: (liked: boolean, count: number) => void): Promise<ApiResponse> {
    try {
      // Optimistic update if provided
      if (optimisticUpdate) {
        // We don't know the current state, so we'll let the response handle it
      }

      const response = await api.post(`/posts/${postId}/like`)
      
      // Real-time event will be emitted by backend
      console.log("✅ Post like toggled successfully")
      
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      console.error("❌ Failed to toggle like:", error)
      
      // Revert optimistic update if it failed
      // This would need to be handled by the calling component
      
      return {
        success: false,
        error: error.response?.data?.error || "Failed to toggle like"
      }
    }
  }

  async getPost(postId: string, trackActivity = true): Promise<ApiResponse<PostData>> {
    try {
      // Join post room for real-time updates
      socketService.joinPostRoom(postId)
      
      // Start reading tracking if enabled
      if (trackActivity) {
        socketService.startReadingPost(postId)
      }

      const response = await api.get(`/posts/${postId}`)
      const post = response.data

      console.log("✅ Post fetched successfully:", post.title)
      
      return {
        success: true,
        data: post
      }
    } catch (error: any) {
      console.error("❌ Failed to fetch post:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch post"
      }
    }
  }

  async getPosts(options: {
    page?: number
    limit?: number
    category?: string
    search?: string
    sortBy?: string
  } = {}): Promise<ApiResponse<{ posts: PostData[], pagination: any }>> {
    try {
      const queryParams = new URLSearchParams()
      if (options.page) queryParams.append('page', options.page.toString())
      if (options.limit) queryParams.append('limit', options.limit.toString())
      if (options.category) queryParams.append('category', options.category)
      if (options.search) queryParams.append('search', options.search)
      if (options.sortBy) queryParams.append('sortBy', options.sortBy)

      const response = await api.get(`/posts?${queryParams.toString()}`)
      
      // Join blog room for real-time updates
      socketService.joinBlogRoom()
      
      console.log("✅ Posts fetched successfully")
      
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      console.error("❌ Failed to fetch posts:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch posts"
      }
    }
  }

  // Comments API with Socket Integration
  async createComment(postId: string, content: string): Promise<ApiResponse<CommentData>> {
    try {
      const response = await api.post(`/posts/${postId}/comments`, { content })
      const newComment = response.data.comment

      console.log("✅ Comment created successfully")
      
      return {
        success: true,
        data: newComment
      }
    } catch (error: any) {
      console.error("❌ Failed to create comment:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Failed to create comment"
      }
    }
  }

  async updateComment(postId: string, commentId: string, content: string): Promise<ApiResponse<CommentData>> {
    try {
      const response = await api.put(`/posts/${postId}/comments/${commentId}`, { content })
      const updatedComment = response.data.comment

      console.log("✅ Comment updated successfully")
      
      return {
        success: true,
        data: updatedComment
      }
    } catch (error: any) {
      console.error("❌ Failed to update comment:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Failed to update comment"
      }
    }
  }

  async deleteComment(postId: string, commentId: string): Promise<ApiResponse> {
    try {
      await api.delete(`/posts/${postId}/comments/${commentId}`)
      
      console.log("✅ Comment deleted successfully")
      
      return {
        success: true
      }
    } catch (error: any) {
      console.error("❌ Failed to delete comment:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Failed to delete comment"
      }
    }
  }

  async reactToComment(postId: string, commentId: string, emoji: string): Promise<ApiResponse> {
    try {
      const response = await api.post(`/posts/${postId}/comments/${commentId}/react`, { emoji })
      
      console.log("✅ Comment reaction sent successfully")
      
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      console.error("❌ Failed to react to comment:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Failed to react to comment"
      }
    }
  }

  // Activity Tracking
  async trackActivity(postId: string, activity: string, data?: any): Promise<ApiResponse> {
    try {
      await api.post(`/posts/${postId}/activity`, { activity, data })
      
      return {
        success: true
      }
    } catch (error: any) {
      console.error("❌ Failed to track activity:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Failed to track activity"
      }
    }
  }

  // Chat API with Socket Integration
  async getChatRooms(): Promise<ApiResponse<{ rooms: ChatRoomData[] }>> {
    try {
      const response = await api.get("/chat/rooms")
      
      console.log("✅ Chat rooms fetched successfully")
      
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      console.error("❌ Failed to fetch chat rooms:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch chat rooms"
      }
    }
  }

  async createChatRoom(roomData: {
    name: string
    description?: string
    atmosphere?: string
    isPrivate?: boolean
    maxMembers?: number
  }): Promise<ApiResponse<ChatRoomData>> {
    try {
      const response = await api.post("/chat/rooms", roomData)
      const newRoom = response.data.room

      console.log("✅ Chat room created successfully:", newRoom.name)
      
      return {
        success: true,
        data: newRoom
      }
    } catch (error: any) {
      console.error("❌ Failed to create chat room:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Failed to create chat room"
      }
    }
  }

  async joinChatRoom(roomId: string): Promise<ApiResponse> {
    try {
      await api.post(`/chat/rooms/${roomId}/join`)
      
      // Join socket room for real-time updates
      socketService.joinChatRoom(roomId)
      
      console.log("✅ Joined chat room successfully")
      
      return {
        success: true
      }
    } catch (error: any) {
      console.error("❌ Failed to join chat room:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Failed to join chat room"
      }
    }
  }

  async leaveChatRoom(roomId: string): Promise<ApiResponse> {
    try {
      await api.post(`/chat/rooms/${roomId}/leave`)
      
      // Leave socket room
      socketService.leaveChatRoom(roomId)
      
      console.log("✅ Left chat room successfully")
      
      return {
        success: true
      }
    } catch (error: any) {
      console.error("❌ Failed to leave chat room:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Failed to leave chat room"
      }
    }
  }

  // Socket Event Subscriptions
  onPostUpdate(callback: (post: PostData) => void) {
    socketService.onPostUpdate(callback)
    this.addEventCallback('post-update', callback)
  }

  onPostDelete(callback: (data: { postId: string; title: string; deletedBy: string }) => void) {
    socketService.onPostDelete(callback)
    this.addEventCallback('post-delete', callback)
  }

  onPostLike(callback: (data: { postId: string; likesCount: number; isLiked: boolean }) => void) {
    socketService.onPostLike(callback)
    this.addEventCallback('post-like', callback)
  }

  onNewPost(callback: (post: PostData) => void) {
    socketService.onNewPost(callback)
    this.addEventCallback('new-post', callback)
  }

  onNewComment(callback: (comment: CommentData) => void) {
    socketService.onNewComment(callback)
    this.addEventCallback('new-comment', callback)
  }

  onCommentUpdate(callback: (comment: CommentData) => void) {
    socketService.onCommentUpdate(callback)
    this.addEventCallback('comment-update', callback)
  }

  onCommentDelete(callback: (data: { commentId: string; postId: string; deletedBy: string }) => void) {
    socketService.onCommentDelete(callback)
    this.addEventCallback('comment-delete', callback)
  }

  onCommentReaction(callback: (data: { commentId: string; postId: string; emoji: string; userId: string; userNickname: string }) => void) {
    socketService.onCommentReaction(callback)
    this.addEventCallback('comment-reaction', callback)
  }

  onUserActivity(callback: (data: { postId: string; userId: string; userNickname: string; activity: string; data: any }) => void) {
    socketService.onUserActivity(callback)
    this.addEventCallback('user-activity', callback)
  }

  onUserViewingPost(callback: (data: { userId: string; nickname: string; postId: string }) => void) {
    socketService.onUserViewingPost(callback)
    this.addEventCallback('user-viewing-post', callback)
  }

  onUserLeftPost(callback: (data: { userId: string; nickname: string; postId: string }) => void) {
    socketService.onUserLeftPost(callback)
    this.addEventCallback('user-left-post', callback)
  }

  // Cleanup methods
  offPostUpdate(callback?: (post: PostData) => void) {
    socketService.offPostUpdate(callback)
    if (callback) this.removeEventCallback('post-update', callback)
  }

  offPostDelete(callback?: (data: { postId: string; title: string; deletedBy: string }) => void) {
    socketService.offPostDelete(callback)
    if (callback) this.removeEventCallback('post-delete', callback)
  }

  offPostLike(callback?: (data: { postId: string; likesCount: number; isLiked: boolean }) => void) {
    socketService.offPostLike(callback)
    if (callback) this.removeEventCallback('post-like', callback)
  }

  offNewPost(callback?: (post: PostData) => void) {
    socketService.offNewPost(callback)
    if (callback) this.removeEventCallback('new-post', callback)
  }

  offNewComment(callback?: (comment: CommentData) => void) {
    socketService.offNewComment(callback)
    if (callback) this.removeEventCallback('new-comment', callback)
  }

  offCommentUpdate(callback?: (comment: CommentData) => void) {
    socketService.offCommentUpdate(callback)
    if (callback) this.removeEventCallback('comment-update', callback)
  }

  offCommentDelete(callback?: (data: { commentId: string; postId: string; deletedBy: string }) => void) {
    socketService.offCommentDelete(callback)
    if (callback) this.removeEventCallback('comment-delete', callback)
  }

  offCommentReaction(callback?: (data: { commentId: string; postId: string; emoji: string; userId: string; userNickname: string }) => void) {
    socketService.offCommentReaction(callback)
    if (callback) this.removeEventCallback('comment-reaction', callback)
  }

  offUserActivity(callback?: (data: { postId: string; userId: string; userNickname: string; activity: string; data: any }) => void) {
    socketService.offUserActivity(callback)
    if (callback) this.removeEventCallback('user-activity', callback)
  }

  offUserViewingPost(callback?: (data: { userId: string; nickname: string; postId: string }) => void) {
    socketService.offUserViewingPost(callback)
    if (callback) this.removeEventCallback('user-viewing-post', callback)
  }

  offUserLeftPost(callback?: (data: { userId: string; nickname: string; postId: string }) => void) {
    socketService.offUserLeftPost(callback)
    if (callback) this.removeEventCallback('user-left-post', callback)
  }

  // Utility methods
  isSocketConnected(): boolean {
    return this.isConnected
  }

  connectSocket(token: string) {
    socketService.connect(token)
  }

  disconnectSocket() {
    socketService.disconnect()
    this.eventCallbacks.clear()
  }

  // Reading session management
  startReadingSession(postId: string) {
    socketService.startReadingPost(postId)
  }

  finishReadingSession(postId: string, readingTime: number) {
    socketService.finishReadingPost(postId, readingTime)
  }

  updateScrollProgress(postId: string, scrollPercentage: number, currentSection?: string) {
    socketService.updateScrollProgress(postId, scrollPercentage, currentSection)
  }

  // Leave specific rooms
  leavePostRoom(postId: string) {
    socketService.leavePostRoom(postId)
  }

  leaveBlogRoom() {
    socketService.leaveBlogRoom()
  }
}

// Create singleton instance
const apiSocketService = new ApiSocketService()

export default apiSocketService
export type { PostData, CommentData, ChatRoomData, ApiResponse } 