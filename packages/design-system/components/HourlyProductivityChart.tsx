"use client";
import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

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
            return `${String(param.name)}<br/>${String(param.seriesName)}: ${String(param.value)}%`;
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
        boundaryGap: false,
        data: hourlyData.map((d) => d.hour_label),
        axisLine: { lineStyle: { color: "#E5E5E5" } },
        axisLabel: {
          color: "#000000",
          fontSize: isMobile ? 9 : 12,
          rotate: 0,
          interval: 0, // Mostrar todas las etiquetas
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
          type: "line",
          smooth: true,
          showSymbol: true,
          symbol: "circle",
          symbolSize: 8,
          data: hourlyData.map((d) => Math.round(d.avg_productivity_score || 0)),
          itemStyle: { color: "#7DA40A" },
          lineStyle: { width: 2, color: "#7DA40A" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(125, 164, 10, 0.35)" },
                { offset: 1, color: "rgba(125, 164, 10, 0.05)" },
              ],
            },
          },
        },
      ],
    };
  }, [hourlyData, isMobile]);

  return (
    <div className="h-[300px] w-full">
      <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
    </div>
  );
};
