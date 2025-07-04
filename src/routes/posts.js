const express = require("express")
const { body, validationResult, query } = require("express-validator")
const prisma = require("../config/database")
const { authenticateToken, optionalAuth } = require("../middleware/auth")
const { emitToRoom } = require("../socket/socketService")

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
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
          orderBy,
          skip: offset,
          take: limit,
        }),
        prisma.post.count({ where }),
      ])

      res.json({
        posts: posts.map((post) => ({
          ...post,
          likesCount: post._count.likes,
          commentsCount: post._count.comments,
          _count: undefined,
        })),
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

// Get popular posts (ranking)
router.get("/ranking", optionalAuth, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { isPublished: true },
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
      orderBy: {
        likes: {
          _count: "desc",
        },
      },
      take: 50,
    })

    const rankedPosts = posts.map((post, index) => ({
      ...post,
      rank: index + 1,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      _count: undefined,
    }))

    res.json({ posts: rankedPosts })
  } catch (error) {
    console.error("Get ranking error:", error)
    res.status(500).json({ error: "Failed to fetch ranking" })
  }
})

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
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
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

    res.json({
      ...post,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      isLiked,
      _count: undefined,
    })
  } catch (error) {
    console.error("Get post error:", error)
    res.status(500).json({ error: "Failed to fetch post" })
  }
})

// Create post
router.post(
  "/",
  [
    body("title").trim().isLength({ min: 1, max: 200 }),
    body("content").trim().isLength({ min: 10 }),
    body("category").trim().isIn(["初心者向け", "上級者向け", "おすすめ", "レビュー"]),
    body("excerpt").optional().trim().isLength({ max: 500 }),
  ],
  authenticateToken,
  async (req, res) => {
    try {
      // console.log("req.body =================", req.body)
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        })
      }

      const { title, content, category, excerpt } = req.body

      const post = await prisma.post.create({
        data: {
          title,
          content,
          category,
          excerpt: excerpt || content.substring(0, 200) + "...",
          authorId: req.user.id,
        },
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
      })

      const postData = {
        ...post,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        _count: undefined,
      }

      // Emit real-time event for new post
      emitToRoom("blog-room", "new-post", postData)

      res.status(201).json({
        message: "Post created successfully",
        post: postData,
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

      // Get updated like count
      const likesCount = await prisma.like.count({
        where: { postId: id },
      })

      // Emit real-time event for unlike
      emitToRoom("blog-room", "post-liked", { postId: id, likesCount, isLiked: false })
      emitToRoom(`post-${id}`, "post-liked", { postId: id, likesCount, isLiked: false })

      res.json({ message: "Post unliked", isLiked: false })
    } else {
      // Like
      await prisma.like.create({
        data: {
          postId: id,
          userId: req.user.id,
        },
      })

      // Get updated like count
      const likesCount = await prisma.like.count({
        where: { postId: id },
      })

      // Emit real-time event for like
      emitToRoom("blog-room", "post-liked", { postId: id, likesCount, isLiked: true })
      emitToRoom(`post-${id}`, "post-liked", { postId: id, likesCount, isLiked: true })

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
            },
          },
        },
      })

      // Emit real-time event for new comment
      emitToRoom("blog-room", "new-comment", comment)
      emitToRoom(`post-${id}`, "new-comment", comment)

      res.status(201).json({
        message: "Comment added successfully",
        comment,
      })
    } catch (error) {
      console.error("Add comment error:", error)
      res.status(500).json({ error: "Failed to add comment" })
    }
  },
)

module.exports = router
