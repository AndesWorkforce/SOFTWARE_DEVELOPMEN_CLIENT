import { http } from "../../setup/axios.config";
import type { RealtimeMetrics } from "./adt.types";

// Re-export types for convenience
export type { RealtimeMetrics, AppUsage, BrowserUsage } from "./adt.types";

export class AdtService {
  /**
   * Obtiene métricas en tiempo real de todos los contratistas que tienen métricas para un día específico.
   * Solo devuelve contratistas que tienen datos (total_beats > 0).
   *
   * @param workday Fecha del día en formato YYYY-MM-DD (por defecto: hoy)
   * @param useCache Si usar caché (default: true)
   * @returns Array de métricas de productividad por contractor
   */
  async getAllRealtimeMetrics(
    workday?: string,
    useCache: boolean = true,
  ): Promise<RealtimeMetrics[]> {
    const params: Record<string, string> = {};

    if (workday) {
      params.workday = workday;
    }

    if (!useCache) {
      params.useCache = "false";
    }

    const response = await http.get<RealtimeMetrics[]>("/adt/realtime-metrics", {
      params,
    });

    return response.data;
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
}

export const adtService = new AdtService();
