"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "./Modal";
import { Input, Select, Button } from "@/packages/design-system";
import type { FormModalProps, FormFieldConfig } from "../../types/FormModal.types";
import type { SelectOption } from "../../types/FilterPanel.types";

export function FormModal({
  config,
  isOpen,
  onClose,
  initialValues = {},
  onSubmit,
  loading = false,
  size = "lg",
  className = "",
  error: externalError,
}: FormModalProps) {
  const t = useTranslations();
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, SelectOption[]>>({});
  const [loadingOptions, setLoadingOptions] = useState<Record<string, boolean>>({});
  const previousDependencyValuesRef = useRef<Record<string, unknown>>({});
  const fieldInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const isInitialMountRef = useRef(true);
  const previousIsOpenRef = useRef(isOpen);
  const configFieldsRef = useRef(config.fields);
  const initialValuesRef = useRef(initialValues);

  // Actualizar refs cuando cambian (pero no causar re-render)
  useEffect(() => {
    configFieldsRef.current = config.fields;
    initialValuesRef.current = initialValues;
  }, [config.fields, initialValues]);

  // Inicializar valores del formulario solo cuando se abre el modal
  useEffect(() => {
    // Solo inicializar cuando el modal cambia de cerrado a abierto
    const wasClosed = !previousIsOpenRef.current;
    if (isOpen && wasClosed) {
      const defaultValues: Record<string, unknown> = {};
      configFieldsRef.current.forEach((field) => {
        defaultValues[field.key] = field.defaultValue ?? initialValuesRef.current[field.key] ?? "";
      });
      setFormValues(defaultValues);
      setErrors({});
      // Resetear referencias cuando se abre el modal
      isInitialMountRef.current = true;
      previousDependencyValuesRef.current = {};
    }
    previousIsOpenRef.current = isOpen;
  }, [isOpen]);

  // Cargar opciones dinámicas
  useEffect(() => {
    if (!isOpen) return;

    const loadDynamicOptions = async () => {
      const promises = config.fields
        .filter((f) => f.getOptions)
        .map(async (field) => {
          setLoadingOptions((prev) => ({ ...prev, [field.key]: true }));
          try {
            const options = await field.getOptions!(formValues);
            return { key: field.key, options };
          } catch (error) {
            console.error(`Error loading options for ${field.key}:`, error);
            return { key: field.key, options: [] };
          } finally {
            setLoadingOptions((prev) => ({ ...prev, [field.key]: false }));
          }
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
        console.error("Error loading dynamic options", error);
      }
    };

    loadDynamicOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, config.fields]);

  // Recargar opciones cuando cambian las dependencias
  useEffect(() => {
    if (!isOpen) return;
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      // Guardar los valores iniciales de las dependencias
      config.fields.forEach((field) => {
        if (field.dependsOn) {
          field.dependsOn.forEach((depKey) => {
            previousDependencyValuesRef.current[depKey] = formValues[depKey];
          });
        }
      });
      return;
    }

    // Encontrar campos que tienen dependencias y verificar si cambiaron
    const fieldsToReload: FormFieldConfig[] = [];
    const dependencyKeysToCheck = new Set<string>();

    config.fields.forEach((field) => {
      if (field.getOptions && field.dependsOn) {
        field.dependsOn.forEach((depKey) => {
          dependencyKeysToCheck.add(depKey);
        });
        fieldsToReload.push(field);
      }
    });

    // Verificar si alguna dependencia cambió
    let hasDependencyChanged = false;
    dependencyKeysToCheck.forEach((depKey) => {
      const currentValue = formValues[depKey];
      const previousValue = previousDependencyValuesRef.current[depKey];
      if (currentValue !== previousValue) {
        hasDependencyChanged = true;
        previousDependencyValuesRef.current[depKey] = currentValue;
      }
    });

    // Solo recargar si alguna dependencia cambió
    if (!hasDependencyChanged || fieldsToReload.length === 0) return;

    const loadDependentOptions = async () => {
      const promises = fieldsToReload.map(async (field) => {
        setLoadingOptions((prev) => ({ ...prev, [field.key]: true }));
        try {
          const options = await field.getOptions!(formValues);
          return { key: field.key, options };
        } catch (error) {
          console.error(`Error loading options for ${field.key}:`, error);
          return { key: field.key, options: [] };
        } finally {
          setLoadingOptions((prev) => ({ ...prev, [field.key]: false }));
        }
      });

      try {
        const results = await Promise.all(promises);
        setDynamicOptions((prev) => {
          const newOptionsMap = { ...prev };
          results.forEach(({ key, options }) => {
            newOptionsMap[key] = options;
          });
          return newOptionsMap;
        });
      } catch (error) {
        console.error("Error loading dependent options", error);
      }
    };

    loadDependentOptions();
  }, [isOpen, formValues, config.fields]);

  const handleFieldChange = useCallback(
    (key: string, value: unknown) => {
      setFormValues((prev) => {
        const newValues = { ...prev, [key]: value };

        // Limpiar campos que dependen de este campo
        config.fields.forEach((field) => {
          if (field.dependsOn?.includes(key)) {
            newValues[field.key] = "";
          }
        });

        // Ejecutar efectos secundarios si existen
        const currentField = config.fields.find((f) => f.key === key);
        if (currentField?.onValueChange) {
          const setFieldValue = (targetKey: string, targetValue: unknown) => {
            newValues[targetKey] = targetValue;
          };
          currentField.onValueChange(value, newValues, setFieldValue);
        }

        // Limpiar error del campo cuando cambia
        if (errors[key]) {
          setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[key];
            return newErrors;
          });
        }
        return newValues;
      });
    },
    [errors, config.fields],
  );

  const validateField = (field: FormFieldConfig, value: unknown): string | null => {
    if (field.required && (value === "" || value === null || value === undefined)) {
      return t("formModal.fieldRequired", { field: field.label }) || `${field.label} es requerido`;
    }

    if (field.validator) {
      const result = field.validator(value, formValues);
      if (result !== true) {
        return typeof result === "string" ? result : `${field.label} es inválido`;
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    config.fields.forEach((field) => {
      const value = formValues[field.key];
      const error = validateField(field, value);
      if (error) {
        newErrors[field.key] = error;
      }
    });

    // Validación personalizada del formulario completo
    if (config.validate) {
      const formErrors = config.validate(formValues);
      if (formErrors) {
        Object.assign(newErrors, formErrors);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      const valuesToSubmit = config.transformValues
        ? config.transformValues(formValues)
        : formValues;

      await onSubmit(valuesToSubmit as Record<string, unknown>);
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage =
        (error instanceof Error ? error.message : String(error)) ||
        t("formModal.submitError") ||
        "Error al enviar el formulario";
      setErrors({ _form: errorMessage });
    }
  };

  const handleTimeIconClick = useCallback(
    (fieldKey: string) => {
      const input = fieldInputRefs.current[fieldKey];
      if (!input || input.disabled) return;

      // showPicker es una API experimental del navegador, necesitamos hacer un cast
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyInput = input as any;
      if (typeof (anyInput as { showPicker?: () => void }).showPicker === "function") {
        (anyInput as { showPicker: () => void }).showPicker();
        return;
      }

      input.focus();
      input.click();
    },
    [fieldInputRefs],
  );

  const renderField = (field: FormFieldConfig) => {
    const label = field.translationKey ? t(field.translationKey) : field.label;
    const value = formValues[field.key] ?? "";
    const fieldError = errors[field.key];
    const isDisabled =
      typeof field.disabled === "function" ? field.disabled(formValues) : field.disabled || false;
    const fieldLoading = loadingOptions[field.key] || false;

    if (field.type === "custom" && field.render) {
      return (
        <div key={field.key} className={field.width || "flex-1"} style={field.style}>
          {field.render(value, (newValue) => handleFieldChange(field.key, newValue), formValues)}
        </div>
      );
    }

    switch (field.type) {
      case "select":
      case "multiselect": {
        const options = dynamicOptions[field.key] ?? field.options ?? [];
        const selectPlaceholder = {
          value: "",
          label: t("formModal.selectPlaceholder") || "Select...",
        };
        const allOptions = [selectPlaceholder, ...options];

        return (
          <div
            key={field.key}
            className={`w-full md:flex-1 flex flex-col items-start ${field.className || ""}`}
            style={field.style}
          >
            <label className="text-[16px] font-semibold text-black leading-normal mb-1">
              {label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="w-full">
              <Select
                value={String(value ?? "")}
                onChange={(e) => {
                  if (field.type === "multiselect") {
                    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                    handleFieldChange(field.key, selected);
                  } else {
                    handleFieldChange(field.key, e.target.value);
                  }
                }}
                options={allOptions}
                required={field.required}
                disabled={isDisabled || fieldLoading || loading}
                error={fieldError}
                className={`w-full h-[40px] md:h-[45px] px-[15px] pr-[40px] rounded-[10px] border border-[#b6b4b4] shadow-none ${
                  field.className || ""
                }`}
                style={{
                  borderColor: "#b6b4b4",
                  paddingTop: 0,
                  paddingBottom: 0,
                }}
                multiple={field.type === "multiselect"}
              />
            </div>
            {field.helpText && <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>}
          </div>
        );
      }

      case "time":
      case "date":
      case "datetime-local": {
        return (
          <div
            key={field.key}
            className={`w-full md:flex-1 flex flex-col items-start ${field.className || ""}`}
            style={field.style}
          >
            <label className="text-[16px] font-semibold text-black leading-normal mb-1">
              {label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative w-full">
              <Input
                ref={(el) => {
                  fieldInputRefs.current[field.key] = el;
                }}
                type={field.type}
                value={String(value ?? "")}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                disabled={isDisabled || loading}
                error={fieldError}
                className={`time-input-with-icon w-full h-[40px] md:h-[45px] px-[15px] pr-[40px] rounded-[10px] border border-[#b6b4b4] ${
                  field.className || ""
                }`}
                style={{
                  borderColor: "#b6b4b4",
                  color: value ? "#000000" : "#b6b4b4",
                  paddingTop: 0,
                  paddingBottom: 0,
                  ...field.style,
                }}
              />
              {field.icon && (
                <div
                  className={`absolute right-[15px] top-1/2 -translate-y-1/2 ${
                    isDisabled || loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  }`}
                  onClick={() => handleTimeIconClick(field.key)}
                >
                  {field.icon}
                </div>
              )}
            </div>
            {field.helpText && <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>}
          </div>
        );
      }

      case "textarea": {
        return (
          <div
            key={field.key}
            className={`w-full md:flex-1 flex flex-col items-start ${field.className || ""}`}
            style={field.style}
          >
            <label className="text-[16px] font-semibold text-black leading-normal mb-1">
              {label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={String(value ?? "")}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              disabled={isDisabled || loading}
              className={`w-full px-[15px] py-[12px] rounded-[10px] border border-[#b6b4b4] ${
                field.className || ""
              }`}
              style={{
                borderColor: fieldError ? "#ef4444" : "#b6b4b4",
                color: value ? "#000000" : "#b6b4b4",
                minHeight: "100px",
                resize: "vertical",
                ...field.style,
              }}
            />
            {fieldError && <p className="mt-1 text-sm text-red-600">{fieldError}</p>}
            {field.helpText && !fieldError && (
              <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
            )}
          </div>
        );
      }

      case "text":
      case "email":
      case "number":
      case "password":
      default: {
        return (
          <div
            key={field.key}
            className={`w-full md:flex-1 flex flex-col items-start ${field.className || ""}`}
            style={field.style}
          >
            <label className="text-[16px] font-semibold text-black leading-normal mb-1">
              {label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type={field.type}
              value={String(value ?? "")}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              disabled={isDisabled || loading}
              error={fieldError}
              className={`w-full h-[40px] md:h-[45px] px-[15px] rounded-[10px] border border-[#b6b4b4] ${
                field.className || ""
              }`}
              style={{
                borderColor: "#b6b4b4",
                color: value ? "#000000" : "#b6b4b4",
                paddingTop: 0,
                paddingBottom: 0,
                ...field.style,
              }}
            />
            {field.helpText && <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>}
          </div>
        );
      }
    }
  };

  const renderFields = () => {
    const layout = config.layout || "two-column";

    if (layout === "custom") {
      // Para layout custom, renderizar todos los campos en un solo contenedor
      return (
        <div className="flex flex-col gap-[25px] items-start w-full">
          {config.fields.map((field) => renderField(field))}
        </div>
      );
    }

    if (layout === "single") {
      return (
        <div className="flex flex-col gap-[25px] items-start w-full">
          {config.fields.map((field) => renderField(field))}
        </div>
      );
    }

    // Layout de dos o tres columnas
    // En mobile: una columna, en desktop: dos o tres columnas
    const fieldsPerRow = layout === "three-column" ? 3 : 2;
    const rows: FormFieldConfig[][] = [];

    for (let i = 0; i < config.fields.length; i += fieldsPerRow) {
      rows.push(config.fields.slice(i, i + fieldsPerRow));
    }

    return (
      <div className="flex flex-col gap-[25px] items-start w-full">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-col md:flex-row gap-[25px] items-start w-full">
            {row.map((field) => renderField(field))}
          </div>
        ))}
      </div>
    );
  };

  const renderButtons = () => {
    if (config.buttons && config.buttons.length > 0) {
      return (
        <div
          className="flex flex-col md:flex-row gap-[10px] items-start w-full"
          style={config.styles?.buttonsContainer}
        >
          {config.buttons.map((buttonConfig, index) => {
            const buttonLabel = buttonConfig.translationKey
              ? t(buttonConfig.translationKey)
              : buttonConfig.label;

            const isDisabled =
              typeof buttonConfig.disabled === "function"
                ? buttonConfig.disabled(formValues, loading)
                : buttonConfig.disabled || false;

            if (buttonConfig.type === "submit") {
              return (
                <Button
                  key={index}
                  type="submit"
                  disabled={isDisabled || loading}
                  style={{
                    flex: 1,
                    width: "100%",
                    height: "45px",
                    background: buttonConfig.variant === "danger" ? "#FF0004" : "#0097b2",
                    color: "#FFFFFF",
                    fontSize: "16px",
                    fontWeight: 600,
                    padding: "12px 15px",
                    borderRadius: "10px",
                    boxShadow: "0px 4px 4px rgba(166, 166, 166, 0.25)",
                    ...buttonConfig.style,
                  }}
                  className={buttonConfig.className}
                >
                  {loading ? t("formModal.saving") || "Guardando..." : buttonLabel}
                </Button>
              );
            }

            return (
              <Button
                key={index}
                type="button"
                onClick={async () => {
                  if (buttonConfig.onClick) {
                    await buttonConfig.onClick(formValues);
                  }
                  if (buttonConfig.type === "reset") {
                    const defaultValues: Record<string, unknown> = {};
                    config.fields.forEach((field) => {
                      defaultValues[field.key] = field.defaultValue ?? "";
                    });
                    setFormValues(defaultValues);
                    setErrors({});
                  }
                }}
                disabled={isDisabled || loading}
                style={{
                  flex: 1,
                  width: "100%",
                  height: "45px",
                  background: buttonConfig.variant === "danger" ? "#FF0004" : "#a6a6a6",
                  color: "#FFFFFF",
                  fontSize: "16px",
                  fontWeight: 600,
                  padding: "12px 15px",
                  borderRadius: "10px",
                  boxShadow: "0px 4px 4px rgba(166, 166, 166, 0.25)",
                  ...buttonConfig.style,
                }}
                className={buttonConfig.className}
              >
                {buttonLabel}
              </Button>
            );
          })}
        </div>
      );
    }

    // Botones por defecto
    const submitLabel = config.submitButton?.translationKey
      ? t(config.submitButton.translationKey)
      : config.submitButton?.label || t("formModal.submit") || "Guardar";

    const cancelLabel = config.cancelButton?.translationKey
      ? t(config.cancelButton.translationKey)
      : config.cancelButton?.label || t("formModal.cancel") || "Cancelar";

    return (
      <div
        className="flex flex-col md:flex-row gap-[10px] items-start w-full"
        style={config.styles?.buttonsContainer}
      >
        <Button
          type="submit"
          disabled={loading}
          variant={config.submitButton?.variant || "primary"}
          style={{
            flex: 1,
            width: "100%",
            height: "45px",
            background: "#0097b2",
            color: "#FFFFFF",
            fontSize: "16px",
            fontWeight: 600,
            padding: "12px 15px",
            borderRadius: "10px",
            boxShadow: "0px 4px 4px rgba(166, 166, 166, 0.25)",
          }}
        >
          {loading ? t("formModal.saving") || "Guardando..." : submitLabel}
        </Button>
        <Button
          type="button"
          onClick={onClose}
          disabled={loading}
          variant={config.cancelButton?.variant || "secondary"}
          style={{
            flex: 1,
            width: "100%",
            height: "45px",
            background: "#a6a6a6",
            color: "#FFFFFF",
            fontSize: "16px",
            fontWeight: 600,
            padding: "12px 15px",
            borderRadius: "10px",
            boxShadow: "0px 4px 4px rgba(166, 166, 166, 0.25)",
          }}
        >
          {cancelLabel}
        </Button>
      </div>
    );
  };

  const title = config.titleTranslationKey ? t(config.titleTranslationKey) : config.title;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size} showHeader={false}>
      <div
        className={`bg-white border border-[rgba(166,166,166,0.5)] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(166,166,166,0.25)] px-[40px] py-[30px] md:max-w-none ${className}`}
        style={{
          width: "100%",
          maxWidth: "338px",
          ...(config.contentPadding && { padding: config.contentPadding }),
          ...config.styles?.modal,
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-[30px] items-center">
            {/* Título */}
            <h2
              className="text-[24px] font-semibold text-black text-center w-full"
              style={config.styles?.title}
            >
              {title}
            </h2>

            {/* Error general */}
            {(externalError || errors._form) && (
              <div className="w-full p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{externalError || errors._form}</p>
              </div>
            )}

            {/* Campos del formulario */}
            <div style={config.styles?.form}>{renderFields()}</div>

            {/* Botones */}
            {renderButtons()}
          </div>
        </form>
      </div>
    </Modal>
  );
}
