/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true
  },
  images: {
    domains: ["images.unsplash.com", "via.placeholder.com"]
  }
};

module.exports = nextConfig;
