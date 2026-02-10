import { http } from "../../setup/axios.config";

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role?: string;
    extraRoles?: string[];
    userType?: "user" | "client";
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface RegisterClientPayload {
  name: string;
  email: string;
  password: string;
  description?: string;
}

export class AuthService {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await http.post<AuthResponse>("/auth/register/user", payload);
    return response.data;
  }

  async registerClient(payload: RegisterClientPayload): Promise<AuthResponse> {
    // Si el baseURL no está configurado, axios intentará pegarle al frontend (Next)
    // y "no llega nada" al backend.
    if (!http.defaults.baseURL) {
      throw new Error(
        "API Base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL_DEV (and restart Next dev server).",
      );
    }

    const response = await http.post<AuthResponse>("/auth/register/client", payload, {
      headers: {
        // El API Gateway lo usa en Postman para bypass de auth en entornos con guards/interceptors
        "X-No-Auth": "1",
      },
    });
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await http.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await http.post<{ accessToken: string }>("/auth/refresh-token", {
      refreshToken,
    });
    return response.data;
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await http.post("/auth/logout", { refreshToken });
    }
  }

  async getSession() {
    const response = await http.get("/auth/validate");
    return response.data;
  }
}

export const authService = new AuthService();
