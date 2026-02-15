import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure native modules or packages causing issues are treated as external
  serverExternalPackages: ['bcryptjs', '@prisma/client'],
};

export default nextConfig;
