"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button, DataTable, FilterPanel, Header } from "@/packages/design-system";
import { Download } from "lucide-react";
import {
  reportsService,
  type UserActivity,
  type FilterOptions,
} from "@/packages/api/reports/reports.service";
import type { FilterPanelConfig, FilterValues } from "@/packages/types/FilterPanel.types";
import type { DataTableConfig } from "@/packages/types/DataTable.types";

export default function ReportsPage() {
  const t = useTranslations("reports");
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<FilterValues>({
    dateRange: {
      start: new Date().toISOString().split("T")[0],
      end: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  // Configuración base de filtros
  const baseFiltersConfig: FilterPanelConfig = {
    filters: [
      {
        key: "dateRange",
        type: "dateRange",
        label: "Date",
        translationKey: "reports.date",
        defaultValue: {
          start: new Date().toISOString().split("T")[0],
          end: new Date().toISOString().split("T")[0],
        },
        minWidth: "260px",
      },
      {
        key: "userId",
        type: "select",
        label: "User",
        translationKey: "reports.user",
        options: [],
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
    clearButtonLabel: "Clean Filters",
  };

  const filtersConfig = useMemo(() => {
    const selectPlaceholder = { value: "", label: "Select..." };
    return {
      ...baseFiltersConfig,
      filters: baseFiltersConfig.filters.map((filter) => {
        if (filter.key === "userId") {
          return { ...filter, options: [selectPlaceholder, ...(filterOptions?.users || [])] };
        }
        if (filter.key === "country") {
          return { ...filter, options: [selectPlaceholder, ...(filterOptions?.countries || [])] };
        }
        if (filter.key === "clientId") {
          return { ...filter, options: [selectPlaceholder, ...(filterOptions?.clients || [])] };
        }
        if (filter.key === "teamId") {
          return { ...filter, options: [selectPlaceholder, ...(filterOptions?.teams || [])] };
        }
        if (filter.key === "jobPosition") {
          return {
            ...filter,
            options: [selectPlaceholder, ...(filterOptions?.jobPositions || [])],
          };
        }
        return filter;
      }),
    };
  }, [filterOptions, t, baseFiltersConfig]);

  // Configuración base de tabla
  const baseTableConfig: DataTableConfig<UserActivity> = {
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
        title: "Activity",
        translationKey: "reports.table.activity",
        dataPath: "activityPercentage",
        type: "percentage",
        width: "100px",
        align: "center",
        config: {
          percentage: {
            thresholds: [{ value: 50, color: "#2EC36D" }],
            defaultColor: "#FF0004",
          },
        },
      },
      {
        key: "activityDetail",
        title: "Activity Detail",
        translationKey: "reports.table.activityDetail",
        dataPath: "id",
        type: "action",
        width: "120px",
        align: "center",
        config: {
          action: {
            label: "View Detail",
            onClick: () => {},
          },
        },
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
          label: "Activity",
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
  };

  const tableConfig = useMemo(() => {
    return {
      ...baseTableConfig,
      columns: baseTableConfig.columns.map((col) =>
        col.key === "activityDetail"
          ? {
              ...col,
              config: {
                ...col.config,
                action: {
                  onClick: col.config?.action?.onClick || (() => {}),
                  label: t("viewDetail"),
                  icon: col.config?.action?.icon,
                  variant: col.config?.action?.variant,
                },
              },
            }
          : col,
      ),
    };
  }, [t, baseTableConfig]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [activities, options] = await Promise.all([
        reportsService.getActivityToday(),
        reportsService.getFilterOptions(),
      ]);

      setActivities(activities);
      setFilterOptions(options);
    } catch (error) {
      console.error("Error loading reports data:", error);
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

  return (
    <>
      <Header userName="User" />
      <div
        className="p-4 md:p-8 min-h-screen"
        style={{ background: "#FFFFFF", paddingTop: "75px" }}
      >
        <div className="max-w-full">
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

          <FilterPanel
            config={filtersConfig}
            initialValues={filters}
            onChange={setFilters}
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
