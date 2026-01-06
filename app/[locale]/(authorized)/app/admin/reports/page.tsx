"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button, DataTable, FilterPanel } from "@/packages/design-system";
import { Download } from "lucide-react";
import {
  reportsService,
  type UserActivity,
  type FilterOptions,
} from "@/packages/api/reports/reports.service";
import type { FilterPanelConfig, FilterValues } from "@/packages/types/FilterPanel.types";
import type { DataTableConfig } from "@/packages/types/DataTable.types";
import type { SelectOption } from "@/packages/design-system";

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

  const filtersConfig = useMemo(() => {
    // Configuración base de filtros (diseño alineado con Figma)
    const baseFiltersConfig: FilterPanelConfig = {
      filters: [
        {
          key: "dateRange",
          type: "dateRange",
          label: t("date"),
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
          label: t("user"),
          translationKey: "reports.user",
          options: [],
        },
        {
          key: "country",
          type: "select",
          label: t("country"),
          translationKey: "reports.country",
          options: [],
        },
        {
          key: "clientId",
          type: "select",
          label: t("client"),
          translationKey: "reports.client",
          options: [],
        },
        {
          key: "teamId",
          type: "select",
          label: t("team"),
          translationKey: "reports.team",
          options: [],
        },
        {
          key: "jobPosition",
          type: "select",
          label: t("jobPosition"),
          translationKey: "reports.jobPosition",
          options: [],
        },
      ],
      layout: "row",
      showClearButton: true,
      clearButtonPosition: "end",
      styles: {
        panel: {
          padding: "31px 28px",
          marginBottom: "24px",
        },
        filterRow: {
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "10px",
        },
      },
    };

    const makePlaceholder = (key: string): SelectOption => {
      switch (key) {
        case "userId":
          return {
            value: "",
            label: t("selectUser") || "Select a user",
          };
        case "country":
          return {
            value: "",
            label: t("selectCountry") || "Select a country",
          };
        case "clientId":
          return {
            value: "",
            label: t("selectClient") || "Select a client",
          };
        case "teamId":
          return {
            value: "",
            label: t("selectTeam") || "Select a team",
          };
        case "jobPosition":
          return {
            value: "",
            label: t("selectJobPosition") || "Select a job position",
          };
        default:
          return {
            value: "",
            label: t("select") || "Select...",
          };
      }
    };

    return {
      ...baseFiltersConfig,
      filters: baseFiltersConfig.filters.map((filter) => {
        if (filter.key === "userId") {
          return {
            ...filter,
            options: [makePlaceholder("userId"), ...(filterOptions?.users || [])],
          };
        }
        if (filter.key === "country") {
          return {
            ...filter,
            options: [makePlaceholder("country"), ...(filterOptions?.countries || [])],
          };
        }
        if (filter.key === "clientId") {
          return {
            ...filter,
            options: [makePlaceholder("clientId"), ...(filterOptions?.clients || [])],
          };
        }
        if (filter.key === "teamId") {
          return {
            ...filter,
            options: [makePlaceholder("teamId"), ...(filterOptions?.teams || [])],
          };
        }
        if (filter.key === "jobPosition") {
          return {
            ...filter,
            options: [makePlaceholder("jobPosition"), ...(filterOptions?.jobPositions || [])],
          };
        }
        return filter;
      }),
    };
  }, [filterOptions, t]);

  const tableConfig = useMemo(() => {
    // Configuración base de tabla
    const baseTableConfig: DataTableConfig<UserActivity> = {
      columns: [
        {
          key: "user",
          title: t("table.user"),
          translationKey: "reports.table.user",
          dataPath: (row) => row.user.name,
          type: "text",
          width: "200px",
          align: "center",
        },
        {
          key: "jobPosition",
          title: t("table.jobPosition"),
          translationKey: "reports.table.jobPosition",
          dataPath: "jobPosition",
          type: "text",
          width: "200px",
          align: "center",
        },
        {
          key: "client",
          title: t("table.client"),
          translationKey: "reports.table.client",
          dataPath: (row) => row.client.name,
          type: "text",
          width: "160px",
          align: "center",
        },
        {
          key: "team",
          title: t("table.team"),
          translationKey: "reports.table.team",
          dataPath: (row) => row.team.name,
          type: "text",
          width: "120px",
          align: "center",
        },
        {
          key: "country",
          title: t("table.country"),
          translationKey: "reports.table.country",
          dataPath: "country",
          type: "text",
          width: "150px",
          align: "center",
        },
        {
          key: "timeWorked",
          title: t("table.time"),
          translationKey: "reports.table.time",
          dataPath: "timeWorked",
          type: "time",
          width: "100px",
          align: "center",
        },
        {
          key: "activityPercentage",
          title: t("table.activity"),
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
          title: t("table.activityDetail"),
          translationKey: "reports.table.activityDetail",
          dataPath: "id",
          type: "action",
          width: "120px",
          align: "center",
          config: {
            action: {
              label: t("viewDetail"),
              onClick: () => {},
            },
          },
        },
      ],
      rowKey: "id",
      striped: true,
      evenRowColor: "#E2E2E2",
      oddRowColor: "#FFFFFF",
      emptyState: {
        message: t("noActivities"),
      },
      styles: {
        table: {
          border: "1px solid rgba(166,166,166,0.5)",
          boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
          borderRadius: "10px",
        },
        mobileCard: {
          border: "1px solid rgba(166,166,166,0.5)",
          boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
          borderRadius: "10px",
        },
      },
      mobileConfig: {
        primaryFields: [
          {
            key: "user",
            label: t("table.user"),
            dataPath: (row) => row.user.name,
          },
          {
            key: "jobPosition",
            label: t("table.jobPosition"),
            dataPath: "jobPosition",
          },
        ],
        expandedFields: [
          {
            key: "client",
            label: t("table.client"),
            dataPath: (row) => row.client.name,
          },
          {
            key: "team",
            label: t("table.team"),
            dataPath: (row) => row.team.name,
          },
          {
            key: "country",
            label: t("table.country"),
            dataPath: "country",
          },
          {
            key: "timeWorked",
            label: t("table.time"),
            dataPath: "timeWorked",
          },
          {
            key: "activityPercentage",
            label: t("table.activity"),
            dataPath: "activityPercentage",
          },
        ],
        expandable: true,
      },
    };

    return baseTableConfig;
  }, [t]);

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
    <div className="p-4 md:p-8 min-h-screen" style={{ background: "#FFFFFF" }}>
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
              display: "flex",
              alignItems: "center",
              gap: "10px",
              borderRadius: "8px",
              boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
            }}
            className="md:text-[16px] h-[35px] md:h-[40px]"
          >
            <Download className="w-[14px] h-[14px] md:w-5 md:h-5" />
            <span className="font-semibold">{t("exportPdf")}</span>
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
  );
}
