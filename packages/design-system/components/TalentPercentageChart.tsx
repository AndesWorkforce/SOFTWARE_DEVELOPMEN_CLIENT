"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

type Period = "day" | "week" | "month";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export interface TalentPercentageChartProps {
  className?: string;
  activePercentage: number;
  inactivePercentage: number;
  loading?: boolean;
  period: Period;
  onPeriodChange: (period: Period) => void;
}

export function TalentPercentageChart({
  className,
  activePercentage,
  inactivePercentage,
  loading = false,
  period,
  onPeriodChange,
}: TalentPercentageChartProps) {
  const t = useTranslations("dashboard");

  const periods: { key: Period; label: string }[] = [
    { key: "day", label: t("periods.today") },
    { key: "week", label: t("periods.week") },
    { key: "month", label: t("periods.month") },
  ];

  const buildSemiGaugeOption = (value: number, color: string) => {
    const safe = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
    const trackColor = "#D9D9D9"; // Figma: gris de fondo del arco

    return {
      animation: true,
      tooltip: { show: false },
      grid: { left: 0, right: 0, top: 0, bottom: 0, containLabel: false },
      series: [
        {
          type: "gauge",
          startAngle: 170,
          endAngle: 10,
          min: 0,
          max: 100,
          radius: "120%",
          center: ["50%", "60%"],
          silent: true,
          pointer: { show: false },
          axisLabel: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          title: { show: false },
          detail: { show: false },
          progress: {
            show: true,
            roundCap: true,
            width: 13,
            itemStyle: { color },
          },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 13,
              color: [[1, trackColor]],
            },
          },
          data: [{ value: safe }],
        },
      ],
    };
  };

  return (
    <div
      className={`bg-white border border-[rgba(166,166,166,0.5)] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(166,166,166,0.25)] px-[2.5vw] lg:px-[36px] pt-[20px] lg:pt-[24px] pb-0 ${className}`}
    >
      <div className="flex flex-col gap-[20px] lg:gap-x-[24px] items-center w-full pb-0">
        {/* Selector de período */}
        <div
          className="bg-[#f8f8f8] flex flex-col h-[35px] items-center justify-center p-[5px] rounded-[10px] w-full mb-6 mx-auto"
          style={{ maxWidth: "min(336px, 90vw)" }}
        >
          <div className="flex items-center justify-center gap-1 w-full">
            {periods.map((p) => (
              <button
                key={p.key}
                onClick={() => onPeriodChange(p.key)}
                className={`flex h-[25px] items-center justify-center px-3 lg:px-[24px] py-[6px] rounded-[10px] text-[14px] lg:text-[16px] flex-1 cursor-pointer ${
                  period === p.key
                    ? "bg-[#e2e2e2] font-medium text-black"
                    : "font-normal text-black text-center"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gráficos de porcentaje */}
        <div className="flex flex-col lg:flex-row gap-y-[85px] lg:gap-y-0 gap-x-0 lg:gap-x-[5%] items-center lg:items-end justify-center w-full pb-0">
          {/* Active Talent */}
          <div className="flex flex-col items-center w-full max-w-[242px] lg:flex-1 lg:max-w-none min-w-[220px] pb-0">
            <div
              className="relative w-full max-w-[242px] lg:max-w-none overflow-hidden"
              style={{ aspectRatio: "1.7" }}
            >
              <ReactECharts
                option={buildSemiGaugeOption(loading ? 0 : activePercentage, "#0097b2")}
                style={{ width: "100%", height: "130%" }}
                opts={{ renderer: "canvas" }}
              />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center whitespace-nowrap">
                <p className="font-semibold leading-[30px] lg:leading-[36px] mb-0 text-[36px] lg:text-[40px] text-black">
                  {loading ? "..." : `${activePercentage.toFixed(0)}%`}
                </p>
                <p className="font-light leading-[20px] lg:leading-[24px] text-[16px] lg:text-[18px] text-black">
                  {t("activeTalent")}
                </p>
              </div>
            </div>
          </div>

          {/* Inactive Talent */}
          <div className="flex flex-col items-center w-full max-w-[242px] lg:flex-1 lg:max-w-none min-w-[220px] pb-0">
            <div
              className="relative w-full max-w-[242px] lg:max-w-none overflow-hidden"
              style={{ aspectRatio: "1.7" }}
            >
              <ReactECharts
                option={buildSemiGaugeOption(loading ? 0 : inactivePercentage, "#FF0004")}
                style={{ width: "100%", height: "130%" }}
                opts={{ renderer: "canvas" }}
              />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center whitespace-nowrap">
                <p className="font-semibold leading-[30px] lg:leading-[36px] mb-0 text-[36px] lg:text-[40px] text-black">
                  {loading ? "..." : `${inactivePercentage.toFixed(0)}%`}
                </p>
                <p className="font-light leading-[20px] lg:leading-[24px] text-[16px] lg:text-[18px] text-black">
                  {t("inactiveTalent")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
