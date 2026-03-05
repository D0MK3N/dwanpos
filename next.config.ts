/** @type {import('next').NextConfig} */
const nextConfig = {
    skipTrailingSlashRedirect: true,
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8080/api/:path*',
        },
        {
          source: '/auth/:path*',
          destination: 'http://localhost:8080/auth/:path*',
        },
      ];
    },
  // Hapus experimental.appDir karena sudah tidak diperlukan
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  allowedDevOrigins: [
    "https://unhanged-tabatha-drumliest.ngrok-free.dev"
  ],
}

module.exports = nextConfig