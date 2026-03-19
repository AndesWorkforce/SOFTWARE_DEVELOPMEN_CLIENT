"use client";
import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Bot } from "lucide-react";

import { Button, DataTable, Modal, Select } from "../../design-system";
import type { DataTableConfig } from "../../design-system";
import { AppAssignmentView } from "./AppAssignmentView";
import { DomainAssignmentView } from "./DomainAssignmentView";
import { AgentsService } from "../../api/agents/agents.service";
import { ApplicationsService } from "../../api/applications/applications.service";
import { ContractorsService } from "../../api/contractors/contractors.service";
import type { Agent } from "../../types/agents.types";
import type { Application } from "../../types/applications.types";
import type { Contractor } from "../../types/contractors.types";

export interface AgentsManagementViewProps {
  role: "super-admin" | "admin";
}

type Tab = "unlinked" | "applications" | "assign" | "domains";

const agentsService = new AgentsService();
const applicationsService = new ApplicationsService();
const contractorsService = new ContractorsService();

export const AgentsManagementView = ({ role }: AgentsManagementViewProps) => {
  const t = useTranslations("agents");

  const canLink = role === "super-admin" || role === "admin";

  const [activeTab, setActiveTab] = useState<Tab>("unlinked");
  const [unlinkedAgents, setUnlinkedAgents] = useState<Agent[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);
  const [agentsError, setAgentsError] = useState<string | null>(null);

  // Link modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedContractorId, setSelectedContractorId] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const loadUnlinkedAgents = useCallback(() => {
    setLoadingAgents(true);
    setAgentsError(null);
    agentsService
      .getUnlinked()
      .then(setUnlinkedAgents)
      .catch((err: Error) => {
        setUnlinkedAgents([]);
        setAgentsError(err.message ?? t("fetchError"));
      })
      .finally(() => setLoadingAgents(false));
  }, [t]);

  useEffect(() => {
    loadUnlinkedAgents();
  }, [loadUnlinkedAgents]);

  useEffect(() => {
    if (activeTab === "applications" && applications.length === 0) {
      setLoadingApps(true);
      applicationsService
        .getAll()
        .then(setApplications)
        .catch(() => setApplications([]))
        .finally(() => setLoadingApps(false));
    }
  }, [activeTab, applications.length]);

  const openLinkModal = useCallback(
    async (agent: Agent) => {
      setSelectedAgent(agent);
      setSelectedContractorId("");
      setLinkError(null);
      setIsModalOpen(true);
      if (contractors.length === 0) {
        const all = await contractorsService.getAll().catch(() => []);
        setContractors(all);
      }
    },
    [contractors.length],
  );

  const handleLink = async () => {
    if (!selectedAgent?.activation_key || !selectedContractorId) return;
    setLinking(true);
    setLinkError(null);
    try {
      await agentsService.linkToContractor({
        activation_key: selectedAgent.activation_key,
        contractorId: selectedContractorId,
      });
      setUnlinkedAgents((prev) => prev.filter((a) => a.id !== selectedAgent.id));
      setIsModalOpen(false);
    } catch {
      setLinkError(t("link.errorMessage"));
    } finally {
      setLinking(false);
    }
  };

  const agentsTableConfig: DataTableConfig<Agent> = {
    columns: [
      {
        key: "hostname",
        title: t("table.hostname"),
        dataPath: "hostname",
        type: "text",
        minWidth: "150px",
      },
      {
        key: "activation_key",
        title: t("table.activationKey"),
        dataPath: "activation_key",
        type: "text",
        minWidth: "220px",
        render: (value) => (
          <span className="font-mono text-xs" style={{ color: "#0097B2", wordBreak: "break-all" }}>
            {value as string}
          </span>
        ),
      },
      {
        key: "type",
        title: t("table.type"),
        dataPath: "type",
        type: "badge",
        minWidth: "110px",
      },
      {
        key: "is_active",
        title: t("table.status"),
        dataPath: "is_active",
        type: "text",
        minWidth: "100px",
        render: (value) => (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              background: value ? "#D1FAE5" : "#FEE2E2",
              color: value ? "#065F46" : "#991B1B",
            }}
          >
            {value ? t("table.active") : t("table.inactive")}
          </span>
        ),
      },
      {
        key: "created_at",
        title: t("table.createdAt"),
        dataPath: "created_at",
        type: "date",
        minWidth: "120px",
      },
      {
        key: "action",
        title: t("table.action"),
        dataPath: "id",
        type: "action",
        minWidth: "160px",
        align: "center",
        render: (_value, row) =>
          canLink ? (
            <Button size="sm" variant="outline" onClick={() => openLinkModal(row)}>
              {t("link.button")}
            </Button>
          ) : null,
      },
    ],
    rowKey: "id",
    striped: true,
    evenRowColor: "#E2E2E2",
    oddRowColor: "#FFFFFF",
    emptyState: { message: t("noAgents"), icon: <Bot className="w-8 h-8" /> },
    styles: {
      table: {
        border: "1px solid #E2E2E2",
        boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
        borderRadius: "8px",
      },
      cell: { paddingTop: "12px", paddingBottom: "12px" },
    },
    mobileConfig: {
      primaryFields: [
        { key: "hostname", label: t("table.hostname"), dataPath: "hostname" },
        { key: "type", label: t("table.type"), dataPath: "type" },
      ],
      expandedFields: [
        {
          key: "activation_key",
          label: t("table.activationKey"),
          dataPath: "activation_key",
        },
        {
          key: "is_active",
          label: t("table.status"),
          dataPath: "is_active",
          render: (value) => ((value as boolean) ? t("table.active") : t("table.inactive")),
        },
        {
          key: "action",
          label: t("table.action"),
          dataPath: "id",
          render: (_value, row) => (
            <Button size="sm" variant="outline" onClick={() => openLinkModal(row as Agent)}>
              {t("link.button")}
            </Button>
          ),
        },
      ],
      expandable: true,
    },
  };

  const appsTableConfig: DataTableConfig<Application> = {
    columns: [
      {
        key: "name",
        title: t("appsTable.name"),
        dataPath: "name",
        type: "text",
        minWidth: "200px",
      },
      {
        key: "type",
        title: t("appsTable.type"),
        dataPath: "type",
        type: "badge",
        minWidth: "120px",
      },
      {
        key: "category",
        title: t("appsTable.category"),
        dataPath: "category",
        type: "text",
        minWidth: "130px",
      },
      {
        key: "weight",
        title: t("appsTable.weight"),
        dataPath: "weight",
        type: "number",
        minWidth: "80px",
        align: "right",
      },
    ],
    rowKey: "id",
    striped: true,
    evenRowColor: "#E2E2E2",
    oddRowColor: "#FFFFFF",
    emptyState: { message: t("noApps") },
    styles: {
      table: {
        border: "1px solid #E2E2E2",
        boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
        borderRadius: "8px",
      },
      cell: { paddingTop: "12px", paddingBottom: "12px" },
    },
    mobileConfig: {
      primaryFields: [
        { key: "name", label: t("appsTable.name"), dataPath: "name" },
        { key: "type", label: t("appsTable.type"), dataPath: "type" },
      ],
      expandedFields: [
        {
          key: "category",
          label: t("appsTable.category"),
          dataPath: "category",
        },
        {
          key: "weight",
          label: t("appsTable.weight"),
          dataPath: "weight",
        },
      ],
      expandable: true,
    },
  };

  const contractorOptions = [
    { value: "", label: t("link.selectContractorPlaceholder") },
    ...contractors.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#08252A" }}>
        {t("title")}
      </h1>

      {/* Tabs */}
      <div className="flex gap-0 mb-6" style={{ borderBottom: "1px solid #E5E5E5" }}>
        <button
          className="px-5 py-2.5 text-sm font-medium transition-colors"
          style={{
            color: activeTab === "unlinked" ? "#0097B2" : "#6B7280",
            borderBottom: activeTab === "unlinked" ? "2px solid #0097B2" : "2px solid transparent",
          }}
          onClick={() => setActiveTab("unlinked")}
        >
          {t("tabs.unlinked")}
          {unlinkedAgents.length > 0 && (
            <span
              className="ml-2 text-xs rounded-full px-2 py-0.5 font-medium"
              style={{ background: "#0097B2", color: "#FFFFFF" }}
            >
              {unlinkedAgents.length}
            </span>
          )}
        </button>
        <button
          className="px-5 py-2.5 text-sm font-medium transition-colors"
          style={{
            color: activeTab === "applications" ? "#0097B2" : "#6B7280",
            borderBottom:
              activeTab === "applications" ? "2px solid #0097B2" : "2px solid transparent",
          }}
          onClick={() => setActiveTab("applications")}
        >
          {t("tabs.applications")}
        </button>
        <button
          className="px-5 py-2.5 text-sm font-medium transition-colors"
          style={{
            color: activeTab === "assign" ? "#0097B2" : "#6B7280",
            borderBottom: activeTab === "assign" ? "2px solid #0097B2" : "2px solid transparent",
          }}
          onClick={() => setActiveTab("assign")}
        >
          {t("tabs.assign")}
        </button>
        <button
          className="px-5 py-2.5 text-sm font-medium transition-colors"
          style={{
            color: activeTab === "domains" ? "#0097B2" : "#6B7280",
            borderBottom: activeTab === "domains" ? "2px solid #0097B2" : "2px solid transparent",
          }}
          onClick={() => setActiveTab("domains")}
        >
          {t("tabs.domains")}
        </button>
      </div>

      {/* Table content */}
      {activeTab === "unlinked" && (
        <>
          {agentsError && (
            <div
              className="flex items-center justify-between mb-4 px-4 py-3 rounded-lg text-sm"
              style={{ background: "#FEE2E2", color: "#991B1B", border: "1px solid #FECACA" }}
            >
              <span>⚠️ {agentsError}</span>
              <Button size="sm" variant="outline" onClick={loadUnlinkedAgents}>
                {t("retry")}
              </Button>
            </div>
          )}
          <DataTable config={agentsTableConfig} data={unlinkedAgents} loading={loadingAgents} />
        </>
      )}

      {activeTab === "applications" && (
        <DataTable config={appsTableConfig} data={applications} loading={loadingApps} />
      )}

      {activeTab === "assign" && <AppAssignmentView role={role} />}

      {activeTab === "domains" && <DomainAssignmentView role={role} />}

      {/* Link to Contractor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !linking && setIsModalOpen(false)}
        title={t("link.title")}
        size="sm"
      >
        <div className="space-y-4 p-1">
          {selectedAgent && (
            <p className="text-sm" style={{ color: "#374151" }}>
              {t("link.agentLabel")}:{" "}
              <strong className="font-mono">
                {selectedAgent.hostname ?? selectedAgent.activation_key}
              </strong>
            </p>
          )}

          <Select
            label={t("link.selectContractor")}
            options={contractorOptions}
            value={selectedContractorId}
            onChange={(e) => setSelectedContractorId(e.target.value)}
            required
          />

          {linkError && (
            <p className="text-sm" style={{ color: "#DC2626" }}>
              {linkError}
            </p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={linking}
            >
              {t("link.cancel")}
            </Button>
            <Button
              size="sm"
              onClick={handleLink}
              disabled={!selectedContractorId || linking}
              loading={linking}
            >
              {t("link.confirm")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
