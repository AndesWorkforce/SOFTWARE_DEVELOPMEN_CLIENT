"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  FormField,
  FormModalLayout,
  Input,
  Select,
  COUNTRY_OPTIONS,
  JOB_POSITION_OPTIONS,
} from "@/packages/design-system";
import { contractorsService } from "@/packages/api/contractors/contractors.service";
import { clientsService } from "@/packages/api/clients/clients.service";
import { teamsService } from "@/packages/api/teams/teams.service";
import { Clock, CircleCheck } from "lucide-react";
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

interface AddContractorModalProps {
  onClose: () => void;
  /** Si se provee, preselecciona el client y puede bloquear el select */
  initialClientId?: string;
  /** Si true, el select de client queda bloqueado */
  lockClient?: boolean;
}

type AddContractorFormValues = {
  name: string;
  email: string;
  job_position: string;
  client_id: string;
  team_id: string;
  country: string;
  job_schedule: string;
  work_schedule_start: string;
  work_schedule_end: string;
  lunch_start: string;
  lunch_end: string;
};

function addOneHour(time: string): string {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return "";
  const newHours = (hours + 1) % 24;
  return `${String(newHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function AddContractorModal({
  onClose,
  initialClientId,
  lockClient = false,
}: AddContractorModalProps) {
  const t = useTranslations("contractors.modal");
  const tCommon = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<AddContractorFormValues | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [clients, setClients] = useState<SelectOption[]>([]);
  const [teams, setTeams] = useState<(SelectOption & { clientId: string })[]>([]);
  const [lockedClientOption, setLockedClientOption] = useState<SelectOption | null>(null);

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
      job_schedule: z.string().optional().or(z.literal("")),
      work_schedule_start: z.string().optional().or(z.literal("")),
      work_schedule_end: z.string().optional().or(z.literal("")),
      lunch_start: z.string().optional().or(z.literal("")),
      lunch_end: z.string().optional().or(z.literal("")),
    });
  }, [t, tCommon]);

  const jobScheduleOptions: SelectOption[] = useMemo(
    () => [
      { value: "", label: tCommon("formModal.selectPlaceholder") || "Select..." },
      { value: "full_time", label: t("jobScheduleFullTime") || "Full time" },
      { value: "part_time", label: t("jobSchedulePartTime") || "Part time" },
      { value: "no_schedule", label: t("jobScheduleNoSchedule") || "No schedule" },
    ],
    [t, tCommon],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddContractorFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      job_position: "",
      client_id: initialClientId || "",
      team_id: "",
      country: "",
      job_schedule: "",
      work_schedule_start: "",
      work_schedule_end: "",
      lunch_start: "",
      lunch_end: "",
    },
    mode: "onSubmit",
  });

  const selectedClientId = watch("client_id");
  const lunchStartValue = watch("lunch_start");
  const jobSchedule = watch("job_schedule");
  const hideScheduleFields = jobSchedule === "no_schedule";
  const timeRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Desestructuramos los refs de register para no sobreescribirlos
  const { ref: workScheduleStartRef, ...workScheduleStartRegister } =
    register("work_schedule_start");
  const { ref: workScheduleEndRef, ...workScheduleEndRegister } = register("work_schedule_end");
  const { ref: lunchStartRef, ...lunchStartRegister } = register("lunch_start");
  const { ref: lunchEndRef, ...lunchEndRegister } = register("lunch_end");

  useEffect(() => {
    if (lunchStartValue) {
      setValue("lunch_end", addOneHour(lunchStartValue), {
        shouldDirty: true,
        shouldValidate: true,
      });
    } else {
      setValue("lunch_end", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [lunchStartValue, setValue]);

  const handleTimeIconClick = (fieldKey: keyof AddContractorFormValues) => {
    const input = timeRefs.current[fieldKey];
    if (input && !input.disabled) {
      openTimePicker(input);
    }
  };

  // Resetear team al cambiar client (misma lógica que en Edit)
  useEffect(() => {
    setValue("team_id", "");
  }, [selectedClientId, setValue]);

  // Si venimos desde /clients/{id}, forzar client preseleccionado y bloquear cambios
  useEffect(() => {
    if (!lockClient || !initialClientId) return;
    if (selectedClientId !== initialClientId) {
      setValue("client_id", initialClientId, { shouldValidate: true, shouldDirty: false });
    }
  }, [initialClientId, lockClient, selectedClientId, setValue]);

  // Si el client está lockeado, traer el nombre para mostrarlo incluso antes de cargar el listado completo
  useEffect(() => {
    if (!lockClient || !initialClientId) {
      setLockedClientOption(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const client = await clientsService.getById(initialClientId);
        if (cancelled) return;
        setLockedClientOption({ value: client.id, label: client.name });
        // Forzar sync del select cuando llegan opciones (evita quedarse en placeholder)
        setValue("client_id", client.id, { shouldValidate: true, shouldDirty: false });
      } catch {
        // Si falla, al menos mostramos el id como fallback (evita "vacío")
        if (!cancelled) {
          setLockedClientOption({ value: initialClientId, label: initialClientId });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialClientId, lockClient, setValue]);

  // Al enviar el formulario, primero mostramos un modal de confirmación
  const onSubmit = (values: AddContractorFormValues) => {
    setPendingPayload(values);
    setSubmitError(null);
    setShowConfirm(true);
  };

  const handleConfirmAdd = async () => {
    if (!pendingPayload) return;
    setSubmitError(null);

    startTransition(() => {
      (async () => {
        try {
          const payload: Record<string, unknown> = {
            name: pendingPayload.name.trim() || "",
            email: pendingPayload.email.trim() || null,
            job_position: pendingPayload.job_position.trim() || "",
            client_id: pendingPayload.client_id.trim() || "",
            country: pendingPayload.country.trim() || null,
            work_schedule_start: pendingPayload.work_schedule_start || null,
            work_schedule_end: pendingPayload.work_schedule_end || null,
            lunch_start: pendingPayload.lunch_start || null,
            lunch_end: pendingPayload.lunch_end || null,
          };

          if (pendingPayload.team_id && pendingPayload.team_id.trim()) {
            payload.team_id = pendingPayload.team_id.trim();
          }

          if (pendingPayload.job_schedule && pendingPayload.job_schedule.trim()) {
            payload.job_schedule = pendingPayload.job_schedule.trim();
          }

          await contractorsService.create(payload);
          setShowConfirm(false);
          setPendingPayload(null);
          setShowSuccess(true);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : t("errorCreating") || "Error al crear el contratista. Por favor, intenta de nuevo.";
          console.error("Error creating contractor:", error);
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

  // Cargar opciones del form (clients/teams/countries/job positions)
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setIsLoadingData(true);
        const [allClients, allTeams] = await Promise.all([
          clientsService.getAll(),
          teamsService.getAll(),
        ]);

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
      } catch (error) {
        console.error("Error loading AddContractor options:", error);
        setClients([]);
        setTeams([]);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadOptions();
  }, []);

  return (
    <>
      <FormModalLayout
        isOpen={!showConfirm && !showSuccess}
        onClose={onClose}
        title={t("title") || "Add Contractor"}
        size="md"
        contentPadding="30px 40px"
        modalStyle={{ width: "100%", maxWidth: "683px" }}
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
                      ...JOB_POSITION_OPTIONS,
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
                      ...(lockedClientOption &&
                      !clients.some((c) => c.value === lockedClientOption.value)
                        ? [lockedClientOption]
                        : []),
                      ...clients,
                    ]}
                    className={FORM_SELECT_CLASS}
                    style={getFormControlStyle(!!errors.client_id)}
                    disabled={lockClient || isLoadingData || isPending}
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
                      ...COUNTRY_OPTIONS,
                    ]}
                    className={FORM_SELECT_CLASS}
                    style={getFormControlStyle(!!errors.country)}
                    disabled={isLoadingData || isPending}
                  />
                </FormField>
              </div>
            </div>

            {/* Job Schedule - fila completa debajo de Equipo/País */}
            <div className="flex flex-col items-start w-full">
              <div className="w-full">
                <FormField
                  label={t("jobSchedule") || "Job Schedule"}
                  error={errors.job_schedule?.message}
                >
                  <Select
                    {...register("job_schedule")}
                    options={jobScheduleOptions}
                    className={FORM_SELECT_CLASS}
                    style={getFormControlStyle(!!errors.job_schedule)}
                    disabled={isLoadingData || isPending}
                  />
                </FormField>
              </div>
            </div>

            {!hideScheduleFields && (
              <>
                <div className="flex flex-col md:flex-row gap-[25px] items-start w-full">
                  <div className="w-full md:flex-1">
                    <FormField
                      label={t("startTime") || "Start Time"}
                      error={errors.work_schedule_start?.message}
                    >
                      <div className="relative w-full">
                        <Input
                          type="time"
                          {...workScheduleStartRegister}
                          ref={(el) => {
                            workScheduleStartRef(el);
                            timeRefs.current.work_schedule_start = el;
                          }}
                          className={`time-input-with-icon ${FORM_SELECT_CLASS}`}
                          style={getFormControlStyle(!!errors.work_schedule_start)}
                          disabled={isLoadingData || isPending}
                        />
                        <div
                          className={`absolute right-[15px] top-1/2 -translate-y-1/2 ${
                            isLoadingData || isPending
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer"
                          }`}
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
                          {...workScheduleEndRegister}
                          ref={(el) => {
                            workScheduleEndRef(el);
                            timeRefs.current.work_schedule_end = el;
                          }}
                          className={`time-input-with-icon ${FORM_SELECT_CLASS}`}
                          style={getFormControlStyle(!!errors.work_schedule_end)}
                          disabled={isLoadingData || isPending}
                        />
                        <div
                          className={`absolute right-[15px] top-1/2 -translate-y-1/2 ${
                            isLoadingData || isPending
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer"
                          }`}
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
                          {...lunchStartRegister}
                          ref={(el) => {
                            lunchStartRef(el);
                            timeRefs.current.lunch_start = el;
                          }}
                          className={`time-input-with-icon ${FORM_SELECT_CLASS}`}
                          style={getFormControlStyle(!!errors.lunch_start)}
                          disabled={isLoadingData || isPending}
                        />
                        <div
                          className={`absolute right-[15px] top-1/2 -translate-y-1/2 ${
                            isLoadingData || isPending
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer"
                          }`}
                          onClick={() => handleTimeIconClick("lunch_start")}
                        >
                          <Clock className="md:w-6 md:h-6 w-5 h-5" />
                        </div>
                      </div>
                    </FormField>
                  </div>
                  <div className="w-full md:flex-1">
                    <FormField
                      label={t("finishLunchTime") || "Lunch End Time"}
                      error={errors.lunch_end?.message}
                    >
                      <div className="relative w-full">
                        <Input
                          type="time"
                          {...lunchEndRegister}
                          ref={(el) => {
                            lunchEndRef(el);
                            timeRefs.current.lunch_end = el;
                          }}
                          className={`time-input-with-icon ${FORM_SELECT_CLASS}`}
                          style={getFormControlStyle(!!errors.lunch_end)}
                          readOnly={true}
                        />
                        <div className="absolute right-[15px] top-1/2 -translate-y-1/2 cursor-not-allowed opacity-50">
                          <Clock className="md:w-6 md:h-6 w-5 h-5" />
                        </div>
                      </div>
                    </FormField>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-[10px] items-start w-full mt-[30px]">
            <Button
              type="submit"
              disabled={isPending || isLoadingData}
              style={{ ...FORM_PRIMARY_BUTTON_STYLE, flex: 1 }}
            >
              {t("addButton") || "Add Contractor"}
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
