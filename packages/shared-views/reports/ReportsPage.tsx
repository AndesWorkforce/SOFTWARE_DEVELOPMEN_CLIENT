"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { Button, DataTable, FilterPanel } from "@/packages/design-system";
import { useReportsPage } from "./useReportsPage";
import type { Role } from "@/packages/role-utils";

interface ReportsPageProps {
  role: Role;
}

export function ReportsPage({ role }: ReportsPageProps) {
  const {
    t,
    activities,
    loading,
    filters,
    setFilters,
    filtersConfig,
    handleClearFilters,
    buildExportUrl,
    tableConfig,
    permissions,
  } = useReportsPage(role);

  return (
    <>
      <div className="p-4 md:p-8 min-h-screen" style={{ background: "#FFFFFF" }}>
        <div className="max-w-full">
          <div className="mb-6 md:mb-8 flex items-center justify-between">
            <h1 className="text-xl md:text-3xl font-bold" style={{ color: "#000000" }}>
              {t("title")}
            </h1>
            {permissions.showReports && (
              <Link href={buildExportUrl()}>
                <Button
                  variant="primary"
                  style={{
                    background: "#0097B2",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    padding: "7px 21px",
                    height: "40px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  <span>{t("reportGenerator")}</span>
                </Button>
              </Link>
            )}
          </div>

          <FilterPanel
            config={filtersConfig}
            initialValues={filters}
            onChange={setFilters}
            onClear={handleClearFilters}
            loading={loading}
          />

          <DataTable
            config={tableConfig}
            data={activities}
            title={t("activityToday")}
            loading={loading}
          />
        </div>
      </div>
    </>
  );
}
