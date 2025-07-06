const jwt = require("jsonwebtoken")
const prisma = require("../config/database")

const authenticateSocket = async (socket, next) => {
  try {
    console.log("🔐 WebSocket authentication attempt")
    const token = socket.handshake.auth.token
    console.log("Token received:", token ? "Token present" : "No token")
    
    if (!token) {
      console.log("❌ No token provided")
      return next(new Error("Authentication error"))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log("✅ Token decoded successfully, userId:", decoded.userId)
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        nickname: true,
        email: true,
      },
    })

    if (!user) {
      console.log("❌ User not found in database")
      return next(new Error("User not found"))
    }

    console.log("✅ User authenticated:", user.nickname)
    socket.user = user
    next()
  } catch (error) {
    console.log("❌ Authentication error:", error.message)
    next(new Error("Authentication error"))
  }
}

const setupSocketHandlers = (io) => {
  io.use(authenticateSocket)

  io.on("connection", (socket) => {
    console.log(`🚀 User ${socket.user.nickname} connected to WebSocket`)

    // Blog post real-time events
    socket.on("join-blog-room", () => {
      socket.join("blog-room")
      console.log(`📢 User ${socket.user.nickname} joined blog room`)
    })

    socket.on("leave-blog-room", () => {
      socket.leave("blog-room")
      console.log(`User ${socket.user.nickname} left blog room`)
    })

    socket.on("join-post-room", (postId) => {
      socket.join(`post-${postId}`)
      console.log(`User ${socket.user.nickname} joined post room ${postId}`)
    })

    socket.on("leave-post-room", (postId) => {
      socket.leave(`post-${postId}`)
      console.log(`User ${socket.user.nickname} left post room ${postId}`)
    })

    // Join room
    socket.on("join-room", async (roomId) => {
      try {
        // Verify room exists and user has access
        const room = await prisma.chatRoom.findUnique({
          where: { id: roomId },
        })

        if (!room) {
          socket.emit("error", { message: "Room not found" })
          return
        }

        // Join socket room
        socket.join(roomId)
        socket.currentRoom = roomId

        // Update user online status
        await prisma.roomMember.upsert({
          where: {
            roomId_userId: {
              roomId: roomId,
              userId: socket.user.id,
            },
          },
          update: {
            isOnline: true,
            lastSeen: new Date(),
          },
          create: {
            roomId: roomId,
            userId: socket.user.id,
            isOnline: true,
          },
        })

        // Notify room of user joining
        socket.to(roomId).emit("user-joined", {
          user: socket.user,
          timestamp: new Date(),
        })

        // Send room info to user
        const roomInfo = await prisma.chatRoom.findUnique({
          where: { id: roomId },
          include: {
            members: {
              where: { isOnline: true },
              include: {
                user: {
                  select: {
                    id: true,
                    nickname: true,
                  },
                },
              },
            },
          },
        })

        socket.emit("room-joined", {
          room: roomInfo,
          onlineUsers: roomInfo.members.map((m) => m.user),
        })
      } catch (error) {
        console.error("Join room error:", error)
        socket.emit("error", { message: "Failed to join room" })
      }
    })

    // Send message
    socket.on("send-message", async (data) => {
      try {
        const { roomId, content } = data

        if (!socket.currentRoom || socket.currentRoom !== roomId) {
          socket.emit("error", { message: "Not in room" })
          return
        }

        // Save message to database
        const message = await prisma.chatMessage.create({
          data: {
            content,
            type: "message",
            roomId,
            userId: socket.user.id,
          },
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        })

        // Update room's updatedAt
        await prisma.chatRoom.update({
          where: { id: roomId },
          data: { updatedAt: new Date() },
        })

        // Broadcast message to room
        io.to(roomId).emit("new-message", message)
      } catch (error) {
        console.error("Send message error:", error)
        socket.emit("error", { message: "Failed to send message" })
      }
    })

    // Leave room
    socket.on("leave-room", async (roomId) => {
      try {
        socket.leave(roomId)

        if (socket.currentRoom === roomId) {
          socket.currentRoom = null
        }

        // Update user offline status
        await prisma.roomMember.update({
          where: {
            roomId_userId: {
              roomId: roomId,
              userId: socket.user.id,
            },
          },
          data: {
            isOnline: false,
            lastSeen: new Date(),
          },
        })

        // Notify room of user leaving
        socket.to(roomId).emit("user-left", {
          user: socket.user,
          timestamp: new Date(),
        })
      } catch (error) {
        console.error("Leave room error:", error)
      }
    })

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log(`User ${socket.user.nickname} disconnected`)

      try {
        if (socket.currentRoom) {
          // Update user offline status
          await prisma.roomMember.updateMany({
            where: {
              userId: socket.user.id,
              isOnline: true,
            },
            data: {
              isOnline: false,
              lastSeen: new Date(),
            },
          })

          // Notify room of user leaving
          socket.to(socket.currentRoom).emit("user-left", {
            user: socket.user,
            timestamp: new Date(),
          })
        }
      } catch (error) {
        console.error("Disconnect error:", error)
      }
    })
  })
}

module.exports = { setupSocketHandlers }
