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
import { Search, Edit, Trash2, Shield, UserCheck } from "lucide-react"

interface User {
  id: string
  nickname: string
  email: string
  role: string
  status: string
  bio?: string
  age?: number
  address?: string
  phone?: string
  createdAt: string
  _count: {
    posts: number
    comments: number
    chatMessages: number
  }
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast({
        title: "エラー",
        description: "ユーザー情報の取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  const updateUserStatus = async (userId: string, status: string, reason?: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason }),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "ユーザーステータスを更新しました",
        })
        fetchUsers()
      }
    } catch (error) {
      console.error("Failed to update user status:", error)
      toast({
        title: "エラー",
        description: "ステータス更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "ユーザー権限を更新しました",
        })
        fetchUsers()
      }
    } catch (error) {
      console.error("Failed to update user role:", error)
      toast({
        title: "エラー",
        description: "権限更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  const updateUserProfile = async (userId: string, profileData: any) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "プロフィールを更新しました",
        })
        setEditDialogOpen(false)
        fetchUsers()
      }
    } catch (error) {
      console.error("Failed to update user profile:", error)
      toast({
        title: "エラー",
        description: "プロフィール更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm("本当にこのユーザーを削除しますか？")) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "ユーザーを削除しました",
        })
        fetchUsers()
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast({
        title: "エラー",
        description: "ユーザー削除に失敗しました",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVE: "default",
      SUSPENDED: "secondary",
      BANNED: "destructive",
      PENDING: "outline",
    }
    return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status}</Badge>
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      SUPER_ADMIN: "destructive",
      ADMIN: "default",
      MODERATOR: "secondary",
      USER: "outline",
      GUEST: "outline",
    }
    return <Badge variant={variants[role as keyof typeof variants] || "outline"}>{role}</Badge>
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ユーザー管理</h1>
        <p className="text-gray-600 mt-2">ユーザーの管理、権限設定、プロフィール編集</p>
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
                  placeholder="ニックネームまたはメールで検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="権限" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての権限</SelectItem>
                <SelectItem value="SUPER_ADMIN">スーパー管理者</SelectItem>
                <SelectItem value="ADMIN">管理者</SelectItem>
                <SelectItem value="MODERATOR">モデレーター</SelectItem>
                <SelectItem value="USER">ユーザー</SelectItem>
                <SelectItem value="GUEST">ゲスト</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのステータス</SelectItem>
                <SelectItem value="ACTIVE">アクティブ</SelectItem>
                <SelectItem value="SUSPENDED">停止中</SelectItem>
                <SelectItem value="BANNED">禁止</SelectItem>
                <SelectItem value="PENDING">保留中</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>ユーザー一覧 ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ユーザー</th>
                  <th className="text-left p-2">権限</th>
                  <th className="text-left p-2">ステータス</th>
                  <th className="text-left p-2">統計</th>
                  <th className="text-left p-2">登録日</th>
                  <th className="text-left p-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{user.nickname}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="p-2">{getRoleBadge(user.role)}</td>
                    <td className="p-2">{getStatusBadge(user.status)}</td>
                    <td className="p-2">
                      <div className="text-sm">
                        <div>投稿: {user._count.posts}</div>
                        <div>コメント: {user._count.comments}</div>
                        <div>メッセージ: {user._count.chatMessages}</div>
                      </div>
                    </td>
                    <td className="p-2">{new Date(user.createdAt).toLocaleDateString("ja-JP")}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user)
                            setEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Select onValueChange={(value) => updateUserRole(user.id, value)}>
                          <SelectTrigger className="w-20">
                            <Shield className="h-4 w-4" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">ユーザー</SelectItem>
                            <SelectItem value="MODERATOR">モデレーター</SelectItem>
                            <SelectItem value="ADMIN">管理者</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select onValueChange={(value) => updateUserStatus(user.id, value)}>
                          <SelectTrigger className="w-20">
                            <UserCheck className="h-4 w-4" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">アクティブ</SelectItem>
                            <SelectItem value="SUSPENDED">停止</SelectItem>
                            <SelectItem value="BANNED">禁止</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="destructive" onClick={() => deleteUser(user.id)}>
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

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ユーザープロフィール編集</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const profileData = {
                  nickname: formData.get("nickname"),
                  bio: formData.get("bio"),
                  age: formData.get("age") ? Number.parseInt(formData.get("age") as string) : null,
                  address: formData.get("address"),
                  phone: formData.get("phone"),
                }
                updateUserProfile(selectedUser.id, profileData)
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nickname">ニックネーム</Label>
                  <Input id="nickname" name="nickname" defaultValue={selectedUser.nickname} required />
                </div>
                <div>
                  <Label htmlFor="age">年齢</Label>
                  <Input id="age" name="age" type="number" defaultValue={selectedUser.age || ""} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="bio">自己紹介</Label>
                  <Textarea id="bio" name="bio" defaultValue={selectedUser.bio || ""} rows={3} />
                </div>
                <div>
                  <Label htmlFor="address">住所</Label>
                  <Input id="address" name="address" defaultValue={selectedUser.address || ""} />
                </div>
                <div>
                  <Label htmlFor="phone">電話番号</Label>
                  <Input id="phone" name="phone" defaultValue={selectedUser.phone || ""} />
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
    </div>
  )
}
