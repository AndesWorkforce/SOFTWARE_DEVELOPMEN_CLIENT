"use client";
import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { PackageSearch, X, Trash2, Plus } from "lucide-react";

import { Button, DataTable, Modal, Input, Select } from "../../design-system";
import type { DataTableConfig } from "../../design-system";
import { ApplicationsService } from "../../api/applications/applications.service";
import type { Application, AppType } from "../../types/applications.types";

export interface AppManagementViewProps {
  role: "super-admin" | "admin";
}

const applicationsService = new ApplicationsService();

const APP_TYPES: AppType[] = [
  "Code",
  "Web",
  "Design",
  "Chat",
  "Office",
  "Productivity",
  "Development",
  "Database",
  "Cloud",
  "Entertainment",
  "System",
];

export const AppManagementView = ({ role }: AppManagementViewProps) => {
  const t = useTranslations("appManagement");

  const canManage = role === "super-admin" || role === "admin";

  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Create modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newWeight, setNewWeight] = useState("0.5");

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [appToDelete, setAppToDelete] = useState<Application | null>(null);

  const loadApps = useCallback(() => {
    setLoading(true);
    applicationsService
      .getAll()
      .then(setApps)
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
  }, []);

  const resetCreateForm = useCallback(() => {
    setNewName("");
    setNewType("");
    setNewCategory("");
    setNewWeight("0.5");
  }, []);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    clearMessages();
    setCreating(true);
    try {
      const payload: { name: string; type?: AppType; category?: string; weight?: number } = {
        name: newName.trim(),
      };
      if (newType) payload.type = newType as AppType;
      if (newCategory.trim()) payload.category = newCategory.trim();
      const weight = parseFloat(newWeight);
      if (!isNaN(weight)) payload.weight = weight;

      await applicationsService.create(payload);
      loadApps();
      resetCreateForm();
      setIsCreateOpen(false);
      setSuccessMessage(t("createSuccess"));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : t("createError"));
    } finally {
      setCreating(false);
    }
  }, [newName, newType, newCategory, newWeight, clearMessages, loadApps, resetCreateForm, t]);

  const openDeleteModal = useCallback((app: Application) => {
    setAppToDelete(app);
    setIsDeleteOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!appToDelete) return;
    clearMessages();
    setDeleting(true);
    try {
      await applicationsService.delete(appToDelete.id);
      setApps((prev) => prev.filter((a) => a.id !== appToDelete.id));
      setIsDeleteOpen(false);
      setAppToDelete(null);
      setSuccessMessage(t("deleteSuccess"));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : t("deleteError"));
    } finally {
      setDeleting(false);
    }
  }, [appToDelete, clearMessages, t]);

  const filteredApps = apps.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()),
  );

  const typeOptions = [
    { value: "", label: t("form.typePlaceholder") },
    ...APP_TYPES.map((at) => ({ value: at, label: at })),
  ];

  const tableConfig: DataTableConfig<Application> = {
    columns: [
      {
        key: "name",
        title: t("table.name"),
        dataPath: "name",
        type: "text",
        minWidth: "250px",
      },
      {
        key: "type",
        title: t("table.type"),
        dataPath: "type",
        type: "badge",
        minWidth: "120px",
      },
      {
        key: "category",
        title: t("table.category"),
        dataPath: "category",
        type: "text",
        minWidth: "130px",
      },
      {
        key: "weight",
        title: t("table.weight"),
        dataPath: "weight",
        type: "number",
        minWidth: "80px",
        align: "right",
      },
      {
        key: "created_at",
        title: t("table.createdAt"),
        dataPath: "created_at",
        type: "date",
        minWidth: "120px",
      },
      {
        key: "delete",
        title: "",
        dataPath: "id",
        type: "custom",
        minWidth: "48px",
        align: "center",
        render: (_value, row) =>
          canManage ? (
            <button
              onClick={() => openDeleteModal(row)}
              className="text-red-400 hover:text-red-600 transition-colors"
              title={t("deleteApp")}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : null,
      },
    ],
    rowKey: "id",
    striped: true,
    evenRowColor: "#E2E2E2",
    oddRowColor: "#FFFFFF",
    emptyState: { message: t("noApps"), icon: <PackageSearch className="w-8 h-8" /> },
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
        { key: "name", label: t("table.name"), dataPath: "name" },
        { key: "type", label: t("table.type"), dataPath: "type" },
      ],
      expandedFields: [
        { key: "category", label: t("table.category"), dataPath: "category" },
        { key: "weight", label: t("table.weight"), dataPath: "weight" },
        {
          key: "delete",
          label: "",
          dataPath: "id",
          render: (_value, row) => (
            <Button size="sm" variant="outline" onClick={() => openDeleteModal(row as Application)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          ),
        },
      ],
      expandable: true,
    },
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#08252A" }}>
            {t("title")}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
            {t("subtitle")}
          </p>
        </div>
        {canManage && (
          <Button
            size="sm"
            onClick={() => {
              clearMessages();
              resetCreateForm();
              setIsCreateOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            {t("addApp")}
          </Button>
        )}
      </div>

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

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("searchApp")}
        className="w-full px-3 py-2 rounded-lg text-sm mb-4 outline-none"
        style={{ border: "1px solid #D1D5DB", color: "#374151", background: "#FFFFFF" }}
      />

      <DataTable config={tableConfig} data={filteredApps} loading={loading} />

      {/* Create App Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => !creating && setIsCreateOpen(false)}
        title={t("createTitle")}
        size="sm"
      >
        <div className="space-y-4 p-1">
          <Input
            label={t("form.name")}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t("form.namePlaceholder")}
            required
          />

          <Select
            label={t("form.type")}
            options={typeOptions}
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          />

          <Input
            label={t("form.category")}
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder={t("form.categoryPlaceholder")}
          />

          <Input
            label={t("form.weight")}
            type="number"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            placeholder="0.5"
          />

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
              disabled={creating}
            >
              {t("form.cancel")}
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={!newName.trim() || creating}
              loading={creating}
            >
              {t("form.create")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => !deleting && setIsDeleteOpen(false)}
        title={t("deleteTitle")}
        size="sm"
      >
        <div className="space-y-4 p-1">
          <p className="text-sm" style={{ color: "#374151" }}>
            {t("deleteConfirm")} <strong className="font-mono">{appToDelete?.name}</strong>?
          </p>
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
              disabled={deleting}
            >
              {t("form.cancel")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              disabled={deleting}
              loading={deleting}
            >
              {t("form.delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
