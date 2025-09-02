"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Loader2, Heart, MessageSquare, Eye, Calendar, Clock, Search, Filter } from "lucide-react"

// Enhanced Post Card Skeleton
export const PostCardSkeleton = ({ showAuthor = true }: { showAuthor?: boolean }) => (
  <Card className="overflow-hidden animate-pulse">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        {showAuthor && (
          <div className="flex items-center space-x-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        )}
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </CardContent>
  </Card>
)

// Loading Grid for Posts
export const PostGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {[...Array(count)].map((_, i) => (
      <PostCardSkeleton key={i} />
    ))}
  </div>
)

// Comment Loading Skeleton
export const CommentSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="pt-6">
      <div className="flex items-start space-x-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      </div>
    </CardContent>
  </Card>
)

// Form Loading Skeleton
export const FormSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader>
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="flex justify-end space-x-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </CardContent>
  </Card>
)

// Loading Spinner Component
export const LoadingSpinner = ({ 
  size = "default", 
  text = "読み込み中...", 
  showText = true 
}: { 
  size?: "sm" | "default" | "lg"
  text?: string
  showText?: boolean 
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8"
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {showText && <span className="text-sm text-gray-500">{text}</span>}
    </div>
  )
}

// Loading Button Component
export const LoadingButton = ({ 
  children, 
  loading = false, 
  loadingText = "処理中...", 
  ...props 
}: { 
  children: React.ReactNode
  loading?: boolean
  loadingText?: string
  [key: string]: any
}) => (
  <Button disabled={loading} {...props}>
    {loading ? (
      <>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        {loadingText}
      </>
    ) : (
      children
    )}
  </Button>
)

// Progress Loading Component
export const ProgressLoading = ({ 
  progress = 0, 
  text = "読み込み中...", 
  showPercentage = true 
}: { 
  progress?: number
  text?: string
  showPercentage?: boolean
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{text}</span>
      {showPercentage && (
        <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
      )}
    </div>
    <Progress value={progress} className="h-2" />
  </div>
)

// Chat Loading Skeleton
export const ChatLoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-start space-x-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    ))}
  </div>
)

// Search Loading Skeleton
export const SearchLoadingSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader className="pb-4">
      <div className="flex items-center space-x-2">
        <Skeleton className="w-5 h-5" />
        <Skeleton className="h-6 w-32" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    </CardContent>
  </Card>
)

// Stats Loading Skeleton
export const StatsLoadingSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader>
      <Skeleton className="h-6 w-24" />
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-12" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

// Enhanced Empty State Component
export const EnhancedEmptyState = ({ 
  icon: Icon = MessageSquare, 
  title = "データがありません", 
  description = "まだデータがありません。",
  action,
  actionText = "アクション"
}: { 
  icon?: React.ElementType
  title?: string
  description?: string
  action?: () => void
  actionText?: string
}) => (
  <div className="text-center py-16">
    <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6">{description}</p>
    {action && (
      <Button onClick={action} className="bg-pink-600 hover:bg-pink-700">
        {actionText}
      </Button>
    )}
  </div>
)

// Loading Overlay Component
export const LoadingOverlay = ({ 
  loading = false, 
  text = "読み込み中...", 
  children 
}: { 
  loading?: boolean
  text?: string
  children: React.ReactNode
}) => (
  <div className="relative">
    {children}
    {loading && (
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <LoadingSpinner text={text} />
      </div>
    )}
  </div>
)

// Timeline Loading Skeleton
export const TimelineLoadingSkeleton = () => (
  <div className="space-y-6">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="relative">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <Skeleton className="w-3 h-3 rounded-full" />
            {i < 2 && <div className="absolute left-1/2 top-3 w-0.5 h-16 bg-gray-200 transform -translate-x-1/2" />}
          </div>
          <div className="flex-1">
            <Card className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    ))}
  </div>
)

// Error State Component
export const ErrorState = ({ 
  title = "エラーが発生しました", 
  description = "データの読み込みに失敗しました。", 
  onRetry,
  retryText = "再試行"
}: { 
  title?: string
  description?: string
  onRetry?: () => void
  retryText?: string
}) => (
  <div className="text-center py-16">
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6">{description}</p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline">
        {retryText}
      </Button>
    )}
  </div>
) 