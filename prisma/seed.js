const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

// Sample data arrays for generating diverse content
const userNames = [
  "田中太郎", "佐藤花子", "鈴木次郎", "高橋愛", "山田初心", "中村美咲", "小林健太", "加藤由美",
  "吉田龍一", "渡辺美穂", "伊藤優太", "山本彩", "中島大輔", "松本真理", "井上和也", "木村舞",
  "林拓海", "清水恵", "斎藤光", "森田智美", "池田修", "前田沙織", "藤田正", "長谷川香織",
  "村上大", "近藤美里", "石田誠", "後藤奈々", "遠藤勇", "青木麻衣", "福田健", "西村優香",
  "太田豊", "原田美奈", "岡田剛", "宮崎りな", "坂本拓", "内田さくら", "石川武", "柴田美由紀",
  "横山良", "三浦あゆみ", "岩田正義", "金子理恵", "服部健司", "北村美紀", "橋本正人", "菅原真美",
  "酒井大介", "竹内薫", "山口博", "新井美智子", "古川秀明", "松田美穂", "今井勝", "大野恵美",
  "宮田浩", "小松智子", "成田健太郎", "島田美香", "大塚正", "松井理香", "野村大輔", "小野美奈子",
  "菊池健", "田口香", "千葉雄一", "小山真由美", "平野直樹", "谷口美咲", "大谷健一", "小島里美",
  "武田洋", "堀田美津子", "中川直人", "宮本美和", "森本健", "杉山美幸", "河野大", "小林美香",
  "田村誠", "松岡美紀", "山崎健太", "高田美穂", "上田大輔", "中野恵", "白石正", "岸本美里",
  "大久保健", "村田美由紀", "小川直樹", "松永美智子", "藤原大", "川田恵美", "岡本正人", "植田美奈",
  "矢野健太郎", "小池真理", "大森直人", "島崎美咲", "青山正", "柳田美紀", "山下大輔", "桜井恵",
  "中山健一", "小野寺美和", "関根正", "高木美幸", "小野健", "小野寺美津子", "田中美紀", "佐々木健太"
]

const locations = [
  "東京都", "大阪府", "愛知県", "神奈川県", "福岡県", "埼玉県", "千葉県", "兵庫県", "北海道", "静岡県",
  "京都府", "茨城県", "広島県", "宮城県", "新潟県", "長野県", "岐阜県", "栃木県", "群馬県", "岡山県",
  "福島県", "三重県", "山梨県", "鹿児島県", "滋賀県", "山口県", "愛媛県", "青森県", "石川県", "長崎県",
  "大分県", "宮崎県", "熊本県", "和歌山県", "奈良県", "香川県", "富山県", "秋田県", "福井県", "岩手県",
  "山形県", "佐賀県", "徳島県", "沖縄県", "島根県", "鳥取県", "高知県"
]

const occupations = [
  "会社員", "学生", "エンジニア", "フリーランス", "販売員", "教師", "看護師", "公務員", "医師", "弁護士",
  "デザイナー", "プログラマー", "営業", "事務員", "美容師", "料理人", "アーティスト", "ライター", "通訳",
  "建築士", "経営者", "コンサルタント", "研究者", "編集者", "カメラマン", "音楽家", "俳優", "モデル",
  "スポーツ選手", "トレーナー", "セラピスト", "接客業", "配送業", "清掃員", "警備員", "運転手", "介護士",
  "薬剤師", "獣医師", "農業", "漁業", "製造業", "建設業", "不動産", "金融", "保険", "旅行業", "ホテル業"
]

const interests = [
  "ライブチャット", "アニメ", "ゲーム", "音楽", "映画", "読書", "料理", "旅行", "スポーツ", "写真",
  "絵画", "ダンス", "カラオケ", "ショッピング", "ファッション", "美容", "健康", "フィットネス", "ヨガ",
  "園芸", "ペット", "車", "バイク", "テクノロジー", "プログラミング", "投資", "副業", "起業", "語学",
  "歴史", "科学", "数学", "哲学", "心理学", "社会学", "経済学", "政治", "環境", "ボランティア",
  "手作り", "DIY", "コレクション", "アウトドア", "キャンプ", "登山", "釣り", "マリンスポーツ", "ウィンタースポーツ"
]

const postCategories = [
  "初心者向け", "おすすめ", "体験談", "比較", "レビュー", "質問", "雑談", "技術", "安全", "料金",
  "サイト情報", "チャットレディ", "イベント", "キャンペーン", "お知らせ", "その他"
]

const postTitles = [
  "初めてのライブチャット体験記", "おすすめライブチャットサイト比較", "安全なライブチャットの楽しみ方",
  "料金体系について詳しく解説", "人気チャットレディの魅力", "ライブチャット初心者Q&A",
  "サイト選びのポイント", "楽しいチャット体験のコツ", "トラブル回避の方法", "お得なキャンペーン情報",
  "ライブチャットの歴史", "技術的な問題の解決法", "コミュニケーションスキル向上", "チャットマナー講座",
  "女性ユーザーの視点から", "男性ユーザーの本音", "ライブチャットの未来", "新機能の紹介",
  "イベント参加レポート", "コミュニティの楽しみ方", "プライバシー保護について", "決済方法の選び方",
  "モバイルアプリの使い方", "デスクトップ版の活用", "チャットルームの選び方", "友達作りのコツ",
  "長期利用者の体験談", "短期利用の感想", "複数サイト利用の比較", "専門的な機能の解説"
]

const chatRoomNames = [
  "初心者向け雑談ルーム", "おすすめサイト情報交換", "プライベートルーム", "上級者向けディスカッション",
  "ゲスト専用ルーム", "女性限定ルーム", "男性限定ルーム", "質問・相談ルーム", "技術討論ルーム",
  "安全性について", "料金相談室", "イベント情報", "キャンペーン情報", "新機能紹介", "バグ報告",
  "フィードバック", "コミュニティ", "友達作り", "恋愛相談", "人生相談", "趣味の話", "グルメ情報",
  "旅行情報", "映画・アニメ", "音楽好き", "ゲーム好き", "スポーツ好き", "読書好き", "料理好き",
  "ファッション", "美容・健康", "ペット好き", "車・バイク", "テクノロジー", "投資・副業", "学習・教育",
  "アート・クリエイティブ", "写真撮影", "DIY・手作り", "アウトドア", "インドア派", "夜更かし組",
  "早起き組", "関東地方", "関西地方", "東海地方", "九州地方", "北海道・東北", "中国・四国"
]

const commentContents = [
  "とても参考になる体験記でした！", "私も同じような経験があります", "詳しい情報をありがとうございます",
  "おすすめのサイトを教えていただけませんか？", "初心者にも分かりやすい説明ですね", "続きが気になります",
  "素晴らしい体験談ですね", "私も試してみたいと思います", "安全面での注意点が参考になりました",
  "また新しい投稿を楽しみにしています", "具体的なアドバイスが助かります", "料金について詳しく知りたいです",
  "サイトの使い勝手はどうでしたか？", "チャットレディの方の対応はいかがでしたか？", "トラブルはありませんでしたか？",
  "他のサイトとの違いはありますか？", "初回利用時の注意点を教えてください", "長期利用の感想を聞かせてください",
  "モバイル版の使い心地はどうですか？", "決済方法で困ったことはありますか？", "カスタマーサポートの対応は？",
  "プライバシー保護は大丈夫ですか？", "新機能についてどう思いますか？", "コミュニティの雰囲気はどうですか？",
  "友達は作れましたか？", "楽しい時間を過ごせましたか？", "また利用したいと思いますか？",
  "おすすめのポイントを教えてください", "気をつけるべき点はありますか？", "初心者へのアドバイスをお願いします"
]

const messageContents = [
  "こんにちは！このルームへようこそ 💕", "素敵な雰囲気のルームですね ✨", "みなさんはどのサイトを利用していますか？",
  "初心者におすすめのサイトを教えてください", "今日はとても楽しい時間を過ごせました 😊", "また明日もお話ししましょう！",
  "新しいサイトを試してみました", "チャットレディの方がとても親切でした", "料金体系が分かりやすくて良いですね",
  "セキュリティ面でも安心できます", "モバイル版も使いやすいです", "新機能が追加されましたね",
  "イベントに参加してみました", "キャンペーンがお得でした", "友達ができて嬉しいです", "質問があります",
  "アドバイスをいただけませんか？", "体験談をシェアします", "おすすめ情報です", "注意点をお伝えします",
  "技術的な質問です", "サポートに問い合わせました", "問題が解決しました", "新しい発見がありました",
  "皆さんのおかげです", "ありがとうございました", "お疲れ様でした", "良い一日を！", "またお会いしましょう",
  "楽しい時間でした", "勉強になりました", "参考になりました", "共感できます", "同感です"
]

const reportDescriptions = [
  "サイトの読み込みが遅い問題について", "不適切なコメントが投稿されています", "スパムコメントが多数投稿されています",
  "その他の問題について", "ログインできない問題", "決済に関する問題", "表示が崩れています",
  "音声が聞こえません", "映像が表示されません", "チャットメッセージが送信できません",
  "プロフィール編集ができません", "通知が来ません", "アプリが強制終了します", "動作が重いです",
  "セキュリティに関する懸念", "プライバシーに関する問題", "利用規約違反の報告", "著作権侵害の疑い",
  "年齢制限に関する問題", "詐欺的な行為の報告", "迷惑メールが送られてきます", "アカウントが乗っ取られました",
  "不正なアクセスの疑い", "データが消失しました", "バックアップが取れません", "復旧方法を教えてください",
  "新機能の要望", "改善提案", "バグの報告", "要望・提案", "フィードバック", "その他の問題"
]

async function generateUsers(count = 80) {
  const users = []
  const hashedPassword = await bcrypt.hash("password123", 10)
  const adminPassword = await bcrypt.hash("admin123", 10)
  
  // First create admin users
  users.push(
    {
      nickname: "スーパー管理者",
      email: "superadmin@example.com",
      password: adminPassword,
      isGuest: false,
      role: "SUPER_ADMIN",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin",
      fullName: "スーパー管理者",
      bio: "システムの最高管理者です。",
      occupation: "システム管理者",
      isActive: true,
      lastLoginAt: new Date(),
      lastActiveAt: new Date(),
    },
    {
      nickname: "管理者",
      email: "admin@example.com",
      password: adminPassword,
      isGuest: false,
      role: "ADMIN",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      fullName: "管理者",
      bio: "サイト運営の管理者です。",
      occupation: "サイト管理者",
      isActive: true,
      lastLoginAt: new Date(),
      lastActiveAt: new Date(),
    },
    {
      nickname: "モデレーター",
      email: "moderator@example.com",
      password: adminPassword,
      isGuest: false,
      role: "MODERATOR",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=moderator",
      fullName: "モデレーター",
      bio: "コンテンツのモデレーションを担当しています。",
      occupation: "コンテンツモデレーター",
      isActive: true,
      lastLoginAt: new Date(),
      lastActiveAt: new Date(),
    }
  )

  // Generate regular users
  for (let i = 0; i < count - 3; i++) {
    const isGuest = Math.random() < 0.2 // 20% chance of being guest
    const isSuspended = Math.random() < 0.05 // 5% chance of being suspended
    const isActive = !isSuspended && Math.random() < 0.8 // 80% chance of being active (if not suspended)
    
    const name = userNames[Math.floor(Math.random() * userNames.length)]
    const location = locations[Math.floor(Math.random() * locations.length)]
    const occupation = occupations[Math.floor(Math.random() * occupations.length)]
    const userInterests = interests.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 2)
    
    const user = {
      nickname: isGuest ? `ゲスト${i + 1}` : `${name.split(' ')[0]}${i + 1}`,
      email: `user${i + 1}@example.com`,
      password: isGuest ? null : hashedPassword,
      isGuest,
      role: "USER",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 1}`,
      fullName: isGuest ? null : name,
      bio: isGuest ? null : `${occupation}として働いています。よろしくお願いします！`,
      age: isGuest ? null : Math.floor(Math.random() * 50) + 18,
      location: isGuest ? null : location,
      gender: Math.random() < 0.6 ? "男性" : "女性",
      occupation: isGuest ? null : occupation,
      interests: isGuest ? [] : userInterests,
      isActive,
      isSuspended,
      suspendedUntil: isSuspended ? new Date(Date.now() + 86400000 * (Math.floor(Math.random() * 30) + 1)) : null,
      suspendReason: isSuspended ? "規約違反のため" : null,
      lastLoginAt: isActive ? new Date(Date.now() - Math.random() * 86400000 * 7) : new Date(Date.now() - Math.random() * 86400000 * 30),
      lastActiveAt: isActive ? new Date(Date.now() - Math.random() * 86400000 * 3) : new Date(Date.now() - Math.random() * 86400000 * 30),
    }
    
    users.push(user)
  }
  
  return users
}

async function generatePosts(users, count = 40) {
  const posts = []
  
  for (let i = 0; i < count; i++) {
    const author = users[Math.floor(Math.random() * users.length)]
    const title = postTitles[Math.floor(Math.random() * postTitles.length)]
    const category = postCategories[Math.floor(Math.random() * postCategories.length)]
    const isPublished = Math.random() < 0.85 // 85% chance of being published
    const status = isPublished ? (Math.random() < 0.9 ? "APPROVED" : "PENDING") : (Math.random() < 0.5 ? "FLAGGED" : "PENDING")
    const isFeatured = isPublished && Math.random() < 0.2 // 20% chance of being featured
    
    const post = {
      title: `${title} ${i + 1}`,
      content: `これは${category}カテゴリーの投稿です。\n\n## 概要\n\n${title}について詳しく説明します。この投稿では、実際の体験に基づいた情報を提供しています。\n\n## 詳細内容\n\n具体的な内容を以下に示します：\n\n1. **第一のポイント**: 重要な情報をお伝えします\n2. **第二のポイント**: 実践的なアドバイスを提供します\n3. **第三のポイント**: 注意すべき点を説明します\n\n## まとめ\n\n以上の内容を踏まえて、皆さんの参考になれば幸いです。質問やご意見があれば、お気軽にコメントしてください。`,
      category,
      excerpt: `${title}について詳しく説明した投稿です。実際の体験に基づいた情報を提供しています。`,
      isPublished,
      viewCount: isPublished ? Math.floor(Math.random() * 500) + 10 : 0,
      authorId: author.id,
      status,
      isFeatured,
      priority: isFeatured ? Math.floor(Math.random() * 5) + 1 : 0,
      moderationReason: status === "FLAGGED" ? "内容確認中" : null,
      moderatedAt: status === "FLAGGED" ? new Date(Date.now() - Math.random() * 86400000) : null,
      moderatedBy: status === "FLAGGED" ? users[2].id : null, // Moderator
      isBlocked: status === "FLAGGED",
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 30), // Within last 30 days
    }
    
    posts.push(post)
  }
  
  return posts
}

async function generateChatRooms(users, count = 20) {
  const rooms = []
  const atmospheres = ["friendly", "romantic", "intimate", "professional", "casual"]
  
  for (let i = 0; i < count; i++) {
    const creator = users[Math.floor(Math.random() * users.length)]
    const name = chatRoomNames[Math.floor(Math.random() * chatRoomNames.length)]
    const atmosphere = atmospheres[Math.floor(Math.random() * atmospheres.length)]
    const isPrivate = Math.random() < 0.3 // 30% chance of being private
    
    const room = {
      name: `${name} ${i + 1}`,
      description: `${name}の説明です。このルームでは${atmosphere}な雰囲気で会話を楽しめます。`,
      atmosphere,
      isPrivate,
      maxMembers: isPrivate ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 100) + 20,
      creatorId: creator.id,
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 60), // Within last 60 days
    }
    
    rooms.push(room)
  }
  
  return rooms
}

async function main() {
  console.log("🌱 Starting enhanced seed with more data...")

  // Clear existing data in the correct order (respecting foreign key constraints)
  await prisma.userActivity.deleteMany()
  await prisma.adminAction.deleteMany()
  await prisma.moderationAction.deleteMany()
  await prisma.userPermission.deleteMany()
  await prisma.systemSetting.deleteMany()
  await prisma.chatMessage.deleteMany()
  await prisma.roomMember.deleteMany()
  await prisma.chatRoom.deleteMany()
  await prisma.like.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.post.deleteMany()
  await prisma.report.deleteMany()
  await prisma.user.deleteMany()
  await prisma.permission.deleteMany()

<<<<<<< HEAD
  // Create users
  const hashedPassword = await bcrypt.hash("password123", 10)

  const users = await Promise.all([
    prisma.user.create({
      data: {
        nickname: "ユーザー1",
        email: "user1@example.com",
        password: hashedPassword,
        avatar: null,
=======
  // Create default permissions
  console.log("📋 Creating permissions...")
  const permissions = await Promise.all([
    // User Management Permissions
    prisma.permission.create({
      data: {
        name: "user.view",
        description: "View user information",
        category: "user_management",
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
      },
    }),
    prisma.permission.create({
      data: {
<<<<<<< HEAD
        nickname: "ユーザー2",
        email: "user2@example.com",
        password: hashedPassword,
        avatar: null,
=======
        name: "user.edit",
        description: "Edit user information",
        category: "user_management",
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
      },
    }),
    prisma.permission.create({
      data: {
<<<<<<< HEAD
        nickname: "ユーザー3",
        email: "user3@example.com",
        password: hashedPassword,
        avatar: null,
=======
        name: "user.delete",
        description: "Delete user accounts",
        category: "user_management",
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
      },
    }),
    prisma.permission.create({
      data: {
<<<<<<< HEAD
        nickname: "チャット好き",
        email: "chat@example.com",
        password: hashedPassword,
        avatar: null,
=======
        name: "user.ban",
        description: "Ban user accounts",
        category: "user_management",
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
      },
    }),
    prisma.permission.create({
      data: {
<<<<<<< HEAD
        nickname: "ライブチャット初心者",
        email: "beginner@example.com",
        password: hashedPassword,
        avatar: null,
=======
        name: "user.suspend",
        description: "Suspend user accounts",
        category: "user_management",
      },
    }),
    prisma.permission.create({
      data: {
        name: "user.permissions",
        description: "Manage user permissions",
        category: "user_management",
      },
    }),
    // Content Management Permissions
    prisma.permission.create({
      data: {
        name: "content.view",
        description: "View all content",
        category: "content_management",
      },
    }),
    prisma.permission.create({
      data: {
        name: "content.edit",
        description: "Edit all content",
        category: "content_management",
      },
    }),
    prisma.permission.create({
      data: {
        name: "content.delete",
        description: "Delete content",
        category: "content_management",
      },
    }),
    prisma.permission.create({
      data: {
        name: "content.moderate",
        description: "Moderate content (approve/reject)",
        category: "content_management",
      },
    }),
    prisma.permission.create({
      data: {
        name: "content.feature",
        description: "Feature content",
        category: "content_management",
      },
    }),
    // System Management Permissions
    prisma.permission.create({
      data: {
        name: "system.settings",
        description: "Manage system settings",
        category: "system_management",
      },
    }),
    prisma.permission.create({
      data: {
        name: "system.logs",
        description: "View system logs",
        category: "system_management",
      },
    }),
    prisma.permission.create({
      data: {
        name: "system.analytics",
        description: "View system analytics",
        category: "system_management",
      },
    }),
    prisma.permission.create({
      data: {
        name: "admin.actions",
        description: "View admin actions log",
        category: "system_management",
      },
    }),
    // Report Management Permissions
    prisma.permission.create({
      data: {
        name: "reports.view",
        description: "View reports",
        category: "content_management",
      },
    }),
    prisma.permission.create({
      data: {
        name: "reports.manage",
        description: "Manage and resolve reports",
        category: "content_management",
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
      },
    }),
  ])

<<<<<<< HEAD
  console.log("✅ Created users")

  // Create posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: "初めてのライブチャット体験記",
        content: `こんにちは、ライブチャット初心者です。今回は私の初めてのライブチャット体験について詳しくお話ししたいと思います。
=======
  console.log("✅ Created permissions")

  // Generate and create users
  console.log("👥 Creating users...")
  const userData = await generateUsers(80)
  const users = await Promise.all(userData.map(user => prisma.user.create({ data: user })))
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4

  console.log("✅ Created 80 users (including admin users)")

  // Grant permissions to admin users
  console.log("🔐 Granting permissions to admin users...")
  
  // Super Admin gets all permissions
  const superAdminPermissions = permissions.map(permission => ({
    userId: users[0].id, // Super Admin
    permissionId: permission.id,
    grantedBy: users[0].id,
  }))
  
  // Admin gets most permissions except system management
  const adminPermissions = permissions
    .filter(p => p.category !== "system_management" || p.name === "admin.actions")
    .map(permission => ({
      userId: users[1].id, // Admin
      permissionId: permission.id,
      grantedBy: users[0].id,
    }))
  
  // Moderator gets content and report management permissions
  const moderatorPermissions = permissions
    .filter(p => p.category === "content_management" || p.name === "user.view")
    .map(permission => ({
      userId: users[2].id, // Moderator
      permissionId: permission.id,
      grantedBy: users[0].id,
    }))

  await prisma.userPermission.createMany({
    data: [...superAdminPermissions, ...adminPermissions, ...moderatorPermissions],
  })

  console.log("✅ Granted permissions to admin users")

<<<<<<< HEAD
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
=======
  // Create enhanced system settings
  console.log("⚙️ Creating system settings...")
  await prisma.systemSetting.createMany({
    data: [
      // General Settings
      {
        key: "site_name",
        value: "モモランド",
        description: "サイト名",
        category: "general",
        isPublic: true,
      },
      {
        key: "site_description",
        value: "最高のライブチャット体験を提供するサイト",
        description: "サイトの説明",
        category: "general",
        isPublic: true,
      },
      {
        key: "site_keywords",
        value: "ライブチャット,オンライン,コミュニケーション,チャット",
        description: "サイトのキーワード",
        category: "general",
        isPublic: true,
      },
      {
        key: "maintenance_mode",
        value: "false",
        description: "メンテナンスモード",
        category: "general",
        isPublic: false,
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
      },
      {
        key: "user_registration_enabled",
        value: "true",
        description: "ユーザー登録を有効にする",
        category: "general",
        isPublic: false,
      },
      {
        key: "guest_access_enabled",
        value: "true",
        description: "ゲストアクセスを有効にする",
        category: "general",
        isPublic: false,
      },
      {
        key: "max_users_per_room",
        value: "100",
        description: "ルームあたりの最大ユーザー数",
        category: "general",
        isPublic: false,
      },
      // Security Settings
      {
        key: "max_login_attempts",
        value: "5",
        description: "最大ログイン試行回数",
        category: "security",
        isPublic: false,
      },
      {
        key: "session_timeout",
        value: "3600",
        description: "セッションタイムアウト（秒）",
        category: "security",
        isPublic: false,
      },
      {
        key: "password_min_length",
        value: "6",
        description: "パスワードの最小長",
        category: "security",
        isPublic: false,
      },
      {
        key: "two_factor_enabled",
        value: "false",
        description: "二要素認証を有効にする",
        category: "security",
        isPublic: false,
      },
      {
        key: "ip_whitelist_enabled",
        value: "false",
        description: "IPホワイトリストを有効にする",
        category: "security",
        isPublic: false,
      },
      // Moderation Settings
      {
        key: "auto_moderation_enabled",
        value: "true",
        description: "自動モデレーションを有効にする",
        category: "moderation",
        isPublic: false,
      },
      {
        key: "banned_words",
        value: "spam,inappropriate,abuse,hate,violence",
        description: "禁止ワードリスト",
        category: "moderation",
        isPublic: false,
      },
      {
        key: "max_reports_per_user",
        value: "10",
        description: "ユーザー1人あたりの最大報告数",
        category: "moderation",
        isPublic: false,
      },
      {
        key: "auto_suspend_threshold",
        value: "5",
        description: "自動停止の閾値（報告数）",
        category: "moderation",
        isPublic: false,
      },
      {
        key: "content_approval_required",
        value: "false",
        description: "コンテンツの承認を必須にする",
        category: "moderation",
        isPublic: false,
      },
      // Payment Settings
      {
        key: "payment_enabled",
        value: "true",
        description: "決済機能を有効にする",
        category: "payment",
        isPublic: false,
      },
      {
        key: "supported_currencies",
        value: "JPY,USD,EUR",
        description: "サポートする通貨",
        category: "payment",
        isPublic: false,
      },
      {
        key: "min_charge_amount",
        value: "500",
        description: "最小チャージ金額",
        category: "payment",
        isPublic: false,
      },
      // Notification Settings
      {
        key: "email_notifications_enabled",
        value: "true",
        description: "メール通知を有効にする",
        category: "notification",
        isPublic: false,
      },
      {
        key: "push_notifications_enabled",
        value: "true",
        description: "プッシュ通知を有効にする",
        category: "notification",
        isPublic: false,
      },
      {
        key: "sms_notifications_enabled",
        value: "false",
        description: "SMS通知を有効にする",
        category: "notification",
        isPublic: false,
      },
    ],
  })

  console.log("✅ Created enhanced system settings")

  // Generate and create posts
  console.log("📝 Creating posts...")
  const postData = await generatePosts(users, 40)
  const posts = await Promise.all(postData.map(post => prisma.post.create({ data: post })))

<<<<<<< HEAD
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
=======
  console.log("✅ Created 40 posts (including moderated content)")

  // Generate and create chat rooms
  console.log("💬 Creating chat rooms...")
  const roomData = await generateChatRooms(users, 20)
  const chatRooms = await Promise.all(roomData.map(room => prisma.chatRoom.create({ data: room })))

  console.log("✅ Created 20 chat rooms with different atmospheres")

  // Create room members with more realistic data
  console.log("👥 Creating room members...")
  const roomMembers = []
  for (let i = 0; i < chatRooms.length; i++) {
    const room = chatRooms[i]
    const memberCount = Math.floor(Math.random() * Math.min(room.maxMembers, users.length)) + 1
    const shuffledUsers = [...users].sort(() => 0.5 - Math.random()).slice(0, memberCount)

    for (const user of shuffledUsers) {
      const isOnline = Math.random() > 0.6 // 40% chance of being online
      const lastSeen = isOnline 
        ? new Date() 
        : new Date(Date.now() - Math.random() * 86400000 * 3) // Random time in last 3 days

      roomMembers.push(
        prisma.roomMember.create({
          data: {
            roomId: room.id,
            userId: user.id,
            isOnline,
            lastSeen,
            joinedAt: new Date(Date.now() - Math.random() * 86400000 * 30), // Joined within last 30 days
          },
        })
      )
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
    }
  }
  await Promise.all(roomMembers)

  console.log("✅ Created room members with realistic online/offline status")

<<<<<<< HEAD
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
=======
  // Create chat messages with more variety
  console.log("💬 Creating chat messages...")
  const chatMessages = []
  for (let i = 0; i < chatRooms.length; i++) {
    const room = chatRooms[i]
    const messageCount = Math.floor(Math.random() * 100) + 20 // 20-119 messages per room

    for (let j = 0; j < messageCount; j++) {
      const randomUser = users[Math.floor(Math.random() * users.length)]
      const randomContent = messageContents[Math.floor(Math.random() * messageContents.length)]
      const messageType = Math.random() < 0.85 ? "message" : (Math.random() < 0.5 ? "join" : "leave")
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4

      chatMessages.push(
        prisma.chatMessage.create({
          data: {
            content: randomContent,
<<<<<<< HEAD
            type: "message",
            roomId: chatRooms[i].id,
=======
            type: messageType,
            roomId: room.id,
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
            userId: randomUser.id,
            createdAt: new Date(Date.now() - Math.random() * 86400000 * 14), // Random time in last 2 weeks
          },
        })
      )
    }
  }
  await Promise.all(chatMessages)

<<<<<<< HEAD
  console.log("✅ Created chat messages")
=======
  console.log("✅ Created chat messages with more variety")
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4

  // Create comments with more realistic distribution
  console.log("💬 Creating comments...")
  const comments = []
<<<<<<< HEAD
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
=======
  for (const post of posts) {
    if (post.isPublished) {
      const commentCount = Math.floor(Math.random() * 15) + 1 // 1-15 comments per published post
      for (let j = 0; j < commentCount; j++) {
        const randomUser = users[Math.floor(Math.random() * users.length)]
        const randomContent = commentContents[Math.floor(Math.random() * commentContents.length)]

        comments.push(
          prisma.comment.create({
            data: {
              content: randomContent,
              postId: post.id,
              authorId: randomUser.id,
              createdAt: new Date(Date.now() - Math.random() * 86400000 * 7), // Random time in last week
            },
          })
        )
      }
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
    }
  }
  await Promise.all(comments)

<<<<<<< HEAD
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
=======
  console.log("✅ Created comments with realistic distribution")

  // Create likes with more realistic patterns
  console.log("👍 Creating likes...")
  const likes = []
  for (const post of posts) {
    if (post.isPublished) {
      const likeCount = Math.floor(Math.random() * users.length * 0.7) + 1 // Up to 70% of users can like a post
      const shuffledUsers = [...users].sort(() => 0.5 - Math.random()).slice(0, likeCount)

      for (const user of shuffledUsers) {
        likes.push(
          prisma.like.create({
            data: {
              postId: post.id,
              userId: user.id,
              createdAt: new Date(Date.now() - Math.random() * 86400000 * 10), // Random time in last 10 days
            },
          })
        )
      }
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
    }
  }
  await Promise.all(likes)

<<<<<<< HEAD
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
=======
  console.log("✅ Created likes with realistic patterns")

  // Create more reports with different types and statuses
  console.log("📋 Creating reports...")
  const reports = []
  const reportTypes = ["technical", "inappropriate", "spam", "other", "bug", "feature_request"]
  const reportStatuses = ["pending", "reviewed", "resolved", "rejected"]

  for (let i = 0; i < 25; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)]
    const randomType = reportTypes[Math.floor(Math.random() * reportTypes.length)]
    const randomStatus = reportStatuses[Math.floor(Math.random() * reportStatuses.length)]
    const randomDescription = reportDescriptions[Math.floor(Math.random() * reportDescriptions.length)]
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4

    reports.push(
      prisma.report.create({
        data: {
          type: randomType,
          description: randomDescription,
          status: randomStatus,
          reporterId: randomUser.id,
          createdAt: new Date(Date.now() - Math.random() * 86400000 * 30), // Random time in last 30 days
        },
      })
    )
  }
  await Promise.all(reports)

  console.log("✅ Created 25 reports with different types and statuses")

  // Create more admin actions
  console.log("📝 Creating admin actions...")
  const adminActions = []
  const actionTypes = ["user_suspended", "user_banned", "user_deleted", "post_flagged", "post_deleted", "comment_deleted", "user_role_changed", "system_setting_changed"]

  for (let i = 0; i < 50; i++) {
    const randomAdmin = users.slice(0, 3)[Math.floor(Math.random() * 3)] // One of the three admin users
    const randomAction = actionTypes[Math.floor(Math.random() * actionTypes.length)]
    const randomTarget = users[Math.floor(Math.random() * users.length)]

    adminActions.push(
      prisma.adminAction.create({
        data: {
          adminId: randomAdmin.id,
          action: randomAction,
          targetType: randomAction.includes("user") ? "user" : (randomAction.includes("post") ? "post" : "comment"),
          targetId: randomTarget.id,
          details: {
            reason: `Admin action: ${randomAction}`,
            timestamp: new Date(),
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          createdAt: new Date(Date.now() - Math.random() * 86400000 * 30), // Random time in last 30 days
        },
      })
    )
  }
  await Promise.all(adminActions)

  console.log("✅ Created 50 admin actions")

  // Create more moderation actions
  console.log("⚖️ Creating moderation actions...")
  const moderationActions = []
  const moderationActionTypes = ["WARN", "SUSPEND", "BAN", "BLOCK", "UNBAN", "UNSUSPEND", "UNBLOCK", "MUTE", "UNMUTE"]

  for (let i = 0; i < 30; i++) {
    const randomModerator = users.slice(0, 3)[Math.floor(Math.random() * 3)] // One of the three admin users
    const randomAction = moderationActionTypes[Math.floor(Math.random() * moderationActionTypes.length)]
    const randomUser = users[Math.floor(Math.random() * users.length)]

    moderationActions.push(
      prisma.moderationAction.create({
        data: {
          moderatorId: randomModerator.id,
          userId: randomUser.id,
          action: randomAction,
          reason: `Moderation action: ${randomAction}`,
          details: {
            action: randomAction,
            timestamp: new Date(),
          },
          expiresAt: ["SUSPEND", "BAN"].includes(randomAction) ? new Date(Date.now() + 86400000 * (Math.floor(Math.random() * 30) + 1)) : null,
          createdAt: new Date(Date.now() - Math.random() * 86400000 * 30), // Random time in last 30 days
        },
      })
    )
  }
  await Promise.all(moderationActions)

  console.log("✅ Created 30 moderation actions")

  // Create more user activities
  console.log("📊 Creating user activities...")
  const userActivities = []
  const activityTypes = ["login", "logout", "page_view", "post_create", "comment_create", "like_create", "chat_message", "profile_update"]

  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    if (user.isActive) {
      const activityCount = Math.floor(Math.random() * 20) + 5 // 5-24 activities per active user
      
      for (let j = 0; j < activityCount; j++) {
        const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)]
        
        userActivities.push({
          userId: user.id,
          action: randomActivity,
          details: { 
            activity: randomActivity,
            timestamp: new Date(),
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          createdAt: new Date(Date.now() - Math.random() * 86400000 * 14), // Random time in last 2 weeks
        })
      }
    }
  }
  
  await prisma.userActivity.createMany({
    data: userActivities,
  })

  console.log("✅ Created comprehensive user activities")

  console.log("🎉 Enhanced seed completed successfully!")

  // Print comprehensive summary
  const userCount = await prisma.user.count()
<<<<<<< HEAD
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
=======
  const adminCount = await prisma.user.count({ where: { role: { not: "USER" } } })
  const guestCount = await prisma.user.count({ where: { isGuest: true } })
  const suspendedCount = await prisma.user.count({ where: { isSuspended: true } })
  const activeCount = await prisma.user.count({ where: { isActive: true } })
  const permissionCount = await prisma.permission.count()
  const postCount = await prisma.post.count()
  const publishedPostCount = await prisma.post.count({ where: { isPublished: true } })
  const commentCount = await prisma.comment.count()
  const likeCount = await prisma.like.count()
  const chatRoomCount = await prisma.chatRoom.count()
  const chatMessageCount = await prisma.chatMessage.count()
  const reportCount = await prisma.report.count()
  const adminActionCount = await prisma.adminAction.count()
  const moderationActionCount = await prisma.moderationAction.count()
  const userActivityCount = await prisma.userActivity.count()
  const systemSettingCount = await prisma.systemSetting.count()

  console.log("\n📊 Enhanced Database Summary:")
  console.log(`👥 Total Users: ${userCount}`)
  console.log(`   - Admin Users: ${adminCount}`)
  console.log(`   - Guest Users: ${guestCount}`)
  console.log(`   - Active Users: ${activeCount}`)
  console.log(`   - Suspended Users: ${suspendedCount}`)
  console.log(`📝 Total Posts: ${postCount} (${publishedPostCount} published)`)
  console.log(`💬 Total Comments: ${commentCount}`)
  console.log(`👍 Total Likes: ${likeCount}`)
  console.log(`🏠 Total Chat Rooms: ${chatRoomCount}`)
  console.log(`💬 Total Chat Messages: ${chatMessageCount}`)
  console.log(`📋 Total Reports: ${reportCount}`)
  console.log(`🔐 Total Permissions: ${permissionCount}`)
  console.log(`📝 Total Admin Actions: ${adminActionCount}`)
  console.log(`⚖️ Total Moderation Actions: ${moderationActionCount}`)
  console.log(`📊 Total User Activities: ${userActivityCount}`)
  console.log(`⚙️ System Settings: ${systemSettingCount}`)
  console.log("\n🎊 Database is now seeded with comprehensive realistic data!")
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
}

main()
  .catch((e) => {
    console.error("❌ Enhanced seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 