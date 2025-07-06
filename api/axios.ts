import axios from "axios"

// Build API URL ensuring it includes /api path
const getApiUrl = () => {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001"
  
  // If serverUrl already includes /api, use it as is
  if (serverUrl.includes('/api')) {
    return serverUrl
  }
  
  // Otherwise, append /api to the base URL
  return `${serverUrl}/api`
}

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
})

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    return config
  },
  (error) => {
    console.error("❌ API Request Error:", error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error("❌ API Response Error:", error)
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error("🚨 Backend server appears to be unreachable")
    }
    return Promise.reject(error)
  }
)

export default api