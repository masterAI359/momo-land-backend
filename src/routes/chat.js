const express = require("express")
const { body, validationResult } = require("express-validator")
const prisma = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Get all chat rooms
router.get("/rooms", authenticateToken, async (req, res) => {
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
          where: {
            isOnline: true,
          },
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
      orderBy: {
        updatedAt: "desc",
      },
    })

    const roomsWithStats = rooms.map((room) => ({
      ...room,
      participantCount: room._count.members,
      onlineCount: room.members.length,
      messageCount: room._count.messages,
      lastActivity: room.updatedAt,
      _count: undefined,
      members: undefined,
    }))

    res.json({ rooms: roomsWithStats })
  } catch (error) {
    console.error("Get rooms error:", error)
    res.status(500).json({ error: "Failed to fetch chat rooms" })
  }
})

// Create chat room
router.post(
  "/rooms",
  [
    body("name").trim().isLength({ min: 1, max: 100 }),
    body("description").optional().trim().isLength({ max: 500 }),
    body("atmosphere").optional().isIn(["romantic", "intimate", "friendly"]),
    body("isPrivate").optional().isBoolean(),
    body("maxMembers").optional().isInt({ min: 2, max: 100 }),
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

      const { name, description = "", atmosphere = "romantic", isPrivate = false, maxMembers = 50 } = req.body

      const room = await prisma.chatRoom.create({
        data: {
          name,
          description,
          atmosphere,
          isPrivate,
          maxMembers,
          creatorId: req.user.id,
        },
        include: {
          creator: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      })

      // Add creator as first member
      await prisma.roomMember.create({
        data: {
          roomId: room.id,
          userId: req.user.id,
          isOnline: true,
        },
      })

      res.status(201).json({
        message: "Chat room created successfully",
        room,
      })
    } catch (error) {
      console.error("Create room error:", error)
      res.status(500).json({ error: "Failed to create chat room" })
    }
  },
)

// Get room details
router.get("/rooms/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const room = await prisma.chatRoom.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            nickname: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
          orderBy: {
            joinedAt: "asc",
          },
        },
        messages: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
          take: 50, // Last 50 messages
        },
      },
    })

    if (!room) {
      return res.status(404).json({ error: "Chat room not found" })
    }

    res.json({ room })
  } catch (error) {
    console.error("Get room error:", error)
    res.status(500).json({ error: "Failed to fetch chat room" })
  }
})

// Join room
router.post("/rooms/:id/join", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const room = await prisma.chatRoom.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    })

    if (!room) {
      return res.status(404).json({ error: "Chat room not found" })
    }

    if (room._count.members >= room.maxMembers) {
      return res.status(400).json({ error: "Room is full" })
    }

    // Check if already a member
    const existingMember = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId: id,
          userId: req.user.id,
        },
      },
    })

    if (existingMember) {
      // Update to online
      await prisma.roomMember.update({
        where: {
          roomId_userId: {
            roomId: id,
            userId: req.user.id,
          },
        },
        data: {
          isOnline: true,
          lastSeen: new Date(),
        },
      })
    } else {
      // Create new member
      await prisma.roomMember.create({
        data: {
          roomId: id,
          userId: req.user.id,
          isOnline: true,
        },
      })
    }

    // Create join message
    await prisma.chatMessage.create({
      data: {
        content: `${req.user.nickname}さんがルームに参加しました`,
        type: "join",
        roomId: id,
        userId: req.user.id,
      },
    })

    res.json({ message: "Joined room successfully" })
  } catch (error) {
    console.error("Join room error:", error)
    res.status(500).json({ error: "Failed to join room" })
  }
})

// Leave room
router.post("/rooms/:id/leave", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    await prisma.roomMember.update({
      where: {
        roomId_userId: {
          roomId: id,
          userId: req.user.id,
        },
      },
      data: {
        isOnline: false,
        lastSeen: new Date(),
      },
    })

    // Create leave message
    await prisma.chatMessage.create({
      data: {
        content: `${req.user.nickname}さんがルームを退出しました`,
        type: "leave",
        roomId: id,
        userId: req.user.id,
      },
    })

    res.json({ message: "Left room successfully" })
  } catch (error) {
    console.error("Leave room error:", error)
    res.status(500).json({ error: "Failed to leave room" })
  }
})

module.exports = router
