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
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(401).json({ error: "User not found" })
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
        createdAt: true,
      },
    })

    req.user = user
  } catch (error) {
    req.user = null
  }

  next()
}

module.exports = {
  authenticateToken,
  optionalAuth,
}
