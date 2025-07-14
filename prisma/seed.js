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

  // Create users
  const hashedPassword = await bcrypt.hash("password123", 10)

  const users = await Promise.all([
    prisma.user.create({
      data: {
        nickname: "ユーザー1",
        email: "user1@example.com",
        password: hashedPassword,
        avatar: null,
      },
    }),
    prisma.user.create({
      data: {
        nickname: "ユーザー2",
        email: "user2@example.com",
        password: hashedPassword,
        avatar: null,
      },
    }),
    prisma.user.create({
      data: {
        nickname: "ユーザー3",
        email: "user3@example.com",
        password: hashedPassword,
        avatar: null,
      },
    }),
    prisma.user.create({
      data: {
        nickname: "チャット好き",
        email: "chat@example.com",
        password: hashedPassword,
        avatar: null,
      },
    }),
    prisma.user.create({
      data: {
        nickname: "ライブチャット初心者",
        email: "beginner@example.com",
        password: hashedPassword,
        avatar: null,
      },
    }),
  ])

  console.log("✅ Created users")

  // Create posts
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
        authorId: users[4].id,
        viewCount: 156,
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
        authorId: users[0].id,
        viewCount: 234,
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
        authorId: users[1].id,
        viewCount: 189,
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
        authorId: users[2].id,
        viewCount: 298,
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
        authorId: users[3].id,
        viewCount: 445,
      },
    }),
  ])

  console.log("✅ Created posts")

  // Create chat rooms
  const chatRooms = await Promise.all([
    prisma.chatRoom.create({
      data: {
        name: "初心者向け雑談ルーム",
        description: "ライブチャット初心者の方向けの雑談ルームです",
        atmosphere: "friendly",
        isPrivate: false,
        creatorId: users[0].id,
      },
    }),
    prisma.chatRoom.create({
      data: {
        name: "おすすめサイト情報交換",
        description: "おすすめのライブチャットサイトについて情報交換しましょう",
        atmosphere: "romantic",
        isPrivate: false,
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
        creatorId: users[3].id,
      },
    }),
  ])

  console.log("✅ Created chat rooms")

  // Create room members
  const roomMembers = []
  for (let i = 0; i < chatRooms.length; i++) {
    for (let j = 0; j < users.length; j++) {
      if (Math.random() > 0.3) {
        // 70% chance to join each room
        roomMembers.push(
          prisma.roomMember.create({
            data: {
              roomId: chatRooms[i].id,
              userId: users[j].id,
              isOnline: Math.random() > 0.5,
              lastSeen: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
            },
          }),
        )
      }
    }
  }
  await Promise.all(roomMembers)

  console.log("✅ Created room members")

  // Create chat messages
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

  for (let i = 0; i < chatRooms.length; i++) {
    for (let j = 0; j < 15; j++) {
      const randomUser = users[Math.floor(Math.random() * users.length)]
      const randomContent = messageContents[Math.floor(Math.random() * messageContents.length)]

      chatMessages.push(
        prisma.chatMessage.create({
          data: {
            content: randomContent,
            type: "message",
            roomId: chatRooms[i].id,
            userId: randomUser.id,
            createdAt: new Date(Date.now() - Math.random() * 86400000 * 7), // Random time in last week
          },
        }),
      )
    }
  }
  await Promise.all(chatMessages)

  console.log("✅ Created chat messages")

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
  await Promise.all(comments)

  console.log("✅ Created comments")

  // Create likes
  const likes = []
  for (let i = 0; i < posts.length; i++) {
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
  await Promise.all(likes)

  console.log("✅ Created likes")

  // Create some reports
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
  ])

  console.log("✅ Created reports")

  console.log("🎉 Seed completed successfully!")

  // Print summary
  const userCount = await prisma.user.count()
  const postCount = await prisma.post.count()
  const roomCount = await prisma.chatRoom.count()
  const messageCount = await prisma.chatMessage.count()
  const commentCount = await prisma.comment.count()
  const likeCount = await prisma.like.count()

  console.log("\n📊 Database Summary:")
  console.log(`👥 Users: ${userCount}`)
  console.log(`📝 Posts: ${postCount}`)
  console.log(`💬 Chat Rooms: ${roomCount}`)
  console.log(`💭 Messages: ${messageCount}`)
  console.log(`💬 Comments: ${commentCount}`)
  console.log(`❤️ Likes: ${likeCount}`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
