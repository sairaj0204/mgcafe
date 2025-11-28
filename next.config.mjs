/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
         protocol: 'https',
         hostname: 'placehold.co', // Added this just in case you use placeholders
         pathname: '**',
      }
    ],
  },
};

export default nextConfig;