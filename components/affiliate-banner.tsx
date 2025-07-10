"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

interface AffiliateBannerProps {
  size: "large" | "medium" | "small"
  position: "header" | "sidebar" | "footer" | "content"
  src: string
  alt: string
  link?: string
}

export default function AffiliateBanner({ size, position, src, alt, link }: AffiliateBannerProps) {
  const [isLoading, setIsLoading] = useState(true)

  const bannerConfig = {
    large: { width: 800, height: 250 },
    medium: { width: 580, height: 75 },
    small: { width: 400, height: 400 },
  }

  const config = bannerConfig[size]

  return (
    <div className={`flex justify-center my-4 ${position === "sidebar" ? "sticky top-4" : ""}`}>
      <div className="bg-gray-100 border border-gray-200 rounded-lg">
        <div
          className="bg-pink-100 border-2 border-dashed border-pink-300 rounded flex items-center justify-center text-pink-600 relative"
          style={{ width: config.width, height: config.height }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-pink-50 rounded">
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                {/* <p className="text-sm text-pink-600 font-medium">Loading...</p> */}
              </div>
            </div>
          )}
          {
            link ? (
              <a href={link} target="_blank" rel="noopener noreferrer">
                <Image
                  src={src}
                  alt={alt}
                  width={config.width}
                  height={config.height}
                  className={`w-full h-full object-cover hover:opacity-80 transition-opacity duration-300 scale-105 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={() => setIsLoading(false)}
                  onError={() => setIsLoading(false)}
                />
              </a>
            ) : (
              <Image
                src={src}
                alt={alt}
                width={config.width}
                height={config.height}
                className={`w-full h-full object-cover hover:opacity-80 transition-opacity duration-300 scale-105 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
              />
            )}
        </div>
      </div>
    </div>
  )
}
