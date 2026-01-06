"use client";

import { Modal, type ModalProps } from "./Modal";
import { Calendar, type CalendarProps, type CalendarEvent, type WorkSchedule } from "./Calendar";

export interface CalendarModalProps extends Omit<ModalProps, "children"> {
  /**
   * Props del calendario
   */
  calendarProps: CalendarProps;
  /**
   * Título del modal (opcional, sobrescribe el título por defecto)
   */
  title?: string;
}

export const CalendarModal = ({
  isOpen,
  onClose,
  title = "Calendar",
  calendarProps,
  size = "xl",
  ...modalProps
}: CalendarModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size} {...modalProps}>
      <div className="p-6">
        <Calendar {...calendarProps} />
      </div>
    </Modal>
  );
};

// Re-exportar tipos útiles
export type { CalendarEvent, CalendarProps, WorkSchedule };
