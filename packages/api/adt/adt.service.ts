import { http } from "../../setup/axios.config";
import type { AxiosError } from "axios";
import type { RealtimeMetrics } from "../../types/adt.types";

// Re-export types for convenience
export type { RealtimeMetrics, AppUsage, BrowserUsage } from "../../types/adt.types";

export interface RealtimeMetricsFilters {
  workday?: string;
  from?: string;
  to?: string;
  name?: string;
  country?: string;
  client_id?: string;
  team_id?: string;
  job_position?: string;
  useCache?: boolean;
}

export class AdtService {
  /**
   * Obtiene métricas en tiempo real de todos los contratistas que tienen métricas.
   * Solo devuelve contratistas que tienen datos (total_beats > 0).
   *
   * @param filters Filtros opcionales:
   *   - workday: Fecha del día en formato YYYY-MM-DD (por defecto: hoy)
   *   - from/to: Rango de fechas (YYYY-MM-DD) - devuelve métricas agregadas
   *   - name: Nombre del contractor
   *   - country: País
   *   - client_id: ID del cliente
   *   - team_id: ID del equipo
   *   - job_position: Cargo
   *   - useCache: Si usar caché (default: true)
   * @returns Array de métricas de productividad por contractor
   */
  async getAllRealtimeMetrics(filters?: RealtimeMetricsFilters): Promise<RealtimeMetrics[]> {
    const params: Record<string, string> = {};

    // Solo agregar parámetros si tienen valor (no undefined, null, o string vacío)
    if (filters?.workday && filters.workday.trim() !== "") {
      params.workday = filters.workday.trim();
    }

    if (filters?.from && filters.from.trim() !== "") {
      params.from = filters.from.trim();
    }

    if (filters?.to && filters.to.trim() !== "") {
      params.to = filters.to.trim();
    }

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

    // useCache siempre se envía (default: true)
    params.useCache = filters?.useCache === false ? "false" : "true";

    console.log("🌐 Llamando a /adt/realtime-metrics con params:", params);

    try {
      const response = await http.get<RealtimeMetrics[]>("/adt/realtime-metrics", {
        params,
      });

      console.log("📡 Respuesta completa:", {
        status: response.status,
        statusText: response.statusText,
        dataLength: Array.isArray(response.data) ? response.data.length : "no es array",
        data: response.data,
      });

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorDetails = {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
        statusText: axiosError?.response?.statusText || null,
        params: params,
        url: axiosError?.config?.url || null,
      };

      console.error("❌ Error en getAllRealtimeMetrics:", errorDetails);
      console.error("❌ Error completo:", error);

      throw error;
    }
  }

  /**
   * Obtiene métricas en tiempo real de un contratista específico.
   *
   * @param contractorId ID del contratista
   * @param workday Fecha del día en formato YYYY-MM-DD (por defecto: hoy)
   * @param useCache Si usar caché (default: true)
   * @returns Métricas de productividad del contratista
   */
  async getRealtimeMetrics(
    contractorId: string,
    workday?: string,
    useCache: boolean = true,
  ): Promise<RealtimeMetrics> {
    const params: Record<string, string> = {};

    if (workday) {
      params.workday = workday;
    }

    if (!useCache) {
      params.useCache = "false";
    }

    const response = await http.get<RealtimeMetrics>(`/adt/realtime-metrics/${contractorId}`, {
      params,
    });

    return response.data;
  }

  /**
   * Obtiene el porcentaje de talento activo vs inactivo en un período.
   * @param period 'day' (día actual), 'week' (última semana), 'month' (mes actual)
   * @param useCache Si usar caché (default: true)
   * @returns Porcentajes y conteos de contractors activos/inactivos
   */
  async getActiveTalentPercentage(
    period: "day" | "week" | "month" = "day",
    useCache: boolean = true,
  ): Promise<{
    active_percentage: number;
    inactive_percentage: number;
    total_contractors: number;
    active_contractors: number;
    inactive_contractors: number;
    period: string;
  }> {
    try {
      const response = await http.get("/adt/active-talent", {
        params: {
          period,
          useCache: useCache ? "true" : "false",
        },
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en getActiveTalentPercentage:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });
      throw error;
    }
  }

  /**
   * Obtiene top 5 mejores rankings de productividad.
   * @param period 'day' (día actual), 'week' (última semana), 'month' (mes actual)
   * @param useCache Si usar caché (default: true)
   * @returns Top 5 contractors con mejor productividad_score
   */
  async getTop5BestRanking(
    period: "day" | "week" | "month" = "day",
    useCache: boolean = true,
  ): Promise<RealtimeMetrics[]> {
    try {
      const response = await http.get<RealtimeMetrics[]>("/adt/ranking/top5-best", {
        params: {
          period,
          useCache: useCache ? "true" : "false",
        },
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en getTop5BestRanking:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });
      throw error;
    }
  }

  /**
   * Obtiene top 5 peores rankings de productividad.
   * @param period 'day' (día actual), 'week' (última semana), 'month' (mes actual)
   * @param useCache Si usar caché (default: true)
   * @returns Top 5 contractors con peor productividad_score
   */
  async getTop5WorstRanking(
    period: "day" | "week" | "month" = "day",
    useCache: boolean = true,
  ): Promise<RealtimeMetrics[]> {
    try {
      const response = await http.get<RealtimeMetrics[]>("/adt/ranking/top5-worst", {
        params: {
          period,
          useCache: useCache ? "true" : "false",
        },
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("❌ Error en getTop5WorstRanking:", {
        message: axiosError?.message || "Unknown error",
        response: axiosError?.response?.data || null,
        status: axiosError?.response?.status || null,
      });
      throw error;
    }
  }
}

export const adtService = new AdtService();
