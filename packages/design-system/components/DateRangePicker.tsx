"use client";
import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import { useLocale } from "next-intl";
import { enUS, es } from "date-fns/locale";
import { Calendar } from "lucide-react";

export interface DateRangePickerProps {
  label?: string;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  error?: string;
  className?: string;
  minDate?: string;
  maxDate?: string;
  startDateMax?: string;
  endDateMin?: string;
}

const parseIsoDate = (value?: string): Date | null => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, 12, 0, 0);
};

const formatIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (value: string, locale: string): string => {
  const parsed = parseIsoDate(value);
  if (!parsed) return "";
  return parsed.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const DateInputButton = forwardRef<
  HTMLButtonElement,
  { displayValue: string; muted: boolean; ariaLabel: string; onClick?: () => void }
>(function DateInputButton({ displayValue, muted, ariaLabel, onClick }, ref) {
  return (
    <button
      type="button"
      ref={ref}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`w-full h-[33px] md:h-[38px] px-[12px] border-none outline-none bg-transparent text-[12px] md:text-[16px] cursor-pointer flex items-center justify-between ${
        muted ? "text-[#B6B4B4]" : "text-black"
      }`}
    >
      <span className="truncate">{displayValue || " "}</span>
      <Calendar className="w-4 h-4 ml-2 shrink-0 text-black" />
    </button>
  );
});

export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(
  (
    {
      label,
      startDate,
      endDate,
      onStartDateChange,
      onEndDateChange,
      error,
      className = "",
      minDate,
      maxDate,
      startDateMax,
      endDateMin,
    },
    ref,
  ) => {
    const locale = useLocale();
    const pickerLocale = locale.toLowerCase().startsWith("es") ? es : enUS;
    const displayLocale = locale.toLowerCase().startsWith("es") ? "es-ES" : "en-US";

    return (
      <div ref={ref} className={`w-full ${className}`}>
        {label && (
          <p className="text-[14px] md:text-[16px] font-medium md:font-semibold text-black mb-[5px]">
            {label}
          </p>
        )}
        <div
          className="relative flex items-center rounded-[5px] h-[35px] md:h-[45px] cursor-pointer"
          style={{
            background: "#FFFFFF",
            border: error ? "1px solid #EF4444" : "1px solid rgba(166, 166, 166, 0.5)",
            boxShadow: "0px 4px 4px rgba(166, 166, 166, 0.25)",
          }}
        >
          <DatePicker
            selected={parseIsoDate(startDate)}
            onChange={(date: Date | null) => {
              onStartDateChange(date ? formatIsoDate(date) : "");
            }}
            minDate={parseIsoDate(minDate) ?? undefined}
            maxDate={parseIsoDate(startDateMax || maxDate) ?? undefined}
            locale={pickerLocale}
            dateFormat="yyyy-MM-dd"
            wrapperClassName="flex-1"
            popperPlacement="bottom-start"
            customInput={
              <DateInputButton
                displayValue={formatDisplayDate(startDate, displayLocale)}
                muted={!startDate}
                ariaLabel="Start date"
              />
            }
          />
          <span
            className="text-[12px] md:text-[16px]"
            style={{ color: "#B6B4B4", fontFamily: "Inter, sans-serif", padding: "0 4px" }}
          >
            -
          </span>
          <DatePicker
            selected={parseIsoDate(endDate)}
            onChange={(date: Date | null) => {
              onEndDateChange(date ? formatIsoDate(date) : "");
            }}
            minDate={parseIsoDate(endDateMin || minDate) ?? undefined}
            maxDate={parseIsoDate(maxDate) ?? undefined}
            locale={pickerLocale}
            dateFormat="yyyy-MM-dd"
            wrapperClassName="flex-1"
            popperPlacement="bottom-start"
            customInput={
              <DateInputButton
                displayValue={formatDisplayDate(endDate, displayLocale)}
                muted={!endDate}
                ariaLabel="End date"
              />
            }
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
