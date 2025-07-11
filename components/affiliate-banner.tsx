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
    small: { width: 300, height: 300 },
  }

  const config = bannerConfig[size]

  // Mobile responsive classes based on banner size
  const getResponsiveClasses = () => {
    switch (size) {
      case 'large':
        return 'w-full max-w-[320px] sm:max-w-[580px] md:max-w-[800px] h-auto'
      case 'medium':
        return 'w-full max-w-[280px] sm:max-w-[580px] h-auto'
      case 'small':
        return 'w-full max-w-[250px] sm:max-w-[300px] h-auto'
      default:
        return 'w-full h-auto'
    }
  }

  return (
    <div className={`flex justify-center my-3 sm:my-4 px-4 ${position === "sidebar" ? "sticky top-4" : ""}`}>
      <div className="bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
        <div
          className={`bg-pink-100 border-1 border-dashed border-pink-200 rounded flex items-center justify-center text-pink-600 relative ${getResponsiveClasses()}`}
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
                  className={`w-full h-auto object-contain hover:opacity-80 hover:rotate-1 hover:scale-105 transition-all duration-300 rounded-lg ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={() => setIsLoading(false)}
                  onError={() => setIsLoading(false)}
                  // style={{ aspectRatio: `${config.width}/${config.height}` }}
                />
              </a>
            ) : (
              <Image
                src={src}
                alt={alt}
                width={config.width}
                height={config.height}
                className={`w-full h-auto object-contain hover:opacity-80 hover:rotate-1 hover:scale-105 transition-all duration-300 rounded-lg ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
                // style={{ aspectRatio: `${config.width}/${config.height}` }}
              />
            )}
        </div>
      </div>
    </div>
  )
}
