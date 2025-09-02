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
    const updatedPost = await prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    })

    // Emit real-time event for post view
    if (req.user) {
      emitToRoom("blog-room", "post-viewed", { 
        postId: id, 
        viewCount: updatedPost.viewCount,
        viewerId: req.user.id,
        viewerNickname: req.user.nickname
      })
      emitToRoom(`post-${id}`, "post-viewed", { 
        postId: id, 
        viewCount: updatedPost.viewCount,
        viewerId: req.user.id,
        viewerNickname: req.user.nickname
      })
    }

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
      viewCount: updatedPost.viewCount,
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
      emitToRoom("blog-room", "new-comment", {
        ...comment,
        postTitle: post.title,
      })
      emitToRoom(`post-${id}`, "new-comment", {
        ...comment,
        postTitle: post.title,
      })

      // Emit analytics event
      emitToRoom("analytics-room", "comment-analytics", {
        type: "new_comment",
        postId: id,
        commentId: comment.id,
        authorId: req.user.id,
        authorNickname: req.user.nickname,
        timestamp: new Date(),
      })

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

// React to comment (emoji reactions)
router.post(
  "/:postId/comments/:commentId/react",
  [body("emoji").trim().isLength({ min: 1, max: 10 })],
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

      const { postId, commentId } = req.params
      const { emoji } = req.body

      // Check if comment exists
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: { author: { select: { nickname: true } } },
      })

      if (!comment) {
        return res.status(404).json({ error: "Comment not found" })
      }

      if (comment.postId !== postId) {
        return res.status(400).json({ error: "Comment does not belong to this post" })
      }

      // For simplicity, we'll just emit the reaction without storing it
      // In a real app, you might want to store reactions in the database
      const reactionData = {
        commentId,
        postId,
        emoji,
        userId: req.user.id,
        userNickname: req.user.nickname,
        timestamp: new Date(),
      }

      // Emit real-time event for comment reaction
      emitToRoom("blog-room", "comment-reaction", reactionData)
      emitToRoom(`post-${postId}`, "comment-reaction", reactionData)

      res.json({
        message: "Reaction added successfully",
        reaction: reactionData,
      })
    } catch (error) {
      console.error("React to comment error:", error)
      res.status(500).json({ error: "Failed to react to comment" })
    }
  },
)

// Update post (author only)
router.put(
  "/:id",
  [
    body("title").optional().trim().isLength({ min: 1, max: 200 }),
    body("content").optional().trim().isLength({ min: 10 }),
    body("category").optional().trim().isIn(["初心者向け", "上級者向け", "おすすめ", "レビュー"]),
    body("excerpt").optional().trim().isLength({ max: 500 }),
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

      const { id } = req.params
      const updateData = {}

      // Only include fields that are provided
      if (req.body.title !== undefined) updateData.title = req.body.title
      if (req.body.content !== undefined) updateData.content = req.body.content
      if (req.body.category !== undefined) updateData.category = req.body.category
      if (req.body.excerpt !== undefined) updateData.excerpt = req.body.excerpt

      // Check if post exists and user is the author
      const existingPost = await prisma.post.findUnique({
        where: { id },
        select: { authorId: true },
      })

      if (!existingPost) {
        return res.status(404).json({ error: "Post not found" })
      }

      if (existingPost.authorId !== req.user.id) {
        return res.status(403).json({ error: "You can only edit your own posts" })
      }

      const updatedPost = await prisma.post.update({
        where: { id },
        data: updateData,
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
        ...updatedPost,
        likesCount: updatedPost._count.likes,
        commentsCount: updatedPost._count.comments,
        _count: undefined,
      }

      // Emit real-time event for post update
      emitToRoom("blog-room", "post-updated", postData)
      emitToRoom(`post-${id}`, "post-updated", postData)

      res.json({
        message: "Post updated successfully",
        post: postData,
      })
    } catch (error) {
      console.error("Update post error:", error)
      res.status(500).json({ error: "Failed to update post" })
    }
  },
)

// Delete post (author only)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    // Check if post exists and user is the author
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true, title: true },
    })

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" })
    }

    if (existingPost.authorId !== req.user.id) {
      return res.status(403).json({ error: "You can only delete your own posts" })
    }

    await prisma.post.delete({
      where: { id },
    })

    // Emit real-time event for post deletion
    emitToRoom("blog-room", "post-deleted", { 
      postId: id, 
      title: existingPost.title,
      deletedBy: req.user.nickname 
    })
    emitToRoom(`post-${id}`, "post-deleted", { 
      postId: id, 
      title: existingPost.title,
      deletedBy: req.user.nickname 
    })

    res.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Delete post error:", error)
    res.status(500).json({ error: "Failed to delete post" })
  }
})

// Track user reading activity
router.post("/:id/activity", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { activity, data } = req.body

    // Validate activity type
    const validActivities = ["reading_start", "reading_progress", "reading_complete", "scroll_depth"]
    if (!validActivities.includes(activity)) {
      return res.status(400).json({ error: "Invalid activity type" })
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true, title: true },
    })

    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    // Emit real-time event for user activity
    emitToRoom("blog-room", "user-activity", {
      postId: id,
      userId: req.user.id,
      userNickname: req.user.nickname,
      activity,
      data,
      timestamp: new Date(),
    })
    emitToRoom(`post-${id}`, "user-activity", {
      postId: id,
      userId: req.user.id,
      userNickname: req.user.nickname,
      activity,
      data,
      timestamp: new Date(),
    })

    res.json({ message: "Activity tracked successfully" })
  } catch (error) {
    console.error("Track activity error:", error)
    res.status(500).json({ error: "Failed to track activity" })
  }
})

// Update comment
router.put(
  "/:postId/comments/:commentId",
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

      const { postId, commentId } = req.params
      const { content } = req.body

      // Check if comment exists and user is the author
      const existingComment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { authorId: true, postId: true },
      })

      if (!existingComment) {
        return res.status(404).json({ error: "Comment not found" })
      }

      if (existingComment.postId !== postId) {
        return res.status(400).json({ error: "Comment does not belong to this post" })
      }

      if (existingComment.authorId !== req.user.id) {
        return res.status(403).json({ error: "You can only edit your own comments" })
      }

      const updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: { content },
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      })

      // Emit real-time event for comment update
      emitToRoom("blog-room", "comment-updated", updatedComment)
      emitToRoom(`post-${postId}`, "comment-updated", updatedComment)

      res.json({
        message: "Comment updated successfully",
        comment: updatedComment,
      })
    } catch (error) {
      console.error("Update comment error:", error)
      res.status(500).json({ error: "Failed to update comment" })
    }
  },
)

// Delete comment
router.delete("/:postId/comments/:commentId", authenticateToken, async (req, res) => {
  try {
    const { postId, commentId } = req.params

    // Check if comment exists and user is the author
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, postId: true, content: true },
    })

    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" })
    }

    if (existingComment.postId !== postId) {
      return res.status(400).json({ error: "Comment does not belong to this post" })
    }

    if (existingComment.authorId !== req.user.id) {
      return res.status(403).json({ error: "You can only delete your own comments" })
    }

    await prisma.comment.delete({
      where: { id: commentId },
    })

    // Emit real-time event for comment deletion
    emitToRoom("blog-room", "comment-deleted", {
      commentId,
      postId,
      deletedBy: req.user.nickname,
    })
    emitToRoom(`post-${postId}`, "comment-deleted", {
      commentId,
      postId,
      deletedBy: req.user.nickname,
    })

    res.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Delete comment error:", error)
    res.status(500).json({ error: "Failed to delete comment" })
  }
})

module.exports = router
