"use client";
import dynamic from "next/dynamic";
import type { ContractorSession } from "@/packages/types/adt.types";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export interface SessionConnectivityProps {
  sessions: ContractorSession[];
  t: (key: string) => string;
}

export const SessionConnectivity = ({ sessions, t }: SessionConnectivityProps) => {
  const formatSecondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`;
  };

  // Obtener número real de sesiones desde los datos del backend
  const getSessionCount = () => {
    return sessions.length;
  };

  // Calcular duración promedio de sesión basado en datos reales
  const getAvgDuration = () => {
    if (sessions.length === 0) return "0h 00m";

    // Calcular el promedio de total_seconds de todas las sesiones
    const totalSeconds = sessions.reduce((sum, session) => sum + session.total_seconds, 0);
    const avgSeconds = totalSeconds / sessions.length;

    return formatSecondsToTime(avgSeconds);
  };

  // Build chart data for Sessions & Connectivity using real session data
  const buildSessionChartOption = () => {
    // Convertir sesiones reales al formato del gráfico
    // Ordenar por fecha de inicio y tomar las últimas 5 sesiones para mostrar
    const sortedSessions = [...sessions]
      .sort((a, b) => new Date(a.session_start).getTime() - new Date(b.session_start).getTime())
      .slice(-5); // Mostrar máximo 5 sesiones más recientes

    const sessionData = sortedSessions.map((session) => {
      // Formatear hora de inicio y fin
      const startTime = session.session_start.split(" ")[1]?.substring(0, 5) || "00:00";
      const endTime = session.session_end.split(" ")[1]?.substring(0, 5) || "00:00";
      // Convertir segundos a horas
      const durationHours = session.total_seconds / 3600;

      return {
        time: `${startTime} to ${endTime}`,
        duration: Math.round(durationHours * 100) / 100, // Redondear a 2 decimales
      };
    });

    // Si no hay sesiones, mostrar datos vacíos
    if (sessionData.length === 0) {
      return {
        grid: { left: "10%", right: "15%", top: "5%", bottom: "20%", containLabel: false },
        xAxis: {
          type: "category",
          data: [],
          axisLine: { show: true, lineStyle: { color: "#000000" } },
        },
        yAxis: {
          type: "value",
          min: 0,
          max: 8,
          axisLine: { show: true, lineStyle: { color: "#000000" } },
        },
        series: [{ type: "bar", data: [] }],
      };
    }

    const maxDuration = Math.max(...sessionData.map((s) => s.duration), 8);

    return {
      grid: {
        left: "10%",
        right: "15%",
        top: "5%",
        bottom: "20%",
        containLabel: false,
      },
      xAxis: {
        type: "category",
        data: sessionData.map((s) => s.time),
        axisLine: { show: true, lineStyle: { color: "#000000" } },
        axisLabel: {
          fontSize: 9,
          color: "#000000",
          interval: 0,
          rotate: 0,
        },
        axisTick: { show: true, lineStyle: { color: "#000000" } },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: maxDuration,
        interval: 2,
        axisLine: { show: true, lineStyle: { color: "#000000" } },
        axisLabel: {
          fontSize: 9,
          color: "#000000",
          formatter: (value: number) => `${value}h`,
        },
        axisTick: { show: true, lineStyle: { color: "#000000" } },
        splitLine: {
          show: true,
          lineStyle: { color: "#000000", type: "dashed" },
        },
      },
      series: [
        {
          type: "bar",
          data: sessionData.map((s) => s.duration),
          itemStyle: {
            color: "#0097B2",
            borderRadius: [0, 0, 0, 0],
          },
          barWidth: "30%",
        },
      ],
      tooltip: {
        show: false,
      },
    };
  };

  return (
    <div
      className="px-[20px] py-[28px] rounded-[5px]"
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(166, 166, 166, 0.5)",
        height: "295px",
      }}
    >
      <div className="flex flex-col gap-[25px] h-[280px]" style={{ width: "100%" }}>
        <div className="flex flex-col gap-[10px] items-center w-full">
          <h5
            className="text-[16px] font-semibold leading-normal mb-0 w-full"
            style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
          >
            {t("modal.sessionConnectivity") || "Session & Connectivity"}
          </h5>
          <div className="flex gap-[10px] items-start w-full">
            {/* Session Count */}
            <div
              className="flex-1 flex flex-col items-center justify-center p-[10px] rounded-[5px] shrink-0"
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(166, 166, 166, 0.25)",
                height: "63px",
              }}
            >
              <div className="flex flex-col items-start" style={{ width: "100%" }}>
                <p
                  className="text-[12px] font-light leading-normal mb-0 w-full"
                  style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
                >
                  {t("modal.sessionCount") || "Session Count"}
                </p>
                <p
                  className="text-[20px] font-semibold leading-normal mb-0 w-full"
                  style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
                >
                  {getSessionCount()}
                </p>
              </div>
            </div>
            {/* Avg Duration */}
            <div
              className="flex-1 flex flex-col items-center justify-center p-[10px] rounded-[5px] shrink-0"
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(166, 166, 166, 0.25)",
                height: "63px",
              }}
            >
              <div className="flex flex-col items-start" style={{ width: "100%" }}>
                <p
                  className="text-[12px] font-light leading-normal mb-0 w-full"
                  style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
                >
                  {t("modal.avgDuration") || "Avg. Duration"}
                </p>
                <p
                  className="text-[20px] font-semibold leading-normal mb-0 w-full"
                  style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
                >
                  {getAvgDuration()}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Chart */}
        <div className="h-[140px] w-full overflow-clip">
          <ReactECharts
            option={buildSessionChartOption()}
            style={{ width: "110%", height: "100%" }}
            opts={{ renderer: "canvas" }}
          />
        </div>
      </div>
    </div>
  );
};
