import { http } from "../../setup/axios.config";
import type { AxiosError } from "axios";
import type {
  Contractor,
  ContractorFilters,
  ContractorWithDayOffs,
  ContractorDayOff,
  CreateContractorDayOffDto,
  UpdateContractorDayOffDto,
  ContractorByActivationKey,
} from "../../types/contractors.types";

// Re-export types for convenience
export type {
  Contractor,
  ContractorFilters,
  ContractorWithDayOffs,
  ContractorDayOff,
  CreateContractorDayOffDto,
  UpdateContractorDayOffDto,
  ContractorByActivationKey,
} from "../../types/contractors.types";

export class ContractorsService {
  /**
   * Obtiene todos los contractors con filtros opcionales
   * @param filters Filtros opcionales para filtrar los contractors
   * @returns Array de contractors
   */
  async getAll(filters?: ContractorFilters): Promise<Contractor[]> {
    const params: Record<string, string> = {};

    if (filters?.name && filters.name.trim() !== "") {
      params.name = filters.name.trim();
    }

    if (filters?.country && filters.country.trim() !== "") {
      params.country = filters.country.trim();
    }

    if (filters?.client_id && filters.client_id.trim() !== "") {
      params.client_id = filters.client_id.trim();
    }

    if (filters?.team_id && filters.team_id.trim() !== "") {
      params.team_id = filters.team_id.trim();
    }

    if (filters?.job_position && filters.job_position.trim() !== "") {
      params.job_position = filters.job_position.trim();
    }

    if (filters?.isActive !== undefined) {
      params.isActive = filters.isActive.toString();
    }

    try {
      const response = await http.get<Contractor[]>("/contractors", {
        params,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorDetails = {
        message: axiosError?.message || "Unknown error",
        response: {
          data: axiosError?.response?.data || null,
          status: axiosError?.response?.status || null,
          statusText: axiosError?.response?.statusText || null,
          headers: axiosError?.response?.headers || null,
        },
        config: {
          url: axiosError?.config?.url || null,
          baseURL: axiosError?.config?.baseURL || null,
          method: axiosError?.config?.method || null,
          params: axiosError?.config?.params || null,
          headers: axiosError?.config?.headers || null,
        },
        request: axiosError?.request ? "Request made but no response" : null,
      };

      console.error("❌ Error en getAll contractors:", JSON.stringify(errorDetails, null, 2));
      console.error("❌ Error completo:", error);

      throw error;
    }
  }

  /**
   * Obtiene un contractor por ID
   * @param id ID del contractor
   * @returns Contractor
   */
  async getById(id: string): Promise<Contractor> {
    try {
      const response = await http.get<Contractor>(`/contractors/${id}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en getById contractor:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }

  /**
   * Crea un nuevo contractor
   * @param contractorData Datos del contractor a crear
   * @returns Contractor creado
   */
  async create(contractorData: Partial<Contractor>): Promise<Contractor> {
    try {
      const response = await http.post<Contractor>("/contractors", contractorData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en create contractor:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }

  /**
   * Actualiza un contractor
   * @param id ID del contractor
   * @param contractorData Datos a actualizar
   * @returns Contractor actualizado
   */
  async update(id: string, contractorData: Partial<Contractor>): Promise<Contractor> {
    try {
      const response = await http.patch<Contractor>(`/contractors/${id}`, contractorData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en update contractor:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }

  /**
   * Elimina un contractor
   * @param id ID del contractor
   */
  async delete(id: string): Promise<void> {
    try {
      await http.delete(`/contractors/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en delete contractor:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }

  /**
   * Obtiene un contractor con sus días libres
   * @param id ID del contractor
   * @returns Contractor con días libres
   */
  async getWithDayOffs(id: string): Promise<ContractorWithDayOffs> {
    try {
      const response = await http.get<ContractorWithDayOffs>(`/contractors/${id}/with-day-offs`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en getWithDayOffs contractor:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }

  /**
   * Obtiene contractors por ID de cliente
   * @param clientId ID del cliente
   * @returns Array de contractors
   */
  async getByClientId(clientId: string): Promise<Contractor[]> {
    try {
      const response = await http.get<Contractor[]>(`/contractors/client/${clientId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en getByClientId contractors:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }

  async getByClientIdWithDayOffToday(clientId: string): Promise<Contractor[]> {
    try {
      const response = await http.get<Contractor[]>(
        `/contractors/client/${clientId}/day-offs-today`,
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en getByClientIdWithDayOffToday contractors:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }

  async getByClientIdWithoutDayOffToday(clientId: string): Promise<Contractor[]> {
    try {
      const response = await http.get<Contractor[]>(
        `/contractors/client/${clientId}/without-day-offs-today`,
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en getByClientIdWithoutDayOffToday contractors:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }

  /**
   * Obtiene contractors por ID de equipo
   * @param teamId ID del equipo
   * @returns Array de contractors
   */
  async getByTeamId(teamId: string): Promise<Contractor[]> {
    try {
      const response = await http.get<Contractor[]>(`/contractors/team/${teamId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en getByTeamId contractors:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }

  async getTeamDayOffStatsOnDate(
    teamId: string,
    date: string,
  ): Promise<{ teamId: string; date: string; activeCount: number; absentCount: number }> {
    try {
      const response = await http.get<{
        teamId: string;
        date: string;
        activeCount: number;
        absentCount: number;
      }>(`/contractors/team/${teamId}/day-off-stats`, {
        params: { date },
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en getTeamDayOffStatsOnDate contractors:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }

  async getClientTeamsDayOffStatsInRange(
    clientId: string,
    startDate: string,
    endDate: string,
  ): Promise<Array<{ teamId: string; date: string; activeCount: number; absentCount: number }>> {
    try {
      const response = await http.get<
        Array<{ teamId: string; date: string; activeCount: number; absentCount: number }>
      >(`/contractors/client/${clientId}/teams-day-off-stats`, {
        params: { start: startDate, end: endDate },
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en getClientTeamsDayOffStatsInRange contractors:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }

  /**
   * Obtiene un contractor por clave de activación
   * @param activationKey Clave de activación
   * @returns Contractor con aplicaciones
   */
  async getByActivationKey(activationKey: string): Promise<ContractorByActivationKey> {
    try {
      const response = await http.get<ContractorByActivationKey>(
        `/contractors/by-activation-key/${activationKey}`,
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en getByActivationKey contractor:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }

  /**
   * Obtiene la clave de activación completa de un contractor
   * @param id ID del contractor
   * @returns Clave de activación completa
   */
  async getFullActivationKey(id: string): Promise<string> {
    try {
      const response = await http.get<{ activation_key: string }>(
        `/contractors/${id}/activation-key`,
      );
      return response.data.activation_key;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error("❌ Error en getFullActivationKey:", {
        message: axiosError?.message || "Unknown error",
        responseData: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });
      throw error;
    }
  }

  // ==================== Contractor Day Offs ====================

  /**
   * Obtiene los días libres de un contractor
   * @param contractorId ID del contractor
   * @returns Array de días libres
   */
  async getDayOffs(contractorId: string): Promise<ContractorDayOff[]> {
    try {
      const response = await http.get<ContractorDayOff[]>(`/contractors/${contractorId}/day-offs`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en getDayOffs:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }

  /**
   * Obtiene un día libre por ID
   * @param dayOffId ID del día libre
   * @returns Día libre
   */
  async getDayOffById(dayOffId: string): Promise<ContractorDayOff> {
    try {
      const response = await http.get<ContractorDayOff>(`/contractors/day-offs/${dayOffId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en getDayOffById:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }

  /**
   * Crea un día libre para un contractor
   * @param contractorId ID del contractor
   * @param dayOffData Datos del día libre
   * @returns Día libre creado
   */
  async createDayOff(
    contractorId: string,
    dayOffData: Omit<CreateContractorDayOffDto, "contractor_id">,
  ): Promise<ContractorDayOff> {
    try {
      const response = await http.post<ContractorDayOff>(`/contractors/${contractorId}/day-offs`, {
        ...dayOffData,
        contractor_id: contractorId,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en createDayOff:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }

  /**
   * Actualiza un día libre
   * @param dayOffId ID del día libre
   * @param dayOffData Datos a actualizar
   * @returns Día libre actualizado
   */
  async updateDayOff(
    dayOffId: string,
    dayOffData: UpdateContractorDayOffDto,
  ): Promise<ContractorDayOff> {
    try {
      const response = await http.patch<ContractorDayOff>(
        `/contractors/day-offs/${dayOffId}`,
        dayOffData,
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en updateDayOff:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }

  /**
   * Elimina un día libre
   * @param dayOffId ID del día libre
   */
  async deleteDayOff(dayOffId: string): Promise<void> {
    try {
      await http.delete(`/contractors/day-offs/${dayOffId}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en deleteDayOff:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });

      throw error;
    }
  }
}

export const contractorsService = new ContractorsService();
