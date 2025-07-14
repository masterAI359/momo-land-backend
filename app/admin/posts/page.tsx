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
import { Search, Edit, Trash2, Check, X, Plus } from "lucide-react"

interface Post {
  id: string
  title: string
  content: string
  category: string
  status: string
  viewCount: number
  createdAt: string
  author: {
    id: string
    nickname: string
  }
  _count: {
    likes: number
    comments: number
  }
}

export default function PostsManagement() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [posts, searchTerm, statusFilter, categoryFilter])

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/admin/posts")
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error)
      toast({
        title: "エラー",
        description: "投稿情報の取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterPosts = () => {
    let filtered = posts

    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.author.nickname.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((post) => post.status === statusFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((post) => post.category === categoryFilter)
    }

    setFilteredPosts(filtered)
  }

  const updatePostStatus = async (postId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "投稿ステータスを更新しました",
        })
        fetchPosts()
      }
    } catch (error) {
      console.error("Failed to update post status:", error)
      toast({
        title: "エラー",
        description: "ステータス更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  const updatePost = async (postId: string, postData: any) => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "投稿を更新しました",
        })
        setEditDialogOpen(false)
        fetchPosts()
      }
    } catch (error) {
      console.error("Failed to update post:", error)
      toast({
        title: "エラー",
        description: "投稿更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  const createPost = async (postData: any) => {
    try {
      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "投稿を作成しました",
        })
        setCreateDialogOpen(false)
        fetchPosts()
      }
    } catch (error) {
      console.error("Failed to create post:", error)
      toast({
        title: "エラー",
        description: "投稿作成に失敗しました",
        variant: "destructive",
      })
    }
  }

  const deletePost = async (postId: string) => {
    if (!confirm("本当にこの投稿を削除しますか？")) return

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "投稿を削除しました",
        })
        fetchPosts()
      }
    } catch (error) {
      console.error("Failed to delete post:", error)
      toast({
        title: "エラー",
        description: "投稿削除に失敗しました",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PUBLISHED: "default",
      DRAFT: "secondary",
      BLOCKED: "destructive",
      PENDING_REVIEW: "outline",
    }
    return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status}</Badge>
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">投稿管理</h1>
          <p className="text-gray-600 mt-2">投稿の管理、承認、編集</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新規投稿
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
                  placeholder="タイトルまたは作者で検索..."
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
                <SelectItem value="PUBLISHED">公開済み</SelectItem>
                <SelectItem value="DRAFT">下書き</SelectItem>
                <SelectItem value="BLOCKED">ブロック済み</SelectItem>
                <SelectItem value="PENDING_REVIEW">承認待ち</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="カテゴリ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのカテゴリ</SelectItem>
                <SelectItem value="初心者向け">初心者向け</SelectItem>
                <SelectItem value="上級者向け">上級者向け</SelectItem>
                <SelectItem value="おすすめ">おすすめ</SelectItem>
                <SelectItem value="レビュー">レビュー</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>投稿一覧 ({filteredPosts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">タイトル</th>
                  <th className="text-left p-2">作者</th>
                  <th className="text-left p-2">カテゴリ</th>
                  <th className="text-left p-2">ステータス</th>
                  <th className="text-left p-2">統計</th>
                  <th className="text-left p-2">作成日</th>
                  <th className="text-left p-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="font-medium">{post.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{post.content.substring(0, 100)}...</div>
                    </td>
                    <td className="p-2">{post.author.nickname}</td>
                    <td className="p-2">
                      <Badge variant="outline">{post.category}</Badge>
                    </td>
                    <td className="p-2">{getStatusBadge(post.status)}</td>
                    <td className="p-2">
                      <div className="text-sm">
                        <div>閲覧: {post.viewCount}</div>
                        <div>いいね: {post._count.likes}</div>
                        <div>コメント: {post._count.comments}</div>
                      </div>
                    </td>
                    <td className="p-2">{new Date(post.createdAt).toLocaleDateString("ja-JP")}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPost(post)
                            setEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {post.status === "PENDING_REVIEW" && (
                          <>
                            <Button size="sm" variant="default" onClick={() => updatePostStatus(post.id, "PUBLISHED")}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updatePostStatus(post.id, "BLOCKED")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => deletePost(post.id)}>
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

      {/* Edit Post Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>投稿編集</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const postData = {
                  title: formData.get("title"),
                  content: formData.get("content"),
                  category: formData.get("category"),
                  status: formData.get("status"),
                }
                updatePost(selectedPost.id, postData)
              }}
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">タイトル</Label>
                  <Input id="title" name="title" defaultValue={selectedPost.title} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">カテゴリ</Label>
                    <Select name="category" defaultValue={selectedPost.category}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="初心者向け">初心者向け</SelectItem>
                        <SelectItem value="上級者向け">上級者向け</SelectItem>
                        <SelectItem value="おすすめ">おすすめ</SelectItem>
                        <SelectItem value="レビュー">レビュー</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">ステータス</Label>
                    <Select name="status" defaultValue={selectedPost.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLISHED">公開済み</SelectItem>
                        <SelectItem value="DRAFT">下書き</SelectItem>
                        <SelectItem value="BLOCKED">ブロック済み</SelectItem>
                        <SelectItem value="PENDING_REVIEW">承認待ち</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="content">内容</Label>
                  <Textarea id="content" name="content" defaultValue={selectedPost.content} rows={10} required />
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

      {/* Create Post Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>新規投稿作成</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const postData = {
                title: formData.get("title"),
                content: formData.get("content"),
                category: formData.get("category"),
                status: formData.get("status"),
              }
              createPost(postData)
            }}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">タイトル</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">カテゴリ</Label>
                  <Select name="category" defaultValue="初心者向け">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="初心者向け">初心者向け</SelectItem>
                      <SelectItem value="上級者向け">上級者向け</SelectItem>
                      <SelectItem value="おすすめ">おすすめ</SelectItem>
                      <SelectItem value="レビュー">レビュー</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">ステータス</Label>
                  <Select name="status" defaultValue="PUBLISHED">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLISHED">公開済み</SelectItem>
                      <SelectItem value="DRAFT">下書き</SelectItem>
                      <SelectItem value="PENDING_REVIEW">承認待ち</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="content">内容</Label>
                <Textarea id="content" name="content" rows={10} required />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                キャンセル
              </Button>
              <Button type="submit">作成</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
