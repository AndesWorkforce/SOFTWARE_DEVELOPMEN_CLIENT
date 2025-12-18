import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Point next-intl to the centralized request config
const withNextIntl = createNextIntlPlugin("./i18n.ts");

// Determine API URL based on environment
// This function mirrors the logic in packages/setup/env.config.ts
// Note: We can't import from that file here because next.config.ts runs at build time
function getApiUrl() {
  const env = process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || "development";

  // If NEXT_PUBLIC_ENV=production → use NEXT_PUBLIC_API_BASE_URL_PROD
  if (env === "production") {
    return process.env.NEXT_PUBLIC_API_BASE_URL_PROD || "";
  }

  // If NEXT_PUBLIC_ENV=staging → use NEXT_PUBLIC_API_BASE_URL_STAGING
  if (env === "staging") {
    return process.env.NEXT_PUBLIC_API_BASE_URL_STAGING || "";
  }

  // If NEXT_PUBLIC_ENV=development (default) → use NEXT_PUBLIC_API_BASE_URL_DEV
  return process.env.NEXT_PUBLIC_API_BASE_URL_DEV || "";
}

const nextConfig: NextConfig = {
  /* Additional Next.js config options */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${getApiUrl()}/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
