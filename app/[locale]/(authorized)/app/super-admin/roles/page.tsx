"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button, DataTable } from "@/packages/design-system";
import { usersService } from "@/packages/api/users/users.service";
import type { User } from "@/packages/types/users.types";
import { ROLE_LABELS } from "@/packages/types/users.types";
import type { DataTableConfig } from "@/packages/types/DataTable.types";

export default function RolesPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const handleEdit = useCallback(
    (user: User) => {
      const editPath = `/${locale}/app/super-admin/roles/edit/${user.id}`;
      router.push(editPath);
    },
    [locale, router],
  );

  const handleDelete = useCallback(
    (user: User) => {
      const deletePath = `/${locale}/app/super-admin/roles/delete/${user.id}`;
      router.push(deletePath);
    },
    [locale, router],
  );

  const tableConfig = useMemo(() => {
    const baseTableConfig: DataTableConfig<User> = {
      columns: [
        {
          key: "firstName",
          title: "First Name",
          translationKey: "roles.table.firstName",
          dataPath: "firstName",
          type: "text",
          width: "150px",
          align: "center",
        },
        {
          key: "lastName",
          title: "Last Name",
          translationKey: "roles.table.lastName",
          dataPath: "lastName",
          type: "text",
          width: "150px",
          align: "center",
        },
        {
          key: "email",
          title: "Email",
          translationKey: "roles.table.email",
          dataPath: "email",
          type: "text",
          width: "392px",
          align: "center",
        },
        {
          key: "role",
          title: "Role",
          translationKey: "roles.table.role",
          dataPath: (row) => ROLE_LABELS[row.role] || row.role,
          type: "text",
          width: "200px",
          align: "center",
        },
        {
          key: "actions",
          title: "Action",
          translationKey: "roles.table.action",
          dataPath: "id",
          type: "custom",
          width: "150px",
          align: "left",
          render: (_value: unknown, row: User) => (
            <div className="flex flex-col gap-1 items-start">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(row);
                }}
                className="inline-flex items-center gap-1 text-[#0097B2] hover:underline"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span className="text-sm font-semibold">Edit</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(row);
                }}
                className="inline-flex items-center gap-1 text-[#FF0004] hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="text-sm font-semibold">Delete</span>
              </button>
            </div>
          ),
        },
      ],
      rowKey: "id",
      striped: true,
      evenRowColor: "#E2E2E2",
      oddRowColor: "#FFFFFF",
      emptyState: {
        message: t("roles.noUsers"),
      },
      styles: {
        table: {
          border: "1px solid rgba(166,166,166,0.5)",
          boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
          borderRadius: "10px",
        },
        mobileCard: {
          border: "1px solid rgba(166,166,166,0.5)",
          boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
          borderRadius: "10px",
        },
      },
      mobileConfig: {
        primaryFields: [
          {
            key: "name",
            label: t("roles.table.user"),
            dataPath: (row) => `${row.firstName} ${row.lastName}`,
          },
        ],
        expandedFields: [
          {
            key: "email",
            label: t("roles.table.email"),
            dataPath: (row) => row.email || "",
          },
          {
            key: "role",
            label: t("roles.table.role"),
            dataPath: (row) => ROLE_LABELS[row.role] || row.role,
          },
          {
            key: "actions",
            label: t("roles.table.action"),
            dataPath: "id",
            render: (_value: unknown, row: User) => (
              <span className="inline-flex flex-row items-center gap-4 flex-wrap">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(row);
                  }}
                  className="inline-flex items-center gap-1 text-[#0097B2] hover:underline text-sm"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="font-semibold">Edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(row as User);
                  }}
                  className="inline-flex items-center gap-1 text-[#FF0004] hover:underline text-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="font-semibold">Delete</span>
                </button>
              </span>
            ),
          },
        ],
        expandable: true,
      },
    };
    return baseTableConfig;
  }, [t, handleEdit, handleDelete]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getAll();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  // Recargar usuarios cuando volvemos a la página de roles
  useEffect(() => {
    const basePath = `/${locale}/app/super-admin/roles`;

    // Si estamos en la ruta base de roles
    if (pathname === basePath) {
      loadUsers();
    }
  }, [pathname, locale]);

  return (
    <div className="p-4 md:p-8 min-h-screen" style={{ background: "#FFFFFF" }}>
      <div className="max-w-full">
        <div className="mb-6 md:mb-8 flex items-center justify-between">
          <h1 className="text-xl md:text-3xl font-bold" style={{ color: "#000000" }}>
            {t("roles.title")}
          </h1>
          <Link href={`/${locale}/app/super-admin/roles/add`}>
            <Button
              variant="primary"
              style={{
                background: "#0097B2",
                color: "#FFFFFF",
                fontSize: "14px",
                padding: "7px 21px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                borderRadius: "8px",
                boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
              }}
              className="md:text-[16px] h-[35px] md:h-[40px]"
            >
              <Plus className="w-[14px] h-[14px] md:w-5 md:h-5" />
              <span className="font-semibold">{t("roles.addUser")}</span>
            </Button>
          </Link>
        </div>

        <DataTable config={tableConfig} data={users} loading={loading} />
      </div>
    </div>
  );
}
