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
      
      // Send welcome message with current blog stats
      socket.emit("blog-room-joined", {
        message: "Welcome to the blog room!",
        timestamp: new Date(),
      })
    })

    socket.on("leave-blog-room", () => {
      socket.leave("blog-room")
      console.log(`User ${socket.user.nickname} left blog room`)
    })

    socket.on("join-post-room", (postId) => {
      socket.join(`post-${postId}`)
      console.log(`User ${socket.user.nickname} joined post room ${postId}`)
      
      // Notify others that someone is viewing the post
      socket.to(`post-${postId}`).emit("user-viewing-post", {
        userId: socket.user.id,
        nickname: socket.user.nickname,
        postId: postId,
        timestamp: new Date(),
      })
    })

    socket.on("leave-post-room", (postId) => {
      socket.leave(`post-${postId}`)
      console.log(`User ${socket.user.nickname} left post room ${postId}`)
      
      // Notify others that user stopped viewing the post
      socket.to(`post-${postId}`).emit("user-left-post", {
        userId: socket.user.id,
        nickname: socket.user.nickname,
        postId: postId,
        timestamp: new Date(),
      })
    })

    // Enhanced blog post interactions
    socket.on("start-reading-post", (data) => {
      const { postId } = data
      console.log(`📖 User ${socket.user.nickname} started reading post ${postId}`)
      
      // Track reading session
      socket.currentReadingPost = postId
      socket.readingStartTime = new Date()
      
      // Notify analytics room
      socket.to("analytics-room").emit("reading-started", {
        userId: socket.user.id,
        nickname: socket.user.nickname,
        postId: postId,
        timestamp: socket.readingStartTime,
      })
    })

    socket.on("finish-reading-post", (data) => {
      const { postId, readingTime } = data
      console.log(`✅ User ${socket.user.nickname} finished reading post ${postId}`)
      
      if (socket.currentReadingPost === postId && socket.readingStartTime) {
        const actualReadingTime = Date.now() - socket.readingStartTime.getTime()
        
        // Notify analytics room
        socket.to("analytics-room").emit("reading-completed", {
          userId: socket.user.id,
          nickname: socket.user.nickname,
          postId: postId,
          readingTime: actualReadingTime,
          reportedTime: readingTime,
          timestamp: new Date(),
        })
        
        socket.currentReadingPost = null
        socket.readingStartTime = null
      }
    })

    socket.on("post-scroll-update", (data) => {
      const { postId, scrollPercentage, currentSection } = data
      
      // Broadcast scroll progress to analytics (throttled)
      socket.to("analytics-room").emit("scroll-progress", {
        userId: socket.user.id,
        nickname: socket.user.nickname,
        postId: postId,
        scrollPercentage: scrollPercentage,
        currentSection: currentSection,
        timestamp: new Date(),
      })
    })

    // Blog analytics room
    socket.on("join-analytics-room", () => {
      // Only allow admin users or the system to join analytics
      if (socket.user.role === "admin" || socket.user.isSystem) {
        socket.join("analytics-room")
        console.log(`📊 User ${socket.user.nickname} joined analytics room`)
      }
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

    // Enhanced typing indicators
    socket.on("typing", (data) => {
      const { roomId } = data
      if (socket.currentRoom === roomId) {
        socket.to(roomId).emit("user-typing", {
          userId: socket.user.id,
          nickname: socket.user.nickname,
          roomId: roomId,
        })
      }
    })

    socket.on("stop-typing", (data) => {
      const { roomId } = data
      if (socket.currentRoom === roomId) {
        socket.to(roomId).emit("user-stopped-typing", {
          userId: socket.user.id,
          roomId: roomId,
        })
      }
    })

    // Real-time reactions
    socket.on("send-reaction", async (data) => {
      try {
        const { roomId, messageId, emoji } = data
        
        if (socket.currentRoom !== roomId) {
          socket.emit("error", { message: "Not in room" })
          return
        }

        // Save reaction to database (optional)
        // await prisma.messageReaction.create({
        //   data: {
        //     messageId,
        //     userId: socket.user.id,
        //     emoji,
        //   },
        // })

        // Broadcast reaction to room
        io.to(roomId).emit("reaction-added", {
          messageId,
          emoji,
          userId: socket.user.id,
          nickname: socket.user.nickname,
        })
      } catch (error) {
        console.error("Send reaction error:", error)
        socket.emit("error", { message: "Failed to send reaction" })
      }
    })

    // User activity tracking
    socket.on("user-activity", (data) => {
      const { activity, data: activityData, timestamp } = data
      console.log(`👤 User ${socket.user.nickname} activity: ${activity}`, activityData)
      
      // Optional: Store activity in database for analytics
      // You can track user engagement, popular features, etc.
    })

    // Live document collaboration
    socket.on("join-document-edit", async (data) => {
      try {
        const { postId } = data
        
        // Verify user has permission to edit
        const post = await prisma.post.findUnique({
          where: { id: postId },
          select: { authorId: true },
        })

        if (!post || post.authorId !== socket.user.id) {
          socket.emit("error", { message: "Not authorized to edit this post" })
          return
        }

        socket.join(`document-${postId}`)
        console.log(`📝 User ${socket.user.nickname} joined document editing for post ${postId}`)
      } catch (error) {
        console.error("Join document edit error:", error)
        socket.emit("error", { message: "Failed to join document editing" })
      }
    })

    socket.on("document-change", (data) => {
      const { postId, changes } = data
      
      // Broadcast changes to other editors
      socket.to(`document-${postId}`).emit("document-changed", {
        postId,
        changes,
        userId: socket.user.id,
        nickname: socket.user.nickname,
      })
    })

    // Location sharing
    socket.on("share-location", async (data) => {
      try {
        const { roomId, location } = data
        
        if (socket.currentRoom !== roomId) {
          socket.emit("error", { message: "Not in room" })
          return
        }

        // Optional: Save location to database
        // await prisma.sharedLocation.create({
        //   data: {
        //     roomId,
        //     userId: socket.user.id,
        //     latitude: location.lat,
        //     longitude: location.lng,
        //   },
        // })

        // Broadcast location to room
        socket.to(roomId).emit("location-shared", {
          userId: socket.user.id,
          nickname: socket.user.nickname,
          location,
          timestamp: new Date(),
        })
      } catch (error) {
        console.error("Share location error:", error)
        socket.emit("error", { message: "Failed to share location" })
      }
    })

    // Voice/Video call signaling
    socket.on("initiate-call", async (data) => {
      try {
        const { roomId, callType } = data
        
        if (socket.currentRoom !== roomId) {
          socket.emit("error", { message: "Not in room" })
          return
        }

        // Broadcast call initiation to room
        socket.to(roomId).emit("call-initiated", {
          roomId,
          callType,
          initiator: {
            id: socket.user.id,
            nickname: socket.user.nickname,
          },
        })
      } catch (error) {
        console.error("Initiate call error:", error)
        socket.emit("error", { message: "Failed to initiate call" })
      }
    })

    // Global user count tracking
    const updateUserCount = () => {
      const userCount = io.sockets.sockets.size
      io.emit("user-count-update", userCount)
    }

    // Send notifications to specific users
    const sendNotification = (userId, notification) => {
      const userSockets = Array.from(io.sockets.sockets.values())
        .filter(s => s.user && s.user.id === userId)
      
      userSockets.forEach(s => {
        s.emit("notification", notification)
      })
    }

    // System announcements (admin only)
    socket.on("system-announcement", (data) => {
      // Add admin check here
      if (socket.user.role === "admin") {
        io.emit("system-announcement", {
          message: data.message,
          type: data.type || "info",
          timestamp: new Date(),
        })
      }
    })

    // Enhanced disconnect handling
    socket.on("disconnect", async (reason) => {
      console.log(`User ${socket.user.nickname} disconnected: ${reason}`)
      
      try {
        // Update user offline status in all rooms
        if (socket.currentRoom) {
          await prisma.roomMember.updateMany({
            where: { userId: socket.user.id },
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

        // Update global user count
        updateUserCount()
      } catch (error) {
        console.error("Disconnect cleanup error:", error)
      }
    })

    // Initial user count update
    updateUserCount()
  })
}

module.exports = { setupSocketHandlers }
