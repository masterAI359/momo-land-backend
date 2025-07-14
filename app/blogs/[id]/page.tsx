import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageSquare, Clock, User } from "lucide-react"
import AffiliateBanner from "@/components/affiliate-banner"

export const metadata = {
  title: "ブログ詳細 - momoLand",
  description: "ライブチャット体験記の詳細ページ",
}

export default function BlogDetailPage({ params }: { params: { id: string } }) {
  const blogId = params.id

  // サンプルデータ
  const blog = {
    id: blogId,
    title: `ライブチャット体験記 ${blogId}`,
    author: `ユーザー${blogId}`,
    content: `
      こんにちは、${`ユーザー${blogId}`}です。今回は私のライブチャット体験について詳しくお話ししたいと思います。

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

      皆さんも良いライブチャット体験ができることを願っています！
    `,
    likes: 25,
    comments: 8,
    createdAt: "3時間前",
    category: "おすすめ",
  }

  const comments = [
    {
      id: 1,
      author: "コメントユーザー1",
      content: "とても参考になる体験記でした！私も同じサイトを利用してみたいと思います。",
      createdAt: "2時間前",
    },
    {
      id: 2,
      author: "コメントユーザー2",
      content: "詳しいレビューありがとうございます。料金体系について教えていただけませんか？",
      createdAt: "1時間前",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Blog Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm bg-pink-100 text-pink-800 px-3 py-1 rounded-full">{blog.category}</span>
              <span className="text-sm text-gray-500 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {blog.createdAt}
              </span>
            </div>
            <CardTitle className="text-2xl md:text-3xl">{blog.title}</CardTitle>
            <CardDescription className="flex items-center space-x-4">
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                投稿者: {blog.author}
              </span>
              <span className="flex items-center">
                <Heart className="w-4 h-4 mr-1 text-red-500" />
                {blog.likes} いいね
              </span>
              <span className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-1 text-blue-500" />
                {blog.comments} コメント
              </span>
            </CardDescription>
          </CardHeader>
        </Card>

        <AffiliateBanner size="large" position="content" />

        {/* Blog Content */}
        <Card>
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              {blog.content.split("\n").map((paragraph, index) => {
                if (paragraph.startsWith("## ")) {
                  return (
                    <h2 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-900">
                      {paragraph.replace("## ", "")}
                    </h2>
                  )
                } else if (paragraph.startsWith("1. ") || paragraph.startsWith("2. ") || paragraph.startsWith("3. ")) {
                  return (
                    <div key={index} className="mb-2">
                      <p className="text-gray-700">{paragraph}</p>
                    </div>
                  )
                } else if (paragraph.trim()) {
                  return (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  )
                }
                return null
              })}
            </div>
          </CardContent>
        </Card>

        {/* Like Button */}
        <div className="text-center">
          <Button size="lg" className="bg-pink-600 hover:bg-pink-700">
            <Heart className="w-5 h-5 mr-2" />
            いいね ({blog.likes})
          </Button>
        </div>

        <AffiliateBanner size="medium" position="content" />

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              コメント ({blog.comments})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Existing Comments */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-pink-200 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{comment.author}</span>
                    <span className="text-sm text-gray-500">{comment.createdAt}</span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>

            {/* Comment Form */}
            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">コメントを投稿</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="comment-author" className="block text-sm font-medium text-gray-700 mb-2">
                    ニックネーム
                  </label>
                  <Input id="comment-author" placeholder="あなたのニックネーム" className="w-full" />
                </div>
                <div>
                  <label htmlFor="comment-content" className="block text-sm font-medium text-gray-700 mb-2">
                    コメント
                  </label>
                  <Textarea
                    id="comment-content"
                    placeholder="コメントを入力してください..."
                    rows={4}
                    className="w-full"
                  />
                </div>
                <Button className="bg-pink-600 hover:bg-pink-700">コメントを投稿</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
