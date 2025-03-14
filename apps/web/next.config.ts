import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/mev",
        has: [
          {
            type: "query",
            key: "share",
            value: "(?!.*)", // ?share is empty
          },
        ],
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
