"use client";
import type { UserActivity } from "@/packages/types/reports.types";

export interface InputTotalsProps {
  activity: UserActivity;
  t: (key: string) => string;
  /** `row` = título arriba y métricas lado a lado (reportes). `stack` = apilado (modales). */
  layout?: "row" | "stack";
}

export const InputTotals = ({ activity, t, layout = "row" }: InputTotalsProps) => {
  const metricsClassName =
    layout === "row" ? "flex flex-col sm:flex-row gap-3 w-full" : "flex flex-col gap-[10px] w-full";

  return (
    <div className="w-full bg-white border border-[rgba(166,166,166,0.5)] rounded-[5px] px-[17px] py-5 md:px-5 md:py-6">
      <div className="flex flex-col gap-4 w-full">
        <h5 className="text-[16px] md:text-xl font-semibold text-black mb-0">
          {t("modal.inputTotals") || "Input Totals"}
        </h5>

        <div className={metricsClassName}>
          <div className="flex flex-1 flex-col justify-center p-[10px] rounded-[5px] border border-[rgba(166,166,166,0.25)] min-h-[63px]">
            <p className="text-[12px] font-light text-black mb-0">
              {t("modal.totalKeyboardInputs") || "Total Keyboard Inputs"}
            </p>
            <p className="text-[20px] font-semibold text-black mb-0">
              {activity.metrics?.totalKeyboardInputs?.toLocaleString() || "0"}
            </p>
          </div>

          <div className="flex flex-1 flex-col justify-center p-[10px] rounded-[5px] border border-[rgba(166,166,166,0.25)] min-h-[63px]">
            <p className="text-[12px] font-light text-black mb-0">
              {t("modal.totalMouseInputs") || "Total Mouse Inputs"}
            </p>
            <p className="text-[20px] font-semibold text-black mb-0">
              {activity.metrics?.totalMouseClicks?.toLocaleString() || "0"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
