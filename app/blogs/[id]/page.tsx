import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageSquare, Clock, User } from "lucide-react"
import AffiliateBanner from "@/components/affiliate-banner"

<<<<<<< HEAD
export const metadata = {
  title: "ブログ詳細 - momoLand",
  description: "ライブチャット体験記の詳細ページ",
}

export default function BlogDetailPage({ params }: { params: { id: string } }) {
  const blogId = params.id

  // サンプルデータ
  const blog = {
    id: blogId,
    title: `ライブチャット体験記 ${blogId}`,
    author: `ユーザー${blogId}`,
    content: `
      こんにちは、${`ユーザー${blogId}`}です。今回は私のライブチャット体験について詳しくお話ししたいと思います。
=======
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
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4

      ## 初めてのライブチャット体験

      最初は緊張していましたが、チャットレディの方がとても親切で、すぐにリラックスできました。
      会話も弾み、とても楽しい時間を過ごすことができました。

<<<<<<< HEAD
      ## 印象に残ったポイント

      1. **コミュニケーションの質**: チャットレディの方の対応が素晴らしく、自然な会話ができました。
      2. **サイトの使いやすさ**: インターフェースが分かりやすく、初心者でも簡単に利用できました。
      3. **料金体系**: 明確な料金設定で、安心して利用できました。

      ## 今後の利用について
=======
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
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4

      今回の体験がとても良かったので、また利用したいと思います。
      同じような体験を求めている方にもおすすめしたいです。

<<<<<<< HEAD
      皆さんも良いライブチャット体験ができることを願っています！
    `,
    likes: 25,
    comments: 8,
    createdAt: "3時間前",
    category: "おすすめ",
=======
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
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
  }

  const comments = [
    {
      id: 1,
      author: "コメントユーザー1",
      content: "とても参考になる体験記でした！私も同じサイトを利用してみたいと思います。",
      createdAt: "2時間前",
    },
    {
      id: 2,
      author: "コメントユーザー2",
      content: "詳しいレビューありがとうございます。料金体系について教えていただけませんか？",
      createdAt: "1時間前",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<<<<<<< HEAD
      <div className="space-y-8">
        {/* Blog Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm bg-pink-100 text-pink-800 px-3 py-1 rounded-full">{blog.category}</span>
              <span className="text-sm text-gray-500 flex items-center">
=======
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
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
                <Clock className="w-4 h-4 mr-1" />
                {blog.createdAt}
              </span>
            </div>
<<<<<<< HEAD
            <CardTitle className="text-2xl md:text-3xl">{blog.title}</CardTitle>
            <CardDescription className="flex items-center space-x-4">
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                投稿者: {blog.author}
              </span>
              <span className="flex items-center">
                <Heart className="w-4 h-4 mr-1 text-red-500" />
                {blog.likes} いいね
              </span>
              <span className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-1 text-blue-500" />
                {blog.comments} コメント
              </span>
            </CardDescription>
          </CardHeader>
        </Card>

        <AffiliateBanner size="large" position="content" />

        {/* Blog Content */}
        <Card>
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              {blog.content.split("\n").map((paragraph, index) => {
                if (paragraph.startsWith("## ")) {
                  return (
                    <h2 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-900">
                      {paragraph.replace("## ", "")}
                    </h2>
                  )
                } else if (paragraph.startsWith("1. ") || paragraph.startsWith("2. ") || paragraph.startsWith("3. ")) {
=======
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
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
                  return (
                    <div key={index} className="mb-2">
                      <p className="text-gray-700">{paragraph}</p>
                    </div>
                  )
                } else if (paragraph.trim()) {
                  return (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  )
                }
                return null
              })}
            </div>
          </CardContent>
        </Card>

        {/* Like Button */}
        <div className="text-center">
          <Button size="lg" className="bg-pink-600 hover:bg-pink-700">
            <Heart className="w-5 h-5 mr-2" />
            いいね ({blog.likes})
          </Button>
        </div>

        <AffiliateBanner size="medium" position="content" />

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              コメント ({blog.comments})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Existing Comments */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-pink-200 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{comment.author}</span>
                    <span className="text-sm text-gray-500">{comment.createdAt}</span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
<<<<<<< HEAD

            {/* Comment Form */}
            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">コメントを投稿</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="comment-author" className="block text-sm font-medium text-gray-700 mb-2">
                    ニックネーム
                  </label>
                  <Input id="comment-author" placeholder="あなたのニックネーム" className="w-full" />
                </div>
                <div>
                  <label htmlFor="comment-content" className="block text-sm font-medium text-gray-700 mb-2">
                    コメント
                  </label>
                  <Textarea
                    id="comment-content"
                    placeholder="コメントを入力してください..."
                    rows={4}
                    className="w-full"
                  />
                </div>
                <Button className="bg-pink-600 hover:bg-pink-700">コメントを投稿</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
=======
          )}
        </CardContent>
      </Card>
      {/* Comment Form */}
      <CommentForm
        postId={params.id as string}
        onCommentAdded={handleCommentAdded}
      />
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
    </div>
  )
}
