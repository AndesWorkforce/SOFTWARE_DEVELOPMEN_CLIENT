"use client";
import type { UserActivity } from "@/packages/types/reports.types";

export interface ActivityDetailHeaderProps {
  activity: UserActivity;
  dateRange?: { from: string; to: string };
  t: (key: string) => string;
}

export const ActivityDetailHeader = ({ activity, dateRange, t }: ActivityDetailHeaderProps) => {
  const formatDateRange = () => {
    if (!dateRange) return activity.date;

    // Parsear fechas manualmente para evitar problemas de zona horaria
    // Las fechas vienen en formato YYYY-MM-DD
    const parseDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      // Crear fecha usando UTC para evitar conversiones de zona horaria
      return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    };

    const fromDate = parseDate(dateRange.from);
    const toDate = parseDate(dateRange.to);

    const fromStr = fromDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
    const toStr = toDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });

    if (fromStr === toStr) return fromStr;
    return `${fromStr} to ${toStr}`;
  };

  return (
    <div className="flex flex-col h-[51px]">
      <h4
        className="text-[20px] font-semibold leading-normal mb-0"
        style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
      >
        {t("modal.activityDetail") || "Activity Detail"}
      </h4>
      <p
        className="text-[14px] font-normal leading-normal"
        style={{ color: "#B6B4B4", fontFamily: "Inter, sans-serif" }}
      >
        {formatDateRange()}
      </p>
    </div>
  );
};
