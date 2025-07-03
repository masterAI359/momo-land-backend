const express = require("express")
const prisma = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        _count: {
          select: {
            posts: true,
            comments: true,
            likes: true,
            chatRooms: true,
          },
        },
      },
      select: {
        id: true,
        nickname: true,
        email: true,
        isGuest: true,
        createdAt: true,
        _count: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      user: {
        ...user,
        stats: {
          postsCount: user._count.posts,
          commentsCount: user._count.comments,
          likesCount: user._count.likes,
          roomsCreated: user._count.chatRooms,
        },
        _count: undefined,
      },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ error: "Failed to fetch user profile" })
  }
})

// Get user's posts
router.get("/posts", authenticateToken, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        authorId: req.user.id,
      },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    res.json({
      posts: posts.map((post) => ({
        ...post,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        _count: undefined,
      })),
    })
  } catch (error) {
    console.error("Get user posts error:", error)
    res.status(500).json({ error: "Failed to fetch user posts" })
  }
})

module.exports = router
