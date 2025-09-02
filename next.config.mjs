/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
<<<<<<< HEAD
=======
  experimental: {
    turbo: {
      resolveAlias: {
        "zod": "zod/lib"
      }
    }
  },
  webpack: (config) => {
    // Handle potential module resolution issues
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return config
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Referrer-Policy",
          value: "no-referrer",
        },
      ],
    },
  ],
>>>>>>> 79949e6e27ce139f4c3c834292cbe48e4ece80c4
}

export default nextConfig
