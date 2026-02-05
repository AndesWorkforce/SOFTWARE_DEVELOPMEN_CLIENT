"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ListFilter, Search } from "lucide-react";
import { Button, DateRangePicker, Input, Select } from "@/packages/design-system";
import type {
  FilterConfig,
  FilterPanelProps,
  FilterValues,
  SelectOption,
} from "../../types/FilterPanel.types";

const DEFAULT_PANEL_STYLES = {
  background: "#FFFFFF",
  color: "#000000",
  border: "1px solid rgba(166,166,166,0.5)",
  boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
};

function getDefaultValues(filters: FilterConfig[]): FilterValues {
  return filters.reduce<FilterValues>((acc, filter) => {
    if (filter.defaultValue !== undefined) {
      acc[filter.key] = filter.defaultValue;
    }
    return acc;
  }, {});
}

export function FilterPanel({
  config,
  initialValues = {},
  onChange,
  onClear,
  loading = false,
  className = "",
}: FilterPanelProps) {
  const t = useTranslations();
  const defaults = useMemo(() => getDefaultValues(config.filters), [config.filters]);
  const [filterValues, setFilterValues] = useState<FilterValues>({ ...defaults, ...initialValues });
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, SelectOption[]>>({});
  const isSyncingRef = useRef(false);
  const isInitialMountRef = useRef(true);
  const previousInitialValuesRef = useRef<FilterValues>(initialValues);
  const [nameDraft, setNameDraft] = useState<string>(() => (initialValues.name as string) ?? "");

  // Sincronizar valores cuando cambian defaults o initialValues
  useEffect(() => {
    // Comparar si initialValues realmente cambió
    const initialValuesChanged =
      JSON.stringify(previousInitialValuesRef.current) !== JSON.stringify(initialValues);

    if (initialValuesChanged) {
      isSyncingRef.current = true;
      previousInitialValuesRef.current = initialValues;
      const merged = { ...defaults, ...initialValues };
      // Usar setTimeout para evitar setState síncrono en effect
      setTimeout(() => {
        setFilterValues(merged);
        // sincronizar draft del nombre
        setNameDraft((merged.name as string) ?? "");
        // Resetear la bandera en el siguiente tick
        queueMicrotask(() => {
          isSyncingRef.current = false;
        });
      }, 0);
    }
  }, [defaults, initialValues]);

  // Notificar cambios cuando filterValues cambia (después del render)
  // Solo notificar si el cambio viene de una interacción del usuario, no de sincronización externa
  useEffect(() => {
    // Ignorar la primera renderización y las sincronizaciones externas
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    if (!isSyncingRef.current && onChange) {
      onChange(filterValues);
    }
  }, [filterValues, onChange]);

  // Cargar opciones dinámicas (async)
  useEffect(() => {
    const loadDynamicOptions = async () => {
      const promises = config.filters
        .filter((f) => f.getOptions)
        .map(async (filter) => {
          const options = await filter.getOptions!();
          return { key: filter.key, options };
        });

      if (promises.length === 0) return;

      try {
        const results = await Promise.all(promises);
        const optionsMap: Record<string, SelectOption[]> = {};
        results.forEach(({ key, options }) => {
          optionsMap[key] = options;
        });
        setDynamicOptions(optionsMap);
      } catch (error) {
        console.error("Error cargando opciones dinámicas de filtros", error);
      }
    };

    loadDynamicOptions();
  }, [config.filters]);

  // Limpiar valores de filtros dependientes cuando cambia el filtro padre
  useEffect(() => {
    const dependentFilters = config.filters.filter((f) => f.dependsOn);

    if (dependentFilters.length === 0) return;

    // Usar queueMicrotask para diferir la actualización y evitar setState síncrono
    queueMicrotask(() => {
      setFilterValues((prev) => {
        const updated = { ...prev };
        let hasChanges = false;

        dependentFilters.forEach((filter) => {
          const parentKey = filter.dependsOn!;
          const parentValue = prev[parentKey];
          const parentValueString = typeof parentValue === "string" ? parentValue : "";
          const currentValue = prev[filter.key];
          const currentValueString = typeof currentValue === "string" ? currentValue : "";

          // Si el padre no tiene valor o cambió, limpiar el filtro dependiente
          if (!parentValueString || parentValueString === "") {
            if (currentValueString && currentValueString !== "") {
              updated[filter.key] = undefined;
              hasChanges = true;
            }
          } else {
            // El padre tiene valor, verificar si el valor actual del dependiente sigue siendo válido
            const allOptions = dynamicOptions[filter.key] ?? filter.options ?? [];
            const filteredOptions = allOptions.filter(
              (opt) => !opt.parentValue || opt.parentValue === parentValueString,
            );

            if (
              currentValueString &&
              !filteredOptions.some((opt) => opt.value === currentValueString)
            ) {
              updated[filter.key] = undefined;
              hasChanges = true;
            }
          }
        });

        return hasChanges ? updated : prev;
      });
    });
  }, [config.filters, filterValues, dynamicOptions]);

  const handleFilterChange = (
    key: string,
    value: string | string[] | { start: string; end: string } | undefined,
  ) => {
    setFilterValues((prev) => {
      const newValues = { ...prev, [key]: value };

      // Limpiar valores de filtros dependientes cuando cambia el filtro padre
      config.filters.forEach((filter) => {
        if (filter.dependsOn === key) {
          // Si el filtro padre cambió, siempre limpiar el filtro dependiente
          const dependencyValue = typeof value === "string" ? value : undefined;
          if (!dependencyValue || dependencyValue === "") {
            newValues[filter.key] = undefined;
          } else {
            // El padre cambió a un nuevo valor, limpiar el dependiente
            // El usuario deberá seleccionar un nuevo valor del dependiente basado en el nuevo padre
            newValues[filter.key] = undefined;
          }
        }
      });

      return newValues;
    });
  };

  const handleClear = () => {
    const clearedValues = { ...defaults };
    setFilterValues(clearedValues);
    onClear?.();
  };

  const renderFilter = (filterConfig: FilterConfig) => {
    const label = filterConfig.translationKey ? t(filterConfig.translationKey) : filterConfig.label;
    const currentValue = filterValues[filterConfig.key];

    switch (filterConfig.type) {
      case "dateRange": {
        const value = (currentValue as { start: string; end: string }) || { start: "", end: "" };
        return (
          <DateRangePicker
            label={label}
            startDate={value.start}
            endDate={value.end}
            onStartDateChange={(start) =>
              handleFilterChange(filterConfig.key, { ...value, start: start || "" })
            }
            onEndDateChange={(end) =>
              handleFilterChange(filterConfig.key, { ...value, end: end || "" })
            }
            className="min-w-[220px]"
            minDate={filterConfig.minDate}
            maxDate={filterConfig.maxDate}
            startDateMax={value.end || filterConfig.maxDate}
            endDateMin={value.start || filterConfig.minDate}
          />
        );
      }
      case "select":
      case "multiselect": {
        // Determinar si el filtro depende de otro
        const dependsOnKey = filterConfig.dependsOn;
        const parentValue = dependsOnKey
          ? (filterValues[dependsOnKey] as string | undefined)
          : undefined;

        // Obtener todas las opciones (dinámicas o estáticas)
        const allOptions = dynamicOptions[filterConfig.key] ?? filterConfig.options ?? [];

        // Filtrar opciones basándose en el valor del padre si el filtro tiene dependencia
        let options: SelectOption[];
        if (dependsOnKey) {
          if (!parentValue || parentValue === "") {
            // Si no hay valor en el padre, mostrar solo opciones sin parentValue (como el placeholder)
            options = allOptions.filter((opt) => !opt.parentValue);
          } else {
            // Filtrar opciones que pertenecen al padre seleccionado
            // (opciones sin parentValue se muestran siempre, como el placeholder)
            options = allOptions.filter(
              (opt) => !opt.parentValue || opt.parentValue === parentValue,
            );
          }
        } else {
          options = allOptions;
        }

        const value = (currentValue as string | string[] | undefined) ?? "";

        // Determinar si el filtro debe estar deshabilitado
        const isDisabled = Boolean(
          filterConfig.disabled ||
            loading ||
            (dependsOnKey && (!parentValue || parentValue === "")),
        );

        return (
          <div className="flex flex-col gap-[5px]">
            <div className="flex items-center gap-2">
              {filterConfig.icon && <div className="text-black shrink-0">{filterConfig.icon}</div>}
              <p className="text-[14px] md:text-[16px] font-medium md:font-semibold text-black">
                {label}
              </p>
            </div>
            <Select
              value={
                typeof value === "string" ? value : Array.isArray(value) ? value.join(",") : ""
              }
              multiple={filterConfig.type === "multiselect"}
              onChange={(e) => {
                if (filterConfig.type === "multiselect") {
                  const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                  handleFilterChange(filterConfig.key, selected);
                } else {
                  // Mantener el valor como string, incluso si es "" (para el placeholder "Select...")
                  handleFilterChange(filterConfig.key, e.target.value);
                }
              }}
              options={options}
              disabled={isDisabled}
              className="text-[12px] md:text-[16px]"
            />
          </div>
        );
      }
      case "number":
      case "text":
      default: {
        // Campo de búsqueda de usuario con diseño especial (como en Figma)
        if (filterConfig.key === "name" && filterConfig.type === "text") {
          return (
            <div className="flex flex-col gap-[5px]">
              <p className="text-[14px] md:text-[16px] font-medium md:font-semibold text-black">
                {label}
              </p>
              <div className="flex h-[35px] md:h-[40px] items-center justify-end rounded-[5px] border border-[rgba(166,166,166,0.5)] bg-white shadow-[0px_4px_4px_rgba(166,166,166,0.25)] px-px gap-[10px]">
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleFilterChange(filterConfig.key, nameDraft);
                    }
                  }}
                  onBlur={() => {
                    // aplicar filtro al salir del input
                    if (nameDraft !== (filterValues.name as string)) {
                      handleFilterChange(filterConfig.key, nameDraft);
                    }
                  }}
                  placeholder={filterConfig.placeholder}
                  className="flex-1 min-w-0 h-[33px] md:h-[38px] border-0 bg-transparent px-[12px] text-[12px] md:text-[16px] text-[#08252A] placeholder:text-[#B6B4B4] outline-none"
                  disabled={filterConfig.disabled || loading}
                />
                <div className="bg-white flex h-[33px] w-[40px] items-center justify-center px-[8px] py-[4px] rounded-tr-[5px] rounded-br-[5px]">
                  <Search className="w-4 h-4 md:w-6 md:h-6 text-[#000000]" />
                </div>
              </div>
            </div>
          );
        }

        return (
          <Input
            type={filterConfig.type === "number" ? "number" : "text"}
            label={label}
            placeholder={filterConfig.placeholder}
            value={(currentValue as string) ?? ""}
            onChange={(e) => handleFilterChange(filterConfig.key, e.target.value)}
            required={filterConfig.required}
            disabled={filterConfig.disabled || loading}
          />
        );
      }
    }
  };

  const renderFilters = () => {
    const filtersContent = config.filters.map((filter) => (
      <div key={filter.key} style={{ minWidth: filter.minWidth }} className="w-full md:w-auto">
        {renderFilter(filter)}
      </div>
    ));

    if (config.layout === "grid") {
      const cols = config.gridColumns || 3;
      return (
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            ...config.styles?.filterRow,
          }}
        >
          {filtersContent}
          {config.showClearButton && config.clearButtonPosition === "end" && (
            <div className="flex items-end justify-end">
              <Button
                variant="danger"
                onClick={handleClear}
                disabled={loading}
                className="cursor-pointer"
                style={{
                  background: "#FF0004",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  fontWeight: 600,
                  padding: "9px 16px",
                  height: "35px",
                  borderRadius: "5px",
                }}
              >
                {config.clearButtonLabel || t("reports.cleanFilters")}
              </Button>
            </div>
          )}
        </div>
      );
    }

    // Layout mobile específico para contractors (según diseño Figma)
    // Row 1: User (ancho completo)
    // Row 2: Country y Client (cada uno 180px, gap 12px)
    // Row 3: Team (180px) y Clean Filters (180px, gap 12px)
    const nameFilter = config.filters.find((f) => f.key === "name");
    const countryFilter = config.filters.find((f) => f.key === "country");
    const clientFilter = config.filters.find((f) => f.key === "clientId");
    const teamFilter = config.filters.find((f) => f.key === "teamId");
    const jobPositionFilter = config.filters.find((f) => f.key === "jobPosition");
    const otherFilters = config.filters.filter(
      (f) => !["name", "country", "clientId", "teamId", "jobPosition"].includes(f.key),
    );

    // Si tiene los filtros específicos de contractors, usar layout mobile especial
    const isContractorsLayout =
      nameFilter && countryFilter && clientFilter && teamFilter && jobPositionFilter;

    if (isContractorsLayout) {
      return (
        <>
          {/* Layout mobile (visible solo en pantallas pequeñas) */}
          <div className="flex flex-col gap-[12px] md:hidden">
            {/* Row 1: User y Country */}
            <div className="flex gap-[12px] w-full min-w-0">
              {nameFilter && <div className="flex-1 min-w-0">{renderFilter(nameFilter)}</div>}
              {countryFilter && <div className="flex-1 min-w-0">{renderFilter(countryFilter)}</div>}
            </div>

            {/* Row 2: Client y Team */}
            <div className="flex gap-[12px] w-full min-w-0">
              {clientFilter && <div className="flex-1 min-w-0">{renderFilter(clientFilter)}</div>}
              {teamFilter && <div className="flex-1 min-w-0">{renderFilter(teamFilter)}</div>}
            </div>

            {/* Row 3: Job Position y Clean Filters */}
            <div className="flex gap-[12px] items-end w-full min-w-0">
              {jobPositionFilter && (
                <div className="flex-1 min-w-0">{renderFilter(jobPositionFilter)}</div>
              )}
              {config.showClearButton && config.clearButtonPosition === "end" && (
                <div className="flex-1 min-w-0">
                  <Button
                    variant="danger"
                    onClick={handleClear}
                    disabled={loading}
                    className="cursor-pointer"
                    style={{
                      background: "#FF0004",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "9px 16px",
                      height: "35px",
                      borderRadius: "5px",
                      width: "100%",
                      boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
                    }}
                  >
                    {config.clearButtonLabel || t("reports.cleanFilters")}
                  </Button>
                </div>
              )}
            </div>

            {/* Otros filtros adicionales */}
            {otherFilters.length > 0 && (
              <div className="flex flex-col gap-[12px]">
                {otherFilters.map((filter) => (
                  <div key={filter.key} className="w-full">
                    {renderFilter(filter)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Layout desktop (visible solo en pantallas grandes) */}
          <div
            className="hidden md:flex flex-row items-end gap-3 flex-wrap"
            style={config.styles?.filterRow}
          >
            {filtersContent}
            {config.showClearButton && config.clearButtonPosition === "end" && (
              <div className="flex md:flex-1 md:justify-end">
                <div className="h-full flex items-end w-full md:w-auto">
                  <Button
                    variant="danger"
                    onClick={handleClear}
                    disabled={loading}
                    className="cursor-pointer"
                    style={{
                      background: "#FF0004",
                      color: "#FFFFFF",
                      fontSize: "15px",
                      fontWeight: 600,
                      padding: "8px 24px",
                      height: "40px",
                      borderRadius: "5px",
                    }}
                  >
                    {config.clearButtonLabel || t("reports.cleanFilters")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      );
    }

    // Layout mobile específico para clients (según Figma 723-13666)
    // Row 1: User (ancho completo)
    // Row 2: Team + Clean filters (dos columnas, gap 12px)
    const isClientsLayout = nameFilter && teamFilter && !countryFilter && !clientFilter;

    if (isClientsLayout) {
      return (
        <>
          {/* Layout mobile */}
          <div className="flex flex-col gap-[12px] md:hidden">
            {nameFilter && <div className="w-full">{renderFilter(nameFilter)}</div>}

            <div className="flex gap-[12px] items-end w-full min-w-0">
              {teamFilter && <div className="flex-1 min-w-0">{renderFilter(teamFilter)}</div>}
              {config.showClearButton && config.clearButtonPosition === "end" && (
                <div className="flex-1 min-w-0">
                  <Button
                    variant="danger"
                    onClick={handleClear}
                    disabled={loading}
                    className="cursor-pointer"
                    style={{
                      background: "#FF0004",
                      color: "#FFFFFF",
                      fontSize: "15px",
                      fontWeight: 600,
                      padding: "9px 16px",
                      height: "35px",
                      borderRadius: "5px",
                      width: "100%",
                      boxShadow: "0px 4px 4px rgba(166,166,166,0.25)",
                    }}
                  >
                    {config.clearButtonLabel || t("reports.cleanFilters")}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Layout desktop */}
          <div
            className="hidden md:flex flex-row items-end gap-3 flex-wrap"
            style={config.styles?.filterRow}
          >
            {filtersContent}
            {config.showClearButton && config.clearButtonPosition === "end" && (
              <div className="flex md:flex-1 md:justify-end">
                <div className="h-full flex items-end w-full md:w-auto">
                  <Button
                    variant="danger"
                    onClick={handleClear}
                    disabled={loading}
                    className="cursor-pointer"
                    style={{
                      background: "#FF0004",
                      color: "#FFFFFF",
                      fontSize: "15px",
                      fontWeight: 600,
                      padding: "8px 24px",
                      height: "40px",
                      borderRadius: "5px",
                    }}
                  >
                    {config.clearButtonLabel || t("reports.cleanFilters")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      );
    }

    // Layout row por defecto (desktop y otros casos)
    return (
      <div
        className="flex flex-col md:flex-row items-stretch md:items-end gap-3 flex-wrap"
        style={config.styles?.filterRow}
      >
        {filtersContent}
        {config.showClearButton && config.clearButtonPosition === "end" && (
          <div className="flex md:flex-1 md:justify-end">
            <div className="h-full flex items-end w-full md:w-auto">
              <Button
                variant="danger"
                onClick={handleClear}
                disabled={loading}
                className="cursor-pointer"
                style={{
                  background: "#FF0004",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  fontWeight: 600,
                  padding: "8px 24px",
                  height: "40px",
                  borderRadius: "5px",
                }}
              >
                {config.clearButtonLabel || t("reports.cleanFilters")}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`mb-6 md:mb-8 rounded-[10px] px-[25px] py-[31px] md:p-6 ${className}`}
      style={{ ...DEFAULT_PANEL_STYLES, ...config.styles?.panel }}
    >
      <div className="flex items-center gap-2 mb-4 md:mb-4">
        <ListFilter className="w-4 h-4 md:w-5 md:h-5" />
        <span
          className="text-[14px] md:text-[16px] font-semibold"
          style={{ color: "#000000", ...config.styles?.title }}
        >
          {t("reports.applyFilters")}
        </span>
      </div>

      {renderFilters()}

      {config.showClearButton && config.clearButtonPosition === "separate-row" && (
        <div className="flex justify-end mt-4">
          <Button
            variant="danger"
            onClick={handleClear}
            disabled={loading}
            className="cursor-pointer"
            style={{
              background: "#FF0004",
              color: "#FFFFFF",
              fontSize: "15px",
              fontWeight: 600,
              padding: "8px 24px",
              height: "40px",
              borderRadius: "5px",
            }}
          >
            {config.clearButtonLabel || t("reports.cleanFilters")}
          </Button>
        </div>
      )}
    </div>
  );
}
