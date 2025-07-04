const express = require("express")
const { body, validationResult } = require("express-validator")
const prisma = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Create report
router.post(
  "/",
  [
    body("type").isIn(["technical", "inappropriate", "spam", "other"]),
    body("description").optional().trim().isLength({ max: 1000 }),
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

      const { type, description = "" } = req.body

      const report = await prisma.report.create({
        data: {
          type,
          description,
          reporterId: req.user.id,
        },
      })

      res.status(201).json({
        message: "Report submitted successfully",
        report: {
          id: report.id,
          type: report.type,
          status: report.status,
          createdAt: report.createdAt,
        },
      })
    } catch (error) {
      console.error("Create report error:", error)
      res.status(500).json({ error: "Failed to submit report" })
    }
  },
)

// Get user's reports
router.get("/my-reports", authenticateToken, async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: {
        reporterId: req.user.id,
      },
      select: {
        id: true,
        type: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    res.json({ reports })
  } catch (error) {
    console.error("Get reports error:", error)
    res.status(500).json({ error: "Failed to fetch reports" })
  }
})

module.exports = router
