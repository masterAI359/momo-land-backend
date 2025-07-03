"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"

interface User {
  id: string
  nickname: string
  email: string
  registeredAt: Date
}

interface AuthContextType {
  user: User | null
  login: (nickname: string, email: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Simulated user database
const USERS_KEY = "momo_land_users"
const CURRENT_USER_KEY = "momo_land_current_user"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load current user from localStorage
    const savedUser = localStorage.getItem(CURRENT_USER_KEY)
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (nickname: string, email: string): Promise<{ success: boolean; error?: string }> => {
    // Get existing users
    const existingUsers = JSON.parse(localStorage.getItem(USERS_KEY) || "[]")

    // Check if nickname already exists
    const nicknameExists = existingUsers.some((u: User) => u.nickname.toLowerCase() === nickname.toLowerCase())

    if (nicknameExists) {
      return { success: false, error: "このニックネームは既に使用されています。別のニックネームを選択してください。" }
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      nickname,
      email,
      registeredAt: new Date(),
    }

    // Save to users list
    existingUsers.push(newUser)
    localStorage.setItem(USERS_KEY, JSON.stringify(existingUsers))

    // Set as current user
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser))
    setUser(newUser)

    return { success: true }
  }

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
