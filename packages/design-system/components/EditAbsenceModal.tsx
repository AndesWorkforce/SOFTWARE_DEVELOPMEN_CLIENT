"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FormModalLayout } from "./FormModalLayout";
import { FormField } from "./FormField";
import { Input, Select, Button } from "@/packages/design-system";
import { contractorsService } from "@/packages/api/contractors/contractors.service";
import type { ContractorDayOff } from "@/packages/types/contractors.types";
import { CheckCircle2 } from "lucide-react";

export interface EditAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayOff: ContractorDayOff | null;
  onSuccess?: () => void;
}

function parseToDateInput(isoDate: string): string {
  if (isoDate.includes("T") && isoDate.length >= 10) {
    return isoDate.slice(0, 10);
  }
  const d = new Date(isoDate);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function EditAbsenceModal({ isOpen, onClose, dayOff, onSuccess }: EditAbsenceModalProps) {
  const t = useTranslations();
  const tContractor = useTranslations("contractors.modal");
  const tCalendar = useTranslations("calendar");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("License");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && dayOff?.dates?.length) {
      const first = dayOff.dates[0];
      const last = dayOff.dates[dayOff.dates.length - 1];
      setStartDate(parseToDateInput(first));
      setEndDate(parseToDateInput(last));
      setType(dayOff.type || "License");
      setReason(dayOff.reason || "");
    }
  }, [isOpen, dayOff]);

  const handleClose = () => {
    setError(null);
    setShowConfirm(false);
    setShowSuccess(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError(t("formValidation.required", { field: tContractor("startDate") }));
      return;
    }

    if (!reason.trim()) {
      setError(t("formValidation.required", { field: tContractor("description") }));
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmUpdate = async () => {
    if (!dayOff) return;
    setError(null);
    setLoading(true);

    try {
      const dates: string[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      const current = new Date(start.getTime() + start.getTimezoneOffset() * 60000);
      const endUTC = new Date(end.getTime() + end.getTimezoneOffset() * 60000);

      while (current <= endUTC) {
        dates.push(current.toISOString());
        current.setUTCDate(current.getUTCDate() + 1);
      }

      await contractorsService.updateDayOff(dayOff.id, {
        dates,
        type,
        reason,
      });

      if (onSuccess) onSuccess();
      setShowConfirm(false);
      setShowSuccess(true);
    } catch (err) {
      console.error("Error updating absence:", err);
      setError(tContractor("errorUpdating"));
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const absenceTypeOptions = [
    { value: "License", label: tCalendar("filters.absenceTypeLicense") },
    { value: "Vacation", label: tCalendar("filters.absenceTypeVacation") },
    { value: "Health", label: tCalendar("filters.absenceTypeHealth") },
  ];

  if (!dayOff) return null;

  return (
    <>
      <FormModalLayout
        isOpen={isOpen}
        onClose={handleClose}
        title={tCalendar("editAbsence")}
        size="md"
        errorMessage={error}
        modalStyle={{
          maxWidth: "420px",
          padding: "30px 40px",
        }}
        titleStyle={{
          fontSize: "24px",
          fontWeight: 600,
          marginBottom: "0px",
        }}
        footer={
          <div className="flex w-full flex-col gap-[10px]">
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
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
              {loading ? tContractor("saving") : tContractor("saveButton")}
            </Button>
            <Button
              type="button"
              onClick={handleClose}
              disabled={loading}
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
              {tContractor("cancel")}
            </Button>
          </div>
        }
      >
        <form className="flex w-full flex-col gap-[25px]" onSubmit={handleSubmit}>
          <FormField label={tContractor("typeLicense")} required>
            <div className="relative">
              <Select
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={absenceTypeOptions}
                className="h-[45px] w-full rounded-[10px] border border-[#b6b4b4] px-[15px] text-[16px] text-black focus:border-[#0097B2] focus:outline-none"
                style={{ borderColor: "#b6b4b4" }}
              />
            </div>
          </FormField>

          <div className="flex w-full gap-[25px]">
            <div className="flex-1 min-w-0">
              <FormField label={tContractor("startDate")} required>
                <div className="relative">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-[45px] w-full rounded-[10px] border border-[#b6b4b4] px-[15px] text-[16px] text-[#b6b4b4] focus:border-[#0097B2] focus:outline-none"
                    style={{ borderColor: "#b6b4b4", color: startDate ? "#000000" : "#b6b4b4" }}
                  />
                </div>
              </FormField>
            </div>
            <div className="flex-1 min-w-0">
              <FormField label={tContractor("finishDate")} required>
                <div className="relative">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-[45px] w-full rounded-[10px] border border-[#b6b4b4] px-[15px] text-[16px] text-[#b6b4b4] focus:border-[#0097B2] focus:outline-none"
                    style={{ borderColor: "#b6b4b4", color: endDate ? "#000000" : "#b6b4b4" }}
                  />
                </div>
              </FormField>
            </div>
          </div>

          <FormField label={tContractor("description") || "Description"} required>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={tContractor("descriptionPlaceholder")}
              className="h-[95px] w-full resize-none rounded-[10px] border border-[#b6b4b4] px-[15px] py-[12px] text-[16px] text-black placeholder-[#a6a6a6] focus:border-[#0097B2] focus:outline-none"
            />
          </FormField>
        </form>
      </FormModalLayout>

      {/* Confirmación guardar cambios */}
      <FormModalLayout
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title={tContractor("editConfirmTitle") || "Save changes?"}
        size="sm"
        errorMessage={null}
        modalStyle={{ maxWidth: "338px" }}
        footer={
          <div className="flex w-full flex-col gap-[10px]">
            <Button
              type="button"
              onClick={handleConfirmUpdate}
              disabled={loading}
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
              {tContractor("editConfirmSave") || "Save Changes"}
            </Button>
            <Button
              type="button"
              onClick={() => setShowConfirm(false)}
              disabled={loading}
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
              {tContractor("editConfirmCancel") || "Cancel"}
            </Button>
          </div>
        }
      >
        <p className="text-center text-[16px] text-[#4B4B4B]">
          {tContractor("editConfirmSubtitle") || "Are you sure you want to save your changes?"}
        </p>
      </FormModalLayout>

      {/* Éxito */}
      <FormModalLayout
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          handleClose();
        }}
        title={tContractor("editSuccessTitle") || "Changes saved successfully"}
        size="sm"
        errorMessage={null}
        modalStyle={{ maxWidth: "338px" }}
        footer={
          <Button
            type="button"
            onClick={() => {
              setShowSuccess(false);
              handleClose();
            }}
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
            {tContractor("editSuccessContinue") || "Continue"}
          </Button>
        }
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#E0F2FE]">
            <CheckCircle2 className="h-8 w-8 text-[#0097B2]" />
          </div>
          <p className="text-center text-[16px] text-[#4B4B4B]">
            {tContractor("editSuccessMessage") || "The absence has been updated."}
          </p>
        </div>
      </FormModalLayout>
    </>
  );
}
