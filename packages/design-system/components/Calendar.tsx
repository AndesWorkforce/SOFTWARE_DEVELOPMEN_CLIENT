"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Clock, Utensils } from "lucide-react";
import { DayOffBadge } from "./DayOffBadge";

export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  description?: string;
  color?: string;
  type?: "work" | "meeting" | "holiday" | "other";
  /**
   * Tipo de day off asociado (solo para eventos de ausencia)
   */
  dayOffType?: "License" | "Vacation" | "Health";
  /**
   * ID del day off en backend (para editar/eliminar)
   */
  dayOffId?: string;
}

export interface WorkSchedule {
  startTime: string; // "08:00"
  finishTime: string; // "17:00"
  lunchStart?: string; // "12:00"
  lunchEnd?: string; // "13:00"
}

export interface CalendarProps {
  /**
   * Array de eventos a mostrar en el calendario
   */
  events?: CalendarEvent[];
  /**
   * Fecha seleccionada actual
   */
  selectedDate?: Date;
  /**
   * Callback cuando se selecciona una fecha
   */
  onDateSelect?: (date: Date) => void;
  /**
   * Callback cuando se hace click en un evento
   */
  onEventClick?: (event: CalendarEvent) => void;
  /**
   * Callback cuando se hace click en editar (ícono lápiz del day off)
   */
  onEventEdit?: (event: CalendarEvent) => void;
  /**
   * Callback cuando se hace click en eliminar (ícono papelera del day off)
   */
  onEventDelete?: (event: CalendarEvent) => void;
  /**
   * Fecha mínima seleccionable
   */
  minDate?: Date;
  /**
   * Fecha máxima seleccionable
   */
  maxDate?: Date;
  /**
   * Locale para formateo de fechas (default: "en-US")
   */
  locale?: string;
  /**
   * Clases personalizadas para el contenedor
   */
  className?: string;
  /**
   * Estilos personalizados
   */
  style?: React.CSSProperties;
  /**
   * Mostrar botones de navegación
   */
  showNavigation?: boolean;
  /**
   * Mostrar indicadores de eventos
   */
  showEventIndicators?: boolean;
  /**
   * Permitir selección de fecha
   */
  allowDateSelection?: boolean;
  /**
   * Horario de trabajo (para mostrar en el header)
   */
  workSchedule?: WorkSchedule;
  /**
   * Mostrar header de horarios
   */
  showScheduleHeader?: boolean;
}

export const Calendar = ({
  events = [],
  selectedDate,
  onDateSelect,
  onEventClick,
  onEventEdit,
  onEventDelete,
  minDate,
  maxDate,
  locale = "en-US",
  className = "",
  style,
  showNavigation = true,
  showEventIndicators = true,
  allowDateSelection = true,
  workSchedule,
  showScheduleHeader = false,
}: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

  // Obtener el primer y último día del mes actual
  const firstDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  }, [currentDate]);

  const lastDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  }, [currentDate]);

  // Obtener día de la semana del primer día (ajustado para que lunes = 0)
  const firstDayWeekday = useMemo(() => {
    const day = firstDayOfMonth.getDay();
    // Convertir de domingo=0 a lunes=0
    return day === 0 ? 6 : day - 1;
  }, [firstDayOfMonth]);

  // Obtener el número total de días en el mes
  const daysInMonth = lastDayOfMonth.getDate();

  // Obtener los nombres de los días de la semana (comenzando en lunes)
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date(2024, 0, i); // Enero 2024 empieza en lunes
      days.push(date.toLocaleDateString(locale, { weekday: "short" }).toUpperCase());
    }
    return days;
  }, [locale]);

  // Obtener el nombre del mes y año
  const monthYearText = useMemo(() => {
    return currentDate.toLocaleDateString(locale, { month: "long", year: "numeric" });
  }, [currentDate, locale]);

  // Navegar al mes anterior
  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navegar al mes siguiente
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Verificar si una fecha está deshabilitada
  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  // Verificar si una fecha es la fecha seleccionada
  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Verificar si una fecha es hoy
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Obtener eventos de una fecha específica
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Manejar click en una fecha
  const handleDateClick = (date: Date) => {
    if (!allowDateSelection || isDateDisabled(date)) return;
    onDateSelect?.(date);
  };

  // Generar los días del calendario
  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];

    // Agregar días vacíos al inicio
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(null);
    }

    // Agregar los días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }

    return days;
  }, [currentDate, firstDayWeekday, daysInMonth]);

  return (
    <div className={`calendar-container ${className}`} style={style}>
      {/* Header con información de horarios */}
      {showScheduleHeader && workSchedule && (
        <div className="calendar-schedule-header flex items-center justify-between gap-6 mb-6 px-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Clock className="w-5 h-5 text-gray-600" />
            <span>Start Time: {workSchedule.startTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Clock className="w-5 h-5 text-gray-600" />
            <span>Finish Time: {workSchedule.finishTime}</span>
          </div>
          {workSchedule.lunchStart && workSchedule.lunchEnd && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Utensils className="w-5 h-5 text-gray-600" />
              <span>
                Lunch Time: {workSchedule.lunchStart} to {workSchedule.lunchEnd}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Header con navegación */}
      <div className="calendar-header flex items-center justify-center mb-6 px-2 relative">
        {showNavigation && (
          <button
            onClick={handlePreviousMonth}
            className="absolute left-0 p-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
        )}
        <h2 className="text-lg font-semibold capitalize text-gray-900">{monthYearText}</h2>
        {showNavigation && (
          <button
            onClick={handleNextMonth}
            className="absolute right-0 p-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        )}
      </div>

      {/* Días de la semana */}
      <div className="calendar-weekdays grid grid-cols-7 gap-0 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="text-center text-xs font-medium text-gray-600 py-2 uppercase border-b border-gray-200"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="calendar-days grid grid-cols-7 gap-0 border-l border-t border-gray-200">
        {calendarDays.map((date, index) => {
          if (!date) {
            return (
              <div
                key={`empty-${index}`}
                className="calendar-day-empty border-r border-b border-gray-200 min-h-[100px] bg-gray-50"
              />
            );
          }

          const dateEvents = getEventsForDate(date);
          const isDisabled = isDateDisabled(date);
          const isSelected = isDateSelected(date);
          const isTodayDate = isToday(date);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              disabled={isDisabled}
              className={`
                calendar-day relative min-h-[100px] p-2 border-r border-b border-gray-200 transition-all text-left
                ${isDisabled ? "opacity-40 cursor-not-allowed bg-gray-50" : "cursor-pointer hover:bg-gray-50"}
                ${isSelected ? "bg-blue-50" : "bg-white"}
                ${isTodayDate && !isSelected ? "bg-blue-50/30" : ""}
              `}
              aria-label={`${date.toLocaleDateString(locale)}`}
            >
              <div className="flex flex-col h-full">
                <span
                  className={`text-sm font-medium mb-2 ${
                    isSelected ? "text-[#0097B2]" : isTodayDate ? "text-[#0097B2]" : "text-gray-900"
                  }`}
                >
                  {date.getDate()}
                </span>

                {/* Lista de eventos del día */}
                {showEventIndicators && dateEvents.length > 0 && (
                  <div className="flex flex-col gap-1 overflow-hidden">
                    {dateEvents.slice(0, 2).map((event) => {
                      const handleEventClick = (e: React.MouseEvent<HTMLDivElement>) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      };

                      if (event.dayOffType) {
                        return (
                          <DayOffBadge
                            key={event.id}
                            type={event.dayOffType}
                            label={event.title}
                            onClick={handleEventClick}
                            onEdit={
                              onEventEdit
                                ? (e) => {
                                    e.stopPropagation();
                                    onEventEdit(event);
                                  }
                                : undefined
                            }
                            onDelete={
                              onEventDelete
                                ? (e) => {
                                    e.stopPropagation();
                                    onEventDelete(event);
                                  }
                                : undefined
                            }
                          />
                        );
                      }

                      return (
                        <div
                          key={event.id}
                          className="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer"
                          style={{
                            backgroundColor: event.color || "#0097B2",
                            color: "white",
                          }}
                          title={event.title}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                        >
                          {event.title}
                        </div>
                      );
                    })}
                    {dateEvents.length > 2 && (
                      <span className="text-[10px] text-gray-600 px-1.5">
                        +{dateEvents.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
