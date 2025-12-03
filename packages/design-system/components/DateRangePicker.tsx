"use client";
import { forwardRef } from "react";
import { Calendar } from "lucide-react";

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
    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onStartDateChange(e.target.value);
    };

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onEndDateChange(e.target.value);
    };

    return (
      <div ref={ref} className={`w-full ${className}`}>
        {label && (
          <label className="block text-sm font-medium mb-1" style={{ color: "#000000" }}>
            {label}
          </label>
        )}
        <div
          className="relative flex items-center gap-2 border rounded-md px-3 py-2"
          style={{
            background: "#FFFFFF",
            borderColor: error ? "#EF4444" : "#D1D5DB",
          }}
        >
          <input
            type="text"
            value={startDate}
            onChange={handleStartChange}
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => (e.target.type = "text")}
            placeholder="DD/MM/YYYY"
            className="flex-1 outline-none bg-transparent"
            style={{ color: "#000000" }}
          />
          <span className="text-gray-400">-</span>
          <input
            type="text"
            value={endDate}
            onChange={handleEndChange}
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => (e.target.type = "text")}
            placeholder="DD/MM/YYYY"
            className="flex-1 outline-none bg-transparent"
            style={{ color: "#000000" }}
          />
          <Calendar className="w-4 h-4 text-gray-400" />
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
