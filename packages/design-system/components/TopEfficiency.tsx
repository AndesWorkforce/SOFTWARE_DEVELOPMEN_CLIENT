"use client";

import { useTranslations } from "next-intl";
import type { RealtimeMetrics } from "@/packages/api/adt/adt.service";

// URLs de las imágenes desde Figma
const imgTrophy = "https://www.figma.com/api/mcp/asset/d3cef671-e022-4eb9-b550-9aeba45670d0";
const imgFirstPlaceRibbon =
  "https://www.figma.com/api/mcp/asset/66ed8c8c-c39f-4998-b968-b1eeff26c73a";
const imgSecondPlaceRibbon =
  "https://www.figma.com/api/mcp/asset/b4a71376-bb90-4961-819e-4eb6b2d2285f";
const imgThirdPlaceRibbon =
  "https://www.figma.com/api/mcp/asset/5b281563-3467-4509-a350-e2e17e596dbb";

export interface TopEfficiencyProps {
  rankings: RealtimeMetrics[];
  loading?: boolean;
  className?: string;
}

export function TopEfficiency({ rankings, loading = false, className }: TopEfficiencyProps) {
  const t = useTranslations("dashboard");

  const renderRankingItem = (ranking: RealtimeMetrics, index: number) => {
    const productivityScore = ranking.productivity_score || 0;
    const percentage = Math.round(productivityScore);
    const barWidthPercent = Math.max(percentage, 0); // Porcentaje para hacer responsive

    const isTopThree = index < 3;
    const rankNumber = index + 1;

    // Determinar qué ribbon usar para los primeros 3 lugares
    let ribbonImage: string | null = null;
    if (index === 0) ribbonImage = imgFirstPlaceRibbon;
    else if (index === 1) ribbonImage = imgSecondPlaceRibbon;
    else if (index === 2) ribbonImage = imgThirdPlaceRibbon;

    return (
      <div key={ranking.contractor_id} className="flex gap-[10px] items-center w-full">
        {/* Ribbon para los primeros 3 lugares, número para los demás */}
        {isTopThree && ribbonImage ? (
          <div className="relative shrink-0 w-[35px] h-[35px]">
            <img
              src={ribbonImage}
              alt={`${rankNumber} place ribbon`}
              className="absolute inset-0 max-w-none object-contain pointer-events-none w-full h-full"
            />
          </div>
        ) : (
          <div className="flex flex-col justify-center shrink-0 w-[40px] h-[40px]">
            <p className="font-semibold text-[22.857px] text-black text-center leading-[0] whitespace-pre-wrap">
              {rankNumber}
            </p>
          </div>
        )}

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
                  backgroundColor: "#0097b2",
                  width: `${barWidthPercent}%`,
                }}
              />
            </div>
            <div className="flex flex-col justify-center shrink-0">
              <p className="font-bold text-[12px] text-[#0097b2] leading-[normal] whitespace-nowrap">
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
          <img
            src={imgTrophy}
            alt="Trophy"
            className="absolute inset-0 max-w-none object-contain pointer-events-none w-full h-full"
          />
        </div>
        <p className="font-bold text-[20px] text-black">{t("topEfficiency")}</p>
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
