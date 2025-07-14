"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Eye, Ban, Trash2, Flag, Shield } from "lucide-react"

interface ModerationItem {
  id: string
  type: "post" | "comment" | "message"
  content: string
  author: {
    id: string
    nickname: string
  }
  flaggedReason: string
  severity: number
  status: string
  createdAt: string
  autoFlagged: boolean
}

interface ModerationRule {
  id: string
  name: string
  pattern: string
  action: string
  targetType: string
  isActive: boolean
  severity: number
}

export default function AutoMonitoring() {
  const [flaggedItems, setFlaggedItems] = useState<ModerationItem[]>([])
  const [moderationRules, setModerationRules] = useState<ModerationRule[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"flagged" | "rules">("flagged")
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [flaggedRes, rulesRes] = await Promise.all([
        fetch("/api/admin/monitoring/flagged"),
        fetch("/api/admin/monitoring/rules"),
      ])

      if (flaggedRes.ok && rulesRes.ok) {
        const flaggedData = await flaggedRes.json()
        const rulesData = await rulesRes.json()
        setFlaggedItems(flaggedData.items)
        setModerationRules(rulesData.rules)
      }
    } catch (error) {
      console.error("Failed to fetch monitoring data:", error)
      toast({
        title: "エラー",
        description: "監視データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const takeAction = async (itemId: string, action: string, reason?: string) => {
    try {
      const response = await fetch(`/api/admin/monitoring/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, action, reason }),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "アクションを実行しました",
        })
        setActionDialogOpen(false)
        fetchData()
      }
    } catch (error) {
      console.error("Failed to take action:", error)
      toast({
        title: "エラー",
        description: "アクション実行に失敗しました",
        variant: "destructive",
      })
    }
  }

  const createRule = async (ruleData: any) => {
    try {
      const response = await fetch("/api/admin/monitoring/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ruleData),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "監視ルールを作成しました",
        })
        setRuleDialogOpen(false)
        fetchData()
      }
    } catch (error) {
      console.error("Failed to create rule:", error)
      toast({
        title: "エラー",
        description: "ルール作成に失敗しました",
        variant: "destructive",
      })
    }
  }

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/monitoring/rules/${ruleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "ルールを更新しました",
        })
        fetchData()
      }
    } catch (error) {
      console.error("Failed to toggle rule:", error)
      toast({
        title: "エラー",
        description: "ルール更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  const getSeverityBadge = (severity: number) => {
    const variants = {
      1: "outline",
      2: "secondary",
      3: "default",
      4: "destructive",
      5: "destructive",
    }
    const colors = {
      1: "低",
      2: "中",
      3: "高",
      4: "重大",
      5: "緊急",
    }
    return (
      <Badge variant={variants[severity as keyof typeof variants] || "outline"}>
        {colors[severity as keyof typeof colors] || "不明"}
      </Badge>
    )
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">自動監視システム</h1>
        <p className="text-gray-600 mt-2">不適切なコンテンツの自動検出と管理</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4">
        <Button variant={activeTab === "flagged" ? "default" : "outline"} onClick={() => setActiveTab("flagged")}>
          <Flag className="h-4 w-4 mr-2" />
          フラグ付きコンテンツ
        </Button>
        <Button variant={activeTab === "rules" ? "default" : "outline"} onClick={() => setActiveTab("rules")}>
          <Shield className="h-4 w-4 mr-2" />
          監視ルール
        </Button>
      </div>

      {/* Flagged Content Tab */}
      {activeTab === "flagged" && (
        <Card>
          <CardHeader>
            <CardTitle>フラグ付きコンテンツ ({flaggedItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">コンテンツ</th>
                    <th className="text-left p-2">作成者</th>
                    <th className="text-left p-2">タイプ</th>
                    <th className="text-left p-2">理由</th>
                    <th className="text-left p-2">重要度</th>
                    <th className="text-left p-2">検出方法</th>
                    <th className="text-left p-2">日時</th>
                    <th className="text-left p-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="max-w-xs truncate">{item.content}</div>
                      </td>
                      <td className="p-2">{item.author.nickname}</td>
                      <td className="p-2">
                        <Badge variant="outline">{item.type}</Badge>
                      </td>
                      <td className="p-2">{item.flaggedReason}</td>
                      <td className="p-2">{getSeverityBadge(item.severity)}</td>
                      <td className="p-2">
                        <Badge variant={item.autoFlagged ? "default" : "secondary"}>
                          {item.autoFlagged ? "自動" : "手動"}
                        </Badge>
                      </td>
                      <td className="p-2">{new Date(item.createdAt).toLocaleString("ja-JP")}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedItem(item)
                              setActionDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => takeAction(item.id, "block", "不適切なコンテンツ")}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => takeAction(item.id, "delete", "規約違反")}
                          >
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
      )}

      {/* Moderation Rules Tab */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">監視ルール</h2>
            <Button onClick={() => setRuleDialogOpen(true)}>
              <Shield className="h-4 w-4 mr-2" />
              新規ルール作成
            </Button>
          </div>

          <Card>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ルール名</th>
                      <th className="text-left p-2">パターン</th>
                      <th className="text-left p-2">対象</th>
                      <th className="text-left p-2">アクション</th>
                      <th className="text-left p-2">重要度</th>
                      <th className="text-left p-2">状態</th>
                      <th className="text-left p-2">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moderationRules.map((rule) => (
                      <tr key={rule.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{rule.name}</td>
                        <td className="p-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">{rule.pattern}</code>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">{rule.targetType}</Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant="secondary">{rule.action}</Badge>
                        </td>
                        <td className="p-2">{getSeverityBadge(rule.severity)}</td>
                        <td className="p-2">
                          <Badge variant={rule.isActive ? "default" : "secondary"}>
                            {rule.isActive ? "有効" : "無効"}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Button size="sm" variant="outline" onClick={() => toggleRule(rule.id, !rule.isActive)}>
                            {rule.isActive ? "無効化" : "有効化"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>コンテンツアクション</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <Label>コンテンツ</Label>
                <div className="p-3 bg-gray-100 rounded">{selectedItem.content}</div>
              </div>
              <div>
                <Label>作成者</Label>
                <div>{selectedItem.author.nickname}</div>
              </div>
              <div>
                <Label>フラグ理由</Label>
                <div>{selectedItem.flaggedReason}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => takeAction(selectedItem.id, "approve", "問題なし")}
                  className="flex-1"
                >
                  承認
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => takeAction(selectedItem.id, "block", "不適切")}
                  className="flex-1"
                >
                  ブロック
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => takeAction(selectedItem.id, "delete", "削除")}
                  className="flex-1"
                >
                  削除
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Rule Dialog */}
      <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新規監視ルール作成</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const ruleData = {
                name: formData.get("name"),
                pattern: formData.get("pattern"),
                action: formData.get("action"),
                targetType: formData.get("targetType"),
                severity: Number.parseInt(formData.get("severity") as string),
              }
              createRule(ruleData)
            }}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">ルール名</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="pattern">パターン（正規表現またはキーワード）</Label>
                <Input id="pattern" name="pattern" placeholder="例: (暴力|脅迫|詐欺)" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetType">対象タイプ</Label>
                  <Select name="targetType" defaultValue="post">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="post">投稿</SelectItem>
                      <SelectItem value="comment">コメント</SelectItem>
                      <SelectItem value="message">メッセージ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="action">アクション</Label>
                  <Select name="action" defaultValue="flag">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flag">フラグ付け</SelectItem>
                      <SelectItem value="block">自動ブロック</SelectItem>
                      <SelectItem value="delete">自動削除</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="severity">重要度 (1-5)</Label>
                <Select name="severity" defaultValue="3">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - 低</SelectItem>
                    <SelectItem value="2">2 - 中</SelectItem>
                    <SelectItem value="3">3 - 高</SelectItem>
                    <SelectItem value="4">4 - 重大</SelectItem>
                    <SelectItem value="5">5 - 緊急</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setRuleDialogOpen(false)}>
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
