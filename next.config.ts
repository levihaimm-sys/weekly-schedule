// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com", "*.loca.lt"],
  typescript: {
    ignoreBuildErrors: true,
  },
  // pdfjs-dist does its own dynamic module loading (worker, canvas) that the server
  // bundler shouldn't try to process — load it as a plain runtime dependency instead.
  // Only the isolated /api/lesson-plans/extract-equipment route imports it.
  serverExternalPackages: ["pdfjs-dist"],
  // Lesson-plan PDF uploads go through a server action (default limit is 1MB).
  // Vercel caps request bodies at ~4.5MB, so stay just under that.
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
