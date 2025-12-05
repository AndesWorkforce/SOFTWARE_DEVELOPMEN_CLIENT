import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Point next-intl to the centralized request config
const withNextIntl = createNextIntlPlugin("./i18n.ts");

// Determine API URL based on environment
function getApiUrl() {
  const env = process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || "development";

  if (env === "production") {
    return process.env.NEXT_PUBLIC_API_BASE_URL_PROD || "";
  }

  if (env === "staging") {
    return process.env.NEXT_PUBLIC_API_BASE_URL_STAGING || "";
  }

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
