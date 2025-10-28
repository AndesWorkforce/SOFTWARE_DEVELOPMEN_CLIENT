import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

function getBaseURL() {
  // Public base URL for browser requests
  return process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
}

export function createHttp(config?: AxiosRequestConfig): AxiosInstance {
  const env = process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || "development";

  // In development, avoid sending cookies/credentials to prevent CORS issues.
  // Enable credentials for staging/production where the domains are configured.
  const isCredentialsEnv = env === "staging" || env === "production";

  const instance = axios.create({
    baseURL: getBaseURL(),
    withCredentials: isCredentialsEnv,
    ...config,
  });

  instance.interceptors.request.use((req: InternalAxiosRequestConfig) => {
    if (authToken) {
      req.headers = req.headers || {};
      req.headers["Authorization"] = `Bearer ${authToken}`;
    }
    return req;
  });

  return instance;
}

export const http = createHttp();
