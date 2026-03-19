"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CircleCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, FormField, FormModalLayout, Input } from "@/packages/design-system";
import { usersService } from "@/packages/api/users/users.service";
import { ROLE_LABELS, ROLES, type Role } from "@/packages/types/users.types";
import {
  FORM_CONTROL_CLASS,
  getFormControlStyle,
  FORM_PRIMARY_BUTTON_STYLE,
  FORM_SECONDARY_BUTTON_STYLE,
  FORM_SELECT_CLASS,
} from "@/packages/types/formUi.constants";
import { invalidEmailMessage, requiredMessage } from "@/packages/types/formValidation.helpers";

interface EditUserModalProps {
  userId: string;
  onClose: () => void;
  onUpdated?: () => void;
}

type EditUserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  roles: Role[];
};

export function EditUserModal({ userId, onClose, onUpdated }: EditUserModalProps) {
  const t = useTranslations("roles.modal");
  const tCommon = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [initialValues, setInitialValues] = useState<EditUserFormValues>({
    firstName: "",
    lastName: "",
    email: "",
    roles: [],
  });
  const [isReady, setIsReady] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingValues, setPendingValues] = useState<EditUserFormValues | null>(null);
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
      roles: z.array(z.enum(ROLES)).min(1, req(t("role") || "Role")),
    });
  }, [t, tCommon]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onSubmit",
  });

  const rolesValue = watch("roles");

  useEffect(() => {
    // Reset state when userId changes
    setIsReady(false);
    setInitialValues({ firstName: "", lastName: "", email: "", roles: [] });
    reset({ firstName: "", lastName: "", email: "", roles: [] });

    const loadUser = async () => {
      try {
        const user = await usersService.getById(userId);
        const roles = Array.from(
          new Set<Role>([
            user.role as Role,
            ...(((user as unknown as { extraRoles?: Role[] }).extraRoles || []) as Role[]),
          ]),
        );
        const nextValues: EditUserFormValues = {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          roles,
        };
        setInitialValues(nextValues);
        reset(nextValues);
      } catch (error) {
        console.error("Error loading user for edit:", error);
      } finally {
        setIsReady(true);
      }
    };

    loadUser();
  }, [userId, reset]);

  const onSubmitForm = (values: EditUserFormValues) => {
    setSubmitError(null);
    setPendingValues(values);
    setShowConfirm(true);
  };

  const handleConfirmUpdate = async () => {
    if (!pendingValues) return;

    setShowConfirm(false);
    startTransition(async () => {
      try {
        const [role, ...extraRoles] = pendingValues.roles;
        await usersService.update(userId, {
          firstName: pendingValues.firstName,
          lastName: pendingValues.lastName,
          email: pendingValues.email,
          role,
          extraRoles,
        });

        if (onUpdated) {
          onUpdated();
        }

        setShowSuccess(true);
      } catch (error) {
        console.error("Error updating user:", error);
        setSubmitError(
          error instanceof Error
            ? error.message
            : t("errorUpdating") || "Error updating user. Please try again.",
        );
      }
    });
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setPendingValues(null);
  };

  const handleSuccessContinue = () => {
    setShowSuccess(false);
    onClose();
  };

  if (!isReady) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-[12px] px-8 py-6 shadow-lg">
          <p className="text-center">{t("loading") || "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modal principal de edición */}
      {!showConfirm && !showSuccess && (
        <FormModalLayout
          isOpen={true}
          onClose={onClose}
          title={t("editTitle") || "Edit User"}
          size="md"
          contentPadding="25px 40px"
          modalStyle={{ width: "100%", maxWidth: "480px" }}
          errorMessage={submitError}
        >
          <form
            onSubmit={handleSubmit(onSubmitForm)}
            className="w-full max-w-[400px] mx-auto"
            style={{ marginBottom: "25px" }}
          >
            <div className="flex flex-col gap-[25px] items-start w-full">
              <FormField
                label={t("firstName") || "First Name"}
                required
                error={errors.firstName?.message}
              >
                <Input
                  {...register("firstName")}
                  className={FORM_CONTROL_CLASS}
                  placeholder={t("firstNamePlaceholder")}
                  style={getFormControlStyle(!!errors.firstName)}
                />
              </FormField>

              <FormField
                label={t("lastName") || "Last Name"}
                required
                error={errors.lastName?.message}
              >
                <Input
                  {...register("lastName")}
                  placeholder={t("lastNamePlaceholder") || "Enter last name"}
                  className={FORM_CONTROL_CLASS}
                  style={getFormControlStyle(!!errors.lastName)}
                />
              </FormField>

              <FormField label={t("email") || "Email"} required error={errors.email?.message}>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder={t("emailPlaceholder") || "Enter email address"}
                  className={FORM_CONTROL_CLASS}
                  style={getFormControlStyle(!!errors.email)}
                />
              </FormField>

              <FormField label={t("role") || "Role"} required error={errors.roles?.message}>
                <div
                  className={FORM_SELECT_CLASS}
                  style={{
                    ...getFormControlStyle(!!errors.roles),
                    padding: "12px 14px",
                    height: "auto",
                  }}
                >
                  <div className="flex flex-col gap-2">
                    {ROLES.map((r) => {
                      const checked = rolesValue?.includes(r) ?? false;
                      const label = ROLE_LABELS[r] || r;
                      return (
                        <label
                          key={r}
                          className="flex items-center gap-3 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const next = new Set<Role>((rolesValue || []) as Role[]);
                              if (e.target.checked) next.add(r);
                              else next.delete(r);
                              setValue("roles", Array.from(next), { shouldValidate: true });
                            }}
                          />
                          <span className="text-[14px] text-[#1E1E1E]">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </FormField>
            </div>

            <div className="flex flex-col gap-[10px] items-start w-full mt-[25px]">
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
          <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[10px] shadow-[0px_4px_4px_rgba(166,166,166,0.25)] px-[40px] py-[30px] md:py-[25px] w-[80%] max-w-[401px] md:max-w-[480px] md:w-full flex items-center justify-center">
            <div className="flex flex-col gap-[30px] items-center w-full max-w-[321px] md:max-w-[400px]">
              <div className="flex flex-col gap-[15px] text-center w-full">
                <h2 className="text-[24px] font-bold text-black">
                  {t("editConfirmTitle") || "Confirm"}
                </h2>
                <p className="text-[16px] font-normal text-[#1E1E1E]">
                  {t("editConfirmSubtitle") || "Are you sure you want to update this user?"}
                </p>
              </div>
              <div className="flex flex-col md:flex-row gap-[10px] w-full">
                <Button
                  type="button"
                  onClick={handleConfirmUpdate}
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
                  {t("editConfirmSave") || "Update"}
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
                  {t("editConfirmCancel") || "Cancel"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito */}
      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[10px] shadow-[0px_4px_4px_rgba(166,166,166,0.25)] px-[40px] py-[30px] md:py-[25px] w-[80%] max-w-[401px] md:max-w-[480px] md:w-full flex items-center justify-center">
            <div className="flex flex-col gap-[30px] items-center w-full max-w-[321px] md:max-w-[400px]">
              <div className="flex justify-center">
                <CircleCheck className="w-16 h-16 text-green-500" />
              </div>
              <div className="flex flex-col gap-[15px] text-center w-full">
                <h2 className="text-[24px] font-bold text-black">
                  {t("editSuccessTitle") || "Success!"}
                </h2>
                <p className="text-[16px] font-normal text-[#1E1E1E]">
                  {t("editSuccessTitle") || "User has been updated successfully."}
                </p>
              </div>
              <Button
                onClick={handleSuccessContinue}
                className="w-full"
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
                {t("editSuccessContinue") || "Continue"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
