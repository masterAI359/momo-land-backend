const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const { body, validationResult } = require("express-validator")
const prisma = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) => {
  // Allow images, videos, and audio files
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm|mov|avi|mp3|wav|ogg|m4a/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error("Invalid file type"))
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: fileFilter,
})

// Upload multiple files
router.post("/upload", authenticateToken, upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" })
    }

    const mediaAttachments = []

    for (const file of req.files) {
      let mediaType = "IMAGE"
      if (file.mimetype.startsWith("video/")) {
        mediaType = "VIDEO"
      } else if (file.mimetype.startsWith("audio/")) {
        mediaType = "AUDIO"
      }

      const mediaAttachment = await prisma.mediaAttachment.create({
        data: {
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: `/uploads/${file.filename}`,
          type: mediaType,
        },
      })

      mediaAttachments.push(mediaAttachment)
    }

    res.json({
      message: "Files uploaded successfully",
      files: mediaAttachments,
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ error: "Failed to upload files" })
  }
})

// Upload voice message
router.post("/voice", authenticateToken, upload.single("voice"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No voice file uploaded" })
    }

    const { duration, roomId } = req.body

    const voiceMessage = await prisma.voiceMessage.create({
      data: {
        filename: req.file.filename,
        url: `/uploads/${req.file.filename}`,
        duration: Number.parseInt(duration) || 0,
        senderId: req.user.id,
        roomId: roomId || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    })

    res.json({
      message: "Voice message uploaded successfully",
      voiceMessage,
    })
  } catch (error) {
    console.error("Voice upload error:", error)
    res.status(500).json({ error: "Failed to upload voice message" })
  }
})

// Get media file
router.get("/file/:filename", (req, res) => {
  const filename = req.params.filename
  const filePath = path.join(__dirname, "../../uploads", filename)

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath)
  } else {
    res.status(404).json({ error: "File not found" })
  }
})

// Delete media file
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const media = await prisma.mediaAttachment.findUnique({
      where: { id },
      include: {
        post: {
          select: {
            authorId: true,
          },
        },
      },
    })

    if (!media) {
      return res.status(404).json({ error: "Media not found" })
    }

    // Check if user owns the media or is admin
    if (media.post?.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized to delete this media" })
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, "../../uploads", media.filename)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // Delete from database
    await prisma.mediaAttachment.delete({
      where: { id },
    })

    res.json({ message: "Media deleted successfully" })
  } catch (error) {
    console.error("Delete media error:", error)
    res.status(500).json({ error: "Failed to delete media" })
  }
})

module.exports = router
