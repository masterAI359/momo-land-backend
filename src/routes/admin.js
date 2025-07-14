const express = require("express")
const { body, validationResult, query } = require("express-validator")
const prisma = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Middleware to check admin permissions
const requireAdmin = (req, res, next) => {
  if (!req.user || !["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(req.user.role)) {
    return res.status(403).json({ error: "Admin access required" })
  }
  next()
}

// Dashboard stats
router.get("/dashboard/stats", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalPosts,
      pendingPosts,
      totalMessages,
      blockedMessages,
      totalReports,
      pendingReports,
      onlineUsers,
      activeRooms,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.post.count(),
      prisma.post.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.chatMessage.count(),
      prisma.chatMessage.count({ where: { status: "BLOCKED" } }),
      prisma.report.count(),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.roomMember.count({ where: { isOnline: true } }),
      prisma.chatRoom.count({ where: { status: "ACTIVE" } }),
    ])

    res.json({
      totalUsers,
      activeUsers,
      totalPosts,
      pendingPosts,
      totalMessages,
      blockedMessages,
      totalReports,
      pendingReports,
      onlineUsers,
      activeRooms,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    res.status(500).json({ error: "Failed to fetch dashboard stats" })
  }
})

// Recent activity
router.get("/dashboard/activity", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const activities = await prisma.adminAction.findMany({
      include: {
        admin: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    const formattedActivities = activities.map((activity) => ({
      id: activity.id,
      type: activity.action,
      description: `${activity.admin.nickname} が ${activity.action} を実行しました`,
      timestamp: activity.createdAt.toLocaleString("ja-JP"),
      status: "completed",
    }))

    res.json({ activities: formattedActivities })
  } catch (error) {
    console.error("Activity fetch error:", error)
    res.status(500).json({ error: "Failed to fetch activities" })
  }
})

// Users management
router.get("/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            posts: true,
            comments: true,
            chatMessages: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    res.json({ users })
  } catch (error) {
    console.error("Users fetch error:", error)
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

// Update user status
router.put("/users/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { status, reason } = req.body

    await prisma.user.update({
      where: { id },
      data: { status },
    })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        action: `update_user_status_${status}`,
        targetType: "user",
        targetId: id,
        reason,
        adminId: req.user.id,
      },
    })

    res.json({ message: "User status updated successfully" })
  } catch (error) {
    console.error("User status update error:", error)
    res.status(500).json({ error: "Failed to update user status" })
  }
})

// Mute user
router.put("/users/:id/mute", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { duration, reason } = req.body

    const muteUntil = duration ? new Date(Date.now() + duration * 60 * 1000) : null

    await prisma.user.update({
      where: { id },
      data: {
        isMuted: true,
        muteUntil,
      },
    })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        action: "mute_user",
        targetType: "user",
        targetId: id,
        reason,
        metadata: { duration },
        adminId: req.user.id,
      },
    })

    res.json({ message: "User muted successfully" })
  } catch (error) {
    console.error("User mute error:", error)
    res.status(500).json({ error: "Failed to mute user" })
  }
})

// Block user
router.put("/users/:id/block", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    await prisma.user.update({
      where: { id },
      data: { isBlocked: true },
    })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        action: "block_user",
        targetType: "user",
        targetId: id,
        reason,
        adminId: req.user.id,
      },
    })

    res.json({ message: "User blocked successfully" })
  } catch (error) {
    console.error("User block error:", error)
    res.status(500).json({ error: "Failed to block user" })
  }
})

// Force account change
router.put("/users/:id/force-change", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { newNickname, reason } = req.body

    await prisma.user.update({
      where: { id },
      data: { nickname: newNickname },
    })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        action: "force_account_change",
        targetType: "user",
        targetId: id,
        reason,
        metadata: { newNickname },
        adminId: req.user.id,
      },
    })

    res.json({ message: "Account changed successfully" })
  } catch (error) {
    console.error("Force account change error:", error)
    res.status(500).json({ error: "Failed to change account" })
  }
})

// Update user role
router.put("/users/:id/role", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body

    // Only SUPER_ADMIN can assign ADMIN or SUPER_ADMIN roles
    if (["ADMIN", "SUPER_ADMIN"].includes(role) && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Insufficient permissions" })
    }

    await prisma.user.update({
      where: { id },
      data: { role },
    })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        action: `update_user_role_${role}`,
        targetType: "user",
        targetId: id,
        adminId: req.user.id,
      },
    })

    res.json({ message: "User role updated successfully" })
  } catch (error) {
    console.error("User role update error:", error)
    res.status(500).json({ error: "Failed to update user role" })
  }
})

// Update user profile
router.put("/users/:id/profile", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { nickname, bio, age, address, phone } = req.body

    await prisma.user.update({
      where: { id },
      data: {
        nickname,
        bio,
        age,
        address,
        phone,
      },
    })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        action: "update_user_profile",
        targetType: "user",
        targetId: id,
        adminId: req.user.id,
      },
    })

    res.json({ message: "User profile updated successfully" })
  } catch (error) {
    console.error("User profile update error:", error)
    res.status(500).json({ error: "Failed to update user profile" })
  }
})

// Delete user
router.delete("/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    // Cannot delete other admins unless you're SUPER_ADMIN
    const targetUser = await prisma.user.findUnique({ where: { id } })
    if (targetUser && ["ADMIN", "SUPER_ADMIN"].includes(targetUser.role) && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Cannot delete admin users" })
    }

    await prisma.user.delete({ where: { id } })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        action: "delete_user",
        targetType: "user",
        targetId: id,
        adminId: req.user.id,
      },
    })

    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("User delete error:", error)
    res.status(500).json({ error: "Failed to delete user" })
  }
})

// Posts management
router.get("/posts", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    res.json({ posts })
  } catch (error) {
    console.error("Posts fetch error:", error)
    res.status(500).json({ error: "Failed to fetch posts" })
  }
})

// Update post status
router.put("/posts/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    await prisma.post.update({
      where: { id },
      data: { status },
    })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        action: `update_post_status_${status}`,
        targetType: "post",
        targetId: id,
        adminId: req.user.id,
      },
    })

    res.json({ message: "Post status updated successfully" })
  } catch (error) {
    console.error("Post status update error:", error)
    res.status(500).json({ error: "Failed to update post status" })
  }
})

// Update post
router.put("/posts/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { title, content, category, status, isBlurred } = req.body

    await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        category,
        status,
        isBlurred,
        excerpt: content.substring(0, 200) + "...",
      },
    })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        action: "update_post",
        targetType: "post",
        targetId: id,
        adminId: req.user.id,
      },
    })

    res.json({ message: "Post updated successfully" })
  } catch (error) {
    console.error("Post update error:", error)
    res.status(500).json({ error: "Failed to update post" })
  }
})

// Create post
router.post("/posts", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, content, category, status } = req.body

    const post = await prisma.post.create({
      data: {
        title,
        content,
        category,
        status,
        excerpt: content.substring(0, 200) + "...",
        authorId: req.user.id,
      },
    })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        action: "create_post",
        targetType: "post",
        targetId: post.id,
        adminId: req.user.id,
      },
    })

    res.status(201).json({ message: "Post created successfully", post })
  } catch (error) {
    console.error("Post create error:", error)
    res.status(500).json({ error: "Failed to create post" })
  }
})

// Delete post
router.delete("/posts/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    await prisma.post.delete({ where: { id } })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        action: "delete_post",
        targetType: "post",
        targetId: id,
        adminId: req.user.id,
      },
    })

    res.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Post delete error:", error)
    res.status(500).json({ error: "Failed to delete post" })
  }
})

// Comments management
router.get("/comments", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
    })

    res.json({ comments })
  } catch (error) {
    console.error("Comments fetch error:", error)
    res.status(500).json({ error: "Failed to fetch comments" })
  }
})

// Update comment status
router.put("/comments/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    await prisma.comment.update({
      where: { id },
      data: { status },
    })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        action: `update_comment_status_${status}`,
        targetType: "comment",
        targetId: id,
        adminId: req.user.id,
      },
    })

    res.json({ message: "Comment status updated successfully" })
  } catch (error) {
    console.error("Comment status update error:", error)
    res.status(500).json({ error: "Failed to update comment status" })
  }
})

// Delete comment
router.delete("/comments/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    await prisma.comment.delete({ where: { id } })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        action: "delete_comment",
        targetType: "comment",
        targetId: id,
        adminId: req.user.id,
      },
    })

    res.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Comment delete error:", error)
    res.status(500).json({ error: "Failed to delete comment" })
  }
})

// Chat rooms management
router.get("/chat/rooms", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rooms = await prisma.chatRoom.findMany({
      include: {
        creator: {
          select: {
            id: true,
            nickname: true,
          },
        },
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
        members: {
          where: { isOnline: true },
          select: {
            user: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const roomsWithStats = rooms.map((room) => ({
      ...room,
      participantCount: room._count.members,
      onlineCount: room.members.length,
      messageCount: room._count.messages,
      _count: undefined,
      members: undefined,
    }))

    res.json({ rooms: roomsWithStats })
  } catch (error) {
    console.error("Chat rooms fetch error:", error)
    res.status(500).json({ error: "Failed to fetch chat rooms" })
  }
})

// Chat messages management
router.get("/chat/messages", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 1000, // Limit to recent messages
    })

    res.json({ messages })
  } catch (error) {
    console.error("Chat messages fetch error:", error)
    res.status(500).json({ error: "Failed to fetch chat messages" })
  }
})

// Update room status
router.put("/chat/rooms/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    await prisma.chatRoom.update({
      where: { id },
      data: { status },
    })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        action: `update_room_status_${status}`,
        targetType: "chat_room",
        targetId: id,
        adminId: req.user.id,
      },
    })

    res.json({ message: "Room status updated successfully" })
  } catch (error) {
    console.error("Room status update error:", error)
    res.status(500).json({ error: "Failed to update room status" })
  }
})

// Update room settings
router.put("/chat/rooms/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, atmosphere, maxMembers, requiredRole, status } = req.body

    await prisma.chatRoom.update({
      where: { id },
      data: {
        name,
        description,
        atmosphere,
        maxMembers,
        requiredRole,
        status,
      },
    })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        action: "update_room_settings",
        targetType: "chat_room",
        targetId: id,
        adminId: req.user.id,
      },
    })

    res.json({ message: "Room settings updated successfully" })
  } catch (error) {
    console.error("Room settings update error:", error)
    res.status(500).json({ error: "Failed to update room settings" })
  }
})

// Force close room
router.put("/chat/rooms/:id/force-close", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    await prisma.chatRoom.update({
      where: { id },
      data: {
        status: "CLOSED",
        isForced: true,
      },
    })

    // Remove all members
    await prisma.roomMember.updateMany({
      where: { roomId: id },
      data: { isOnline: false },
    })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        action: "force_close_room",
        targetType: "chat_room",
        targetId: id,
        reason,
        adminId: req.user.id,
      },
    })

    res.json({ message: "Room force closed successfully" })
  } catch (error) {
    console.error("Force close room error:", error)
    res.status(500).json({ error: "Failed to force close room" })
  }
})

// Ban user from room
router.post("/chat/rooms/:roomId/ban/:userId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { roomId, userId } = req.params
    const { reason, duration } = req.body

    const expiresAt = duration ? new Date(Date.now() + duration * 60 * 1000) : null

    await prisma.roomBan.create({
      data: {
        roomId,
        userId,
        reason,
        expiresAt,
        bannedBy: req.user.id,
      },
    })

    // Remove user from room
    await prisma.roomMember.updateMany({
      where: { roomId, userId },
      data: { isOnline: false },
    })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        action: "ban_user_from_room",
        targetType: "chat_room",
        targetId: roomId,
        reason,
        metadata: { userId, duration },
        adminId: req.user.id,
      },
    })

    res.json({ message: "User banned from room successfully" })
  } catch (error) {
    console.error("Ban user from room error:", error)
    res.status(500).json({ error: "Failed to ban user from room" })
  }
})

// Delete room
router.delete("/chat/rooms/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    await prisma.chatRoom.delete({ where: { id } })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        action: "delete_room",
        targetType: "chat_room",
        targetId: id,
        adminId: req.user.id,
      },
    })

    res.json({ message: "Room deleted successfully" })
  } catch (error) {
    console.error("Room delete error:", error)
    res.status(500).json({ error: "Failed to delete room" })
  }
})

// Update message status
router.put("/chat/messages/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    await prisma.chatMessage.update({
      where: { id },
      data: { status },
    })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        action: `update_message_status_${status}`,
        targetType: "chat_message",
        targetId: id,
        adminId: req.user.id,
      },
    })

    res.json({ message: "Message status updated successfully" })
  } catch (error) {
    console.error("Message status update error:", error)
    res.status(500).json({ error: "Failed to update message status" })
  }
})

// Delete message
router.delete("/chat/messages/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    await prisma.chatMessage.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedBy: req.user.id,
        deletedAt: new Date(),
      },
    })

    // Log admin action
    await prisma.adminAction.create({
      data: {
        action: "delete_message",
        targetType: "chat_message",
        targetId: id,
        adminId: req.user.id,
      },
    })

    res.json({ message: "Message deleted successfully" })
  } catch (error) {
    console.error("Message delete error:", error)
    res.status(500).json({ error: "Failed to delete message" })
  }
})

// Auto-moderation endpoints
router.get("/monitoring/flagged", authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get flagged content (posts, comments, messages)
    const [flaggedPosts, flaggedComments, flaggedMessages] = await Promise.all([
      prisma.post.findMany({
        where: { status: "FLAGGED" },
        include: {
          author: { select: { id: true, nickname: true } },
        },
      }),
      prisma.comment.findMany({
        where: { status: "FLAGGED" },
        include: {
          author: { select: { id: true, nickname: true } },
        },
      }),
      prisma.chatMessage.findMany({
        where: { status: "FLAGGED" },
        include: {
          user: { select: { id: true, nickname: true } },
        },
      }),
    ])

    const items = [
      ...flaggedPosts.map((post) => ({
        id: post.id,
        type: "post",
        content: post.content,
        author: post.author,
        flaggedReason: "Inappropriate content detected",
        severity: 3,
        status: post.status,
        createdAt: post.createdAt,
        autoFlagged: true,
      })),
      ...flaggedComments.map((comment) => ({
        id: comment.id,
        type: "comment",
        content: comment.content,
        author: comment.author,
        flaggedReason: "Inappropriate content detected",
        severity: 2,
        status: comment.status,
        createdAt: comment.createdAt,
        autoFlagged: true,
      })),
      ...flaggedMessages.map((message) => ({
        id: message.id,
        type: "message",
        content: message.content,
        author: message.user,
        flaggedReason: "Inappropriate content detected",
        severity: 1,
        status: message.status,
        createdAt: message.createdAt,
        autoFlagged: true,
      })),
    ]

    res.json({ items })
  } catch (error) {
    console.error("Flagged content fetch error:", error)
    res.status(500).json({ error: "Failed to fetch flagged content" })
  }
})

router.get("/monitoring/rules", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rules = await prisma.autoModerationRule.findMany({
      orderBy: { createdAt: "desc" },
    })

    res.json({ rules })
  } catch (error) {
    console.error("Moderation rules fetch error:", error)
    res.status(500).json({ error: "Failed to fetch moderation rules" })
  }
})

router.post("/monitoring/action", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { itemId, action, reason } = req.body

    // Log admin action
    await prisma.adminAction.create({
      data: {
        action: `moderation_${action}`,
        targetType: "content",
        targetId: itemId,
        reason,
        adminId: req.user.id,
      },
    })

    res.json({ message: "Action taken successfully" })
  } catch (error) {
    console.error("Moderation action error:", error)
    res.status(500).json({ error: "Failed to take action" })
  }
})

router.post("/monitoring/rules", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, pattern, action, targetType, severity } = req.body

    const rule = await prisma.autoModerationRule.create({
      data: {
        name,
        pattern,
        action,
        targetType,
        severity,
      },
    })

    res.status(201).json({ message: "Rule created successfully", rule })
  } catch (error) {
    console.error("Create rule error:", error)
    res.status(500).json({ error: "Failed to create rule" })
  }
})

router.put("/monitoring/rules/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    await prisma.autoModerationRule.update({
      where: { id },
      data: { isActive },
    })

    res.json({ message: "Rule updated successfully" })
  } catch (error) {
    console.error("Update rule error:", error)
    res.status(500).json({ error: "Failed to update rule" })
  }
})

// Analytics endpoints
router.get("/analytics", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { range = "30d" } = req.query
    const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Generate sample analytics data
    const userGrowth = Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      return {
        date: date.toISOString().split("T")[0],
        users: Math.floor(Math.random() * 100) + 500 + i * 2,
        activeUsers: Math.floor(Math.random() * 50) + 200 + i,
      }
    })

    const contentStats = Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      return {
        date: date.toISOString().split("T")[0],
        posts: Math.floor(Math.random() * 20) + 10,
        comments: Math.floor(Math.random() * 50) + 25,
        messages: Math.floor(Math.random() * 200) + 100,
      }
    })

    const revenueData = Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      return {
        date: date.toISOString().split("T")[0],
        revenue: Math.floor(Math.random() * 10000) + 5000,
        femaleEarnings: Math.floor(Math.random() * 8000) + 4000,
      }
    })

    const userDistribution = [
      { role: "USER", count: 450, color: "#8884d8" },
      { role: "MODERATOR", count: 25, color: "#82ca9d" },
      { role: "ADMIN", count: 5, color: "#ffc658" },
      { role: "GUEST", count: 120, color: "#ff7300" },
    ]

    const topPerformers = [
      { id: "1", name: "ユーザー1", earnings: 150000, followers: 1200 },
      { id: "2", name: "ユーザー2", earnings: 120000, followers: 980 },
      { id: "3", name: "ユーザー3", earnings: 95000, followers: 850 },
      { id: "4", name: "ユーザー4", earnings: 80000, followers: 720 },
      { id: "5", name: "ユーザー5", earnings: 65000, followers: 650 },
    ]

    res.json({
      userGrowth,
      contentStats,
      revenueData,
      userDistribution,
      topPerformers,
    })
  } catch (error) {
    console.error("Analytics fetch error:", error)
    res.status(500).json({ error: "Failed to fetch analytics" })
  }
})

router.get("/analytics/export", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { format, range } = req.query

    // Generate export data based on format
    if (format === "csv") {
      const csvData = "Date,Users,Posts,Revenue\n2024-01-01,500,10,5000\n2024-01-02,502,12,5200"
      res.setHeader("Content-Type", "text/csv")
      res.setHeader("Content-Disposition", `attachment; filename=analytics_${range}.csv`)
      res.send(csvData)
    } else if (format === "xlsx") {
      // For demo purposes, send a simple response
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
      res.setHeader("Content-Disposition", `attachment; filename=analytics_${range}.xlsx`)
      res.send("Excel data would be here")
    }
  } catch (error) {
    console.error("Export error:", error)
    res.status(500).json({ error: "Failed to export data" })
  }
})

// Female profiles management
router.get("/female-profiles", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const profiles = await prisma.femaleProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            fanCommunity: true,
          },
        },
      },
      orderBy: { ranking: "asc" },
    })

    const profilesWithStats = profiles.map((profile) => ({
      ...profile,
      followerCount: Math.floor(Math.random() * 5000) + 100,
      viewCount: Math.floor(Math.random() * 50000) + 1000,
      createdAt: profile.user.createdAt,
    }))

    res.json({ profiles: profilesWithStats })
  } catch (error) {
    console.error("Female profiles fetch error:", error)
    res.status(500).json({ error: "Failed to fetch female profiles" })
  }
})

router.put("/female-profiles/:id/ranking", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { ranking } = req.body

    await prisma.femaleProfile.update({
      where: { id },
      data: { ranking },
    })

    res.json({ message: "Ranking updated successfully" })
  } catch (error) {
    console.error("Ranking update error:", error)
    res.status(500).json({ error: "Failed to update ranking" })
  }
})

router.put("/female-profiles/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { stageName, realName, description, age, ranking, isActive, isDebuted } = req.body

    await prisma.femaleProfile.update({
      where: { id },
      data: {
        stageName,
        realName,
        description,
        age,
        ranking,
        isActive,
        isDebuted,
      },
    })

    res.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Profile update error:", error)
    res.status(500).json({ error: "Failed to update profile" })
  }
})

router.put("/female-profiles/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    await prisma.femaleProfile.update({
      where: { id },
      data: { isActive },
    })

    res.json({ message: "Status updated successfully" })
  } catch (error) {
    console.error("Status update error:", error)
    res.status(500).json({ error: "Failed to update status" })
  }
})

// Backup management
router.post("/backup/create", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type } = req.body

    // Simulate backup creation
    setTimeout(() => {
      console.log(`${type} backup created successfully`)
    }, 5000)

    res.json({ message: "Backup creation started" })
  } catch (error) {
    console.error("Backup creation error:", error)
    res.status(500).json({ error: "Failed to create backup" })
  }
})

router.get("/backup/list", authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Return sample backup list
    const backups = [
      {
        id: "1",
        name: "full_backup_2024_01_15",
        size: "2.3 GB",
        createdAt: "2024-01-15T10:30:00Z",
        type: "full",
        status: "completed",
      },
      {
        id: "2",
        name: "incremental_backup_2024_01_14",
        size: "156 MB",
        createdAt: "2024-01-14T10:30:00Z",
        type: "incremental",
        status: "completed",
      },
    ]

    res.json({ backups })
  } catch (error) {
    console.error("Backup list error:", error)
    res.status(500).json({ error: "Failed to fetch backup list" })
  }
})

router.get("/backup/download/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    // Simulate backup download
    res.setHeader("Content-Type", "application/zip")
    res.setHeader("Content-Disposition", `attachment; filename=backup_${id}.zip`)
    res.send("Backup file content would be here")
  } catch (error) {
    console.error("Backup download error:", error)
    res.status(500).json({ error: "Failed to download backup" })
  }
})

router.post("/backup/restore/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    // Simulate backup restoration
    console.log(`Restoring backup ${id}`)

    res.json({ message: "Backup restoration completed" })
  } catch (error) {
    console.error("Backup restore error:", error)
    res.status(500).json({ error: "Failed to restore backup" })
  }
})

module.exports = router
