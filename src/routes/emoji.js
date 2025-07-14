const express = require("express")
const { body, validationResult } = require("express-validator")
const prisma = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Add emoji reaction
router.post(
  "/react",
  [
    body("emoji").trim().isLength({ min: 1, max: 10 }),
    body("postId").optional().isUUID(),
    body("commentId").optional().isUUID(),
  ],
  authenticateToken,
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        })
      }

      const { emoji, postId, commentId } = req.body

      if (!postId && !commentId) {
        return res.status(400).json({ error: "Either postId or commentId is required" })
      }

      // Check if target exists
      if (postId) {
        const post = await prisma.post.findUnique({ where: { id: postId } })
        if (!post) {
          return res.status(404).json({ error: "Post not found" })
        }
      }

      if (commentId) {
        const comment = await prisma.comment.findUnique({ where: { id: commentId } })
        if (!comment) {
          return res.status(404).json({ error: "Comment not found" })
        }
      }

      // Check if reaction already exists
      const existingReaction = await prisma.emojiReaction.findFirst({
        where: {
          userId: req.user.id,
          emoji,
          ...(postId && { postId }),
          ...(commentId && { commentId }),
        },
      })

      if (existingReaction) {
        // Remove reaction
        await prisma.emojiReaction.delete({
          where: { id: existingReaction.id },
        })

        res.json({ message: "Reaction removed", action: "removed" })
      } else {
        // Add reaction
        const reaction = await prisma.emojiReaction.create({
          data: {
            emoji,
            userId: req.user.id,
            ...(postId && { postId }),
            ...(commentId && { commentId }),
          },
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
              },
            },
          },
        })

        res.json({ message: "Reaction added", action: "added", reaction })
      }
    } catch (error) {
      console.error("Emoji reaction error:", error)
      res.status(500).json({ error: "Failed to process emoji reaction" })
    }
  },
)

// Get reactions for a post or comment
router.get("/reactions", async (req, res) => {
  try {
    const { postId, commentId } = req.query

    if (!postId && !commentId) {
      return res.status(400).json({ error: "Either postId or commentId is required" })
    }

    const reactions = await prisma.emojiReaction.findMany({
      where: {
        ...(postId && { postId }),
        ...(commentId && { commentId }),
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Group reactions by emoji
    const groupedReactions = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: [],
        }
      }
      acc[reaction.emoji].count++
      acc[reaction.emoji].users.push(reaction.user)
      return acc
    }, {})

    res.json({
      reactions: Object.values(groupedReactions),
      total: reactions.length,
    })
  } catch (error) {
    console.error("Get reactions error:", error)
    res.status(500).json({ error: "Failed to fetch reactions" })
  }
})

// Get popular emojis
router.get("/popular", async (req, res) => {
  try {
    const popularEmojis = await prisma.emojiReaction.groupBy({
      by: ["emoji"],
      _count: {
        emoji: true,
      },
      orderBy: {
        _count: {
          emoji: "desc",
        },
      },
      take: 20,
    })

    res.json({
      popularEmojis: popularEmojis.map((item) => ({
        emoji: item.emoji,
        count: item._count.emoji,
      })),
    })
  } catch (error) {
    console.error("Get popular emojis error:", error)
    res.status(500).json({ error: "Failed to fetch popular emojis" })
  }
})

module.exports = router
