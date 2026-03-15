"use client";

import { useMemo } from "react";
import { FileUser, TreePalm, Cross, Plus } from "lucide-react";

export interface AbsenceEvent {
  id: string;
  date: Date;
  contractorName: string;
  contractorRole: string;
  type: "license" | "vacation" | "health";
}

export interface ClientCalendarGridProps {
  currentDate: Date;
  absences: AbsenceEvent[];
  locale?: string;
  onDateClick?: (date: Date) => void;
  onMoreAbsencesClick?: (date: Date, absences: AbsenceEvent[]) => void;
  className?: string;
}

const absenceColors = {
  license: { bg: "#dbeafe", text: "#1e40af", icon: FileUser },
  vacation: { bg: "#dcfce7", text: "#166534", icon: TreePalm },
  health: { bg: "#fee2e2", text: "#991b1b", icon: Cross },
};

export const ClientCalendarGrid = ({
  currentDate,
  absences,
  locale = "en-US",
  onDateClick,
  onMoreAbsencesClick,
  className = "",
}: ClientCalendarGridProps) => {
  const firstDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  }, [currentDate]);

  const lastDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  }, [currentDate]);

  const firstDayWeekday = useMemo(() => {
    const day = firstDayOfMonth.getDay();
    return day === 0 ? 6 : day - 1;
  }, [firstDayOfMonth]);

  const daysInMonth = lastDayOfMonth.getDate();

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date(2024, 0, i);
      days.push(date.toLocaleDateString(locale, { weekday: "long" }));
    }
    return days;
  }, [locale]);

  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }
    return days;
  }, [currentDate, firstDayWeekday, daysInMonth]);

  const getAbsencesForDate = (date: Date): AbsenceEvent[] => {
    return absences.filter(
      (absence) =>
        absence.date.getDate() === date.getDate() &&
        absence.date.getMonth() === date.getMonth() &&
        absence.date.getFullYear() === date.getFullYear(),
    );
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  return (
    <div
      className={`bg-white border border-gray-300/50 rounded-[10px] shadow-sm p-4 md:p-6 ${className}`}
    >
      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-0 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="text-center text-xs md:text-base font-normal py-2 capitalize"
            style={{
              color: index === 5 || index === 6 ? "#646464" : "#c2c2c2",
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0 border-l border-t border-gray-200">
        {calendarDays.map((date, index) => {
          if (!date) {
            return (
              <div
                key={`empty-${index}`}
                className="border-r border-b border-gray-200 min-h-[80px] md:min-h-[100px] bg-gray-50"
              />
            );
          }

          const dateAbsences = getAbsencesForDate(date);
          const isTodayDate = isToday(date);
          const isPast = isPastDate(date);

          return (
            <div
              key={index}
              onClick={() => onDateClick?.(date)}
              className={`
                relative min-h-[80px] md:min-h-[100px] p-1.5 md:p-2 border-r border-b border-gray-200 transition-all text-left
                ${isPast ? "bg-gray-50" : "bg-white"}
                ${isTodayDate ? "bg-blue-50/30" : ""}
                hover:bg-gray-50 cursor-pointer
              `}
            >
              <div className="flex flex-col h-full">
                <span
                  className={`text-xs md:text-sm font-bold mb-1 md:mb-2 ${
                    isTodayDate ? "text-[#0097b2]" : "text-black"
                  }`}
                >
                  {date.getDate()}
                </span>

                {/* Absences */}
                {dateAbsences.length > 0 && (
                  <div className="flex flex-col gap-0.5 md:gap-1 overflow-hidden">
                    {dateAbsences.slice(0, 2).map((absence) => {
                      const config = absenceColors[absence.type];
                      const Icon = config.icon;

                      return (
                        <div
                          key={absence.id}
                          className="text-[8px] md:text-xs px-1 md:px-2 py-0.5 md:py-1 rounded-[5px] flex items-start gap-1"
                          style={{ backgroundColor: config.bg, color: config.text }}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Icon className="w-2.5 h-2.5 md:w-4 md:h-4 flex-shrink-0 mt-0.5" />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-semibold truncate">{absence.contractorName}</span>
                            <span className="font-light truncate hidden md:block">
                              {absence.contractorRole}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {dateAbsences.length > 2 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoreAbsencesClick?.(date, dateAbsences);
                        }}
                        className="text-[8px] md:text-xs px-1 md:px-2 py-0.5 md:py-1 rounded-[5px] flex items-center gap-1 transition-opacity hover:opacity-80"
                        style={{
                          backgroundColor: "rgba(0, 151, 178, 0.15)",
                          border: "1px solid rgba(0, 151, 178, 0.5)",
                          color: "#0097b2",
                        }}
                      >
                        <Plus className="w-2 h-2 md:w-2.5 md:h-2.5" />
                        <span className="font-semibold">
                          {dateAbsences.length - 2} more absence
                          {dateAbsences.length - 2 > 1 ? "s" : ""}
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
