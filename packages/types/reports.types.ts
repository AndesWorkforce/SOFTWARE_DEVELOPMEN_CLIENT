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
  activityPercentage: number; // 0-100
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
    appUsage?: Array<{ appName: string; seconds: number }>;
    browserUsage?: Array<{ domain: string; seconds: number }>;
  };
}

export interface ActivityDetail {
  timestamp: string;
  type: "active" | "idle" | "break";
  duration: number; // minutes
  application?: string;
  windowTitle?: string;
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
}

export interface FilterOptions {
  users: FilterOption[];
  countries: FilterOption[];
  clients: FilterOption[];
  teams: FilterOption[];
  jobPositions: FilterOption[];
}
