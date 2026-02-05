"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
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
} from "@/packages/api/adt/adt.service";
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

  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [sessions, setSessions] = useState<ContractorSession[]>([]);
  const [sessionsByDay, setSessionsByDay] = useState<
    Array<{ session_day: string; sessions: ContractorSession[] }>
  >([]);
  const [hourlySessionDuration, setHourlySessionDuration] = useState<HourlySessionDuration[]>([]);
  const [hourlyProductivity, setHourlyProductivity] = useState<HourlyProductivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Sincronizar estado local cuando cambian los searchParams (ej: navegación con botones del browser)
  useEffect(() => {
    const fromParam = searchParams?.get("from");
    const toParam = searchParams?.get("to");

    if (fromParam) {
      setStartDate(fromParam.split("T")[0]);
    }
    if (toParam) {
      setEndDate(toParam.split("T")[0]);
    }
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

  // Cargar datos cuando cambian las fechas o el contractor
  useEffect(() => {
    const loadActivity = async () => {
      if (!contractorId || !startDate || !endDate) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [
          metric,
          contractorSessions,
          contractorSessionsByDay,
          sessionDurationData,
          hourlyProductivityData,
        ] = await Promise.all([
          adtService.getRealtimeMetrics(contractorId, undefined, true, startDate, endDate),
          adtService.getContractorSessions(contractorId, startDate, endDate),
          adtService.getContractorSessionsByDay(contractorId, startDate, endDate),
          adtService.getHourlySessionDuration(contractorId, startDate, endDate, 30, 8, 17),
          adtService.getHourlyProductivity(contractorId, startDate, endDate, 30, 8, 18),
        ]);

        if (metric) {
          setActivity(transformRealtimeMetricsToUserActivity(metric));
        }
        setSessions(contractorSessions);
        setSessionsByDay(contractorSessionsByDay);
        setHourlySessionDuration(sessionDurationData);
        setHourlyProductivity(hourlyProductivityData);
      } catch (error) {
        console.error("Error loading activity details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [contractorId, startDate, endDate, transformRealtimeMetricsToUserActivity]);

  // Transformar datos de la API al formato esperado por el gráfico
  const hourlyData = useMemo(() => {
    return hourlySessionDuration.map((h) => ({
      hour: h.hour_label,
      productivity: 0, // No se usa en el gráfico actual
      duration: Math.round((h.avg_duration_seconds / 3600) * 100) / 100, // Convertir segundos a horas (decimal)
    }));
  }, [hourlySessionDuration]);

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

  const handleBack = () => {
    router.push(`/${locale}/app/${basePath}/reports`);
  };

  // Obtener fecha máxima (hoy)
  const maxDate = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

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
    return <div className="p-8">{t("loading")}</div>;
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
            <Button
              variant="primary"
              style={{
                background: "#9CA3AF",
                color: "#FFFFFF",
                fontSize: "14px",
                padding: "7px 21px",
                height: "35px",
                fontWeight: 600,
              }}
              className="text-sm shrink-0 ml-2"
            >
              <FileText className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t("exportPdf")}</span>
              <span className="sm:hidden">PDF</span>
            </Button>
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
            {/* Device Selector - Full Width on Mobile */}
            <div className="w-full bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] px-[15px] py-[10px] flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors h-[56px] min-w-0">
              <div className="flex items-center gap-[5px] min-w-0 flex-1">
                <Laptop className="w-[25px] h-[25px] text-black shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-[#6D6D6D] mb-0 truncate">Current Device</p>
                  <p className="text-[14px] font-medium text-black truncate">Agent VM-Dev-01</p>
                </div>
              </div>
              <ChevronDown className="w-6 h-6 text-black shrink-0 ml-2" />
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
              {usageDistribution.distribution.length > 0 && (
                <div className="mt-8 pt-4 border-t border-gray-100">
                  <p className="text-[12px] font-semibold mb-2 text-black">
                    {t("usageDistribution")}
                  </p>
                  <div className="h-2 w-full rounded-full flex overflow-hidden mb-4">
                    {usageDistribution.distribution.map((item) => (
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
                    {usageDistribution.distribution.map((item) => (
                      <div key={item.type} className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: item.color }}
                        />
                        <span className="text-[12px] font-medium text-black">
                          {item.type} ({item.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
            <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-5 flex flex-col gap-6 min-w-0 overflow-hidden">
              <h3 className="text-xl font-semibold text-black">{t("modal.sessionConnectivity")}</h3>
              <div className="flex flex-col gap-5 w-full min-w-0">
                <div className="w-full min-w-0">
                  <ProductivityDurationChart hourlyData={hourlyData} />
                </div>
                <div className="w-full min-w-0">
                  <HourlyProductivityChart hourlyData={hourlyProductivity} />
                </div>
              </div>
            </div>

            {/* Session Summary - Mobile Version */}
            {sessionsByDay.length > 0 ? (
              sessionsByDay.map((dayGroup) => (
                <div
                  key={dayGroup.session_day}
                  className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-5 min-w-0 overflow-hidden"
                >
                  <SessionSummaryMobile sessions={dayGroup.sessions} date={dayGroup.session_day} />
                </div>
              ))
            ) : (
              <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-5 min-w-0">
                <p className="text-base text-gray-500 text-center">{t("noSessionsAvailable")}</p>
              </div>
            )}
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
                <div className="flex-1 bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors min-w-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Laptop className="w-7 h-7 text-black shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-[#6D6D6D]">{t("currentDevice")}</p>
                      <p className="text-base font-medium text-black truncate">Agent VM-Dev-01</p>
                    </div>
                  </div>
                  <ChevronDown className="w-6 h-6 text-black shrink-0 ml-2" />
                </div>
              </div>

              {/* Time Breakdown */}
              <div className="min-w-0 overflow-hidden">
                <TimeBreakdown activity={activity} t={t} />
              </div>

              {/* Session & Connectivity */}
              <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-5 flex flex-col gap-6 min-w-0">
                <h3 className="text-xl font-semibold text-black">
                  {t("modal.sessionConnectivity")}
                </h3>
                <div className="flex flex-col md:flex-row gap-5 w-full min-w-0">
                  <div className="flex-1 min-w-0">
                    <ProductivityDurationChart hourlyData={hourlyData} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <HourlyProductivityChart hourlyData={hourlyProductivity} />
                  </div>
                </div>
              </div>

              {/* Session Summary - Desktop Version */}
              <div className="flex flex-col gap-5 min-w-0">
                <h3 className="text-xl font-semibold text-black">{t("sessionSummary")}</h3>
                {sessionsByDay.length > 0 ? (
                  sessionsByDay.map((dayGroup) => (
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
                      <SessionSummaryTable
                        sessions={dayGroup.sessions}
                        date={dayGroup.session_day}
                      />
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-5">
                    <p className="text-base text-gray-500 text-center">
                      {t("noSessionsAvailable")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-5 w-full lg:w-[335px] shrink-0 min-w-0">
              <div className="min-w-0 overflow-hidden">
                <InputTotals activity={activity} t={t} />
              </div>
              <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] p-5 min-w-0 overflow-hidden">
                <TopApplications activity={activity} t={t} />

                {usageDistribution.distribution.length > 0 && (
                  <div className="mt-8 pt-4 border-t border-gray-100">
                    <p className="text-[12px] font-semibold mb-2 text-black">
                      {t("usageDistribution")}
                    </p>

                    {/* Barra de distribución dinámica */}
                    <div className="h-2 w-full rounded-full flex overflow-hidden mb-4">
                      {usageDistribution.distribution.map((item) => (
                        <div
                          key={item.type}
                          style={{
                            backgroundColor: item.color,
                            width: `${item.percentage}%`,
                            minWidth: item.percentage > 0 ? "2px" : "0", // Mínimo visible
                          }}
                          title={`${item.type}: ${item.percentage}%`}
                        />
                      ))}
                    </div>

                    {/* Leyenda dinámica */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {usageDistribution.distribution.map((item) => (
                        <div key={item.type} className="flex items-center gap-1.5">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: item.color }}
                          />
                          <span className="text-[12px] font-medium text-black">
                            {item.type} ({item.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
