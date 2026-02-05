"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, DataTable, FilterPanel } from "@/packages/design-system";
import { FileText, List } from "lucide-react";
import { adtService, type RealtimeMetrics } from "@/packages/api/adt/adt.service";
import type { FilterOptions, UserActivity } from "@/packages/api/reports/reports.service";
import type { FilterPanelConfig, FilterValues } from "@/packages/types/FilterPanel.types";
import type { DataTableConfig } from "@/packages/types/DataTable.types";

export default function ReportsPage() {
  const t = useTranslations("reports");
  const locale = useLocale();
  const router = useRouter();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({
    dateRange: {
      start: new Date().toISOString().split("T")[0],
      end: new Date().toISOString().split("T")[0],
    },
  });

  const dateRange =
    filters.dateRange && typeof filters.dateRange === "object" && !Array.isArray(filters.dateRange)
      ? filters.dateRange
      : undefined;

  const maxDate = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const handleFiltersChange = useCallback(
    (incomingFilters: FilterValues) => {
      setFilters((prevFilters) => {
        const next: FilterValues = { ...incomingFilters };

        const rawDateRange =
          incomingFilters.dateRange &&
          typeof incomingFilters.dateRange === "object" &&
          !Array.isArray(incomingFilters.dateRange)
            ? (incomingFilters.dateRange as { start?: string; end?: string })
            : undefined;

        if (rawDateRange) {
          let { start = "", end = "" } = rawDateRange;

          // Normalizar fechas vacías: si solo hay una, usarla para ambas
          if (start && !end) {
            end = start;
          } else if (!start && end) {
            start = end;
          }

          // No permitir fechas futuras
          if (start && start > maxDate) {
            start = maxDate;
          }
          if (end && end > maxDate) {
            end = maxDate;
          }

          // Asegurar que "to" nunca sea menor que "from"
          if (start && end && end < start) {
            end = start;
          }

          next.dateRange = { start, end };
        }

        // Evitar updates si no hay cambios reales (para no generar loops)
        if (JSON.stringify(next) === JSON.stringify(prevFilters)) {
          return prevFilters;
        }

        return next;
      });
    },
    [maxDate],
  );

  const handleViewDetail = useCallback(
    (activity: UserActivity) => {
      const from = dateRange?.start || activity.date || new Date().toISOString().split("T")[0];
      const to = dateRange?.end || activity.date || new Date().toISOString().split("T")[0];

      const detailPath = `/${locale}/app/admin/reports/detail/${activity.id}?from=${from}&to=${to}`;
      router.push(detailPath);
    },
    [locale, router, dateRange?.start, dateRange?.end],
  );

  const formatSecondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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
      activityPercentage: Math.round(metric.productivity_score),
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
    }));
  };

  const extractFilterOptionsFromMetrics = (metrics: RealtimeMetrics[]): FilterOptions => {
    const usersMap = new Map<string, string>();
    const countriesSet = new Set<string>();
    const clientsMap = new Map<string, string>();
    // Para equipos, guardar team_id -> { team_name, client_id }
    const teamsMap = new Map<string, { name: string; clientId: string }>();
    const jobPositionsSet = new Set<string>();

    metrics.forEach((metric) => {
      if (metric.contractor_name && metric.contractor_id) {
        usersMap.set(metric.contractor_id, metric.contractor_name);
      }
      if (metric.country) {
        countriesSet.add(metric.country);
      }
      if (metric.client_id && metric.client_name) {
        clientsMap.set(metric.client_id, metric.client_name);
      }
      if (metric.team_id && metric.team_name && metric.client_id) {
        teamsMap.set(metric.team_id, { name: metric.team_name, clientId: metric.client_id });
      }
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
      // Equipos incluyen parentValue para indicar a qué cliente pertenecen
      teams: Array.from(teamsMap.entries())
        .sort((a, b) => a[1].name.localeCompare(b[1].name))
        .map(([value, data]) => ({ value, label: data.name, parentValue: data.clientId })),
      jobPositions: Array.from(jobPositionsSet)
        .sort()
        .map((position) => ({ value: position, label: position })),
    };
  };

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadData();
  }, [
    dateRange?.start,
    dateRange?.end,
    filters.name,
    filters.country,
    filters.clientId,
    filters.teamId,
    filters.jobPosition,
  ]);

  const baseFiltersConfig: FilterPanelConfig = {
    filters: [
      {
        key: "dateRange",
        type: "dateRange",
        label: "Date",
        translationKey: "reports.date",
        defaultValue: {
          start: maxDate,
          end: maxDate,
        },
        minWidth: "260px",
        maxDate: maxDate,
      },
      {
        key: "name",
        type: "text",
        label: "User",
        translationKey: "reports.user",
        placeholder: "Search user here...",
      },
      {
        key: "country",
        type: "select",
        label: "Country",
        translationKey: "reports.country",
        options: [],
      },
      {
        key: "clientId",
        type: "select",
        label: "Client",
        translationKey: "reports.client",
        options: [],
      },
      {
        key: "teamId",
        type: "select",
        label: "Team",
        translationKey: "reports.team",
        options: [],
      },
      {
        key: "jobPosition",
        type: "select",
        label: "Job Position",
        translationKey: "reports.jobPosition",
        options: [],
      },
    ],
    layout: "row",
    showClearButton: true,
    clearButtonPosition: "end",
  };

  const filtersConfig = useMemo(() => {
    const selectPlaceholder = { value: "", label: "Select..." };

    return {
      ...baseFiltersConfig,
      filters: baseFiltersConfig.filters.map((filter) => {
        if (filter.key === "country") {
          return { ...filter, options: [selectPlaceholder, ...(filterOptions?.countries || [])] };
        }
        if (filter.key === "clientId") {
          return { ...filter, options: [selectPlaceholder, ...(filterOptions?.clients || [])] };
        }
        if (filter.key === "teamId") {
          return {
            ...filter,
            options: [selectPlaceholder, ...(filterOptions?.teams || [])],
            dependsOn: "clientId", // El filtro de equipos depende del filtro de cliente
          };
        }
        if (filter.key === "jobPosition") {
          return {
            ...filter,
            options: [selectPlaceholder, ...(filterOptions?.jobPositions || [])],
            dependsOn: "teamId", // El filtro de cargo depende del filtro de equipo
          };
        }
        return filter;
      }),
    };
  }, [filterOptions, baseFiltersConfig]);

  const loadFilterOptions = async () => {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const fromDate = thirtyDaysAgo.toISOString().split("T")[0];
      const toDate = today.toISOString().split("T")[0];

      const allMetrics = await adtService.getAllRealtimeMetrics({
        from: fromDate,
        to: toDate,
        useCache: true,
      });

      const extractedOptions = extractFilterOptionsFromMetrics(allMetrics || []);
      setFilterOptions(extractedOptions);
    } catch (error) {
      console.error("❌ Error loading filter options:", error);
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

      const adtFilters: {
        from?: string;
        to?: string;
        name?: string;
        country?: string;
        client_id?: string;
        team_id?: string;
        job_position?: string;
        useCache?: boolean;
      } = { useCache: true };

      if (dateRange?.start && dateRange?.end) {
        adtFilters.from = dateRange.start;
        adtFilters.to = dateRange.end;
      } else if (dateRange?.start) {
        adtFilters.from = dateRange.start;
        adtFilters.to = dateRange.start;
      } else {
        const today = new Date().toISOString().split("T")[0];
        adtFilters.from = today;
        adtFilters.to = today;
      }

      const name = typeof filters.name === "string" ? filters.name : "";
      const country = typeof filters.country === "string" ? filters.country : "";
      const clientId = typeof filters.clientId === "string" ? filters.clientId : "";
      const teamId = typeof filters.teamId === "string" ? filters.teamId : "";
      const jobPosition = typeof filters.jobPosition === "string" ? filters.jobPosition : "";

      // No enviar name al backend, lo filtraremos en el frontend para búsqueda parcial
      if (country) adtFilters.country = country.trim();
      if (clientId) adtFilters.client_id = clientId.trim();
      if (teamId) adtFilters.team_id = teamId.trim();
      if (jobPosition) adtFilters.job_position = jobPosition.trim();

      const realtimeMetrics = await adtService.getAllRealtimeMetrics(adtFilters);

      if (!Array.isArray(realtimeMetrics)) {
        setActivities([]);
        return;
      }

      // Filtrar por nombre parcialmente (búsqueda case-insensitive)
      let filteredMetrics = realtimeMetrics;
      if (name && name.trim() !== "") {
        const searchTerm = name.trim().toLowerCase();
        filteredMetrics = realtimeMetrics.filter((metric) => {
          const contractorName = (metric.contractor_name || "").toLowerCase();
          return contractorName.includes(searchTerm);
        });
      }

      const transformedActivities = transformRealtimeMetricsToUserActivity(filteredMetrics);

      // Usar todos los metrics (sin filtrar por nombre) para las opciones de filtros
      // pero mostrar solo los filtrados en la tabla
      if (realtimeMetrics.length > 0) {
        const currentOptions = extractFilterOptionsFromMetrics(realtimeMetrics);

        setFilterOptions((prevOptions) => {
          if (!prevOptions) return currentOptions;

          const usersMap = new Map(prevOptions.users.map((u) => [u.value, u]));
          currentOptions.users.forEach((u) => usersMap.set(u.value, u));

          const countriesSet = new Set([
            ...prevOptions.countries.map((c) => c.value),
            ...currentOptions.countries.map((c) => c.value),
          ]);

          const clientsMap = new Map(prevOptions.clients.map((c) => [c.value, c]));
          currentOptions.clients.forEach((c) => clientsMap.set(c.value, c));

          // Mantener parentValue al fusionar equipos
          const teamsMap = new Map(prevOptions.teams.map((t) => [t.value, t]));
          currentOptions.teams.forEach((t) => teamsMap.set(t.value, t));

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
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      dateRange: {
        start: new Date().toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0],
      },
    });
  };

  const buildExportUrl = () => {
    const params = new URLSearchParams();
    const from = dateRange?.start || new Date().toISOString().split("T")[0];
    const to = dateRange?.end || from;

    params.set("from", from);
    params.set("to", to);

    if (filters.name && typeof filters.name === "string") {
      params.set("userId", filters.name);
    }
    if (filters.country && typeof filters.country === "string") {
      params.set("country", filters.country);
    }
    if (filters.clientId && typeof filters.clientId === "string") {
      params.set("clientId", filters.clientId);
    }
    if (filters.teamId && typeof filters.teamId === "string") {
      params.set("teamId", filters.teamId);
    }
    if (filters.jobPosition && typeof filters.jobPosition === "string") {
      params.set("jobPosition", filters.jobPosition);
    }

    return `/${locale}/app/admin/reports/group?${params.toString()}`;
  };

  const baseTableConfig = useMemo<DataTableConfig<UserActivity>>(
    () => ({
      columns: [
        {
          key: "user",
          title: "User",
          translationKey: "reports.table.user",
          dataPath: (row) => row.user.name,
          type: "text",
          width: "200px",
          align: "center",
        },
        {
          key: "jobPosition",
          title: "Job Position",
          translationKey: "reports.table.jobPosition",
          dataPath: "jobPosition",
          type: "text",
          width: "200px",
          align: "center",
        },
        {
          key: "client",
          title: "Client",
          translationKey: "reports.table.client",
          dataPath: (row) => row.client.name,
          type: "text",
          width: "160px",
          align: "center",
        },
        {
          key: "team",
          title: "Team",
          translationKey: "reports.table.team",
          dataPath: (row) => row.team.name,
          type: "text",
          width: "120px",
          align: "center",
        },
        {
          key: "country",
          title: "Country",
          translationKey: "reports.table.country",
          dataPath: "country",
          type: "text",
          width: "150px",
          align: "center",
        },
        {
          key: "timeWorked",
          title: "Time",
          translationKey: "reports.table.time",
          dataPath: "timeWorked",
          type: "time",
          width: "100px",
          align: "center",
        },
        {
          key: "activityPercentage",
          title: "Productivity",
          translationKey: "reports.table.productivity",
          dataPath: "activityPercentage",
          type: "percentage",
          width: "100px",
          align: "center",
          config: {
            percentage: {
              thresholds: [
                { value: 65, color: "#0097B2" }, // Verde para >= 65%
                { value: 40, color: "#FF9800" }, // Naranja para 40-64%
              ],
              defaultColor: "#FF0004", // Rojo para < 40%
            },
          },
        },
        {
          key: "activityDetail",
          title: "Report Detail",
          translationKey: "reports.table.reportDetail",
          dataPath: "id",
          type: "custom",
          width: "100px",
          align: "center",
          render: (value, row) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetail(row as UserActivity);
              }}
              className="mx-auto inline-flex items-center gap-1.5 text-black hover:text-black transition-colors underline font-medium text-sm cursor-pointer"
            >
              <List className="w-3.5 h-3.5" />
              <span>{t("viewDetail")}</span>
            </button>
          ),
        },
      ],
      mobileConfig: {
        primaryFields: [
          {
            key: "user",
            label: "User",
            dataPath: (row) => row.user.name,
          },
          {
            key: "jobPosition",
            label: "Job Position",
            dataPath: "jobPosition",
          },
        ],
        expandedFields: [
          {
            key: "team",
            label: "Team",
            dataPath: (row) => row.team.name,
          },
          {
            key: "country",
            label: "Country",
            dataPath: "country",
          },
          {
            key: "timeWorked",
            label: "Time",
            dataPath: "timeWorked",
          },
          {
            key: "activityPercentage",
            label: "Productivity",
            dataPath: "activityPercentage",
          },
        ],
        expandable: true,
      },
      rowKey: "id",
      striped: true,
      evenRowColor: "#E2E2E2",
      oddRowColor: "#FFFFFF",
      emptyState: {
        message: t("noActivities"),
      },
    }),
    [handleViewDetail, t],
  );

  const tableConfig = useMemo(() => {
    return {
      ...baseTableConfig,
      columns: baseTableConfig.columns.map((col) =>
        col.key === "activityDetail"
          ? {
              ...col,
              title: "Report Detail",
              translationKey: "reports.table.reportDetail",
              type: "custom" as const,
              render: (value: unknown, row: UserActivity) => (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetail(row);
                  }}
                  className="mx-auto inline-flex items-center gap-1.5 text-black hover:text-black transition-colors underline font-medium text-sm cursor-pointer"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>{t("viewDetail")}</span>
                </button>
              ),
            }
          : col,
      ),
    };
  }, [t, handleViewDetail, baseTableConfig]);

  return (
    <>
      <div className="p-4 md:p-8 min-h-screen" style={{ background: "#FFFFFF" }}>
        <div className="max-w-full">
          <div className="mb-6 md:mb-8 flex items-center justify-between">
            <h1 className="text-xl md:text-3xl font-bold" style={{ color: "#000000" }}>
              {t("title")}
            </h1>
            <Link href={buildExportUrl()}>
              <Button
                variant="primary"
                style={{
                  background: "#0097B2",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  padding: "7px 21px",
                  height: "40px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                <span>{t("reportGenerator")}</span>
              </Button>
            </Link>
          </div>

          <FilterPanel
            config={filtersConfig}
            initialValues={filters}
            onChange={handleFiltersChange}
            onClear={handleClearFilters}
            loading={loading}
          />

          <DataTable
            config={tableConfig}
            data={activities}
            title={t("activityToday")}
            loading={loading}
          />
        </div>
      </div>
    </>
  );
}
