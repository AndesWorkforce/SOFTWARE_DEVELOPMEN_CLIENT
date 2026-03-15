"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/packages/design-system";
import { reportsService, type GenerateReportPayload } from "@/packages/api/reports/reports.service";

export default function ExportPdfModal() {
  const t = useTranslations("reports");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      userId: searchParams.get("userId") || undefined,
      clientId: searchParams.get("clientId") || undefined,
      teamId: searchParams.get("teamId") || undefined,
      dateRange: {
        start: searchParams.get("from") || new Date().toISOString().split("T")[0],
        end: searchParams.get("to") || new Date().toISOString().split("T")[0],
      },
    }),
    [searchParams],
  );

  const handleClose = () => router.back();

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
      };

      const response = await reportsService.generateReport(payload);
      if (response?.pdfUrl) {
        window.open(response.pdfUrl, "_blank", "noopener,noreferrer");
        router.back();
      } else {
        setExportError(response?.message || t("exportModal.errorDefault"));
      }
    } catch (error) {
      console.error(" Error generating PDF report:", error);
      setExportError(t("exportModal.error"));
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white border border-[rgba(166,166,166,0.5)] rounded-[10px] shadow-[0px_4px_4px_rgba(166,166,166,0.25)] px-[40px] py-[30px] md:py-[25px] w-[80%] max-w-[401px] md:max-w-[480px] md:w-full flex items-center justify-center">
          <div className="flex flex-col gap-[30px] items-center w-full max-w-[321px] md:max-w-[400px]">
            <div className="flex flex-col gap-[15px] text-center w-full">
              <h2 className="text-[24px] font-bold text-black">
                {t("exportModal.confirmTitle") || "Generate Report"}
              </h2>
              <p className="text-[16px] font-normal text-[#1E1E1E]">
                {t("exportModal.confirmSubtitle") ||
                  "Do you want to generate the productivity report for the selected period?"}
              </p>
              <div className="text-[14px] font-medium text-[#0097B2] mt-2">
                {filters.dateRange.start} - {filters.dateRange.end || filters.dateRange.start}
              </div>
              {exportError && <p className="text-[14px] font-medium text-red-600">{exportError}</p>}
            </div>
            <div className="flex flex-col md:flex-row gap-[10px] w-full">
              <Button
                type="button"
                onClick={handleGenerateReport}
                disabled={exportLoading}
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
                {exportLoading ? t("exportModal.generating") : t("exportModal.generate")}
              </Button>
              <Button
                type="button"
                onClick={handleClose}
                disabled={exportLoading}
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
                {t("exportModal.cancel")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
