"use client"

import type React from "react"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { useRouter } from "next/navigation"
import LoginModal from "./login-modal"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description?: string
  href: string
  requiresAuth: boolean
  isButton?: boolean
  buttonClass?: string
}

export default function FeatureCard({
  icon,
  title,
  description,
  href,
  requiresAuth,
  isButton = false,
  buttonClass = "",
}: FeatureCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()

    if (requiresAuth && !user) {
      toast({
        title: "ログインが必要です",
        description: "この機能を利用するには、ユーザー登録・ログインが必要です。",
        variant: "destructive",
      })
      setShowLoginModal(true)
      return
    }

    router.push(href)
  }

  if (isButton) {
    return (
      <>
        <Button onClick={handleClick} className={buttonClass}>
          {icon}
          {title}
        </Button>
        <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </>
    )
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleClick}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {icon}
            <span>{title}</span>
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      </Card>
      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  )
}
