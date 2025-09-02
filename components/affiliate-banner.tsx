"use client"

interface AffiliateBannerProps {
  size: "large" | "medium" | "small"
  position: "header" | "sidebar" | "footer" | "content"
}

export default function AffiliateBanner({ size, position }: AffiliateBannerProps) {
  const bannerConfig = {
    large: { width: 728, height: 90 },
    medium: { width: 320, height: 100 },
    small: { width: 250, height: 250 },
  }

  const config = bannerConfig[size]
  return (
    <div className={`flex justify-center my-4 ${position === "sidebar" ? "sticky top-4" : ""}`}>
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
        <div
          className="bg-pink-100 border-2 border-dashed border-pink-300 rounded flex items-center justify-center text-pink-600"
          style={{ width: config.width, height: config.height }}
        >
          <div className="text-center">
            <p className="text-sm font-medium">アフィリエイト広告</p>
            <p className="text-xs mt-1">
              {config.width} x {config.height}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
