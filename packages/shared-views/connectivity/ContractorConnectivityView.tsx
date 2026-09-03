"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Monitor, RefreshCw } from "lucide-react";

import { Button, ContractorSearch, DataTable } from "../../design-system";
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
  DISABLED: 4,
};

/**
 * Estados que la vista ofrece.
 *
 * DISABLED queda afuera a proposito: `findAll` en USER_MS ya no devuelve
 * agentes deshabilitados, asi que su tarjeta marcaria siempre 0 y su filtro no
 * devolveria nada. Un control que no puede hacer nada es peor que no tenerlo.
 */
const VISIBLE_STATUSES: DeviceStatus[] = ["ONLINE", "OFFLINE", "SUSPENDED", "UNKNOWN"];

/** Un contratista con su agente vigente y el histórico detrás. */
interface ContractorGroup {
  contractorId: string;
  /** El agente más recientemente visto: representa el estado actual del equipo. */
  primary: Agent;
  /** Los demás agentes del contratista, de más a menos reciente. */
  others: Agent[];
  total: number;
}

/**
 * Instante en que se supo del agente por última vez, para ordenar por vigencia.
 * `last_heartbeat` manda porque describe actividad real; `created_at` es el
 * respaldo para agentes recién instalados que todavía no reportaron.
 */
const recency = (agent: Agent): number => {
  const beat = agent.last_heartbeat ? Date.parse(agent.last_heartbeat) : NaN;
  if (!Number.isNaN(beat)) return beat;
  const created = Date.parse(agent.created_at);
  return Number.isNaN(created) ? 0 : created;
};

export const ContractorConnectivityView = ({ role }: ContractorConnectivityViewProps) => {
  const t = useTranslations("contractorConnectivity");
  const locale = useLocale();
  const router = useRouter();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await agentsService.getAll();
      setAgents(data.filter((agent) => agent.contractor_id != null));
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

  /**
   * Un contratista puede tener varios agentes: cada reinstalación crea una fila
   * nueva y la anterior queda como histórico. Sin agrupar, la misma persona
   * aparecía repetida una vez por instalación (8 filas "Test Agent / TOMAS").
   *
   * Se agrupa por contratista y se muestra el agente MÁS RECIENTE como fila
   * principal: es el que refleja el estado real del equipo hoy. El resto queda
   * detrás de la expansión, accesible pero sin ruido.
   */
  const groups = useMemo((): ContractorGroup[] => {
    const byContractor = new Map<string, Agent[]>();
    for (const agent of agents) {
      const key = agent.contractor_id!;
      const list = byContractor.get(key);
      if (list) list.push(agent);
      else byContractor.set(key, [agent]);
    }

    const result: ContractorGroup[] = [];
    for (const [contractorId, list] of byContractor) {
      // "Más reciente" = último visto. Se prefiere last_heartbeat sobre
      // created_at porque un agente recién instalado que nunca reportó no
      // describe el estado del equipo tan bien como uno que sí lo hizo.
      const sorted = [...list].sort((a, b) => recency(b) - recency(a));
      const [primary, ...others] = sorted;
      result.push({ contractorId, primary, others, total: sorted.length });
    }

    return result.sort((a, b) => {
      const statusDiff =
        STATUS_ORDER[resolveDeviceStatus(a.primary)] - STATUS_ORDER[resolveDeviceStatus(b.primary)];
      if (statusDiff !== 0) return statusDiff;
      return (a.primary.contractor?.name ?? "").localeCompare(b.primary.contractor?.name ?? "");
    });
  }, [agents]);

  const filteredGroups = useMemo(() => {
    const byStatus =
      statusFilter === "ALL"
        ? groups
        : groups.filter((g) => resolveDeviceStatus(g.primary) === statusFilter);

    const term = search.trim().toLowerCase();
    if (!term) return byStatus;

    // Se busca por contratista, pero tambien por equipo: el equipo es el dato
    // que la gente tiene a mano cuando alguien reporta un problema, y con la
    // agrupacion los equipos secundarios no se ven hasta expandir. Sin
    // incluirlos, buscar el hostname de un equipo viejo no encontraria nada.
    return byStatus.filter((g) => {
      const name = g.primary.contractor?.name ?? "";
      const position =
        (g.primary.contractor as { job_position?: string } | undefined)?.job_position ?? "";
      const hostnames = [g.primary, ...g.others].map((a) => a.hostname ?? "").join(" ");
      return `${name} ${position} ${hostnames}`.toLowerCase().includes(term);
    });
  }, [groups, statusFilter, search]);

  /**
   * Los contadores cuentan CONTRATISTAS, no agentes: si contaran agentes no
   * cuadrarían con las filas visibles, que ahora son una por persona.
   */
  const summary = useMemo(() => {
    const counts: Record<DeviceStatus, number> = {
      ONLINE: 0,
      OFFLINE: 0,
      SUSPENDED: 0,
      UNKNOWN: 0,
      DISABLED: 0,
    };
    for (const group of groups) {
      counts[resolveDeviceStatus(group.primary)]++;
    }
    return counts;
  }, [groups]);

  const openReport = useCallback(
    (contractorId: string) => {
      router.push(`/${locale}/app/${role}/reports/detail/${contractorId}`);
    },
    [locale, role, router],
  );

  const tableConfig = useMemo((): DataTableConfig<ContractorGroup> => {
    return {
      columns: [
        {
          key: "contractor",
          title: t("table.contractor"),
          translationKey: "contractorConnectivity.table.contractor",
          dataPath: (row) => row.primary.contractor?.name ?? "—",
          type: "text",
          minWidth: "180px",
          align: "center",
        },
        {
          key: "job_position",
          title: t("table.jobPosition"),
          translationKey: "contractorConnectivity.table.jobPosition",
          dataPath: (row) =>
            (row.primary.contractor as { job_position?: string } | undefined)?.job_position ?? "—",
          type: "text",
          minWidth: "160px",
          align: "center",
        },
        {
          key: "hostname",
          title: t("table.hostname"),
          translationKey: "contractorConnectivity.table.hostname",
          dataPath: (row) => row.primary.hostname ?? "—",
          type: "custom",
          minWidth: "160px",
          render: (_value, row) => (
            <span className="inline-flex items-center gap-2">
              {row.primary.hostname ?? "—"}
              {row.others.length > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ background: "#E2E8F0", color: "#475569" }}
                  title={t("group.othersTooltip", { count: row.others.length })}
                >
                  +{row.others.length}
                </span>
              )}
            </span>
          ),
          align: "center",
        },
        {
          key: "type",
          title: t("table.type"),
          translationKey: "contractorConnectivity.table.type",
          dataPath: (row) => row.primary.type,
          type: "badge",
          minWidth: "100px",
          align: "center",
        },
        {
          key: "device_status",
          title: t("table.status"),
          translationKey: "contractorConnectivity.table.status",
          dataPath: (row) => row.primary.device_status ?? "",
          type: "custom",
          minWidth: "180px",
          align: "center",
          render: (_value, row) => {
            const status = resolveDeviceStatus(row.primary);
            const display = getDeviceStatusDisplay(status, locale);
            const lastSeen = formatLastHeartbeat(row.primary.last_heartbeat, locale);
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
            const power = row.primary.power_state;
            if (!power) return "—";
            if (power === "suspended") return t("power.suspended");
            if (power === "active") return t("power.active");
            return power;
          },
          type: "text",
          minWidth: "110px",
          align: "center",
        },
        {
          key: "action",
          title: t("table.action"),
          translationKey: "contractorConnectivity.table.action",
          dataPath: (row) => row.contractorId,
          type: "custom",
          minWidth: "120px",
          align: "center",
          render: (_value, row) =>
            row.contractorId ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openReport(row.contractorId);
                }}
                className="text-[#0097B2] hover:underline text-sm cursor-pointer"
              >
                {t("table.viewReport")}
              </button>
            ) : null,
        },
      ],
      rowKey: (row) => row.contractorId,
      // Solo expanden los contratistas que tienen mas de un agente: para los
      // demas no habria nada que revelar y el control seria ruido.
      expandableRows: {
        isExpandable: (row) => row.others.length > 0,
        toggleLabel: (row, isExpanded) => (isExpanded ? t("group.collapse") : t("group.expand")),
        render: (row) => (
          <div className="px-6 py-3" style={{ background: "#F8FAFC" }}>
            <p className="text-xs font-semibold mb-2" style={{ color: "#475569" }}>
              {t("group.previousAgents", { count: row.others.length })}
            </p>
            <div className="flex flex-col gap-1.5">
              {row.others.map((agent) => {
                const status = resolveDeviceStatus(agent);
                const display = getDeviceStatusDisplay(status, locale);
                const lastSeen = formatLastHeartbeat(agent.last_heartbeat, locale);
                return (
                  <div
                    key={agent.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
                    style={{ color: "#334155" }}
                  >
                    <span className="font-medium min-w-[140px]">{agent.hostname ?? "—"}</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ background: "#E2E8F0", color: "#475569" }}
                    >
                      {agent.type}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: display.background, color: display.color }}
                    >
                      {display.label}
                    </span>
                    {lastSeen && (
                      <span className="text-[11px]" style={{ color: "#94A3B8" }}>
                        {lastSeen}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ),
      },
      striped: true,
      evenRowColor: "#E2E2E2",
      oddRowColor: "#FFFFFF",
      emptyState: {
        // El mensaje depende de si hay busqueda activa: "no hay agentes" seria
        // falso cuando en realidad los hay pero no coinciden con el termino.
        message: search.trim() ? t("search.noResults", { term: search.trim() }) : t("noAgents"),
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
            dataPath: (row) => row.primary.contractor?.name ?? "—",
          },
        ],
        expandedFields: [
          {
            key: "hostname",
            label: t("table.hostname"),
            dataPath: (row) =>
              row.others.length > 0
                ? `${row.primary.hostname ?? "—"} (+${row.others.length})`
                : (row.primary.hostname ?? "—"),
          },
          {
            key: "status",
            label: t("table.status"),
            dataPath: (row) => row.contractorId,
            render: (_value, row) => {
              const status = resolveDeviceStatus(row.primary);
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
            dataPath: (row) => row.contractorId,
            render: (_value, row) =>
              row.contractorId ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openReport(row.contractorId);
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
  }, [t, locale, openReport, search]);

  const filterOptions: { value: DeviceStatus | "ALL"; label: string }[] = [
    { value: "ALL", label: t("filters.all") },
    ...VISIBLE_STATUSES.map((status) => ({
      value: status,
      label: getDeviceStatusDisplay(status, locale).label,
    })),
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
          {VISIBLE_STATUSES.map((status) => {
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

        <div className="mb-4 max-w-[420px]">
          <ContractorSearch
            value={search}
            onChange={setSearch}
            label={t("search.label")}
            placeholder={t("search.placeholder")}
            aria-label={t("search.label")}
          />
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

        <DataTable config={tableConfig} data={filteredGroups} loading={loading} />
      </div>
    </div>
  );
};
