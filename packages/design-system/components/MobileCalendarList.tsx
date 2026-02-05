"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { FileUser, TreePalm, Cross } from "lucide-react";
import type { AbsenceEvent } from "./ClientCalendarGrid";

export interface MobileCalendarListProps {
  currentDate: Date;
  absences: AbsenceEvent[];
  locale?: string;
  className?: string;
}

const absenceColors = {
  license: { bg: "#dbeafe", text: "#1e40af", icon: FileUser },
  vacation: { bg: "#dcfce7", text: "#166534", icon: TreePalm },
  health: { bg: "#fee2e2", text: "#991b1b", icon: Cross },
};

export const MobileCalendarList = ({
  currentDate,
  absences,
  locale = "en-US",
  className = "",
}: MobileCalendarListProps) => {
  const t = useTranslations();

  // Group absences by date
  const absencesByDate = useMemo(() => {
    const grouped = new Map<string, AbsenceEvent[]>();

    absences.forEach((absence) => {
      const dateKey = absence.date.toISOString().split("T")[0];
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(absence);
    });

    // Sort dates
    const sortedEntries = Array.from(grouped.entries()).sort((a, b) => {
      return new Date(a[0]).getTime() - new Date(b[0]).getTime();
    });

    return sortedEntries;
  }, [absences]);

  const formatDayName = (date: Date): string => {
    return date.toLocaleDateString(locale, { weekday: "long", day: "numeric" });
  };

  if (absencesByDate.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <p className="text-gray-500 text-center">
          {t("calendar.noAbsences") || "No absences for this month"}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {absencesByDate.map(([dateKey, dateAbsences]) => {
        const date = new Date(dateKey);

        return (
          <div
            key={dateKey}
            className="bg-white border border-[rgba(194,194,194,0.5)] rounded-[10px] p-5"
          >
            <p className="font-bold text-base text-black mb-2.5">{formatDayName(date)}</p>

            <div className="flex flex-col gap-2.5">
              {dateAbsences.map((absence) => {
                const config = absenceColors[absence.type];
                const Icon = config.icon;

                return (
                  <div
                    key={absence.id}
                    className="flex items-center gap-1.5 px-5 py-1.5 rounded-[5px] h-[45px]"
                    style={{ backgroundColor: config.bg }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" style={{ color: config.text }} />
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                      <p
                        className="font-semibold text-xs leading-normal truncate"
                        style={{ color: config.text }}
                      >
                        {absence.contractorName}
                      </p>
                      <p
                        className="font-light text-[10px] leading-normal truncate"
                        style={{ color: config.text }}
                      >
                        {absence.contractorRole}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
