"use client";
import type { UserActivity } from "@/packages/types/reports.types";

export interface InputTotalsProps {
  activity: UserActivity;
  t: (key: string) => string;
}

export const InputTotals = ({ activity, t }: InputTotalsProps) => {
  return (
    <div
      className="px-[17px] py-[28px] rounded-[5px]"
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(166, 166, 166, 0.5)",
        height: "221px",
      }}
    >
      <div className="flex flex-col gap-[10px] items-center" style={{ width: "100%" }}>
        <h5
          className="text-[16px] font-semibold leading-normal mb-0 w-full"
          style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
        >
          {t("modal.inputTotals") || "Input Totals"}
        </h5>
        {/* Keyboard Inputs */}
        <div
          className="flex flex-col items-center justify-center p-[10px] rounded-[5px] w-full shrink-0"
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
              {t("modal.totalKeyboardInputs") || "Total Keyboard Inputs"}
            </p>
            <p
              className="text-[20px] font-semibold leading-normal mb-0 w-full"
              style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
            >
              {activity.metrics?.totalKeyboardInputs?.toLocaleString() || "0"}
            </p>
          </div>
        </div>
        {/* Mouse Inputs */}
        <div
          className="flex flex-col items-center justify-center p-[10px] rounded-[5px] w-full shrink-0"
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
              {t("modal.totalMouseInputs") || "Total Mouse Inputs"}
            </p>
            <p
              className="text-[20px] font-semibold leading-normal mb-0 w-full"
              style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
            >
              {activity.metrics?.totalMouseClicks?.toLocaleString() || "0"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
