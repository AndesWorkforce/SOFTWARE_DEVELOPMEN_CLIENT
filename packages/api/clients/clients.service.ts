import { http } from "../../setup/axios.config";
import type { AxiosError } from "axios";

export interface Client {
  id: string;
  name: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export class ClientsService {
  /**
   * Obtiene todos los clientes
   * @returns Array de clientes
   */
  async getAll(): Promise<Client[]> {
    try {
      const response = await http.get<Client[]>("/clients");
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en getAll clients:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }

  /**
   * Obtiene un cliente por ID
   * @param id ID del cliente
   * @returns Cliente
   */
  async getById(id: string): Promise<Client> {
    try {
      const response = await http.get<Client>(`/clients/${id}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en getById client:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }
}

export const clientsService = new ClientsService();
