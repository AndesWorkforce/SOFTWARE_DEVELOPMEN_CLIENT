"use client";
import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

/**
 * Rango que abarca un bucket horario, para el tooltip.
 *
 * Una etiqueta "08:00" no significa "a las 8 en punto" sino "entre 08:00 y
 * 09:00". Mostrar el rango completo evita la lectura de que la actividad
 * ocurrio en ese instante. Devuelve null si la etiqueta no es una hora: este
 * componente tambien sirve a la vista de grupo, donde las etiquetas son nombres
 * de equipo.
 */
function bucketRangeLabel(label: string): string | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(label.trim());
  if (!m) return null;
  const h = Number(m[1]);
  if (!Number.isInteger(h) || h < 0 || h > 23) return null;
  const next = (h + 1) % 24;
  return `${String(h).padStart(2, "0")}:${m[2]} - ${String(next).padStart(2, "0")}:${m[2]}`;
}

export interface HourlyProductivityChartProps {
  hourlyData: Array<{
    hour_label: string;
    avg_productivity_score: number;
  }>;
}

export const HourlyProductivityChart = ({ hourlyData }: HourlyProductivityChartProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const option = useMemo(() => {
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "line", lineStyle: { color: "#E5E5E5", type: "dashed" } },
        formatter: (params: unknown) => {
          const param = Array.isArray(params) ? params[0] : params;
          if (
            param &&
            typeof param === "object" &&
            "name" in param &&
            "seriesName" in param &&
            "value" in param
          ) {
            const label = bucketRangeLabel(String(param.name)) ?? String(param.name);
            return `${label}<br/>${String(param.seriesName)}: ${String(param.value)}%`;
          }
          return "";
        },
      },
      legend: {
        data: ["Avg. Productivity"],
        bottom: 0,
        icon: "roundRect",
      },
      grid: {
        left: "3%",
        right: "4%",
        top: "10%",
        bottom: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: true,
        data: hourlyData.map((d) => d.hour_label),
        axisLine: { lineStyle: { color: "#E5E5E5" } },
        axisLabel: {
          color: "#000000",
          fontSize: isMobile ? 9 : 11,
          rotate: 0,
          interval: hourlyData.length > 14 ? 1 : 0,
          showMinLabel: true,
          showMaxLabel: true,
        },
        axisTick: { show: true, alignWithLabel: true },
      },
      yAxis: {
        type: "value",
        name: "Productivity (%)",
        min: 0,
        max: 100,
        interval: 20,
        axisLabel: {
          formatter: "{value}%",
          color: "#000000",
          fontSize: 12,
        },
        splitLine: { lineStyle: { type: "solid", color: "#F0F0F0" } },
        axisLine: { show: true, lineStyle: { color: "#E5E5E5" } },
      },
      series: [
        {
          name: "Avg. Productivity",
          // Mismo criterio que el grafico de duracion: el score es por hora,
          // no una serie continua, y la curva suave lo desplazaba visualmente
          // hacia horas sin actividad.
          type: "bar",
          barMaxWidth: 28,
          data: hourlyData.map((d) => Math.round(d.avg_productivity_score || 0)),
          itemStyle: {
            borderRadius: [3, 3, 0, 0],
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#7DA40A" },
                { offset: 1, color: "rgba(125, 164, 10, 0.45)" },
              ],
            },
          },
        },
      ],
    };
  }, [hourlyData, isMobile]);

  return (
    <div className="h-[300px] w-full min-w-0 overflow-hidden">
      <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
    </div>
  );
};
