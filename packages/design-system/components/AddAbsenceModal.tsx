"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FormModalLayout } from "./FormModalLayout";
import { FormField } from "./FormField";
import { Input, Select, Button } from "@/packages/design-system";
import { contractorsService } from "@/packages/api/contractors/contractors.service";
import { CheckCircle2 } from "lucide-react";

export interface AddAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractorId: string;
  onSuccess?: () => void;
}

export function AddAbsenceModal({
  isOpen,
  onClose,
  contractorId,
  onSuccess,
}: AddAbsenceModalProps) {
  const t = useTranslations();
  const tContractor = useTranslations("contractors.modal");
  const tCalendar = useTranslations("calendar");

  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState("License");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClose = () => {
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate(new Date().toISOString().split("T")[0]);
    setType("License");
    setReason("");
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError(t("formValidation.required", { field: tContractor("date") }));
      return;
    }

    if (!reason.trim()) {
      setError(t("formValidation.required", { field: tContractor("description") }));
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmCreate = async () => {
    setError(null);
    setLoading(true);

    try {
      // Generate array of dates between start and end
      const dates: string[] = [];

      // Use UTC dates to avoid timezone issues
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Add timezone offset to get the correct date in local time
      const current = new Date(start.getTime() + start.getTimezoneOffset() * 60000);
      const endUTC = new Date(end.getTime() + end.getTimezoneOffset() * 60000);

      while (current <= endUTC) {
        dates.push(current.toISOString());
        current.setUTCDate(current.getUTCDate() + 1);
      }

      await contractorsService.createDayOff(contractorId, {
        dates,
        type,
        reason,
      });

      if (onSuccess) {
        onSuccess();
      }

      setShowConfirm(false);
      setShowSuccess(true);
    } catch (err) {
      console.error("Error creating absence:", err);
      setError(tContractor("errorCreating"));
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

  return (
    <>
      <FormModalLayout
        isOpen={isOpen}
        onClose={handleClose}
        title={tCalendar("addAbsence")}
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
              {loading ? tContractor("adding") : tContractor("addLicense")}
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
          {/* Type License */}
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

          {/* Dates Row */}
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
                  {/* Icon overlay if needed, but native date picker has its own */}
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

          {/* Description */}
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

      {/* Confirmation modal */}
      <FormModalLayout
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title={tContractor("confirmTitle") || "Add License?"}
        size="sm"
        errorMessage={null}
        modalStyle={{ maxWidth: "338px" }}
        footer={
          <div className="flex w-full flex-col gap-[10px]">
            <Button
              type="button"
              onClick={handleConfirmCreate}
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
              {tContractor("confirmYes") || "Yes"}
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
              {tContractor("confirmNo") || "Cancel"}
            </Button>
          </div>
        }
      >
        <p className="text-center text-[16px] text-[#4B4B4B]">
          {tContractor("confirmSubtitle") || "Are you sure you want to add this license?"}
        </p>
      </FormModalLayout>

      {/* Success modal */}
      <FormModalLayout
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          handleClose();
        }}
        title={tContractor("successTitle") || "License added successfully"}
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
            {tContractor("successContinue") || "Continue"}
          </Button>
        }
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#E0F2FE]">
            <CheckCircle2 className="h-8 w-8 text-[#0097B2]" />
          </div>
          <p className="text-center text-[16px] text-[#4B4B4B]">
            {tContractor("successMessage") || "The absence has been added to the calendar."}
          </p>
        </div>
      </FormModalLayout>
    </>
  );
}
