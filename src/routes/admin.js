const express = require("express")
const bcrypt = require("bcryptjs")
const { body, validationResult, query } = require("express-validator")
const prisma = require("../config/database")
const { 
  authenticateToken, 
  requireAdmin, 
  requireSuperAdmin, 
  requirePermission, 
  logAdminAction 
} = require("../middleware/auth")

const router = express.Router()

// =============================================================================
// ADMIN DASHBOARD & ANALYTICS
// =============================================================================

// Get admin dashboard data
router.get("/dashboard", 
  authenticateToken, 
  requireAdmin, 
  async (req, res) => {
    try {
      const [
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalPosts,
        pendingPosts,
        totalComments,
        totalReports,
        pendingReports,
        totalChatRooms,
        totalMessages,
        recentActivities
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { isSuspended: true } }),
        prisma.post.count(),
        prisma.post.count({ where: { status: "PENDING" } }),
        prisma.comment.count(),
        prisma.report.count(),
        prisma.report.count({ where: { status: "pending" } }),
        prisma.chatRoom.count(),
        prisma.chatMessage.count(),
        prisma.userActivity.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            userId: true,
            action: true,
            details: true,
            createdAt: true,
          }
        })
      ])

      // Get user registration trend (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const userRegistrationTrend = await prisma.user.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      // Get content moderation stats
      const contentStats = await prisma.post.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      })

      const stats = {
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
          registrationTrend: userRegistrationTrend
        },
        content: {
          posts: {
            total: totalPosts,
            pending: pendingPosts,
            statusBreakdown: contentStats
          },
          comments: totalComments,
          chatRooms: totalChatRooms,
          messages: totalMessages
        },
        moderation: {
          reports: {
            total: totalReports,
            pending: pendingReports
          }
        },
        recentActivities
      }

      res.json({ stats })
    } catch (error) {
      console.error("Dashboard error:", error)
      res.status(500).json({ error: "Failed to fetch dashboard data" })
    }
  }
)

// =============================================================================
// MONITORING & SYSTEM HEALTH
// =============================================================================

// Get user activities with pagination and filtering
router.get("/monitoring/activities",
  authenticateToken,
  requireAdmin,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("userId").optional().isUUID(),
    query("action").optional().trim(),
    query("dateFrom").optional().isISO8601(),
    query("dateTo").optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 50
      const offset = (page - 1) * limit
      const { userId, action, dateFrom, dateTo } = req.query

      const where = {
        ...(userId && { userId }),
        ...(action && { action: { contains: action, mode: "insensitive" } }),
        ...(dateFrom || dateTo) && {
          createdAt: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) })
          }
        }
      }

      const [activities, total] = await Promise.all([
        prisma.userActivity.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                email: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: limit
        }),
        prisma.userActivity.count({ where })
      ])

      // Get activity statistics
      const activityStats = await prisma.userActivity.groupBy({
        by: ['action'],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      })

      res.json({
        activities,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        stats: {
          last24Hours: activityStats
        }
      })
    } catch (error) {
      console.error("Activities monitoring error:", error)
      res.status(500).json({ error: "Failed to fetch user activities" })
    }
  }
)

// Get message status monitoring
router.get("/monitoring/messages",
  authenticateToken,
  requireAdmin,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status").optional().isIn(["PENDING", "APPROVED", "REJECTED", "FLAGGED", "HIDDEN"]),
    query("roomId").optional().isUUID(),
    query("dateFrom").optional().isISO8601(),
    query("dateTo").optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 50
      const offset = (page - 1) * limit
      const { status, roomId, dateFrom, dateTo } = req.query

      const where = {
        ...(status && { status }),
        ...(roomId && { roomId }),
        ...(dateFrom || dateTo) && {
          createdAt: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) })
          }
        }
      }

      const [messages, total] = await Promise.all([
        prisma.chatMessage.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                email: true,
                role: true
              }
            },
            room: {
              select: {
                id: true,
                name: true,
                atmosphere: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: limit
        }),
        prisma.chatMessage.count({ where })
      ])

      // Get message statistics
      const [statusStats, typeStats, roomStats] = await Promise.all([
        prisma.chatMessage.groupBy({
          by: ['status'],
          _count: { id: true }
        }),
        prisma.chatMessage.groupBy({
          by: ['type'],
          _count: { id: true }
        }),
        prisma.chatMessage.groupBy({
          by: ['roomId'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 5
        })
      ])

      // Get recent blocked messages
      const blockedMessages = await prisma.chatMessage.count({
        where: {
          isBlocked: true,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      })

      res.json({
        messages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        stats: {
          byStatus: statusStats,
          byType: typeStats,
          topRooms: roomStats,
          blockedLast24h: blockedMessages
        }
      })
    } catch (error) {
      console.error("Message monitoring error:", error)
      res.status(500).json({ error: "Failed to fetch message monitoring data" })
    }
  }
)

// Get system health metrics
router.get("/monitoring/health",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const now = new Date()
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const [
        totalUsers,
        activeUsers24h,
        totalPosts,
        postsLast24h,
        totalMessages,
        messagesLast24h,
        totalReports,
        pendingReports,
        systemErrors,
        moderationActions24h,
        databaseStats
      ] = await Promise.all([
        prisma.user.count(),
        prisma.userActivity.count({
          where: {
            action: "login",
            createdAt: { gte: last24h }
          }
        }),
        prisma.post.count(),
        prisma.post.count({
          where: { createdAt: { gte: last24h } }
        }),
        prisma.chatMessage.count(),
        prisma.chatMessage.count({
          where: { createdAt: { gte: last24h } }
        }),
        prisma.report.count(),
        prisma.report.count({
          where: { status: "pending" }
        }),
        prisma.userActivity.count({
          where: {
            action: "error",
            createdAt: { gte: last24h }
          }
        }),
        prisma.moderationAction.count({
          where: { createdAt: { gte: last24h } }
        }),
        // Database connection health check
        prisma.$queryRaw`SELECT 1 as healthy`
      ])

      // Get user activity trend (last 7 days)
      const activityTrend = await prisma.userActivity.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: last7d }
        },
        _count: { id: true }
      })

      // Get content moderation stats
      const contentModerationStats = await prisma.post.groupBy({
        by: ['status'],
        _count: { id: true }
      })

      // Get system settings
      const systemSettings = await prisma.systemSetting.findMany({
        where: { isPublic: true },
        select: {
          key: true,
          value: true,
          description: true
        }
      })

      const healthMetrics = {
        database: {
          status: databaseStats.length > 0 ? "healthy" : "unhealthy",
          connection: "active"
        },
        users: {
          total: totalUsers,
          active24h: activeUsers24h,
          activityTrend: activityTrend.map(item => ({
            date: item.createdAt.toISOString().split('T')[0],
            count: item._count.id
          }))
        },
        content: {
          posts: {
            total: totalPosts,
            last24h: postsLast24h
          },
          messages: {
            total: totalMessages,
            last24h: messagesLast24h
          },
          moderationStats: contentModerationStats
        },
        reports: {
          total: totalReports,
          pending: pendingReports
        },
        system: {
          errors24h: systemErrors,
          moderationActions24h: moderationActions24h,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          nodeVersion: process.version
        },
        settings: systemSettings
      }

      res.json({ health: healthMetrics })
    } catch (error) {
      console.error("System health monitoring error:", error)
      res.status(500).json({ error: "Failed to fetch system health data" })
    }
  }
)

// Get real-time monitoring data
router.get("/monitoring/realtime",
  authenticateToken,
  requireAdmin,
  requirePermission("system.monitor"),
  async (req, res) => {
    try {
      const now = new Date()
      const last5min = new Date(now.getTime() - 5 * 60 * 1000)
      const last15min = new Date(now.getTime() - 15 * 60 * 1000)
      const last1h = new Date(now.getTime() - 60 * 60 * 1000)
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      const [
        // Active users (those who logged in within last 15 minutes)
        activeUsers,
        // Recent messages in last 5 minutes
        recentMessages,
        // Recent activities for display
        recentActivities,
        // Pending reports in last hour
        recentReports,
        // Online users in chat rooms
        onlineUsers,
        // System errors in last hour
        recentErrors,
        // Additional metrics
        totalUsers,
        totalPosts,
        totalChatRooms,
        newUsersToday,
        postsToday,
        commentsToday
      ] = await Promise.all([
        // Active users based on recent login activity
        prisma.userActivity.groupBy({
          by: ['userId'],
          where: {
            action: { in: ["login", "page_view", "action"] },
            createdAt: { gte: last15min }
          }
        }).then(result => result.length),

        // Recent chat messages
        prisma.chatMessage.count({
          where: { 
            createdAt: { gte: last5min },
            // Exclude blocked messages
            isBlocked: false,
            status: { not: "REJECTED" }
          }
        }),

        // Recent user activities for display
        prisma.userActivity.findMany({
          where: { 
            createdAt: { gte: last1h },
            // Show important actions only
            action: { 
              in: [
                "login", "logout", "post_created", "comment_added", 
                "user_suspended", "user_blocked", "report_created"
              ] 
            }
          },
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          take: 10
        }),

        // Pending reports in last hour
        prisma.report.count({
          where: {
            createdAt: { gte: last1h },
            status: "pending"
          }
        }),

        // Online users in chat rooms (updated within last 15 minutes)
        prisma.roomMember.count({
          where: { 
            isOnline: true,
            lastSeen: { gte: last15min }
          }
        }),

        // System errors (if UserActivity tracks errors)
        prisma.userActivity.count({
          where: {
            action: { contains: "error" },
            createdAt: { gte: last1h }
          }
        }),

        // Total users
        prisma.user.count(),

        // Total posts
        prisma.post.count(),

        // Total chat rooms
        prisma.chatRoom.count(),

        // New users today
        prisma.user.count({
          where: {
            createdAt: { gte: last24h }
          }
        }),

        // Posts created today
        prisma.post.count({
          where: {
            createdAt: { gte: last24h }
          }
        }),

        // Comments created today
        prisma.comment.count({
          where: {
            createdAt: { gte: last24h }
          }
        })
      ])

      // Generate intelligent alerts based on thresholds
      const alerts = []

      // High number of pending reports
      if (recentReports > 5) {
        alerts.push({
          type: "warning",
          message: `${recentReports}件の新しい報告が過去1時間にあります`,
          timestamp: now.toISOString()
        })
      }

      // System errors detected
      if (recentErrors > 0) {
        alerts.push({
          type: "error", 
          message: `${recentErrors}件のシステムエラーが過去1時間に発生しました`,
          timestamp: now.toISOString()
        })
      }

      // Low activity warning
      if (activeUsers === 0 && recentMessages === 0) {
        alerts.push({
          type: "info",
          message: "過去15分間にユーザー活動が検出されていません",
          timestamp: now.toISOString()
        })
      }

      // High activity alert
      if (activeUsers > 50) {
        alerts.push({
          type: "success",
          message: `${activeUsers}人のアクティブユーザーがオンラインです`,
          timestamp: now.toISOString()
        })
      }

      // Memory usage alert (basic)
      const memoryUsage = process.memoryUsage()
      const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
      if (memoryUsagePercent > 80) {
        alerts.push({
          type: "warning",
          message: `メモリ使用率が${memoryUsagePercent.toFixed(1)}%です`,
          timestamp: now.toISOString()
        })
      }

      const realtimeData = {
        timestamp: now.toISOString(),
        metrics: {
          activeUsers: activeUsers,
          recentMessages: recentMessages,
          recentReports: recentReports,
          onlineUsers: onlineUsers,
          systemErrors: recentErrors
        },
        recentActivities: recentActivities,
        alerts: alerts,
        // Additional system info
        systemInfo: {
          totalUsers: totalUsers,
          totalPosts: totalPosts,
          totalChatRooms: totalChatRooms,
          dailyStats: {
            newUsers: newUsersToday,
            newPosts: postsToday,
            newComments: commentsToday
          },
          serverInfo: {
            uptime: Math.floor(process.uptime()),
            memoryUsage: {
              used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
              total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
              percent: memoryUsagePercent
            },
            nodeVersion: process.version
          }
        }
      }

      res.json(realtimeData)
    } catch (error) {
      console.error("Real-time monitoring error:", error)
      res.status(500).json({ 
        error: "Failed to fetch real-time data",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      })
    }
  }
)

// =============================================================================
// USER MANAGEMENT
// =============================================================================

// Get all users with pagination and filtering
router.get("/users",
  authenticateToken,
  requireAdmin,
  requirePermission("user.view"),
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("search").optional().trim(),
    query("role").optional().isIn(["USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"]),
    query("status").optional().isIn(["active", "inactive", "suspended", "blocked"]),
    query("sortBy").optional().isIn(["createdAt", "lastLoginAt", "nickname", "email"]),
    query("sortOrder").optional().isIn(["asc", "desc"])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20
      const offset = (page - 1) * limit
      const { search, role, status, sortBy = "createdAt", sortOrder = "desc" } = req.query

      // Build where clause
      const where = {
        ...(search && {
          OR: [
            { nickname: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { fullName: { contains: search, mode: "insensitive" } }
          ]
        }),
        ...(role && { role }),
        ...(status && {
          ...(status === "active" && { isActive: true, isBlocked: false, isSuspended: false }),
          ...(status === "inactive" && { isActive: false }),
          ...(status === "suspended" && { isSuspended: true }),
          ...(status === "blocked" && { isBlocked: true })
        })
      }

      // Build orderBy clause
      const orderBy = { [sortBy]: sortOrder }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: {
            _count: {
              select: {
                posts: true,
                comments: true,
                reports: true,
                adminActions: true
              }
            },
            userPermissions: {
              include: {
                permission: true
              }
            }
          },
          orderBy,
          skip: offset,
          take: limit
        }),
        prisma.user.count({ where })
      ])

      const usersWithStats = users.map(user => ({
        ...user,
        password: undefined, // Never send password
        stats: {
          postsCount: user._count.posts,
          commentsCount: user._count.comments,
          reportsCount: user._count.reports,
          adminActionsCount: user._count.adminActions
        },
        permissions: user.userPermissions.map(up => ({
          id: up.permission.id,
          name: up.permission.name,
          description: up.permission.description,
          category: up.permission.category,
          grantedAt: up.grantedAt,
          expiresAt: up.expiresAt
        })),
        _count: undefined,
        userPermissions: undefined
      }))

      res.json({
        users: usersWithStats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error("Get users error:", error)
      res.status(500).json({ error: "Failed to fetch users" })
    }
  }
)

// Get single user details
router.get("/users/:id",
  authenticateToken,
  requireAdmin,
  requirePermission("user.view"),
  async (req, res) => {
    try {
      const { id } = req.params

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          posts: {
            select: {
              id: true,
              title: true,
              status: true,
              isPublished: true,
              createdAt: true,
              viewCount: true
            },
            orderBy: { createdAt: "desc" },
            take: 10
          },
          comments: {
            select: {
              id: true,
              content: true,
              status: true,
              createdAt: true,
              post: {
                select: {
                  id: true,
                  title: true
                }
              }
            },
            orderBy: { createdAt: "desc" },
            take: 10
          },
          reports: {
            select: {
              id: true,
              type: true,
              description: true,
              status: true,
              createdAt: true
            },
            orderBy: { createdAt: "desc" },
            take: 10
          },
          moderationActions: {
            select: {
              id: true,
              action: true,
              reason: true,
              createdAt: true,
              moderator: {
                select: {
                  id: true,
                  nickname: true
                }
              }
            },
            orderBy: { createdAt: "desc" },
            take: 10
          },
          userPermissions: {
            include: {
              permission: true
            }
          },
          _count: {
            select: {
              posts: true,
              comments: true,
              likes: true,
              reports: true,
              adminActions: true
            }
          }
        }
      })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user

      res.json({
        user: {
          ...userWithoutPassword,
          permissions: user.userPermissions.map(up => ({
            id: up.permission.id,
            name: up.permission.name,
            description: up.permission.description,
            category: up.permission.category,
            grantedAt: up.grantedAt,
            expiresAt: up.expiresAt
          })),
          stats: {
            postsCount: user._count.posts,
            commentsCount: user._count.comments,
            likesCount: user._count.likes,
            reportsCount: user._count.reports,
            adminActionsCount: user._count.adminActions
          },
          userPermissions: undefined,
          _count: undefined
        }
      })
    } catch (error) {
      console.error("Get user error:", error)
      res.status(500).json({ error: "Failed to fetch user" })
    }
  }
)

// Update user
router.put("/users/:id",
  authenticateToken,
  requireAdmin,
  requirePermission("user.edit"),
  logAdminAction("user_updated"),
  [
    body("nickname").optional().trim().isLength({ min: 2, max: 50 }),
    body("email").optional().isEmail().normalizeEmail(),
    body("fullName").optional().trim().isLength({ max: 100 }),
    body("bio").optional().trim().isLength({ max: 500 }),
    body("age").optional().isInt({ min: 13, max: 120 }),
    body("location").optional().trim().isLength({ max: 100 }),
    body("phone").optional().trim().isLength({ max: 20 }),
    body("website").optional().trim().isURL(),
    body("gender").optional().trim().isLength({ max: 20 }),
    body("occupation").optional().trim().isLength({ max: 100 }),
    body("interests").optional().isArray(),
    body("role").optional().isIn(["USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"]),
    body("isActive").optional().isBoolean(),
    body("isBlocked").optional().isBoolean(),
    body("isSuspended").optional().isBoolean(),
    body("suspendReason").optional().trim().isLength({ max: 500 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const { id } = req.params
      const updateData = { ...req.body }

      // Only super admin can change roles
      if (updateData.role && req.user.role !== "SUPER_ADMIN") {
        return res.status(403).json({ error: "Only super admin can change user roles" })
      }

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key]
        }
      })

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          nickname: true,
          email: true,
          fullName: true,
          bio: true,
          age: true,
          location: true,
          phone: true,
          website: true,
          gender: true,
          occupation: true,
          interests: true,
          role: true,
          isActive: true,
          isBlocked: true,
          isSuspended: true,
          suspendReason: true,
          createdAt: true,
          updatedAt: true
        }
      })

      // Add details for admin action logging
      req.adminAction.details = { updatedFields: updateData }

      res.json({
        message: "User updated successfully",
        user
      })
    } catch (error) {
      console.error("Update user error:", error)
      if (error.code === "P2002") {
        return res.status(400).json({ error: "Email or nickname already exists" })
      }
      res.status(500).json({ error: "Failed to update user" })
    }
  }
)

// Suspend user
router.post("/users/:id/suspend",
  authenticateToken,
  requireAdmin,
  requirePermission("user.suspend"),
  logAdminAction("user_suspended"),
  [
    body("reason").trim().isLength({ min: 1, max: 500 }),
    body("duration").optional().isInt({ min: 1 }), // days
    body("permanent").optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const { id } = req.params
      const { reason, duration, permanent = false } = req.body

      const suspendedUntil = permanent ? null : new Date(Date.now() + (duration || 7) * 24 * 60 * 60 * 1000)

      const user = await prisma.user.update({
        where: { id },
        data: {
          isSuspended: true,
          suspendedUntil,
          suspendReason: reason
        },
        select: {
          id: true,
          nickname: true,
          email: true,
          isSuspended: true,
          suspendedUntil: true,
          suspendReason: true
        }
      })

      // Log moderation action
      await prisma.moderationAction.create({
        data: {
          moderatorId: req.user.id,
          userId: id,
          action: "SUSPEND",
          reason,
          details: { duration, permanent },
          expiresAt: suspendedUntil
        }
      })

      req.adminAction.details = { reason, duration, permanent }

      res.json({
        message: "User suspended successfully",
        user
      })
    } catch (error) {
      console.error("Suspend user error:", error)
      res.status(500).json({ error: "Failed to suspend user" })
    }
  }
)

// Unsuspend user
router.post("/users/:id/unsuspend",
  authenticateToken,
  requireAdmin,
  requirePermission("user.suspend"),
  logAdminAction("user_unsuspended"),
  async (req, res) => {
    try {
      const { id } = req.params

      const user = await prisma.user.update({
        where: { id },
        data: {
          isSuspended: false,
          suspendedUntil: null,
          suspendReason: null
        },
        select: {
          id: true,
          nickname: true,
          email: true,
          isSuspended: true,
          suspendedUntil: true,
          suspendReason: true
        }
      })

      // Log moderation action
      await prisma.moderationAction.create({
        data: {
          moderatorId: req.user.id,
          userId: id,
          action: "UNSUSPEND",
          reason: "Suspension lifted by admin"
        }
      })

      res.json({
        message: "User unsuspended successfully",
        user
      })
    } catch (error) {
      console.error("Unsuspend user error:", error)
      res.status(500).json({ error: "Failed to unsuspend user" })
    }
  }
)

// Block user
router.post("/users/:id/block",
  authenticateToken,
  requireAdmin,
  requirePermission("user.ban"),
  logAdminAction("user_blocked"),
  [
    body("reason").trim().isLength({ min: 1, max: 500 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const { id } = req.params
      const { reason } = req.body

      const user = await prisma.user.update({
        where: { id },
        data: {
          isBlocked: true,
          isActive: false
        },
        select: {
          id: true,
          nickname: true,
          email: true,
          isBlocked: true,
          isActive: true
        }
      })

      // Log moderation action
      await prisma.moderationAction.create({
        data: {
          moderatorId: req.user.id,
          userId: id,
          action: "BLOCK",
          reason
        }
      })

      req.adminAction.details = { reason }

      res.json({
        message: "User blocked successfully",
        user
      })
    } catch (error) {
      console.error("Block user error:", error)
      res.status(500).json({ error: "Failed to block user" })
    }
  }
)

// Unblock user
router.post("/users/:id/unblock",
  authenticateToken,
  requireAdmin,
  requirePermission("user.ban"),
  logAdminAction("user_unblocked"),
  async (req, res) => {
    try {
      const { id } = req.params

      const user = await prisma.user.update({
        where: { id },
        data: {
          isBlocked: false,
          isActive: true
        },
        select: {
          id: true,
          nickname: true,
          email: true,
          isBlocked: true,
          isActive: true
        }
      })

      // Log moderation action
      await prisma.moderationAction.create({
        data: {
          moderatorId: req.user.id,
          userId: id,
          action: "UNBLOCK",
          reason: "Block lifted by admin"
        }
      })

      res.json({
        message: "User unblocked successfully",
        user
      })
    } catch (error) {
      console.error("Unblock user error:", error)
      res.status(500).json({ error: "Failed to unblock user" })
    }
  }
)

// Delete user
router.delete("/users/:id",
  authenticateToken,
  requireAdmin,
  requirePermission("user.delete"),
  logAdminAction("user_deleted"),
  async (req, res) => {
    try {
      const { id } = req.params

      // Cannot delete self
      if (id === req.user.id) {
        return res.status(400).json({ error: "Cannot delete your own account" })
      }

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          nickname: true,
          email: true,
          role: true
        }
      })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Only super admin can delete admin users
      if (user.role !== "USER" && req.user.role !== "SUPER_ADMIN") {
        return res.status(403).json({ error: "Only super admin can delete admin users" })
      }

      await prisma.user.delete({
        where: { id }
      })

      req.adminAction.details = { deletedUser: user }

      res.json({
        message: "User deleted successfully"
      })
    } catch (error) {
      console.error("Delete user error:", error)
      res.status(500).json({ error: "Failed to delete user" })
    }
  }
)

// =============================================================================
// CONTENT MANAGEMENT
// =============================================================================

// Get all posts for moderation
router.get("/posts",
  authenticateToken,
  requireAdmin,
  requirePermission("content.view"),
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status").optional().isIn(["PENDING", "APPROVED", "REJECTED", "FLAGGED", "HIDDEN"]),
    query("search").optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20
      const offset = (page - 1) * limit
      const { status, search } = req.query

      const where = {
        ...(status && { status }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } }
          ]
        })
      }

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where,
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
                email: true
              }
            },
            _count: {
              select: {
                comments: true,
                likes: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: limit
        }),
        prisma.post.count({ where })
      ])

      res.json({
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error("Get posts error:", error)
      res.status(500).json({ error: "Failed to fetch posts" })
    }
  }
)

// Update post status
router.put("/posts/:id/status",
  authenticateToken,
  requireAdmin,
  requirePermission("content.moderate"),
  logAdminAction("post_status_updated"),
  [
    body("status").isIn(["PENDING", "APPROVED", "REJECTED", "FLAGGED", "HIDDEN"]),
    body("reason").optional().trim().isLength({ max: 500 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const { id } = req.params
      const { status, reason } = req.body

      const post = await prisma.post.update({
        where: { id },
        data: {
          status,
          moderationReason: reason,
          moderatedAt: new Date(),
          moderatedBy: req.user.id,
          isBlocked: status === "REJECTED" || status === "HIDDEN"
        },
        include: {
          author: {
            select: {
              id: true,
              nickname: true
            }
          }
        }
      })

      req.adminAction.details = { status, reason }

      res.json({
        message: "Post status updated successfully",
        post
      })
    } catch (error) {
      console.error("Update post status error:", error)
      res.status(500).json({ error: "Failed to update post status" })
    }
  }
)

// Delete post
router.delete("/posts/:id",
  authenticateToken,
  requireAdmin,
  requirePermission("content.delete"),
  logAdminAction("post_deleted"),
  async (req, res) => {
    try {
      const { id } = req.params

      const post = await prisma.post.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          author: {
            select: {
              id: true,
              nickname: true
            }
          }
        }
      })

      if (!post) {
        return res.status(404).json({ error: "Post not found" })
      }

      await prisma.post.delete({
        where: { id }
      })

      req.adminAction.details = { deletedPost: post }

      res.json({
        message: "Post deleted successfully"
      })
    } catch (error) {
      console.error("Delete post error:", error)
      res.status(500).json({ error: "Failed to delete post" })
    }
  }
)

// =============================================================================
// CONTENT MANAGEMENT RESTRICTIONS
// =============================================================================

// Update post content (admin editing)
router.put("/posts/:id",
  authenticateToken,
  requireAdmin,
  requirePermission("content.edit"),
  logAdminAction("post_updated"),
  [
    body("title").optional().trim().isLength({ min: 1, max: 200 }),
    body("content").optional().trim().isLength({ min: 10 }),
    body("category").optional().trim().isIn(["初心者向け", "上級者向け", "おすすめ", "レビュー"]),
    body("excerpt").optional().trim().isLength({ max: 500 }),
    body("isPublished").optional().isBoolean(),
    body("isFeatured").optional().isBoolean(),
    body("priority").optional().isInt({ min: 0, max: 100 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const { id } = req.params
      const updateData = { ...req.body }

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key]
        }
      })

      const post = await prisma.post.update({
        where: { id },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
              email: true
            }
          },
          _count: {
            select: {
              comments: true,
              likes: true
            }
          }
        }
      })

      req.adminAction.details = { updatedFields: updateData }

      res.json({
        message: "Post updated successfully",
        post
      })
    } catch (error) {
      console.error("Update post error:", error)
      res.status(500).json({ error: "Failed to update post" })
    }
  }
)

// Get all comments for moderation
router.get("/comments",
  authenticateToken,
  requireAdmin,
  requirePermission("content.view"),
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status").optional().isIn(["PENDING", "APPROVED", "REJECTED", "FLAGGED", "HIDDEN"]),
    query("search").optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20
      const offset = (page - 1) * limit
      const { status, search } = req.query

      const where = {
        ...(status && { status }),
        ...(search && {
          content: { contains: search, mode: "insensitive" }
        })
      }

      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where,
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
                email: true
              }
            },
            post: {
              select: {
                id: true,
                title: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: limit
        }),
        prisma.comment.count({ where })
      ])

      res.json({
        comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error("Get comments error:", error)
      res.status(500).json({ error: "Failed to fetch comments" })
    }
  }
)

// Update comment content (admin editing)
router.put("/comments/:id",
  authenticateToken,
  requireAdmin,
  requirePermission("content.edit"),
  logAdminAction("comment_updated"),
  [
    body("content").optional().trim().isLength({ min: 1, max: 1000 }),
    body("status").optional().isIn(["PENDING", "APPROVED", "REJECTED", "FLAGGED", "HIDDEN"]),
    body("moderationReason").optional().trim().isLength({ max: 500 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const { id } = req.params
      const updateData = { ...req.body }

      if (updateData.status) {
        updateData.moderatedAt = new Date()
        updateData.moderatedBy = req.user.id
        updateData.isBlocked = updateData.status === "REJECTED" || updateData.status === "HIDDEN"
      }

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key]
        }
      })

      const comment = await prisma.comment.update({
        where: { id },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
              email: true
            }
          },
          post: {
            select: {
              id: true,
              title: true
            }
          }
        }
      })

      req.adminAction.details = { updatedFields: updateData }

      res.json({
        message: "Comment updated successfully",
        comment
      })
    } catch (error) {
      console.error("Update comment error:", error)
      res.status(500).json({ error: "Failed to update comment" })
    }
  }
)

// Delete comment
router.delete("/comments/:id",
  authenticateToken,
  requireAdmin,
  requirePermission("content.delete"),
  logAdminAction("comment_deleted"),
  async (req, res) => {
    try {
      const { id } = req.params

      const comment = await prisma.comment.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              nickname: true
            }
          },
          post: {
            select: {
              id: true,
              title: true
            }
          }
        }
      })

      if (!comment) {
        return res.status(404).json({ error: "Comment not found" })
      }

      await prisma.comment.delete({
        where: { id }
      })

      req.adminAction.details = { deletedComment: comment }

      res.json({
        message: "Comment deleted successfully"
      })
    } catch (error) {
      console.error("Delete comment error:", error)
      res.status(500).json({ error: "Failed to delete comment" })
    }
  }
)

// =============================================================================
// ROLE AND PERMISSION MANAGEMENT
// =============================================================================

// Get all roles with their permissions
router.get("/roles",
  authenticateToken,
  requireAdmin,
  requirePermission("user.permissions"),
  async (req, res) => {
    try {
      const roles = ["USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"]
      
      // Get user count for each role
      const roleCounts = await Promise.all(
        roles.map(role => 
          prisma.user.count({ where: { role } })
        )
      )
      
      // Get default permissions for each role (from seed data logic)
      const permissions = await prisma.permission.findMany({
        orderBy: { category: "asc" }
      })
      
      const rolesWithInfo = roles.map((role, index) => ({
        name: role,
        displayName: {
          "USER": "一般ユーザー",
          "MODERATOR": "モデレーター",
          "ADMIN": "管理者",
          "SUPER_ADMIN": "スーパー管理者"
        }[role],
        userCount: roleCounts[index],
        description: {
          "USER": "基本的な機能のみ利用可能",
          "MODERATOR": "コンテンツとレポートの管理が可能",
          "ADMIN": "ユーザー管理とコンテンツ管理が可能",
          "SUPER_ADMIN": "全ての機能にアクセス可能"
        }[role],
        defaultPermissions: permissions.filter(permission => {
          if (role === "SUPER_ADMIN") return true
          if (role === "ADMIN") return permission.category !== "system_management"
          if (role === "MODERATOR") return ["content_management", "reports_management"].includes(permission.category)
          return false
        })
      }))
      
      res.json({ roles: rolesWithInfo })
    } catch (error) {
      console.error("Get roles error:", error)
      res.status(500).json({ error: "Failed to fetch roles" })
    }
  }
)

// Update user role
router.patch("/users/:id/role",
  authenticateToken,
  requireSuperAdmin,
  logAdminAction("role_updated"),
  [
    body("role").isIn(["USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const { id } = req.params
      const { role } = req.body

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          userPermissions: {
            include: {
              permission: true
            }
          }
        }
      })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Update user role
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role },
        include: {
          userPermissions: {
            include: {
              permission: true
            }
          }
        }
      })

      // Log the action
      const adminAction = {
        targetType: "user",
        targetId: id,
        details: {
          previousRole: user.role,
          newRole: role,
          targetUser: user.nickname
        }
      }

      res.json({
        message: "User role updated successfully",
        user: {
          ...updatedUser,
          password: undefined,
          permissions: updatedUser.userPermissions.map(up => ({
            id: up.permission.id,
            name: up.permission.name,
            description: up.permission.description,
            category: up.permission.category,
            grantedAt: up.grantedAt,
            expiresAt: up.expiresAt
          }))
        }
      })
    } catch (error) {
      console.error("Update user role error:", error)
      res.status(500).json({ error: "Failed to update user role" })
    }
  }
)

// Bulk permission management
router.post("/users/:id/permissions/bulk",
  authenticateToken,
  requireAdmin,
  requirePermission("user.permissions"),
  logAdminAction("permissions_bulk_updated"),
  [
    body("permissions").isArray(),
    body("permissions.*.permissionId").isUUID(),
    body("permissions.*.action").isIn(["grant", "revoke"])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const { id } = req.params
      const { permissions } = req.body

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          userPermissions: {
            include: {
              permission: true
            }
          }
        }
      })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      const results = []
      
      for (const permissionUpdate of permissions) {
        const { permissionId, action } = permissionUpdate
        
        try {
          if (action === "grant") {
            // Check if user already has this permission
            const existingPermission = await prisma.userPermission.findUnique({
              where: {
                userId_permissionId: {
                  userId: id,
                  permissionId
                }
              }
            })
            
            if (!existingPermission) {
              await prisma.userPermission.create({
                data: {
                  userId: id,
                  permissionId,
                  grantedBy: req.user.id
                }
              })
              results.push({ permissionId, action: "granted", status: "success" })
            } else {
              results.push({ permissionId, action: "grant", status: "already_exists" })
            }
          } else if (action === "revoke") {
            await prisma.userPermission.delete({
              where: {
                userId_permissionId: {
                  userId: id,
                  permissionId
                }
              }
            })
            results.push({ permissionId, action: "revoked", status: "success" })
          }
        } catch (error) {
          results.push({ permissionId, action, status: "error", error: error.message })
        }
      }

      // Get updated user with permissions
      const updatedUser = await prisma.user.findUnique({
        where: { id },
        include: {
          userPermissions: {
            include: {
              permission: true
            }
          }
        }
      })

      res.json({
        message: "Bulk permission update completed",
        results,
        user: {
          ...updatedUser,
          password: undefined,
          permissions: updatedUser.userPermissions.map(up => ({
            id: up.permission.id,
            name: up.permission.name,
            description: up.permission.description,
            category: up.permission.category,
            grantedAt: up.grantedAt,
            expiresAt: up.expiresAt
          }))
        }
      })
    } catch (error) {
      console.error("Bulk permission update error:", error)
      res.status(500).json({ error: "Failed to update permissions" })
    }
  }
)

// Get all permissions
router.get("/permissions",
  authenticateToken,
  requireAdmin,
  requirePermission("user.permissions"),
  async (req, res) => {
    try {
      const permissions = await prisma.permission.findMany({
        orderBy: [
          { category: "asc" },
          { name: "asc" }
        ]
      })

      const groupedPermissions = permissions.reduce((acc, permission) => {
        if (!acc[permission.category]) {
          acc[permission.category] = []
        }
        acc[permission.category].push(permission)
        return acc
      }, {})

      res.json({ permissions: groupedPermissions })
    } catch (error) {
      console.error("Get permissions error:", error)
      res.status(500).json({ error: "Failed to fetch permissions" })
    }
  }
)

// Grant permission to user
router.post("/users/:id/permissions",
  authenticateToken,
  requireAdmin,
  requirePermission("user.permissions"),
  logAdminAction("permission_granted"),
  [
    body("permissionId").isUUID(),
    body("expiresAt").optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const { id } = req.params
      const { permissionId, expiresAt } = req.body

      const userPermission = await prisma.userPermission.create({
        data: {
          userId: id,
          permissionId,
          grantedBy: req.user.id,
          expiresAt: expiresAt ? new Date(expiresAt) : null
        },
        include: {
          permission: true,
          user: {
            select: {
              id: true,
              nickname: true
            }
          }
        }
      })

      req.adminAction.details = { 
        permissionName: userPermission.permission.name,
        grantedTo: userPermission.user.nickname,
        expiresAt 
      }

      res.json({
        message: "Permission granted successfully",
        userPermission
      })
    } catch (error) {
      console.error("Grant permission error:", error)
      if (error.code === "P2002") {
        return res.status(400).json({ error: "User already has this permission" })
      }
      res.status(500).json({ error: "Failed to grant permission" })
    }
  }
)

// Revoke permission from user
router.delete("/users/:id/permissions/:permissionId",
  authenticateToken,
  requireAdmin,
  requirePermission("user.permissions"),
  logAdminAction("permission_revoked"),
  async (req, res) => {
    try {
      const { id, permissionId } = req.params

      const userPermission = await prisma.userPermission.findUnique({
        where: {
          userId_permissionId: {
            userId: id,
            permissionId
          }
        },
        include: {
          permission: true,
          user: {
            select: {
              id: true,
              nickname: true
            }
          }
        }
      })

      if (!userPermission) {
        return res.status(404).json({ error: "Permission not found" })
      }

      await prisma.userPermission.delete({
        where: {
          userId_permissionId: {
            userId: id,
            permissionId
          }
        }
      })

      req.adminAction.details = { 
        permissionName: userPermission.permission.name,
        revokedFrom: userPermission.user.nickname
      }

      res.json({
        message: "Permission revoked successfully"
      })
    } catch (error) {
      console.error("Revoke permission error:", error)
      res.status(500).json({ error: "Failed to revoke permission" })
    }
  }
)

// =============================================================================
// CHAT MANAGEMENT RESTRICTIONS
// =============================================================================

// Get all chat rooms for administration
router.get("/chat/rooms",
  authenticateToken,
  requireAdmin,
  requirePermission("chat.view"),
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("search").optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20
      const offset = (page - 1) * limit
      const { search } = req.query

      const where = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } }
          ]
        })
      }

      const [rooms, total] = await Promise.all([
        prisma.chatRoom.findMany({
          where,
          include: {
            creator: {
              select: {
                id: true,
                nickname: true,
                email: true
              }
            },
            _count: {
              select: {
                members: true,
                messages: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: limit
        }),
        prisma.chatRoom.count({ where })
      ])

      res.json({
        rooms,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error("Get chat rooms error:", error)
      res.status(500).json({ error: "Failed to fetch chat rooms" })
    }
  }
)

// Delete chat room
router.delete("/chat/rooms/:id",
  authenticateToken,
  requireAdmin,
  requirePermission("chat.delete"),
  logAdminAction("chat_room_deleted"),
  async (req, res) => {
    try {
      const { id } = req.params

      const room = await prisma.chatRoom.findUnique({
        where: { id },
        include: {
          creator: {
            select: {
              id: true,
              nickname: true
            }
          }
        }
      })

      if (!room) {
        return res.status(404).json({ error: "Chat room not found" })
      }

      await prisma.chatRoom.delete({
        where: { id }
      })

      req.adminAction.details = { deletedRoom: room }

      res.json({
        message: "Chat room deleted successfully"
      })
    } catch (error) {
      console.error("Delete chat room error:", error)
      res.status(500).json({ error: "Failed to delete chat room" })
    }
  }
)

// Get chat messages for moderation
router.get("/chat/messages",
  authenticateToken,
  requireAdmin,
  requirePermission("chat.view"),
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("roomId").optional().isUUID(),
    query("status").optional().isIn(["PENDING", "APPROVED", "REJECTED", "FLAGGED", "HIDDEN"]),
    query("search").optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20
      const offset = (page - 1) * limit
      const { roomId, status, search } = req.query

      const where = {
        ...(roomId && { roomId }),
        ...(status && { status }),
        ...(search && {
          content: { contains: search, mode: "insensitive" }
        })
      }

      const [messages, total] = await Promise.all([
        prisma.chatMessage.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                email: true
              }
            },
            room: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: limit
        }),
        prisma.chatMessage.count({ where })
      ])

      res.json({
        messages,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error("Get chat messages error:", error)
      res.status(500).json({ error: "Failed to fetch chat messages" })
    }
  }
)

// Delete chat message
router.delete("/chat/messages/:id",
  authenticateToken,
  requireAdmin,
  requirePermission("chat.delete"),
  logAdminAction("chat_message_deleted"),
  async (req, res) => {
    try {
      const { id } = req.params

      const message = await prisma.chatMessage.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              nickname: true
            }
          },
          room: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      if (!message) {
        return res.status(404).json({ error: "Chat message not found" })
      }

      await prisma.chatMessage.delete({
        where: { id }
      })

      req.adminAction.details = { deletedMessage: message }

      res.json({
        message: "Chat message deleted successfully"
      })
    } catch (error) {
      console.error("Delete chat message error:", error)
      res.status(500).json({ error: "Failed to delete chat message" })
    }
  }
)

// Restrict user from chat room
router.post("/chat/rooms/:roomId/restrict/:userId",
  authenticateToken,
  requireAdmin,
  requirePermission("chat.moderate"),
  logAdminAction("user_restricted_from_chat"),
  [
    body("reason").trim().isLength({ min: 1, max: 500 }),
    body("duration").optional().isInt({ min: 1 }), // hours
    body("permanent").optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const { roomId, userId } = req.params
      const { reason, duration, permanent = false } = req.body

      // Remove user from room if they're a member
      await prisma.roomMember.deleteMany({
        where: {
          roomId,
          userId
        }
      })

      // Create restriction record
      const expiresAt = permanent ? null : new Date(Date.now() + (duration || 24) * 60 * 60 * 1000)
      
      await prisma.moderationAction.create({
        data: {
          moderatorId: req.user.id,
          userId: userId,
          action: "BLOCK",
          reason,
          details: { type: "chat_restriction", roomId, duration, permanent },
          expiresAt
        }
      })

      req.adminAction.details = { roomId, userId, reason, duration, permanent }

      res.json({
        message: "User restricted from chat room successfully"
      })
    } catch (error) {
      console.error("Restrict user from chat error:", error)
      res.status(500).json({ error: "Failed to restrict user from chat room" })
    }
  }
)

// =============================================================================
// FEMALE ARTIST RANKING MANAGEMENT
// =============================================================================

// Get female artist rankings
router.get("/artists/rankings",
  authenticateToken,
  requireAdmin,
  requirePermission("content.view"),
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("category").optional().trim(),
    query("sortBy").optional().isIn(["likes", "posts", "followers", "engagement"]),
    query("sortOrder").optional().isIn(["asc", "desc"])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20
      const offset = (page - 1) * limit
      const { category, sortBy = "likes", sortOrder = "desc" } = req.query

      // Get female artists (users with special designation)
      const where = {
        gender: "female",
        role: "USER", // Only regular users can be artists
        isActive: true,
        ...(category && { interests: { has: category } })
      }

      let orderBy = {}
      switch (sortBy) {
        case "posts":
          orderBy = { posts: { _count: sortOrder } }
          break
        case "followers":
          orderBy = { receivedModerations: { _count: sortOrder === "desc" ? "asc" : "desc" } } // Placeholder for followers (inverse logic)
          break
        case "engagement":
          orderBy = { comments: { _count: sortOrder } }
          break
        default:
          orderBy = { likes: { _count: sortOrder } }
      }

      const [artists, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: {
            _count: {
              select: {
                posts: true,
                comments: true,
                likes: true
              }
            },
            posts: {
              select: {
                id: true,
                title: true,
                viewCount: true,
                createdAt: true,
                _count: {
                  select: {
                    likes: true,
                    comments: true
                  }
                }
              },
              orderBy: { createdAt: "desc" },
              take: 3
            }
          },
          orderBy,
          skip: offset,
          take: limit
        }),
        prisma.user.count({ where })
      ])

      // Calculate rankings with additional metrics
      const artistsWithRankings = artists.map((artist, index) => ({
        ...artist,
        password: undefined,
        rank: offset + index + 1,
        stats: {
          postsCount: artist._count.posts,
          commentsCount: artist._count.comments,
          likesCount: artist._count.likes,
          totalViews: artist.posts.reduce((sum, post) => sum + post.viewCount, 0),
          avgLikesPerPost: artist._count.posts > 0 ? artist._count.likes / artist._count.posts : 0,
          engagementRate: artist._count.posts > 0 ? 
            (artist._count.likes + artist._count.comments) / artist._count.posts : 0
        },
        recentPosts: artist.posts.map(post => ({
          ...post,
          likesCount: post._count.likes,
          commentsCount: post._count.comments,
          _count: undefined
        })),
        _count: undefined,
        posts: undefined
      }))

      res.json({
        artists: artistsWithRankings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error("Get artist rankings error:", error)
      res.status(500).json({ error: "Failed to fetch artist rankings" })
    }
  }
)

// Set target artist (featured/promoted)
router.post("/artists/:id/set-target",
  authenticateToken,
  requireAdmin,
  requirePermission("content.manage"),
  logAdminAction("artist_target_set"),
  [
    body("targetType").isIn(["featured", "promoted", "trending", "rising"]),
    body("priority").optional().isInt({ min: 1, max: 100 }),
    body("duration").optional().isInt({ min: 1 }), // days
    body("description").optional().trim().isLength({ max: 500 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const { id } = req.params
      const { targetType, priority = 50, duration, description } = req.body

      // Update user with target settings
      const expiresAt = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null
      
      const user = await prisma.user.update({
        where: { id },
        data: {
          interests: { push: `target_${targetType}` },
          bio: description || undefined
        },
        select: {
          id: true,
          nickname: true,
          fullName: true,
          bio: true,
          interests: true
        }
      })

      // Log the targeting action
      await prisma.adminAction.create({
        data: {
          adminId: req.user.id,
          action: "set_artist_target",
          targetType: "user",
          targetId: id,
          details: {
            targetType,
            priority,
            duration,
            description,
            expiresAt
          }
        }
      })

      req.adminAction.details = { targetType, priority, duration, description }

      res.json({
        message: "Artist target set successfully",
        artist: user
      })
    } catch (error) {
      console.error("Set artist target error:", error)
      res.status(500).json({ error: "Failed to set artist target" })
    }
  }
)

// =============================================================================
// AUTOMATED MONITORING SYSTEM
// =============================================================================

// Get automated monitoring alerts
router.get("/monitoring/alerts",
  authenticateToken,
  requireAdmin,
  requirePermission("system.monitor"),
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("severity").optional().isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    query("category").optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20
      const offset = (page - 1) * limit
      const { severity, category } = req.query

      // Get system monitoring data
      const now = new Date()
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const last1h = new Date(now.getTime() - 60 * 60 * 1000)

      const [
        inappropriateContent,
        spamReports,
        suspiciousActivity,
        systemErrors,
        highVolumeActivity
      ] = await Promise.all([
        // Inappropriate content detection
        prisma.post.count({
          where: {
            OR: [
              { content: { contains: "inappropriate", mode: "insensitive" } },
              { content: { contains: "spam", mode: "insensitive" } }
            ],
            createdAt: { gte: last24h }
          }
        }),
        // Spam reports
        prisma.report.count({
          where: {
            type: "spam",
            createdAt: { gte: last24h }
          }
        }),
        // Suspicious user activity
        prisma.userActivity.count({
          where: {
            action: "login",
            createdAt: { gte: last1h }
          }
        }),
        // System errors
        prisma.userActivity.count({
          where: {
            action: "error",
            createdAt: { gte: last24h }
          }
        }),
        // High volume activity
        prisma.post.count({
          where: {
            createdAt: { gte: last1h }
          }
        })
      ])

      // Generate alerts based on thresholds
      const alerts = []

      if (inappropriateContent > 5) {
        alerts.push({
          id: `inappropriate_${now.getTime()}`,
          type: "content_monitoring",
          severity: "HIGH",
          title: "Inappropriate Content Detected",
          message: `${inappropriateContent} potentially inappropriate posts detected in the last 24 hours`,
          count: inappropriateContent,
          createdAt: now,
          category: "content"
        })
      }

      if (spamReports > 10) {
        alerts.push({
          id: `spam_${now.getTime()}`,
          type: "spam_detection",
          severity: "MEDIUM",
          title: "High Spam Report Volume",
          message: `${spamReports} spam reports received in the last 24 hours`,
          count: spamReports,
          createdAt: now,
          category: "reports"
        })
      }

      if (suspiciousActivity > 100) {
        alerts.push({
          id: `suspicious_${now.getTime()}`,
          type: "suspicious_activity",
          severity: "HIGH",
          title: "Suspicious Login Activity",
          message: `${suspiciousActivity} logins detected in the last hour`,
          count: suspiciousActivity,
          createdAt: now,
          category: "security"
        })
      }

      if (systemErrors > 0) {
        alerts.push({
          id: `errors_${now.getTime()}`,
          type: "system_errors",
          severity: "CRITICAL",
          title: "System Errors Detected",
          message: `${systemErrors} system errors occurred in the last 24 hours`,
          count: systemErrors,
          createdAt: now,
          category: "system"
        })
      }

      if (highVolumeActivity > 50) {
        alerts.push({
          id: `high_volume_${now.getTime()}`,
          type: "high_volume",
          severity: "LOW",
          title: "High Volume Activity",
          message: `${highVolumeActivity} posts created in the last hour`,
          count: highVolumeActivity,
          createdAt: now,
          category: "activity"
        })
      }

      // Filter alerts based on query parameters
      let filteredAlerts = alerts
      if (severity) {
        filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity)
      }
      if (category) {
        filteredAlerts = filteredAlerts.filter(alert => alert.category === category)
      }

      // Apply pagination
      const total = filteredAlerts.length
      const paginatedAlerts = filteredAlerts.slice(offset, offset + limit)

      res.json({
        alerts: paginatedAlerts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        summary: {
          inappropriateContent,
          spamReports,
          suspiciousActivity,
          systemErrors,
          highVolumeActivity
        }
      })
    } catch (error) {
      console.error("Get monitoring alerts error:", error)
      res.status(500).json({ error: "Failed to fetch monitoring alerts" })
    }
  }
)

// =============================================================================
// DETAILED STATISTICS AND REPORTING
// =============================================================================

// Get detailed analytics
router.get("/analytics/detailed",
  authenticateToken,
  requireAdmin,
  requirePermission("system.analytics"),
  [
    query("period").optional().isIn(["24h", "7d", "30d", "90d", "1y"]),
    query("metrics").optional().trim(),
    query("granularity").optional().isIn(["hour", "day", "week", "month"])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const { period = "30d", metrics = "all", granularity = "day" } = req.query

      // Calculate date range
      const now = new Date()
      let startDate = new Date()
      switch (period) {
        case "24h":
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case "90d":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        case "1y":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
      }

      // Get user analytics
      const [
        userRegistrations,
        userActivities,
        contentCreation,
        engagementMetrics,
        moderationStats,
        systemPerformance
      ] = await Promise.all([
        // User registration trends
        prisma.user.groupBy({
          by: ['createdAt'],
          where: {
            createdAt: { gte: startDate }
          },
          _count: { id: true },
          orderBy: { createdAt: 'asc' }
        }),
        // User activity patterns
        prisma.userActivity.groupBy({
          by: ['action'],
          where: {
            createdAt: { gte: startDate }
          },
          _count: { id: true }
        }),
        // Content creation trends
        prisma.post.groupBy({
          by: ['category'],
          where: {
            createdAt: { gte: startDate }
          },
          _count: { id: true },
          _avg: { viewCount: true }
        }),
        // Engagement metrics
        prisma.like.groupBy({
          by: ['createdAt'],
          where: {
            createdAt: { gte: startDate }
          },
          _count: { id: true }
        }),
        // Moderation statistics
        prisma.moderationAction.groupBy({
          by: ['action'],
          where: {
            createdAt: { gte: startDate }
          },
          _count: { id: true }
        }),
        // System performance
        prisma.report.groupBy({
          by: ['type'],
          where: {
            createdAt: { gte: startDate }
          },
          _count: { id: true }
        })
      ])

      // Format time series data
      const formatTimeSeriesData = (data, field = 'createdAt') => {
        const grouped = {}
        data.forEach(item => {
          const date = new Date(item[field])
          let key = ''
          
          switch (granularity) {
            case 'hour':
              key = date.toISOString().substring(0, 13) + ':00:00.000Z'
              break
            case 'day':
              key = date.toISOString().substring(0, 10)
              break
            case 'week':
              const weekStart = new Date(date)
              weekStart.setDate(date.getDate() - date.getDay())
              key = weekStart.toISOString().substring(0, 10)
              break
            case 'month':
              key = date.toISOString().substring(0, 7)
              break
          }
          
          if (!grouped[key]) grouped[key] = 0
          grouped[key] += item._count?.id || 1
        })
        
        return Object.entries(grouped).map(([date, count]) => ({
          date,
          count
        })).sort((a, b) => a.date.localeCompare(b.date))
      }

      const analytics = {
        period,
        granularity,
        dateRange: {
          startDate: startDate.toISOString(),
          endDate: now.toISOString()
        },
        userMetrics: {
          registrations: formatTimeSeriesData(userRegistrations),
          activities: userActivities.map(activity => ({
            action: activity.action,
            count: activity._count.id
          })),
          totalRegistrations: userRegistrations.reduce((sum, reg) => sum + reg._count.id, 0)
        },
        contentMetrics: {
          creationByCategory: contentCreation.map(content => ({
            category: content.category,
            count: content._count.id,
            avgViews: Math.round(content._avg.viewCount || 0)
          })),
          engagementTrend: formatTimeSeriesData(engagementMetrics),
          totalPosts: contentCreation.reduce((sum, content) => sum + content._count.id, 0),
          totalEngagement: engagementMetrics.reduce((sum, engagement) => sum + engagement._count.id, 0)
        },
        moderationMetrics: {
          actionsByType: moderationStats.map(stat => ({
            action: stat.action,
            count: stat._count.id
          })),
          totalActions: moderationStats.reduce((sum, stat) => sum + stat._count.id, 0)
        },
        systemMetrics: {
          reportsByType: systemPerformance.map(perf => ({
            type: perf.type,
            count: perf._count.id
          })),
          totalReports: systemPerformance.reduce((sum, perf) => sum + perf._count.id, 0)
        }
      }

      res.json({ analytics })
    } catch (error) {
      console.error("Get detailed analytics error:", error)
      res.status(500).json({ error: "Failed to fetch detailed analytics" })
    }
  }
)

// =============================================================================
// REPORT MANAGEMENT
// =============================================================================

// Get all reports with pagination and filtering
router.get("/reports",
  authenticateToken,
  requireAdmin,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status").optional().isIn(["pending", "reviewed", "resolved", "dismissed"]),
    query("type").optional().isIn(["technical", "inappropriate", "spam", "other"]),
    query("priority").optional().isIn(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    query("search").optional().trim(),
    query("sortBy").optional().isIn(["createdAt", "updatedAt", "priority", "status"]),
    query("sortOrder").optional().isIn(["asc", "desc"])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20
      const offset = (page - 1) * limit
      const { status, type, priority, search, sortBy = "createdAt", sortOrder = "desc" } = req.query

      const where = {
        ...(status && { status }),
        ...(type && { type }),
        ...(priority && { priority }),
        ...(search && {
          OR: [
            { description: { contains: search, mode: "insensitive" } },
            { type: { contains: search, mode: "insensitive" } }
          ]
        })
      }

      const orderBy = { [sortBy]: sortOrder }

      const [reports, total] = await Promise.all([
        prisma.report.findMany({
          where,
          include: {
            reporter: {
              select: {
                id: true,
                nickname: true,
                email: true,
                role: true
              }
            }
          },
          orderBy,
          skip: offset,
          take: limit
        }),
        prisma.report.count({ where })
      ])

      res.json({
        reports,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error("Get reports error:", error)
      res.status(500).json({ error: "Failed to fetch reports" })
    }
  }
)

// Get report statistics
router.get("/reports/stats",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const now = new Date()
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const [
        totalReports,
        pendingReports,
        resolvedReports,
        reportsLast24h,
        reportsLast7d,
        reportsLast30d,
        reportsByType,
        reportsByPriority,
        reportsByStatus,
        topReporters
      ] = await Promise.all([
        prisma.report.count(),
        prisma.report.count({ where: { status: "pending" } }),
        prisma.report.count({ where: { status: "resolved" } }),
        prisma.report.count({ where: { createdAt: { gte: last24h } } }),
        prisma.report.count({ where: { createdAt: { gte: last7d } } }),
        prisma.report.count({ where: { createdAt: { gte: last30d } } }),
        prisma.report.groupBy({
          by: ['type'],
          _count: { id: true }
        }),
        prisma.report.groupBy({
          by: ['priority'],
          _count: { id: true }
        }),
        prisma.report.groupBy({
          by: ['status'],
          _count: { id: true }
        }),
        prisma.report.groupBy({
          by: ['reporterId'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        })
      ])

      const stats = {
        overview: {
          total: totalReports,
          pending: pendingReports,
          resolved: resolvedReports,
          resolutionRate: totalReports > 0 ? ((resolvedReports / totalReports) * 100).toFixed(1) : 0
        },
        timeframes: {
          last24h: reportsLast24h,
          last7d: reportsLast7d,
          last30d: reportsLast30d
        },
        breakdown: {
          byType: reportsByType,
          byPriority: reportsByPriority,
          byStatus: reportsByStatus
        },
        trends: {
          topReporters: topReporters
        }
      }

      res.json({ stats })
    } catch (error) {
      console.error("Get report stats error:", error)
      res.status(500).json({ error: "Failed to fetch report statistics" })
    }
  }
)

// Get single report details
router.get("/reports/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params

      const report = await prisma.report.findUnique({
        where: { id },
        include: {
          reporter: {
            select: {
              id: true,
              nickname: true,
              email: true,
              role: true,
              createdAt: true
            }
          }
        }
      })

      if (!report) {
        return res.status(404).json({ error: "Report not found" })
      }

      res.json({ report })
    } catch (error) {
      console.error("Get report error:", error)
      res.status(500).json({ error: "Failed to fetch report" })
    }
  }
)

// Update report status and details
router.put("/reports/:id",
  authenticateToken,
  requireAdmin,
  [
    body("status").optional().isIn(["pending", "reviewed", "resolved", "dismissed"]),
    body("priority").optional().isIn(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    body("assignedTo").optional().isUUID(),
    body("resolution").optional().trim().isLength({ max: 1000 }),
    body("notes").optional().trim().isLength({ max: 500 })
  ],
  logAdminAction,
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const { id } = req.params
      const { status, priority, assignedTo, resolution, notes } = req.body

      const existingReport = await prisma.report.findUnique({
        where: { id }
      })

      if (!existingReport) {
        return res.status(404).json({ error: "Report not found" })
      }

      const updateData = {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(resolution && { resolution }),
        updatedAt: new Date()
      }

      // If resolving the report, set resolved details
      if (status === "resolved" || status === "dismissed") {
        updateData.resolvedBy = req.user.id
        updateData.resolvedAt = new Date()
      }

      const updatedReport = await prisma.report.update({
        where: { id },
        data: updateData,
        include: {
          reporter: {
            select: {
              id: true,
              nickname: true,
              email: true,
              role: true
            }
          }
        }
      })

      // Log the admin action
      req.adminAction = {
        action: "report_updated",
        targetType: "report",
        targetId: id,
        details: {
          previousStatus: existingReport.status,
          newStatus: status || existingReport.status,
          resolution: resolution,
          notes: notes
        }
      }

      res.json({
        message: "Report updated successfully",
        report: updatedReport
      })
    } catch (error) {
      console.error("Update report error:", error)
      res.status(500).json({ error: "Failed to update report" })
    }
  }
)

// Delete report
router.delete("/reports/:id",
  authenticateToken,
  requireAdmin,
  logAdminAction,
  async (req, res) => {
    try {
      const { id } = req.params

      const existingReport = await prisma.report.findUnique({
        where: { id }
      })

      if (!existingReport) {
        return res.status(404).json({ error: "Report not found" })
      }

      await prisma.report.delete({
        where: { id }
      })

      // Log the admin action
      req.adminAction = {
        action: "report_deleted",
        targetType: "report",
        targetId: id,
        details: {
          reportType: existingReport.type,
          reportStatus: existingReport.status
        }
      }

      res.json({ message: "Report deleted successfully" })
    } catch (error) {
      console.error("Delete report error:", error)
      res.status(500).json({ error: "Failed to delete report" })
    }
  }
)

// Assign report to admin/moderator
router.post("/reports/:id/assign",
  authenticateToken,
  requireAdmin,
  [
    body("assignedTo").isUUID()
  ],
  logAdminAction,
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const { id } = req.params
      const { assignedTo } = req.body

      // Verify the assigned user exists and has appropriate role
      const assignedUser = await prisma.user.findUnique({
        where: { id: assignedTo },
        select: { id: true, nickname: true, role: true }
      })

      if (!assignedUser) {
        return res.status(404).json({ error: "Assigned user not found" })
      }

      if (!["MODERATOR", "ADMIN", "SUPER_ADMIN"].includes(assignedUser.role)) {
        return res.status(400).json({ error: "User does not have permission to handle reports" })
      }

      const updatedReport = await prisma.report.update({
        where: { id },
        data: {
          assignedTo,
          status: "reviewed",
          updatedAt: new Date()
        },
        include: {
          reporter: {
            select: {
              id: true,
              nickname: true,
              email: true
            }
          }
        }
      })

      // Log the admin action
      req.adminAction = {
        action: "report_assigned",
        targetType: "report",
        targetId: id,
        details: {
          assignedTo: assignedUser.nickname,
          assignedUserId: assignedTo
        }
      }

      res.json({
        message: "Report assigned successfully",
        report: updatedReport
      })
    } catch (error) {
      console.error("Assign report error:", error)
      res.status(500).json({ error: "Failed to assign report" })
    }
  }
)

// =============================================================================
// AUDIT LOGS
// =============================================================================

// Get audit logs (admin actions)
router.get("/audit-logs",
  authenticateToken,
  requireAdmin,
  requirePermission("system.monitor"),
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("action").optional().trim(),
    query("targetType").optional().trim(),
    query("adminId").optional().isUUID(),
    query("category").optional().trim(),
    query("sortBy").optional().isIn(["createdAt", "action", "targetType"]),
    query("sortOrder").optional().isIn(["asc", "desc"])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 50
      const offset = (page - 1) * limit
      const { action, targetType, adminId, category, sortBy = "createdAt", sortOrder = "desc" } = req.query

      // Build where clause
      const where = {
        ...(action && { action: { contains: action, mode: "insensitive" } }),
        ...(targetType && { targetType }),
        ...(adminId && { adminId }),
        ...(category && {
          // Filter by category (permissions-related actions)
          ...(category === "permissions" && {
            action: {
              in: ["role_updated", "permission_granted", "permission_revoked", "permissions_bulk_updated"]
            }
          })
        })
      }

      // Build orderBy clause
      const orderBy = { [sortBy]: sortOrder }

      const [logs, total] = await Promise.all([
        prisma.adminAction.findMany({
          where,
          include: {
            admin: {
              select: {
                id: true,
                nickname: true,
                email: true
              }
            }
          },
          orderBy,
          skip: offset,
          take: limit
        }),
        prisma.adminAction.count({ where })
      ])

      // Format logs for frontend
      const formattedLogs = logs.map(log => ({
        id: log.id,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        details: log.details,
        createdAt: log.createdAt,
        moderator: {
          id: log.admin.id,
          nickname: log.admin.nickname
        }
      }))

      res.json({
        logs: formattedLogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error("Get audit logs error:", error)
      res.status(500).json({ error: "Failed to fetch audit logs" })
    }
  }
)

// =============================================================================
// PROFILE MANAGEMENT HELPERS
// =============================================================================

// Calculate profile completeness
const calculateProfileCompleteness = (user) => {
  const fields = [
    'fullName', 'bio', 'age', 'location', 'gender', 'occupation', 'avatar'
  ]
  const optionalFields = ['dateOfBirth', 'address', 'phone', 'website', 'interests']
  
  let completeness = 0
  let totalFields = fields.length + optionalFields.length
  
  // Required fields (higher weight)
  fields.forEach(field => {
    if (user[field] && user[field].toString().trim() !== '') {
      completeness += 2
    }
  })
  
  // Optional fields (lower weight)
  optionalFields.forEach(field => {
    if (user[field] && user[field].toString().trim() !== '') {
      completeness += 1
    }
  })
  
  // Interests array
  if (user.interests && user.interests.length > 0) {
    completeness += 1
  }
  
  // Social links
  if (user.socialLinks && Object.keys(user.socialLinks).length > 0) {
    completeness += 1
  }
  
  const maxScore = (fields.length * 2) + optionalFields.length + 2 // +2 for interests and social links
  return Math.round((completeness / maxScore) * 100)
}

// =============================================================================
// ADMIN SETTINGS MANAGEMENT
// =============================================================================

// Get all system settings
router.get("/settings",
  authenticateToken,
  requireAdmin,
  requirePermission("system.settings"),
  [
    query("category").optional().trim(),
    query("isPublic").optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const { category, isPublic } = req.query

      const where = {
        ...(category && { category }),
        ...(isPublic !== undefined && { isPublic: isPublic === 'true' })
      }

      const settings = await prisma.systemSetting.findMany({
        where,
        orderBy: [
          { category: "asc" },
          { key: "asc" }
        ]
      })

      // Group settings by category
      const groupedSettings = settings.reduce((acc, setting) => {
        if (!acc[setting.category]) {
          acc[setting.category] = []
        }
        acc[setting.category].push(setting)
        return acc
      }, {})

      res.json({ 
        settings: groupedSettings,
        total: settings.length
      })
    } catch (error) {
      console.error("Get settings error:", error)
      res.status(500).json({ error: "Failed to fetch settings" })
    }
  }
)

// Get a specific setting by key
router.get("/settings/:key",
  authenticateToken,
  requireAdmin,
  requirePermission("system.settings"),
  async (req, res) => {
    try {
      const { key } = req.params

      const setting = await prisma.systemSetting.findUnique({
        where: { key }
      })

      if (!setting) {
        return res.status(404).json({ error: "Setting not found" })
      }

      res.json({ setting })
    } catch (error) {
      console.error("Get setting error:", error)
      res.status(500).json({ error: "Failed to fetch setting" })
    }
  }
)

// Create a new setting
router.post("/settings",
  authenticateToken,
  requireAdmin,
  requirePermission("system.settings"),
  logAdminAction("setting_created"),
  [
    body("key").trim().isLength({ min: 1, max: 100 }).matches(/^[a-z0-9_]+$/),
    body("value").trim().isLength({ min: 0, max: 1000 }),
    body("description").optional().trim().isLength({ max: 500 }),
    body("category").trim().isLength({ min: 1, max: 50 }),
    body("isPublic").optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const { key, value, description, category, isPublic = false } = req.body

      // Check if key already exists
      const existingSetting = await prisma.systemSetting.findUnique({
        where: { key }
      })

      if (existingSetting) {
        return res.status(400).json({ error: "Setting with this key already exists" })
      }

      const setting = await prisma.systemSetting.create({
        data: {
          key,
          value,
          description,
          category,
          isPublic
        }
      })

      // Add details for admin action logging
      req.adminAction.details = {
        settingKey: key,
        category,
        isPublic
      }

      res.status(201).json({
        message: "Setting created successfully",
        setting
      })
    } catch (error) {
      console.error("Create setting error:", error)
      res.status(500).json({ error: "Failed to create setting" })
    }
  }
)

// Update an existing setting
router.put("/settings/:key",
  authenticateToken,
  requireAdmin,
  requirePermission("system.settings"),
  logAdminAction("setting_updated"),
  [
    body("value").trim().isLength({ min: 0, max: 1000 }),
    body("description").optional().trim().isLength({ max: 500 }),
    body("category").optional().trim().isLength({ min: 1, max: 50 }),
    body("isPublic").optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const { key } = req.params
      const updateData = { ...req.body }

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key]
        }
      })

      const setting = await prisma.systemSetting.update({
        where: { key },
        data: updateData
      })

      // Add details for admin action logging
      req.adminAction.details = {
        settingKey: key,
        updatedFields: updateData
      }

      res.json({
        message: "Setting updated successfully",
        setting
      })
    } catch (error) {
      console.error("Update setting error:", error)
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Setting not found" })
      }
      res.status(500).json({ error: "Failed to update setting" })
    }
  }
)

// Delete a setting
router.delete("/settings/:key",
  authenticateToken,
  requireSuperAdmin,
  logAdminAction("setting_deleted"),
  async (req, res) => {
    try {
      const { key } = req.params

      const setting = await prisma.systemSetting.delete({
        where: { key }
      })

      // Add details for admin action logging
      req.adminAction.details = {
        settingKey: key,
        deletedSetting: setting
      }

      res.json({
        message: "Setting deleted successfully"
      })
    } catch (error) {
      console.error("Delete setting error:", error)
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Setting not found" })
      }
      res.status(500).json({ error: "Failed to delete setting" })
    }
  }
)

// Bulk update settings
router.put("/settings",
  authenticateToken,
  requireAdmin,
  requirePermission("system.settings"),
  logAdminAction("settings_bulk_updated"),
  [
    body("settings").isArray().custom((settings) => {
      if (settings.length === 0) {
        throw new Error("Settings array cannot be empty")
      }
      for (const setting of settings) {
        if (!setting.key || !setting.value) {
          throw new Error("Each setting must have key and value")
        }
      }
      return true
    })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const { settings } = req.body

      // Use transaction for bulk update
      const updatedSettings = await prisma.$transaction(
        settings.map(setting => 
          prisma.systemSetting.update({
            where: { key: setting.key },
            data: {
              value: setting.value,
              ...(setting.description && { description: setting.description }),
              ...(setting.category && { category: setting.category }),
              ...(setting.isPublic !== undefined && { isPublic: setting.isPublic })
            }
          })
        )
      )

      // Add details for admin action logging
      req.adminAction.details = {
        updatedCount: settings.length,
        settingKeys: settings.map(s => s.key)
      }

      res.json({
        message: "Settings updated successfully",
        settings: updatedSettings
      })
    } catch (error) {
      console.error("Bulk update settings error:", error)
      res.status(500).json({ error: "Failed to update settings" })
    }
  }
)

// =============================================================================
// ADMIN ARTISTS MANAGEMENT
// =============================================================================

// Get all artists (users with artist role or special designation)
router.get("/artists",
  authenticateToken,
  requireAdmin,
  requirePermission("user.view"),
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("search").optional().trim(),
    query("isActive").optional().isBoolean(),
    query("sortBy").optional().isIn(["createdAt", "nickname", "email", "lastLoginAt"]),
    query("sortOrder").optional().isIn(["asc", "desc"])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20
      const offset = (page - 1) * limit
      const { search, isActive, sortBy = "createdAt", sortOrder = "desc" } = req.query

      // Define artist criteria - users with specific roles or interests
      const where = {
        OR: [
          { role: { in: ["MODERATOR", "ADMIN"] } },
          { interests: { has: "artist" } },
          { interests: { has: "performer" } },
          { interests: { has: "entertainer" } },
          { bio: { contains: "artist", mode: "insensitive" } },
          { bio: { contains: "performer", mode: "insensitive" } },
          { occupation: { contains: "artist", mode: "insensitive" } }
        ],
        ...(search && {
          AND: [
            {
              OR: [
                { nickname: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { fullName: { contains: search, mode: "insensitive" } },
                { bio: { contains: search, mode: "insensitive" } }
              ]
            }
          ]
        }),
        ...(isActive !== undefined && { isActive: isActive === 'true' })
      }

      const orderBy = { [sortBy]: sortOrder }

      const [artists, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            nickname: true,
            email: true,
            fullName: true,
            bio: true,
            avatar: true,
            age: true,
            location: true,
            gender: true,
            occupation: true,
            interests: true,
            role: true,
            isActive: true,
            isBlocked: true,
            isSuspended: true,
            createdAt: true,
            updatedAt: true,
            lastLoginAt: true,
            lastActiveAt: true,
            _count: {
              select: {
                posts: true,
                comments: true,
                likes: true,
                chatMessages: true
              }
            }
          },
          orderBy,
          skip: offset,
          take: limit
        }),
        prisma.user.count({ where })
      ])

      // Calculate artist metrics and rankings
      const artistsWithMetrics = artists.map((artist, index) => ({
        ...artist,
        ranking: offset + index + 1,
        stats: {
          postsCount: artist._count.posts,
          commentsCount: artist._count.comments,
          likesCount: artist._count.likes,
          messagesCount: artist._count.chatMessages,
          totalActivity: artist._count.posts + artist._count.comments + artist._count.likes
        },
        isArtist: true,
        _count: undefined
      }))

      res.json({
        artists: artistsWithMetrics,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error("Get artists error:", error)
      res.status(500).json({ error: "Failed to fetch artists" })
    }
  }
)

// Get specific artist details
router.get("/artists/:id",
  authenticateToken,
  requireAdmin,
  requirePermission("user.view"),
  async (req, res) => {
    try {
      const { id } = req.params

      const artist = await prisma.user.findUnique({
        where: { id },
        include: {
          posts: {
            select: {
              id: true,
              title: true,
              category: true,
              viewCount: true,
              createdAt: true,
              _count: {
                select: {
                  comments: true,
                  likes: true
                }
              }
            },
            orderBy: { createdAt: "desc" },
            take: 10
          },
          _count: {
            select: {
              posts: true,
              comments: true,
              likes: true,
              chatMessages: true,
              reports: true
            }
          }
        }
      })

      if (!artist) {
        return res.status(404).json({ error: "Artist not found" })
      }

      // Remove password from response
      const { password, ...artistWithoutPassword } = artist

      // Calculate additional metrics
      const totalViews = artist.posts.reduce((sum, post) => sum + post.viewCount, 0)
      const totalInteractions = artist.posts.reduce((sum, post) => 
        sum + post._count.comments + post._count.likes, 0)

      res.json({
        artist: {
          ...artistWithoutPassword,
          stats: {
            postsCount: artist._count.posts,
            commentsCount: artist._count.comments,
            likesCount: artist._count.likes,
            messagesCount: artist._count.chatMessages,
            reportsCount: artist._count.reports,
            totalViews,
            totalInteractions,
            avgViewsPerPost: artist._count.posts > 0 ? Math.round(totalViews / artist._count.posts) : 0
          },
          recentPosts: artist.posts.map(post => ({
            ...post,
            stats: {
              comments: post._count.comments,
              likes: post._count.likes
            },
            _count: undefined
          })),
          _count: undefined
        }
      })
    } catch (error) {
      console.error("Get artist error:", error)
      res.status(500).json({ error: "Failed to fetch artist" })
    }
  }
)

// Update artist status (promote/demote artist designation)
router.patch("/artists/:id/status",
  authenticateToken,
  requireAdmin,
  requirePermission("user.edit"),
  logAdminAction("artist_status_updated"),
  [
    body("isArtist").isBoolean(),
    body("artistRole").optional().isIn(["featured", "verified", "premium", "standard"]),
    body("reason").optional().trim().isLength({ max: 500 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const { id } = req.params
      const { isArtist, artistRole, reason } = req.body

      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, nickname: true, interests: true }
      })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Update user interests to include/remove artist designation
      let updatedInterests = user.interests || []
      
      if (isArtist) {
        // Add artist-related interests if not present
        const artistInterests = ["artist", "performer"]
        artistInterests.forEach(interest => {
          if (!updatedInterests.includes(interest)) {
            updatedInterests.push(interest)
          }
        })
        
        // Add artist role if specified
        if (artistRole) {
          updatedInterests = updatedInterests.filter(i => !i.startsWith("artist_"))
          updatedInterests.push(`artist_${artistRole}`)
        }
      } else {
        // Remove artist-related interests
        updatedInterests = updatedInterests.filter(interest => 
          !["artist", "performer", "entertainer"].includes(interest) &&
          !interest.startsWith("artist_")
        )
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          interests: updatedInterests
        },
        select: {
          id: true,
          nickname: true,
          interests: true,
          bio: true,
          occupation: true
        }
      })

      // Add details for admin action logging
      req.adminAction.details = {
        targetUser: user.nickname,
        isArtist,
        artistRole,
        reason,
        previousInterests: user.interests,
        newInterests: updatedInterests
      }

      res.json({
        message: `Artist status ${isArtist ? 'granted' : 'removed'} successfully`,
        user: updatedUser
      })
    } catch (error) {
      console.error("Update artist status error:", error)
      res.status(500).json({ error: "Failed to update artist status" })
    }
  }
)

// Feature/unfeature an artist
router.patch("/artists/:id/feature",
  authenticateToken,
  requireAdmin,
  requirePermission("content.feature"),
  logAdminAction("artist_featured"),
  [
    body("featured").isBoolean(),
    body("reason").optional().trim().isLength({ max: 500 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const { id } = req.params
      const { featured, reason } = req.body

      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, nickname: true, interests: true }
      })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      // Update user interests to add/remove featured status
      let updatedInterests = user.interests || []
      
      if (featured) {
        if (!updatedInterests.includes("featured_artist")) {
          updatedInterests.push("featured_artist")
        }
      } else {
        updatedInterests = updatedInterests.filter(interest => interest !== "featured_artist")
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          interests: updatedInterests
        },
        select: {
          id: true,
          nickname: true,
          interests: true
        }
      })

      // Add details for admin action logging
      req.adminAction.details = {
        targetUser: user.nickname,
        featured,
        reason,
        previousInterests: user.interests,
        newInterests: updatedInterests
      }

      res.json({
        message: `Artist ${featured ? 'featured' : 'unfeatured'} successfully`,
        user: updatedUser
      })
    } catch (error) {
      console.error("Feature artist error:", error)
      res.status(500).json({ error: "Failed to update artist feature status" })
    }
  }
)

// Get artist rankings and statistics
router.get("/artists/rankings/stats",
  authenticateToken,
  requireAdmin,
  requirePermission("user.view"),
  [
    query("period").optional().isIn(["week", "month", "year", "all"]),
    query("category").optional().isIn(["posts", "likes", "comments", "activity", "views"])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const { period = "month", category = "activity" } = req.query

      // Calculate date range
      const now = new Date()
      let startDate = new Date()
      switch (period) {
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case "year":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
        case "all":
          startDate = new Date("1970-01-01")
          break
      }

      // Get artists with activity in the specified period
      const artists = await prisma.user.findMany({
        where: {
          OR: [
            { interests: { has: "artist" } },
            { interests: { has: "performer" } },
            { interests: { hasSome: ["featured_artist", "artist_verified", "artist_premium"] } }
          ],
          isActive: true,
          ...(period !== "all" && {
            OR: [
              { posts: { some: { createdAt: { gte: startDate } } } },
              { comments: { some: { createdAt: { gte: startDate } } } },
              { likes: { some: { createdAt: { gte: startDate } } } }
            ]
          })
        },
        include: {
          _count: {
            select: {
              posts: period !== "all" ? { where: { createdAt: { gte: startDate } } } : true,
              comments: period !== "all" ? { where: { createdAt: { gte: startDate } } } : true,
              likes: period !== "all" ? { where: { createdAt: { gte: startDate } } } : true
            }
          },
          posts: {
            select: {
              viewCount: true,
              createdAt: true
            },
            ...(period !== "all" && { where: { createdAt: { gte: startDate } } })
          }
        }
      })

      // Calculate rankings based on category
      const artistsWithScores = artists.map(artist => {
        const totalViews = artist.posts.reduce((sum, post) => sum + post.viewCount, 0)
        let score = 0

        switch (category) {
          case "posts":
            score = artist._count.posts
            break
          case "likes":
            score = artist._count.likes
            break
          case "comments":
            score = artist._count.comments
            break
          case "views":
            score = totalViews
            break
          case "activity":
          default:
            score = artist._count.posts * 3 + artist._count.comments * 2 + artist._count.likes + (totalViews * 0.1)
            break
        }

        return {
          id: artist.id,
          nickname: artist.nickname,
          avatar: artist.avatar,
          bio: artist.bio,
          interests: artist.interests,
          stats: {
            posts: artist._count.posts,
            comments: artist._count.comments,
            likes: artist._count.likes,
            views: totalViews,
            score: Math.round(score)
          },
          isFeatured: artist.interests?.includes("featured_artist") || false,
          isVerified: artist.interests?.includes("artist_verified") || false
        }
      })

      // Sort by score and add rankings
      artistsWithScores.sort((a, b) => b.stats.score - a.stats.score)
      const rankedArtists = artistsWithScores.map((artist, index) => ({
        ...artist,
        rank: index + 1
      }))

      // Calculate category statistics
      const stats = {
        totalArtists: rankedArtists.length,
        featuredArtists: rankedArtists.filter(a => a.isFeatured).length,
        verifiedArtists: rankedArtists.filter(a => a.isVerified).length,
        period,
        category,
        topScore: rankedArtists[0]?.stats.score || 0,
        avgScore: rankedArtists.length > 0 
          ? Math.round(rankedArtists.reduce((sum, a) => sum + a.stats.score, 0) / rankedArtists.length)
          : 0
      }

      res.json({
        rankings: rankedArtists.slice(0, 50), // Top 50
        stats,
        generatedAt: now.toISOString()
      })
    } catch (error) {
      console.error("Get artist rankings error:", error)
      res.status(500).json({ error: "Failed to fetch artist rankings" })
    }
  }
)

module.exports = router 