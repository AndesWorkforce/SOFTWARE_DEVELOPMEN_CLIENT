"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button, Select, DateRangePicker, ActivityDetailModal } from "@/packages/design-system";
import { Download, ListFilter, List, ChevronDown, ChevronRight } from "lucide-react";
import {
  type ReportFilters,
  type UserActivity,
  type FilterOptions,
} from "@/packages/api/reports/reports.service";
import { adtService, type RealtimeMetrics } from "@/packages/api/adt/adt.service";
import type { AxiosError } from "axios";

export default function ReportsPage() {
  const t = useTranslations("reports");
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      start: new Date().toISOString().split("T")[0],
      end: new Date().toISOString().split("T")[0],
    },
  });
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<UserActivity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetail = (activity: UserActivity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  /**
   * Convierte segundos a formato HH:MM:SS
   */
  const formatSecondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  /**
   * Transforma RealtimeMetrics a UserActivity
   * Usa los campos enriquecidos que vienen del backend (contractor_name, client_name, team_name, etc.)
   */
  const transformRealtimeMetricsToUserActivity = (metrics: RealtimeMetrics[]): UserActivity[] => {
    return metrics.map((metric) => ({
      id: metric.contractor_id,
      user: {
        id: metric.contractor_id,
        name: metric.contractor_name || `Contractor ${metric.contractor_id.slice(-6)}`,
        email: metric.contractor_email || `${metric.contractor_id}@example.com`,
      },
      jobPosition: metric.job_position || "N/A",
      client: {
        id: metric.client_id || "unknown",
        name: metric.client_name || "N/A",
      },
      team: {
        id: metric.team_id || "unknown",
        name: metric.team_name || "N/A",
      },
      country: metric.country || "N/A",
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
        effectiveWorkSeconds: metric.effective_work_seconds,
        productivityScore: metric.productivity_score,
        appUsage: metric.app_usage,
        browserUsage: metric.browser_usage,
      },
    }));
  };

  /**
   * Extrae las opciones de filtros de los datos de métricas
   */
  const extractFilterOptionsFromMetrics = (metrics: RealtimeMetrics[]): FilterOptions => {
    const usersMap = new Map<string, string>();
    const countriesSet = new Set<string>();
    const clientsMap = new Map<string, string>();
    const teamsMap = new Map<string, string>();
    const jobPositionsSet = new Set<string>();

    metrics.forEach((metric) => {
      // Users
      if (metric.contractor_name && metric.contractor_id) {
        usersMap.set(metric.contractor_id, metric.contractor_name);
      }

      // Countries
      if (metric.country) {
        countriesSet.add(metric.country);
      }

      // Clients
      if (metric.client_id && metric.client_name) {
        clientsMap.set(metric.client_id, metric.client_name);
      }

      // Teams
      if (metric.team_id && metric.team_name) {
        teamsMap.set(metric.team_id, metric.team_name);
      }

      // Job Positions
      if (metric.job_position) {
        jobPositionsSet.add(metric.job_position);
      }
    });

    return {
      users: Array.from(usersMap.entries()).map(([value, label]) => ({ value, label })),
      countries: Array.from(countriesSet)
        .sort()
        .map((country) => ({ value: country, label: country })),
      clients: Array.from(clientsMap.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, label]) => ({ value, label })),
      teams: Array.from(teamsMap.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, label]) => ({ value, label })),
      jobPositions: Array.from(jobPositionsSet)
        .sort()
        .map((position) => ({ value: position, label: position })),
    };
  };

  // Cargar opciones de filtros una vez al inicio (sin filtros para obtener todas las opciones)
  useEffect(() => {
    loadFilterOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recargar datos cuando cambian los filtros
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.dateRange?.start,
    filters.dateRange?.end,
    filters.userId,
    filters.country,
    filters.clientId,
    filters.teamId,
    filters.jobPosition,
  ]);

  /**
   * Carga las opciones de filtros obteniendo todos los datos sin filtros
   * Intenta obtener datos de un rango amplio para tener más opciones disponibles
   */
  const loadFilterOptions = async () => {
    try {
      console.log("🔄 Cargando opciones de filtros...");

      // Intentar obtener datos de un rango amplio (últimos 30 días) para tener más opciones
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const fromDate = thirtyDaysAgo.toISOString().split("T")[0];
      const toDate = today.toISOString().split("T")[0];

      console.log(`📅 Buscando datos desde ${fromDate} hasta ${toDate}`);

      const allMetrics = await adtService.getAllRealtimeMetrics({
        from: fromDate,
        to: toDate,
        useCache: true,
      });

      console.log(`📊 Métricas obtenidas para filtros: ${allMetrics?.length || 0} registros`);

      // Extraer opciones de filtros
      const extractedOptions = extractFilterOptionsFromMetrics(allMetrics || []);

      console.log("📋 Opciones extraídas:", {
        users: extractedOptions.users.length,
        countries: extractedOptions.countries.length,
        clients: extractedOptions.clients.length,
        teams: extractedOptions.teams.length,
        jobPositions: extractedOptions.jobPositions.length,
      });

      // Establecer las opciones extraídas
      setFilterOptions(extractedOptions);
    } catch (error) {
      console.error("❌ Error loading filter options:", error);
      // En caso de error, establecer opciones vacías
      setFilterOptions({
        users: [],
        countries: [],
        clients: [],
        teams: [],
        jobPositions: [],
      });
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Construir filtros para la API ADT
      const adtFilters: {
        from?: string;
        to?: string;
        name?: string;
        country?: string;
        client_id?: string;
        team_id?: string;
        job_position?: string;
        useCache?: boolean;
      } = {
        useCache: true,
      };

      // Si hay rango de fechas, usar from/to
      if (filters.dateRange?.start && filters.dateRange?.end) {
        adtFilters.from = filters.dateRange.start;
        adtFilters.to = filters.dateRange.end;
      } else if (filters.dateRange?.start) {
        // Si solo hay fecha de inicio, usar como rango de un día
        adtFilters.from = filters.dateRange.start;
        adtFilters.to = filters.dateRange.start;
      } else {
        // Si no hay fecha establecida, usar la fecha de hoy como rango de un día
        const today = new Date().toISOString().split("T")[0];
        adtFilters.from = today;
        adtFilters.to = today;
      }

      // Aplicar filtros adicionales (solo si tienen valor)
      if (filters.userId && filters.userId.trim() !== "") {
        // Buscar el nombre del usuario por ID desde las opciones de filtros
        const selectedUser = filterOptions?.users.find((u) => u.value === filters.userId);
        if (selectedUser && selectedUser.label) {
          adtFilters.name = selectedUser.label.trim();
        }
      }

      if (filters.country && filters.country.trim() !== "") {
        adtFilters.country = filters.country.trim();
      }

      if (filters.clientId && filters.clientId.trim() !== "") {
        adtFilters.client_id = filters.clientId.trim();
      }

      if (filters.teamId && filters.teamId.trim() !== "") {
        adtFilters.team_id = filters.teamId.trim();
      }

      if (filters.jobPosition && filters.jobPosition.trim() !== "") {
        adtFilters.job_position = filters.jobPosition.trim();
      }

      // Log para depuración
      console.log("🔍 ADT Filters:", adtFilters);

      // Obtener métricas en tiempo real desde ADT con filtros
      let realtimeMetrics: RealtimeMetrics[];
      try {
        realtimeMetrics = await adtService.getAllRealtimeMetrics(adtFilters);
      } catch (error) {
        const apiError = error as AxiosError;
        console.error("❌ Error en la llamada a la API:", apiError);
        console.error("❌ Detalles del error:", {
          message: apiError?.message,
          response: apiError?.response?.data,
          status: apiError?.response?.status,
          statusText: apiError?.response?.statusText,
        });
        throw apiError;
      }

      // Log para depuración
      console.log("📊 Realtime Metrics recibidos:", realtimeMetrics?.length || 0, "registros");
      console.log("📊 Tipo de datos:", typeof realtimeMetrics, Array.isArray(realtimeMetrics));
      if (realtimeMetrics && realtimeMetrics.length > 0) {
        console.log("📋 Primer registro de ejemplo:", realtimeMetrics[0]);
      } else {
        console.warn("⚠️ No se recibieron métricas o el array está vacío");
      }

      // Verificar que realtimeMetrics sea un array válido
      if (!Array.isArray(realtimeMetrics)) {
        console.error("⚠️ La respuesta no es un array:", realtimeMetrics);
        setActivities([]);
        return;
      }

      // Transformar a formato UserActivity
      const transformedActivities = transformRealtimeMetricsToUserActivity(realtimeMetrics);

      console.log("✅ Actividades transformadas:", transformedActivities?.length || 0, "registros");
      if (transformedActivities && transformedActivities.length > 0) {
        console.log("📋 Primera actividad transformada:", transformedActivities[0]);
      }

      // Actualizar las opciones de filtros con los datos actuales
      // Esto asegura que siempre tengamos opciones disponibles basadas en los datos mostrados
      if (realtimeMetrics && realtimeMetrics.length > 0) {
        const currentOptions = extractFilterOptionsFromMetrics(realtimeMetrics);

        // Combinar con las opciones existentes para no perder opciones de otros rangos de fechas
        setFilterOptions((prevOptions) => {
          if (!prevOptions) {
            return currentOptions;
          }

          // Combinar usuarios (evitar duplicados)
          const usersMap = new Map(prevOptions.users.map((u) => [u.value, u]));
          currentOptions.users.forEach((u) => usersMap.set(u.value, u));

          // Combinar países
          const countriesSet = new Set([
            ...prevOptions.countries.map((c) => c.value),
            ...currentOptions.countries.map((c) => c.value),
          ]);

          // Combinar clientes
          const clientsMap = new Map(prevOptions.clients.map((c) => [c.value, c]));
          currentOptions.clients.forEach((c) => clientsMap.set(c.value, c));

          // Combinar equipos
          const teamsMap = new Map(prevOptions.teams.map((t) => [t.value, t]));
          currentOptions.teams.forEach((t) => teamsMap.set(t.value, t));

          // Combinar cargos
          const jobPositionsSet = new Set([
            ...prevOptions.jobPositions.map((j) => j.value),
            ...currentOptions.jobPositions.map((j) => j.value),
          ]);

          return {
            users: Array.from(usersMap.values()).sort((a, b) => a.label.localeCompare(b.label)),
            countries: Array.from(countriesSet)
              .sort()
              .map((c) => ({ value: c, label: c })),
            clients: Array.from(clientsMap.values()).sort((a, b) => a.label.localeCompare(b.label)),
            teams: Array.from(teamsMap.values()).sort((a, b) => a.label.localeCompare(b.label)),
            jobPositions: Array.from(jobPositionsSet)
              .sort()
              .map((j) => ({ value: j, label: j })),
          };
        });
      }

      setActivities(transformedActivities);
    } catch (error) {
      console.error("❌ Error loading reports data:", error);
      // En caso de error, establecer actividades vacías
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ReportFilters, value: string | undefined) => {
    setFilters((prev: ReportFilters) => ({
      ...prev,
      [key]: value,
    }));
    // Los datos se recargarán automáticamente por el useEffect que observa los filtros
  };

  const handleDateRangeChange = (start: string, end: string) => {
    setFilters((prev: ReportFilters) => ({
      ...prev,
      dateRange: { start, end },
    }));
    // Los datos se recargarán automáticamente por el useEffect que observa los filtros
  };

  const handleClearFilters = () => {
    setFilters({
      dateRange: {
        start: new Date().toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0],
      },
    });
  };

  return (
    <>
      <div className="p-4 md:p-8 min-h-screen" style={{ background: "#FFFFFF" }}>
        <div className="max-w-full">
          {/* Page Title and Export Button */}
          <div className="mb-6 md:mb-8 flex items-center justify-between">
            <h1 className="text-xl md:text-3xl font-bold" style={{ color: "#000000" }}>
              {t("title")}
            </h1>
            <Button
              variant="primary"
              style={{
                background: "#0097B2",
                color: "#FFFFFF",
                fontSize: "14px",
                padding: "7px 21px",
                height: "35px",
              }}
            >
              <Download className="w-3.5 h-3.5 md:w-5 md:h-5 mr-2" />
              <span className="hidden md:inline">{t("exportPdf")}</span>
              <span className="md:hidden">Export PDF</span>
            </Button>
          </div>

          {/* Filters Panel */}
          <div
            className="mb-6 md:mb-8 rounded-[10px] p-6 md:p-6"
            style={{
              background: "#FFFFFF",
              color: "#000000",
              border: "1px solid rgba(166,166,166,0.5)",
              boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
            }}
          >
            <div className="flex items-center gap-2 mb-4 md:mb-4">
              <ListFilter className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-lg font-semibold" style={{ color: "#000000" }}>
                {t("applyFilters")}
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
              {/* Date Range */}
              <div className="flex-shrink-0" style={{ minWidth: "260px" }}>
                <DateRangePicker
                  label={t("date")}
                  startDate={filters.dateRange?.start || ""}
                  endDate={filters.dateRange?.end || ""}
                  onStartDateChange={(start) =>
                    handleDateRangeChange(start, filters.dateRange?.end || start)
                  }
                  onEndDateChange={(end) =>
                    handleDateRangeChange(filters.dateRange?.start || end, end)
                  }
                />
              </div>

              {/* User + Country row on mobile */}
              <div className="flex gap-3 w-full">
                {/* User */}
                <div className="flex-1" style={{ minWidth: "0" }}>
                  <Select
                    label={t("user")}
                    value={filters.userId || ""}
                    onChange={(e) => handleFilterChange("userId", e.target.value || undefined)}
                    options={[{ value: "", label: "Select..." }, ...(filterOptions?.users || [])]}
                    className="text-black"
                  />
                </div>

                {/* Country */}
                <div className="flex-1" style={{ minWidth: "0" }}>
                  <Select
                    label={t("country")}
                    value={filters.country || ""}
                    onChange={(e) => handleFilterChange("country", e.target.value || undefined)}
                    options={[
                      { value: "", label: "Select..." },
                      ...(filterOptions?.countries || []),
                    ]}
                    className="text-black"
                  />
                </div>
              </div>

              {/* Client + Team row on mobile */}
              <div className="flex gap-3 w-full">
                {/* Client */}
                <div className="flex-1" style={{ minWidth: "0" }}>
                  <Select
                    label={t("client")}
                    value={filters.clientId || ""}
                    onChange={(e) => handleFilterChange("clientId", e.target.value || undefined)}
                    options={[{ value: "", label: "Select..." }, ...(filterOptions?.clients || [])]}
                    className="text-black"
                  />
                </div>

                {/* Team */}
                <div className="flex-1" style={{ minWidth: "0" }}>
                  <Select
                    label={t("team")}
                    value={filters.teamId || ""}
                    onChange={(e) => handleFilterChange("teamId", e.target.value || undefined)}
                    options={[{ value: "", label: "Select..." }, ...(filterOptions?.teams || [])]}
                    className="text-black"
                  />
                </div>
              </div>

              {/* Job Position + Clean filters row on mobile */}
              <div className="flex gap-3 w-full">
                {/* Job Position */}
                <div className="flex-1" style={{ minWidth: "0" }}>
                  <Select
                    label={t("jobPosition")}
                    value={filters.jobPosition || ""}
                    onChange={(e) => handleFilterChange("jobPosition", e.target.value || undefined)}
                    options={[
                      { value: "", label: "Select..." },
                      ...(filterOptions?.jobPositions || []),
                    ]}
                    className="text-black"
                  />
                </div>

                {/* Clean filters button */}
                <div className="flex-1" style={{ minWidth: "0" }}>
                  <div className="h-full flex items-end">
                    <Button
                      variant="danger"
                      onClick={handleClearFilters}
                      style={{
                        background: "#FF0004",
                        color: "#FFFFFF",
                        width: "100%",
                        fontSize: "12px",
                        padding: "9px 16px",
                        height: "35px",
                      }}
                    >
                      {t("cleanFilters")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Today Section */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: "#000000" }}>
              {t("activityToday")}
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : activities.length === 0 ? (
              <div
                className="rounded-lg shadow-md p-12 text-center"
                style={{ background: "#FFFFFF" }}
              >
                <p style={{ color: "#000000" }}>{t("noActivities")}</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div
                  className="hidden md:block rounded-lg shadow-md overflow-hidden"
                  style={{ background: "#FFFFFF" }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed" style={{ tableLayout: "fixed" }}>
                      <thead>
                        <tr>
                          <th
                            className="px-6 py-3 text-center text-base font-semibold"
                            style={{ color: "#000000", width: "200px" }}
                          >
                            {t("table.user")}
                          </th>
                          <th
                            className="px-6 py-3 text-center text-base font-semibold"
                            style={{ color: "#000000", width: "200px" }}
                          >
                            {t("table.jobPosition")}
                          </th>
                          <th
                            className="px-6 py-3 text-center text-base font-semibold"
                            style={{ color: "#000000", width: "160px" }}
                          >
                            {t("table.client")}
                          </th>
                          <th
                            className="px-6 py-3 text-center text-base font-semibold"
                            style={{ color: "#000000", width: "120px" }}
                          >
                            {t("table.team")}
                          </th>
                          <th
                            className="px-6 py-3 text-center text-base font-semibold"
                            style={{ color: "#000000", width: "150px" }}
                          >
                            {t("table.country")}
                          </th>
                          <th
                            className="px-6 py-3 text-center text-base font-semibold"
                            style={{ color: "#000000", width: "100px" }}
                          >
                            {t("table.time")}
                          </th>
                          <th
                            className="px-6 py-3 text-center text-base font-semibold"
                            style={{ color: "#000000", width: "100px" }}
                          >
                            {t("table.activity")}
                          </th>
                          <th
                            className="px-6 py-3 text-center text-base font-semibold"
                            style={{ color: "#000000", width: "100px", whiteSpace: "normal" }}
                          >
                            {t("table.activityDetail")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {activities.map((activity, index) => {
                          const getActivityStyle = (percentage: number) => {
                            return {
                              color: percentage >= 50 ? "#2EC36D" : "#FF0004",
                              fontWeight: 700,
                            } as React.CSSProperties;
                          };

                          const isEvenRow = index % 2 === 1;

                          return (
                            <tr
                              key={activity.id}
                              style={{
                                background: isEvenRow ? "#E2E2E2" : "#FFFFFF",
                                borderBottom: "none",
                              }}
                            >
                              <td
                                className="px-6 py-4 whitespace-nowrap text-base text-center"
                                style={{ color: "#000000", width: "200px" }}
                              >
                                {activity.user.name}
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-base text-center"
                                style={{ color: "#000000", width: "200px" }}
                              >
                                {activity.jobPosition}
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-base text-center"
                                style={{ color: "#000000", width: "160px" }}
                              >
                                {activity.client.name}
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-base text-center"
                                style={{ color: "#000000", width: "120px" }}
                              >
                                {activity.team.name}
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-base text-center"
                                style={{ color: "#000000", width: "150px" }}
                              >
                                {activity.country}
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-base font-semibold text-center"
                                style={{ color: "#000000", width: "100px" }}
                              >
                                {activity.timeWorked}
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-base text-center"
                                style={{ width: "100px" }}
                              >
                                <span style={getActivityStyle(activity.activityPercentage)}>
                                  {activity.activityPercentage}%
                                </span>
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-base text-center"
                                style={{ color: "#000000", width: "100px" }}
                              >
                                <button
                                  onClick={() => handleViewDetail(activity)}
                                  className="mx-auto inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
                                >
                                  <List className="w-3.5 h-3.5" />
                                  <span className="underline text-sm">{t("viewDetail")}</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div
                  className="md:hidden rounded-[10px] overflow-hidden"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(166,166,166,0.5)",
                    boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
                  }}
                >
                  {activities.map((activity, index) => {
                    const isExpanded = expandedCardId === activity.id;
                    const isEvenRow = index % 2 === 1;
                    const getActivityStyle = (percentage: number) =>
                      ({
                        color: percentage >= 50 ? "#2EC36D" : "#FF0004",
                        fontWeight: 700,
                      }) as React.CSSProperties;

                    return (
                      <div
                        key={activity.id}
                        style={{ background: isEvenRow ? "#E2E2E2" : "#FFFFFF" }}
                        className="p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-1">
                              <span
                                className="font-semibold"
                                style={{ color: "#000000", fontSize: "16px" }}
                              >
                                User:{" "}
                              </span>
                              <span style={{ color: "#000000", fontSize: "16px" }}>
                                {activity.user.name}
                              </span>
                            </div>
                            <div className="mb-1">
                              <span
                                className="font-semibold"
                                style={{ color: "#000000", fontSize: "16px" }}
                              >
                                Job Position:{" "}
                              </span>
                              <span style={{ color: "#000000", fontSize: "16px" }}>
                                {activity.jobPosition}
                              </span>
                            </div>

                            {isExpanded && (
                              <>
                                <div className="mb-1">
                                  <span
                                    className="font-semibold"
                                    style={{ color: "#000000", fontSize: "16px" }}
                                  >
                                    Team:{" "}
                                  </span>
                                  <span style={{ color: "#000000", fontSize: "16px" }}>
                                    {activity.team.name}
                                  </span>
                                </div>
                                <div className="mb-1">
                                  <span
                                    className="font-semibold"
                                    style={{ color: "#000000", fontSize: "16px" }}
                                  >
                                    Country:{" "}
                                  </span>
                                  <span style={{ color: "#000000", fontSize: "16px" }}>
                                    {activity.country}
                                  </span>
                                </div>
                                <div className="mb-1">
                                  <span
                                    className="font-semibold"
                                    style={{ color: "#000000", fontSize: "16px" }}
                                  >
                                    Time:{" "}
                                  </span>
                                  <span
                                    style={{ color: "#000000", fontSize: "16px", fontWeight: 600 }}
                                  >
                                    {activity.timeWorked}
                                  </span>
                                </div>
                                <div className="mb-1">
                                  <span
                                    className="font-semibold"
                                    style={{ color: "#000000", fontSize: "16px" }}
                                  >
                                    Activity:{" "}
                                  </span>
                                  <span style={getActivityStyle(activity.activityPercentage)}>
                                    {activity.activityPercentage}%
                                  </span>
                                </div>
                                <div className="mb-1">
                                  <span
                                    className="font-semibold"
                                    style={{ color: "#000000", fontSize: "16px" }}
                                  >
                                    Activity Detail:{" "}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleViewDetail(activity)}
                                  className="flex items-center gap-1 mt-2 ml-16"
                                >
                                  <List className="w-3.5 h-3.5" />
                                  <span className="underline text-sm" style={{ color: "#000000" }}>
                                    View
                                  </span>
                                </button>
                              </>
                            )}
                          </div>
                          <button
                            onClick={() => setExpandedCardId(isExpanded ? null : activity.id)}
                            className="ml-2 flex-shrink-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5" style={{ color: "#000000" }} />
                            ) : (
                              <ChevronRight className="w-5 h-5" style={{ color: "#000000" }} />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de detalle de actividad */}
      <ActivityDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        activity={selectedActivity}
        t={t}
      />
    </>
  );
}
