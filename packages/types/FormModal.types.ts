import type { SelectOption } from "./FilterPanel.types";
import type { ReactNode } from "react";

/**
 * Tipos de campos de formulario disponibles
 */
export type FormFieldType =
  | "text"
  | "email"
  | "number"
  | "password"
  | "textarea"
  | "select"
  | "multiselect"
  | "time"
  | "date"
  | "datetime-local"
  | "custom";

/**
 * Configuración de un campo de formulario
 */
export interface FormFieldConfig {
  /**
   * Identificador único del campo (usado como key en el objeto de valores)
   */
  key: string;

  /**
   * Tipo de campo a renderizar
   */
  type: FormFieldType;

  /**
   * Label a mostrar
   */
  label: string;

  /**
   * Clave de traducción (opcional, si se usa i18n)
   */
  translationKey?: string;

  /**
   * Placeholder para inputs
   */
  placeholder?: string;

  /**
   * Si el campo es requerido
   */
  required?: boolean;

  /**
   * Si el campo está deshabilitado
   */
  disabled?: boolean | ((formValues: Record<string, unknown>) => boolean);

  /**
   * Valor por defecto
   */
  defaultValue?: unknown;

  /**
   * Opciones para selects (puede ser estático o dinámico)
   */
  options?: SelectOption[];

  /**
   * Función para obtener opciones dinámicamente (async)
   */
  getOptions?: (formValues: Record<string, unknown>) => Promise<SelectOption[]>;

  /**
   * Dependencias: campos que al cambiar deben recargar las opciones de este campo
   */
  dependsOn?: string[];

  /**
   * Validación personalizada
   */
  validator?: (value: unknown, formValues: Record<string, unknown>) => boolean | string;

  /**
   * Acción a ejecutar cuando el valor del campo cambia
   */
  onValueChange?: (
    value: unknown,
    formValues: Record<string, unknown>,
    setFieldValue: (key: string, value: unknown) => void,
  ) => void;

  /**
   * Renderizado personalizado (solo para type: "custom")
   */
  render?: (
    value: unknown,
    onChange: (value: unknown) => void,
    formValues: Record<string, unknown>,
  ) => ReactNode;

  /**
   * Ancho del campo (flex-1, w-full, etc.)
   */
  width?: string;

  /**
   * Clase CSS adicional
   */
  className?: string;

  /**
   * Estilos personalizados
   */
  style?: React.CSSProperties;

  /**
   * Icono a mostrar (por ejemplo, para campos de tiempo)
   */
  icon?: ReactNode;

  /**
   * Texto de ayuda o descripción
   */
  helpText?: string;
}

/**
 * Configuración de un botón del formulario
 */
export interface FormButtonConfig {
  /**
   * Tipo de botón
   */
  type: "submit" | "button" | "reset";

  /**
   * Label del botón
   */
  label: string;

  /**
   * Clave de traducción (opcional)
   */
  translationKey?: string;

  /**
   * Variante del botón
   */
  variant?: "primary" | "secondary" | "danger" | "link";

  /**
   * Si el botón está deshabilitado
   */
  disabled?: boolean | ((formValues: Record<string, unknown>, loading: boolean) => boolean);

  /**
   * Acción al hacer click (solo para type: "button")
   */
  onClick?: (formValues: Record<string, unknown>) => void | Promise<void>;

  /**
   * Estilos personalizados
   */
  style?: React.CSSProperties;

  /**
   * Clase CSS adicional
   */
  className?: string;
}

/**
 * Layout de campos del formulario
 */
export type FormLayout = "single" | "two-column" | "three-column" | "custom";

/**
 * Configuración completa del modal de formulario
 */
export interface FormModalConfig {
  /**
   * Título del modal
   */
  title: string;

  /**
   * Clave de traducción para el título (opcional)
   */
  titleTranslationKey?: string;

  /**
   * Array de configuraciones de campos
   */
  fields: FormFieldConfig[];

  /**
   * Layout de los campos
   */
  layout?: FormLayout;

  /**
   * Configuración de botones
   */
  buttons?: FormButtonConfig[];

  /**
   * Botón de submit por defecto (si no se especifican botones)
   */
  submitButton?: {
    label: string;
    translationKey?: string;
    variant?: "primary" | "secondary" | "danger";
  };

  /**
   * Botón de cancelar por defecto (si no se especifican botones)
   */
  cancelButton?: {
    label: string;
    translationKey?: string;
    variant?: "primary" | "secondary" | "danger";
  };

  /**
   * Función de validación del formulario completo
   */
  validate?: (values: Record<string, unknown>) => Record<string, string> | null;

  /**
   * Función para transformar valores antes de enviar
   */
  transformValues?: (values: Record<string, unknown>) => Record<string, unknown> | unknown;

  /**
   * Estilos personalizados
   */
  styles?: {
    modal?: React.CSSProperties;
    form?: React.CSSProperties;
    title?: React.CSSProperties;
    fieldRow?: React.CSSProperties;
    buttonsContainer?: React.CSSProperties;
  };

  /**
   * Padding del contenido del modal
   */
  contentPadding?: string;
}

/**
 * Props del componente FormModal
 */
export interface FormModalProps {
  /**
   * Configuración del modal
   */
  config: FormModalConfig;

  /**
   * Si el modal está abierto
   */
  isOpen: boolean;

  /**
   * Función para cerrar el modal
   */
  onClose: () => void;

  /**
   * Valores iniciales del formulario
   */
  initialValues?: Record<string, unknown>;

  /**
   * Función que se ejecuta al enviar el formulario
   */
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void;

  /**
   * Si está cargando (para deshabilitar controles)
   */
  loading?: boolean;

  /**
   * Tamaño del modal
   */
  size?: "sm" | "md" | "lg" | "xl" | "full";

  /**
   * Clase CSS adicional
   */
  className?: string;

  /**
   * Mensaje de error general
   */
  error?: string;
}
