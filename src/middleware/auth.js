const jwt = require("jsonwebtoken")
const prisma = require("../config/database")

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        nickname: true,
        email: true,
        isGuest: true,
        role: true,
        isActive: true,
        isBlocked: true,
        isSuspended: true,
        suspendedUntil: true,
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(401).json({ error: "User not found" })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ error: "Account is inactive" })
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ error: "Account is blocked" })
    }

    // Check if user is suspended
    if (user.isSuspended) {
      if (user.suspendedUntil && user.suspendedUntil > new Date()) {
        return res.status(403).json({ 
          error: "Account is suspended",
          suspendedUntil: user.suspendedUntil 
        })
      } else if (user.suspendedUntil && user.suspendedUntil <= new Date()) {
        // Suspension has expired, reactivate account
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            isSuspended: false,
            suspendedUntil: null,
            suspendReason: null
          }
        })
        user.isSuspended = false
        user.suspendedUntil = null
      }
    }

    req.user = user
    next()
  } catch (error) {
    console.error("Auth error:", error)
    return res.status(403).json({ error: "Invalid or expired token" })
  }
}

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    req.user = null
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        nickname: true,
        email: true,
        isGuest: true,
        role: true,
        isActive: true,
        isBlocked: true,
        isSuspended: true,
        suspendedUntil: true,
        createdAt: true,
      },
    })

    // Only set user if account is active and not blocked/suspended
    if (user && user.isActive && !user.isBlocked && !user.isSuspended) {
      req.user = user
    } else {
      req.user = null
    }
  } catch (error) {
    req.user = null
  }

  next()
}

// Admin role checking middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" })
    }

    const userRole = req.user.role
    const allowedRoles = Array.isArray(roles) ? roles : [roles]

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: "Insufficient permissions" })
    }

    next()
  }
}

// Permission checking middleware
const requirePermission = (permissionName) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" })
    }

    try {
      // Auto-grant all permissions to SUPER_ADMIN and ADMIN users
      if (req.user.role === "SUPER_ADMIN" || req.user.role === "ADMIN") {
        return next()
      }

      // Check if user has the required permission
      const userPermission = await prisma.userPermission.findFirst({
        where: {
          userId: req.user.id,
          permission: {
            name: permissionName
          },
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        include: {
          permission: true
        }
      })

      if (!userPermission) {
        return res.status(403).json({ 
          error: "Insufficient permissions",
          required: permissionName 
        })
      }

      next()
    } catch (error) {
      console.error("Permission check error:", error)
      return res.status(500).json({ error: "Failed to check permissions" })
    }
  }
}

// Admin access middleware (requires ADMIN, MODERATOR, or SUPER_ADMIN role)
const requireAdmin = requireRole(["ADMIN", "MODERATOR", "SUPER_ADMIN"])

// Super admin access middleware
const requireSuperAdmin = requireRole("SUPER_ADMIN")

// Log admin action middleware
const logAdminAction = (action) => {
  return async (req, res, next) => {
    // Store the action info for logging after the request completes
    req.adminAction = {
      action,
      targetType: req.params.targetType || null,
      targetId: req.params.id || req.params.userId || req.params.postId || null,
      details: {},
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    }

    // Override res.json to log the action after successful response
    const originalJson = res.json
    res.json = function(data) {
      // Log the action only if the response is successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logAdminActionToDatabase(req.user.id, {
          ...req.adminAction,
          details: { ...req.adminAction.details, response: data }
        })
      }
      return originalJson.call(this, data)
    }

    next()
  }
}

// Helper function to log admin actions to database
const logAdminActionToDatabase = async (adminId, actionData) => {
  try {
    await prisma.adminAction.create({
      data: {
        adminId,
        action: actionData.action,
        targetType: actionData.targetType,
        targetId: actionData.targetId,
        details: actionData.details,
        ipAddress: actionData.ipAddress,
        userAgent: actionData.userAgent,
      }
    })
  } catch (error) {
    console.error("Failed to log admin action:", error)
  }
}

// Helper function to log user activities
const logUserActivity = async (userId, action, details = null, req = null) => {
  try {
    await prisma.userActivity.create({
      data: {
        userId,
        action,
        details,
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.get('User-Agent')
      }
    })
  } catch (error) {
    console.error("Failed to log user activity:", error)
  }
}

// Middleware to log user activity
const logActivity = (action, getDetails = null) => {
  return async (req, res, next) => {
    // Store the activity info for logging after the request completes
    req.activityToLog = {
      action,
      getDetails
    }

    // Override res.json to log the activity after successful response
    const originalJson = res.json
    res.json = function(data) {
      // Log the activity only if the response is successful and user is authenticated
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const details = req.activityToLog.getDetails ? req.activityToLog.getDetails(req, data) : null
        logUserActivity(req.user.id, req.activityToLog.action, details, req)
      }
      return originalJson.call(this, data)
    }

    next()
  }
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  requirePermission,
  requireAdmin,
  requireSuperAdmin,
  logAdminAction,
  logUserActivity,
  logActivity,
}
