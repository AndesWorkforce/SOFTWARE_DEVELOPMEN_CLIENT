"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Monitor, RefreshCw } from "lucide-react";

import type { Agent, DeviceStatus } from "@/packages/types/agents.types";
import {
  resolveDeviceStatus,
  getDeviceStatusDisplay,
  formatLastHeartbeat,
} from "@/packages/utils/device-status.utils";

export interface ConnectedAgentsPanelProps {
  agents: Agent[];
  loading?: boolean;
  role?: "super-admin" | "admin";
  onRefresh?: () => void;
  className?: string;
  /** Vista densa para caber junto a gauges/rankings en el dashboard */
  compact?: boolean;
}

const STATUS_ORDER: DeviceStatus[] = ["ONLINE", "OFFLINE", "SUSPENDED", "UNKNOWN", "DISABLED"];

export function ConnectedAgentsPanel({
  agents,
  loading = false,
  role = "super-admin",
  onRefresh,
  className,
  compact = false,
}: ConnectedAgentsPanelProps) {
  const t = useTranslations("dashboard.agentsConnectivity");
  const locale = useLocale();
  const router = useRouter();

  const linkedAgents = useMemo(
    () => agents.filter((agent) => agent.contractor_id != null),
    [agents],
  );

  const summary = useMemo(() => {
    const counts: Record<DeviceStatus, number> = {
      ONLINE: 0,
      OFFLINE: 0,
      SUSPENDED: 0,
      UNKNOWN: 0,
      DISABLED: 0,
    };
    for (const agent of linkedAgents) {
      counts[resolveDeviceStatus(agent)]++;
    }
    return counts;
  }, [linkedAgents]);

  const onlineAgents = useMemo(
    () =>
      linkedAgents
        .filter((agent) => resolveDeviceStatus(agent) === "ONLINE")
        .sort((a, b) => {
          const nameA = a.contractor?.name ?? a.hostname ?? "";
          const nameB = b.contractor?.name ?? b.hostname ?? "";
          return nameA.localeCompare(nameB);
        }),
    [linkedAgents],
  );

  const totalLinked = linkedAgents.length;
  const connectedPct = totalLinked > 0 ? Math.round((summary.ONLINE / totalLinked) * 100) : 0;
  const visibleOnline = compact ? onlineAgents.slice(0, 6) : onlineAgents;
  const hiddenOnlineCount = Math.max(onlineAgents.length - visibleOnline.length, 0);

  const openDeviceStatus = () => {
    router.push(`/${locale}/app/${role}/roles`);
  };

  return (
    <div
      className={`bg-white border border-[rgba(166,166,166,0.5)] rounded-[10px] shadow-[0px_4px_4px_rgba(166,166,166,0.25)] w-full ${
        compact ? "p-4" : "p-5 md:p-6"
      } ${className ?? ""}`}
    >
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${
          compact ? "mb-3" : "mb-5 gap-3"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Monitor
            className={`${compact ? "w-5 h-5" : "w-6 h-6"} shrink-0`}
            style={{ color: "#0097B2" }}
          />
          <div className="min-w-0">
            <h2 className={`font-bold text-black ${compact ? "text-[16px]" : "text-[20px]"}`}>
              {t("title")}
            </h2>
            <p
              className={`truncate ${compact ? "text-xs" : "text-sm"}`}
              style={{ color: "#64748B" }}
            >
              {t("subtitle", { connected: summary.ONLINE, total: totalLinked })}
              {!loading && (
                <span className="ml-1 font-medium" style={{ color: "#0097B2" }}>
                  · {connectedPct}%
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs cursor-pointer disabled:cursor-not-allowed"
              style={{
                border: "1px solid rgba(166,166,166,0.5)",
                color: "#475569",
                background: "#FFFFFF",
              }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              {t("refresh")}
            </button>
          )}
          <button
            type="button"
            onClick={openDeviceStatus}
            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer"
            style={{ background: "#0097B2", color: "#FFFFFF" }}
          >
            {t("viewAll")}
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-5 gap-2 ${compact ? "mb-3" : "mb-5 gap-3"}`}>
        {STATUS_ORDER.map((status) => {
          const display = getDeviceStatusDisplay(status, locale);
          return (
            <div
              key={status}
              className={`rounded-[8px] text-left ${compact ? "p-2" : "p-3 rounded-[10px]"}`}
              style={{
                border: "1px solid rgba(166,166,166,0.4)",
                background: display.background,
              }}
            >
              <p
                className={`font-bold ${compact ? "text-lg leading-tight" : "text-2xl"}`}
                style={{ color: display.color }}
              >
                {loading ? "—" : summary[status]}
              </p>
              <p
                className={`font-medium truncate ${compact ? "text-[10px]" : "text-xs"}`}
                style={{ color: display.color }}
                title={display.label}
              >
                {display.label}
              </p>
            </div>
          );
        })}
      </div>

      {!compact && (
        <div
          className="mb-4 rounded-[10px] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          style={{ background: "#F8FAFC", border: "1px solid rgba(166,166,166,0.25)" }}
        >
          <p className="text-sm" style={{ color: "#475569" }}>
            {t("connectedRate")}
          </p>
          <p className="text-lg font-semibold" style={{ color: "#0097B2" }}>
            {loading ? "—" : `${connectedPct}%`}
            <span className="text-sm font-normal ml-2" style={{ color: "#64748B" }}>
              ({summary.ONLINE}/{totalLinked})
            </span>
          </p>
        </div>
      )}

      <div>
        <h3 className={`font-semibold text-black mb-2 ${compact ? "text-sm" : "text-[16px] mb-3"}`}>
          {t("onlineList")}
        </h3>
        {loading ? (
          <p className="text-sm py-4 text-center" style={{ color: "#64748B" }}>
            {t("loading")}
          </p>
        ) : onlineAgents.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: "#64748B" }}>
            {t("noOnline")}
          </p>
        ) : (
          <div
            className={`flex flex-col gap-1.5 overflow-y-auto ${
              compact ? "max-h-[168px]" : "max-h-[320px] gap-2"
            }`}
          >
            {visibleOnline.map((agent) => {
              const lastSeen = formatLastHeartbeat(agent.last_heartbeat ?? null, locale);
              return (
                <div
                  key={agent.id}
                  className={`flex items-center justify-between gap-2 rounded-[8px] ${
                    compact ? "px-2.5 py-1.5" : "px-3 py-2"
                  }`}
                  style={{
                    border: "1px solid rgba(166,166,166,0.3)",
                    background: "#FFFFFF",
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-semibold text-black truncate ${compact ? "text-xs" : "text-sm"}`}
                    >
                      {agent.contractor?.name ?? "—"}
                    </p>
                    <p className="text-[10px] truncate" style={{ color: "#6d6d6d" }}>
                      {agent.hostname ?? "—"}
                      {agent.type ? ` · ${agent.type}` : ""}
                      {lastSeen ? ` · ${lastSeen}` : ""}
                    </p>
                  </div>
                  <span
                    className="shrink-0 inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ background: "#D1FAE5", color: "#065F46" }}
                  >
                    {getDeviceStatusDisplay("ONLINE", locale).label}
                  </span>
                </div>
              );
            })}
            {hiddenOnlineCount > 0 && (
              <button
                type="button"
                onClick={openDeviceStatus}
                className="text-xs font-medium text-left py-1 cursor-pointer"
                style={{ color: "#0097B2" }}
              >
                {t("moreOnline", { count: hiddenOnlineCount })}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
