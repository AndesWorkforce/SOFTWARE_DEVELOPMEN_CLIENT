"use client";

import { useMemo, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ColumnConfig, DataTableProps, MobileCardConfig } from "../../types/DataTable.types";

function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  let current: unknown = obj;
  for (const key of path.split(".")) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

function formatDate(value: unknown, dateFormat?: string) {
  if (!value) return "";
  if (typeof value !== "string" && typeof value !== "number" && !(value instanceof Date)) return "";
  const date = new Date(value);
  const locale = "default";
  if (dateFormat === "time") {
    return date.toLocaleTimeString(locale);
  }
  if (dateFormat === "datetime") {
    return date.toLocaleString(locale);
  }
  return date.toLocaleDateString(locale);
}

function formatCurrency(value: number, currency?: { symbol?: string; locale?: string }) {
  const locale = currency?.locale || "en-US";
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    currencyDisplay: "symbol",
  });
  if (currency?.symbol) {
    return `${currency.symbol}${value.toFixed(2)}`;
  }
  return formatter.format(value);
}

function getPercentageColor(
  value: number,
  thresholds: Array<{ value: number; color: string }>,
  defaultColor?: string,
) {
  if (thresholds.length === 0) return defaultColor || "#000000";
  const sorted = [...thresholds].sort((a, b) => b.value - a.value);
  const found = sorted.find((t) => value >= t.value);
  return found?.color || defaultColor || "#000000";
}

export function DataTable<T = Record<string, unknown>>({
  config,
  data,
  title,
  className = "",
  onRowClick,
  loading,
}: DataTableProps<T>) {
  const t = useTranslations();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(config.pagination?.pageSize || 10);

  const effectiveLoading = loading ?? config.loading;
  const visibleColumns = useMemo(
    () => config.columns.filter((col) => !col.hidden),
    [config.columns],
  );

  const getValue = useCallback((row: T, dataPath: string | ((row: T) => unknown)): unknown => {
    if (typeof dataPath === "function") {
      return dataPath(row);
    }
    return getNestedValue(row, dataPath);
  }, []);

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;
    const column = visibleColumns.find((col) => col.key === sortColumn);
    if (!column) return data;
    const sorted = [...data].sort((a, b) => {
      const aVal = getValue(a, column.dataPath);
      const bVal = getValue(b, column.dataPath);
      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return sorted;
  }, [data, sortColumn, sortDirection, visibleColumns, getValue]);

  const paginatedData = useMemo(() => {
    if (!config.pagination?.enabled) return sortedData;
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, config.pagination?.enabled, page, pageSize]);

  const totalPages = useMemo(() => {
    if (!config.pagination?.enabled) return 1;
    return Math.max(1, Math.ceil(sortedData.length / pageSize));
  }, [sortedData.length, config.pagination?.enabled, pageSize]);

  const renderPercentage = (value: number, column: ColumnConfig<T>) => {
    const thresholds = column.config?.percentage?.thresholds || [{ value: 50, color: "#2EC36D" }];
    const defaultColor = column.config?.percentage?.defaultColor;
    const color = getPercentageColor(value, thresholds, defaultColor);
    return (
      <span
        style={{
          color,
          fontWeight: 700,
        }}
      >
        {value}%
      </span>
    );
  };

  const renderCell = (column: ColumnConfig<T>, row: T, index: number): React.ReactNode => {
    const value = getValue(row, column.dataPath);

    if (column.render) {
      const rendered = column.render(value, row, index);
      return rendered ?? "";
    }

    switch (column.type) {
      case "text":
        return String(value ?? "");
      case "number":
        return typeof value === "number" ? value.toLocaleString() : String(value ?? "");
      case "percentage":
        return typeof value === "number" ? renderPercentage(value, column) : String(value ?? "");
      case "date":
        return formatDate(value, "date");
      case "datetime":
        return formatDate(value, "datetime");
      case "time":
        return String(value ?? "");
      case "boolean":
        return value ? "Yes" : "No";
      case "currency":
        return typeof value === "number"
          ? formatCurrency(value, column.config?.currency)
          : String(value ?? "");
      case "badge": {
        const valueStr = String(value ?? "");
        const variant = column.config?.badge?.variants?.[valueStr] || {
          color: "#000000",
          bgColor: "#E5E7EB",
        };
        return (
          <span
            className="px-2 py-1 rounded-full text-sm font-semibold"
            style={{ color: variant.color, background: variant.bgColor }}
          >
            {valueStr}
          </span>
        );
      }
      case "link": {
        const valueStr = String(value ?? "");
        const href =
          column.config?.link?.hrefPath && typeof column.config.link.hrefPath === "function"
            ? column.config.link.hrefPath(row)
            : column.config?.link?.hrefPath || valueStr;
        return (
          <a
            href={String(href)}
            target={column.config?.link?.target || "_blank"}
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            {valueStr}
          </a>
        );
      }
      case "action": {
        const action = column.config?.action;
        if (!action) return null;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(row);
            }}
            className="mx-auto inline-flex items-center gap-1 hover:text-blue-600 transition-colors underline"
          >
            {action.icon}
            <span className="text-sm">{action.label}</span>
          </button>
        );
      }
      case "custom":
      default:
        return String(value ?? "");
    }
  };

  const toggleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      const nextDirection = sortDirection === "asc" ? "desc" : "asc";
      setSortDirection(nextDirection);
      config.onSort?.(columnKey, nextDirection);
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
      config.onSort?.(columnKey, "asc");
    }
  };

  const renderDesktopView = () => {
    return (
      <div
        className="hidden md:block rounded-lg shadow-md overflow-hidden"
        style={config.styles?.table}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={config.styles?.header}>
                {visibleColumns.map((column) => {
                  const sortable = column.sortable ?? config.sortable;
                  const isSorted = sortColumn === column.key;
                  return (
                    <th
                      key={column.key}
                      className={`px-6 py-3 text-base font-semibold select-none ${
                        column.align === "left"
                          ? "text-left"
                          : column.align === "right"
                            ? "text-right"
                            : "text-center"
                      }`}
                      style={{
                        color: "#000000",
                        width: column.width,
                        minWidth: column.minWidth,
                        textAlign: column.align || "center",
                        cursor: sortable ? "pointer" : "default",
                      }}
                      onClick={() => sortable && toggleSort(column.key)}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {column.translationKey ? t(column.translationKey) : column.title}
                        {sortable && (
                          <span className="text-xs">
                            {isSorted ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, index) => {
                const rowKey =
                  typeof config.rowKey === "function"
                    ? config.rowKey(row)
                    : ((row as Record<string, unknown>)[config.rowKey || "id"] as string) ||
                      String(index);
                const isEvenRow = config.striped && index % 2 === 1;

                return (
                  <tr
                    key={rowKey}
                    style={{
                      background: isEvenRow
                        ? config.evenRowColor || "#E2E2E2"
                        : config.oddRowColor || "#FFFFFF",
                      ...config.styles?.row,
                    }}
                    onClick={() => onRowClick?.(row)}
                    className={onRowClick ? "cursor-pointer" : ""}
                  >
                    {visibleColumns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-6 py-4 whitespace-nowrap text-base ${
                          column.align === "left"
                            ? "text-left"
                            : column.align === "right"
                              ? "text-right"
                              : "text-center"
                        }`}
                        style={{
                          color: "#000000",
                          width: column.width,
                          minWidth: column.minWidth,
                          textAlign: column.align || "center",
                          ...config.styles?.cell,
                        }}
                      >
                        {renderCell(column, row, index)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderMobileView = () => {
    if (!config.mobileConfig) {
      return null;
    }

    const mobileConfig: MobileCardConfig<T> = config.mobileConfig;

    return (
      <div
        className="md:hidden w-full max-w-full overflow-x-hidden rounded-[10px] overflow-hidden"
        style={config.styles?.mobileCard}
      >
        {paginatedData.map((row, index) => {
          const rowKey =
            typeof config.rowKey === "function"
              ? config.rowKey(row)
              : String((row as Record<string, unknown>)[config.rowKey || "id"] ?? index);

          const isExpanded = expandedRows.has(rowKey);
          const isEvenRow = config.striped && index % 2 === 1;

          const toggleExpand = () => {
            const newExpanded = new Set(expandedRows);
            if (isExpanded) {
              newExpanded.delete(rowKey);
            } else {
              newExpanded.add(rowKey);
            }
            setExpandedRows(newExpanded);
          };

          if (mobileConfig.customCard) {
            return mobileConfig.customCard(row, isExpanded, toggleExpand);
          }

          return (
            <div
              key={rowKey}
              style={{
                background: isEvenRow
                  ? config.evenRowColor || "#E2E2E2"
                  : config.oddRowColor || "#FFFFFF",
              }}
              className="p-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  {mobileConfig.primaryFields.map((field) => (
                    <div key={field.key} className="text-sm">
                      <span className="font-semibold" style={{ color: "#000000" }}>
                        {field.label}:{" "}
                      </span>
                      <span style={{ color: "#000000" }}>
                        {field.render
                          ? field.render(getValue(row, field.dataPath), row)
                          : String(getValue(row, field.dataPath) ?? "")}
                      </span>
                    </div>
                  ))}
                  {isExpanded &&
                    mobileConfig.expandedFields?.map((field) => (
                      <div key={field.key} className="text-sm">
                        <span className="font-semibold" style={{ color: "#000000" }}>
                          {field.label}:{" "}
                        </span>
                        <span style={{ color: "#000000" }}>
                          {field.render
                            ? field.render(getValue(row, field.dataPath), row)
                            : String(getValue(row, field.dataPath) ?? "")}
                        </span>
                      </div>
                    ))}
                </div>
                {mobileConfig.expandable && (
                  <button
                    onClick={toggleExpand}
                    className="ml-2 flex items-center justify-center h-full"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={className}>
      {title && (
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: "#000000" }}>
          {title}
        </h2>
      )}

      {effectiveLoading ? (
        config.loadingComponent || (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )
      ) : data.length === 0 ? (
        <div className="rounded-lg shadow-md p-12 text-center" style={{ background: "#FFFFFF" }}>
          <p style={{ color: "#000000" }}>{config.emptyState?.message || "No data available"}</p>
        </div>
      ) : (
        <>
          {renderDesktopView()}
          {renderMobileView()}

          {config.pagination?.enabled && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4 w-full max-w-full overflow-x-hidden">
              <div className="flex flex-wrap items-center gap-2 w-full max-w-full min-w-0">
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50 shrink-0"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  {t("pagination.previous", { defaultMessage: "Prev" })}
                </button>
                <span className="text-sm min-w-0 break-words" style={{ color: "#000000" }}>
                  {t("pagination.page", { defaultMessage: "Página" })} {page} / {totalPages}
                </span>
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50 shrink-0"
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  {t("pagination.next", { defaultMessage: "Next" })}
                </button>
              </div>

              {config.pagination.showPageSizeSelector && (
                <div className="flex flex-wrap items-center gap-2 w-full max-w-full min-w-0">
                  <span className="text-sm" style={{ color: "#000000" }}>
                    {t("pagination.pageSize", { defaultMessage: "Items por página" })}
                  </span>
                  <select
                    className="border rounded px-2 py-1 max-w-full"
                    value={pageSize}
                    onChange={(e) => {
                      const newSize = Number(e.target.value);
                      setPageSize(newSize);
                      setPage(1);
                    }}
                  >
                    {(config.pagination.pageSizeOptions || [10, 20, 50]).map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
