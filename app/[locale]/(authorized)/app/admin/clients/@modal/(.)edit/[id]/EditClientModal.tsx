"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CircleCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, FormField, FormModalLayout, Input } from "@/packages/design-system";
import { clientsService, type Client } from "@/packages/api/clients/clients.service";
import {
  FORM_CONTROL_CLASS,
  getFormControlStyle,
  FORM_PRIMARY_BUTTON_STYLE,
  FORM_SECONDARY_BUTTON_STYLE,
  FORM_TEXTAREA_CLASS,
} from "@/packages/types/formUi.constants";
import { invalidEmailMessage, requiredMessage } from "@/packages/types/formValidation.helpers";

interface EditClientModalProps {
  clientId: string;
  onClose: () => void;
  onUpdated?: () => void;
}

type EditClientFormValues = {
  name: string;
  email: string;
  description: string;
};

export function EditClientModal({ clientId, onClose, onUpdated }: EditClientModalProps) {
  const t = useTranslations("clients.modal");
  const tCommon = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [initialValues, setInitialValues] = useState<EditClientFormValues>({
    name: "",
    email: "",
    description: "",
  });
  const [isReady, setIsReady] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingValues, setPendingValues] = useState<EditClientFormValues | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = useMemo(() => {
    const req = (field: string) => requiredMessage(tCommon, field);
    const invalidEmail = invalidEmailMessage(tCommon);
    return z.object({
      name: z
        .string()
        .trim()
        .min(1, req(t("name") || "Name")),
      email: z
        .string()
        .trim()
        .min(1, req(t("email") || "Email"))
        .email(invalidEmail),
      description: z.string().trim().optional().or(z.literal("")),
    });
  }, [t, tCommon]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditClientFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onSubmit",
  });

  useEffect(() => {
    // Si cambia el id (por navegación desde otra fila), reseteamos el estado para evitar datos stale
    setIsReady(false);
    setInitialValues({ name: "", email: "", description: "" });
    reset({ name: "", email: "", description: "" });

    const loadClient = async () => {
      try {
        const client: Client = await clientsService.getById(clientId);
        const nextValues: EditClientFormValues = {
          name: client.name || "",
          email: client.email || "",
          description: (client as { description?: string }).description || "",
        };
        setInitialValues(nextValues);
        reset(nextValues);
      } catch (error) {
        console.error("Error loading client for edit:", error);
      } finally {
        setIsReady(true);
      }
    };

    loadClient();
  }, [clientId, reset]);

  // Submit -> abrir confirmación con los valores validados por Zod
  const onSubmit = (values: EditClientFormValues) => {
    setPendingValues(values);
    setSubmitError(null);
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingValues) return;
    setSubmitError(null);

    startTransition(() => {
      (async () => {
        try {
          await clientsService.update(clientId, {
            name: pendingValues.name,
            email: pendingValues.email,
            description: pendingValues.description || null,
          });

          if (onUpdated) {
            onUpdated();
          }

          setShowConfirm(false);
          setPendingValues(null);
          setShowSuccess(true);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : t("errorUpdating") || "Error updating client. Please try again.";
          console.error("Error updating client:", error);
          setSubmitError(message);
        }
      })();
    });
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setPendingValues(null);
    setSubmitError(null);
  };

  const handleSuccessContinue = () => {
    setShowSuccess(false);
    onClose();
  };

  if (!isReady) return null;

  return (
    <>
      <FormModalLayout
        isOpen={isReady && !showConfirm && !showSuccess}
        onClose={onClose}
        title={t("editTitle") || "Edit Client"}
        size="md"
        contentPadding="25px 40px"
        modalStyle={{ width: "100%", maxWidth: "480px" }}
        errorMessage={submitError}
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
                placeholder={t("namePlaceholder") || "Type name here..."}
                className={FORM_CONTROL_CLASS}
                style={getFormControlStyle(!!errors.name)}
              />
            </FormField>

            <FormField label={t("email") || "Email"} error={errors.email?.message} required>
              <Input
                type="email"
                {...register("email")}
                placeholder={t("emailPlaceholder") || "Type email here..."}
                className={FORM_CONTROL_CLASS}
                style={getFormControlStyle(!!errors.email)}
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
              {t("saveButton") || "Save Changes"}
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
          {/* ConfirmModal - mismo contenedor/dimensiones que AddContractorModal */}
          <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[10px] shadow-[0px_4px_4px_rgba(166,166,166,0.25)] px-[40px] py-[30px] md:py-[25px] w-[80%] max-w-[401px] md:max-w-[480px] md:w-full flex items-center justify-center">
            <div className="flex flex-col gap-[30px] items-center w-full max-w-[321px] md:max-w-[400px]">
              <div className="flex flex-col gap-[15px] text-center w-full">
                <h2 className="text-[24px] font-bold text-black">{t("editConfirmTitle")}</h2>
                <p className="text-[16px] font-normal text-[#1E1E1E]">{t("editConfirmSubtitle")}</p>
                {submitError && (
                  <p className="text-[14px] font-medium text-red-600">{submitError}</p>
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-[10px] w-full">
                <Button
                  type="button"
                  onClick={handleConfirmSave}
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
                  {t("editConfirmSave")}
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
                  {t("editConfirmCancel")}
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
                  {t("editSuccessTitle")}
                </p>
              </div>
              <Button
                type="button"
                onClick={handleSuccessContinue}
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
                {t("editSuccessContinue")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
