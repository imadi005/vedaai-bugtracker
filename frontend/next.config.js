/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-bucket.s3.amazonaws.com', 'ui-avatars.com'],
  },
};

module.exports = nextConfig;
