"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, AlertCircle, Mail, Lock, UserPlus, LogIn } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { LoadingButton } from "@/components/ui/loading-states"
import { useRouter } from "next/navigation"

interface LoginModalProps {
  open: boolean
  onClose: () => void
}

const registerSchema = z.object({
  nickname: z
    .string()
    .min(2, "ニックネームは2文字以上で入力してください")
    .max(50, "ニックネームは50文字以下で入力してください"),
  email: z
    .string()
    .email("正しいメールアドレスを入力してください"),
  password: z
    .string()
    .min(6, "パスワードは6文字以上で入力してください")
    .optional()
    .or(z.literal("")),
  confirmPassword: z
    .string()
    .optional()
    .or(z.literal("")),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false
  }
  return true
}, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
})

const loginSchema = z.object({
  email: z
    .string()
    .email("正しいメールアドレスを入力してください"),
  password: z
    .string()
    .min(1, "パスワードを入力してください")
    .optional()
    .or(z.literal("")),
})

type RegisterFormData = z.infer<typeof registerSchema>
type LoginFormData = z.infer<typeof loginSchema>

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [error, setError] = useState("")
  const { login, register } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nickname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const handleRegister = async (data: RegisterFormData) => {
    try {
      setError("")
      const result = await register(data.nickname, data.email, data.password || "")
      
      if (result.success && result.user) {
        toast({
          title: "登録完了",
          description: "ユーザー登録が完了しました。",
        })
        
        onClose()
        
        // Check if user is admin and redirect to admin dashboard
        if (result.user.role && ["ADMIN", "MODERATOR", "SUPER_ADMIN"].includes(result.user.role)) {
          toast({
            title: "管理者ページへリダイレクト",
            description: "管理者ダッシュボードに移動します。",
          })
          router.push("/admin")
        }
      } else {
        setError(result.error || "登録に失敗しました")
      }
    } catch (error: any) {
      setError(error.message || "登録に失敗しました")
    }
  }

  const handleLogin = async (data: LoginFormData) => {
    try {
      setError("")
      const result = await login(data.email, data.password || "")
      
      if (result.success && result.user) {
        toast({
          title: "ログイン成功",
          description: "ログインしました。",
        })
        
        onClose()
        
        // Check if user is admin and redirect to admin dashboard
        if (result.user.role && ["ADMIN", "MODERATOR", "SUPER_ADMIN"].includes(result.user.role)) {
          toast({
            title: "管理者ページへリダイレクト",
            description: "管理者ダッシュボードに移動します。",
          })
          router.push("/admin")
        }
      } else {
        setError(result.error || "ログインに失敗しました")
      }
    } catch (error: any) {
      setError(error.message || "ログインに失敗しました")
    }
  }

  const handleClose = () => {
    setError("")
    registerForm.reset()
    loginForm.reset()
    setActiveTab("login")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">momoLand</DialogTitle>
          <DialogDescription className="text-center">
            ログインまたは新規登録してください
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              ログイン
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              新規登録
            </TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="login" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">ログイン</CardTitle>
                <CardDescription>
                  メールアドレスとパスワードでログインしてください
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>メールアドレス</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input 
                                placeholder="email@example.com" 
                                className="pl-10"
                                type="email"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>パスワード</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input 
                                placeholder="パスワード（任意）" 
                                className="pl-10"
                                type="password"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            パスワードなしでもゲストとしてログインできます
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <LoadingButton 
                      type="submit" 
                      className="w-full bg-pink-600 hover:bg-pink-700"
                      loading={loginForm.formState.isSubmitting}
                      loadingText="ログイン中..."
                    >
                      ログイン
                    </LoadingButton>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">新規登録</CardTitle>
                <CardDescription>
                  アカウントを作成してmomoLandを始めましょう
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="nickname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ニックネーム</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input 
                                placeholder="ニックネーム" 
                                className="pl-10"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            投稿やコメントで表示される名前です
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>メールアドレス</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input 
                                placeholder="email@example.com" 
                                className="pl-10"
                                type="email"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            トラブル報告時の連絡用です
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>パスワード</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input 
                                placeholder="パスワード（任意）" 
                                className="pl-10"
                                type="password"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            パスワードなしでもゲストとして利用できます
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {registerForm.watch("password") && (
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>パスワード確認</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input 
                                  placeholder="パスワード確認" 
                                  className="pl-10"
                                  type="password"
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <LoadingButton 
                      type="submit" 
                      className="w-full bg-pink-600 hover:bg-pink-700"
                      loading={registerForm.formState.isSubmitting}
                      loadingText="登録中..."
                    >
                      アカウント作成
                    </LoadingButton>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
