'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import api from '@/api/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, Shield, Users, Key, Settings, CheckCircle, XCircle, AlertTriangle, Search, Plus, Trash } from 'lucide-react'
import { format } from 'date-fns'

// Types
interface Role {
  name: string
  displayName: string
  userCount: number
  description: string
  defaultPermissions: Permission[]
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
  createdAt: string
  updatedAt: string
}

interface User {
  id: string
  nickname: string
  email: string
  role: string
  isActive: boolean
  isBlocked: boolean
  isSuspended: boolean
  createdAt: string
  permissions: UserPermission[]
}

interface UserPermission {
  id: string
  name: string
  description: string
  category: string
  grantedAt: string
  expiresAt?: string
}

interface AuditLog {
  id: string
  action: string
  targetType: string
  targetId: string
  details: any
  createdAt: string
  moderator: {
    id: string
    nickname: string
  }
}

interface GroupedPermissions {
  [category: string]: Permission[]
}

export default function PermissionsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('roles')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Data states
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<GroupedPermissions>({})
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [auditLoading, setAuditLoading] = useState(false)

  // Filter states
  const [userSearch, setUserSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [permissionFilter, setPermissionFilter] = useState('')

  // Modal states
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
  const [isUserPermissionModalOpen, setIsUserPermissionModalOpen] = useState(false)

  // Form states
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Bulk operations
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  
  // Import/Export
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importData, setImportData] = useState('')
  
  // Real-time updates
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  // API calls
  const fetchRoles = async () => {
    try {
      const response = await api.get('/admin/roles')
      setRoles(response.data.roles)
    } catch (err: any) {
      console.error('Error fetching roles:', err)
      setError(err.response?.data?.error || 'ロールの取得に失敗しました')
    }
  }

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/admin/permissions')
      setPermissions(response.data.permissions)
    } catch (err: any) {
      console.error('Error fetching permissions:', err)
      setError(err.response?.data?.error || '権限の取得に失敗しました')
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users?limit=100')
      setUsers(response.data.users)
    } catch (err: any) {
      console.error('Error fetching users:', err)
      setError(err.response?.data?.error || 'ユーザーの取得に失敗しました')
    }
  }

  const fetchAuditLogs = async () => {
    try {
      setAuditLoading(true)
      const response = await api.get('/admin/audit-logs?category=permissions&limit=50')
      setAuditLogs(response.data.logs || [])
    } catch (err: any) {
      console.error('Error fetching audit logs:', err)
      // Handle different error types gracefully
      if (err.response?.status === 404) {
        console.warn('Audit logs endpoint not available')
        setAuditLogs([]) // Set empty array for 404
      } else if (err.response?.status === 403) {
        console.warn('Insufficient permissions for audit logs')
        setAuditLogs([])
      } else {
        // For other errors, still don't set main error as audit logs are not critical
        setAuditLogs([])
      }
    } finally {
      setAuditLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      const response = await api.patch(`/admin/users/${userId}/role`, { role: newRole })
      
      // Update users list
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))
      
      setIsRoleModalOpen(false)
      setSelectedUser(null)
      
      // Show success message
      setSuccess('ユーザーロールが正常に更新されました')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Error updating user role:', err)
      setError(err.response?.data?.error || 'ユーザーロールの更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateUserPermissions = async (userId: string, permissionUpdates: { permissionId: string; action: 'grant' | 'revoke' }[]) => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      const response = await api.post(`/admin/users/${userId}/permissions/bulk`, { 
        permissions: permissionUpdates 
      })
      
      // Update users list
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, permissions: response.data.user.permissions } : user
      ))
      
      setIsUserPermissionModalOpen(false)
      setSelectedUser(null)
      setSelectedPermissions([])
      
      // Show success message
      setSuccess('ユーザー権限が正常に更新されました')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Error updating user permissions:', err)
      setError(err.response?.data?.error || 'ユーザー権限の更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        await Promise.all([
          fetchRoles(),
          fetchPermissions(),
          fetchUsers()
        ])
      } catch (err) {
        setError('データの読み込みに失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Load audit logs when audit tab is selected
  useEffect(() => {
    if (activeTab === 'audit' && auditLogs.length === 0) {
      fetchAuditLogs()
    }
  }, [activeTab])

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(async () => {
        try {
          await Promise.all([
            fetchRoles(),
            fetchPermissions(),
            fetchUsers()
          ])
          if (activeTab === 'audit') {
            await fetchAuditLogs()
          }
        } catch (err) {
          console.error('Auto-refresh failed:', err)
        }
      }, 30000) // Refresh every 30 seconds

      setRefreshInterval(interval)
      
      return () => {
        if (interval) {
          clearInterval(interval)
        }
      }
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval)
        setRefreshInterval(null)
      }
    }
  }, [autoRefresh, activeTab])

  // Filter functions
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nickname.toLowerCase().includes(userSearch.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearch.toLowerCase())
    const matchesRole = !roleFilter || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const filteredPermissions = Object.entries(permissions).reduce((acc, [category, perms]) => {
    if (!permissionFilter || category === permissionFilter) {
      acc[category] = perms
    }
    return acc
  }, {} as GroupedPermissions)

  // Helper functions
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800'
      case 'ADMIN': return 'bg-blue-100 text-blue-800'
      case 'MODERATOR': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'user_management': return 'bg-blue-100 text-blue-800'
      case 'content_management': return 'bg-green-100 text-green-800'
      case 'system_management': return 'bg-purple-100 text-purple-800'
      case 'reports_management': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'user_management': return 'ユーザー管理'
      case 'content_management': return 'コンテンツ管理'
      case 'system_management': return 'システム管理'
      case 'reports_management': return 'レポート管理'
      default: return category
    }
  }

  const handleRoleChange = (userId: string, newRole: string) => {
    const userToUpdate = users.find(u => u.id === userId)
    if (userToUpdate) {
      setSelectedUser(userToUpdate)
      setSelectedRole(newRole)
      setIsRoleModalOpen(true)
    }
  }

  const handlePermissionChange = (userId: string) => {
    const userToUpdate = users.find(u => u.id === userId)
    if (userToUpdate) {
      setSelectedUser(userToUpdate)
      setSelectedPermissions(userToUpdate.permissions.map(p => p.id))
      setIsUserPermissionModalOpen(true)
    }
  }

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const handleSubmitPermissions = () => {
    if (!selectedUser) return

    const currentPermissionIds = selectedUser.permissions.map(p => p.id)
    const permissionUpdates: { permissionId: string; action: 'grant' | 'revoke' }[] = []

    // Find permissions to grant
    selectedPermissions.forEach(permissionId => {
      if (!currentPermissionIds.includes(permissionId)) {
        permissionUpdates.push({ permissionId, action: 'grant' })
      }
    })

    // Find permissions to revoke
    currentPermissionIds.forEach(permissionId => {
      if (!selectedPermissions.includes(permissionId)) {
        permissionUpdates.push({ permissionId, action: 'revoke' })
      }
    })

    if (permissionUpdates.length > 0) {
      updateUserPermissions(selectedUser.id, permissionUpdates)
    } else {
      setIsUserPermissionModalOpen(false)
    }
  }

  // Bulk operation handlers
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id))
    }
  }

  const handleBulkRoleUpdate = async (newRole: string) => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Update each selected user
      await Promise.all(
        selectedUsers.map(userId => 
          api.patch(`/admin/users/${userId}/role`, { role: newRole })
        )
      )

      // Update users list
      setUsers(prev => prev.map(user => 
        selectedUsers.includes(user.id) ? { ...user, role: newRole } : user
      ))

      setSelectedUsers([])
      setShowBulkActions(false)
      setSuccess(`${selectedUsers.length}人のユーザーロールが正常に更新されました`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Error updating user roles:', err)
      setError(err.response?.data?.error || 'ユーザーロールの一括更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Export/Import functions
  const exportPermissionTemplate = () => {
    const template = {
      exportDate: new Date().toISOString(),
      roles: roles.map(role => ({
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        permissions: role.defaultPermissions.map(p => ({
          name: p.name,
          category: p.category
        }))
      })),
      permissions: Object.entries(permissions).reduce((acc, [category, perms]) => {
        acc[category] = perms.map(p => ({
          name: p.name,
          description: p.description
        }))
        return acc
      }, {} as any)
    }

    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `permission-template-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setSuccess('権限テンプレートをエクスポートしました')
    setTimeout(() => setSuccess(null), 3000)
  }

  const importPermissionTemplate = async () => {
    try {
      setIsSubmitting(true)
      const template = JSON.parse(importData)
      
      // Validate template structure
      if (!template.roles || !template.permissions) {
        throw new Error('無効なテンプレート形式です')
      }

      // Here you would implement the import logic
      // For now, just show success message
      setImportData('')
      setIsImportModalOpen(false)
      setSuccess('権限テンプレートをインポートしました（デモ）')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError('テンプレートのインポートに失敗しました: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-16 mb-2" />
                      <div className="flex flex-wrap gap-1">
                        {[...Array(3)].map((_, j) => (
                          <Skeleton key={j} className="h-5 w-16" />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ロール・権限管理</h1>
            <p className="mt-2 text-gray-600">
              ユーザーのロールと権限を管理します
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto-refresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="auto-refresh" className="text-sm text-gray-600">
                自動更新 (30秒)
              </label>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                setIsLoading(true)
                setError(null)
                try {
                  await Promise.all([
                    fetchRoles(),
                    fetchPermissions(),
                    fetchUsers()
                  ])
                } catch (err) {
                  setError('データの読み込みに失敗しました')
                } finally {
                  setIsLoading(false)
                }
              }}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              更新
            </Button>
          </div>
        </div>
        
        {error && (
          <Alert className="mt-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mt-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roles">ロール管理</TabsTrigger>
          <TabsTrigger value="permissions">権限一覧</TabsTrigger>
          <TabsTrigger value="users">ユーザー権限</TabsTrigger>
          <TabsTrigger value="audit">監査ログ</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>ロール統計</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportPermissionTemplate}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    エクスポート
                  </Button>
                  <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsImportModalOpen(true)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      インポート
                    </Button>
                  </Dialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {users.filter(u => u.role === 'USER').length}
                  </div>
                  <div className="text-sm text-gray-600">一般ユーザー</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.role === 'MODERATOR').length}
                  </div>
                  <div className="text-sm text-gray-600">モデレーター</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {users.filter(u => u.role === 'ADMIN').length}
                  </div>
                  <div className="text-sm text-gray-600">管理者</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {users.filter(u => u.role === 'SUPER_ADMIN').length}
                  </div>
                  <div className="text-sm text-gray-600">スーパー管理者</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((role) => (
              <Card key={role.name} className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{role.displayName}</CardTitle>
                    <Badge className={getRoleColor(role.name)}>
                      {role.name}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">{role.description}</p>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">{role.userCount} ユーザー</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">デフォルト権限:</div>
                      <div className="space-y-1">
                        {role.defaultPermissions.slice(0, 3).map((permission) => (
                          <Badge key={permission.id} variant="outline" className="text-xs">
                            {permission.name}
                          </Badge>
                        ))}
                        {role.defaultPermissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.defaultPermissions.length - 3} 他
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>権限統計</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.values(permissions).flat().length}
                  </div>
                  <div className="text-sm text-gray-600">総権限数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.keys(permissions).length}
                  </div>
                  <div className="text-sm text-gray-600">カテゴリー数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {users.reduce((total, user) => total + user.permissions.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">付与済み権限</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {users.filter(u => u.permissions.length > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">権限保有ユーザー</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>権限フィルター</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label htmlFor="permission-filter">カテゴリーフィルター</Label>
                  <Select value={permissionFilter || "all"} onValueChange={(value) => setPermissionFilter(value === "all" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="全てのカテゴリー" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全てのカテゴリー</SelectItem>
                      {Object.keys(permissions).map(category => (
                        <SelectItem key={category} value={category}>
                          {getCategoryName(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={() => setPermissionFilter('')}>
                    リセット
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6">
            {Object.entries(filteredPermissions).map(([category, perms]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Badge className={getCategoryColor(category)}>
                      {getCategoryName(category)}
                    </Badge>
                    <span className="text-sm text-gray-500">({perms.length} 権限)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {perms.map((permission) => (
                      <div key={permission.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{permission.name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {permission.description}
                            </div>
                          </div>
                          <Key className="w-4 h-4 text-gray-400 mt-0.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ユーザーフィルター</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="user-search">ユーザー検索</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="user-search"
                      placeholder="ニックネーム、メールで検索"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="role-filter">ロールフィルター</Label>
                  <Select value={roleFilter || "all"} onValueChange={(value) => setRoleFilter(value === "all" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="全てのロール" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全てのロール</SelectItem>
                      {roles.map(role => (
                        <SelectItem key={role.name} value={role.name}>
                          {role.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={() => {
                    setUserSearch('')
                    setRoleFilter('')
                  }}>
                    リセット
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ユーザー権限管理</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedUsers.length > 0 && (
                <Card className="mb-4 border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-blue-800">
                          {selectedUsers.length}人のユーザーが選択されています
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUsers([])}
                          className="text-blue-600 border-blue-300"
                        >
                          選択解除
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-blue-700">一括ロール変更:</span>
                        {roles.map(role => (
                          <Button
                            key={role.name}
                            variant="outline"
                            size="sm"
                            onClick={() => handleBulkRoleUpdate(role.name)}
                            disabled={isSubmitting}
                            className="text-blue-600 border-blue-300"
                          >
                            {role.displayName}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">
                        <Checkbox
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onCheckedChange={handleSelectAllUsers}
                        />
                      </th>
                      <th className="text-left p-3">ユーザー</th>
                      <th className="text-left p-3">ロール</th>
                      <th className="text-left p-3">権限数</th>
                      <th className="text-left p-3">ステータス</th>
                      <th className="text-left p-3">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => handleSelectUser(user.id)}
                          />
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{user.nickname}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={getRoleColor(user.role)}>
                            {roles.find(r => r.name === user.role)?.displayName || user.role}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <Key className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{user.permissions.length}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            {user.isActive ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-sm">
                              {user.isBlocked ? 'ブロック' : user.isSuspended ? '停止' : 'アクティブ'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            {user.role !== 'SUPER_ADMIN' && (
                              <Select
                                value={user.role}
                                onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {roles.map(role => (
                                    <SelectItem key={role.name} value={role.name}>
                                      {role.displayName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePermissionChange(user.id)}
                            >
                              権限編集
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
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>権限変更監査ログ</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchAuditLogs}
                  disabled={auditLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${auditLoading ? 'animate-spin' : ''}`} />
                  更新
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <Skeleton className="h-4 w-4" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>監査ログがありません</p>
                  <p className="text-sm mt-2">権限に関する変更履歴が表示されます</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-4 p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-shrink-0 mt-1">
                        {log.action === 'role_updated' && <Shield className="w-4 h-4 text-blue-500" />}
                        {log.action === 'permission_granted' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {log.action === 'permission_revoked' && <XCircle className="w-4 h-4 text-red-500" />}
                        {log.action === 'permissions_bulk_updated' && <Users className="w-4 h-4 text-purple-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {log.action === 'role_updated' && 'ロール変更'}
                            {log.action === 'permission_granted' && '権限付与'}
                            {log.action === 'permission_revoked' && '権限取消'}
                            {log.action === 'permissions_bulk_updated' && '権限一括更新'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(log.createdAt), 'yyyy年MM月dd日 HH:mm')}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          実行者: {log.moderator.nickname}
                        </p>
                        {log.details && (
                          <div className="mt-2 text-xs text-gray-500">
                            {log.action === 'role_updated' && log.details.targetUser && (
                              <span>
                                ユーザー「{log.details.targetUser}」のロールを 
                                {log.details.previousRole} → {log.details.newRole} に変更
                              </span>
                            )}
                            {log.action === 'permission_granted' && (
                              <span>
                                ユーザー「{log.details.grantedTo}」に権限「{log.details.permissionName}」を付与
                              </span>
                            )}
                            {log.action === 'permission_revoked' && (
                              <span>
                                ユーザー「{log.details.revokedFrom}」から権限「{log.details.permissionName}」を取消
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role Change Confirmation Modal */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ロール変更の確認</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div className="text-sm">
                  <div className="font-medium text-yellow-800">ロール変更の確認</div>
                  <div className="text-yellow-700 mt-1">
                    ユーザー「{selectedUser?.nickname}」のロールを変更しますか？
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">現在のロール:</span>
                <Badge className={getRoleColor(selectedUser?.role || '')}>
                  {roles.find(r => r.name === selectedUser?.role)?.displayName}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">新しいロール:</span>
                <Badge className={getRoleColor(selectedRole)}>
                  {roles.find(r => r.name === selectedRole)?.displayName}
                </Badge>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>
                キャンセル
              </Button>
              <Button 
                onClick={() => selectedUser && updateUserRole(selectedUser.id, selectedRole)}
                disabled={isSubmitting}
              >
                {isSubmitting ? '更新中...' : '変更する'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Permissions Modal */}
      <Dialog open={isUserPermissionModalOpen} onOpenChange={setIsUserPermissionModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>ユーザー権限管理</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <div className="text-sm">
                  <div className="font-medium text-blue-800">
                    ユーザー: {selectedUser?.nickname}
                  </div>
                  <div className="text-blue-700 mt-1">
                    ロール: {roles.find(r => r.name === selectedUser?.role)?.displayName}
                  </div>
                </div>
              </div>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-4">
                {Object.entries(permissions).map(([category, perms]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3 flex items-center space-x-2">
                      <Badge className={getCategoryColor(category)}>
                        {getCategoryName(category)}
                      </Badge>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {perms.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                          />
                          <label 
                            htmlFor={permission.id} 
                            className="text-sm font-medium cursor-pointer flex-1"
                          >
                            {permission.name}
                          </label>
                          <div className="text-xs text-gray-500 max-w-32 truncate">
                            {permission.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsUserPermissionModalOpen(false)}
              >
                キャンセル
              </Button>
              <Button 
                onClick={handleSubmitPermissions}
                disabled={isSubmitting}
              >
                {isSubmitting ? '更新中...' : '権限を更新'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Permission Template Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>権限テンプレートのインポート</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div className="text-sm">
                  <div className="font-medium text-yellow-800">注意</div>
                  <div className="text-yellow-700 mt-1">
                    インポートすると既存の権限設定が上書きされる可能性があります。
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="import-data">テンプレートJSON</Label>
              <Textarea
                id="import-data"
                placeholder="権限テンプレートのJSONデータを貼り付けてください..."
                value={importData}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setImportData(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsImportModalOpen(false)
                  setImportData('')
                }}
              >
                キャンセル
              </Button>
              <Button 
                onClick={importPermissionTemplate}
                disabled={isSubmitting || !importData.trim()}
              >
                {isSubmitting ? 'インポート中...' : 'インポート'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 