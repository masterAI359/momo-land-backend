"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Crown, Edit, Star, Users, DollarSign, Eye } from "lucide-react"

interface FemaleProfile {
  id: string
  stageName: string
  realName?: string
  description?: string
  avatar?: string
  age?: number
  ranking?: number
  isActive: boolean
  isDebuted: boolean
  totalEarnings: number
  monthlyEarnings: number
  followerCount: number
  viewCount: number
  createdAt: string
}

export default function FemaleRanking() {
  const [profiles, setProfiles] = useState<FemaleProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProfile, setSelectedProfile] = useState<FemaleProfile | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const response = await fetch("/api/admin/female-profiles")
      if (response.ok) {
        const data = await response.json()
        setProfiles(data.profiles)
      }
    } catch (error) {
      console.error("Failed to fetch profiles:", error)
      toast({
        title: "エラー",
        description: "プロフィール情報の取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateRanking = async (profileId: string, newRanking: number) => {
    try {
      const response = await fetch(`/api/admin/female-profiles/${profileId}/ranking`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ranking: newRanking }),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "ランキングを更新しました",
        })
        fetchProfiles()
      }
    } catch (error) {
      console.error("Failed to update ranking:", error)
      toast({
        title: "エラー",
        description: "ランキング更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  const updateProfile = async (profileId: string, profileData: any) => {
    try {
      const response = await fetch(`/api/admin/female-profiles/${profileId}`, {
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
        fetchProfiles()
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast({
        title: "エラー",
        description: "プロフィール更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  const toggleStatus = async (profileId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/female-profiles/${profileId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "ステータスを更新しました",
        })
        fetchProfiles()
      }
    } catch (error) {
      console.error("Failed to update status:", error)
      toast({
        title: "エラー",
        description: "ステータス更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  const getRankingBadge = (ranking?: number) => {
    if (!ranking) return <Badge variant="outline">未設定</Badge>

    if (ranking <= 3) {
      return (
        <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-yellow-600">
          <Crown className="h-3 w-3 mr-1" />#{ranking}
        </Badge>
      )
    } else if (ranking <= 10) {
      return (
        <Badge variant="secondary" className="bg-gradient-to-r from-gray-400 to-gray-600 text-white">
          <Star className="h-3 w-3 mr-1" />#{ranking}
        </Badge>
      )
    } else {
      return <Badge variant="outline">#{ranking}</Badge>
    }
  }

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.stageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile.realName && profile.realName.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (loading) {
    return <div className="flex justify-center items-center h-64">読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">女性ランキング管理</h1>
        <p className="text-gray-600 mt-2">女性パフォーマーのランキングと詳細情報の管理</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Input
              placeholder="ステージ名または本名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredProfiles
          .filter((p) => p.ranking && p.ranking <= 3)
          .sort((a, b) => (a.ranking || 999) - (b.ranking || 999))
          .map((profile) => (
            <Card
              key={profile.id}
              className={`relative overflow-hidden border-2 ${
                profile.ranking === 1
                  ? "border-yellow-300 bg-gradient-to-b from-yellow-50 to-yellow-100"
                  : profile.ranking === 2
                    ? "border-gray-300 bg-gradient-to-b from-gray-50 to-gray-100"
                    : "border-amber-300 bg-gradient-to-b from-amber-50 to-amber-100"
              }`}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{profile.stageName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="flex items-center justify-center gap-2">
                  {getRankingBadge(profile.ranking)}
                  {profile.stageName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>月収:</span>
                    <span className="font-semibold">¥{profile.monthlyEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>フォロワー:</span>
                    <span>{profile.followerCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>閲覧数:</span>
                    <span>{profile.viewCount.toLocaleString()}</span>
                  </div>
                </div>
                <Button
                  className="w-full mt-4 bg-transparent"
                  variant="outline"
                  onClick={() => {
                    setSelectedProfile(profile)
                    setEditDialogOpen(true)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  編集
                </Button>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Full Ranking Table */}
      <Card>
        <CardHeader>
          <CardTitle>完全ランキング ({filteredProfiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ランク</th>
                  <th className="text-left p-2">プロフィール</th>
                  <th className="text-left p-2">ステータス</th>
                  <th className="text-left p-2">収益</th>
                  <th className="text-left p-2">統計</th>
                  <th className="text-left p-2">登録日</th>
                  <th className="text-left p-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles
                  .sort((a, b) => (a.ranking || 999) - (b.ranking || 999))
                  .map((profile) => (
                    <tr key={profile.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{getRankingBadge(profile.ranking)}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{profile.stageName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{profile.stageName}</div>
                            {profile.realName && <div className="text-sm text-gray-500">{profile.realName}</div>}
                            {profile.age && <div className="text-sm text-gray-500">{profile.age}歳</div>}
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="space-y-1">
                          <Badge variant={profile.isActive ? "default" : "secondary"}>
                            {profile.isActive ? "アクティブ" : "非アクティブ"}
                          </Badge>
                          <Badge variant={profile.isDebuted ? "default" : "outline"}>
                            {profile.isDebuted ? "デビュー済み" : "未デビュー"}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            月収: ¥{profile.monthlyEarnings.toLocaleString()}
                          </div>
                          <div className="text-gray-500">総収益: ¥{profile.totalEarnings.toLocaleString()}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {profile.followerCount.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {profile.viewCount.toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="p-2">{new Date(profile.createdAt).toLocaleDateString("ja-JP")}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProfile(profile)
                              setEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={profile.isActive ? "secondary" : "default"}
                            onClick={() => toggleStatus(profile.id, !profile.isActive)}
                          >
                            {profile.isActive ? "停止" : "有効化"}
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

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>プロフィール編集</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const profileData = {
                  stageName: formData.get("stageName"),
                  realName: formData.get("realName"),
                  description: formData.get("description"),
                  age: formData.get("age") ? Number.parseInt(formData.get("age") as string) : null,
                  ranking: formData.get("ranking") ? Number.parseInt(formData.get("ranking") as string) : null,
                  isActive: formData.get("isActive") === "on",
                  isDebuted: formData.get("isDebuted") === "on",
                }
                updateProfile(selectedProfile.id, profileData)
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stageName">ステージ名</Label>
                  <Input id="stageName" name="stageName" defaultValue={selectedProfile.stageName} required />
                </div>
                <div>
                  <Label htmlFor="realName">本名</Label>
                  <Input id="realName" name="realName" defaultValue={selectedProfile.realName || ""} />
                </div>
                <div>
                  <Label htmlFor="age">年齢</Label>
                  <Input id="age" name="age" type="number" defaultValue={selectedProfile.age || ""} />
                </div>
                <div>
                  <Label htmlFor="ranking">ランキング</Label>
                  <Input id="ranking" name="ranking" type="number" defaultValue={selectedProfile.ranking || ""} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">説明</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={selectedProfile.description || ""}
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="isActive" name="isActive" defaultChecked={selectedProfile.isActive} />
                  <Label htmlFor="isActive">アクティブ</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="isDebuted" name="isDebuted" defaultChecked={selectedProfile.isDebuted} />
                  <Label htmlFor="isDebuted">デビュー済み</Label>
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
