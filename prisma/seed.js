const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting seed...")

  // Clear existing data
  await prisma.chatMessage.deleteMany()
  await prisma.roomMember.deleteMany()
  await prisma.chatRoom.deleteMany()
  await prisma.like.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.post.deleteMany()
  await prisma.report.deleteMany()
  await prisma.user.deleteMany()

  // Create users (including guest users)
  const hashedPassword = await bcrypt.hash("password123", 10)

  const users = await Promise.all([
    // Regular users
    prisma.user.create({
      data: {
        nickname: "ユーザー1",
        email: "user1@example.com",
        password: hashedPassword,
        isGuest: false,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
      },
    }),
    prisma.user.create({
      data: {
        nickname: "ユーザー2",
        email: "user2@example.com",
        password: hashedPassword,
        isGuest: false,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
      },
    }),
    prisma.user.create({
      data: {
        nickname: "ユーザー3",
        email: "user3@example.com",
        password: hashedPassword,
        isGuest: false,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user3",
      },
    }),
    prisma.user.create({
      data: {
        nickname: "チャット好き",
        email: "chat@example.com",
        password: hashedPassword,
        isGuest: false,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=chat",
      },
    }),
    prisma.user.create({
      data: {
        nickname: "ライブチャット初心者",
        email: "beginner@example.com",
        password: hashedPassword,
        isGuest: false,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=beginner",
      },
    }),
    // Guest users (no password, isGuest: true)
    prisma.user.create({
      data: {
        nickname: "ゲストユーザー1",
        email: "guest1@example.com",
        password: null,
        isGuest: true,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=guest1",
      },
    }),
    prisma.user.create({
      data: {
        nickname: "ゲストユーザー2",
        email: "guest2@example.com",
        password: null,
        isGuest: true,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=guest2",
      },
    }),
  ])

  console.log("✅ Created users (including guest users)")

  // Create posts (including unpublished ones)
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: "初めてのライブチャット体験記",
        content: `こんにちは、ライブチャット初心者です。今回は私の初めてのライブチャット体験について詳しくお話ししたいと思います。

## 初めてのライブチャット体験

最初は緊張していましたが、チャットレディの方がとても親切で、すぐにリラックスできました。
会話も弾み、とても楽しい時間を過ごすことができました。

## 印象に残ったポイント

1. **コミュニケーションの質**: チャットレディの方の対応が素晴らしく、自然な会話ができました。
2. **サイトの使いやすさ**: インターフェースが分かりやすく、初心者でも簡単に利用できました。
3. **料金体系**: 明確な料金設定で、安心して利用できました。

## 今後の利用について

今回の体験がとても良かったので、また利用したいと思います。
同じような体験を求めている方にもおすすめしたいです。

皆さんも良いライブチャット体験ができることを願っています！`,
        category: "初心者向け",
        excerpt:
          "初めてのライブチャット体験について詳しく書きました。緊張していましたが、とても楽しい時間を過ごすことができました。",
        isPublished: true,
        viewCount: 156,
        authorId: users[4].id,
      },
    }),
    prisma.post.create({
      data: {
        title: "おすすめライブチャットサイト比較",
        content: `複数のライブチャットサイトを利用してきた経験から、おすすめのサイトを比較してみました。

## サイトA
- 料金: ★★★★☆
- 使いやすさ: ★★★★★
- チャットレディの質: ★★★★☆

## サイトB
- 料金: ★★★☆☆
- 使いやすさ: ★★★☆☆
- チャットレディの質: ★★★★★

## 総合評価

初心者の方にはサイトAをおすすめします。使いやすさと料金のバランスが良いです。`,
        category: "おすすめ",
        excerpt: "複数のライブチャットサイトを比較して、それぞれの特徴をまとめました。",
        isPublished: true,
        viewCount: 234,
        authorId: users[0].id,
      },
    }),
    prisma.post.create({
      data: {
        title: "ライブチャットでの楽しい会話のコツ",
        content: `ライブチャットをより楽しむための会話のコツをご紹介します。

## 基本的な心構え
- 相手を尊重する
- 自然体で接する
- 楽しむことを忘れない

## 会話のテクニック
1. 共通の話題を見つける
2. 相手の話をよく聞く
3. 適度な質問をする

これらのポイントを意識することで、より充実したライブチャット体験ができるはずです。`,
        category: "上級者向け",
        excerpt: "ライブチャットでの会話をより楽しむためのコツとテクニックをまとめました。",
        isPublished: true,
        viewCount: 189,
        authorId: users[1].id,
      },
    }),
    prisma.post.create({
      data: {
        title: "ライブチャット利用時の注意点",
        content: `安全にライブチャットを楽しむための注意点をまとめました。

## セキュリティ面での注意
- 個人情報は絶対に教えない
- 怪しいリンクはクリックしない
- 公式サイト以外からのアクセスは避ける

## 金銭面での注意
- 予算を決めて利用する
- 料金体系を事前に確認
- 不明な請求があれば即座に問い合わせ

安全第一で楽しいライブチャットライフを送りましょう！`,
        category: "レビュー",
        excerpt: "ライブチャットを安全に楽しむための重要な注意点をまとめました。",
        isPublished: true,
        viewCount: 298,
        authorId: users[2].id,
      },
    }),
    prisma.post.create({
      data: {
        title: "人気チャットレディとの素敵な出会い",
        content: `今回は人気のチャットレディの方との素敵な出会いについて書きたいと思います。

## 出会いのきっかけ
偶然入ったルームで出会った彼女は、とても魅力的で話し上手な方でした。

## 印象的だった会話
- 趣味の話で盛り上がった
- お互いの好きな音楽について語り合った
- 将来の夢について話した

## 学んだこと
良い出会いは突然やってくるものですね。自然体で接することの大切さを改めて感じました。`,
        category: "おすすめ",
        excerpt: "人気チャットレディとの素敵な出会いと、そこから学んだことについて書きました。",
        isPublished: true,
        viewCount: 445,
        authorId: users[3].id,
      },
    }),
    // Draft post (unpublished)
    prisma.post.create({
      data: {
        title: "下書き中の投稿",
        content: `これはまだ下書き中の投稿です。内容を整理してから公開予定です。`,
        category: "その他",
        excerpt: null,
        isPublished: false,
        viewCount: 0,
        authorId: users[0].id,
      },
    }),
  ])

  console.log("✅ Created posts (including draft)")

  // Create chat rooms with different atmospheres
  const chatRooms = await Promise.all([
    prisma.chatRoom.create({
      data: {
        name: "初心者向け雑談ルーム",
        description: "ライブチャット初心者の方向けの雑談ルームです",
        atmosphere: "friendly",
        isPrivate: false,
        maxMembers: 50,
        creatorId: users[0].id,
      },
    }),
    prisma.chatRoom.create({
      data: {
        name: "おすすめサイト情報交換",
        description: "おすすめのライブチャットサイトについて情報交換しましょう",
        atmosphere: "romantic",
        isPrivate: false,
        maxMembers: 30,
        creatorId: users[1].id,
      },
    }),
    prisma.chatRoom.create({
      data: {
        name: "プライベートルーム",
        description: "招待制のプライベートチャットルーム",
        atmosphere: "intimate",
        isPrivate: true,
        maxMembers: 10,
        creatorId: users[2].id,
      },
    }),
    prisma.chatRoom.create({
      data: {
        name: "上級者向けディスカッション",
        description: "ライブチャット上級者向けの深い議論をするルーム",
        atmosphere: "romantic",
        isPrivate: false,
        maxMembers: 25,
        creatorId: users[3].id,
      },
    }),
    prisma.chatRoom.create({
      data: {
        name: "ゲスト専用ルーム",
        description: "ゲストユーザー専用のルームです",
        atmosphere: "friendly",
        isPrivate: false,
        maxMembers: 20,
        creatorId: users[5].id, // Guest user
      },
    }),
  ])

  console.log("✅ Created chat rooms with different atmospheres")

  // Create room members with more realistic data
  const roomMembers = []
  for (let i = 0; i < chatRooms.length; i++) {
    for (let j = 0; j < users.length; j++) {
      if (Math.random() > 0.3) {
        // 70% chance to join each room
        const isOnline = Math.random() > 0.5
        const lastSeen = isOnline 
          ? new Date() 
          : new Date(Date.now() - Math.random() * 86400000) // Random time in last 24h
        
        roomMembers.push(
          prisma.roomMember.create({
            data: {
              roomId: chatRooms[i].id,
              userId: users[j].id,
              isOnline,
              lastSeen,
            },
          }),
        )
      }
    }
  }
  await Promise.all(roomMembers)

  console.log("✅ Created room members")

  // Create chat messages with different types
  const chatMessages = []
  const messageContents = [
    "こんにちは！このルームへようこそ 💕",
    "素敵な雰囲気のルームですね ✨",
    "みなさんはどのサイトを利用していますか？",
    "初心者におすすめのサイトを教えてください",
    "今日はとても楽しい時間を過ごせました 😊",
    "また明日もお話ししましょう！",
    "新しいサイトを試してみました",
    "チャットレディの方がとても親切でした",
    "料金体系が分かりやすくて良いですね",
    "セキュリティ面でも安心できます",
  ]

  const messageTypes = ["message", "join", "leave", "system"]

  for (let i = 0; i < chatRooms.length; i++) {
    // Add join messages
    chatMessages.push(
      prisma.chatMessage.create({
        data: {
          content: "ルームに参加しました",
          type: "join",
          roomId: chatRooms[i].id,
          userId: users[0].id,
          createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
        },
      }),
    )

    // Add regular messages
    for (let j = 0; j < 15; j++) {
      const randomUser = users[Math.floor(Math.random() * users.length)]
      const randomContent = messageContents[Math.floor(Math.random() * messageContents.length)]
      const randomType = messageTypes[Math.floor(Math.random() * messageTypes.length)]

      chatMessages.push(
        prisma.chatMessage.create({
          data: {
            content: randomContent,
            type: randomType,
            roomId: chatRooms[i].id,
            userId: randomUser.id,
            createdAt: new Date(Date.now() - Math.random() * 86400000 * 7), // Random time in last week
          },
        }),
      )
    }

    // Add system messages
    chatMessages.push(
      prisma.chatMessage.create({
        data: {
          content: "ルームのルールをお読みください",
          type: "system",
          roomId: chatRooms[i].id,
          userId: users[0].id, // System messages from room creator
          createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
        },
      }),
    )
  }
  await Promise.all(chatMessages)

  console.log("✅ Created chat messages with different types")

  // Create comments
  const comments = []
  const commentContents = [
    "とても参考になる体験記でした！",
    "私も同じような経験があります",
    "詳しい情報をありがとうございます",
    "おすすめのサイトを教えていただけませんか？",
    "初心者にも分かりやすい説明ですね",
    "続きが気になります",
    "素晴らしい体験談ですね",
    "私も試してみたいと思います",
    "安全面での注意点が参考になりました",
    "また新しい投稿を楽しみにしています",
  ]

  for (let i = 0; i < posts.length; i++) {
    // Only add comments to published posts
    if (posts[i].isPublished) {
      const numComments = Math.floor(Math.random() * 8) + 2 // 2-9 comments per post
      for (let j = 0; j < numComments; j++) {
        const randomUser = users[Math.floor(Math.random() * users.length)]
        const randomContent = commentContents[Math.floor(Math.random() * commentContents.length)]

        comments.push(
          prisma.comment.create({
            data: {
              content: randomContent,
              postId: posts[i].id,
              authorId: randomUser.id,
              createdAt: new Date(Date.now() - Math.random() * 86400000 * 3), // Random time in last 3 days
            },
          }),
        )
      }
    }
  }
  await Promise.all(comments)

  console.log("✅ Created comments (only for published posts)")

  // Create likes (only for published posts)
  const likes = []
  for (let i = 0; i < posts.length; i++) {
    // Only add likes to published posts
    if (posts[i].isPublished) {
      const numLikes = Math.floor(Math.random() * users.length) + 1
      const shuffledUsers = [...users].sort(() => 0.5 - Math.random())

      for (let j = 0; j < numLikes; j++) {
        likes.push(
          prisma.like.create({
            data: {
              postId: posts[i].id,
              userId: shuffledUsers[j].id,
              createdAt: new Date(Date.now() - Math.random() * 86400000 * 5), // Random time in last 5 days
            },
          }),
        )
      }
    }
  }
  await Promise.all(likes)

  console.log("✅ Created likes (only for published posts)")

  // Create reports with different types and statuses
  await Promise.all([
    prisma.report.create({
      data: {
        type: "technical",
        description: "サイトの読み込みが遅い問題について",
        status: "pending",
        reporterId: users[0].id,
      },
    }),
    prisma.report.create({
      data: {
        type: "inappropriate",
        description: "不適切なコメントが投稿されています",
        status: "reviewed",
        reporterId: users[1].id,
      },
    }),
    prisma.report.create({
      data: {
        type: "spam",
        description: "スパムコメントが多数投稿されています",
        status: "resolved",
        reporterId: users[2].id,
      },
    }),
    prisma.report.create({
      data: {
        type: "other",
        description: "その他の問題について",
        status: "pending",
        reporterId: users[5].id, // Guest user
      },
    }),
  ])

  console.log("✅ Created reports with different types and statuses")

  console.log("🎉 Seed completed successfully!")

  // Print summary
  const userCount = await prisma.user.count()
  const regularUserCount = await prisma.user.count({ where: { isGuest: false } })
  const guestUserCount = await prisma.user.count({ where: { isGuest: true } })
  const postCount = await prisma.post.count()
  const publishedPostCount = await prisma.post.count({ where: { isPublished: true } })
  const draftPostCount = await prisma.post.count({ where: { isPublished: false } })
  const roomCount = await prisma.chatRoom.count()
  const messageCount = await prisma.chatMessage.count()
  const commentCount = await prisma.comment.count()
  const likeCount = await prisma.like.count()
  const reportCount = await prisma.report.count()

  console.log("\n📊 Database Summary:")
  console.log(`👥 Total Users: ${userCount} (${regularUserCount} regular, ${guestUserCount} guest)`)
  console.log(`📝 Total Posts: ${postCount} (${publishedPostCount} published, ${draftPostCount} draft)`)
  console.log(`💬 Chat Rooms: ${roomCount}`)
  console.log(`💭 Messages: ${messageCount}`)
  console.log(`💬 Comments: ${commentCount}`)
  console.log(`❤️ Likes: ${likeCount}`)
  console.log(`🚨 Reports: ${reportCount}`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
