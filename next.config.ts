import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com", "*.loca.lt"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withPWA(nextConfig);
