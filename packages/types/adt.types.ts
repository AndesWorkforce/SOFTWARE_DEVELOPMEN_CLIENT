/**
 * Tipos para el servicio ADT (Analytical Data Tables)
 */

export interface AppUsage {
  appName: string;
  seconds: number;
}

export interface BrowserUsage {
  domain: string;
  seconds: number;
}

export interface ContractorSession {
  session_id: string;
  contractor_id: string;
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
