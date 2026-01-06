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
          {t("modal.topApplications") || "Top Applications"}
        </h5>
        <div className="flex flex-col gap-[10px] items-start w-full">
          {activity.metrics?.appUsage && activity.metrics.appUsage.length > 0 ? (
            activity.metrics.appUsage.slice(0, 5).map((app, index) => (
              <div key={index} className="flex items-center justify-between w-full">
                <div className="flex gap-[10px] items-center shrink-0">
                  <span className="text-[15px]" style={{ width: "15px", height: "15px" }}>
                    {getAppIcon(app.appName)}
                  </span>
                  <span
                    className="text-[12px] font-light leading-normal whitespace-nowrap"
                    style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
                  >
                    {app.appName}
                  </span>
                </div>
                <span
                  className="text-[12px] font-light leading-normal whitespace-nowrap"
                  style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
                >
                  {formatSecondsToTime(app.seconds)}
                </span>
              </div>
            ))
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
