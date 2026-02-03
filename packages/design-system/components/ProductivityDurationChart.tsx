"use client";
import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export interface ProductivityDurationChartProps {
  hourlyData: Array<{
    hour: string;
    productivity: number;
    duration: number; // in hours (decimal)
  }>;
}

export const ProductivityDurationChart = ({ hourlyData }: ProductivityDurationChartProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const formatHoursToTime = (hoursDecimal: number): string => {
    const totalMinutes = Math.round(hoursDecimal * 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

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
            return `${String(param.name)}<br/>${String(param.seriesName)}: ${formatHoursToTime(Number(param.value))}`;
          }
          return "";
        },
      },
      legend: {
        data: ["Avg. Duration"],
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
        data: hourlyData.map((d) => d.hour),
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
        name: "Duration (h)",
        min: 0,
        max: 5,
        interval: 1,
        axisLabel: {
          formatter: "{value}h",
          color: "#000000",
          fontSize: 12,
        },
        splitLine: { lineStyle: { type: "solid", color: "#F0F0F0" } },
        axisLine: { show: true, lineStyle: { color: "#E5E5E5" } },
      },
      series: [
        {
          name: "Avg. Duration",
          type: "line",
          smooth: true,
          showSymbol: true,
          symbol: "circle",
          symbolSize: 8,
          data: hourlyData.map((d) => d.duration),
          itemStyle: { color: "#0097B2" },
          lineStyle: { width: 2, color: "#0097B2" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(0, 151, 178, 0.4)" },
                { offset: 1, color: "rgba(0, 151, 178, 0.05)" },
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
