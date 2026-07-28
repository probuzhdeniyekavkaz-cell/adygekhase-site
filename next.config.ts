import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a self-contained Node.js bundle for the REG.RU VPS migration.
  // Vinext ignores this setting for the existing OpenAI Sites deployment.
  output: "standalone",
};

export default nextConfig;
