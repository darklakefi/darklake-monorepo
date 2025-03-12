import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/mev",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
