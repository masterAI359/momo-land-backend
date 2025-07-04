import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageSquare, Clock, User } from "lucide-react"
import Link from "next/link"
import AffiliateBanner from "@/components/affiliate-banner"

export const metadata = {
  title: "タイムライン - momoLand",
  description: "ライブチャット体験記のタイムライン。最新の投稿を時系列で確認できます。",
}

export default function TimelinePage() {
  // サンプルデータ
  const timelineItems = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `ライブチャット体験記 ${i + 1}`,
    author: `ユーザー${i + 1}`,
    excerpt: "ライブチャットでの体験について詳しく書かれた投稿です。実際の体験談や感想が含まれています...",
    likes: Math.floor(Math.random() * 50) + 1,
    comments: Math.floor(Math.random() * 20) + 1,
    createdAt: `${Math.floor(Math.random() * 24) + 1}時間前`,
    category: ["初心者向け", "上級者向け", "おすすめ", "レビュー"][Math.floor(Math.random() * 4)],
  })).sort((a, b) => Number.parseInt(a.createdAt) - Number.parseInt(b.createdAt))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">タイムライン</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            最新のライブチャット体験記を時系列で確認できます。 気になる投稿をクリックして詳細をチェックしてみましょう。
          </p>
        </div>

        <AffiliateBanner size="large" position="content" />

        {/* Timeline */}
        <div className="space-y-6">
          {timelineItems.map((item, index) => (
            <div key={item.id} className="relative">
              {/* Timeline Line */}
              {index !== timelineItems.length - 1 && (
                <div className="absolute left-4 top-16 w-0.5 h-full bg-gray-200 -z-10"></div>
              )}

              {/* Timeline Item */}
              <div className="flex items-start space-x-4">
                {/* Timeline Dot */}
                <div className="flex-shrink-0 w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center mt-2">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>

                {/* Content */}
                <Card className="flex-1 hover:shadow-lg transition-shadow">
                  <Link href={`/blogs/${item.id}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.createdAt}
                        </span>
                      </div>
                      <CardTitle className="text-lg hover:text-pink-600 transition-colors">{item.title}</CardTitle>
                      <CardDescription className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {item.author}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Heart className="w-4 h-4 mr-1 text-red-500" />
                            {item.likes}
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1 text-blue-500" />
                            {item.comments}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-pink-600 hover:text-pink-700">
                          続きを読む →
                        </Button>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </div>
            </div>
          ))}
        </div>

        <AffiliateBanner size="medium" position="content" />

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" size="lg">
            さらに読み込む
          </Button>
        </div>
      </div>
    </div>
  )
}
