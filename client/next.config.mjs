const API_ORIGIN = process.env.API_ORIGIN || "http://localhost:5000";
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: "/xpo-api/:path*", destination: `${API_ORIGIN}/api/:path*` }];
  },
};
export default nextConfig;
