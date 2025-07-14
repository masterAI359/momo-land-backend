const express = require("express")
const cors = require("cors")
const path = require("path")
const { PrismaClient } = require("@prisma/client")
const cron = require("node-cron")

const app = express()
const prisma = new PrismaClient()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

// Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/posts", require("./routes/posts"))
app.use("/api/chat", require("./routes/chat"))
app.use("/api/reports", require("./routes/reports"))
app.use("/api/users", require("./routes/users"))
app.use("/api/admin", require("./routes/admin"))
app.use("/api/media", require("./routes/media"))
app.use("/api/emoji", require("./routes/emoji"))
app.use("/api/stories", require("./routes/stories"))

// Cleanup expired stories every hour
cron.schedule("0 * * * *", async () => {
  try {
    console.log("Running story cleanup...")

    const expiredStories = await prisma.story.findMany({
      where: {
        expiresAt: { lt: new Date() },
        isActive: true,
      },
    })

    // Delete media files
    const fs = require("fs").promises
    for (const story of expiredStories) {
      if (story.mediaUrl) {
        try {
          const filePath = path.join(__dirname, "../", story.mediaUrl)
          await fs.unlink(filePath)
        } catch (error) {
          console.error("Error deleting expired story media:", error)
        }
      }
    }

    // Mark stories as inactive
    await prisma.story.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    })

    console.log(`Cleaned up ${expiredStories.length} expired stories`)
  } catch (error) {
    console.error("Error in story cleanup cron job:", error)
  }
})

// Socket.io setup
const http = require("http")
const socketIo = require("socket.io")

const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

// Socket handlers
require("./socket/handlers")(io)

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully")
  await prisma.$disconnect()
  server.close(() => {
    console.log("Process terminated")
  })
})
