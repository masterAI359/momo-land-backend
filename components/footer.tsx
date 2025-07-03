export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                m
              </div>
              <span className="text-lg font-bold">momoLand</span>
            </div>
            <p className="text-gray-300 text-sm">
              ライブチャット体験記を共有し、ユーザー同士の交流を促進するコミュニティサイト
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">サイトマップ</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  ホーム
                </a>
              </li>
              <li>
                <a href="/blogs" className="hover:text-white transition-colors">
                  ブログ一覧
                </a>
              </li>
              <li>
                <a href="/timeline" className="hover:text-white transition-colors">
                  タイムライン
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">お問い合わせ</h3>
            <p className="text-gray-300 text-sm">
              サイトに関するお問い合わせやトラブル報告は、 トラブル報告ボタンからお知らせください。
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 momoLand. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
