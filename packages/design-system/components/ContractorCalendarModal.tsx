"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Plus } from "lucide-react";

import { CalendarModal, type CalendarEvent, type WorkSchedule } from "./CalendarModal";
import { AddAbsenceModal } from "./AddAbsenceModal";
import { EditAbsenceModal } from "./EditAbsenceModal";
import { FormModalLayout } from "./FormModalLayout";
import { Button } from "@/packages/design-system";
import { contractorsService } from "@/packages/api/contractors/contractors.service";
import type { Contractor, ContractorDayOff } from "@/packages/types/contractors.types";

export interface DsContractorCalendarModalProps {
  contractorId: string;
  contractorName?: string;
  onClose: () => void;
}

export const DsContractorCalendarModal = ({
  contractorId,
  contractorName: initialName,
  onClose,
}: DsContractorCalendarModalProps) => {
  const locale = useLocale();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [dayOffs, setDayOffs] = useState<ContractorDayOff[]>([]);
  const [isAddAbsenceModalOpen, setIsAddAbsenceModalOpen] = useState(false);
  const [isEditAbsenceModalOpen, setIsEditAbsenceModalOpen] = useState(false);
  const [dayOffToEdit, setDayOffToEdit] = useState<ContractorDayOff | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dayOffToDelete, setDayOffToDelete] = useState<ContractorDayOff | null>(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const tCalendar = useTranslations("calendar");
  const tContractor = useTranslations("contractors.modal");

  const loadContractorData = useCallback(async () => {
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
  }, [contractorId]);

  useEffect(() => {
    loadContractorData();
  }, [loadContractorData]);

  const contractorName = contractor?.name || initialName || "Contractor";

  const workSchedule: WorkSchedule | undefined = contractor
    ? {
        startTime: contractor.work_schedule_start || "08:00",
        finishTime: contractor.work_schedule_end || "17:00",
        lunchStart: contractor.lunch_start || undefined,
        lunchEnd: contractor.lunch_end || undefined,
      }
    : undefined;

  const dayOffEvents: CalendarEvent[] = dayOffs.flatMap((dayOff) => {
    if (!dayOff.dates || dayOff.dates.length === 0) {
      return [];
    }

    const type = dayOff.type as "License" | "Vacation" | "Health" | undefined;

    let titleByType = "Day Off";
    if (type === "License") {
      titleByType = tCalendar("filters.absenceTypeLicense");
    } else if (type === "Vacation") {
      titleByType = tCalendar("filters.absenceTypeVacation");
    } else if (type === "Health") {
      titleByType = tCalendar("filters.absenceTypeHealth");
    }

    return dayOff.dates.map((isoDate) => {
      const dateStr = isoDate.split("T")[0];
      const [year, month, day] = dateStr.split("-").map(Number);

      return {
        id: `${dayOff.id}-${dateStr}`,
        date: new Date(year, month - 1, day),
        title: titleByType,
        description: dayOff.reason,
        color: "#FF6B6B",
        type: "holiday",
        dayOffType: type,
        dayOffId: dayOff.id,
      } as CalendarEvent;
    });
  });

  const events: CalendarEvent[] = [...dayOffEvents];

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    console.log("Event clicked:", event);
  };

  const handleEventEdit = (event: CalendarEvent) => {
    if (!event.dayOffId) return;
    const dayOff = dayOffs.find((d) => d.id === event.dayOffId);
    if (dayOff) {
      setDayOffToEdit(dayOff);
      setIsEditAbsenceModalOpen(true);
    }
  };

  const handleEventDelete = (event: CalendarEvent) => {
    if (!event.dayOffId) return;
    const dayOff = dayOffs.find((d) => d.id === event.dayOffId);
    if (dayOff) {
      setDayOffToDelete(dayOff);
      setDeleteError(null);
      setShowDeleteConfirm(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!dayOffToDelete) return;
    setDeleteError(null);
    setDeleteLoading(true);
    try {
      await contractorsService.deleteDayOff(dayOffToDelete.id);
      setShowDeleteConfirm(false);
      setDayOffToDelete(null);
      loadContractorData();
      setShowDeleteSuccess(true);
    } catch (err) {
      console.error("Error deleting absence:", err);
      setDeleteError(tContractor("errorDeleting"));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenAddAbsenceModal = () => {
    setIsAddAbsenceModalOpen(true);
  };

  const handleCloseAddAbsenceModal = () => {
    setIsAddAbsenceModalOpen(false);
  };

  const handleAbsenceAdded = () => {
    loadContractorData();
  };

  return (
    <>
      <CalendarModal
        isOpen={true}
        onClose={onClose}
        title={`Calendar - ${contractorName}`}
        showHeader={false}
        size="xl"
        contentClassName="pt-3 pb-4 px-2"
        headerRight={
          <button
            type="button"
            onClick={handleOpenAddAbsenceModal}
            className="inline-flex h-[40px] items-center justify-center gap-[10px] rounded-[10px] bg-[#0097B2] px-[15px] text-[15px] font-medium text-white shadow-sm hover:bg-[#00869E] transition-colors"
            style={{
              boxShadow: "0px 4px 4px rgba(166, 166, 166, 0.25)",
            }}
          >
            <Plus className="h-5 w-5 text-white" />
            <span>{tCalendar("addAbsence")}</span>
          </button>
        }
        calendarProps={{
          events,
          selectedDate,
          onDateSelect: handleDateSelect,
          onEventClick: handleEventClick,
          onEventEdit: handleEventEdit,
          onEventDelete: handleEventDelete,
          locale: locale === "es" ? "es-ES" : "en-US",
          showNavigation: true,
          showEventIndicators: true,
          allowDateSelection: true,
          workSchedule,
          showScheduleHeader: !!workSchedule,
        }}
        overlayStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
        containerStyle={{
          maxWidth: "1040px",
          border: "1px solid rgba(166,166,166,0.5)",
          boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
          borderRadius: "10px",
        }}
      />

      <AddAbsenceModal
        isOpen={isAddAbsenceModalOpen}
        onClose={handleCloseAddAbsenceModal}
        contractorId={contractorId}
        onSuccess={handleAbsenceAdded}
      />

      <EditAbsenceModal
        isOpen={isEditAbsenceModalOpen}
        onClose={() => {
          setIsEditAbsenceModalOpen(false);
          setDayOffToEdit(null);
        }}
        dayOff={dayOffToEdit}
        onSuccess={handleAbsenceAdded}
      />

      {/* Confirmación eliminar ausencia */}
      <FormModalLayout
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDayOffToDelete(null);
          setDeleteError(null);
        }}
        title={tCalendar("deleteAbsenceConfirmTitle")}
        size="sm"
        errorMessage={deleteError}
        modalStyle={{ maxWidth: "338px" }}
        footer={
          <div className="flex w-full flex-col gap-[10px]">
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
              style={{
                width: "100%",
                height: "45px",
                background: "#FF0004",
                color: "#FFFFFF",
                fontSize: "16px",
                fontWeight: 600,
                borderRadius: "10px",
                boxShadow: "0px 4px 4px rgba(166, 166, 166, 0.25)",
              }}
            >
              {deleteLoading
                ? tCalendar("deleteAbsenceDeleting")
                : tContractor("deleteConfirmDelete")}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDayOffToDelete(null);
                setDeleteError(null);
              }}
              disabled={deleteLoading}
              style={{
                width: "100%",
                height: "45px",
                background: "#A6A6A6",
                color: "#FFFFFF",
                fontSize: "16px",
                fontWeight: 600,
                borderRadius: "10px",
                boxShadow: "0px 4px 4px rgba(166, 166, 166, 0.25)",
              }}
            >
              {tContractor("deleteConfirmCancel")}
            </Button>
          </div>
        }
      >
        <p className="text-center text-[16px] text-[#4B4B4B]">
          {tCalendar("deleteAbsenceConfirmSubtitle")}
        </p>
      </FormModalLayout>

      {/* Éxito eliminación */}
      <FormModalLayout
        isOpen={showDeleteSuccess}
        onClose={() => setShowDeleteSuccess(false)}
        title={tCalendar("deleteAbsenceSuccessTitle")}
        size="sm"
        errorMessage={null}
        modalStyle={{ maxWidth: "338px" }}
        footer={
          <Button
            type="button"
            onClick={() => setShowDeleteSuccess(false)}
            style={{
              width: "100%",
              height: "45px",
              background: "#0097B2",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: 600,
              borderRadius: "10px",
              boxShadow: "0px 4px 4px rgba(166, 166, 166, 0.25)",
            }}
          >
            {tContractor("deleteSuccessContinue")}
          </Button>
        }
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#E0F2FE]">
            <CheckCircle2 className="h-8 w-8 text-[#0097B2]" />
          </div>
          <p className="text-center text-[16px] text-[#4B4B4B]">
            {tCalendar("deleteAbsenceSuccessMessage")}
          </p>
        </div>
      </FormModalLayout>
    </>
  );
};
