const express = require("express")
const { body, validationResult, query } = require("express-validator")
const prisma = require("../config/database")
<<<<<<< HEAD
const { authenticateToken, optionalAuth } = require("../middleware/auth")
=======
const { authenticateToken, optionalAuth, logUserActivity, logActivity } = require("../middleware/auth")
const { emitToRoom } = require("../socket/socketService")
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4

const router = express.Router()

// Get all posts with pagination and filtering
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 50 }),
    query("category").optional().trim(),
    query("search").optional().trim(),
    query("sortBy").optional().isIn(["createdAt", "likes", "views", "comments"]),
  ],
  optionalAuth,
  logActivity("page_view", (req, data) => ({
    page: "posts",
    filters: {
      category: req.query.category,
      search: req.query.search,
      sortBy: req.query.sortBy
    },
    resultCount: data.posts?.length || 0
  })),
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        })
      }

      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 10
      const offset = (page - 1) * limit
      const { category, search, sortBy = "createdAt" } = req.query

      // Build where clause
      const where = {
        isPublished: true,
        ...(category && { category }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ],
        }),
      }

      // Build orderBy clause
      let orderBy = {}
      switch (sortBy) {
        case "likes":
          orderBy = { likes: { _count: "desc" } }
          break
        case "views":
          orderBy = { viewCount: "desc" }
          break
        case "comments":
          orderBy = { comments: { _count: "desc" } }
          break
        default:
          orderBy = { createdAt: "desc" }
      }

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where,
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
                femaleProfile: {
                  select: {
                    stageName: true,
                    avatar: true,
                  },
                },
              },
            },
            mediaAttachments: {
              orderBy: { createdAt: "asc" },
            },
            emojiReactions: {
              include: {
                user: {
                  select: {
                    id: true,
                    nickname: true,
                    avatar: true,
                  },
                },
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
                emojiReactions: true,
              },
            },
          },
          orderBy,
          skip: offset,
          take: limit,
        }),
        prisma.post.count({ where }),
      ])

      // Process emoji reactions
      const processedPosts = posts.map((post) => {
        const groupedReactions = post.emojiReactions.reduce((acc, reaction) => {
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

        return {
          ...post,
          likesCount: post._count.likes,
          commentsCount: post._count.comments,
          reactionsCount: post._count.emojiReactions,
          reactions: Object.values(groupedReactions),
          emojiReactions: undefined,
          _count: undefined,
        }
      })

      res.json({
        posts: processedPosts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      console.error("Get posts error:", error)
      res.status(500).json({ error: "Failed to fetch posts" })
    }
  },
)

// Get single post
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            femaleProfile: {
              select: {
                stageName: true,
                avatar: true,
              },
            },
          },
        },
        mediaAttachments: {
          orderBy: { createdAt: "asc" },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
              },
            },
            emojiReactions: {
              include: {
                user: {
                  select: {
                    id: true,
                    nickname: true,
                    avatar: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        emojiReactions: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            emojiReactions: true,
          },
        },
      },
    })

    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    // Increment view count
    await prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    // Check if current user liked the post
    let isLiked = false
    if (req.user) {
      const like = await prisma.like.findUnique({
        where: {
          postId_userId: {
            postId: id,
            userId: req.user.id,
          },
        },
      })
      isLiked = !!like
    }

    // Process emoji reactions for post
    const groupedReactions = post.emojiReactions.reduce((acc, reaction) => {
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

    // Process emoji reactions for comments
    const processedComments = post.comments.map((comment) => {
      const commentReactions = comment.emojiReactions.reduce((acc, reaction) => {
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

      return {
        ...comment,
        reactions: Object.values(commentReactions),
        emojiReactions: undefined,
      }
    })

    res.json({
      ...post,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      reactionsCount: post._count.emojiReactions,
      reactions: Object.values(groupedReactions),
      comments: processedComments,
      isLiked,
      emojiReactions: undefined,
      _count: undefined,
    })
  } catch (error) {
    console.error("Get post error:", error)
    res.status(500).json({ error: "Failed to fetch post" })
  }
})

// Create post with media
router.post(
  "/",
  [
    body("title").trim().isLength({ min: 1, max: 200 }),
    body("content").trim().isLength({ min: 10 }),
    body("category").trim().isIn(["初心者向け", "上級者向け", "おすすめ", "レビュー"]),
    body("excerpt").optional().trim().isLength({ max: 500 }),
    body("mood").optional().trim().isIn(["excited", "happy", "peaceful", "grateful", "determined"]),
    body("mediaIds").optional().isArray(),
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

      const { title, content, category, excerpt, mood, mediaIds = [] } = req.body

      // Verify media attachments belong to user or are unassigned
      if (mediaIds.length > 0) {
        const mediaAttachments = await prisma.mediaAttachment.findMany({
          where: {
            id: { in: mediaIds },
            postId: null, // Only unassigned media
          },
        })

        if (mediaAttachments.length !== mediaIds.length) {
          return res.status(400).json({ error: "Invalid media attachments" })
        }
      }

      const post = await prisma.post.create({
        data: {
          title,
          content,
          category,
          excerpt: excerpt || content.substring(0, 200) + "...",
          mood,
          authorId: req.user.id,
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
                  avatar: true,
                },
              },
            },
          },
          mediaAttachments: true,
          _count: {
            select: {
              likes: true,
              comments: true,
              emojiReactions: true,
            },
          },
        },
      })

      // Attach media to post
      if (mediaIds.length > 0) {
        await prisma.mediaAttachment.updateMany({
          where: {
            id: { in: mediaIds },
          },
          data: {
            postId: post.id,
          },
        })

<<<<<<< HEAD
        // Fetch updated post with media
        const updatedPost = await prisma.post.findUnique({
          where: { id: post.id },
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
                femaleProfile: {
                  select: {
                    stageName: true,
                    avatar: true,
                  },
                },
              },
            },
            mediaAttachments: {
              orderBy: { createdAt: "asc" },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
                emojiReactions: true,
              },
            },
          },
        })

        return res.status(201).json({
          message: "Post created successfully",
          post: {
            ...updatedPost,
            likesCount: updatedPost._count.likes,
            commentsCount: updatedPost._count.comments,
            reactionsCount: updatedPost._count.emojiReactions,
            reactions: [],
            _count: undefined,
          },
        })
      }
=======
      // Log user activity
      await logUserActivity(req.user.id, "post_created", {
        postId: post.id,
        title: post.title,
        category: post.category
      }, req);

      // Emit real-time event for new post
      emitToRoom("blog-room", "new-post", postData)
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4

      res.status(201).json({
        message: "Post created successfully",
        post: {
          ...post,
          likesCount: post._count.likes,
          commentsCount: post._count.comments,
          reactionsCount: post._count.emojiReactions,
          reactions: [],
          _count: undefined,
        },
      })
    } catch (error) {
      console.error("Create post error:", error)
      res.status(500).json({ error: "Failed to create post" })
    }
  },
)

// Like/unlike post
router.post("/:id/like", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id },
    })

    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId: req.user.id,
        },
      },
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          postId_userId: {
            postId: id,
            userId: req.user.id,
          },
        },
      })

      res.json({ message: "Post unliked", isLiked: false })
    } else {
      // Like
      await prisma.like.create({
        data: {
          postId: id,
          userId: req.user.id,
        },
      })

      res.json({ message: "Post liked", isLiked: true })
    }
  } catch (error) {
    console.error("Like post error:", error)
    res.status(500).json({ error: "Failed to like/unlike post" })
  }
})

// Add comment to post
router.post(
  "/:id/comments",
  [body("content").trim().isLength({ min: 1, max: 1000 })],
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

      const { id } = req.params
      const { content } = req.body

      // Check if post exists
      const post = await prisma.post.findUnique({
        where: { id },
      })

      if (!post) {
        return res.status(404).json({ error: "Post not found" })
      }

      const comment = await prisma.comment.create({
        data: {
          content,
          postId: id,
          authorId: req.user.id,
        },
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
            },
          },
        },
      })

<<<<<<< HEAD
=======
      // Emit real-time event for new comment with postId included
      const commentWithPostId = {
        ...comment,
        postId: id
      }
      
      console.log(`📡 Emitting new comment to blog-room and post-${id}:`, commentWithPostId)
      emitToRoom("blog-room", "new-comment", commentWithPostId)
      emitToRoom(`post-${id}`, "new-comment", commentWithPostId)

>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
      res.status(201).json({
        message: "Comment added successfully",
        comment: {
          ...comment,
          reactions: [],
        },
      })
    } catch (error) {
      console.error("Add comment error:", error)
      res.status(500).json({ error: "Failed to add comment" })
    }
  },
)

module.exports = router
