"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button, DataTable } from "@/packages/design-system";
import { jobPositionsService } from "@/packages/api/job-positions/job-positions.service";
import type { JobPosition } from "@/packages/types/job-positions.types";
import type { DataTableConfig } from "@/packages/types/DataTable.types";

export default function JobPositionsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);

  const handleEdit = useCallback(
    (position: JobPosition) => {
      router.push(`/${locale}/app/super-admin/job-positions/edit/${position.id}`);
    },
    [locale, router],
  );

  const handleDelete = useCallback(
    (position: JobPosition) => {
      router.push(`/${locale}/app/super-admin/job-positions/delete/${position.id}`);
    },
    [locale, router],
  );

  const tableConfig = useMemo(() => {
    const config: DataTableConfig<JobPosition> = {
      columns: [
        {
          key: "name",
          title: "Name",
          translationKey: "jobPositions.table.name",
          dataPath: "name",
          type: "text",
          minWidth: "250px",
          align: "center",
        },
        {
          key: "description",
          title: "Description",
          translationKey: "jobPositions.table.description",
          dataPath: (row) => row.description || "—",
          type: "text",
          minWidth: "350px",
          align: "center",
        },
        {
          key: "actions",
          title: "Action",
          translationKey: "jobPositions.table.action",
          dataPath: "id",
          type: "custom",
          minWidth: "150px",
          align: "left",
          render: (_value: unknown, row: JobPosition) => (
            <div className="w-full flex justify-center">
              <div className="flex flex-col gap-1 items-start">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(row);
                  }}
                  className="inline-flex items-center gap-1 text-[#0097B2] hover:underline cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="text-sm">{t("jobPositions.table.edit")}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(row);
                  }}
                  className="inline-flex items-center gap-1 text-[#FF0004] hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="text-sm">{t("jobPositions.table.delete")}</span>
                </button>
              </div>
            </div>
          ),
        },
      ],
      rowKey: "id",
      striped: true,
      evenRowColor: "#E2E2E2",
      oddRowColor: "#FFFFFF",
      emptyState: {
        message: t("jobPositions.noJobPositions"),
      },
      styles: {
        table: {
          border: "1px solid rgba(166,166,166,0.5)",
          boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
          borderRadius: "10px",
        },
        cell: {
          paddingTop: "4px",
          paddingBottom: "4px",
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
            label: t("jobPositions.table.name"),
            dataPath: (row) => row.name,
          },
        ],
        expandedFields: [
          {
            key: "description",
            label: t("jobPositions.table.description"),
            dataPath: (row) => row.description || "—",
          },
          {
            key: "actions",
            label: t("jobPositions.table.action"),
            dataPath: "id",
            render: (_value: unknown, row: JobPosition) => (
              <span className="inline-flex flex-row items-center gap-4 flex-wrap">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(row);
                  }}
                  className="inline-flex items-center gap-1 text-[#0097B2] hover:underline text-sm cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>{t("jobPositions.table.edit")}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(row);
                  }}
                  className="inline-flex items-center gap-1 text-[#FF0004] hover:underline text-sm cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t("jobPositions.table.delete")}</span>
                </button>
              </span>
            ),
          },
        ],
        expandable: true,
      },
    };
    return config;
  }, [t, handleEdit, handleDelete]);

  const loadJobPositions = () => {
    try {
      setLoading(true);
      const data = jobPositionsService.getAll();
      setJobPositions(data);
    } catch (error) {
      console.error("Error loading job positions:", error);
      setJobPositions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobPositions();
  }, []);

  useEffect(() => {
    const basePath = `/${locale}/app/super-admin/job-positions`;
    if (pathname === basePath) {
      loadJobPositions();
    }
  }, [pathname, locale]);

  return (
    <div className="p-4 md:p-8 min-h-screen" style={{ background: "#FFFFFF" }}>
      <div className="max-w-full">
        <div className="mb-6 md:mb-8 flex items-center justify-between">
          <h1 className="text-xl md:text-3xl font-bold" style={{ color: "#000000" }}>
            {t("jobPositions.title")}
          </h1>
          <Link href={`/${locale}/app/super-admin/job-positions/add`}>
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
                cursor: "pointer",
              }}
              className="md:text-[16px] h-[35px] md:h-[40px]"
            >
              <Plus className="w-[14px] h-[14px] md:w-5 md:h-5" />
              <span className="font-semibold">{t("jobPositions.addJobPosition")}</span>
            </Button>
          </Link>
        </div>

        <DataTable config={tableConfig} data={jobPositions} loading={loading} />
      </div>
    </div>
  );
}
