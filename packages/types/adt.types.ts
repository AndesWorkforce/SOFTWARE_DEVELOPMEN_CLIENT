/**
 * Tipos para el servicio ADT (Analytical Data Tables)
 */

export interface AppUsage {
  appName: string;
  seconds: number;
  type?: string;
}

export interface BrowserUsage {
  domain: string;
  seconds: number;
}

export interface ContractorSession {
  session_id: string;
  contractor_id: string;
  agent_id?: string | null;
  session_start: string; // "YYYY-MM-DD HH:mm:ss"
  session_end: string; // "YYYY-MM-DD HH:mm:ss"
  total_seconds: number;
  active_seconds: number;
  idle_seconds: number;
  productivity_score: number;
  created_at: string;
}

export interface RealtimeMetrics {
  contractor_id: string;
  workday: string; // YYYY-MM-DD
  total_beats: number;
  active_beats: number;
  idle_beats: number;
  active_percentage: number;
  total_keyboard_inputs: number;
  total_mouse_clicks: number;
  avg_keyboard_per_min: number;
  avg_mouse_per_min: number;
  total_session_time_seconds: number;
  effective_work_seconds: number;
  productivity_score: number;
  app_usage?: AppUsage[];
  browser_usage?: BrowserUsage[];
  is_realtime: boolean;
  calculated_at: string; // ISO date string
  // Campos enriquecidos del contractor
  contractor_name?: string;
  contractor_email?: string | null;
  job_position?: string;
  country?: string;
  client_id?: string;
  client_name?: string;
  team_id?: string | null;
  team_name?: string;
}

/**
 * Actividad promedio por hora.
 * Útil para gráficos de patrones de actividad a lo largo de la jornada laboral.
 */
export interface HourlyActivity {
  hour: number; // 8, 9, 10, ..., 16
  hour_label: string; // "08:00", "09:00", etc.
  days_with_data: number; // Cantidad de días que tuvieron actividad en esta hora
  total_beat_count: number; // Total de beats (para referencia)
  avg_beat_count: number; // Promedio de beats por día
  avg_duration_seconds: number; // Duración promedio en segundos
  avg_active_seconds: number; // Tiempo activo promedio
  avg_idle_seconds: number; // Tiempo idle promedio
  avg_keyboard_inputs: number; // Inputs de teclado promedio
  avg_mouse_clicks: number; // Clicks de mouse promedio
}

/**
 * Productividad promedio por hora.
 * Útil para gráficos de productividad horaria en la jornada laboral.
 */
export interface HourlyProductivity {
  hour: number; // 8, 9, 10, ..., 16
  hour_label: string; // "08:00", "09:00", etc.
  days_with_data: number; // Cantidad de días con datos en esta hora
  avg_productivity_score: number; // 0-100
  avg_active_percentage: number; // 0-100
  avg_keyboard_mouse_score: number; // 0-100
  avg_app_score: number; // 0-100
  avg_browser_score: number; // 0-100
}

/**
 * Duración real de sesiones por hora.
 * Calcula cuánto tiempo de sesión hubo activo DURANTE cada hora específica.
 */
export interface HourlySessionDuration {
  hour: number; // 8, 9, 10, ..., 16
  hour_label: string; // "08:00", "09:00", etc.
  days_with_data: number; // Cantidad de días con datos en esta hora
  avg_duration_seconds: number; // Duración promedio en segundos
}

/**
 * Duración promedio de sesiones agrupada dinámicamente.
 * El grupo puede ser cliente, equipo o contratista individual según los filtros.
 */
export interface GroupedAvgDuration {
  group_id: string; // ID del cliente, equipo o contratista
  group_name: string; // Nombre del cliente, equipo o contratista
  contractor_count: number; // Cantidad de contratistas en el grupo
  avg_duration_hours: number; // Duración promedio en horas
}

/**
 * Periodo de cálculo de productividad consolidada.
 * Mantiene compatibilidad con el backend (`adt.getProductivitySummary`).
 */
export interface ProductivityPeriod {
  type: "day" | "range";
  workday?: string;
  from?: string;
  to?: string;
}

/**
 * Resumen de productividad consolidada (y opcionalmente por agente)
 * para un contratista.
 *
 * - `consolidated` aplica la lógica multi-agente: beat activo si al menos
 *   un agente está activo en ese timestamp.
 * - `agents` solo se incluye cuando hay más de un agente.
 */
export interface ProductivitySummary {
  contractor_id: string;
  period: ProductivityPeriod;
  consolidated: RealtimeMetrics;
  agents?: Record<string, RealtimeMetrics>;
}
