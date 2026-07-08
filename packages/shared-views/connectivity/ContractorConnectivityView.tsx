"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Monitor, RefreshCw } from "lucide-react";

import { Button, DataTable } from "../../design-system";
import type { DataTableConfig } from "../../design-system";
import { AgentsService } from "../../api/agents/agents.service";
import type { Agent, DeviceStatus } from "../../types/agents.types";
import {
  resolveDeviceStatus,
  getDeviceStatusDisplay,
  formatLastHeartbeat,
} from "../../utils/device-status.utils";

export interface ContractorConnectivityViewProps {
  role: "super-admin" | "admin";
}

const agentsService = new AgentsService();
const REFRESH_INTERVAL_MS = 60_000;

const STATUS_ORDER: Record<DeviceStatus, number> = {
  ONLINE: 0,
  SUSPENDED: 1,
  OFFLINE: 2,
  UNKNOWN: 3,
};

export const ContractorConnectivityView = ({ role }: ContractorConnectivityViewProps) => {
  const t = useTranslations("contractorConnectivity");
  const locale = useLocale();
  const router = useRouter();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | "ALL">("ALL");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await agentsService.getAll();
      const linked = data
        .filter((agent) => agent.contractor_id != null)
        .sort((a, b) => {
          const statusA = resolveDeviceStatus(a);
          const statusB = resolveDeviceStatus(b);
          const statusDiff = STATUS_ORDER[statusA] - STATUS_ORDER[statusB];
          if (statusDiff !== 0) return statusDiff;
          const nameA = a.contractor?.name ?? "";
          const nameB = b.contractor?.name ?? "";
          return nameA.localeCompare(nameB);
        });
      setAgents(linked);
      setLastUpdated(new Date());
    } catch (err) {
      setAgents([]);
      setError(err instanceof Error ? err.message : t("fetchError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadAgents();
    const interval = setInterval(loadAgents, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadAgents]);

  const filteredAgents = useMemo(() => {
    if (statusFilter === "ALL") return agents;
    return agents.filter((agent) => resolveDeviceStatus(agent) === statusFilter);
  }, [agents, statusFilter]);

  const summary = useMemo(() => {
    const counts: Record<DeviceStatus, number> = {
      ONLINE: 0,
      OFFLINE: 0,
      SUSPENDED: 0,
      UNKNOWN: 0,
    };
    for (const agent of agents) {
      counts[resolveDeviceStatus(agent)]++;
    }
    return counts;
  }, [agents]);

  const openReport = useCallback(
    (contractorId: string) => {
      router.push(`/${locale}/app/${role}/reports/detail/${contractorId}`);
    },
    [locale, role, router],
  );

  const tableConfig = useMemo((): DataTableConfig<Agent> => {
    return {
      columns: [
        {
          key: "contractor",
          title: t("table.contractor"),
          translationKey: "contractorConnectivity.table.contractor",
          dataPath: (row) => row.contractor?.name ?? "—",
          type: "text",
          minWidth: "180px",
          align: "center",
        },
        {
          key: "job_position",
          title: t("table.jobPosition"),
          translationKey: "contractorConnectivity.table.jobPosition",
          dataPath: (row) =>
            (row.contractor as { job_position?: string } | undefined)?.job_position ?? "—",
          type: "text",
          minWidth: "160px",
          align: "center",
        },
        {
          key: "hostname",
          title: t("table.hostname"),
          translationKey: "contractorConnectivity.table.hostname",
          dataPath: (row) => row.hostname ?? "—",
          type: "text",
          minWidth: "140px",
          align: "center",
        },
        {
          key: "type",
          title: t("table.type"),
          translationKey: "contractorConnectivity.table.type",
          dataPath: "type",
          type: "badge",
          minWidth: "100px",
          align: "center",
        },
        {
          key: "device_status",
          title: t("table.status"),
          translationKey: "contractorConnectivity.table.status",
          dataPath: "device_status",
          type: "custom",
          minWidth: "180px",
          align: "center",
          render: (_value, row) => {
            const status = resolveDeviceStatus(row);
            const display = getDeviceStatusDisplay(status, locale);
            const lastSeen = formatLastHeartbeat(row.last_heartbeat, locale);
            return (
              <div className="flex flex-col items-center gap-0.5">
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: display.background, color: display.color }}
                >
                  {display.label}
                </span>
                {lastSeen && (
                  <span className="text-[10px]" style={{ color: "#6B7280" }}>
                    {lastSeen}
                  </span>
                )}
              </div>
            );
          },
        },
        {
          key: "power_state",
          title: t("table.power"),
          translationKey: "contractorConnectivity.table.power",
          dataPath: (row) => {
            if (!row.power_state) return "—";
            if (row.power_state === "suspended") return t("power.suspended");
            if (row.power_state === "active") return t("power.active");
            return row.power_state;
          },
          type: "text",
          minWidth: "110px",
          align: "center",
        },
        {
          key: "action",
          title: t("table.action"),
          translationKey: "contractorConnectivity.table.action",
          dataPath: "id",
          type: "custom",
          minWidth: "120px",
          align: "center",
          render: (_value, row) =>
            row.contractor_id ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openReport(row.contractor_id!);
                }}
                className="text-[#0097B2] hover:underline text-sm cursor-pointer"
              >
                {t("table.viewReport")}
              </button>
            ) : null,
        },
      ],
      rowKey: "id",
      striped: true,
      evenRowColor: "#E2E2E2",
      oddRowColor: "#FFFFFF",
      emptyState: {
        message: t("noAgents"),
      },
      styles: {
        table: {
          border: "1px solid rgba(166,166,166,0.5)",
          boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
          borderRadius: "10px",
        },
        cell: {
          paddingTop: "4px",
          paddingBottom: "4px",
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
            key: "contractor",
            label: t("table.contractor"),
            dataPath: (row) => row.contractor?.name ?? "—",
          },
        ],
        expandedFields: [
          {
            key: "hostname",
            label: t("table.hostname"),
            dataPath: (row) => row.hostname ?? "—",
          },
          {
            key: "status",
            label: t("table.status"),
            dataPath: "id",
            render: (_value, row) => {
              const status = resolveDeviceStatus(row);
              const display = getDeviceStatusDisplay(status, locale);
              return (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: display.background, color: display.color }}
                >
                  {display.label}
                </span>
              );
            },
          },
          {
            key: "action",
            label: t("table.action"),
            dataPath: "id",
            render: (_value, row) =>
              row.contractor_id ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openReport(row.contractor_id!);
                  }}
                  className="text-[#0097B2] hover:underline text-sm cursor-pointer"
                >
                  {t("table.viewReport")}
                </button>
              ) : null,
          },
        ],
        expandable: true,
      },
    };
  }, [t, locale, openReport]);

  const filterOptions: { value: DeviceStatus | "ALL"; label: string }[] = [
    { value: "ALL", label: t("filters.all") },
    { value: "ONLINE", label: getDeviceStatusDisplay("ONLINE", locale).label },
    { value: "OFFLINE", label: getDeviceStatusDisplay("OFFLINE", locale).label },
    { value: "SUSPENDED", label: getDeviceStatusDisplay("SUSPENDED", locale).label },
    { value: "UNKNOWN", label: getDeviceStatusDisplay("UNKNOWN", locale).label },
  ];

  return (
    <div className="p-4 md:p-8 min-h-screen" style={{ background: "#FFFFFF" }}>
      <div className="max-w-full">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Monitor className="w-7 h-7 md:w-8 md:h-8" style={{ color: "#0097B2" }} />
            <div>
              <h1 className="text-xl md:text-3xl font-bold" style={{ color: "#000000" }}>
                {t("title")}
              </h1>
              <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                {t("subtitle")}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={loadAgents}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {t("refresh")}
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {(["ONLINE", "OFFLINE", "SUSPENDED", "UNKNOWN"] as DeviceStatus[]).map((status) => {
            const display = getDeviceStatusDisplay(status, locale);
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(statusFilter === status ? "ALL" : status)}
                className="rounded-[10px] p-3 text-left transition-opacity cursor-pointer"
                style={{
                  border:
                    statusFilter === status
                      ? "2px solid #0097B2"
                      : "1px solid rgba(166,166,166,0.4)",
                  background: display.background,
                  opacity: statusFilter === "ALL" || statusFilter === status ? 1 : 0.6,
                }}
              >
                <p className="text-2xl font-bold" style={{ color: display.color }}>
                  {summary[status]}
                </p>
                <p className="text-xs font-medium" style={{ color: display.color }}>
                  {display.label}
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer"
              style={{
                background: statusFilter === opt.value ? "#0097B2" : "#F1F5F9",
                color: statusFilter === opt.value ? "#FFFFFF" : "#475569",
              }}
            >
              {opt.label}
            </button>
          ))}
          {lastUpdated && (
            <span className="text-xs ml-auto" style={{ color: "#94A3B8" }}>
              {t("lastUpdated", {
                time: lastUpdated.toLocaleTimeString(locale === "es" ? "es-CO" : "en-US"),
              })}
            </span>
          )}
        </div>

        {error && (
          <div
            className="mb-4 p-3 rounded-lg text-sm"
            style={{ background: "#FEE2E2", color: "#991B1B" }}
          >
            {error}
          </div>
        )}

        <DataTable config={tableConfig} data={filteredAgents} loading={loading} />
      </div>
    </div>
  );
};
