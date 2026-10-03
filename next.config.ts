// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com", "*.loca.lt"],
  typescript: {
    ignoreBuildErrors: true,
  },
  // pdfjs-dist does its own dynamic module loading (worker, canvas) that the server
  // bundler shouldn't try to process — load it as a plain runtime dependency instead.
  serverExternalPackages: ["pdfjs-dist"],
};

export default nextConfig;
