"use client";

export interface ClientCalendarDayHeaderProps {
  label: string;
  isToday?: boolean;
  className?: string;
}

export function ClientCalendarDayHeader({
  label,
  isToday = false,
  className = "",
}: ClientCalendarDayHeaderProps) {
  return (
    <p
      className={`font-normal leading-normal text-center text-[16px] ${className}`}
      style={{ color: isToday ? "#0097B2" : "#C2C2C2" }}
    >
      {label}
    </p>
  );
}
