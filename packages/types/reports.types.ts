import type { AppUsage, BrowserUsage } from "./adt.types";

export interface ReportFilters {
  dateRange?: {
    start: string; // ISO date
    end: string; // ISO date
  };
  userId?: string;
  country?: string;
  clientId?: string;
  teamId?: string;
  jobPosition?: string;
}

export interface UserActivity {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  jobPosition: string;
  client: {
    id: string;
    name: string;
  };
  team: {
    id: string;
    name: string;
  };
  country: string;
  timeWorked: string; // "HH:MM:SS"
  /**
   * Porcentaje de ACTIVIDAD: beats activos / beats totales (`active_percentage`).
   */
  activityPercentage: number; // 0-100
  /**
   * Score de PRODUCTIVIDAD: `S_active * S_quality / 100`, o sea actividad
   * ponderada por el peso de las apps y dominios usados (`productivity_score`).
   *
   * Es una metrica DISTINTA de `activityPercentage` y suele ser menor: sobre un
   * dia real, 96.7% de actividad daba 75.1 de productividad. Antes las dos
   * viajaban en el mismo campo segun quien lo llenara —la lista ponia el score,
   * el detalle la actividad— y eso hacia que la misma columna significara cosas
   * distintas en cada vista.
   */
  productivityScore?: number; // 0-100
  date: string; // ISO date
  details: ActivityDetail[];
  // Métricas detalladas
  metrics?: {
    totalBeats: number;
    activeBeats: number;
    idleBeats: number;
    totalKeyboardInputs: number;
    totalMouseClicks: number;
    avgKeyboardPerMin: number;
    avgMousePerMin: number;
    totalSessionTimeSeconds: number;
    effectiveWorkSeconds: number;
    productivityScore: number;
    appUsage?: AppUsage[];
    browserUsage?: BrowserUsage[];
  };
}

export interface ActivityDetail {
  timestamp: string;
  type: "active" | "idle" | "break";
  duration: number; // minutes
  application?: string;
  // `windowTitle` se elimino: el agente dejo de reportar titulos de ventana a
  // proposito, porque usarlos como clave era la raiz del ruido en la atribucion
  // de apps. El campo no se poblaba ni se renderizaba en ningun componente.
}

export interface ReportSummary {
  totalUsers: number;
  averageActivity: number;
  totalTimeWorked: string;
  mostActiveUser: string;
  leastActiveUser: string;
}

export interface FilterOption {
  value: string;
  label: string;
  /**
   * Valor del filtro padre al que pertenece esta opción (para filtros dependientes)
   * Ej: un equipo pertenece a un cliente específico
   */
  parentValue?: string;
}

export interface FilterOptions {
  users: FilterOption[];
  countries: FilterOption[];
  clients: FilterOption[];
  teams: FilterOption[];
  jobPositions: FilterOption[];
}
