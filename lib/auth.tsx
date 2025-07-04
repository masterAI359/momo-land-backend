"use client"

import api from "@/api/axios"
import React from "react"
import { useState, useEffect, createContext, useContext } from "react"

interface User {
  id: string
  email: string
  avatar: string
  nickname: string
  password: string
  isGuest: boolean
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>
  register: (nickname: string, email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    const response = await api.post("/auth/login", { email, password })
    const newUser = response.data.user

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser))
    setUser(newUser)

    return { success: true, user: newUser }
  }

  const register = async (nickname: string, email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    const response = await api.post("/auth/register", { nickname, email, password })
    const newUser = response.data.user

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser))
    setUser(newUser)

    return { success: true, user: newUser }
  }

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
