"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, FormField, FormModalLayout, Input, Select } from "@/packages/design-system";
import { usersService } from "@/packages/api/users/users.service";
import { CircleCheck } from "lucide-react";

import {
  FORM_CONTROL_CLASS,
  getFormControlStyle,
  FORM_PRIMARY_BUTTON_STYLE,
  FORM_SECONDARY_BUTTON_STYLE,
  FORM_SELECT_CLASS,
} from "@/packages/types/formUi.constants";
import { invalidEmailMessage, requiredMessage } from "@/packages/types/formValidation.helpers";
import { ROLE_OPTIONS } from "@/packages/types/users.types";

interface AddUserModalProps {
  onClose: () => void;
}

type AddUserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
};

export function AddUserModal({ onClose }: AddUserModalProps) {
  const t = useTranslations("roles.modal");
  const tCommon = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<AddUserFormValues | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = useMemo(() => {
    const req = (field: string) => requiredMessage(tCommon, field);
    const invalidEmail = invalidEmailMessage(tCommon);

    return z.object({
      firstName: z
        .string()
        .trim()
        .min(1, req(t("firstName") || "First Name")),
      lastName: z
        .string()
        .trim()
        .min(1, req(t("lastName") || "Last Name")),
      email: z
        .string()
        .trim()
        .min(1, req(t("email") || "Email"))
        .email(invalidEmail),
      password: z
        .string()
        .trim()
        .min(
          6,
          tCommon("formValidation.minLength", { min: 6 }) ||
            "Password must be at least 6 characters",
        ),
      role: z
        .string()
        .trim()
        .min(1, req(t("role") || "Role")),
    });
  }, [t, tCommon]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "",
    },
  });

  const roleValue = watch("role");

  const onSubmit = (data: AddUserFormValues) => {
    setPendingPayload(data);
    setSubmitError(null);
    setShowConfirm(true);
  };

  const handleConfirmAdd = async () => {
    if (!pendingPayload) return;
    setSubmitError(null);

    startTransition(() => {
      (async () => {
        try {
          await usersService.create(pendingPayload);
          setShowConfirm(false);
          setPendingPayload(null);
          setShowSuccess(true);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : t("errorCreating") || "Error creating user. Please try again.";
          console.error("Error creating user:", error);
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
        title={t("addTitle") || "Add User"}
        size="md"
        contentPadding="30px 40px"
        modalStyle={{ width: "100%", maxWidth: "683px" }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[590px] mx-auto">
          <div className="flex flex-col gap-[25px] items-start w-full">
            <div className="flex flex-col md:flex-row gap-[25px] items-start w-full">
              <div className="w-full md:flex-1">
                <FormField
                  label={t("firstName") || "First Name"}
                  error={errors.firstName?.message}
                  required
                >
                  <Input
                    {...register("firstName")}
                    placeholder={t("firstNamePlaceholder") || "Enter first name"}
                    className={FORM_CONTROL_CLASS}
                    style={getFormControlStyle(!!errors.firstName)}
                    disabled={isPending}
                  />
                </FormField>
              </div>
              <div className="w-full md:flex-1">
                <FormField
                  label={t("lastName") || "Last Name"}
                  error={errors.lastName?.message}
                  required
                >
                  <Input
                    {...register("lastName")}
                    placeholder={t("lastNamePlaceholder") || "Enter last name"}
                    className={FORM_CONTROL_CLASS}
                    style={getFormControlStyle(!!errors.lastName)}
                    disabled={isPending}
                  />
                </FormField>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-[25px] items-start w-full">
              <div className="w-full md:flex-1">
                <FormField label={t("email") || "Email"} error={errors.email?.message} required>
                  <Input
                    type="email"
                    {...register("email")}
                    placeholder={t("emailPlaceholder") || "mail@outlook.com"}
                    className={FORM_CONTROL_CLASS}
                    style={getFormControlStyle(!!errors.email)}
                    disabled={isPending}
                  />
                </FormField>
              </div>
              <div className="w-full md:flex-1">
                <FormField
                  label={t("password") || "Password"}
                  error={errors.password?.message}
                  required
                >
                  <Input
                    type="password"
                    {...register("password")}
                    placeholder={t("passwordPlaceholder") || "Enter password"}
                    className={FORM_CONTROL_CLASS}
                    style={getFormControlStyle(!!errors.password)}
                    disabled={isPending}
                  />
                </FormField>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-[25px] items-start w-full">
              <div className="w-full md:flex-1">
                <FormField label={t("role") || "Role"} error={errors.role?.message} required>
                  <Select
                    {...register("role")}
                    options={[
                      { value: "", label: tCommon("formModal.selectPlaceholder") || "Select..." },
                      ...ROLE_OPTIONS,
                    ]}
                    className={FORM_SELECT_CLASS}
                    style={getFormControlStyle(!!errors.role)}
                    disabled={isPending}
                  />
                </FormField>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-[10px] items-start w-full mt-[30px]">
            <Button
              type="submit"
              disabled={isPending}
              style={{ ...FORM_PRIMARY_BUTTON_STYLE, flex: 1 }}
            >
              {t("addButton") || "Add User"}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              disabled={isPending}
              style={{ ...FORM_SECONDARY_BUTTON_STYLE, flex: 1 }}
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
                <h2 className="text-[24px] font-bold text-black">
                  {t("confirmTitle") || "Are you sure?"}
                </h2>
                <p className="text-[16px] font-normal text-[#1E1E1E]">
                  {t("confirmSubtitle") || "Do you want to add this user?"}
                </p>
                {submitError && (
                  <p className="text-[14px] font-medium text-red-600">{submitError}</p>
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-[10px] w-full">
                <Button
                  type="button"
                  onClick={handleConfirmAdd}
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
                  {t("confirmYes") || "Yes"}
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
                  {t("confirmNo") || "No"}
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
                  {t("successTitle") || "User added successfully"}
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
                {t("successContinue") || "Continue"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
