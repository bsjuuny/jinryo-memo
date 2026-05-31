import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/jinryo-memo',
  assetPrefix: '/jinryo-memo',
};

export default nextConfig;
