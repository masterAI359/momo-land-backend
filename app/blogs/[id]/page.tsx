"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  MessageSquare,
  Clock,
  User,
  Eye,
  ArrowLeft,
  Wifi,
  WifiOff,
} from "lucide-react";
import AffiliateBanner from "@/components/affiliate-banner";
import Link from "next/link";
import api from "@/api/axios";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import socketService from "@/lib/socket";
import { Skeleton } from "@/components/ui/skeleton";
import CommentForm from "@/components/comment-form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  excerpt: string;
  author: {
    id: string;
    nickname: string;
    avatar: string;
  };
  likesCount: number;
  commentsCount: number;
  viewCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    nickname: string;
    avatar: string;
  };
  createdAt: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liking, setLiking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [realtimeUpdates, setRealtimeUpdates] = useState(0);
  const [newCommentIds, setNewCommentIds] = useState<Set<string>>(new Set());

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/${params.id}`);
      setPost(response.data);
      setError(null);
    } catch (error: any) {
      console.error("Failed to fetch post:", error);
      setError("投稿の取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "いいねするにはログインしてください。",
        variant: "destructive",
      });
      return;
    }

    try {
      setLiking(true);
      console.log(`📖 Blog Post: Sending like request for post ${params.id}`);

      const response = await api.post(`/posts/${params.id}/like`);

      // Optimistically update the post state
      const newIsLiked = !post?.isLiked;
      setPost((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          isLiked: newIsLiked,
          likesCount: newIsLiked ? prev.likesCount + 1 : prev.likesCount - 1,
        };
      });

      toast({
        title: newIsLiked ? "いいねしました！" : "いいねを取り消しました",
        description: newIsLiked
          ? `${isConnected ? 'リアルタイムで他のユーザーに表示されます' : 'ありがとうございます！'}`
          : "いいねを取り消しました",
      });

      console.log("📖 Blog Post: Like action completed, real-time event should be emitted");
    } catch (error: any) {
      console.error("❌ Blog Post: Failed to like post:", error);

      // Revert optimistic update on error
      setPost((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          isLiked: post?.isLiked || false,
          likesCount: post?.likesCount || 0,
        };
      });

      toast({
        title: "エラー",
        description: "いいねの処理に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setLiking(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle new comment added via comment form
  const handleCommentAdded = (newComment: Comment) => {
    console.log("📖 Blog Post: Comment added via form", newComment);
    setPost((prevPost) => {
      if (!prevPost) return prevPost;

      // Check if comment already exists to prevent duplicates
      const existingComments = prevPost.comments || [];
      const commentExists = existingComments.some(existingComment => existingComment.id === newComment.id);

      if (commentExists) {
        console.log("📖 Blog Post: Comment already exists, skipping");
        return prevPost;
      }

      console.log("📖 Blog Post: Adding comment from form submission");
      return {
        ...prevPost,
        comments: [...existingComments, newComment],
        commentsCount: (prevPost.commentsCount || 0) + 1
      };
    });

    toast({
      title: "コメントが投稿されました",
      description: `${isConnected ? 'リアルタイムで他のユーザーに表示されます' : '投稿が完了しました'}`,
    });
  };

  // Process comments to remove duplicates and sort chronologically
  const processedComments = useMemo(() => {
    if (!post?.comments) return [];

    // Remove duplicates by ID
    const uniqueComments = post.comments.filter((comment, index, self) =>
      self.findIndex(c => c.id === comment.id) === index
    );

    // Sort chronologically (oldest first)
    return uniqueComments.sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [post?.comments]);

  useEffect(() => {
    if (params.id) {
      fetchPost();
    }
  }, [params.id]);

  // Real-time WebSocket setup
  useEffect(() => {
    if (user && params.id) {
      const token = localStorage.getItem("token");
      if (token) {
        console.log(`📖 Blog Post: Setting up WebSocket connection for post ${params.id}`);

        // Ensure WebSocket connection
        socketService.connect(token);

        // Join both blog room and specific post room for comprehensive updates
        socketService.joinBlogRoom();
        socketService.joinPostRoom(params.id as string);

        // Set up real-time event listeners
        const handlePostLike = (data: {
          postId: string;
          likesCount: number;
          isLiked: boolean;
          userId?: string;
        }) => {
          console.log("📖 Blog Post: Like event received", data);
          if (data.postId === params.id) {
            setPost((prevPost) => {
              if (!prevPost) return prevPost;
              return {
                ...prevPost,
                likesCount: data.likesCount,
                isLiked: data.userId === user.id ? data.isLiked : prevPost.isLiked,
              };
            });

            // Show notification only if it's not the current user's action
            if (data.userId && data.userId !== user.id) {
              setRealtimeUpdates(prev => prev + 1);
              toast({
                title: "🔥 リアルタイム更新",
                description: `この投稿に${data.isLiked ? 'いいね' : 'いいね取り消し'}がありました！`,
              });
            }
          }
        };

        const handleNewComment = (comment: any) => {
          console.log("📖 Blog Post: New comment received", comment);

          // Add postId to comment if not present
          const commentWithPostId = {
            ...comment,
            postId: comment.postId || params.id
          };

          if (commentWithPostId.postId === params.id) {
            setPost((prevPost) => {
              if (!prevPost) return prevPost;

              // Check if comment already exists to prevent duplicates
              const existingComments = prevPost.comments || [];
              const commentExists = existingComments.some(existingComment => existingComment.id === commentWithPostId.id);

              if (commentExists) {
                console.log("📖 Blog Post: Duplicate comment detected, skipping");
                return prevPost; // Don't add duplicate comment
              }

              console.log("📖 Blog Post: Adding new comment to state");

              // Mark this comment as new for highlighting
              setNewCommentIds(prev => new Set(prev).add(commentWithPostId.id));

              // Remove the highlight after 3 seconds
              setTimeout(() => {
                setNewCommentIds(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(commentWithPostId.id);
                  return newSet;
                });
              }, 3000);

              const updatedPost = {
                ...prevPost,
                comments: [...existingComments, commentWithPostId],
                commentsCount: (prevPost.commentsCount || 0) + 1
              };

              return updatedPost;
            });

            // Show notification only if it's not the current user's comment
            if (commentWithPostId.author.id !== user.id) {
              setRealtimeUpdates(prev => prev + 1);
              toast({
                title: "💬 新しいコメント",
                description: `${commentWithPostId.author.nickname}さんがコメントしました`,
              });
            }
          }
        };

        const handlePostUpdate = (updatedPost: any) => {
          console.log("📖 Blog Post: Post update received", updatedPost);
          if (updatedPost.id === params.id) {
            setPost((prevPost) => {
              if (!prevPost) return prevPost;
              return {
                ...prevPost,
                ...updatedPost,
                comments: prevPost.comments, // Preserve existing comments
              };
            });

            setRealtimeUpdates(prev => prev + 1);
            toast({
              title: "📝 投稿が更新されました",
              description: "この投稿の内容が更新されました",
            });
          }
        };

        socketService.onPostLike(handlePostLike);
        socketService.onNewComment(handleNewComment);
        socketService.onPostUpdate(handlePostUpdate);

        // Update connection status
        const checkConnection = () => {
          const connected = socketService.isConnectedToServer();
          setIsConnected(connected);
          if (!connected) {
            console.log("📖 Blog Post: WebSocket disconnected, attempting reconnect...");
          }
        };
        const connectionInterval = setInterval(checkConnection, 1000);

        return () => {
          console.log(`📖 Blog Post: Cleaning up WebSocket for post ${params.id}`);
          socketService.leaveBlogRoom();
          socketService.leavePostRoom(params.id as string);
          socketService.offPostLike(handlePostLike);
          socketService.offNewComment(handleNewComment);
          socketService.offPostUpdate(handlePostUpdate);
          clearInterval(connectionInterval);
        };
      }
    }
  }, [user, params.id, toast]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Back Button Skeleton */}
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-5 w-24" />
          </div>

          {/* Post Header Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>

          {/* Post Content Skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-16" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>

          {/* Comments Section Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Comment Form Skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-24" />
                </div>

                {/* Comments List Skeleton */}
                <div className="space-y-4 pt-4 border-t">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">
            {error || "投稿が見つかりませんでした。"}
          </p>
          <div className="mt-4 space-x-4">
            <Button onClick={fetchPost}>再試行</Button>
            <Link href="/blogs">
              <Button variant="outline">ブログ一覧に戻る</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button & Real-time Status */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/blogs">
          <Button variant="ghost" className="text-pink-600 hover:text-pink-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            ブログ一覧に戻る
          </Button>
        </Link>

        {user && isConnected && realtimeUpdates > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-800">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              リアルタイム更新 ({realtimeUpdates}回)
            </span>
          </div>
        )}
      </div>

      {/* Post Content */}
      <Card className="mb-8">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src={post.author.avatar ? post.author.avatar : "/images/avatar/default.png"} />
                <AvatarFallback>{post.author.nickname.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-pink-700">{post.author.nickname}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm bg-pink-100 text-pink-800 px-3 py-1 rounded-full">
                  {post.category}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {post.viewCount}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatDate(post.createdAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {post.title}
            </CardTitle>
            <CardDescription className="text-base flex items-center justify-end">
              {user && (
                <div className="flex items-center space-x-2">
                  {isConnected ? (
                    <div className="flex items-center text-green-600">
                      <Wifi className="w-3 h-3 mr-1" />
                      <span className="text-xs">リアルタイム接続中</span>
                      {realtimeUpdates > 0 && (
                        <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          +{realtimeUpdates}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <WifiOff className="w-3 h-3 mr-1" />
                      <span className="text-xs">オフライン</span>
                    </div>
                  )}
                </div>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none mb-6">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {post.content}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                onClick={handleLike}
                disabled={liking}
                className={`flex items-center space-x-2 ${post.isLiked ? "text-red-600" : "text-gray-600"
                  }`}
              >
                <Heart
                  className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`}
                />
                <span>{post.likesCount}</span>
              </Button>
              <div className="flex items-center space-x-2 text-gray-600">
                <MessageSquare className="w-5 h-5" />
                <span>{post.commentsCount}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-pink-600" />
              コメント ({processedComments.length})
            </CardTitle>
            <div className="flex items-center text-sm">
              {isConnected ? (
                <div className="flex items-center text-green-600">
                  <Wifi className="w-4 h-4 mr-1" />
                  <span>リアルタイム</span>
                  {realtimeUpdates > 0 && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full animate-pulse">
                      {realtimeUpdates} 更新
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center text-gray-400">
                  <WifiOff className="w-4 h-4 mr-1" />
                  <span>オフライン</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {processedComments.length > 0 ? (
            <div className="space-y-4">
              {processedComments.map((comment) => {
                // Safe rendering with fallback for malformed comments
                try {
                  const isNewComment = newCommentIds.has(comment.id);

                  return (
                    <div
                      key={comment.id}
                      className={`border-b border-gray-100 pb-4 last:border-b-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-500 ${isNewComment ? 'bg-blue-50 border-blue-200 rounded-lg p-3 -mx-3' : ''
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2 border-b border-gray-100 pb-2">
                        <span className="font-medium text-gray-900 flex items-center">
                          <Avatar>
                            <AvatarImage src={comment.author.avatar ? comment.author.avatar : "/images/avatar/default.png"} />
                            <AvatarFallback>{comment.author.nickname.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {comment.author?.nickname || "匿名ユーザー"}
                          {isNewComment && (
                            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                              NEW
                            </span>
                          )}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 ml-5">{comment.content}</p>
                    </div>
                  );
                } catch (error) {
                  console.error("Error rendering comment:", error, comment);
                  return (
                    <div
                      key={comment.id || `error-${Math.random()}`}
                      className="border-b border-gray-100 pb-4 last:border-b-0 text-red-500 text-sm italic"
                    >
                      コメントの表示でエラーが発生しました
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">まだコメントがありません。</p>
              <p className="text-sm text-gray-400 mt-2">
                最初のコメントを投稿して議論を始めましょう！
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Comment Form */}
      <CommentForm
        postId={params.id as string}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  );
}
