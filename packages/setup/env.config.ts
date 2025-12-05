/**
 * Get the API base URL based on the current environment
 * @returns The appropriate API base URL for the environment
 */
export function getApiBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || "development";

  // In production, use the production API URL
  if (env === "production") {
    return process.env.NEXT_PUBLIC_API_BASE_URL_PROD || "";
  }

  // In staging, use the staging API URL
  if (env === "staging") {
    return process.env.NEXT_PUBLIC_API_BASE_URL_STAGING || "";
  }

  // In development, use localhost
  return process.env.NEXT_PUBLIC_API_BASE_URL_DEV || "";
}

/**
 * Check if the current environment is development
 */
export function isDevelopment(): boolean {
  const env = process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || "development";
  return env === "development";
}

/**
 * Check if the current environment is production
 */
export function isProduction(): boolean {
  const env = process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || "development";
  return env === "production";
}

/**
 * Check if the current environment is staging
 */
export function isStaging(): boolean {
  const env = process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || "development";
  return env === "staging";
}
