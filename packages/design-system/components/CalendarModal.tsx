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
  /**
   * Contenido opcional a la derecha del título cuando showHeader === false
   * (por ejemplo, un botón de acción contextual).
   */
  headerRight?: React.ReactNode;
  /**
   * Clases para el contenedor interno del calendario
   * (por defecto, padding estándar del modal).
   */
  contentClassName?: string;
}

export const CalendarModal = ({
  isOpen,
  onClose,
  title = "Calendar",
  calendarProps,
  size = "xl",
  headerRight,
  contentClassName = "p-6",
  ...modalProps
}: CalendarModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size} {...modalProps}>
      <div className={contentClassName}>
        {modalProps.showHeader === false && (
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">{title}</h2>
            {headerRight ? <div className="flex shrink-0">{headerRight}</div> : null}
          </div>
        )}
        <Calendar {...calendarProps} />
      </div>
    </Modal>
  );
};

// Re-exportar tipos útiles
export type { CalendarEvent, CalendarProps, WorkSchedule };
