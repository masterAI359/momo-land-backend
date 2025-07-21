const express = require("express")
const { body, validationResult } = require("express-validator")
const prisma = require("../config/database")
const { authenticateToken } = require("../middleware/auth")
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const router = express.Router()

// Configure multer for profile photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads/profiles')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const extension = path.extname(file.originalname)
    cb(null, `profile-${req.user.id}-${uniqueSuffix}${extension}`)
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'))
    }
  }
})

// Calculate profile completeness
const calculateProfileCompleteness = (user) => {
  const fields = [
    'fullName', 'bio', 'age', 'location', 'gender', 'occupation', 'avatar'
  ]
  const optionalFields = ['dateOfBirth', 'address', 'phone', 'website']
  
  let completeness = 0
  
  // Required fields (higher weight)
  fields.forEach(field => {
    if (user[field] && user[field].toString().trim() !== '') {
      completeness += 2
    }
  })
  
  // Optional fields (lower weight)
  optionalFields.forEach(field => {
    if (user[field] && user[field].toString().trim() !== '') {
      completeness += 1
    }
  })
  
  // Interests array
  if (user.interests && user.interests.length > 0) {
    completeness += 1
  }
  
  // Social links
  if (user.socialLinks && Object.keys(user.socialLinks).length > 0) {
    completeness += 1
  }
  
  const maxScore = (fields.length * 2) + optionalFields.length + 2 // +2 for interests and social links
  return Math.round((completeness / maxScore) * 100)
}

// =============================================================================
// PROFILE ROUTES
// =============================================================================

// Get current user's profile
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nickname: true,
        email: true,
        avatar: true,
        fullName: true,
        bio: true,
        age: true,
        dateOfBirth: true,
        address: true,
        phone: true,
        website: true,
        location: true,
        gender: true,
        occupation: true,
        interests: true,
        socialLinks: true,
        profileVisibility: true,
        profileCompleteness: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        lastActiveAt: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Calculate and update profile completeness
    const completeness = calculateProfileCompleteness(user)
    if (completeness !== user.profileCompleteness) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { profileCompleteness: completeness }
      })
      user.profileCompleteness = completeness
    }

    res.json({ user })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ error: "Failed to fetch profile" })
  }
})

// Get public user profile
router.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        fullName: true,
        bio: true,
        age: true,
        location: true,
        gender: true,
        occupation: true,
        interests: true,
        socialLinks: true,
        profileVisibility: true,
        profileCompleteness: true,
        createdAt: true,
        lastActiveAt: true,
        // Stats
        _count: {
          select: {
            posts: true,
            comments: true,
            likes: true,
            chatMessages: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Check visibility
    if (user.profileVisibility === 'private') {
      return res.status(403).json({ error: "Profile is private" })
    }

    // Remove sensitive fields for public view
    const publicProfile = {
      ...user,
      // Only show limited social links for public profiles
      socialLinks: user.profileVisibility === 'public' ? user.socialLinks : null
    }

    res.json({ user: publicProfile })
  } catch (error) {
    console.error("Get public profile error:", error)
    res.status(500).json({ error: "Failed to fetch profile" })
  }
})

// Update user profile
router.put("/me", 
  authenticateToken,
  [
    body("fullName").optional().trim().isLength({ min: 1, max: 100 }),
    body("bio").optional().trim().isLength({ max: 500 }),
    body("age").optional().isInt({ min: 13, max: 120 }),
    body("dateOfBirth").optional().isISO8601(),
    body("address").optional().trim().isLength({ max: 200 }),
    body("phone").optional().trim().isLength({ max: 20 }),
    body("website").optional().trim().isURL(),
    body("location").optional().trim().isLength({ max: 100 }),
    body("gender").optional().trim().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
    body("occupation").optional().trim().isLength({ max: 100 }),
    body("interests").optional().isArray(),
    body("interests.*").optional().trim().isLength({ min: 1, max: 50 }),
    body("socialLinks").optional().isObject(),
    body("profileVisibility").optional().isIn(['public', 'friends', 'private'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() })
      }

      const {
        fullName,
        bio,
        age,
        dateOfBirth,
        address,
        phone,
        website,
        location,
        gender,
        occupation,
        interests,
        socialLinks,
        profileVisibility
      } = req.body

      // Build update data
      const updateData = {}
      
      if (fullName !== undefined) updateData.fullName = fullName
      if (bio !== undefined) updateData.bio = bio
      if (age !== undefined) updateData.age = age
      if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null
      if (address !== undefined) updateData.address = address
      if (phone !== undefined) updateData.phone = phone
      if (website !== undefined) updateData.website = website
      if (location !== undefined) updateData.location = location
      if (gender !== undefined) updateData.gender = gender
      if (occupation !== undefined) updateData.occupation = occupation
      if (interests !== undefined) updateData.interests = interests
      if (socialLinks !== undefined) updateData.socialLinks = socialLinks
      if (profileVisibility !== undefined) updateData.profileVisibility = profileVisibility

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
        select: {
          id: true,
          nickname: true,
          email: true,
          avatar: true,
          fullName: true,
          bio: true,
          age: true,
          dateOfBirth: true,
          address: true,
          phone: true,
          website: true,
          location: true,
          gender: true,
          occupation: true,
          interests: true,
          socialLinks: true,
          profileVisibility: true,
          profileCompleteness: true,
          updatedAt: true
        }
      })

      // Calculate and update profile completeness
      const completeness = calculateProfileCompleteness(updatedUser)
      if (completeness !== updatedUser.profileCompleteness) {
        await prisma.user.update({
          where: { id: req.user.id },
          data: { profileCompleteness: completeness }
        })
        updatedUser.profileCompleteness = completeness
      }

      res.json({
        message: "Profile updated successfully",
        user: updatedUser
      })
    } catch (error) {
      console.error("Update profile error:", error)
      res.status(500).json({ error: "Failed to update profile" })
    }
  }
)

// Upload profile photo
router.post("/me/photo", 
  authenticateToken,
  upload.single('photo'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No photo uploaded" })
      }

      const photoUrl = `/uploads/profiles/${req.file.filename}`

      // Get current user to delete old photo
      const currentUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { avatar: true }
      })

      // Delete old photo if it exists
      if (currentUser.avatar && currentUser.avatar.includes('/uploads/profiles/')) {
        const oldPhotoPath = path.join(__dirname, '../../public', currentUser.avatar)
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath)
        }
      }

      // Update user with new photo
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { avatar: photoUrl },
        select: {
          id: true,
          nickname: true,
          avatar: true,
          profileCompleteness: true
        }
      })

      // Calculate and update profile completeness
      const completeness = calculateProfileCompleteness(updatedUser)
      if (completeness !== updatedUser.profileCompleteness) {
        await prisma.user.update({
          where: { id: req.user.id },
          data: { profileCompleteness: completeness }
        })
        updatedUser.profileCompleteness = completeness
      }

      res.json({
        message: "Profile photo updated successfully",
        avatar: photoUrl,
        profileCompleteness: completeness
      })
    } catch (error) {
      console.error("Upload photo error:", error)
      res.status(500).json({ error: "Failed to upload photo" })
    }
  }
)

// Delete profile photo
router.delete("/me/photo", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { avatar: true }
    })

    if (!user.avatar) {
      return res.status(404).json({ error: "No profile photo found" })
    }

    // Delete photo file if it's an uploaded file
    if (user.avatar.includes('/uploads/profiles/')) {
      const photoPath = path.join(__dirname, '../../public', user.avatar)
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath)
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: null },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        profileCompleteness: true
      }
    })

    // Calculate and update profile completeness
    const completeness = calculateProfileCompleteness(updatedUser)
    if (completeness !== updatedUser.profileCompleteness) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { profileCompleteness: completeness }
      })
      updatedUser.profileCompleteness = completeness
    }

    res.json({
      message: "Profile photo deleted successfully",
      profileCompleteness: completeness
    })
  } catch (error) {
    console.error("Delete photo error:", error)
    res.status(500).json({ error: "Failed to delete photo" })
  }
})

// Get profile completion suggestions
router.get("/me/suggestions", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        fullName: true,
        bio: true,
        age: true,
        dateOfBirth: true,
        address: true,
        phone: true,
        website: true,
        location: true,
        gender: true,
        occupation: true,
        interests: true,
        socialLinks: true,
        avatar: true,
        profileCompleteness: true
      }
    })

    const suggestions = []
    
    if (!user.avatar) suggestions.push({ field: 'avatar', message: 'プロフィール写真を追加してください' })
    if (!user.fullName) suggestions.push({ field: 'fullName', message: '本名を追加してください' })
    if (!user.bio) suggestions.push({ field: 'bio', message: '自己紹介を追加してください' })
    if (!user.age) suggestions.push({ field: 'age', message: '年齢を追加してください' })
    if (!user.location) suggestions.push({ field: 'location', message: '所在地を追加してください' })
    if (!user.gender) suggestions.push({ field: 'gender', message: '性別を追加してください' })
    if (!user.occupation) suggestions.push({ field: 'occupation', message: '職業を追加してください' })
    if (!user.interests || user.interests.length === 0) suggestions.push({ field: 'interests', message: '興味・趣味を追加してください' })
    if (!user.website) suggestions.push({ field: 'website', message: 'ウェブサイトを追加してください' })
    if (!user.socialLinks || Object.keys(user.socialLinks).length === 0) suggestions.push({ field: 'socialLinks', message: 'SNSリンクを追加してください' })

    res.json({
      profileCompleteness: user.profileCompleteness,
      suggestions: suggestions.slice(0, 5) // Show top 5 suggestions
    })
  } catch (error) {
    console.error("Get suggestions error:", error)
    res.status(500).json({ error: "Failed to get suggestions" })
  }
})

// Search users by profile fields
router.get("/search", async (req, res) => {
  try {
    const { query, location, age, gender, occupation, interests } = req.query
    
    const whereClause = {
      profileVisibility: 'public',
      isActive: true,
      isBlocked: false
    }

    if (query) {
      whereClause.OR = [
        { nickname: { contains: query, mode: 'insensitive' } },
        { fullName: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
        { occupation: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (location) whereClause.location = { contains: location, mode: 'insensitive' }
    if (age) whereClause.age = parseInt(age)
    if (gender) whereClause.gender = gender
    if (occupation) whereClause.occupation = { contains: occupation, mode: 'insensitive' }
    if (interests) whereClause.interests = { hasSome: interests.split(',') }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        nickname: true,
        avatar: true,
        fullName: true,
        bio: true,
        age: true,
        location: true,
        gender: true,
        occupation: true,
        interests: true,
        profileCompleteness: true,
        lastActiveAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            likes: true
          }
        }
      },
      orderBy: [
        { profileCompleteness: 'desc' },
        { lastActiveAt: 'desc' }
      ],
      take: 20
    })

    res.json({ users })
  } catch (error) {
    console.error("Search users error:", error)
    res.status(500).json({ error: "Failed to search users" })
  }
})

module.exports = router 