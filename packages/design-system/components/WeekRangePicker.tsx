"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

/** Devuelve el domingo y sábado de la semana que contiene `date`. */
function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diffStart = d.getDate() - day;
  const start = new Date(d);
  start.setDate(diffStart);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function formatWeekLabel(start: Date, end: Date): string {
  const sameYear = start.getFullYear() === end.getFullYear();
  const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endStr = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
  const yearStr = sameYear ? `, ${start.getFullYear()}` : "";
  return `${startStr} - ${endStr}${yearStr}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

function isInRange(date: Date, start: Date, end: Date): boolean {
  const t = date.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

export interface WeekRangePickerProps {
  value?: { start: Date; end: Date };
  onChange?: (range: { start: Date; end: Date }) => void;
  className?: string;
}

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function WeekRangePicker({ value, onChange, className = "" }: WeekRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  const range = value ?? getWeekRange(new Date());
  const displayLabel = formatWeekLabel(range.start, range.end);

  const handleDayClick = (date: Date) => {
    const week = getWeekRange(date);
    onChange?.({ start: week.start, end: week.end });
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay();
    const days: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) {
      const d = new Date(first);
      d.setDate(d.getDate() - (startPad - i));
      days.push(d);
    }
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    const remainder = 42 - days.length;
    for (let i = 1; i <= remainder; i++) {
      days.push(new Date(year, month + 1, i));
    }
    return days;
  }, [currentMonth]);

  const prevMonth = () => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1));
  };
  const nextMonth = () => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1));
  };
  const monthYearText = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div ref={containerRef} className={`relative shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-[45px] w-full min-w-[200px] max-w-[237px] items-center justify-between gap-2 rounded-[10px] border border-[rgba(166,166,166,0.5)] bg-white px-[10px] py-[5px] text-left"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Seleccionar semana"
      >
        <div className="flex min-w-0 flex-col justify-center">
          <span className="text-[10px] font-normal leading-normal text-[#6d6d6d]">Date</span>
          <span className="truncate text-[14px] font-medium text-black whitespace-nowrap">
            {displayLabel}
          </span>
        </div>
        <ChevronDown className="size-6 shrink-0 text-black" aria-hidden />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 rounded-[8px] border border-[rgba(166,166,166,0.5)] bg-white p-[23px] shadow-[2px_16px_19px_0px_rgba(0,0,0,0.09)]"
          style={{ width: 306, minHeight: 285 }}
          role="dialog"
          aria-label="Calendario por semana"
        >
          {/* Header mes */}
          <div className="mb-4 flex h-4 items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              className="flex size-4 items-center justify-center text-[#4a5660] hover:opacity-80"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="size-4" />
            </button>
            <p className="text-[14px] font-semibold leading-[14px] text-[#4a5660]">
              {monthYearText}
            </p>
            <button
              type="button"
              onClick={nextMonth}
              className="flex size-4 items-center justify-center text-[#4a5660] hover:opacity-80"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="mb-2 grid grid-cols-7 gap-0">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="flex h-5 items-center justify-center text-[10px] font-normal uppercase tracking-[1.5px] text-[#b5bec6]"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid de días */}
          <div className="grid grid-cols-7 gap-0">
            {calendarDays.map((date, i) => {
              if (!date) return <div key={i} className="size-[30px]" />;
              const inRange = isInRange(date, range.start, range.end);
              const isStart = isSameDay(date, range.start);
              const isEnd = isSameDay(date, range.end);
              const isOtherMonth = date.getMonth() !== currentMonth.getMonth();
              const cellBg = inRange
                ? isStart || isEnd
                  ? "bg-[#0e7490] text-white"
                  : "bg-[rgba(14,116,144,0.15)] text-black"
                : "";
              const opacity = isOtherMonth ? "opacity-40" : "";

              return (
                <div key={i} className={`flex size-[30px] items-center justify-center`}>
                  <button
                    type="button"
                    onClick={() => handleDayClick(date)}
                    className={`flex size-[30px] items-center justify-center rounded-full text-[14px] transition-colors hover:opacity-90 ${cellBg} ${opacity} ${
                      !inRange && !isOtherMonth ? "text-[#4a5660] hover:bg-gray-100" : ""
                    }`}
                    aria-label={date.toLocaleDateString("en-US")}
                  >
                    {date.getDate()}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
