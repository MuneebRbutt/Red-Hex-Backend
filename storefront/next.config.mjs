/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@apollo/client'],
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/assets/**' },
      { protocol: 'https', hostname: '**', pathname: '/assets/**' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'placehold.co' },
    ],
  },
};

export default nextConfig;
