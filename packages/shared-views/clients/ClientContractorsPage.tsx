"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import { Button, DataTable, FilterPanel, Header } from "@/packages/design-system";

import { AddTeamModal } from "./AddTeamModal";
import { useClientContractorsPage } from "./useClientContractorsPage";

export type ClientContractorsManagedRole = "admin" | "super-admin" | "visualizer";

interface ClientContractorsPageProps {
  role: ClientContractorsManagedRole;
}

export function ClientContractorsPage({ role }: ClientContractorsPageProps) {
  const [addTeamOpen, setAddTeamOpen] = useState(false);
  const {
    clientId,
    clientName,
    contractors,
    loading,
    filters,
    setFilters,
    filtersConfig,
    tableConfig,
    handleClearFilters,
    permissions,
    t,
    addContractorHref,
    clientsListHref,
    refreshClientDetailData,
  } = useClientContractorsPage(role);

  if (!clientId) {
    if (role === "visualizer") {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-gray-600">{t("common.invalidClient")}</p>
          <Link href={clientsListHref} className="mt-4 text-blue-600 hover:underline">
            {t("common.backToClients")}
          </Link>
        </div>
      );
    }
    return null;
  }

  if (role === "visualizer") {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: "#FFFFFF" }}>
        <Header />
        <div className="flex-1 overflow-x-hidden pt-[71px] px-4 md:px-8 pb-4 md:pb-8">
          <div className="max-w-full overflow-x-hidden">
            <div className="mb-6 md:mb-8 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <Link
                  href={clientsListHref}
                  className="text-black hover:opacity-70 transition-opacity"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-xl md:text-3xl font-bold" style={{ color: "#000000" }}>
                  {clientName || t("contractors.title")}
                </h1>
              </div>
            </div>

            <FilterPanel
              config={filtersConfig}
              initialValues={filters}
              onChange={setFilters}
              onClear={handleClearFilters}
            />

            <div className="w-full overflow-x-auto">
              <DataTable config={tableConfig} data={contractors} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen" style={{ background: "#FFFFFF" }}>
      <div className="max-w-full">
        <div className="mb-6 md:mb-8 flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-xl md:text-3xl font-bold text-black">
            {clientName || t("contractors.title")}
          </h1>
          {permissions.canAdd && clientId ? (
            <div className="flex flex-row flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="primary"
                onClick={() => setAddTeamOpen(true)}
                className="md:text-[15px] h-[35px] md:h-[40px] bg-[#0097B2] text-white text-[15px] font-semibold px-[21px] py-[7px] flex items-center gap-[10px] rounded-[8px] shadow-[0px_4px_4px_rgba(166,166,166,0.25)] cursor-pointer"
              >
                <Plus className="w-[14px] h-[14px] md:w-5 md:h-5" />
                <span className="font-semibold">{t("contractors.addTeam")}</span>
              </Button>
              {addContractorHref ? (
                <Link href={addContractorHref}>
                  <Button
                    variant="primary"
                    className="md:text-[15px] h-[35px] md:h-[40px] bg-[#0097B2] text-white text-[15px] font-semibold px-[21px] py-[7px] flex items-center gap-[10px] rounded-[8px] shadow-[0px_4px_4px_rgba(166,166,166,0.25)] cursor-pointer"
                  >
                    <Plus className="w-[14px] h-[14px] md:w-5 md:h-5" />
                    <span className="font-semibold">{t("contractors.addContractor")}</span>
                  </Button>
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        {permissions.canAdd && clientId && addTeamOpen ? (
          <AddTeamModal
            onClose={() => setAddTeamOpen(false)}
            clientId={clientId}
            onCreated={refreshClientDetailData}
          />
        ) : null}

        <FilterPanel
          config={filtersConfig}
          onChange={setFilters}
          onClear={handleClearFilters}
          loading={loading}
          initialValues={{ clientId }}
        />

        <DataTable config={tableConfig} data={contractors} loading={loading} />
      </div>
    </div>
  );
}
