import { http } from "../../setup/axios.config";
import type { AxiosError } from "axios";

export interface Client {
  id: string;
  name: string;
  email?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateClientPayload {
  name?: string;
  email?: string | null;
  description?: string | null;
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

  /**
   * Actualiza un cliente por ID
   */
  async update(id: string, payload: UpdateClientPayload): Promise<Client> {
    try {
      const response = await http.patch<Client>(`/clients/${id}`, payload);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en update client:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });
      throw error;
    }
  }

  /**
   * Elimina un cliente por ID
   */
  async remove(id: string): Promise<void> {
    try {
      await http.delete(`/clients/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en remove client:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });
      throw error;
    }
  }
}

export const clientsService = new ClientsService();
