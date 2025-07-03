import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Clock, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import AffiliateBanner from "@/components/affiliate-banner"
import FeatureCard from "@/components/feature-card"

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-50 to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">ライブチャット体験記を共有しよう</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              あなたのライブチャット体験を投稿して、他のユーザーと情報を共有しませんか？
              リアルな口コミと体験談で、より良いライブチャットライフを。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <Link href="/blogs" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-pink-600 hover:bg-pink-700">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  ブログを見る
                </Button>
              </Link>
              <Link href="/timeline" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full bg-transparent">
                  <Clock className="w-5 h-5 mr-2" />
                  タイムライン
                </Button>
              </Link>
              <Link href="/chat" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full bg-transparent border-pink-200 text-pink-600 hover:bg-pink-50"
                >
                  <Users className="w-5 h-5 mr-2" />
                  グループチャット
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <AffiliateBanner size="large" position="header" />

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FeatureCard
            icon={<MessageSquare className="w-6 h-6 text-pink-600" />}
            title="体験記投稿"
            description="あなたのライブチャット体験を詳しく投稿して、他のユーザーと共有できます。"
            href="/post"
            requiresAuth={true}
          />

          <FeatureCard
            icon={<Users className="w-6 h-6 text-pink-600" />}
            title="コミュニティ"
            description="いいねやコメント機能で、ユーザー同士の交流を深めることができます。"
            href="/blogs"
            requiresAuth={false}
          />

          <FeatureCard
            icon={<TrendingUp className="w-6 h-6 text-pink-600" />}
            title="人気ランキング"
            description="いいね数に基づいた人気の体験記ランキングをチェックできます。"
            href="/ranking"
            requiresAuth={false}
          />

          <FeatureCard
            icon={<Users className="w-6 h-6 text-pink-600" />}
            title="グループチャット"
            description="リアルタイムでユーザー同士が交流できるロマンチックなチャットルーム機能です。"
            href="/chat"
            requiresAuth={true}
          />
        </div>
      </section>

      {/* User Registration Section */}
      <section className="bg-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">投稿を始める</CardTitle>
              <CardDescription className="text-center">
                ニックネームと連絡用メールアドレスを入力して、投稿を開始しましょう。
                ※メールアドレスはトラブル報告時の連絡用です。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
                  ニックネーム
                </label>
                <Input id="nickname" placeholder="あなたのニックネームを入力" className="w-full" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  連絡用メールアドレス
                </label>
                <Input id="email" type="email" placeholder="example@email.com" className="w-full" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <FeatureCard
                  icon={<MessageSquare className="w-4 h-4 mr-2" />}
                  title="ブログを投稿"
                  href="/post"
                  requiresAuth={true}
                  isButton={true}
                  buttonClass="flex-1 bg-pink-600 hover:bg-pink-700"
                />
                <Link href="/timeline" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Clock className="w-4 h-4 mr-2" />
                    タイムラインを見る
                  </Button>
                </Link>
                <FeatureCard
                  icon={<Users className="w-4 h-4 mr-2" />}
                  title="チャットに参加"
                  href="/chat"
                  requiresAuth={true}
                  isButton={true}
                  buttonClass="flex-1 bg-transparent border-pink-200 text-pink-600 hover:bg-pink-50"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <AffiliateBanner size="medium" position="content" />

      {/* Recent Posts Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">最新の投稿</h2>
          <p className="text-gray-600">最近投稿された体験記をチェックしてみましょう</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">サンプル体験記 {i}</CardTitle>
                <CardDescription>投稿者: ユーザー{i} • 2時間前</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  ライブチャットでの体験について詳しく書かれた投稿です。 実際の体験談や感想が含まれています...
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>❤️ {i * 5} いいね</span>
                  <span>💬 {i * 2} コメント</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/blogs">
            <Button variant="outline" size="lg">
              すべての投稿を見る
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
