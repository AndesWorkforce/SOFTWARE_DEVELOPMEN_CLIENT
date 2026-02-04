"use client";
import type { UserActivity } from "@/packages/types/reports.types";

export interface TimeBreakdownProps {
  activity: UserActivity;
  t: (key: string) => string;
}

export const TimeBreakdown = ({ activity, t }: TimeBreakdownProps) => {
  const formatSecondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`;
  };

  // Obtener el tiempo total de sesión (usa el valor del backend directamente)
  const getTotalTime = () => {
    if (!activity.metrics) return "00h 00m";
    // Usar totalSessionTimeSeconds si está disponible, sino calcular desde beats (cada beat = 15 segundos)
    const totalSeconds =
      activity.metrics.totalSessionTimeSeconds || activity.metrics.totalBeats * 15;
    return formatSecondsToTime(totalSeconds);
  };

  // Obtener el tiempo activo (usa effectiveWorkSeconds del backend)
  const getActiveTime = () => {
    if (!activity.metrics) return "00h 00m";
    // Usar effectiveWorkSeconds si está disponible, sino calcular desde activeBeats (cada beat = 15 segundos)
    const totalSeconds = activity.metrics.effectiveWorkSeconds || activity.metrics.activeBeats * 15;
    return formatSecondsToTime(totalSeconds);
  };

  // Obtener el tiempo inactivo (calcula la diferencia)
  const getInactiveTime = () => {
    if (!activity.metrics) return "00h 00m";
    // Tiempo inactivo = tiempo total - tiempo activo
    const totalTime = activity.metrics.totalSessionTimeSeconds || activity.metrics.totalBeats * 15;
    const activeTime = activity.metrics.effectiveWorkSeconds || activity.metrics.activeBeats * 15;
    const inactiveSeconds = totalTime - activeTime;
    return formatSecondsToTime(inactiveSeconds > 0 ? inactiveSeconds : 0);
  };

  return (
    <div
      className="px-[20px] py-[28px] rounded-[5px] min-w-0 overflow-hidden"
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(166, 166, 166, 0.5)",
        height: "132px",
      }}
    >
      <div className="flex flex-col gap-[15px] min-w-0" style={{ width: "100%" }}>
        <h5
          className="text-[16px] font-semibold leading-normal mb-0"
          style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
        >
          {t("modal.timeBreakdown") || "Time Breakdown"}
        </h5>
        <div className="flex items-center justify-between w-full min-w-0">
          {/* Total Time */}
          <div className="flex flex-col items-center min-w-0 flex-1">
            <p
              className="text-[20px] font-semibold leading-normal mb-0 text-center w-full"
              style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
            >
              {getTotalTime()}
            </p>
            <p
              className="text-[12px] font-light leading-normal text-center w-full"
              style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
            >
              Total Time
            </p>
          </div>
          {/* Active Time */}
          <div className="flex flex-col items-center min-w-0 flex-1">
            <div className="flex gap-[5px] items-center mb-0 w-full justify-center min-w-0">
              <div
                className="w-[10px] h-[10px] rounded-full shrink-0"
                style={{ background: "#2EC36D" }}
              />
              <p
                className="text-[12px] font-light leading-normal whitespace-nowrap"
                style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
              >
                Active Time
              </p>
            </div>
            <p
              className="text-[20px] font-semibold leading-normal text-center w-full"
              style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
            >
              {getActiveTime()}
            </p>
          </div>
          {/* Inactive Time */}
          <div className="flex flex-col items-center min-w-0 flex-1">
            <div className="flex gap-[5px] items-center mb-0 w-full justify-center min-w-0">
              <div
                className="w-[10px] h-[10px] rounded-full shrink-0"
                style={{ background: "#FF0004" }}
              />
              <p
                className="text-[12px] font-light leading-normal whitespace-nowrap"
                style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
              >
                Inactive Time
              </p>
            </div>
            <p
              className="text-[20px] font-semibold leading-normal text-center w-full"
              style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
            >
              {getInactiveTime()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
