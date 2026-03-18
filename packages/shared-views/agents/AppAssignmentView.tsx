"use client";
import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { PackageSearch, X, CheckSquare, Square } from "lucide-react";

import { Button, DataTable } from "../../design-system";
import type { DataTableConfig } from "../../design-system";
import { ApplicationsService } from "../../api/applications/applications.service";
import { ContractorsService } from "../../api/contractors/contractors.service";
import type { Application } from "../../types/applications.types";
import type { Contractor } from "../../types/contractors.types";

export interface AppAssignmentViewProps {
  role: "super-admin" | "admin";
}

const applicationsService = new ApplicationsService();
const contractorsService = new ContractorsService();

export const AppAssignmentView = ({ role }: AppAssignmentViewProps) => {
  const t = useTranslations("appAssignment");

  const canAssign = role === "super-admin" || role === "admin";

  // ── Data state ──────────────────────────────────────────────────────────────
  const [allApps, setAllApps] = useState<Application[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [loadingContractors, setLoadingContractors] = useState(false);

  // ── Selection state ─────────────────────────────────────────────────────────
  const [selectedContractorId, setSelectedContractorId] = useState<string>("");
  const [contractorApps, setContractorApps] = useState<Application[]>([]);
  const [loadingContractorApps, setLoadingContractorApps] = useState(false);
  const [selectedAppIds, setSelectedAppIds] = useState<Set<string>>(new Set());

  // ── Action state ─────────────────────────────────────────────────────────────
  const [assigning, setAssigning] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── Contractor search state ──────────────────────────────────────────────────
  const [contractorSearch, setContractorSearch] = useState("");
  const [appSearch, setAppSearch] = useState("");

  // ── Load all apps and contractors on mount ───────────────────────────────────
  useEffect(() => {
    setLoadingApps(true);
    applicationsService
      .getAll()
      .then(setAllApps)
      .catch(() => setAllApps([]))
      .finally(() => setLoadingApps(false));

    setLoadingContractors(true);
    contractorsService
      .getAll()
      .then(setContractors)
      .catch(() => setContractors([]))
      .finally(() => setLoadingContractors(false));
  }, []);

  // ── When contractor changes, load their assigned apps ────────────────────────
  useEffect(() => {
    if (!selectedContractorId) {
      setContractorApps([]);
      setSelectedAppIds(new Set());
      return;
    }
    setLoadingContractorApps(true);
    setSelectedAppIds(new Set());
    applicationsService
      .getByContractor(selectedContractorId)
      .then((apps) => {
        setContractorApps(apps);
      })
      .catch(() => setContractorApps([]))
      .finally(() => setLoadingContractorApps(false));
  }, [selectedContractorId]);

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
  }, []);

  const toggleAppSelection = useCallback((appId: string) => {
    setSelectedAppIds((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) {
        next.delete(appId);
      } else {
        next.add(appId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    const filtered = allApps.filter(
      (a) =>
        !contractorApps.some((ca) => ca.id === a.id) &&
        a.name.toLowerCase().includes(appSearch.toLowerCase()),
    );
    setSelectedAppIds(new Set(filtered.map((a) => a.id)));
  }, [allApps, contractorApps, appSearch]);

  const clearSelection = useCallback(() => {
    setSelectedAppIds(new Set());
  }, []);

  const handleAssign = useCallback(async () => {
    if (!selectedContractorId || selectedAppIds.size === 0) return;
    clearMessages();
    setAssigning(true);
    try {
      const result = await applicationsService.assignToContractor(
        selectedContractorId,
        Array.from(selectedAppIds),
      );
      const assigned = await applicationsService.getByContractor(selectedContractorId);
      setContractorApps(assigned);
      setSelectedAppIds(new Set());
      setSuccessMessage(t("assignSuccess", { count: result.assigned }));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : t("assignError"));
    } finally {
      setAssigning(false);
    }
  }, [selectedContractorId, selectedAppIds, clearMessages, t]);

  const handleRemove = useCallback(
    async (appId: string) => {
      if (!selectedContractorId) return;
      clearMessages();
      setRemoving(true);
      try {
        await applicationsService.removeFromContractor(selectedContractorId, [appId]);
        setContractorApps((prev) => prev.filter((a) => a.id !== appId));
        setSuccessMessage(t("removeSuccess"));
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : t("removeError"));
      } finally {
        setRemoving(false);
      }
    },
    [selectedContractorId, clearMessages, t],
  );

  // ── Derived data ─────────────────────────────────────────────────────────────
  const assignedIds = new Set(contractorApps.map((a) => a.id));

  const availableApps = allApps.filter(
    (a) => !assignedIds.has(a.id) && a.name.toLowerCase().includes(appSearch.toLowerCase()),
  );

  const filteredContractors = contractors.filter((c) =>
    c.name.toLowerCase().includes(contractorSearch.toLowerCase()),
  );

  const selectedContractor = contractors.find((c) => c.id === selectedContractorId);

  // ── Table config: available apps (left panel) ─────────────────────────────────
  const availableTableConfig: DataTableConfig<Application> = {
    columns: [
      {
        key: "select",
        title: "",
        dataPath: "id",
        type: "custom",
        minWidth: "40px",
        align: "center",
        render: (value) => {
          const isSelected = selectedAppIds.has(value as string);
          return (
            <button
              onClick={() => toggleAppSelection(value as string)}
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
        minWidth: "180px",
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
      icon: <PackageSearch className="w-8 h-8" />,
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

  // ── Table config: assigned apps (right panel) ──────────────────────────────────
  const assignedTableConfig: DataTableConfig<Application> = {
    columns: [
      {
        key: "name",
        title: t("table.name"),
        dataPath: "name",
        type: "text",
        minWidth: "180px",
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
              title={t("removeApp")}
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

      {/* Feedback messages */}
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
              style={{
                border: "1px solid #D1D5DB",
                color: "#374151",
                background: "#FFFFFF",
              }}
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
        {/* Left: Available apps */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold" style={{ color: "#08252A" }}>
                {t("availableTitle")}
              </h2>
              <p className="text-xs" style={{ color: "#6B7280" }}>
                {availableApps.length} {t("apps")}
                {selectedAppIds.size > 0 && (
                  <span
                    className="ml-2 font-medium px-1.5 py-0.5 rounded-full text-xs"
                    style={{ background: "#0097B2", color: "#fff" }}
                  >
                    {selectedAppIds.size} {t("selected")}
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
                {selectedAppIds.size > 0 && (
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

          {/* App search */}
          <input
            type="text"
            value={appSearch}
            onChange={(e) => setAppSearch(e.target.value)}
            placeholder={t("searchApp")}
            className="w-full px-3 py-2 rounded-lg text-sm mb-3 outline-none"
            style={{ border: "1px solid #D1D5DB", color: "#374151", background: "#FFFFFF" }}
          />

          <DataTable
            config={availableTableConfig}
            data={availableApps}
            loading={loadingApps || loadingContractorApps}
          />

          {/* Assign action */}
          {canAssign && selectedContractorId && selectedAppIds.size > 0 && (
            <div className="mt-3 flex justify-end">
              <Button size="sm" onClick={handleAssign} loading={assigning} disabled={assigning}>
                {t("assignButton", { count: selectedAppIds.size })}
              </Button>
            </div>
          )}
        </div>

        {/* Right: Assigned apps */}
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
              {contractorApps.length} {t("apps")}
            </p>
          </div>
          <DataTable
            config={assignedTableConfig}
            data={contractorApps}
            loading={loadingContractorApps}
          />
        </div>
      </div>
    </div>
  );
};
