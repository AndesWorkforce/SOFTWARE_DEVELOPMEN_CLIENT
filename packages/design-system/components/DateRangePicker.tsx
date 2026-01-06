"use client";
import { forwardRef } from "react";

export interface DateRangePickerProps {
  label?: string;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  error?: string;
  className?: string;
}

export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(
  (
    { label, startDate, endDate, onStartDateChange, onEndDateChange, error, className = "" },
    ref,
  ) => {
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onStartDateChange(e.target.value);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onEndDateChange(e.target.value);
    };

    return (
      <div ref={ref} className={`w-full ${className}`}>
        {label && (
          <p className="text-[14px] md:text-[16px] font-medium md:font-semibold text-black mb-[5px]">
            {label}
          </p>
        )}
        <div
          className="relative flex items-center rounded-[5px] h-[35px] md:h-[45px]"
          style={{
            background: "#FFFFFF",
            border: error ? "1px solid #EF4444" : "1px solid rgba(166, 166, 166, 0.5)",
            boxShadow: "0px 4px 4px rgba(166, 166, 166, 0.25)",
          }}
        >
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="flex-1 h-[33px] md:h-[38px] px-[12px] border-none outline-none bg-transparent text-[12px] md:text-[16px]"
            style={{
              color: startDate ? "#000000" : "#B6B4B4",
              fontFamily: "Inter, sans-serif",
            }}
            aria-label="Fecha de inicio"
          />
          <span
            className="text-[12px] md:text-[16px]"
            style={{ color: "#B6B4B4", fontFamily: "Inter, sans-serif", padding: "0 4px" }}
          >
            -
          </span>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            className="flex-1 h-[33px] md:h-[38px] px-[12px] border-none outline-none bg-transparent text-[12px] md:text-[16px]"
            style={{
              color: endDate ? "#000000" : "#B6B4B4",
              fontFamily: "Inter, sans-serif",
            }}
            aria-label="Fecha de fin"
          />
        </div>
        {error && (
          <p className="mt-1 text-sm" style={{ color: "#EF4444" }}>
            {error}
          </p>
        )}
      </div>
    );
  },
);

DateRangePicker.displayName = "DateRangePicker";
