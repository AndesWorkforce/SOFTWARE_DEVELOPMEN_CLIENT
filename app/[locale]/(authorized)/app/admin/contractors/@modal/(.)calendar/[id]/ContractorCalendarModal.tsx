"use client";

import { useState } from "react";
import { DsContractorCalendarModal, type CalendarEvent } from "@/packages/design-system";

interface ContractorCalendarModalProps {
  contractorId: string;
  contractorName?: string;
  onClose: () => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export const ContractorCalendarModal = ({
  onEventClick,
  ...props
}: ContractorCalendarModalProps) => {
  const [visible, setVisible] = useState(true);

  const handleEventClick = (event: CalendarEvent) => {
    setVisible(false);
    onEventClick?.(event);
  };

  if (!visible) return null;

  return (
    <DsContractorCalendarModal
      {...props}
      onEventClick={onEventClick ? handleEventClick : undefined}
    />
  );
};
