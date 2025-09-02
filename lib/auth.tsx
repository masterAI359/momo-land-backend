"use client"

import api from "@/api/axios"
import socketService from "@/lib/socket"
import React from "react"
import { useState, useEffect, createContext, useContext } from "react"

interface User {
  id: string
  email: string
  avatar?: string
  nickname: string
  password?: string
  isGuest: boolean
  role: "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN"
  isActive: boolean
  isBlocked: boolean
  isSuspended: boolean
  suspendedUntil?: Date | null
  createdAt: Date
  // Enhanced profile fields
  fullName?: string
  bio?: string
  age?: number
  location?: string
  phone?: string
  website?: string
  gender?: string
  occupation?: string
  interests?: string[]
  lastLoginAt?: Date
  lastActiveAt?: Date
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
    const token = localStorage.getItem("token")
    
    if (savedUser && token) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      // Connect to WebSocket with token
      console.log("🔗 Connecting to WebSocket from auth context")
      socketService.connect(token)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const response = await api.post("/auth/login", { email, password })
      const newUser = response.data.user
      const token = response.data.token
      localStorage.setItem("token", token)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser))
      setUser(newUser)
      
      // Connect to WebSocket after login
      console.log("🔗 Connecting to WebSocket after login")
      socketService.connect(token)

      return { success: true, user: newUser }
    } catch (error: any) {
      console.error("Login error:", error)
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || "Network error occurred" 
      }
    }
  }

  const register = async (nickname: string, email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      console.log("nickname =================", nickname)
      console.log("email =================", email)
      console.log("password =================", password)
      const response = await api.post("/auth/register", { nickname, email, password })
      
      if (response.data.user) {
        const newUser = response.data.user
        const token = response.data.token
        localStorage.setItem("token", token)
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser))
        setUser(newUser)
        
        // Connect to WebSocket after registration
        console.log("🔗 Connecting to WebSocket after registration")
        socketService.connect(token)
        
        return { success: true, user: newUser }
      }
      return { success: false, error: response.data.error || "Registration failed" }
    } catch (error: any) {
      console.error("Registration error:", error)
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || "Network error occurred" 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY)
    localStorage.removeItem("token")
    setUser(null)
    
    // Disconnect from WebSocket on logout
    socketService.disconnect()
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
