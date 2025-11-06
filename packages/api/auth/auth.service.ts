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
    role: string;
  };
}

export class AuthService {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await http.post<AuthResponse>("/auth/register/user", payload);
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await http.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return response.data;
  }

  async logout() {
    await http.post("/auth/logout");
  }

  async getSession() {
    const response = await http.get("/auth/validate");
    return response.data;
  }
}

export const authService = new AuthService();
