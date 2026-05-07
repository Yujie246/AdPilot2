/** @type {import('next').NextConfig} */
const internalApiBaseUrl = process.env.INTERNAL_API_BASE_URL?.replace(/\/$/, "");

const nextConfig = {
  output: "standalone",
  async rewrites() {
    if (!internalApiBaseUrl) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${internalApiBaseUrl}/api/:path*`
      },
      {
        source: "/health",
        destination: `${internalApiBaseUrl}/health`
      }
    ];
  }
};

export default nextConfig;
