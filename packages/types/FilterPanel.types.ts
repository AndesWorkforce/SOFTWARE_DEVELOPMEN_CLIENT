/**
 * Tipos de filtros disponibles
 */
export type FilterType = "select" | "dateRange" | "text" | "number" | "multiselect";

export interface SelectOption {
  value: string;
  label: string;
  /**
   * Valor del filtro padre al que pertenece esta opción (para filtros dependientes)
   * Ej: un equipo pertenece a un cliente específico
   */
  parentValue?: string;
}

/**
 * Configuración de un filtro individual
 */
export interface FilterConfig {
  /**
   * Identificador único del filtro (usado como key en el objeto de valores)
   */
  key: string;

  /**
   * Tipo de filtro a renderizar
   */
  type: FilterType;

  /**
   * Label a mostrar
   */
  label: string;

  /**
   * Clave de traducción (opcional, si se usa i18n)
   */
  translationKey?: string;

  /**
   * Placeholder para inputs de texto
   */
  placeholder?: string;

  /**
   * Opciones para selects (puede ser estático o dinámico)
   */
  options?: SelectOption[];

  /**
   * Función para obtener opciones dinámicamente (async)
   */
  getOptions?: () => Promise<SelectOption[]>;

  /**
   * Clave del filtro del que depende este filtro (para habilitar/deshabilitar y filtrar opciones).
   * Cuando se especifica, el filtro estará deshabilitado hasta que el filtro padre tenga un valor.
   * Las opciones se filtrarán automáticamente mostrando solo las que tengan `parentValue` igual al valor del padre.
   */
  dependsOn?: string;

  /**
   * Valores por defecto
   */
  defaultValue?: string | string[] | { start: string; end: string };

  /**
   * Ancho mínimo en desktop (para DateRangePicker especialmente)
   */
  minWidth?: string;

  /**
   * Si el filtro es requerido
   */
  required?: boolean;

  /**
   * Validación personalizada
   */
  validator?: (
    value: string | string[] | { start: string; end: string } | undefined,
  ) => boolean | string;

  /**
   * Si el filtro está deshabilitado
   */
  disabled?: boolean;

  /**
   * Icono a mostrar junto al filtro (opcional)
   */
  icon?: React.ReactNode;
}

/**
 * Configuración completa del panel de filtros
 */
export interface FilterPanelConfig {
  /**
   * Array de configuraciones de filtros
   */
  filters: FilterConfig[];

  /**
   * Layout: 'row' | 'grid' | 'custom'
   */
  layout?: "row" | "grid" | "custom";

  /**
   * Columnas en grid (solo si layout = 'grid')
   */
  gridColumns?: number;

  /**
   * Si mostrar el botón de limpiar filtros
   */
  showClearButton?: boolean;

  /**
   * Label del botón limpiar (o translation key)
   */
  clearButtonLabel?: string;

  /**
   * Posición del botón limpiar: 'end' | 'separate-row'
   */
  clearButtonPosition?: "end" | "separate-row";

  /**
   * Estilos personalizados
   */
  styles?: {
    panel?: React.CSSProperties;
    title?: React.CSSProperties;
    filterRow?: React.CSSProperties;
  };
}

/**
 * Valores de los filtros (estado interno)
 */
export interface FilterValues {
  [key: string]: string | string[] | undefined | { start: string; end: string };
}

/**
 * Props del componente FilterPanel
 */
export interface FilterPanelProps {
  /**
   * Configuración del panel
   */
  config: FilterPanelConfig;

  /**
   * Valores iniciales de los filtros
   */
  initialValues?: FilterValues;

  /**
   * Callback cuando cambian los filtros
   */
  onChange?: (values: FilterValues) => void;

  /**
   * Callback cuando se limpian los filtros
   */
  onClear?: () => void;

  /**
   * Si está cargando (para deshabilitar controles)
   */
  loading?: boolean;

  /**
   * Clase CSS adicional
   */
  className?: string;
}
