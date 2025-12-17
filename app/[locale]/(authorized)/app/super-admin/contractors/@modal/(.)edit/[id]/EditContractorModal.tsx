"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Clock, CircleCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, FormField, FormModalLayout, Input, Select } from "@/packages/design-system";
import { contractorsService } from "@/packages/api/contractors/contractors.service";
import { clientsService } from "@/packages/api/clients/clients.service";
import { teamsService } from "@/packages/api/teams/teams.service";
import type { Contractor } from "@/packages/types/contractors.types";
import type { SelectOption } from "@/packages/design-system";
import {
  FORM_CONTROL_CLASS,
  getFormControlStyle,
  FORM_PRIMARY_BUTTON_STYLE,
  FORM_SECONDARY_BUTTON_STYLE,
  FORM_SELECT_CLASS,
} from "@/packages/types/formUi.constants";
import { invalidEmailMessage, requiredMessage } from "@/packages/types/formValidation.helpers";
import { openTimePicker } from "@/packages/types/timePicker.helpers";

interface EditContractorModalProps {
  contractorId: string;
  onClose: () => void;
  onUpdated?: () => void;
}

type EditContractorFormValues = {
  name: string;
  email: string;
  job_position: string;
  client_id: string;
  team_id: string;
  country: string;
  work_schedule_start: string;
  work_schedule_end: string;
  lunch_start: string;
};

export function EditContractorModal({
  contractorId,
  onClose,
  onUpdated,
}: EditContractorModalProps) {
  const t = useTranslations("contractors.modal");
  const tCommon = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [initialValues, setInitialValues] = useState<EditContractorFormValues>({
    name: "",
    email: "",
    job_position: "",
    client_id: "",
    team_id: "",
    country: "",
    work_schedule_start: "",
    work_schedule_end: "",
    lunch_start: "",
  });
  const [isReady, setIsReady] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingValues, setPendingValues] = useState<EditContractorFormValues | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [clients, setClients] = useState<SelectOption[]>([]);
  const [teams, setTeams] = useState<(SelectOption & { clientId: string })[]>([]);
  const [countries, setCountries] = useState<SelectOption[]>([]);
  const [jobPositions, setJobPositions] = useState<SelectOption[]>([]);

  const schema = useMemo(() => {
    const req = (field: string) => requiredMessage(tCommon, field);
    const invalidEmail = invalidEmailMessage(tCommon);

    return z.object({
      name: z
        .string()
        .trim()
        .min(1, req(t("user") || "User")),
      email: z
        .string()
        .trim()
        .min(1, req(t("email") || "Email"))
        .email(invalidEmail),
      job_position: z
        .string()
        .trim()
        .min(1, req(t("jobPosition") || "Job Position")),
      client_id: z
        .string()
        .trim()
        .min(1, req(t("client") || "Client")),
      team_id: z.string().optional().or(z.literal("")),
      country: z
        .string()
        .trim()
        .min(1, req(t("country") || "Country")),
      work_schedule_start: z.string().optional().or(z.literal("")),
      work_schedule_end: z.string().optional().or(z.literal("")),
      lunch_start: z.string().optional().or(z.literal("")),
    });
  }, [t, tCommon]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditContractorFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onSubmit",
  });

  const selectedClientId = watch("client_id");
  const timeRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const prevClientIdRef = useRef<string | undefined>(undefined);

  const handleTimeIconClick = (fieldKey: keyof EditContractorFormValues) =>
    openTimePicker(timeRefs.current[fieldKey]);

  // Cuando cambia el client, resetear team
  useEffect(() => {
    // Evitar limpiar el team cuando se inicializa el formulario (reset inicial)
    if (prevClientIdRef.current === undefined) {
      prevClientIdRef.current = selectedClientId;
      return;
    }

    if (selectedClientId !== prevClientIdRef.current) {
      setValue("team_id", "");
      prevClientIdRef.current = selectedClientId;
    }
  }, [selectedClientId, setValue]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        setIsReady(false);
        const [contractor, allClients, allTeams, allContractors] = await Promise.all([
          contractorsService.getById(contractorId),
          clientsService.getAll(),
          teamsService.getAll(),
          contractorsService.getAll(),
        ]);

        const nextValues: EditContractorFormValues = {
          name: contractor.name || "",
          email: contractor.email || "",
          job_position: contractor.job_position || "",
          client_id: contractor.client_id || "",
          team_id: contractor.team_id || "",
          country: contractor.country || "",
          work_schedule_start: contractor.work_schedule_start || "",
          work_schedule_end: contractor.work_schedule_end || "",
          lunch_start: contractor.lunch_start || "",
        };
        // Resetear tracking para no limpiar team por el reset inicial
        prevClientIdRef.current = undefined;
        setInitialValues(nextValues);
        reset(nextValues);

        setClients(
          allClients
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((client) => ({ value: client.id, label: client.name })),
        );

        setTeams(
          allTeams
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((team) => ({ value: team.id, label: team.name, clientId: team.client_id })),
        );

        const countriesSet = new Set<string>();
        allContractors.forEach((c: Contractor) => {
          if (c.country) countriesSet.add(c.country);
        });
        setCountries(
          Array.from(countriesSet)
            .sort()
            .map((country) => ({ value: country, label: country })),
        );

        const jobPositionsSet = new Set<string>();
        allContractors.forEach((c: Contractor) => {
          if (c.job_position) jobPositionsSet.add(c.job_position);
        });
        setJobPositions(
          Array.from(jobPositionsSet)
            .sort()
            .map((position) => ({ value: position, label: position })),
        );

        setIsReady(true);
      } catch (error) {
        console.error("Error loading contractor for edit:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [contractorId, reset]);

  // Enviar formulario -> mostrar modal de confirmación antes de guardar
  const onSubmit = (values: EditContractorFormValues) => {
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
          const payload: Record<string, unknown> = {
            name: pendingValues.name.trim() || "",
            email: pendingValues.email.trim() || null,
            job_position: pendingValues.job_position.trim() || "",
            client_id: pendingValues.client_id.trim() || "",
            country: pendingValues.country.trim() || null,
            work_schedule_start: pendingValues.work_schedule_start || null,
            work_schedule_end: pendingValues.work_schedule_end || null,
            lunch_start: pendingValues.lunch_start || null,
          };

          if (pendingValues.team_id && pendingValues.team_id.trim()) {
            payload.team_id = pendingValues.team_id.trim();
          }

          await contractorsService.update(contractorId, payload);
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
              : t("errorUpdating") ||
                "Error al actualizar el contratista. Por favor, intenta de nuevo.";
          console.error("Error updating contractor:", error);
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

  return (
    <>
      <FormModalLayout
        isOpen={isReady && !showConfirm && !showSuccess}
        onClose={onClose}
        title={t("editTitle") || "Edit Contractor"}
        size="md"
        contentPadding="30px 40px"
        modalStyle={{ width: "100%", maxWidth: "683px" }}
        errorMessage={submitError}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[590px] mx-auto">
          <div className="flex flex-col gap-[25px] items-start w-full">
            <div className="flex flex-col md:flex-row gap-[25px] items-start w-full">
              <div className="w-full md:flex-1">
                <FormField label={t("user") || "User"} error={errors.name?.message} required>
                  <Input
                    {...register("name")}
                    placeholder={t("userPlaceholder") || "Type name and last name here..."}
                    className={FORM_CONTROL_CLASS}
                    style={getFormControlStyle(!!errors.name)}
                    disabled={isLoadingData || isPending}
                  />
                </FormField>
              </div>
              <div className="w-full md:flex-1">
                <FormField label={t("email") || "Email"} error={errors.email?.message} required>
                  <Input
                    type="email"
                    {...register("email")}
                    placeholder={t("emailPlaceholder") || "mail@outlook.com"}
                    className={FORM_CONTROL_CLASS}
                    style={getFormControlStyle(!!errors.email)}
                    disabled={isLoadingData || isPending}
                  />
                </FormField>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-[25px] items-start w-full">
              <div className="w-full md:flex-1">
                <FormField
                  label={t("jobPosition") || "Job Position"}
                  error={errors.job_position?.message}
                  required
                >
                  <Select
                    {...register("job_position")}
                    options={[
                      { value: "", label: tCommon("formModal.selectPlaceholder") || "Select..." },
                      ...jobPositions,
                    ]}
                    className={FORM_SELECT_CLASS}
                    style={getFormControlStyle(!!errors.job_position)}
                    disabled={isLoadingData || isPending}
                  />
                </FormField>
              </div>
              <div className="w-full md:flex-1">
                <FormField
                  label={t("client") || "Client"}
                  error={errors.client_id?.message}
                  required
                >
                  <Select
                    {...register("client_id")}
                    options={[
                      { value: "", label: tCommon("formModal.selectPlaceholder") || "Select..." },
                      ...clients,
                    ]}
                    className={FORM_SELECT_CLASS}
                    style={getFormControlStyle(!!errors.client_id)}
                    disabled={isLoadingData || isPending}
                  />
                </FormField>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-[25px] items-start w-full">
              <div className="w-full md:flex-1">
                <FormField label={t("team") || "Team"} error={errors.team_id?.message}>
                  <Select
                    {...register("team_id")}
                    options={[
                      { value: "", label: tCommon("formModal.selectPlaceholder") || "Select..." },
                      ...teams
                        .filter((tm) => !selectedClientId || tm.clientId === selectedClientId)
                        .map(({ clientId: _clientId, ...rest }) => rest),
                    ]}
                    className={FORM_SELECT_CLASS}
                    style={getFormControlStyle(!!errors.team_id)}
                    disabled={!selectedClientId || isLoadingData || isPending}
                  />
                </FormField>
              </div>
              <div className="w-full md:flex-1">
                <FormField
                  label={t("country") || "Country"}
                  error={errors.country?.message}
                  required
                >
                  <Select
                    {...register("country")}
                    options={[
                      { value: "", label: tCommon("formModal.selectPlaceholder") || "Select..." },
                      ...countries,
                    ]}
                    className={FORM_SELECT_CLASS}
                    style={getFormControlStyle(!!errors.country)}
                    disabled={isLoadingData || isPending}
                  />
                </FormField>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-[25px] items-start w-full">
              <div className="w-full md:flex-1">
                <FormField
                  label={t("startTime") || "Start Time"}
                  error={errors.work_schedule_start?.message}
                >
                  <div className="relative w-full">
                    <Input
                      type="time"
                      {...register("work_schedule_start")}
                      ref={(el) => {
                        timeRefs.current.work_schedule_start = el;
                      }}
                      className={`time-input-with-icon ${FORM_SELECT_CLASS}`}
                      style={getFormControlStyle(!!errors.work_schedule_start)}
                      disabled={isLoadingData || isPending}
                    />
                    <div
                      className="absolute right-[15px] top-1/2 -translate-y-1/2 cursor-pointer"
                      onClick={() => handleTimeIconClick("work_schedule_start")}
                    >
                      <Clock className="md:w-6 md:h-6 w-5 h-5" />
                    </div>
                  </div>
                </FormField>
              </div>
              <div className="w-full md:flex-1">
                <FormField
                  label={t("finishTime") || "Finish Time"}
                  error={errors.work_schedule_end?.message}
                >
                  <div className="relative w-full">
                    <Input
                      type="time"
                      {...register("work_schedule_end")}
                      ref={(el) => {
                        timeRefs.current.work_schedule_end = el;
                      }}
                      className={`time-input-with-icon ${FORM_SELECT_CLASS}`}
                      style={getFormControlStyle(!!errors.work_schedule_end)}
                      disabled={isLoadingData || isPending}
                    />
                    <div
                      className="absolute right-[15px] top-1/2 -translate-y-1/2 cursor-pointer"
                      onClick={() => handleTimeIconClick("work_schedule_end")}
                    >
                      <Clock className="md:w-6 md:h-6 w-5 h-5" />
                    </div>
                  </div>
                </FormField>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-[25px] items-start w-full">
              <div className="w-full md:flex-1">
                <FormField
                  label={t("startLunchTime") || "Start Lunch Time"}
                  error={errors.lunch_start?.message}
                >
                  <div className="relative w-full">
                    <Input
                      type="time"
                      {...register("lunch_start")}
                      ref={(el) => {
                        timeRefs.current.lunch_start = el;
                      }}
                      className={`time-input-with-icon ${FORM_SELECT_CLASS}`}
                      style={getFormControlStyle(!!errors.lunch_start)}
                      disabled={isLoadingData || isPending}
                    />
                    <div
                      className="absolute right-[15px] top-1/2 -translate-y-1/2 cursor-pointer"
                      onClick={() => handleTimeIconClick("lunch_start")}
                    >
                      <Clock className="md:w-6 md:h-6 w-5 h-5" />
                    </div>
                  </div>
                </FormField>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-[10px] items-start w-full mt-[30px]">
            <Button
              type="submit"
              disabled={isPending || isLoadingData}
              style={{ ...FORM_PRIMARY_BUTTON_STYLE, flex: 1 }}
            >
              {t("saveButton") || "Save Changes"}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              disabled={isPending || isLoadingData}
              style={{ ...FORM_SECONDARY_BUTTON_STYLE, flex: 1 }}
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
