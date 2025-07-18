const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Sample data generator for monitoring page
async function generateSampleUserActivities() {
  try {
    console.log('🚀 Generating sample user activity data...')

    // Get existing users
    const users = await prisma.user.findMany({
      select: { id: true, nickname: true }
    })

    if (users.length === 0) {
      console.log('❌ No users found. Please create users first.')
      return
    }

    console.log(`📊 Found ${users.length} users`)

    // Define activity types and their frequency
    const activities = [
      { action: 'login', weight: 20 },
      { action: 'logout', weight: 15 },
      { action: 'page_view', weight: 30 },
      { action: 'post_created', weight: 8 },
      { action: 'comment_added', weight: 12 },
      { action: 'like_added', weight: 10 },
      { action: 'profile_updated', weight: 3 },
      { action: 'chat_joined', weight: 5 },
      { action: 'report_created', weight: 1 }
    ]

    // Generate activities for the last 7 days
    const now = new Date()
    const activitiesToCreate = []

    // Generate 500 activities across the last 7 days
    for (let i = 0; i < 500; i++) {
      // Random time within last 7 days
      const daysAgo = Math.random() * 7
      const hoursAgo = daysAgo * 24
      const activityTime = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000))

      // Select random user
      const user = users[Math.floor(Math.random() * users.length)]

      // Select activity based on weights
      const totalWeight = activities.reduce((sum, a) => sum + a.weight, 0)
      let randomWeight = Math.random() * totalWeight
      let selectedActivity = activities[0]

      for (const activity of activities) {
        randomWeight -= activity.weight
        if (randomWeight <= 0) {
          selectedActivity = activity
          break
        }
      }

      // Generate activity details based on type
      let details = { timestamp: activityTime }
      
      switch (selectedActivity.action) {
        case 'login':
          details.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          details.loginMethod = 'email'
          break
        case 'page_view':
          details.page = ['/', '/posts', '/chat', '/profile', '/timeline'][Math.floor(Math.random() * 5)]
          details.duration = Math.floor(Math.random() * 300) + 10 // 10-310 seconds
          break
        case 'post_created':
          details.category = ['初心者向け', '上級者向け', 'おすすめ', 'レビュー'][Math.floor(Math.random() * 4)]
          details.title = `Sample Post ${i}`
          break
        case 'comment_added':
          details.commentLength = Math.floor(Math.random() * 200) + 10
          break
        case 'like_added':
          details.targetType = 'post'
          break
        case 'profile_updated':
          details.fields = ['bio', 'avatar', 'interests'][Math.floor(Math.random() * 3)]
          break
        case 'chat_joined':
          details.roomName = `Room ${Math.floor(Math.random() * 10) + 1}`
          break
        case 'report_created':
          details.type = ['spam', 'inappropriate', 'technical'][Math.floor(Math.random() * 3)]
          break
      }

      activitiesToCreate.push({
        userId: user.id,
        action: selectedActivity.action,
        details: details,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: activityTime
      })
    }

    // Batch create activities
    const created = await prisma.userActivity.createMany({
      data: activitiesToCreate,
      skipDuplicates: true
    })

    console.log(`✅ Created ${created.count} user activities`)

    // Generate some chat messages for realtime monitoring
    const chatRooms = await prisma.chatRoom.findMany({
      select: { id: true, name: true }
    })

    if (chatRooms.length > 0) {
      console.log('💬 Generating sample chat messages...')
      
      const messages = []
      const messageCount = 50

      for (let i = 0; i < messageCount; i++) {
        const room = chatRooms[Math.floor(Math.random() * chatRooms.length)]
        const user = users[Math.floor(Math.random() * users.length)]
        const minutesAgo = Math.random() * 60 // Last hour
        const messageTime = new Date(now.getTime() - (minutesAgo * 60 * 1000))

        messages.push({
          content: `Sample message ${i + 1} - こんにちは！`,
          type: 'message',
          roomId: room.id,
          userId: user.id,
          status: 'APPROVED',
          isBlocked: false,
          createdAt: messageTime
        })
      }

      const createdMessages = await prisma.chatMessage.createMany({
        data: messages,
        skipDuplicates: true
      })

      console.log(`✅ Created ${createdMessages.count} chat messages`)

      // Update room members to be online
      const roomMembers = await prisma.roomMember.updateMany({
        data: {
          isOnline: true,
          lastSeen: new Date()
        }
      })

      console.log(`✅ Updated ${roomMembers.count} room members to online status`)
    }

    // Generate some reports
    console.log('📋 Generating sample reports...')
    const reports = []
    
    for (let i = 0; i < 10; i++) {
      const user = users[Math.floor(Math.random() * users.length)]
      const hoursAgo = Math.random() * 24 // Last 24 hours
      const reportTime = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000))

      reports.push({
        type: ['spam', 'inappropriate', 'technical', 'other'][Math.floor(Math.random() * 4)],
        description: `Sample report ${i + 1} - システムに問題があります`,
        status: ['pending', 'reviewed', 'resolved'][Math.floor(Math.random() * 3)],
        priority: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
        reporterId: user.id,
        createdAt: reportTime
      })
    }

    const createdReports = await prisma.report.createMany({
      data: reports,
      skipDuplicates: true
    })

    console.log(`✅ Created ${createdReports.count} reports`)

    console.log('🎉 Sample data generation completed!')
    console.log('📊 You can now view real data in the monitoring page at: http://localhost:3000/admin/monitoring')

  } catch (error) {
    console.error('❌ Error generating sample data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Check if running directly
if (require.main === module) {
  generateSampleUserActivities()
}

module.exports = { generateSampleUserActivities } 