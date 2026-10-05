/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/assets/**' },
      { protocol: 'https', hostname: '**', pathname: '/assets/**' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'placehold.co' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/collections/mechanical-gloves',
        destination: '/collections/mechanic-gloves',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
