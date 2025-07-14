import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Heart, Clock } from "lucide-react"
import Link from "next/link"
import AffiliateBanner from "@/components/affiliate-banner"

export const metadata = {
  title: "ブログ一覧 - momoLand",
  description: "ライブチャット体験記のブログ一覧ページ。最新の投稿をチェックしよう。",
}

export default function BlogsPage() {
  // サンプルデータ
  const blogs = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `ライブチャット体験記 ${i + 1}`,
    author: `ユーザー${i + 1}`,
    excerpt:
      "ライブチャットでの体験について詳しく書かれた投稿です。実際の体験談や感想が含まれています。この投稿では特に...",
    likes: Math.floor(Math.random() * 50) + 1,
    comments: Math.floor(Math.random() * 20) + 1,
    createdAt: `${Math.floor(Math.random() * 24) + 1}時間前`,
    category: ["初心者向け", "上級者向け", "おすすめ", "レビュー"][Math.floor(Math.random() * 4)],
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">ブログ一覧</h1>
            <p className="text-gray-600">
              ユーザーが投稿したライブチャット体験記を一覧で確認できます。
              気になる投稿をクリックして詳細をチェックしてみましょう。
            </p>
          </div>

          <AffiliateBanner size="large" position="content" />

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {blogs.map((blog) => (
              <Card key={blog.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={`/blogs/${blog.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full">{blog.category}</span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {blog.createdAt}
                      </span>
                    </div>
                    <CardTitle className="text-lg hover:text-pink-600 transition-colors">{blog.title}</CardTitle>
                    <CardDescription>投稿者: {blog.author}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{blog.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Heart className="w-4 h-4 mr-1 text-red-500" />
                          {blog.likes}
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1 text-blue-500" />
                          {blog.comments}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-pink-600 hover:text-pink-700">
                        続きを読む →
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center space-x-2">
            <Button variant="outline" disabled>
              前へ
            </Button>
            <Button variant="outline" className="bg-pink-600 text-white">
              1
            </Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">次へ</Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-80">
          <div className="sticky top-4 space-y-6">
            <AffiliateBanner size="small" position="sidebar" />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">人気の投稿</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {blogs
                  .slice(0, 5)
                  .sort((a, b) => b.likes - a.likes)
                  .map((blog) => (
                    <div key={blog.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                      <Link href={`/blogs/${blog.id}`} className="block hover:text-pink-600 transition-colors">
                        <h4 className="font-medium text-sm mb-1">{blog.title}</h4>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{blog.author}</span>
                          <span className="flex items-center">
                            <Heart className="w-3 h-3 mr-1 text-red-500" />
                            {blog.likes}
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">カテゴリー</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {["初心者向け", "上級者向け", "おすすめ", "レビュー"].map((category) => (
                    <Button key={category} variant="ghost" className="w-full justify-start text-sm">
                      {category}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
