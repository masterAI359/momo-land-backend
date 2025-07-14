const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const prisma = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Register
router.post(
  "/register",
  [
    body("nickname").trim().isLength({ min: 2, max: 50 }).withMessage("Nickname must be between 2 and 50 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    body("password").optional().isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        })
      }

      const { nickname, email, password } = req.body

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ nickname: nickname }, { email: email }],
        },
      })

      if (existingUser) {
        if (existingUser.nickname === nickname) {
          return res.status(400).json({
            error: "このニックネームは既に使用されています。別のニックネームを選択してください。",
          })
        }
        if (existingUser.email === email) {
          return res.status(400).json({
            error: "このメールアドレスは既に登録されています。",
          })
        }
      }

      // Hash password if provided
      let hashedPassword = null
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10)
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          nickname,
          email,
          password: hashedPassword,
          isGuest: !password,
        },
        select: {
          id: true,
          nickname: true,
          email: true,
          isGuest: true,
          createdAt: true,
        },
      })

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      })

      res.status(201).json({
        message: "User registered successfully",
        user,
        token,
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({ error: "Failed to register user" })
    }
  },
)

// Login
router.post("/login", [body("email").isEmail().normalizeEmail(), body("password").notEmpty()], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      })
    }

    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.password) {
      return res.status(401).json({
        error: "Invalid email or password",
      })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid email or password",
      })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    })

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        isGuest: user.isGuest,
        createdAt: user.createdAt,
      },
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Failed to login" })
  }
})

// Get current user
router.get("/me", authenticateToken, async (req, res) => {
  res.json({ user: req.user })
})

// Logout (client-side token removal)
router.post("/logout", authenticateToken, (req, res) => {
  res.json({ message: "Logout successful" })
})

module.exports = router
