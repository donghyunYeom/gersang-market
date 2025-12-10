/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        pathname: '/gh/gh777kkk/gersanginfo-img@main/**',
      },
    ],
  },
}

module.exports = nextConfig
