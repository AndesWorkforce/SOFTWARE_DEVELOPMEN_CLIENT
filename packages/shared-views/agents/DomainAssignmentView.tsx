"use client";
import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Globe, X, CheckSquare, Square } from "lucide-react";

import { Button, DataTable } from "../../design-system";
import type { DataTableConfig } from "../../design-system";
import { DomainsService } from "../../api/domains/domains.service";
import { ContractorsService } from "../../api/contractors/contractors.service";
import type { Domain } from "../../types/domains.types";
import type { Contractor } from "../../types/contractors.types";

export interface DomainAssignmentViewProps {
  role: "super-admin" | "admin";
}

const domainsService = new DomainsService();
const contractorsService = new ContractorsService();

export const DomainAssignmentView = ({ role }: DomainAssignmentViewProps) => {
  const t = useTranslations("domainAssignment");

  const canAssign = role === "super-admin" || role === "admin";

  const [allDomains, setAllDomains] = useState<Domain[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [loadingContractors, setLoadingContractors] = useState(false);

  const [selectedContractorId, setSelectedContractorId] = useState<string>("");
  const [contractorDomains, setContractorDomains] = useState<Domain[]>([]);
  const [loadingContractorDomains, setLoadingContractorDomains] = useState(false);
  const [selectedDomainIds, setSelectedDomainIds] = useState<Set<string>>(new Set());

  const [assigning, setAssigning] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [contractorSearch, setContractorSearch] = useState("");
  const [domainSearch, setDomainSearch] = useState("");

  useEffect(() => {
    setLoadingDomains(true);
    domainsService
      .getAll()
      .then(setAllDomains)
      .catch(() => setAllDomains([]))
      .finally(() => setLoadingDomains(false));

    setLoadingContractors(true);
    contractorsService
      .getAll()
      .then(setContractors)
      .catch(() => setContractors([]))
      .finally(() => setLoadingContractors(false));
  }, []);

  useEffect(() => {
    if (!selectedContractorId) {
      setContractorDomains([]);
      setSelectedDomainIds(new Set());
      return;
    }
    setLoadingContractorDomains(true);
    setSelectedDomainIds(new Set());
    domainsService
      .getByContractor(selectedContractorId)
      .then(setContractorDomains)
      .catch(() => setContractorDomains([]))
      .finally(() => setLoadingContractorDomains(false));
  }, [selectedContractorId]);

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
  }, []);

  const toggleDomainSelection = useCallback((domainId: string) => {
    setSelectedDomainIds((prev) => {
      const next = new Set(prev);
      if (next.has(domainId)) {
        next.delete(domainId);
      } else {
        next.add(domainId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    const filtered = allDomains.filter(
      (d) =>
        !contractorDomains.some((cd) => cd.id === d.id) &&
        d.name.toLowerCase().includes(domainSearch.toLowerCase()),
    );
    setSelectedDomainIds(new Set(filtered.map((d) => d.id)));
  }, [allDomains, contractorDomains, domainSearch]);

  const clearSelection = useCallback(() => {
    setSelectedDomainIds(new Set());
  }, []);

  const handleAssign = useCallback(async () => {
    if (!selectedContractorId || selectedDomainIds.size === 0) return;
    clearMessages();
    setAssigning(true);
    try {
      const result = await domainsService.assignToContractor(
        selectedContractorId,
        Array.from(selectedDomainIds),
      );
      const assigned = await domainsService.getByContractor(selectedContractorId);
      setContractorDomains(assigned);
      setSelectedDomainIds(new Set());
      setSuccessMessage(t("assignSuccess", { count: result.assigned }));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : t("assignError"));
    } finally {
      setAssigning(false);
    }
  }, [selectedContractorId, selectedDomainIds, clearMessages, t]);

  const handleRemove = useCallback(
    async (domainId: string) => {
      if (!selectedContractorId) return;
      clearMessages();
      setRemoving(true);
      try {
        await domainsService.removeFromContractor(selectedContractorId, [domainId]);
        setContractorDomains((prev) => prev.filter((d) => d.id !== domainId));
        setSuccessMessage(t("removeSuccess"));
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : t("removeError"));
      } finally {
        setRemoving(false);
      }
    },
    [selectedContractorId, clearMessages, t],
  );

  const assignedIds = new Set(contractorDomains.map((d) => d.id));

  const availableDomains = allDomains.filter(
    (d) => !assignedIds.has(d.id) && d.name.toLowerCase().includes(domainSearch.toLowerCase()),
  );

  const filteredContractors = contractors.filter((c) =>
    c.name.toLowerCase().includes(contractorSearch.toLowerCase()),
  );

  const selectedContractor = contractors.find((c) => c.id === selectedContractorId);

  const availableTableConfig: DataTableConfig<Domain> = {
    columns: [
      {
        key: "select",
        title: "",
        dataPath: "id",
        type: "custom",
        minWidth: "40px",
        align: "center",
        render: (value) => {
          const isSelected = selectedDomainIds.has(value as string);
          return (
            <button
              onClick={() => toggleDomainSelection(value as string)}
              disabled={!canAssign || !selectedContractorId}
              className="text-[#0097B2] hover:opacity-70 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
            </button>
          );
        },
      },
      {
        key: "name",
        title: t("table.name"),
        dataPath: "name",
        type: "text",
        minWidth: "200px",
      },
      {
        key: "type",
        title: t("table.type"),
        dataPath: "type",
        type: "badge",
        minWidth: "110px",
      },
      {
        key: "category",
        title: t("table.category"),
        dataPath: "category",
        type: "text",
        minWidth: "120px",
      },
    ],
    rowKey: "id",
    striped: true,
    evenRowColor: "#F0F9FF",
    oddRowColor: "#FFFFFF",
    emptyState: {
      message: selectedContractorId ? t("noAvailable") : t("selectContractorFirst"),
      icon: <Globe className="w-8 h-8" />,
    },
    styles: {
      table: {
        border: "1px solid #E2E2E2",
        boxShadow: "0px 2px 4px rgba(166,166,166,0.2)",
        borderRadius: "8px",
      },
      cell: { paddingTop: "10px", paddingBottom: "10px" },
    },
  };

  const assignedTableConfig: DataTableConfig<Domain> = {
    columns: [
      {
        key: "name",
        title: t("table.name"),
        dataPath: "name",
        type: "text",
        minWidth: "200px",
      },
      {
        key: "type",
        title: t("table.type"),
        dataPath: "type",
        type: "badge",
        minWidth: "110px",
      },
      {
        key: "remove",
        title: "",
        dataPath: "id",
        type: "custom",
        minWidth: "48px",
        align: "center",
        render: (value) =>
          canAssign ? (
            <button
              onClick={() => handleRemove(value as string)}
              disabled={removing || !selectedContractorId}
              className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title={t("removeDomain")}
            >
              <X className="w-4 h-4" />
            </button>
          ) : null,
      },
    ],
    rowKey: "id",
    striped: true,
    evenRowColor: "#F0FFF4",
    oddRowColor: "#FFFFFF",
    emptyState: {
      message: selectedContractorId ? t("noAssigned") : t("selectContractorFirst"),
    },
    styles: {
      table: {
        border: "1px solid #E2E2E2",
        boxShadow: "0px 2px 4px rgba(166,166,166,0.2)",
        borderRadius: "8px",
      },
      cell: { paddingTop: "10px", paddingBottom: "10px" },
    },
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2" style={{ color: "#08252A" }}>
        {t("title")}
      </h1>
      <p className="text-sm mb-6" style={{ color: "#6B7280" }}>
        {t("subtitle")}
      </p>

      {successMessage && (
        <div
          className="flex items-center justify-between mb-4 px-4 py-3 rounded-lg text-sm"
          style={{ background: "#D1FAE5", color: "#065F46", border: "1px solid #A7F3D0" }}
        >
          <span>✓ {successMessage}</span>
          <button onClick={clearMessages} className="text-green-700 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {errorMessage && (
        <div
          className="flex items-center justify-between mb-4 px-4 py-3 rounded-lg text-sm"
          style={{ background: "#FEE2E2", color: "#991B1B", border: "1px solid #FECACA" }}
        >
          <span>⚠️ {errorMessage}</span>
          <button onClick={clearMessages} className="text-red-700 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Contractor selector */}
      <div
        className="mb-6 p-4 rounded-xl"
        style={{ background: "#F8FAFC", border: "1px solid #E2E2E2" }}
      >
        <label className="block text-sm font-medium mb-2" style={{ color: "#08252A" }}>
          {t("selectContractor")}
        </label>
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              value={contractorSearch}
              onChange={(e) => setContractorSearch(e.target.value)}
              placeholder={t("searchContractor")}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ border: "1px solid #D1D5DB", color: "#374151", background: "#FFFFFF" }}
            />
          </div>
          <div className="flex gap-2 flex-wrap max-h-36 overflow-y-auto">
            {loadingContractors ? (
              <span className="text-sm" style={{ color: "#9CA3AF" }}>
                {t("loading")}...
              </span>
            ) : (
              filteredContractors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedContractorId(c.id === selectedContractorId ? "" : c.id);
                    clearMessages();
                  }}
                  className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={{
                    background: c.id === selectedContractorId ? "#0097B2" : "#E5E7EB",
                    color: c.id === selectedContractorId ? "#FFFFFF" : "#374151",
                    border:
                      c.id === selectedContractorId ? "1px solid #0097B2" : "1px solid transparent",
                  }}
                >
                  {c.name}
                </button>
              ))
            )}
          </div>
        </div>
        {selectedContractor && (
          <p className="text-xs mt-2" style={{ color: "#0097B2" }}>
            ✓ {t("selected")}: <strong>{selectedContractor.name}</strong>
          </p>
        )}
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Available domains */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold" style={{ color: "#08252A" }}>
                {t("availableTitle")}
              </h2>
              <p className="text-xs" style={{ color: "#6B7280" }}>
                {availableDomains.length} {t("urls")}
                {selectedDomainIds.size > 0 && (
                  <span
                    className="ml-2 font-medium px-1.5 py-0.5 rounded-full text-xs"
                    style={{ background: "#0097B2", color: "#fff" }}
                  >
                    {selectedDomainIds.size} {t("selected")}
                  </span>
                )}
              </p>
            </div>
            {canAssign && selectedContractorId && (
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs underline"
                  style={{ color: "#0097B2" }}
                >
                  {t("selectAll")}
                </button>
                {selectedDomainIds.size > 0 && (
                  <button
                    onClick={clearSelection}
                    className="text-xs underline"
                    style={{ color: "#9CA3AF" }}
                  >
                    {t("clearSelection")}
                  </button>
                )}
              </div>
            )}
          </div>

          <input
            type="text"
            value={domainSearch}
            onChange={(e) => setDomainSearch(e.target.value)}
            placeholder={t("searchDomain")}
            className="w-full px-3 py-2 rounded-lg text-sm mb-3 outline-none"
            style={{ border: "1px solid #D1D5DB", color: "#374151", background: "#FFFFFF" }}
          />

          <DataTable
            config={availableTableConfig}
            data={availableDomains}
            loading={loadingDomains || loadingContractorDomains}
          />

          {canAssign && selectedContractorId && selectedDomainIds.size > 0 && (
            <div className="mt-3 flex justify-end">
              <Button size="sm" onClick={handleAssign} loading={assigning} disabled={assigning}>
                {t("assignButton", { count: selectedDomainIds.size })}
              </Button>
            </div>
          )}
        </div>

        {/* Right: Assigned domains */}
        <div>
          <div className="mb-3">
            <h2 className="text-base font-semibold" style={{ color: "#08252A" }}>
              {t("assignedTitle")}
              {selectedContractor && (
                <span className="text-sm font-normal ml-1" style={{ color: "#0097B2" }}>
                  — {selectedContractor.name}
                </span>
              )}
            </h2>
            <p className="text-xs" style={{ color: "#6B7280" }}>
              {contractorDomains.length} {t("urls")}
            </p>
          </div>
          <DataTable
            config={assignedTableConfig}
            data={contractorDomains}
            loading={loadingContractorDomains}
          />
        </div>
      </div>
    </div>
  );
};
