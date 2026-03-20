"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Clock, CircleCheck } from "lucide-react";
import { FormModal, Button, COUNTRY_OPTIONS } from "@/packages/design-system";
import { jobPositionsService } from "@/packages/api/job-positions/job-positions.service";
import type { FormModalConfig } from "@/packages/types/FormModal.types";
import { contractorsService } from "@/packages/api/contractors/contractors.service";
import { clientsService } from "@/packages/api/clients/clients.service";
import { teamsService } from "@/packages/api/teams/teams.service";
import type { Contractor } from "@/packages/types/contractors.types";
import type { SelectOption } from "@/packages/design-system";

interface EditContractorModalProps {
  contractorId: string;
  onClose: () => void;
  onUpdated?: () => void;
}

function addOneHour(time: string): string {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return "";
  const newHours = (hours + 1) % 24;
  return `${String(newHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function EditContractorModal({
  contractorId,
  onClose,
  onUpdated,
}: EditContractorModalProps) {
  const t = useTranslations("contractors.modal");
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<Record<string, unknown>>({});
  const [isReady, setIsReady] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingValues, setPendingValues] = useState<Record<string, unknown> | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [clients, setClients] = useState<SelectOption[]>([]);
  const [teams, setTeams] = useState<(SelectOption & { clientId: string })[]>([]);
  const [jobPositions, setJobPositions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [contractor, allClients, allTeams] = await Promise.all([
          contractorsService.getById(contractorId),
          clientsService.getAll(),
          teamsService.getAll(),
        ]);

        setInitialValues({
          name: contractor.name || "",
          email: contractor.email || "",
          job_position: contractor.job_position || "",
          client_id: contractor.client_id || "",
          team_id: contractor.team_id || "",
          country: contractor.country || "",
          work_schedule_start: contractor.work_schedule_start || "",
          work_schedule_end: contractor.work_schedule_end || "",
          lunch_start: contractor.lunch_start || "",
          lunch_end:
            contractor.lunch_end ||
            (contractor.lunch_start ? addOneHour(contractor.lunch_start) : ""),
        });

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

        setJobPositions(
          jobPositionsService
            .getAll()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((p) => ({ value: p.name, label: p.name })),
        );

        setIsReady(true);
      } catch (error) {
        console.error("Error loading contractor for edit:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [contractorId]);

  const formConfig: FormModalConfig = useMemo(
    () => ({
      title: t("editTitle") || "Edit Contractor",
      titleTranslationKey: "contractors.modal.editTitle",
      layout: "two-column",
      // Ajustes visuales para que el modal sea lo más parecido posible al diseño de Figma
      contentPadding: "30px 40px",
      styles: {
        modal: {
          width: "100%",
          maxWidth: "683px",
          border: "none",
          boxShadow: "none",
        },
        form: {
          width: "100%",
          maxWidth: "590px",
          margin: "0 auto",
        },
        title: {
          fontSize: "24px",
          fontWeight: 600,
          textAlign: "center",
          color: "#000000",
        },
      },
      fields: [
        {
          key: "name",
          type: "text",
          label: t("user") || "User",
          translationKey: "contractors.modal.user",
          placeholder: t("userPlaceholder") || "Type name and last name here...",
        },
        {
          key: "email",
          type: "email",
          label: t("email") || "Email",
          translationKey: "contractors.modal.email",
          placeholder: t("emailPlaceholder") || "mail@outlook.com",
        },
        {
          key: "job_position",
          type: "select",
          label: t("jobPosition") || "Job Position",
          translationKey: "contractors.modal.jobPosition",
          options: jobPositions,
        },
        {
          key: "client_id",
          type: "select",
          label: t("client") || "Client",
          translationKey: "contractors.modal.client",
          options: clients,
        },
        {
          key: "team_id",
          type: "select",
          label: t("team") || "Team",
          translationKey: "contractors.modal.team",
          options: [],
          dependsOn: ["client_id"],
          getOptions: async (currentValues) => {
            const selectedClientId = currentValues.client_id;
            if (!selectedClientId) return [];
            const filteredTeams = teams.filter((team) => team.clientId === selectedClientId);
            return filteredTeams;
          },
          disabled: (currentValues) => !currentValues.client_id,
        },
        {
          key: "country",
          type: "select",
          label: t("country") || "Country",
          translationKey: "contractors.modal.country",
          options: COUNTRY_OPTIONS,
        },
        {
          key: "work_schedule_start",
          type: "time",
          label: t("startTime") || "Start Time",
          translationKey: "contractors.modal.startTime",
          optional: true,
          icon: <Clock className="w-6 h-6" />,
        },
        {
          key: "work_schedule_end",
          type: "time",
          label: t("finishTime") || "Finish Time",
          translationKey: "contractors.modal.finishTime",
          optional: true,
          icon: <Clock className="w-6 h-6" />,
        },
        {
          key: "lunch_start",
          type: "time",
          label: t("startLunchTime") || "Start Lunch Time",
          translationKey: "contractors.modal.startLunchTime",
          optional: true,
          icon: <Clock className="w-6 h-6" />,
          onValueChange: (value, _formValues, setFieldValue) => {
            if (typeof value === "string" && value) {
              setFieldValue("lunch_end", addOneHour(value));
            } else {
              setFieldValue("lunch_end", "");
            }
          },
        },
        {
          key: "lunch_end",
          type: "time",
          label: t("finishLunchTime") || "Lunch End Time",
          translationKey: "contractors.modal.finishLunchTime",
          optional: true,
          icon: <Clock className="w-6 h-6" />,
          disabled: true,
        },
      ],
      buttons: [
        {
          key: "submit",
          label: t("saveButton") || "Save Changes",
          translationKey: "contractors.modal.saveButton",
          type: "submit",
          variant: "primary",
          loadingLabel: t("saving") || "Saving...",
        },
        {
          key: "cancel",
          label: t("cancel") || "Cancel",
          translationKey: "contractors.modal.cancel",
          type: "button",
          variant: "secondary",
          onClick: onClose,
        },
      ],
      transformValues: (values) => {
        const payload: Record<string, unknown> = {
          name: typeof values.name === "string" ? values.name.trim() || "" : "",
          email: typeof values.email === "string" ? values.email.trim() || null : null,
          job_position:
            typeof values.job_position === "string" ? values.job_position.trim() || "" : "",
          client_id: typeof values.client_id === "string" ? values.client_id.trim() || "" : "",
          country: typeof values.country === "string" ? values.country.trim() || null : null,
          work_schedule_start: values.work_schedule_start || null,
          work_schedule_end: values.work_schedule_end || null,
          lunch_start: values.lunch_start || null,
          lunch_end: values.lunch_end || null,
        };

        if (typeof values.team_id === "string" && values.team_id.trim()) {
          payload.team_id = values.team_id.trim();
        }

        return payload;
      },
    }),
    [t, clients, teams, jobPositions, onClose],
  );

  // Enviar formulario -> mostrar modal de confirmación antes de guardar
  const handleSubmit = async (values: Record<string, unknown>) => {
    setPendingValues(values);
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingValues) return;
    setSubmitError(null);
    setLoading(true);
    try {
      await contractorsService.update(contractorId, pendingValues);
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
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setPendingValues(null);
  };

  const handleSuccessContinue = () => {
    setShowSuccess(false);
    onClose();
  };

  return (
    <>
      <FormModal
        config={formConfig}
        isOpen={isReady}
        onClose={onClose}
        onSubmit={handleSubmit}
        initialValues={initialValues}
        loading={loading}
        size="md"
      />

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
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
                  disabled={loading}
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
                  disabled={loading}
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
