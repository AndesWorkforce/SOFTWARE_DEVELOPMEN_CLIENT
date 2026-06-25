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
        <div className="w-full max-h-[600px] overflow-y-auto">
          {activity.metrics?.appUsage && activity.metrics.appUsage.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {activity.metrics.appUsage.map((app, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col gap-2 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-2xl shrink-0">{getAppIcon(app.appName)}</span>
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-[13px] font-medium leading-tight truncate"
                          style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
                          title={app.appName}
                        >
                          {app.appName}
                        </p>
                      </div>
                    </div>
                    <span className="text-base shrink-0" title={app.category ?? "Sin clasificar"}>
                      {getCategoryBadge(app.category).label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span
                      className="text-xs text-gray-500"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      Tiempo de uso
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "#0097B2", fontFamily: "Inter, sans-serif" }}
                    >
                      {formatSecondsToTime(app.seconds)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
