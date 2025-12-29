"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button, FormField, FormModalLayout, Input, Select } from "@/packages/design-system";
import { usersService } from "@/packages/api/users/users.service";
import { CircleCheck } from "lucide-react";

import {
  FORM_CONTROL_CLASS,
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
  const router = useRouter();
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

  const handleFormSubmit = (data: AddUserFormValues) => {
    setPendingPayload(data);
    setShowConfirm(true);
  };

  const handleConfirmCreate = () => {
    if (!pendingPayload) return;

    setShowConfirm(false);
    startTransition(async () => {
      try {
        await usersService.create(pendingPayload);
        setShowSuccess(true);
        setSubmitError(null);
      } catch (error: unknown) {
        console.error("Error creating user:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Error creating user. Please try again.";
        setSubmitError(errorMessage);
        setShowConfirm(false);
      }
    });
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setPendingPayload(null);
  };

  const handleSuccessContinue = () => {
    setShowSuccess(false);
    router.back();
  };

  return (
    <>
      {/* Modal principal */}
      {!showConfirm && !showSuccess && (
        <FormModalLayout
          isOpen={true}
          title={t("addTitle") || "Add User"}
          onClose={onClose}
          size="md"
          modalStyle={{ maxWidth: "600px", width: "90%" }}
        >
          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{submitError}</span>
              </div>
            )}

            <FormField
              label={t("firstName") || "First Name"}
              required
              error={errors.firstName?.message}
            >
              <Input
                id="firstName"
                type="text"
                placeholder={t("firstNamePlaceholder") || "Enter first name"}
                {...register("firstName")}
                className={FORM_CONTROL_CLASS}
              />
            </FormField>

            <FormField
              label={t("lastName") || "Last Name"}
              required
              error={errors.lastName?.message}
            >
              <Input
                id="lastName"
                type="text"
                placeholder={t("lastNamePlaceholder") || "Enter last name"}
                {...register("lastName")}
                className={FORM_CONTROL_CLASS}
              />
            </FormField>

            <FormField label={t("email") || "Email"} required error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder") || "Enter email address"}
                {...register("email")}
                className={FORM_CONTROL_CLASS}
              />
            </FormField>

            <FormField
              label={t("password") || "Password"}
              required
              error={errors.password?.message}
            >
              <Input
                id="password"
                type="password"
                placeholder={t("passwordPlaceholder") || "Enter password"}
                {...register("password")}
                className={FORM_CONTROL_CLASS}
              />
            </FormField>

            <FormField label={t("role") || "Role"} required error={errors.role?.message}>
              <Select
                id="role"
                value={roleValue || ""}
                onChange={(e) => setValue("role", e.target.value, { shouldValidate: true })}
                className={FORM_SELECT_CLASS}
                options={ROLE_OPTIONS}
              >
                <option value="">{t("rolePlaceholder") || "Select role"}</option>
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <div className="flex flex-col md:flex-row gap-3 mt-4">
              <Button type="submit" disabled={isPending} style={FORM_PRIMARY_BUTTON_STYLE}>
                {t("save") || "Save"}
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
      )}

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-[12px] px-8 py-6 shadow-lg w-[80%] max-w-[400px] md:w-full">
            <h2 className="text-xl font-semibold text-center mb-3" style={{ color: "#000000" }}>
              {t("confirmTitle") || "Confirm"}
            </h2>
            <p className="text-[15px] text-center mb-6" style={{ color: "#4B5563" }}>
              {t("confirmSubtitle") || "Are you sure you want to add this user?"}
            </p>
            <div className="flex flex-col md:flex-row w-full gap-[10px]">
              <Button
                type="button"
                onClick={handleConfirmCreate}
                disabled={isPending}
                className="w-full md:w-auto"
                style={FORM_PRIMARY_BUTTON_STYLE}
              >
                {t("confirmAdd") || "Add"}
              </Button>
              <Button
                type="button"
                onClick={handleCancelConfirm}
                disabled={isPending}
                className="w-full md:w-auto"
                style={FORM_SECONDARY_BUTTON_STYLE}
              >
                {t("confirmCancel") || "Cancel"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito */}
      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-[12px] px-8 py-6 shadow-lg w-[80%] max-w-[400px] md:w-full text-center">
            <div className="flex justify-center mb-4">
              <CircleCheck className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: "#000000" }}>
              {t("successTitle") || "Success!"}
            </h2>
            <p className="text-[15px] mb-6" style={{ color: "#4B5563" }}>
              {t("successMessage") || "User has been added successfully."}
            </p>
            <Button onClick={handleSuccessContinue} style={FORM_PRIMARY_BUTTON_STYLE}>
              {t("continue") || "Continue"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
