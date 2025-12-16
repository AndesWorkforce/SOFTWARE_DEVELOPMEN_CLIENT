"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { FormModal, Button } from "@/packages/design-system";
import type { FormModalConfig } from "@/packages/types/FormModal.types";
import { contractorsService } from "@/packages/api/contractors/contractors.service";
import { clientsService } from "@/packages/api/clients/clients.service";
import { teamsService } from "@/packages/api/teams/teams.service";
import { Clock, CircleCheck } from "lucide-react";

interface AddContractorModalProps {
  onClose: () => void;
}

export function AddContractorModal({ onClose }: AddContractorModalProps) {
  const t = useTranslations("contractors.modal");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<Record<string, unknown> | null>(null);

  const formConfig: FormModalConfig = useMemo(
    () => ({
      title: t("title") || "Add Contractor",
      titleTranslationKey: "contractors.modal.title",
      layout: "two-column",
      // Copiar diseño del modal de Edit
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
          required: true,
        },
        {
          key: "email",
          type: "email",
          label: t("email") || "Email",
          translationKey: "contractors.modal.email",
          placeholder: t("emailPlaceholder") || "mail@outlook.com",
          required: true,
        },
        {
          key: "job_position",
          type: "select",
          label: t("jobPosition") || "Job Position",
          translationKey: "contractors.modal.jobPosition",
          required: true,
          getOptions: async () => {
            const allContractors = await contractorsService.getAll();
            const jobPositionsSet = new Set<string>();
            allContractors.forEach((contractor) => {
              if (contractor.job_position) {
                jobPositionsSet.add(contractor.job_position);
              }
            });
            return Array.from(jobPositionsSet)
              .sort()
              .map((position) => ({ value: position, label: position }));
          },
        },
        {
          key: "client_id",
          type: "select",
          label: t("client") || "Client",
          translationKey: "contractors.modal.client",
          required: true,
          getOptions: async () => {
            const allClients = await clientsService.getAll();
            return allClients
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((client) => ({ value: client.id, label: client.name }));
          },
        },
        {
          key: "team_id",
          type: "select",
          label: t("team") || "Team",
          translationKey: "contractors.modal.team",
          dependsOn: ["client_id"],
          disabled: (formValues) => !formValues.client_id,
          getOptions: async (formValues) => {
            if (!formValues.client_id) return [];
            const allTeams = await teamsService.getAll();
            return allTeams
              .filter((team) => team.client_id === formValues.client_id)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((team) => ({ value: team.id, label: team.name }));
          },
        },
        {
          key: "country",
          type: "select",
          label: t("country") || "Country",
          translationKey: "contractors.modal.country",
          required: true,
          getOptions: async () => {
            const allContractors = await contractorsService.getAll();
            const countriesSet = new Set<string>();
            allContractors.forEach((contractor) => {
              if (contractor.country) {
                countriesSet.add(contractor.country);
              }
            });
            return Array.from(countriesSet)
              .sort()
              .map((country) => ({ value: country, label: country }));
          },
        },
        {
          key: "work_schedule_start",
          type: "time",
          label: t("startTime") || "Start Time",
          translationKey: "contractors.modal.startTime",
          icon: <Clock className="w-6 h-6" />,
        },
        {
          key: "work_schedule_end",
          type: "time",
          label: t("finishTime") || "Finish Time",
          translationKey: "contractors.modal.finishTime",
          icon: <Clock className="w-6 h-6" />,
        },
        {
          key: "lunch_start",
          type: "time",
          label: t("startLunchTime") || "Start Lunch Time",
          translationKey: "contractors.modal.startLunchTime",
          icon: <Clock className="w-6 h-6" />,
          width: "282px",
        },
      ],
      buttons: [
        {
          key: "submit",
          label: t("addButton") || "Add Contractor",
          translationKey: "contractors.modal.addButton",
          type: "submit",
          variant: "primary",
          loadingLabel: t("adding") || "Adding...",
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
        };

        if (typeof values.team_id === "string" && values.team_id.trim()) {
          payload.team_id = values.team_id.trim();
        }

        return payload;
      },
    }),
    [t, onClose],
  );

  // Al enviar el formulario, primero mostramos un modal de confirmación
  const handleSubmit = async (values: Record<string, unknown>) => {
    setPendingPayload(values);
    setShowConfirm(true);
  };

  const handleConfirmAdd = async () => {
    if (!pendingPayload) return;
    setLoading(true);
    try {
      await contractorsService.create(pendingPayload);
      setShowConfirm(false);
      setPendingPayload(null);
      setShowSuccess(true);
    } catch (error) {
      console.error("Error creating contractor:", error);
      throw new Error(
        t("errorCreating") || "Error al crear el contratista. Por favor, intenta de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setPendingPayload(null);
  };

  const handleContinueSuccess = () => {
    setShowSuccess(false);
    onClose();
  };

  return (
    <>
      <FormModal
        config={formConfig}
        isOpen={!showConfirm && !showSuccess}
        onClose={onClose}
        onSubmit={handleSubmit}
        loading={loading}
        size="md"
      />

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-[12px] px-8 py-6 shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold text-center mb-3" style={{ color: "#000000" }}>
              {t("confirmTitle")}
            </h2>
            <p className="text-[15px] text-center mb-6" style={{ color: "#4B5563" }}>
              {t("confirmSubtitle")}
            </p>
            <div className="flex w-full gap-[10px]">
              <Button
                type="button"
                onClick={handleConfirmAdd}
                disabled={loading}
                style={{
                  background: "#0097B2",
                  color: "#FFFFFF",
                  padding: "8px 20px",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: 500,
                  width: "80%",
                }}
              >
                {t("confirmYes")}
              </Button>
              <Button
                type="button"
                onClick={handleCancelConfirm}
                disabled={loading}
                style={{
                  background: "#A6A6A6",
                  color: "#FFFFFF",
                  padding: "8px 24px",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: 500,
                  width: "80%",
                }}
              >
                {t("confirmNo")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
          <div
            className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[10px] shadow-[0px_4px_4px_rgba(166,166,166,0.25)] px-[40px] py-[30px] flex items-center justify-center"
            style={{ maxWidth: "440px", width: "100%" }}
          >
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
