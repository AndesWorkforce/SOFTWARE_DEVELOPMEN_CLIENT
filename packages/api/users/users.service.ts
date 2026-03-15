import { http } from "../../setup/axios.config";
import type { AxiosError } from "axios";

// Interfaz del usuario como la recibe el frontend
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "Superadmin" | "TeamAdmin" | "Visualizer";
  created_at?: string;
  updated_at?: string;
}

// Interfaz del usuario como lo envía el backend
interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: "Superadmin" | "TeamAdmin" | "Visualizer";
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  password?: string;
}

/**
 * Divide un nombre completo en firstName y lastName
 */
function splitName(fullName: string | undefined | null): { firstName: string; lastName: string } {
  if (!fullName) {
    return { firstName: "", lastName: "" };
  }

  const trimmed = fullName.trim();
  const spaceIndex = trimmed.indexOf(" ");

  if (spaceIndex === -1) {
    // Si no hay espacio, todo es firstName
    return { firstName: trimmed, lastName: "" };
  }

  return {
    firstName: trimmed.substring(0, spaceIndex),
    lastName: trimmed.substring(spaceIndex + 1).trim(),
  };
}

/**
 * Transforma un usuario del backend al formato del frontend
 */
function transformBackendUser(backendUser: BackendUser): User {
  const { firstName, lastName } = splitName(backendUser.name);

  return {
    id: backendUser.id,
    firstName,
    lastName,
    email: backendUser.email,
    role: backendUser.role,
    created_at: backendUser.created_at,
    updated_at: backendUser.updated_at,
  };
}

/**
 * Transforma un payload del frontend al formato del backend
 */
function transformToBackendPayload(
  payload: CreateUserPayload | UpdateUserPayload,
): Record<string, unknown> {
  const backendPayload: Record<string, unknown> = {};

  if ("firstName" in payload && payload.firstName !== undefined) {
    const lastName = "lastName" in payload && payload.lastName ? payload.lastName : "";
    backendPayload.name = `${payload.firstName} ${lastName}`.trim();
  }

  if ("email" in payload) {
    backendPayload.email = payload.email;
  }

  if ("role" in payload) {
    backendPayload.role = payload.role;
  }

  if ("password" in payload) {
    backendPayload.password = payload.password;
  }

  return backendPayload;
}

export class UsersService {
  /**
   * Obtiene todos los usuarios
   * @returns Array de usuarios
   */
  async getAll(): Promise<User[]> {
    try {
      const response = await http.get<BackendUser[]>("/users");
      return response.data.map(transformBackendUser);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en getAll users:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }

  /**
   * Obtiene un usuario por ID
   * @param id ID del usuario
   * @returns Usuario
   */
  async getById(id: string): Promise<User> {
    try {
      const response = await http.get<BackendUser>(`/users/${id}`);
      return transformBackendUser(response.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en getById user:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }

  /**
   * Crea un nuevo usuario
   * @param payload Datos del nuevo usuario
   * @returns Usuario creado
   */
  async create(payload: CreateUserPayload): Promise<User> {
    try {
      const backendPayload = transformToBackendPayload(payload);
      const response = await http.post<BackendUser>("/auth/register/user", backendPayload);
      return transformBackendUser(response.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en create user:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });
      throw error;
    }
  }

  /**
   * Actualiza un usuario por ID
   */
  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    try {
      const backendPayload = transformToBackendPayload(payload);
      const response = await http.patch<BackendUser>(`/users/${id}`, backendPayload);
      return transformBackendUser(response.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en update user:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });
      throw error;
    }
  }

  /**
   * Elimina un usuario por ID
   */
  async remove(id: string): Promise<void> {
    try {
      await http.delete(`/users/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en remove user:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });
      throw error;
    }
  }

  /**
   * Obtiene las estadísticas generales (clientes, contratistas, equipos)
   * @returns Estadísticas
   */
  async getStats(): Promise<{
    totalClients: number;
    totalContractors: number;
    totalTeams: number;
  }> {
    try {
      const response = await http.get<{
        totalClients: number;
        totalContractors: number;
        totalTeams: number;
      }>("/users/stats");
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en getStats:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });
      throw error;
    }
  }
}

export const usersService = new UsersService();
