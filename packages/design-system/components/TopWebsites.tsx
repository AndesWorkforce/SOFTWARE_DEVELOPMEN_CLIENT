"use client";
import { useMemo } from "react";
import { Globe } from "lucide-react";
import type { UserActivity } from "@/packages/types/reports.types";

export interface TopWebsitesProps {
  activity: UserActivity;
  t: (key: string) => string;
}

export const TopWebsites = ({ activity, t }: TopWebsitesProps) => {
  const formatSecondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`;
  };

  // Format domain for display (remove protocol, www, etc.)
  const formatDomain = (domain: string): string => {
    let formatted = domain
      .replace(/^(https?:\/\/)?(www\.)?/, '')
      .replace(/\/$/, '');
    
    // Truncate if too long
    if (formatted.length > 30) {
      formatted = formatted.substring(0, 27) + '...';
    }
    
    return formatted;
  };

  // Get only browser usage data
  const browserUsage = useMemo(() => {
    let browsers: Array<{ domain: string; seconds: number }> = [];
    
    if (activity.metrics?.browserUsage) {
      if (Array.isArray(activity.metrics.browserUsage)) {
        // Si es un array, mapear directamente
        browsers = activity.metrics.browserUsage.map((b: any) => {
          const seconds = typeof b.seconds === 'number' ? b.seconds : 0;
          return {
            domain: b.domain || b.appName || '',
            seconds: (isNaN(seconds) || !isFinite(seconds)) ? 0 : seconds,
          };
        });
      } else {
        // Si es un objeto, convertir a array
        browsers = Object.entries(activity.metrics.browserUsage).map(([domain, seconds]) => {
          const secs = typeof seconds === 'number' ? seconds : 0;
          return {
            domain: domain,
            seconds: (isNaN(secs) || !isFinite(secs)) ? 0 : secs,
          };
        });
      }
    }
    
    // Filtrar y validar que todos tengan seconds válidos
    return browsers
      .filter((item) => item.seconds > 0 && item.domain)
      .sort((a, b) => b.seconds - a.seconds);
  }, [activity.metrics?.browserUsage]);

  return (
    <div className="flex flex-col gap-[15px] items-start">
      <h5
        className="text-[20px] font-semibold leading-normal mb-0 w-full"
        style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
      >
        {t("modal.topWebsites") || "Top Websites"}
      </h5>
      <div className="flex flex-col gap-[15px] items-start w-full">
        {browserUsage.length > 0 ? (
          browserUsage.map((site, index) => (
            <div key={index} className="flex items-center justify-between w-full">
              <div className="flex gap-[10px] items-center min-w-0 flex-1">
                <Globe className="w-[16px] h-[16px] text-black shrink-0" />
                <span
                  className="text-[14px] font-light leading-normal truncate"
                  style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
                  title={site.domain}
                >
                  {formatDomain(site.domain)}
                </span>
              </div>
              <span
                className="text-[14px] font-light leading-normal whitespace-nowrap ml-2"
                style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
              >
                {formatSecondsToTime(site.seconds)}
              </span>
            </div>
          ))
        ) : (
          <p
            className="text-[12px] text-center py-4 w-full"
            style={{ color: "#9CA3AF", fontFamily: "Inter, sans-serif" }}
          >
            {t("modal.noWebsiteData") || "No website data available"}
          </p>
        )}
      </div>
    </div>
  );
};

