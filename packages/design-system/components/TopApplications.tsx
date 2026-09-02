"use client";
import type { UserActivity } from "@/packages/types/reports.types";

export interface TopApplicationsProps {
  activity: UserActivity;
  t: (key: string) => string;
}

export const TopApplications = ({ activity, t }: TopApplicationsProps) => {
  const formatSecondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`;
  };

  const getCategoryBadge = (category?: string | null) => {
    if (category === "productive") return { label: "✅", color: "#16a34a" };
    if (category === "neutral") return { label: "⚪", color: "#6b7280" };
    if (category === "non_productive") return { label: "❌", color: "#dc2626" };
    return { label: "⚠️", color: "#d97706" };
  };

  // Get app icon based on app name
  const getAppIcon = (appName: string) => {
    const lowerName = appName.toLowerCase();
    if (lowerName.includes("code") || lowerName.includes("vscode")) {
      return "💻";
    }
    if (lowerName.includes("chrome") || lowerName.includes("browser")) {
      return "🌐";
    }
    if (lowerName.includes("figma")) {
      return "🎨";
    }
    if (lowerName.includes("slack")) {
      return "💬";
    }
    if (lowerName.includes("teams")) {
      return "📞";
    }
    return "📱";
  };

  // Ocultar entradas con menos de 1 minuto (se mostrarían como 00h 00m)
  const sortedAppUsage = [...(activity.metrics?.appUsage ?? [])]
    .filter((app) => (app.seconds ?? 0) >= 60)
    .sort((a, b) => (b.seconds ?? 0) - (a.seconds ?? 0));

  // El titulo de la tarjeta es "Top Sites & Apps" pero solo se dibujaban las
  // apps: `browserUsage` nunca se referenciaba, asi que los dominios visitados
  // no aparecian en ningun lado de la vista.
  const sortedBrowserUsage = [...(activity.metrics?.browserUsage ?? [])]
    .filter((site) => (site.seconds ?? 0) >= 60)
    .sort((a, b) => (b.seconds ?? 0) - (a.seconds ?? 0));

  const hasAnyUsage = sortedAppUsage.length > 0 || sortedBrowserUsage.length > 0;

  return (
    <div
      className="px-[17px] py-[28px] rounded-[5px]"
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(166, 166, 166, 0.5)",
      }}
    >
      <div className="flex flex-col gap-[15px] items-start">
        <h5
          className="text-[16px] font-semibold leading-normal mb-0 w-full"
          style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
        >
          {t("modal.topApplications") || "Top Sites & Apps"}
        </h5>
        <div className="w-full max-h-[420px] overflow-y-auto flex flex-col gap-4">
          {sortedAppUsage.length > 0 && (
            <div className="w-full">
              <p
                className="text-[12px] font-semibold uppercase tracking-wide mb-2"
                style={{ color: "#6B7280", fontFamily: "Inter, sans-serif" }}
              >
                {t("modal.applications") || "Aplicaciones"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 w-full">
                {sortedAppUsage.map((app, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 flex items-center gap-2 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-base shrink-0 leading-none">
                      {getAppIcon(app.appName)}
                    </span>
                    <p
                      className="text-[12px] font-medium leading-tight truncate min-w-0 flex-1 mb-0"
                      style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
                      title={app.appName}
                    >
                      {app.appName}
                    </p>
                    <span
                      className="text-[11px] shrink-0 leading-none"
                      title={app.category ?? "Sin clasificar"}
                    >
                      {getCategoryBadge(app.category).label}
                    </span>
                    <span
                      className="text-[12px] font-semibold shrink-0 tabular-nums"
                      style={{ color: "#0097B2", fontFamily: "Inter, sans-serif" }}
                    >
                      {formatSecondsToTime(app.seconds)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sortedBrowserUsage.length > 0 && (
            <div className="w-full">
              <p
                className="text-[12px] font-semibold uppercase tracking-wide mb-2"
                style={{ color: "#6B7280", fontFamily: "Inter, sans-serif" }}
              >
                {t("modal.sites") || "Sitios"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 w-full">
                {sortedBrowserUsage.map((site, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 flex items-center gap-2 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-base shrink-0 leading-none">🌐</span>
                    <p
                      className="text-[12px] font-medium leading-tight truncate min-w-0 flex-1 mb-0"
                      style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
                      title={site.domain}
                    >
                      {site.domain}
                    </p>
                    <span
                      className="text-[12px] font-semibold shrink-0 tabular-nums"
                      style={{ color: "#0097B2", fontFamily: "Inter, sans-serif" }}
                    >
                      {formatSecondsToTime(site.seconds)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!hasAnyUsage && (
            <p
              className="text-[12px] text-center py-4 w-full"
              style={{ color: "#9CA3AF", fontFamily: "Inter, sans-serif" }}
            >
              {t("modal.noApplicationData") || "No application data available"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
