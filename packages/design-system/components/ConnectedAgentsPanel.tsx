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

const COMPACT_STATUS_LABEL_KEYS: Record<DeviceStatus, string> = {
  ONLINE: "statusShort.online",
  OFFLINE: "statusShort.offline",
  SUSPENDED: "statusShort.suspended",
  UNKNOWN: "statusShort.unknown",
  DISABLED: "statusShort.disabled",
};

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
  const visibleOnline = compact ? onlineAgents.slice(0, 4) : onlineAgents;
  const hiddenOnlineCount = Math.max(onlineAgents.length - visibleOnline.length, 0);

  const openDeviceStatus = () => {
    router.push(`/${locale}/app/${role}/roles`);
  };

  const renderStatusChips = (dense: boolean) => (
    <div className={dense ? "flex flex-wrap gap-1.5" : "grid grid-cols-2 md:grid-cols-5 gap-3"}>
      {STATUS_ORDER.map((status) => {
        const display = getDeviceStatusDisplay(status, locale);
        const label = dense ? t(COMPACT_STATUS_LABEL_KEYS[status]) : display.label;

        return (
          <div
            key={status}
            className={
              dense
                ? "inline-flex items-center gap-1.5 rounded-md px-2 py-1"
                : "rounded-[10px] p-3 text-left"
            }
            style={{
              border: "1px solid rgba(166,166,166,0.4)",
              background: display.background,
            }}
            title={display.label}
          >
            <span
              className={`font-bold ${dense ? "text-sm leading-none" : "text-2xl"}`}
              style={{ color: display.color }}
            >
              {loading ? "—" : summary[status]}
            </span>
            <span
              className={`font-medium ${dense ? "text-[10px] leading-tight" : "text-xs"}`}
              style={{ color: display.color }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );

  const renderOnlineList = (dense: boolean) => (
    <div className={dense ? "min-w-0 flex-1" : undefined}>
      <h3 className={`font-semibold text-black ${dense ? "text-xs mb-1.5" : "text-[16px] mb-3"}`}>
        {t("onlineList")}
      </h3>
      {loading ? (
        <p className="text-xs py-2 text-center" style={{ color: "#64748B" }}>
          {t("loading")}
        </p>
      ) : onlineAgents.length === 0 ? (
        <p className="text-xs py-2 text-center" style={{ color: "#64748B" }}>
          {t("noOnline")}
        </p>
      ) : (
        <div
          className={`flex flex-col overflow-y-auto ${
            dense ? "gap-1 max-h-[88px]" : "gap-2 max-h-[320px]"
          }`}
        >
          {visibleOnline.map((agent) => {
            const lastSeen = formatLastHeartbeat(agent.last_heartbeat ?? null, locale);
            return (
              <div
                key={agent.id}
                className={`flex items-center justify-between gap-2 rounded-[6px] ${
                  dense ? "px-2 py-1" : "px-3 py-2 rounded-[8px]"
                }`}
                style={{
                  border: "1px solid rgba(166,166,166,0.3)",
                  background: "#FFFFFF",
                }}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={`font-semibold text-black truncate ${
                      dense ? "text-[11px] leading-tight" : "text-sm"
                    }`}
                  >
                    {agent.contractor?.name ?? "—"}
                  </p>
                  <p className="text-[10px] truncate leading-tight" style={{ color: "#6d6d6d" }}>
                    {agent.hostname ?? "—"}
                    {lastSeen ? ` · ${lastSeen}` : ""}
                  </p>
                </div>
                {!dense && (
                  <span
                    className="shrink-0 inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ background: "#D1FAE5", color: "#065F46" }}
                  >
                    {getDeviceStatusDisplay("ONLINE", locale).label}
                  </span>
                )}
              </div>
            );
          })}
          {hiddenOnlineCount > 0 && (
            <button
              type="button"
              onClick={openDeviceStatus}
              className="text-[11px] font-medium text-left py-0.5 cursor-pointer"
              style={{ color: "#0097B2" }}
            >
              {t("moreOnline", { count: hiddenOnlineCount })}
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (compact) {
    return (
      <div
        className={`bg-white border border-[rgba(166,166,166,0.5)] rounded-[10px] shadow-[0px_4px_4px_rgba(166,166,166,0.25)] w-full p-3 ${className ?? ""}`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <Monitor className="w-4 h-4 shrink-0" style={{ color: "#0097B2" }} />
            <div className="min-w-0">
              <h2 className="font-bold text-black text-sm leading-tight">{t("title")}</h2>
              <p className="text-[11px] truncate leading-tight" style={{ color: "#64748B" }}>
                {t("subtitle", { connected: summary.ONLINE, total: totalLinked })}
                {!loading && (
                  <span className="ml-1 font-medium" style={{ color: "#0097B2" }}>
                    · {connectedPct}%
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="inline-flex items-center justify-center w-7 h-7 rounded-md cursor-pointer disabled:cursor-not-allowed"
                style={{
                  border: "1px solid rgba(166,166,166,0.5)",
                  color: "#475569",
                  background: "#FFFFFF",
                }}
                aria-label={t("refresh")}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            )}
            <button
              type="button"
              onClick={openDeviceStatus}
              className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer whitespace-nowrap"
              style={{ background: "#0097B2", color: "#FFFFFF" }}
            >
              {t("viewAll")}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-3">
          <div className="md:w-[42%] md:shrink-0">{renderStatusChips(true)}</div>
          <div className="md:flex-1 md:min-w-0 md:border-l md:pl-3 border-[rgba(166,166,166,0.25)]">
            {renderOnlineList(true)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border border-[rgba(166,166,166,0.5)] rounded-[10px] shadow-[0px_4px_4px_rgba(166,166,166,0.25)] w-full p-5 md:p-6 ${className ?? ""}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <Monitor className="w-6 h-6 shrink-0" style={{ color: "#0097B2" }} />
          <div>
            <h2 className="font-bold text-[20px] text-black">{t("title")}</h2>
            <p className="text-sm" style={{ color: "#64748B" }}>
              {t("subtitle", { connected: summary.ONLINE, total: totalLinked })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm cursor-pointer disabled:cursor-not-allowed"
              style={{
                border: "1px solid rgba(166,166,166,0.5)",
                color: "#475569",
                background: "#FFFFFF",
              }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {t("refresh")}
            </button>
          )}
          <button
            type="button"
            onClick={openDeviceStatus}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer"
            style={{ background: "#0097B2", color: "#FFFFFF" }}
          >
            {t("viewAll")}
          </button>
        </div>
      </div>

      <div className="mb-5">{renderStatusChips(false)}</div>

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

      {renderOnlineList(false)}
    </div>
  );
}
