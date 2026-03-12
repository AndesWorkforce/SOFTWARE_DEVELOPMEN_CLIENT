"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { CalendarModal, type CalendarEvent, type WorkSchedule } from "@/packages/design-system";
import { contractorsService } from "@/packages/api/contractors/contractors.service";
import type { Contractor, ContractorDayOff } from "@/packages/types/contractors.types";

interface ContractorCalendarModalProps {
  contractorId: string;
  contractorName?: string;
  onClose: () => void;
}

export const ContractorCalendarModal = ({
  contractorId,
  contractorName: initialName,
  onClose,
}: ContractorCalendarModalProps) => {
  const locale = useLocale();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [dayOffs, setDayOffs] = useState<ContractorDayOff[]>([]);

  // Cargar datos del contractor y sus días libres
  useEffect(() => {
    const loadContractorData = async () => {
      try {
        const [contractorData, dayOffsData] = await Promise.all([
          contractorsService.getById(contractorId),
          contractorsService.getDayOffs(contractorId),
        ]);
        setContractor(contractorData);
        setDayOffs(dayOffsData);
      } catch (error) {
        console.error("Error loading contractor data:", error);
      }
    };

    loadContractorData();
  }, [contractorId]);

  const contractorName = contractor?.name || initialName || "Contractor";

  // Crear horario de trabajo desde los datos del contractor
  const workSchedule: WorkSchedule | undefined = contractor
    ? {
        startTime: contractor.work_schedule_start || "08:00",
        finishTime: contractor.work_schedule_end || "17:00",
        lunchStart: contractor.lunch_start || undefined,
        lunchEnd: contractor.lunch_end || undefined,
      }
    : undefined;

  // Convertir días libres a eventos del calendario
  const dayOffEvents: CalendarEvent[] = dayOffs.flatMap((dayOff) => {
    if (!dayOff.dates || dayOff.dates.length === 0) {
      return [];
    }

    return dayOff.dates.map((isoDate) => {
      const dateStr = isoDate.split("T")[0]; // "2026-01-10"
      const [year, month, day] = dateStr.split("-").map(Number);

      return {
        id: `${dayOff.id}-${dateStr}`,
        date: new Date(year, month - 1, day), // month - 1 porque JavaScript cuenta los meses desde 0
        title: "Day Off",
        description: dayOff.reason,
        color: "#FF6B6B",
        type: "holiday",
      } as CalendarEvent;
    });
  });

  // TODO: Cargar otros eventos del contractor desde la API (trabajo, reuniones, etc.)
  // Por ahora usaremos solo los días libres
  const events: CalendarEvent[] = [...dayOffEvents];

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    console.log("Event clicked:", event);
    // TODO: Abrir modal de detalle del evento o navegar a una vista detallada
  };

  return (
    <CalendarModal
      isOpen={true}
      onClose={onClose}
      title={`Calendar - ${contractorName}`}
      size="xl"
      calendarProps={{
        events,
        selectedDate,
        onDateSelect: handleDateSelect,
        onEventClick: handleEventClick,
        locale: locale === "es" ? "es-ES" : "en-US",
        showNavigation: true,
        showEventIndicators: true,
        allowDateSelection: true,
        workSchedule,
        showScheduleHeader: !!workSchedule,
      }}
      showHeader={true}
      overlayStyle={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
      containerStyle={{
        maxWidth: "900px",
        border: "1px solid rgba(166,166,166,0.5)",
        boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
        borderRadius: "10px",
      }}
    />
  );
};
