"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Download, Upload, Database, Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface BackupItem {
  id: string
  name: string
  size: string
  createdAt: string
  type: "full" | "incremental"
  status: "completed" | "in_progress" | "failed"
}

export default function BackupManagement() {
  const [backups, setBackups] = useState<BackupItem[]>([
    {
      id: "1",
      name: "full_backup_2024_01_15",
      size: "2.3 GB",
      createdAt: "2024-01-15T10:30:00Z",
      type: "full",
      status: "completed",
    },
    {
      id: "2",
      name: "incremental_backup_2024_01_14",
      size: "156 MB",
      createdAt: "2024-01-14T10:30:00Z",
      type: "incremental",
      status: "completed",
    },
  ])
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)
  const { toast } = useToast()

  const createBackup = async (type: "full" | "incremental") => {
    setIsCreatingBackup(true)
    setBackupProgress(0)

    try {
      const response = await fetch("/api/admin/backup/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })

      if (response.ok) {
        // Simulate progress
        const interval = setInterval(() => {
          setBackupProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval)
              setIsCreatingBackup(false)
              toast({
                title: "成功",
                description: "バックアップが完了しました",
              })
              // Refresh backup list
              fetchBackups()
              return 100
            }
            return prev + 10
          })
        }, 500)
      }
    } catch (error) {
      console.error("Failed to create backup:", error)
      toast({
        title: "エラー",
        description: "バックアップ作成に失敗しました",
        variant: "destructive",
      })
      setIsCreatingBackup(false)
    }
  }

  const fetchBackups = async () => {
    try {
      const response = await fetch("/api/admin/backup/list")
      if (response.ok) {
        const data = await response.json()
        setBackups(data.backups)
      }
    } catch (error) {
      console.error("Failed to fetch backups:", error)
    }
  }

  const downloadBackup = async (backupId: string) => {
    try {
      const response = await fetch(`/api/admin/backup/download/${backupId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `backup_${backupId}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "成功",
          description: "バックアップをダウンロードしました",
        })
      }
    } catch (error) {
      console.error("Failed to download backup:", error)
      toast({
        title: "エラー",
        description: "ダウンロードに失敗しました",
        variant: "destructive",
      })
    }
  }

  const restoreBackup = async (backupId: string) => {
    if (!confirm("本当にこのバックアップから復元しますか？現在のデータは上書きされます。")) return

    try {
      const response = await fetch(`/api/admin/backup/restore/${backupId}`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "バックアップから復元しました",
        })
      }
    } catch (error) {
      console.error("Failed to restore backup:", error)
      toast({
        title: "エラー",
        description: "復元に失敗しました",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      in_progress: "secondary",
      failed: "destructive",
    }
    const icons = {
      completed: <CheckCircle className="h-3 w-3 mr-1" />,
      in_progress: <Clock className="h-3 w-3 mr-1" />,
      failed: <AlertCircle className="h-3 w-3 mr-1" />,
    }
    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {icons[status as keyof typeof icons]}
        {status === "completed" ? "完了" : status === "in_progress" ? "進行中" : "失敗"}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    return <Badge variant={type === "full" ? "default" : "secondary"}>{type === "full" ? "フル" : "増分"}</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">バックアップ・データエクスポート</h1>
        <p className="text-gray-600 mt-2">システムデータのバックアップと復元管理</p>
      </div>

      {/* Backup Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              新規バックアップ作成
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={() => createBackup("full")} disabled={isCreatingBackup} className="flex-1">
                <Database className="h-4 w-4 mr-2" />
                フルバックアップ
              </Button>
              <Button
                onClick={() => createBackup("incremental")}
                disabled={isCreatingBackup}
                variant="outline"
                className="flex-1"
              >
                <Calendar className="h-4 w-4 mr-2" />
                増分バックアップ
              </Button>
            </div>
            {isCreatingBackup && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>進行状況</span>
                  <span>{backupProgress}%</span>
                </div>
                <Progress value={backupProgress} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              バックアップ統計
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">総バックアップ数:</span>
                <span className="font-semibold">{backups.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">最新バックアップ:</span>
                <span className="font-semibold">
                  {backups.length > 0 ? new Date(backups[0].createdAt).toLocaleDateString("ja-JP") : "なし"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">総サイズ:</span>
                <span className="font-semibold">2.5 GB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup List */}
      <Card>
        <CardHeader>
          <CardTitle>バックアップ履歴</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">名前</th>
                  <th className="text-left p-2">タイプ</th>
                  <th className="text-left p-2">サイズ</th>
                  <th className="text-left p-2">ステータス</th>
                  <th className="text-left p-2">作成日時</th>
                  <th className="text-left p-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((backup) => (
                  <tr key={backup.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{backup.name}</td>
                    <td className="p-2">{getTypeBadge(backup.type)}</td>
                    <td className="p-2">{backup.size}</td>
                    <td className="p-2">{getStatusBadge(backup.status)}</td>
                    <td className="p-2">{new Date(backup.createdAt).toLocaleString("ja-JP")}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadBackup(backup.id)}
                          disabled={backup.status !== "completed"}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => restoreBackup(backup.id)}
                          disabled={backup.status !== "completed"}
                        >
                          復元
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

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>データエクスポート</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <Database className="h-6 w-6 mb-2" />
              ユーザーデータ
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <Database className="h-6 w-6 mb-2" />
              投稿データ
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <Database className="h-6 w-6 mb-2" />
              チャットデータ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
