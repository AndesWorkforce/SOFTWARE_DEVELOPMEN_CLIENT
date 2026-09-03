"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Bot, Trash2 } from "lucide-react";

import { Button, ContractorSearch, DataTable, Modal, SearchableSelect } from "../../design-system";
import type { DataTableConfig } from "../../design-system";
import { AgentsService } from "../../api/agents/agents.service";
import { ContractorsService } from "../../api/contractors/contractors.service";
import type { Agent } from "../../types/agents.types";
import type { Contractor } from "../../types/contractors.types";
import {
  resolveDeviceStatus,
  getDeviceStatusDisplay,
  formatLastHeartbeat,
} from "../../utils/device-status.utils";

export interface AgentsManagementViewProps {
  role: "super-admin" | "admin";
}

const agentsService = new AgentsService();
const contractorsService = new ContractorsService();

export const AgentsManagementView = ({ role }: AgentsManagementViewProps) => {
  const t = useTranslations("agents");
  const locale = useLocale();

  const canLink = role === "super-admin" || role === "admin";

  const [unlinkedAgents, setUnlinkedAgents] = useState<Agent[]>([]);
  const [search, setSearch] = useState("");
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [agentsError, setAgentsError] = useState<string | null>(null);

  // Borrado de agentes sin vincular
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  /**
   * Un agente sin vincular todavia no tiene contratista, asi que lo unico que
   * lo identifica es su equipo, su clave de activacion o su tipo. Se busca
   * sobre los tres: la clave es lo que le pasan a soporte cuando piden
   * vincular un equipo, y el hostname lo que ve la persona en su maquina.
   */
  const visibleAgents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return unlinkedAgents;
    return unlinkedAgents.filter((agent) =>
      `${agent.hostname ?? ""} ${agent.activation_key ?? ""} ${agent.type}`
        .toLowerCase()
        .includes(term),
    );
  }, [unlinkedAgents, search]);

  /**
   * El backend solo permite borrar agentes SIN vincular y sin sesiones; si
   * rechaza, se muestra su mensaje en vez de uno genérico, porque distingue
   * entre "esta vinculado" y "tiene historial".
   */
  const handleDelete = async () => {
    if (!agentToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await agentsService.remove(agentToDelete.id);
      setUnlinkedAgents((prev) => prev.filter((a) => a.id !== agentToDelete.id));
      setAgentToDelete(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : t("delete.errorMessage"));
    } finally {
      setDeleting(false);
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
        key: "device_status",
        title: t("table.connectivity"),
        dataPath: "device_status",
        type: "text",
        minWidth: "160px",
        render: (_value, row) => {
          const status = resolveDeviceStatus(row);
          const display = getDeviceStatusDisplay(status, locale);
          const lastSeen = formatLastHeartbeat(row.last_heartbeat, locale);
          return (
            <div className="flex flex-col gap-0.5">
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium w-fit"
                style={{ background: display.background, color: display.color }}
              >
                {display.label}
              </span>
              {lastSeen && (
                <span className="text-[10px]" style={{ color: "#6B7280" }}>
                  {lastSeen}
                </span>
              )}
            </div>
          );
        },
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
            <div className="flex items-center justify-center gap-2">
              <Button size="sm" variant="outline" onClick={() => openLinkModal(row)}>
                {t("link.button")}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setAgentToDelete(row);
                }}
                title={t("delete.button")}
                aria-label={t("delete.button")}
                className="p-1.5 rounded-md transition-colors cursor-pointer hover:bg-[#FEE2E2]"
                style={{ color: "#DC2626" }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : null,
      },
    ],
    rowKey: "id",
    striped: true,
    evenRowColor: "#E2E2E2",
    oddRowColor: "#FFFFFF",
    emptyState: {
      // Distingue "no hay agentes sin vincular" de "la busqueda no encontro".
      message: search.trim() ? t("search.noResults", { term: search.trim() }) : t("noAgents"),
      icon: <Bot className="w-8 h-8" />,
    },
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

  const contractorSelectOptions = contractors.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#08252A" }}>
        {t("title")}
      </h1>

      <div className="mb-4 max-w-[420px]">
        <ContractorSearch
          value={search}
          onChange={setSearch}
          label={t("search.label")}
          placeholder={t("search.placeholder")}
          aria-label={t("search.label")}
        />
      </div>

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
      <DataTable config={agentsTableConfig} data={visibleAgents} loading={loadingAgents} />

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

          <SearchableSelect
            label={t("link.selectContractor")}
            placeholder={t("link.selectContractorPlaceholder")}
            options={contractorSelectOptions}
            value={selectedContractorId}
            onValueChange={setSelectedContractorId}
            emptyFilterMessage={t("link.noContractorsMatch")}
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

      {/* Confirmacion de borrado: la operacion es irreversible, asi que no se
          dispara directo desde el icono. */}
      <Modal
        isOpen={agentToDelete !== null}
        onClose={() => !deleting && setAgentToDelete(null)}
        title={t("delete.title")}
        size="sm"
      >
        <div className="space-y-4 p-1">
          <p className="text-sm" style={{ color: "#334155" }}>
            {t("delete.description", {
              hostname: agentToDelete?.hostname ?? t("delete.unknownHostname"),
            })}
          </p>

          {deleteError && (
            <div
              className="px-3 py-2 rounded-lg text-sm"
              style={{ background: "#FEE2E2", color: "#991B1B", border: "1px solid #FECACA" }}
            >
              {deleteError}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAgentToDelete(null)}
              disabled={deleting}
            >
              {t("delete.cancel")}
            </Button>
            <Button
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              loading={deleting}
              style={{ background: "#DC2626", borderColor: "#DC2626" }}
            >
              {t("delete.confirm")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
