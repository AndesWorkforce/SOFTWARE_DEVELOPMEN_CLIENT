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
export interface DataTableConfig<T = Record<string, unknown>> {
  columns: ColumnConfig<T>[];
  mobileConfig?: MobileCardConfig<T>;
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
