import { http } from "../../setup/axios.config";
import type { AxiosError } from "axios";

export interface Team {
  id: string;
  name: string;
  client_id: string;
  created_at?: string;
  updated_at?: string;
}

export class TeamsService {
  /**
   * Obtiene todos los equipos
   * @returns Array de equipos
   */
  async getAll(): Promise<Team[]> {
    try {
      const response = await http.get<Team[]>("/teams");
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en getAll teams:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }

  /**
   * Obtiene un equipo por ID
   * @param id ID del equipo
   * @returns Equipo
   */
  async getById(id: string): Promise<Team> {
    try {
      const response = await http.get<Team>(`/teams/${id}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en getById team:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }

  /**
   * Crea un equipo
   * @param payload Datos del equipo
   */
  async create(payload: { name: string; client_id: string; description?: string }): Promise<Team> {
    try {
      const response = await http.post<Team>("/teams", payload);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en create team:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });
      throw error;
    }
  }
}

export const teamsService = new TeamsService();
