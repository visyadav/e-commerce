import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/orders",
        destination: "/admin/orders",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
