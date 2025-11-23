import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },
  async rewrites() {
    return [
      // {
      //   source: '/api/socket.io',
      //   destination: `${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'}/socket.io/`,
      // },
      {
        source: '/:path*',
        destination: 'https://social-media-backend-yupk.onrender.com/:path*', //`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
