"use client";

export interface CalendarStat {
  label: string;
  value: string | number;
  color?: string;
}

export interface ClientCalendarStatsProps {
  stats: CalendarStat[];
  className?: string;
}

export const ClientCalendarStats = ({ stats, className = "" }: ClientCalendarStatsProps) => {
  return (
    <div
      className={`flex gap-[15px] w-full ${className}`}
      role="group"
      aria-label="Calendar statistics"
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-[10px] shadow-sm flex flex-1 h-[100px] items-center justify-center px-4 py-4 min-w-0"
        >
          <div className="flex flex-col gap-[10px] items-center text-center min-w-0 w-full">
            <p
              className="font-medium text-[#0097b2] text-sm md:text-base leading-tight whitespace-normal"
              style={{ color: stat.color || "#0097b2" }}
            >
              {stat.label}
            </p>
            <p className="font-semibold text-black text-2xl md:text-[32px] leading-tight">
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
