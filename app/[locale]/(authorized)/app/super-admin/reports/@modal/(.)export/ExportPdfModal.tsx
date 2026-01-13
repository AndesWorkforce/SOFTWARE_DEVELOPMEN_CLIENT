"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, FormModalLayout } from "@/packages/design-system";
import { reportsService, type GenerateReportPayload } from "@/packages/api/reports/reports.service";
import type { FilterOptions } from "@/packages/api/reports/reports.service";

interface ExportPdfModalProps {
  filterOptions: FilterOptions | null;
}

export default function ExportPdfModal({ filterOptions }: ExportPdfModalProps) {
  const t = useTranslations("reports");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Parse filters from URL
  const filters = useMemo(() => {
    return {
      userId: searchParams.get("userId") || undefined,
      country: searchParams.get("country") || undefined,
      clientId: searchParams.get("clientId") || undefined,
      teamId: searchParams.get("teamId") || undefined,
      jobPosition: searchParams.get("jobPosition") || undefined,
      dateRange: {
        start: searchParams.get("from") || new Date().toISOString().split("T")[0],
        end: searchParams.get("to") || new Date().toISOString().split("T")[0],
      },
    };
  }, [searchParams]);

  const availableFields = useMemo(
    () => [
      { value: "contractorName", label: t("exportModal.fields.contractorName"), required: true },
      { value: "jobPosition", label: t("exportModal.fields.jobPosition"), required: false },
      { value: "clientName", label: t("exportModal.fields.clientName"), required: false },
      { value: "teamName", label: t("exportModal.fields.teamName"), required: false },
      { value: "country", label: t("exportModal.fields.country"), required: false },
      { value: "timeWorked", label: t("exportModal.fields.timeWorked"), required: false },
      {
        value: "activityPercentage",
        label: t("exportModal.fields.activityPercentage"),
        required: false,
      },
      {
        value: "productivityScore",
        label: t("exportModal.fields.productivityScore"),
        required: false,
      },
    ],
    [t],
  );

  const requiredFields = useMemo(
    () => new Set(availableFields.filter((f) => f.required).map((f) => f.value)),
    [availableFields],
  );

  // Initialize selectedFields with all fields on mount
  useEffect(() => {
    setSelectedFields(availableFields.map((f) => f.value));
  }, [availableFields]);

  const handleClose = () => {
    router.back();
  };

  const handleToggleField = (field: string) => {
    if (requiredFields.has(field)) return;
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    );
  };

  const getLabel = (options: { value: string; label: string }[] | undefined, value?: string) => {
    if (!value || !options) return "";
    return options.find((opt) => opt.value === value)?.label || "";
  };

  const handleGenerateReport = async () => {
    try {
      setExportLoading(true);
      setExportError(null);

      const from = filters.dateRange.start;
      const to = filters.dateRange.end;

      const payload: GenerateReportPayload = {
        from,
        to,
        team_id: filters.teamId,
        client_id: filters.clientId,
        contractor_id: filters.userId,
        selectedFields,
      };

      const response = await reportsService.generateReport(payload);
      if (response?.pdfUrl) {
        window.open(response.pdfUrl, "_blank", "noopener,noreferrer");
        router.back();
      } else {
        setExportError(response?.message || t("exportModal.errorDefault"));
      }
    } catch (error) {
      console.error("❌ Error generating PDF report:", error);
      setExportError(t("exportModal.error"));
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <FormModalLayout
      isOpen={true}
      onClose={handleClose}
      title={t("exportPdf") || "Export PDF"}
      size="lg"
      modalStyle={{ maxWidth: "700px" }}
      errorMessage={exportError}
      footer={
        <div className="flex justify-end gap-3 px-6 py-4">
          <Button variant="secondary" onClick={handleClose} style={{ minWidth: "120px" }}>
            {t("exportModal.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleGenerateReport}
            disabled={exportLoading}
            style={{
              background: "#0097B2",
              color: "#FFFFFF",
              minWidth: "140px",
            }}
          >
            {exportLoading ? t("exportModal.generating") : t("exportModal.generate")}
          </Button>
        </div>
      }
    >
      <div className="px-6 py-4">
        {/* Selected Filters Section */}
        <div className="mb-6">
          <h3 className="text-base font-semibold mb-3" style={{ color: "#000000" }}>
            {t("exportModal.selectedFilters")}
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <span className="font-medium" style={{ color: "#000000" }}>
                {t("exportModal.startDate")}:
              </span>
              <br />
              <span style={{ color: "#0000EE" }}>
                {filters.dateRange.start || t("exportModal.notAvailable")}
              </span>
            </div>
            <div>
              <span className="font-medium" style={{ color: "#000000" }}>
                {t("exportModal.endDate")}:
              </span>
              <br />
              <span style={{ color: "#0000EE" }}>
                {filters.dateRange.end || filters.dateRange.start || t("exportModal.notAvailable")}
              </span>
            </div>
            <div>
              <span className="font-medium" style={{ color: "#000000" }}>
                {t("exportModal.user")}:
              </span>
              <br />
              <span style={{ color: "#0000EE" }}>
                {getLabel(filterOptions?.users, filters.userId) || t("exportModal.all")}
              </span>
            </div>
            <div>
              <span className="font-medium" style={{ color: "#000000" }}>
                {t("exportModal.country")}:
              </span>
              <br />
              <span style={{ color: "#0000EE" }}>
                {getLabel(filterOptions?.countries, filters.country) || t("exportModal.all")}
              </span>
            </div>
            <div>
              <span className="font-medium" style={{ color: "#000000" }}>
                {t("exportModal.client")}:
              </span>
              <br />
              <span style={{ color: "#0000EE" }}>
                {getLabel(filterOptions?.clients, filters.clientId) || t("exportModal.all")}
              </span>
            </div>
            <div>
              <span className="font-medium" style={{ color: "#000000" }}>
                {t("exportModal.team")}:
              </span>
              <br />
              <span style={{ color: "#0000EE" }}>
                {getLabel(filterOptions?.teams, filters.teamId) || t("exportModal.all")}
              </span>
            </div>
            <div className="col-span-2">
              <span className="font-medium" style={{ color: "#000000" }}>
                {t("exportModal.jobPosition")}:
              </span>
              <br />
              <span style={{ color: "#0000EE" }}>
                {getLabel(filterOptions?.jobPositions, filters.jobPosition) || t("exportModal.all")}
              </span>
            </div>
          </div>
        </div>

        {/* Choose Report Fields Section */}
        <div>
          <h3 className="text-base font-semibold mb-3" style={{ color: "#000000" }}>
            {t("exportModal.selectFields")}
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {availableFields.map((field) => (
              <label
                key={field.value}
                className="flex items-center gap-2 cursor-pointer"
                style={{
                  color: field.required ? "#999999" : "#000000",
                  cursor: field.required ? "not-allowed" : "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedFields.includes(field.value)}
                  onChange={() => handleToggleField(field.value)}
                  disabled={field.required}
                  className="h-4 w-4 cursor-pointer"
                  style={{ accentColor: "#0097B2" }}
                />
                <span>
                  {field.label}
                  {field.required && ` ${t("exportModal.required")}`}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </FormModalLayout>
  );
}
