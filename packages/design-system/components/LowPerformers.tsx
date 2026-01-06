"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import type { RealtimeMetrics } from "@/packages/api/adt/adt.service";

// Importar el SVG local
import FlagFilledIcon from "../icons/Flag Filled.svg";

export interface LowPerformersProps {
  rankings: RealtimeMetrics[];
  loading?: boolean;
  className?: string;
}

export function LowPerformers({ rankings, loading = false, className }: LowPerformersProps) {
  const t = useTranslations("dashboard");

  const renderRankingItem = (ranking: RealtimeMetrics, index: number) => {
    const productivityScore = ranking.productivity_score || 0;
    const percentage = Math.round(productivityScore);
    const barWidthPercent = Math.max(percentage, 0); // Porcentaje para hacer responsive
    const rankNumber = index + 1;

    return (
      <div key={ranking.contractor_id} className="flex gap-[10px] items-center w-full">
        {/* Número de ranking */}
        <div className="flex flex-col justify-center shrink-0 w-[40px] h-[40px]">
          <p className="font-semibold text-[22.857px] text-black text-center leading-[0] whitespace-pre-wrap">
            {rankNumber}
          </p>
        </div>

        {/* Información del contractor */}
        <div
          className={`flex flex-col items-start shrink-0 flex-1 min-w-0 ${index === 2 ? "h-[46px] justify-between" : ""}`}
        >
          <p className="font-semibold text-[16px] text-black w-full whitespace-pre-wrap">
            {ranking.contractor_name || "N/A"}
          </p>
          <p className="font-normal text-[14px] text-[#6d6d6d] w-full whitespace-pre-wrap">
            {ranking.job_position || "N/A"}
          </p>
          <div className="flex h-[10px] items-center justify-between w-full gap-2">
            <div className="bg-[#d9d9d9] flex flex-col h-[5px] items-start justify-center rounded-[20px] shrink-0 flex-1 min-w-0">
              <div
                className="h-[5px] rounded-[20px] shrink-0"
                style={{
                  backgroundColor: "#ff0004",
                  width: `${barWidthPercent}%`,
                }}
              />
            </div>
            <div className="flex flex-col justify-center shrink-0">
              <p className="font-bold text-[12px] text-[#ff0004] leading-[normal] whitespace-nowrap">
                {percentage}%
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`bg-white border border-[rgba(217,217,217,0.5)] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(217,217,217,0.25)] px-[25px] py-[35px] flex flex-col gap-[25px] items-center w-full ${className || ""}`}
    >
      {/* Header */}
      <div className="flex gap-[10px] items-center w-full">
        <div className="relative shrink-0 w-[35px] h-[35px]">
          <Image
            src={FlagFilledIcon}
            alt="Flag"
            width={35}
            height={35}
            className="object-contain"
          />
        </div>
        <p className="font-bold text-[20px] text-black">{t("lowPerformers")}</p>
      </div>

      {/* Rankings */}
      <div className="flex flex-col gap-[15px] items-start w-full">
        {loading ? (
          <div className="text-center w-full py-8">
            <p className="text-[14px] text-black">{t("loading")}</p>
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center w-full py-8">
            <p className="text-[14px] text-black">{t("noDataAvailable")}</p>
          </div>
        ) : (
          rankings.map((ranking, index) => renderRankingItem(ranking, index))
        )}
      </div>
    </div>
  );
}
