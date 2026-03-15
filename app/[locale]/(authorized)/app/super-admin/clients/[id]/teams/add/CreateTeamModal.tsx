"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck } from "lucide-react";
import { Button, FormField, FormModalLayout, Input } from "@/packages/design-system";
import { teamsService } from "@/packages/api/teams/teams.service";
import { invalidEmailMessage, requiredMessage } from "@/packages/types/formValidation.helpers";
import {
  FORM_CONTROL_CLASS,
  getFormControlStyle,
  FORM_PRIMARY_BUTTON_STYLE,
  FORM_SECONDARY_BUTTON_STYLE,
  FORM_TEXTAREA_CLASS,
} from "@/packages/types/formUi.constants";

type CreateTeamFormValues = {
  name: string;
  description: string;
};

export function CreateTeamModal({ clientId }: { clientId: string }) {
  const t = useTranslations("teams.modal");
  const tCommon = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<CreateTeamFormValues | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = useMemo(() => {
    // (invalidEmailMessage import kept only to keep helpers centralized; not used here)
    void invalidEmailMessage;
    const req = (field: string) => requiredMessage(tCommon, field);
    return z.object({
      name: z
        .string()
        .trim()
        .min(1, req(t("name") || "Name")),
      description: z.string().trim().optional().or(z.literal("")),
    });
  }, [t, tCommon]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTeamFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onSubmit",
  });

  const basePath = `/${locale}/app/super-admin/clients/${clientId}`;

  const onClose = () => {
    router.back();
    window.setTimeout(() => {
      router.replace(basePath);
    }, 50);
  };

  const onSubmit = (values: CreateTeamFormValues) => {
    setPendingPayload(values);
    setSubmitError(null);
    setShowConfirm(true);
  };

  const handleConfirmCreate = () => {
    if (!pendingPayload) return;
    setSubmitError(null);

    startTransition(() => {
      (async () => {
        try {
          const description = pendingPayload.description.trim() || undefined;
          await teamsService.create({
            name: pendingPayload.name.trim(),
            client_id: clientId,
            description,
          });
          setShowConfirm(false);
          setPendingPayload(null);
          setShowSuccess(true);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : t("errorCreating") || "Error creating team. Please try again.";
          console.error("Error creating team:", error);
          setSubmitError(message);
        }
      })();
    });
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setPendingPayload(null);
    setSubmitError(null);
  };

  const handleContinueSuccess = () => {
    setShowSuccess(false);
    onClose();
  };

  return (
    <>
      <FormModalLayout
        isOpen={!showConfirm && !showSuccess}
        onClose={onClose}
        title={t("createTitle") || "Create Team"}
        size="md"
        contentPadding="25px 40px"
        modalStyle={{ width: "100%", maxWidth: "480px" }}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-[400px] mx-auto"
          style={{ marginBottom: "25px" }}
        >
          <div className="flex flex-col gap-[25px] items-start w-full">
            <FormField label={t("name") || "Name"} error={errors.name?.message} required>
              <Input
                {...register("name")}
                placeholder={t("namePlaceholder") || "Type team name here..."}
                className={FORM_CONTROL_CLASS}
                style={getFormControlStyle(!!errors.name)}
              />
            </FormField>

            <FormField
              label={t("description") || "Description"}
              error={errors.description?.message}
            >
              <textarea
                {...register("description")}
                placeholder={t("descriptionPlaceholder") || "Type the description here..."}
                className={FORM_TEXTAREA_CLASS}
                style={{
                  borderColor: errors.description ? "#ef4444" : "#b6b4b4",
                  color: "#000000",
                  height: "95px",
                  minHeight: "95px",
                  resize: "none",
                }}
              />
            </FormField>
          </div>

          <div className="flex flex-col gap-[10px] items-start w-full mt-[25px]">
            <Button type="submit" disabled={isPending} style={FORM_PRIMARY_BUTTON_STYLE}>
              {t("createButton") || "Create Team"}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              disabled={isPending}
              style={FORM_SECONDARY_BUTTON_STYLE}
            >
              {t("cancel") || "Cancel"}
            </Button>
          </div>
        </form>
      </FormModalLayout>

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[10px] shadow-[0px_4px_4px_rgba(166,166,166,0.25)] px-[40px] py-[30px] md:py-[25px] w-[80%] max-w-[401px] md:max-w-[480px] md:w-full flex items-center justify-center">
            <div className="flex flex-col gap-[30px] items-center w-full max-w-[321px] md:max-w-[400px]">
              <div className="flex flex-col gap-[15px] text-center w-full">
                <h2 className="text-[24px] font-bold text-black">{t("confirmTitle")}</h2>
                <p className="text-[16px] font-normal text-[#1E1E1E]">{t("confirmSubtitle")}</p>
                {submitError && (
                  <p className="text-[14px] font-medium text-red-600">{submitError}</p>
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-[10px] w-full">
                <Button
                  type="button"
                  onClick={handleConfirmCreate}
                  disabled={isPending}
                  className="w-full md:flex-1"
                  style={{
                    background: "#0097B2",
                    color: "#FFFFFF",
                    height: "45px",
                    padding: "12px 15px",
                    borderRadius: "10px",
                    fontSize: "16px",
                    fontWeight: 600,
                    boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
                  }}
                >
                  {t("confirmYes")}
                </Button>
                <Button
                  type="button"
                  onClick={handleCancelConfirm}
                  disabled={isPending}
                  className="w-full md:flex-1"
                  style={{
                    background: "#A6A6A6",
                    color: "#FFFFFF",
                    height: "45px",
                    padding: "12px 15px",
                    borderRadius: "10px",
                    fontSize: "16px",
                    fontWeight: 600,
                    boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
                  }}
                >
                  {t("confirmNo")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
          <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[10px] shadow-[0px_4px_4px_rgba(166,166,166,0.25)] px-[40px] py-[30px] flex items-center justify-center w-[80%] max-w-[400px] md:w-full">
            <div className="flex flex-col items-center justify-between h-[184px] w-[360px] gap-[15px]">
              <div className="flex flex-col items-center gap-[15px] w-full">
                <CircleCheck className="w-[75px] h-[75px] text-[#0097B2]" />
                <p
                  className="text-[16px] text-center text-[#1e1e1e] font-normal leading-normal"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {t("successTitle")}
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
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {t("successContinue")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
