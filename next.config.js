/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  serverExternalPackages: ['@prisma/client'],
}

module.exports = nextConfig
