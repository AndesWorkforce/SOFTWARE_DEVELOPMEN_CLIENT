"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, FormField, FormModalLayout, Input } from "@/packages/design-system";
import { jobPositionsService } from "@/packages/api/job-positions/job-positions.service";
import { CircleCheck } from "lucide-react";
import {
  FORM_CONTROL_CLASS,
  getFormControlStyle,
  FORM_PRIMARY_BUTTON_STYLE,
  FORM_SECONDARY_BUTTON_STYLE,
} from "@/packages/types/formUi.constants";
import { requiredMessage } from "@/packages/types/formValidation.helpers";

interface EditJobPositionModalProps {
  positionId: string;
  onClose: () => void;
  onUpdated?: () => void;
}

type EditJobPositionFormValues = {
  name: string;
  description: string;
};

export function EditJobPositionModal({
  positionId,
  onClose,
  onUpdated,
}: EditJobPositionModalProps) {
  const t = useTranslations("jobPositions.modal");
  const tCommon = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingValues, setPendingValues] = useState<EditJobPositionFormValues | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = useMemo(() => {
    const req = (field: string) => requiredMessage(tCommon, field);
    return z.object({
      name: z
        .string()
        .trim()
        .min(1, req(t("name") || "Name")),
      description: z.string().trim().optional().default(""),
    });
  }, [t, tCommon]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditJobPositionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: (() => {
      const position = jobPositionsService.getById(positionId);
      return position
        ? { name: position.name, description: position.description || "" }
        : { name: "", description: "" };
    })(),
    mode: "onSubmit",
  });

  const onSubmitForm = (values: EditJobPositionFormValues) => {
    setSubmitError(null);
    setPendingValues(values);
    setShowConfirm(true);
  };

  const handleConfirmUpdate = () => {
    if (!pendingValues) return;
    setShowConfirm(false);

    startTransition(() => {
      try {
        jobPositionsService.update(positionId, {
          name: pendingValues.name,
          description: pendingValues.description || undefined,
        });
        if (onUpdated) onUpdated();
        setShowSuccess(true);
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : t("errorUpdating") || "Error updating job position.",
        );
      }
    });
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setPendingValues(null);
    setSubmitError(null);
  };

  const handleContinueSuccess = () => {
    setShowSuccess(false);
    onClose();
  };

  if (!jobPositionsService.getById(positionId)) return null;

  return (
    <>
      <FormModalLayout
        isOpen={!showConfirm && !showSuccess}
        onClose={onClose}
        title={t("editTitle") || "Edit Job Position"}
        size="md"
        contentPadding="30px 40px"
        modalStyle={{ width: "100%", maxWidth: "583px" }}
      >
        <form onSubmit={handleSubmit(onSubmitForm)} className="w-full max-w-[503px] mx-auto">
          <div className="flex flex-col gap-[25px] items-start w-full">
            <div className="w-full">
              <FormField label={t("name") || "Name"} error={errors.name?.message} required>
                <Input
                  {...register("name")}
                  placeholder={t("namePlaceholder") || "e.g. Software Engineer"}
                  className={FORM_CONTROL_CLASS}
                  style={getFormControlStyle(!!errors.name)}
                  disabled={isPending}
                />
              </FormField>
            </div>

            <div className="w-full">
              <FormField
                label={t("description") || "Description"}
                error={errors.description?.message}
              >
                <Input
                  {...register("description")}
                  placeholder={t("descriptionPlaceholder") || "Type a description here..."}
                  className={FORM_CONTROL_CLASS}
                  style={getFormControlStyle(!!errors.description)}
                  disabled={isPending}
                />
              </FormField>
            </div>

            {submitError && <p className="text-[#FF0004] text-sm w-full">{submitError}</p>}

            <div className="flex flex-col md:flex-row gap-[10px] w-full pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full md:flex-1"
                style={FORM_PRIMARY_BUTTON_STYLE}
              >
                {isPending ? t("saving") || "Saving..." : t("saveButton") || "Save Changes"}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="w-full md:flex-1"
                style={FORM_SECONDARY_BUTTON_STYLE}
              >
                {t("cancel") || "Cancel"}
              </Button>
            </div>
          </div>
        </form>
      </FormModalLayout>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[10px] shadow-[0px_4px_4px_rgba(166,166,166,0.25)] px-[40px] py-[30px] w-[80%] max-w-[423px] md:max-w-[480px] md:w-full flex items-center justify-center">
            <div className="flex flex-col gap-[30px] items-center w-full max-w-[343px] md:max-w-[400px]">
              <div className="flex flex-col gap-[15px] text-center w-full">
                <h2 className="text-[24px] font-bold text-black">
                  {t("editConfirmTitle") || "Save changes?"}
                </h2>
                <p className="text-[16px] font-normal text-[#1E1E1E]">
                  {t("editConfirmSubtitle") || "Are you sure you want to save your changes?"}
                </p>
              </div>
              <div className="flex flex-col md:flex-row gap-[10px] w-full">
                <Button
                  type="button"
                  onClick={handleConfirmUpdate}
                  disabled={isPending}
                  className="w-full md:flex-1"
                  style={FORM_PRIMARY_BUTTON_STYLE}
                >
                  {t("editConfirmSave") || "Save Changes"}
                </Button>
                <Button
                  type="button"
                  onClick={handleCancelConfirm}
                  disabled={isPending}
                  className="w-full md:flex-1"
                  style={FORM_SECONDARY_BUTTON_STYLE}
                >
                  {t("editConfirmCancel") || "Cancel"}
                </Button>
              </div>
              {submitError && (
                <p className="text-[#FF0004] text-sm w-full text-center">{submitError}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success dialog */}
      {showSuccess && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
          <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[10px] shadow-[0px_4px_4px_rgba(166,166,166,0.25)] px-[40px] py-[30px] flex items-center justify-center w-[80%] max-w-[400px] md:w-full">
            <div className="flex flex-col items-center justify-between h-[184px] w-[360px] gap-[15px]">
              <div className="flex flex-col items-center gap-[15px] w-full">
                <CircleCheck className="w-[75px] h-[75px] text-[#0097b2]" />
                <p className="text-[16px] text-center text-[#1e1e1e] font-normal leading-normal">
                  {t("editSuccessTitle") || "Changes saved successfully"}
                </p>
              </div>
              <Button
                type="button"
                onClick={handleContinueSuccess}
                style={{
                  background: "#0097b2",
                  color: "#FFFFFF",
                  height: "45px",
                  padding: "12px 15px",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: 600,
                  width: "100%",
                  boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
                }}
              >
                {t("editSuccessContinue") || "Continue"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
