import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Enable standalone output for smaller Docker images
  output: 'standalone',
};

export default nextConfig;
