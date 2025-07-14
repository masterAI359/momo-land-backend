const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs").promises
const { PrismaClient } = require("@prisma/client")
const auth = require("../middleware/auth")

const router = express.Router()
const prisma = new PrismaClient()

// Configure multer for story media uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads/stories")
    try {
      await fs.mkdir(uploadDir, { recursive: true })
      cb(null, uploadDir)
    } catch (error) {
      cb(error)
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, `story-${uniqueSuffix}${path.extname(file.originalname)}`)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm|mov|avi/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Only image and video files are allowed for stories"))
    }
  },
})

// Get all active stories from followed users
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id

    // Get followed users
    const follows = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    })

    const followedUserIds = follows.map((f) => f.followingId)
    followedUserIds.push(userId) // Include own stories

    // Get active stories (not expired)
    const stories = await prisma.story.findMany({
      where: {
        authorId: { in: followedUserIds },
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            femaleProfile: {
              select: {
                stageName: true,
              },
            },
          },
        },
        views: {
          select: {
            viewerId: true,
            viewedAt: true,
          },
        },
        _count: {
          select: {
            views: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Group stories by author
    const groupedStories = stories.reduce((acc, story) => {
      const authorId = story.authorId
      if (!acc[authorId]) {
        acc[authorId] = {
          author: story.author,
          stories: [],
          hasUnviewed: false,
        }
      }

      const hasViewed = story.views.some((view) => view.viewerId === userId)
      if (!hasViewed) {
        acc[authorId].hasUnviewed = true
      }

      acc[authorId].stories.push({
        ...story,
        hasViewed,
      })

      return acc
    }, {})

    res.json(Object.values(groupedStories))
  } catch (error) {
    console.error("Error fetching stories:", error)
    res.status(500).json({ error: "Failed to fetch stories" })
  }
})

// Get specific user's stories
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params
    const viewerId = req.user.id

    const stories = await prisma.story.findMany({
      where: {
        authorId: userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            femaleProfile: {
              select: {
                stageName: true,
              },
            },
          },
        },
        views: {
          select: {
            viewerId: true,
            viewedAt: true,
          },
        },
        _count: {
          select: {
            views: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    // Mark stories as viewed if not the author
    if (userId !== viewerId) {
      for (const story of stories) {
        const hasViewed = story.views.some((view) => view.viewerId === viewerId)
        if (!hasViewed) {
          await prisma.storyView.create({
            data: {
              storyId: story.id,
              viewerId: viewerId,
            },
          })
        }
      }
    }

    const storiesWithViewStatus = stories.map((story) => ({
      ...story,
      hasViewed: story.views.some((view) => view.viewerId === viewerId),
    }))

    res.json(storiesWithViewStatus)
  } catch (error) {
    console.error("Error fetching user stories:", error)
    res.status(500).json({ error: "Failed to fetch user stories" })
  }
})

// Create a new story
router.post("/", auth, upload.single("media"), async (req, res) => {
  try {
    const userId = req.user.id
    const { content, mediaType, duration, backgroundColor, textColor, fontSize, fontStyle, stickers } = req.body

    let mediaUrl = null
    let parsedStickers = null

    if (req.file) {
      mediaUrl = `/uploads/stories/${req.file.filename}`
    }

    if (stickers) {
      try {
        parsedStickers = JSON.parse(stickers)
      } catch (e) {
        parsedStickers = null
      }
    }

    // Set expiration to 24 hours from now
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const story = await prisma.story.create({
      data: {
        authorId: userId,
        content: content || null,
        mediaUrl,
        mediaType: mediaType || (req.file ? (req.file.mimetype.startsWith("video/") ? "VIDEO" : "IMAGE") : "TEXT"),
        duration: duration ? Number.parseInt(duration) : 5,
        backgroundColor: backgroundColor || null,
        textColor: textColor || null,
        fontSize: fontSize || null,
        fontStyle: fontStyle || null,
        stickers: parsedStickers,
        expiresAt,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            femaleProfile: {
              select: {
                stageName: true,
              },
            },
          },
        },
        _count: {
          select: {
            views: true,
          },
        },
      },
    })

    res.status(201).json(story)
  } catch (error) {
    console.error("Error creating story:", error)
    res.status(500).json({ error: "Failed to create story" })
  }
})

// Delete a story
router.delete("/:storyId", auth, async (req, res) => {
  try {
    const { storyId } = req.params
    const userId = req.user.id

    const story = await prisma.story.findUnique({
      where: { id: storyId },
    })

    if (!story) {
      return res.status(404).json({ error: "Story not found" })
    }

    if (story.authorId !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this story" })
    }

    // Delete media file if exists
    if (story.mediaUrl) {
      try {
        const filePath = path.join(__dirname, "../../", story.mediaUrl)
        await fs.unlink(filePath)
      } catch (error) {
        console.error("Error deleting story media file:", error)
      }
    }

    await prisma.story.delete({
      where: { id: storyId },
    })

    res.json({ message: "Story deleted successfully" })
  } catch (error) {
    console.error("Error deleting story:", error)
    res.status(500).json({ error: "Failed to delete story" })
  }
})

// Get story views
router.get("/:storyId/views", auth, async (req, res) => {
  try {
    const { storyId } = req.params
    const userId = req.user.id

    const story = await prisma.story.findUnique({
      where: { id: storyId },
    })

    if (!story) {
      return res.status(404).json({ error: "Story not found" })
    }

    if (story.authorId !== userId) {
      return res.status(403).json({ error: "Not authorized to view story analytics" })
    }

    const views = await prisma.storyView.findMany({
      where: { storyId },
      include: {
        viewer: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
      orderBy: { viewedAt: "desc" },
    })

    res.json(views)
  } catch (error) {
    console.error("Error fetching story views:", error)
    res.status(500).json({ error: "Failed to fetch story views" })
  }
})

// Cleanup expired stories (should be run as a cron job)
router.post("/cleanup", async (req, res) => {
  try {
    const expiredStories = await prisma.story.findMany({
      where: {
        expiresAt: { lt: new Date() },
        isActive: true,
      },
    })

    // Delete media files
    for (const story of expiredStories) {
      if (story.mediaUrl) {
        try {
          const filePath = path.join(__dirname, "../../", story.mediaUrl)
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

    res.json({
      message: "Cleanup completed",
      expiredCount: expiredStories.length,
    })
  } catch (error) {
    console.error("Error cleaning up expired stories:", error)
    res.status(500).json({ error: "Failed to cleanup expired stories" })
  }
})

module.exports = router
