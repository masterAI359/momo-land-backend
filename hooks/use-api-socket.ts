import { useState, useEffect, useCallback, useRef } from "react"
import apiSocketService, { PostData, CommentData, ChatRoomData, ApiResponse } from "@/lib/api-socket"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface UseApiSocketOptions {
  autoConnect?: boolean
  enableRealtime?: boolean
}

export function useApiSocket(options: UseApiSocketOptions = {}) {
  const { autoConnect = true, enableRealtime = true } = options
  const { user } = useAuth()
  const { toast } = useToast()
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const connectedRef = useRef(false)

  // Connection management
  useEffect(() => {
    if (user && autoConnect && !connectedRef.current) {
      const token = localStorage.getItem("token")
      if (token) {
        apiSocketService.connectSocket(token)
        connectedRef.current = true
      }
    }

    // Monitor connection status
    const checkConnection = () => {
      setIsConnected(apiSocketService.isSocketConnected())
    }
    
    const interval = setInterval(checkConnection, 2000)
    return () => clearInterval(interval)
  }, [user, autoConnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connectedRef.current) {
        apiSocketService.disconnectSocket()
        connectedRef.current = false
      }
    }
  }, [])

  return {
    isConnected,
    loading,
    apiSocketService
  }
}

// Specialized hook for posts
export function usePosts() {
  const [posts, setPosts] = useState<PostData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const callbacksRef = useRef<Set<Function>>(new Set())

  // Fetch posts
  const fetchPosts = useCallback(async (options: {
    page?: number
    limit?: number
    category?: string
    search?: string
    sortBy?: string
  } = {}) => {
    setLoading(true)
    setError(null)
    
    const result = await apiSocketService.getPosts(options)
    
    if (result.success && result.data) {
      setPosts(result.data.posts)
    } else {
      setError(result.error || "Failed to fetch posts")
      toast({
        title: "エラー",
        description: result.error || "投稿の取得に失敗しました",
        variant: "destructive",
      })
    }
    
    setLoading(false)
    return result
  }, [toast])

  // Create post
  const createPost = useCallback(async (postData: {
    title: string
    content: string
    category: string
    excerpt?: string
  }) => {
    setLoading(true)
    
    const result = await apiSocketService.createPost(postData)
    
    if (result.success) {
      toast({
        title: "投稿完了",
        description: "投稿が正常に作成されました！",
      })
      // New post will be added via real-time event
    } else {
      toast({
        title: "エラー",
        description: result.error || "投稿の作成に失敗しました",
        variant: "destructive",
      })
    }
    
    setLoading(false)
    return result
  }, [toast])

  // Like post
  const likePost = useCallback(async (postId: string) => {
    // Optimistic update
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1
            }
          : post
      )
    )

    const result = await apiSocketService.likePost(postId)
    
    if (!result.success) {
      // Revert optimistic update
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likesCount: post.isLiked ? post.likesCount + 1 : post.likesCount - 1
              }
            : post
        )
      )
      
      toast({
        title: "エラー",
        description: result.error || "いいねの処理に失敗しました",
        variant: "destructive",
      })
    }
    
    return result
  }, [toast])

  // Setup real-time listeners
  useEffect(() => {
    const handleNewPost = (newPost: PostData) => {
      setPosts(prevPosts => [newPost, ...prevPosts])
      toast({
        title: "新しい投稿",
        description: `${newPost.author.nickname}さんが新しい投稿をしました`,
      })
    }

    const handlePostUpdate = (updatedPost: PostData) => {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === updatedPost.id ? updatedPost : post
        )
      )
    }

    const handlePostDelete = (data: { postId: string; title: string; deletedBy: string }) => {
      setPosts(prevPosts => prevPosts.filter(post => post.id !== data.postId))
      toast({
        title: "投稿が削除されました",
        description: `「${data.title}」が削除されました`,
      })
    }

    const handlePostLike = (data: { postId: string; likesCount: number; isLiked: boolean }) => {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === data.postId
            ? { ...post, likesCount: data.likesCount }
            : post
        )
      )
    }

    // Register callbacks
    apiSocketService.onNewPost(handleNewPost)
    apiSocketService.onPostUpdate(handlePostUpdate)
    apiSocketService.onPostDelete(handlePostDelete)
    apiSocketService.onPostLike(handlePostLike)

    callbacksRef.current.add(handleNewPost)
    callbacksRef.current.add(handlePostUpdate)
    callbacksRef.current.add(handlePostDelete)
    callbacksRef.current.add(handlePostLike)

    return () => {
      apiSocketService.offNewPost(handleNewPost)
      apiSocketService.offPostUpdate(handlePostUpdate)
      apiSocketService.offPostDelete(handlePostDelete)
      apiSocketService.offPostLike(handlePostLike)
      callbacksRef.current.clear()
    }
  }, [toast])

  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    likePost,
  }
}

// Specialized hook for a single post
export function usePost(postId: string | null) {
  const [post, setPost] = useState<PostData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [readingStartTime, setReadingStartTime] = useState<number | null>(null)
  const { toast } = useToast()

  // Fetch post
  const fetchPost = useCallback(async () => {
    if (!postId) return

    setLoading(true)
    setError(null)
    
    const result = await apiSocketService.getPost(postId, true)
    
    if (result.success && result.data) {
      setPost(result.data)
      setReadingStartTime(Date.now())
    } else {
      setError(result.error || "Failed to fetch post")
      toast({
        title: "エラー",
        description: result.error || "投稿の取得に失敗しました",
        variant: "destructive",
      })
    }
    
    setLoading(false)
    return result
  }, [postId, toast])

  // Like post
  const likePost = useCallback(async () => {
    if (!postId) return

    // Optimistic update
    setPost(prevPost =>
      prevPost ? {
        ...prevPost,
        isLiked: !prevPost.isLiked,
        likesCount: prevPost.isLiked ? prevPost.likesCount - 1 : prevPost.likesCount + 1
      } : null
    )

    const result = await apiSocketService.likePost(postId)
    
    if (!result.success) {
      // Revert optimistic update
      setPost(prevPost =>
        prevPost ? {
          ...prevPost,
          isLiked: !prevPost.isLiked,
          likesCount: prevPost.isLiked ? prevPost.likesCount + 1 : prevPost.likesCount - 1
        } : null
      )
      
      toast({
        title: "エラー",
        description: result.error || "いいねの処理に失敗しました",
        variant: "destructive",
      })
    }
    
    return result
  }, [postId, toast])

  // Add comment
  const addComment = useCallback(async (content: string) => {
    if (!postId) return

    const result = await apiSocketService.createComment(postId, content)
    
    if (result.success) {
      toast({
        title: "コメント投稿完了",
        description: "コメントが投稿されました",
      })
      // Comment will be added via real-time event
    } else {
      toast({
        title: "エラー",
        description: result.error || "コメントの投稿に失敗しました",
        variant: "destructive",
      })
    }
    
    return result
  }, [postId, toast])

  // Track scroll progress
  const updateScrollProgress = useCallback((scrollPercentage: number, currentSection?: string) => {
    if (postId) {
      apiSocketService.updateScrollProgress(postId, scrollPercentage, currentSection)
    }
  }, [postId])

  // Finish reading session
  const finishReading = useCallback(() => {
    if (postId && readingStartTime) {
      const readingTime = Date.now() - readingStartTime
      apiSocketService.finishReadingSession(postId, readingTime)
      setReadingStartTime(null)
    }
  }, [postId, readingStartTime])

  // Setup real-time listeners
  useEffect(() => {
    if (!postId) return

    const handlePostUpdate = (updatedPost: PostData) => {
      if (updatedPost.id === postId) {
        setPost(updatedPost)
      }
    }

    const handleNewComment = (comment: CommentData) => {
      setPost(prevPost =>
        prevPost ? {
          ...prevPost,
          comments: [...(prevPost.comments || []), comment],
          commentsCount: prevPost.commentsCount + 1
        } : null
      )
    }

    const handlePostLike = (data: { postId: string; likesCount: number; isLiked: boolean }) => {
      if (data.postId === postId) {
        setPost(prevPost =>
          prevPost ? { ...prevPost, likesCount: data.likesCount } : null
        )
      }
    }

    const handleCommentUpdate = (updatedComment: CommentData) => {
      setPost(prevPost =>
        prevPost ? {
          ...prevPost,
          comments: prevPost.comments?.map(comment =>
            comment.id === updatedComment.id ? updatedComment : comment
          )
        } : null
      )
    }

    const handleCommentDelete = (data: { commentId: string; postId: string }) => {
      if (data.postId === postId) {
        setPost(prevPost =>
          prevPost ? {
            ...prevPost,
            comments: prevPost.comments?.filter(comment => comment.id !== data.commentId),
            commentsCount: Math.max(0, prevPost.commentsCount - 1)
          } : null
        )
      }
    }

    // Register callbacks
    apiSocketService.onPostUpdate(handlePostUpdate)
    apiSocketService.onNewComment(handleNewComment)
    apiSocketService.onPostLike(handlePostLike)
    apiSocketService.onCommentUpdate(handleCommentUpdate)
    apiSocketService.onCommentDelete(handleCommentDelete)

    return () => {
      apiSocketService.offPostUpdate(handlePostUpdate)
      apiSocketService.offNewComment(handleNewComment)
      apiSocketService.offPostLike(handlePostLike)
      apiSocketService.offCommentUpdate(handleCommentUpdate)
      apiSocketService.offCommentDelete(handleCommentDelete)
    }
  }, [postId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      finishReading()
      if (postId) {
        apiSocketService.leavePostRoom(postId)
      }
    }
  }, [postId, finishReading])

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId, fetchPost])

  return {
    post,
    loading,
    error,
    fetchPost,
    likePost,
    addComment,
    updateScrollProgress,
    finishReading,
  }
}

// Hook for chat rooms
export function useChatRooms() {
  const [rooms, setRooms] = useState<ChatRoomData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchRooms = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    const result = await apiSocketService.getChatRooms()
    
    if (result.success && result.data) {
      setRooms(result.data.rooms)
    } else {
      setError(result.error || "Failed to fetch chat rooms")
      toast({
        title: "エラー",
        description: result.error || "チャットルームの取得に失敗しました",
        variant: "destructive",
      })
    }
    
    setLoading(false)
    return result
  }, [toast])

  const createRoom = useCallback(async (roomData: {
    name: string
    description?: string
    atmosphere?: string
    isPrivate?: boolean
    maxMembers?: number
  }) => {
    setLoading(true)
    
    const result = await apiSocketService.createChatRoom(roomData)
    
    if (result.success) {
      toast({
        title: "チャットルーム作成完了",
        description: `「${roomData.name}」が作成されました`,
      })
      // Refresh rooms list
      await fetchRooms()
    } else {
      toast({
        title: "エラー",
        description: result.error || "チャットルームの作成に失敗しました",
        variant: "destructive",
      })
    }
    
    setLoading(false)
    return result
  }, [toast, fetchRooms])

  const joinRoom = useCallback(async (roomId: string) => {
    const result = await apiSocketService.joinChatRoom(roomId)
    
    if (result.success) {
      toast({
        title: "チャットルームに参加しました",
        description: "チャットルームに参加しました",
      })
    } else {
      toast({
        title: "エラー",
        description: result.error || "チャットルームへの参加に失敗しました",
        variant: "destructive",
      })
    }
    
    return result
  }, [toast])

  const leaveRoom = useCallback(async (roomId: string) => {
    const result = await apiSocketService.leaveChatRoom(roomId)
    
    if (result.success) {
      toast({
        title: "チャットルームを退出しました",
        description: "チャットルームを退出しました",
      })
    } else {
      toast({
        title: "エラー",
        description: result.error || "チャットルームの退出に失敗しました",
        variant: "destructive",
      })
    }
    
    return result
  }, [toast])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  return {
    rooms,
    loading,
    error,
    fetchRooms,
    createRoom,
    joinRoom,
    leaveRoom,
  }
} 