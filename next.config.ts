import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ['@react-pdf/renderer', 'sharp'],
  experimental: {
    optimizePackageImports: ['lucide-react', '@base-ui/react', 'date-fns', '@radix-ui/react-select', '@radix-ui/react-dialog', '@radix-ui/react-popover'],
  },
};

export default nextConfig;
