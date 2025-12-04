import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
  type AxiosError,
  type AxiosResponse,
} from "axios";

let authToken: string | null = null;
let refreshToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: string | null) => void;
  reject: (error?: unknown) => void;
}> = [];

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function setRefreshToken(token: string | null) {
  refreshToken = token;
}

function getBaseURL() {
  // Public base URL for browser requests
  return process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
}

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
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

  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Si es un error 401 y no es una petición de refresh token
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        originalRequest.url !== "/auth/refresh-token" &&
        refreshToken
      ) {
        if (isRefreshing) {
          // Si ya se está refrescando, encolar la petición
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers["Authorization"] = `Bearer ${token}`;
              }
              return instance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Importar dinámicamente para evitar dependencias circulares
          const { authService } = await import("../api/auth/auth.service");
          const response = await authService.refreshToken(refreshToken);
          const newToken = response.accessToken;

          setAuthToken(newToken);

          // Actualizar el store también
          if (typeof window !== "undefined") {
            const { useAuthStore } = await import("../store");
            const store = useAuthStore.getState();
            store.setToken(newToken);
          }

          processQueue(null, newToken);

          if (originalRequest.headers) {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          }

          return instance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          // Si falla el refresh, limpiar tokens y redirigir a login
          setAuthToken(null);
          setRefreshToken(null);

          // Limpiar el store también
          if (typeof window !== "undefined") {
            const { useAuthStore } = await import("../store");
            const store = useAuthStore.getState();
            store.logout();
            window.location.href = "/es/login";
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

export const http = createHttp();
