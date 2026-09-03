/**
 * Tipos de datos para celdas
 */
export type CellDataType =
  | "text"
  | "number"
  | "percentage"
  | "badge"
  | "date"
  | "datetime"
  | "time"
  | "boolean"
  | "currency"
  | "link"
  | "action"
  | "custom";

/**
 * Configuración de una columna
 */
export interface ColumnConfig<T = Record<string, unknown>> {
  key: string;
  title: string;
  translationKey?: string;
  dataPath: string | ((row: T) => unknown);
  type: CellDataType;
  width?: string;
  minWidth?: string;
  sortable?: boolean;
  filterable?: boolean;
  align?: "left" | "center" | "right";
  hideable?: boolean;
  hidden?: boolean;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  config?: {
    percentage?: {
      thresholds?: Array<{ value: number; color: string }>;
      defaultColor?: string;
    };
    badge?: {
      variants?: Record<string, { color: string; bgColor: string }>;
    };
    dateFormat?: string;
    currency?: {
      symbol?: string;
      locale?: string;
    };
    action?: {
      label: string;
      onClick: (row: T) => void;
      icon?: React.ReactNode;
      variant?: "primary" | "secondary" | "danger" | "link";
    };
    link?: {
      hrefPath?: string | ((row: T) => string);
      target?: "_blank" | "_self";
    };
  };
}

/**
 * Configuración de la tabla móvil (cards)
 */
export interface MobileCardConfig<T = Record<string, unknown>> {
  primaryFields: Array<{
    key: string;
    label: string;
    dataPath: string | ((row: T) => unknown);
    render?: (value: unknown, row: T) => React.ReactNode;
  }>;
  expandedFields?: Array<{
    key: string;
    label: string;
    dataPath: string | ((row: T) => unknown);
    render?: (value: unknown, row: T) => React.ReactNode;
  }>;
  expandable?: boolean;
  customCard?: (row: T, isExpanded: boolean, onToggle: () => void) => React.ReactNode;
}

/**
 * Configuración completa de la tabla
 */
/**
 * Filas expandibles en la vista de escritorio.
 *
 * En mobile la expansión ya existía vía `MobileCardConfig.expandable`; esto es
 * su equivalente para la tabla. Es opcional: sin `expandableRows` la tabla se
 * comporta exactamente igual que antes, que importa porque `DataTable` tiene
 * ~15 consumidores.
 */
export interface ExpandableRowsConfig<T = Record<string, unknown>> {
  /** Contenido a mostrar debajo de la fila cuando está expandida. */
  render: (row: T) => React.ReactNode;
  /**
   * Si devuelve false, la fila no muestra el control ni se puede expandir.
   * Sirve para grupos de un solo elemento, que no tienen nada que revelar.
   */
  isExpandable?: (row: T) => boolean;
  /** Texto accesible del botón. */
  toggleLabel?: (row: T, isExpanded: boolean) => string;
}

export interface DataTableConfig<T = Record<string, unknown>> {
  columns: ColumnConfig<T>[];
  mobileConfig?: MobileCardConfig<T>;
  expandableRows?: ExpandableRowsConfig<T>;
  rowKey?: string | ((row: T) => string);
  showRowNumbers?: boolean;
  striped?: boolean;
  evenRowColor?: string;
  oddRowColor?: string;
  sortable?: boolean;
  onSort?: (column: string, direction: "asc" | "desc") => void;
  pagination?: {
    enabled: boolean;
    pageSize?: number;
    pageSizeOptions?: number[];
    showPageSizeSelector?: boolean;
  };
  emptyState?: {
    message: string;
    icon?: React.ReactNode;
  };
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  styles?: {
    table?: React.CSSProperties;
    header?: React.CSSProperties;
    row?: React.CSSProperties;
    cell?: React.CSSProperties;
    mobileCard?: React.CSSProperties;
  };
}

/**
 * Props del componente DataTable
 */
export interface DataTableProps<T = Record<string, unknown>> {
  config: DataTableConfig<T>;
  data: T[];
  title?: string;
  className?: string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
}
