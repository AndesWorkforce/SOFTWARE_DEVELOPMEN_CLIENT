"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import ReactCountryFlag from "react-country-flag";
import { ArrowLeft, FileText, ChevronDown, Laptop, SquareUserRound, Calendar } from "lucide-react";
import {
  Button,
  TimeBreakdown,
  InputTotals,
  TopApplications,
  TopWebsites,
  HourlyProductivityChart,
  ProductivityDurationChart,
  SessionSummaryTable,
  SessionSummaryMobile,
  getCountryCode,
} from "@/packages/design-system";
import {
  adtService,
  type RealtimeMetrics,
  type ContractorSession,
  type HourlySessionDuration,
  type HourlyProductivity,
  type ProductivitySummary,
} from "@/packages/api/adt/adt.service";
import { contractorsService } from "@/packages/api/contractors/contractors.service";
import type { Contractor } from "@/packages/types/contractors.types";
import type { UserActivity } from "@/packages/api/reports/reports.service";

// Tipos de aplicaciones (sincronizado con AppType del backend)
type AppType =
  | "Code"
  | "Web"
  | "Design"
  | "Chat"
  | "Office"
  | "Productivity"
  | "Development"
  | "Database"
  | "Cloud"
  | "Entertainment"
  | "System"
  | "Other";

// Colores para cada tipo de app (según diseños de Figma)
const APP_TYPE_COLORS: Record<AppType, string> = {
  Code: "#0097B2", // Cyan/Teal - IDEs y editores
  Web: "#7DA40A", // Verde - Navegadores
  Design: "#FF1493", // Magenta/Fuchsia - Diseño
  Chat: "#9966FF", // Púrpura - Mensajería
  Office: "#FF9F40", // Naranja - Ofimática
  Productivity: "#FF6384", // Rosa/Rojo - Productividad
  Development: "#9966FF", // Púrpura - Herramientas dev
  Database: "#36A2EB", // Azul medio - Bases de datos
  Cloud: "#C9CBCF", // Gris - Cloud
  Entertainment: "#E74C3C", // Rojo - Entretenimiento/Ocio
  System: "#95A5A6", // Gris claro - Sistema
  Other: "#BDC3C7", // Gris neutro - Sin categoría
};

const VALID_APP_TYPES = Object.keys(APP_TYPE_COLORS) as AppType[];

const DEFAULT_CHART_HOURS = { start: 8, end: 17 } as const;

function parseHourFromTime(value: string | null | undefined): number | null {
  if (!value) return null;
  // Espera "HH:MM" (o "H:MM"). Si viniera con segundos, igual funciona.
  const match = value.trim().match(/^(\d{1,2})\s*:\s*(\d{2})(?::\d{2})?$/);
  if (!match) return null;
  const h = Number(match[1]);
  if (!Number.isFinite(h) || h < 0 || h > 23) return null;
  return h;
}

function getChartHoursFromContractor(contractor?: Contractor | null): {
  start: number;
  end: number;
} {
  const start = parseHourFromTime(contractor?.work_schedule_start);
  const end = parseHourFromTime(contractor?.work_schedule_end);

  const resolvedStart = start ?? DEFAULT_CHART_HOURS.start;
  const resolvedEnd = end ?? DEFAULT_CHART_HOURS.end;

  // Si viene invertido o inválido, fallback seguro.
  if (resolvedEnd < resolvedStart) return { ...DEFAULT_CHART_HOURS };

  return { start: resolvedStart, end: resolvedEnd };
}

function toHourLabel(hour: number): string {
  return `${hour.toString().padStart(2, "0")}:00`;
}

function fillHourlySessionDurationRange(
  data: HourlySessionDuration[],
  startHour: number,
  endHour: number,
): HourlySessionDuration[] {
  const byHour = new Map<number, HourlySessionDuration>();
  for (const d of data) byHour.set(d.hour, d);

  const filled: HourlySessionDuration[] = [];
  for (let h = startHour; h <= endHour; h++) {
    const existing = byHour.get(h);
    if (existing) {
      filled.push(existing);
    } else {
      filled.push({
        hour: h,
        hour_label: toHourLabel(h),
        days_with_data: 0,
        avg_duration_seconds: 0,
      });
    }
  }
  return filled;
}

function fillHourlyProductivityRange(
  data: HourlyProductivity[],
  startHour: number,
  endHour: number,
): HourlyProductivity[] {
  const byHour = new Map<number, HourlyProductivity>();
  for (const d of data) byHour.set(d.hour, d);

  const filled: HourlyProductivity[] = [];
  for (let h = startHour; h <= endHour; h++) {
    const existing = byHour.get(h);
    if (existing) {
      filled.push(existing);
    } else {
      filled.push({
        hour: h,
        hour_label: toHourLabel(h),
        days_with_data: 0,
        avg_productivity_score: 0,
        avg_active_percentage: 0,
        avg_keyboard_mouse_score: 0,
        avg_app_score: 0,
        avg_browser_score: 0,
      });
    }
  }
  return filled;
}

// Componente interno: barra de distribución de uso por tipo de app (reutilizada en mobile y desktop)
const UsageDistributionBar = ({
  distribution,
  t,
}: {
  distribution: Array<{ type: AppType; seconds: number; percentage: number; color: string }>;
  t: (key: string) => string;
}) => {
  if (distribution.length === 0) return null;
  return (
    <div className="mt-8 pt-4 border-t border-gray-100">
      <p className="text-[12px] font-semibold mb-2 text-black">{t("usageDistribution")}</p>
      <div className="h-2 w-full rounded-full flex overflow-hidden mb-4">
        {distribution.map((item) => (
          <div
            key={item.type}
            style={{
              backgroundColor: item.color,
              width: `${item.percentage}%`,
              minWidth: item.percentage > 0 ? "2px" : "0",
            }}
            title={`${item.type}: ${item.percentage}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {distribution.map((item) => (
          <div key={item.type} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
            <span className="text-[12px] font-medium text-black">
              {item.type} ({item.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SessionConnectivitySection = ({
  sessionConnectivityStats,
  formatDurationFromSeconds,
  hourlyData,
  hourlyProductivityForChart,
  hourlySessionDurationAgentLoading,
  hourlyProductivityAgentLoading,
  selectedAgentId,
  t,
  variant,
}: {
  sessionConnectivityStats: {
    sessionCount: number;
    avgDurationSeconds: number;
    avgProductivity: number;
  };
  formatDurationFromSeconds: (seconds: number) => string;
  hourlyData: Array<{ hour: string; productivity: number; duration: number }>;
  hourlyProductivityForChart: HourlyProductivity[];
  hourlySessionDurationAgentLoading: boolean;
  hourlyProductivityAgentLoading: boolean;
  selectedAgentId: string;
  t: (key: string) => string;
  variant: "mobile" | "desktop";
}) => (
  <div
    className={
      variant === "desktop"
        ? "bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-5 flex flex-col gap-6 min-w-0"
        : "bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-5 flex flex-col gap-6 min-w-0 overflow-hidden"
    }
  >
    <h3 className="text-xl font-semibold text-black">{t("modal.sessionConnectivity")}</h3>
    <div className="grid grid-cols-3 gap-3 w-full min-w-0">
      <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-4 flex flex-col gap-1 min-w-0">
        <p className="text-sm text-[#6D6D6D] font-normal">{t("modal.sessionCount")}</p>
        <p className="text-xl font-bold text-black">{sessionConnectivityStats.sessionCount}</p>
      </div>
      <div className="bg-[#e8f4f6] border border-[rgba(166,166,166,0.3)] rounded-[5px] p-4 flex flex-col gap-1 min-w-0">
        <p className="text-sm text-[#6D6D6D] font-normal">{t("modal.avgDuration")}</p>
        <p className="text-xl font-bold text-black">
          {formatDurationFromSeconds(sessionConnectivityStats.avgDurationSeconds)}
        </p>
      </div>
      <div className="bg-[#7DA40A]/15 border border-[rgba(166,166,166,0.5)] rounded-[5px] p-4 flex flex-col gap-1 min-w-0">
        <p className="text-sm text-[#6D6D6D] font-normal">{t("modal.avgProductivity")}</p>
        <p className="text-xl font-bold text-black">
          {sessionConnectivityStats.avgProductivity > 0
            ? `${Math.round(sessionConnectivityStats.avgProductivity)}%`
            : "0%"}
        </p>
      </div>
    </div>
    <div
      className={
        variant === "desktop"
          ? "flex flex-col md:flex-row gap-5 w-full min-w-0"
          : "flex flex-col gap-5 w-full min-w-0"
      }
    >
      <div className="flex-1 min-w-0 w-full">
        {hourlySessionDurationAgentLoading ? (
          <div className="flex items-center justify-center py-8 text-gray-500">{t("loading")}</div>
        ) : (
          <ProductivityDurationChart key={selectedAgentId} hourlyData={hourlyData} />
        )}
      </div>
      <div className="flex-1 min-w-0 w-full">
        {hourlyProductivityAgentLoading ? (
          <div className="flex items-center justify-center py-8 text-gray-500">{t("loading")}</div>
        ) : (
          <HourlyProductivityChart hourlyData={hourlyProductivityForChart} />
        )}
      </div>
    </div>
  </div>
);

// Sección resumen de sesiones por día (mobile: cards con SessionSummaryMobile; desktop: tabla con SessionSummaryTable)
const SessionSummarySection = ({
  sessionsByDayFiltered,
  loading,
  locale,
  t,
  variant,
}: {
  sessionsByDayFiltered: Array<{ session_day: string; sessions: ContractorSession[] }>;
  loading: boolean;
  locale: string;
  t: (key: string) => string;
  variant: "mobile" | "desktop";
}) => {
  if (loading) {
    return (
      <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-5 flex justify-center text-gray-500">
        {t("loading")}
      </div>
    );
  }
  if (sessionsByDayFiltered.length === 0) {
    return (
      <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-5 min-w-0">
        <p className="text-base text-gray-500 text-center">{t("noSessionsAvailable")}</p>
      </div>
    );
  }
  if (variant === "mobile") {
    return (
      <>
        {sessionsByDayFiltered.map((dayGroup) => (
          <div
            key={dayGroup.session_day}
            className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-5 min-w-0 overflow-hidden"
          >
            <SessionSummaryMobile sessions={dayGroup.sessions} date={dayGroup.session_day} />
          </div>
        ))}
      </>
    );
  }
  return (
    <div className="flex flex-col gap-5 min-w-0">
      <h3 className="text-xl font-semibold text-black">{t("sessionSummary")}</h3>
      {sessionsByDayFiltered.map((dayGroup) => (
        <div
          key={dayGroup.session_day}
          className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-5 flex flex-col gap-6 min-w-0 overflow-hidden"
        >
          <div className="flex flex-col gap-1">
            <p className="text-base font-medium text-black">
              {new Date(dayGroup.session_day + "T12:00:00").toLocaleDateString(
                locale === "es" ? "es-ES" : "en-US",
                { month: "long", day: "numeric", year: "numeric" },
              )}
            </p>
          </div>
          <SessionSummaryTable sessions={dayGroup.sessions} date={dayGroup.session_day} />
        </div>
      ))}
    </div>
  );
};

// Componente interno para los selectores de fecha con estilo Figma
const ReportDateSelector = ({
  label,
  value,
  displayValue,
  onChange,
  icon,
  min,
  max,
}: {
  label: string;
  value: string;
  displayValue: string;
  onChange: (val: string) => void;
  icon: React.ReactNode;
  min?: string;
  max?: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.showPicker();
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex-1 bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] px-[15px] py-[10px] lg:p-3 flex items-center justify-between relative cursor-pointer hover:bg-gray-50 transition-colors h-[56px] lg:h-auto min-w-0"
    >
      <div className="flex items-center gap-[5px] lg:gap-3 min-w-0 flex-1">
        <div className="text-black shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] lg:text-[12px] text-[#6D6D6D] truncate mb-0">{label}</p>
          <p className="text-[14px] lg:text-base font-medium text-black truncate">{displayValue}</p>
        </div>
      </div>
      <ChevronDown className="w-6 h-6 text-black shrink-0 ml-2" />
      <input
        ref={inputRef}
        type="date"
        className="absolute inset-0 opacity-0 pointer-events-none"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export interface ReportDetailViewProps {
  contractorId: string;
  basePath: string; // "admin" o "super-admin"
}

export function ReportDetailView({ contractorId, basePath }: ReportDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("reports");
  const locale = useLocale();
  const mobileDeviceSelectRef = useRef<HTMLSelectElement | null>(null);
  const desktopDeviceSelectRef = useRef<HTMLSelectElement | null>(null);

  // Helper para obtener fecha por defecto
  const getDefaultDate = () => new Date().toISOString().split("T")[0];

  // Estado local para las fechas (sincronizado con URL)
  const [startDate, setStartDate] = useState<string>(() => {
    const fromParam = searchParams?.get("from");
    return fromParam ? fromParam.split("T")[0] : getDefaultDate();
  });

  const [endDate, setEndDate] = useState<string>(() => {
    const toParam = searchParams?.get("to");
    return toParam ? toParam.split("T")[0] : getDefaultDate();
  });

  const [productivitySummary, setProductivitySummary] = useState<ProductivitySummary | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("consolidated");
  const [sessions, setSessions] = useState<ContractorSession[]>([]);
  const [sessionsByDay, setSessionsByDay] = useState<
    Array<{ session_day: string; sessions: ContractorSession[] }>
  >([]);
  const [sessionsByDayByAgent, setSessionsByDayByAgent] = useState<
    Record<string, Array<{ session_day: string; sessions: ContractorSession[] }>>
  >({});
  const [sessionsByDayAgentLoading, setSessionsByDayAgentLoading] = useState(false);
  const [hourlySessionDuration, setHourlySessionDuration] = useState<HourlySessionDuration[]>([]);
  const [hourlySessionDurationByAgent, setHourlySessionDurationByAgent] = useState<
    Record<string, HourlySessionDuration[]>
  >({});
  const [hourlyProductivity, setHourlyProductivity] = useState<HourlyProductivity[]>([]);
  const [hourlyProductivityByAgent, setHourlyProductivityByAgent] = useState<
    Record<string, HourlyProductivity[]>
  >({});
  const [hourlyProductivityAgentLoading, setHourlyProductivityAgentLoading] = useState(false);
  const [hourlySessionDurationAgentLoading, setHourlySessionDurationAgentLoading] = useState(false);
  const [chartHours, setChartHours] = useState<{ start: number; end: number }>({
    ...DEFAULT_CHART_HOURS,
  });
  const [loading, setLoading] = useState(true);

  // Sincronizar estado local cuando cambian los searchParams (ej: navegación con botones del browser)
  // Solo actualizar si los valores son diferentes para evitar loops
  useEffect(() => {
    const fromParam = searchParams?.get("from");
    const toParam = searchParams?.get("to");

    if (fromParam && fromParam.split("T")[0] !== startDate) {
      setStartDate(fromParam.split("T")[0]);
    }
    if (toParam && toParam.split("T")[0] !== endDate) {
      setEndDate(toParam.split("T")[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const formatSecondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`;
  };

  const formatDateForDisplay = (dateStr: string) => {
    try {
      const date = new Date(dateStr + "T12:00:00");
      return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const transformRealtimeMetricsToUserActivity = useCallback(
    (metric: RealtimeMetrics): UserActivity => {
      return {
        id: metric.contractor_id,
        user: {
          id: metric.contractor_id,
          name: metric.contractor_name || `Contractor ${metric.contractor_id.slice(-6)}`,
          email: metric.contractor_email || `${metric.contractor_id}@example.com`,
        },
        jobPosition: metric.job_position || t("exportModal.notAvailable"),
        client: {
          id: metric.client_id || "unknown",
          name: metric.client_name || t("exportModal.notAvailable"),
        },
        team: {
          id: metric.team_id || "unknown",
          name: metric.team_name || t("exportModal.notAvailable"),
        },
        country: metric.country || t("exportModal.notAvailable"),
        timeWorked: formatSecondsToTime(metric.total_session_time_seconds),
        activityPercentage: Math.round(metric.active_percentage),
        date: metric.workday,
        details: [],
        metrics: {
          totalBeats: metric.total_beats,
          activeBeats: metric.active_beats,
          idleBeats: metric.idle_beats,
          totalKeyboardInputs: metric.total_keyboard_inputs,
          totalMouseClicks: metric.total_mouse_clicks,
          avgKeyboardPerMin: metric.avg_keyboard_per_min,
          avgMousePerMin: metric.avg_mouse_per_min,
          totalSessionTimeSeconds: metric.total_session_time_seconds,
          effectiveWorkSeconds: metric.effective_work_seconds,
          productivityScore: metric.productivity_score,
          appUsage: metric.app_usage,
          browserUsage: metric.browser_usage,
        },
      };
    },
    [t],
  );

  // Métricas a mostrar: consolidado o el agente seleccionado (con datos de contractor del consolidado)
  const activity = useMemo(() => {
    if (!productivitySummary?.consolidated) return null;
    const consolidated = productivitySummary.consolidated as RealtimeMetrics;
    const displayMetrics: RealtimeMetrics =
      selectedAgentId === "consolidated"
        ? consolidated
        : ({
            ...consolidated,
            ...productivitySummary.agents?.[selectedAgentId],
          } as RealtimeMetrics);
    return transformRealtimeMetricsToUserActivity(displayMetrics);
  }, [productivitySummary, selectedAgentId, transformRealtimeMetricsToUserActivity]);

  // Opciones del selector: Consolidado + un ítem por cada agente
  const agentSelectorOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [
      { value: "consolidated", label: t("consolidatedView") },
    ];
    if (productivitySummary?.agents) {
      Object.keys(productivitySummary.agents).forEach((agentId, i) => {
        opts.push({
          value: agentId,
          label: t("agentLabel", { number: i + 1 }),
        });
      });
    }
    return opts;
  }, [productivitySummary?.agents, t]);

  const selectedAgentLabel = useMemo(() => {
    const found = agentSelectorOptions.find((opt) => opt.value === selectedAgentId);
    return found ? found.label : "";
  }, [agentSelectorOptions, selectedAgentId]);

  // Cargar datos cuando cambian las fechas o el contractor
  useEffect(() => {
    const loadActivity = async () => {
      if (!contractorId || !startDate || !endDate) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [contractor, summary, contractorSessions, contractorSessionsByDay] =
          await Promise.all([
            contractorsService.getById(contractorId).catch(() => null),
            adtService.getProductivitySummary(contractorId, undefined, startDate, endDate),
            adtService.getContractorSessions(contractorId, startDate, endDate),
            adtService.getContractorSessionsByDay(contractorId, startDate, endDate),
          ]);

        const nextChartHours = getChartHoursFromContractor(contractor);
        setChartHours(nextChartHours);

        const [sessionDurationData, hourlyProductivityData] = await Promise.all([
          adtService.getHourlySessionDuration(
            contractorId,
            startDate,
            endDate,
            30,
            nextChartHours.start,
            nextChartHours.end,
          ),
          adtService.getHourlyProductivity(
            contractorId,
            startDate,
            endDate,
            30,
            nextChartHours.start,
            nextChartHours.end,
          ),
        ]);

        if (summary?.consolidated) {
          setProductivitySummary(summary);
          setSelectedAgentId("consolidated");
        }
        setSessions(contractorSessions);
        setSessionsByDay(contractorSessionsByDay);
        setSessionsByDayByAgent({});
        setHourlySessionDuration(
          fillHourlySessionDurationRange(
            sessionDurationData,
            nextChartHours.start,
            nextChartHours.end,
          ),
        );
        setHourlySessionDurationByAgent({});
        setHourlyProductivity(
          fillHourlyProductivityRange(
            hourlyProductivityData,
            nextChartHours.start,
            nextChartHours.end,
          ),
        );
        setHourlyProductivityByAgent({});
      } catch (error) {
        console.error("Error loading activity details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [contractorId, startDate, endDate, transformRealtimeMetricsToUserActivity]);

  useEffect(() => {
    if (
      selectedAgentId === "consolidated" ||
      !contractorId ||
      !startDate ||
      !endDate ||
      (sessionsByDayByAgent[selectedAgentId] !== undefined &&
        hourlySessionDurationByAgent[selectedAgentId] !== undefined &&
        hourlyProductivityByAgent[selectedAgentId] !== undefined)
    ) {
      return;
    }
    let cancelled = false;
    setSessionsByDayAgentLoading(true);
    setHourlySessionDurationAgentLoading(true);
    setHourlyProductivityAgentLoading(true);

    Promise.all([
      adtService.getContractorSessionsByDay(contractorId, startDate, endDate, 30, selectedAgentId),
      adtService.getHourlySessionDuration(
        contractorId,
        startDate,
        endDate,
        30,
        chartHours.start,
        chartHours.end,
        selectedAgentId,
      ),
      adtService.getHourlyProductivity(
        contractorId,
        startDate,
        endDate,
        30,
        chartHours.start,
        chartHours.end,
        selectedAgentId,
      ),
    ])
      .then(([sessionsByDayData, sessionDurationData, productivityData]) => {
        if (cancelled) return;
        setSessionsByDayByAgent((prev) => ({ ...prev, [selectedAgentId]: sessionsByDayData }));
        setHourlySessionDurationByAgent((prev) => ({
          ...prev,
          [selectedAgentId]: fillHourlySessionDurationRange(
            sessionDurationData,
            chartHours.start,
            chartHours.end,
          ),
        }));
        setHourlyProductivityByAgent((prev) => ({
          ...prev,
          [selectedAgentId]: fillHourlyProductivityRange(
            productivityData,
            chartHours.start,
            chartHours.end,
          ),
        }));
      })
      .catch(() => {
        if (!cancelled) {
          setSessionsByDayByAgent((prev) => ({ ...prev, [selectedAgentId]: [] }));
          setHourlySessionDurationByAgent((prev) => ({ ...prev, [selectedAgentId]: [] }));
          setHourlyProductivityByAgent((prev) => ({ ...prev, [selectedAgentId]: [] }));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSessionsByDayAgentLoading(false);
          setHourlySessionDurationAgentLoading(false);
          setHourlyProductivityAgentLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [
    contractorId,
    startDate,
    endDate,
    selectedAgentId,
    chartHours.start,
    chartHours.end,
    sessionsByDayByAgent,
    hourlySessionDurationByAgent,
    hourlyProductivityByAgent,
  ]);

  // Datos del gráfico de productividad por hora: consolidado o del agente seleccionado
  const hourlyProductivityForChart = useMemo(() => {
    if (selectedAgentId === "consolidated") {
      return hourlyProductivity;
    }
    return hourlyProductivityByAgent[selectedAgentId] ?? [];
  }, [selectedAgentId, hourlyProductivity, hourlyProductivityByAgent]);

  // Datos de duración por hora: consolidado o del agente seleccionado
  const hourlySessionDurationForChart = useMemo(() => {
    if (selectedAgentId === "consolidated") {
      return hourlySessionDuration;
    }
    return hourlySessionDurationByAgent[selectedAgentId] ?? [];
  }, [selectedAgentId, hourlySessionDuration, hourlySessionDurationByAgent]);

  // Transformar datos de la API al formato esperado por el gráfico
  const hourlyData = useMemo(() => {
    return hourlySessionDurationForChart.map((h) => ({
      hour: h.hour_label,
      productivity: 0, // No se usa en el gráfico actual
      duration: Math.round((h.avg_duration_seconds / 3600) * 100) / 100, // Convertir segundos a horas (decimal)
    }));
  }, [hourlySessionDurationForChart]);

  // Consolidado: sessionsByDay (backend una fila por sesión). Por agente: datos cargados desde backend por agentId.
  const sessionsByDayFiltered = useMemo(() => {
    if (selectedAgentId === "consolidated") return sessionsByDay;
    return sessionsByDayByAgent[selectedAgentId] ?? [];
  }, [selectedAgentId, sessionsByDay, sessionsByDayByAgent]);

  // Métricas para Session & Connectivity: Session Count, Avg. Duration, Avg. Productivity (desde sesiones filtradas)
  const sessionConnectivityStats = useMemo(() => {
    const allSessions = sessionsByDayFiltered.flatMap((d) => d.sessions);
    const count = allSessions.length;
    if (count === 0) return { sessionCount: 0, avgDurationSeconds: 0, avgProductivity: 0 };
    const totalSeconds = allSessions.reduce(
      (sum, s) => sum + (Number((s as ContractorSession).total_seconds) || 0),
      0,
    );
    const totalProductivity = allSessions.reduce(
      (sum, s) => sum + (Number((s as ContractorSession).productivity_score) || 0),
      0,
    );
    return {
      sessionCount: count,
      avgDurationSeconds: totalSeconds / count,
      avgProductivity: totalProductivity / count,
    };
  }, [sessionsByDayFiltered]);

  const formatDurationFromSeconds = (seconds: number) => {
    if (seconds <= 0 || !Number.isFinite(seconds)) return "0h 0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h 0m`;
    return `0h ${m}m`;
  };

  // Calcular distribución de uso por tipo de app
  const usageDistribution = useMemo(() => {
    const apps = activity?.metrics?.appUsage || [];

    // Agrupar por tipo y sumar segundos
    const byType: Record<AppType, number> = {} as Record<AppType, number>;
    let totalSeconds = 0;

    for (const app of apps) {
      const appType = app.type as string;
      const type: AppType =
        appType && VALID_APP_TYPES.includes(appType as AppType) ? (appType as AppType) : "Other";

      byType[type] = (byType[type] || 0) + app.seconds;
      totalSeconds += app.seconds;
    }

    // Convertir a array con porcentajes, ordenar por segundos desc, filtrar los que tienen uso
    const distribution = Object.entries(byType)
      .filter(([_, seconds]) => seconds > 0)
      .map(([type, seconds]) => ({
        type: type as AppType,
        seconds,
        percentage: totalSeconds > 0 ? Math.round((seconds / totalSeconds) * 100) : 0,
        color: APP_TYPE_COLORS[type as AppType],
      }))
      .sort((a, b) => b.seconds - a.seconds);

    return { distribution, totalSeconds };
  }, [activity?.metrics?.appUsage]);

  const handleBack = useCallback(() => {
    router.push(`/${locale}/app/${basePath}/reports`);
  }, [router, locale, basePath]);

  // Fecha máxima para el date picker (hoy); se recalcula cada render para sesiones largas
  const maxDate = new Date().toISOString().split("T")[0];

  // Manejador para cambios de fecha - actualiza estado local y URL
  const handleStartDateChange = useCallback(
    (newStartDate: string) => {
      // Validar: fecha de inicio no puede ser mayor a fecha de fin
      if (newStartDate > endDate) {
        return; // No hacer nada si la fecha es inválida
      }
      setStartDate(newStartDate);
      // Actualizar URL sin scroll para mantener la posición
      router.replace(
        `/${locale}/app/${basePath}/reports/detail/${contractorId}?from=${newStartDate}&to=${endDate}`,
        { scroll: false },
      );
    },
    [locale, basePath, contractorId, endDate, router],
  );

  const handleEndDateChange = useCallback(
    (newEndDate: string) => {
      // Validar: fecha de fin no puede ser mayor a hoy, ni menor a fecha de inicio
      if (newEndDate > maxDate || newEndDate < startDate) {
        return; // No hacer nada si la fecha es inválida
      }
      setEndDate(newEndDate);
      // Actualizar URL sin scroll para mantener la posición
      router.replace(
        `/${locale}/app/${basePath}/reports/detail/${contractorId}?from=${startDate}&to=${newEndDate}`,
        { scroll: false },
      );
    },
    [locale, basePath, contractorId, startDate, maxDate, router],
  );

  if (loading || !activity) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] p-8 flex items-center justify-center">
        <div className="text-black">{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] overflow-x-hidden">
      <div className="p-4 md:p-8 w-full max-w-full box-border">
        <div className="w-full max-w-full flex flex-col gap-5 min-w-0">
          {/* Header Section */}
          <div className="flex items-center justify-between w-full min-w-0">
            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
              <button
                onClick={handleBack}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-6 h-6 text-black" />
              </button>
              <h1 className="text-xl md:text-2xl font-semibold text-black truncate">
                {t("reportDetail")}
              </h1>
            </div>
            <Link
              href={`/${locale}/app/${basePath}/reports/export?from=${startDate}&to=${endDate}&userId=${contractorId}`}
            >
              <Button
                variant="primary"
                style={{
                  background: "#0097B2",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  padding: "7px 21px",
                  height: "35px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                className="text-sm shrink-0 ml-2"
              >
                <FileText className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{t("exportPdf")}</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </Link>
          </div>

          {/* Contractor Info Card */}
          <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-4 md:p-5 flex items-center gap-3 min-w-0">
            <div className="w-[45px] h-[45px] md:w-[55px] md:h-[55px] bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
              <SquareUserRound className="w-8 h-8 text-gray-400" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <h2 className="text-base md:text-xl font-semibold text-black truncate">
                  {activity.user.name}
                </h2>
                {activity.country && getCountryCode(activity.country) && (
                  <ReactCountryFlag
                    countryCode={getCountryCode(activity.country)!}
                    svg
                    style={{
                      width: "24px",
                      height: "24px",
                    }}
                    title={activity.country}
                    className="shrink-0"
                  />
                )}
              </div>
              <p className="text-xs md:text-base text-black break-words">
                {activity.jobPosition} | {t("teamLabel")} {activity.team.name} | {t("clientLabel")}{" "}
                {activity.client.name}
              </p>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="flex flex-col lg:hidden gap-5 w-full overflow-x-hidden">
            {/* Device / Agent Selector - Mobile */}
            <div className="relative w-full bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] px-[15px] py-[10px] flex items-center justify-between h-[56px] min-w-0 cursor-pointer">
              <div className="flex items-center gap-[5px] min-w-0 flex-1">
                <Laptop className="w-[25px] h-[25px] text-black shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-[#6D6D6D] mb-0 truncate">{t("currentDevice")}</p>
                  <p className="text-[14px] font-medium text-black truncate">
                    {selectedAgentLabel}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-6 h-6 text-black shrink-0 ml-2 pointer-events-none" />
              <select
                ref={mobileDeviceSelectRef}
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label={t("currentDevice")}
              >
                {agentSelectorOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Pickers - Side by Side on Mobile */}
            <div className="flex gap-[5px] w-full min-w-0">
              <div className="flex-1 min-w-0">
                <ReportDateSelector
                  label="Report Period"
                  value={startDate}
                  displayValue={formatDateForDisplay(startDate)}
                  onChange={handleStartDateChange}
                  icon={<Calendar className="w-[25px] h-[25px]" />}
                  max={endDate}
                />
              </div>
              <div className="flex-1 min-w-0">
                <ReportDateSelector
                  label="Report Period"
                  value={endDate}
                  displayValue={formatDateForDisplay(endDate)}
                  onChange={handleEndDateChange}
                  icon={<Calendar className="w-[25px] h-[25px]" />}
                  min={startDate}
                  max={maxDate}
                />
              </div>
            </div>

            {/* Input Totals */}
            <InputTotals activity={activity} t={t} />

            {/* Top Applications */}
            <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-[17px] md:p-5 min-w-0 overflow-hidden">
              <TopApplications activity={activity} t={t} />
              <UsageDistributionBar distribution={usageDistribution.distribution} t={t} />
            </div>

            {/* Top Websites */}
            <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-[17px] md:p-5 min-w-0 overflow-hidden">
              <TopWebsites activity={activity} t={t} />
            </div>

            {/* Time Breakdown */}
            <div className="min-w-0 overflow-hidden">
              <TimeBreakdown activity={activity} t={t} />
            </div>

            {/* Session & Connectivity */}
            <SessionConnectivitySection
              sessionConnectivityStats={sessionConnectivityStats}
              formatDurationFromSeconds={formatDurationFromSeconds}
              hourlyData={hourlyData}
              hourlyProductivityForChart={hourlyProductivityForChart}
              hourlySessionDurationAgentLoading={hourlySessionDurationAgentLoading}
              hourlyProductivityAgentLoading={hourlyProductivityAgentLoading}
              selectedAgentId={selectedAgentId}
              t={t}
              variant="mobile"
            />

            {/* Session Summary - Mobile */}
            <SessionSummarySection
              sessionsByDayFiltered={sessionsByDayFiltered}
              loading={sessionsByDayAgentLoading && selectedAgentId !== "consolidated"}
              locale={locale}
              t={t}
              variant="mobile"
            />
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex flex-col lg:flex-row gap-5 w-full min-w-0">
            <div className="flex flex-col gap-5 flex-1 min-w-0">
              {/* Selectors Row */}
              <div className="flex flex-col md:flex-row gap-3 w-full min-w-0">
                <ReportDateSelector
                  label={t("startDate")}
                  value={startDate}
                  displayValue={formatDateForDisplay(startDate)}
                  onChange={handleStartDateChange}
                  icon={<Calendar className="w-7 h-7" />}
                  max={endDate}
                />
                <ReportDateSelector
                  label={t("endDate")}
                  value={endDate}
                  displayValue={formatDateForDisplay(endDate)}
                  onChange={handleEndDateChange}
                  icon={<Calendar className="w-7 h-7" />}
                  min={startDate}
                  max={maxDate}
                />
                <div className="relative flex-1 bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-3 flex items-center justify-between min-w-0 cursor-pointer">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Laptop className="w-7 h-7 text-black shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-[#6D6D6D]">{t("currentDevice")}</p>
                      <p className="text-base font-medium text-black truncate">
                        {selectedAgentLabel}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-6 h-6 text-black shrink-0 ml-2 pointer-events-none" />
                  <select
                    ref={desktopDeviceSelectRef}
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    aria-label={t("currentDevice")}
                  >
                    {agentSelectorOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time Breakdown */}
              <div className="min-w-0 overflow-hidden">
                <TimeBreakdown activity={activity} t={t} />
              </div>

              {/* Session & Connectivity */}
              <SessionConnectivitySection
                sessionConnectivityStats={sessionConnectivityStats}
                formatDurationFromSeconds={formatDurationFromSeconds}
                hourlyData={hourlyData}
                hourlyProductivityForChart={hourlyProductivityForChart}
                hourlySessionDurationAgentLoading={hourlySessionDurationAgentLoading}
                hourlyProductivityAgentLoading={hourlyProductivityAgentLoading}
                selectedAgentId={selectedAgentId}
                t={t}
                variant="desktop"
              />

              {/* Session Summary - Desktop */}
              <SessionSummarySection
                sessionsByDayFiltered={sessionsByDayFiltered}
                loading={sessionsByDayAgentLoading && selectedAgentId !== "consolidated"}
                locale={locale}
                t={t}
                variant="desktop"
              />
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-5 w-full lg:w-[335px] shrink-0 min-w-0">
              <div className="min-w-0 overflow-hidden">
                <InputTotals activity={activity} t={t} />
              </div>
              <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-5 min-w-0 overflow-hidden">
                <TopApplications activity={activity} t={t} />
                <UsageDistributionBar distribution={usageDistribution.distribution} t={t} />
              </div>
              {/* Top Websites - mismas dimensiones que Top Applications */}
              <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-5 min-w-0 overflow-hidden">
                <TopWebsites activity={activity} t={t} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
