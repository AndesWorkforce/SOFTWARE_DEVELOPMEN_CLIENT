# Plan de Implementación: Componentes Reutilizables de Filtros y Tabla

## 📋 Objetivo

Transformar los filtros y la tabla de la vista de reportes en componentes completamente reutilizables y configurables mediante objetos de configuración, permitiendo su uso para diferentes entidades (contractors, clients, users, teams, etc.).

---

## 🏗️ Arquitectura Propuesta

### Estructura de Componentes

```
packages/design-system/
├── components/
│   ├── filters/
│   │   ├── FilterPanel.tsx           # Componente principal de filtros
│   │   ├── FilterPanel.types.ts      # Tipos e interfaces
│   │   ├── FilterPanel.config.ts     # Configuraciones predefinidas
│   │   └── index.ts
│   └── table/
│       ├── DataTable.tsx             # Componente principal de tabla
│       ├── DataTable.types.ts        # Tipos e interfaces
│       ├── DataTable.config.ts       # Configuraciones predefinidas
│       └── index.ts
```

---

## 📦 Parte 1: Componente de Filtros Reutilizable

### 1.1 Definición de Tipos e Interfaces

#### Archivo: `packages/design-system/components/filters/FilterPanel.types.ts`

```typescript
/**
 * Tipos de filtros disponibles
 */
export type FilterType =
  | "select" // Select dropdown (userId, clientId, teamId, etc.)
  | "dateRange" // DateRangePicker
  | "text" // Input de texto
  | "number" // Input numérico
  | "multiselect"; // Select múltiple (futuro)

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
  options?: Array<{ value: string; label: string }>;

  /**
   * Función para obtener opciones dinámicamente (async)
   */
  getOptions?: () => Promise<Array<{ value: string; label: string }>>;

  /**
   * Valores por defecto
   */
  defaultValue?: string | { start: string; end: string };

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
  validator?: (value: any) => boolean | string;

  /**
   * Si el filtro está deshabilitado
   */
  disabled?: boolean;
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
  [key: string]: string | undefined | { start: string; end: string };
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
```

### 1.2 Componente FilterPanel

#### Archivo: `packages/design-system/components/filters/FilterPanel.tsx`

**Estructura básica:**

```typescript
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Select, DateRangePicker, Button } from "@/packages/design-system";
import { ListFilter } from "lucide-react";
import type { FilterPanelProps, FilterValues, FilterConfig } from "./FilterPanel.types";

export function FilterPanel({
  config,
  initialValues = {},
  onChange,
  onClear,
  loading = false,
  className = "",
}: FilterPanelProps) {
  const t = useTranslations();
  const [filterValues, setFilterValues] = useState<FilterValues>(initialValues);
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, Array<{ value: string; label: string }>>>({});

  // Cargar opciones dinámicas
  useEffect(() => {
    // Implementar carga de opciones dinámicas
  }, []);

  // Renderizar filtro según su tipo
  const renderFilter = (filterConfig: FilterConfig) => {
    // Switch según filterConfig.type
  };

  // Agrupar filtros en filas (lógica de layout)
  const groupFiltersIntoRows = () => {
    // Implementar lógica de agrupación
  };

  // Manejar cambio de filtro
  const handleFilterChange = (key: string, value: any) => {
    // Actualizar estado y llamar onChange
  };

  // Limpiar filtros
  const handleClear = () => {
    // Resetear a valores por defecto
  };

  return (
    <div className={`mb-6 md:mb-8 rounded-[10px] p-6 ${className}`} style={config.styles?.panel}>
      {/* Header con icono */}
      {/* Renderizado de filtros según layout */}
      {/* Botón limpiar */}
    </div>
  );
}
```

**Lógica de renderizado por tipo:**

- `dateRange`: Usar `DateRangePicker`
- `select`: Usar `Select` con opciones
- `text`: Input de texto
- `number`: Input numérico

**Lógica de layout:**

- `row`: Filtros en fila horizontal (responsive con flex-wrap)
- `grid`: Grid con número de columnas especificado
- `custom`: Renderizado manual (avanzado)

### 1.3 Configuraciones Predefinidas

#### Archivo: `packages/design-system/components/filters/FilterPanel.config.ts`

```typescript
import type { FilterPanelConfig } from "./FilterPanel.types";

/**
 * Configuración para filtros de Reportes de Actividad
 */
export const activityReportsFiltersConfig: FilterPanelConfig = {
  filters: [
    {
      key: "dateRange",
      type: "dateRange",
      label: "Date",
      translationKey: "reports.date",
      defaultValue: {
        start: new Date().toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0],
      },
      minWidth: "260px",
    },
    {
      key: "userId",
      type: "select",
      label: "User",
      translationKey: "reports.user",
      getOptions: async () => {
        // Llamada a API para obtener usuarios
        return [];
      },
    },
    {
      key: "country",
      type: "select",
      label: "Country",
      translationKey: "reports.country",
      getOptions: async () => {
        // Llamada a API para obtener países
        return [];
      },
    },
    {
      key: "clientId",
      type: "select",
      label: "Client",
      translationKey: "reports.client",
      getOptions: async () => {
        // Llamada a API para obtener clientes
        return [];
      },
    },
    {
      key: "teamId",
      type: "select",
      label: "Team",
      translationKey: "reports.team",
      getOptions: async () => {
        // Llamada a API para obtener equipos
        return [];
      },
    },
    {
      key: "jobPosition",
      type: "select",
      label: "Job Position",
      translationKey: "reports.jobPosition",
      getOptions: async () => {
        // Llamada a API para obtener posiciones
        return [];
      },
    },
  ],
  layout: "row",
  showClearButton: true,
  clearButtonPosition: "end",
  clearButtonLabel: "Clean Filters",
};

/**
 * Configuración para filtros de Clientes
 */
export const clientsFiltersConfig: FilterPanelConfig = {
  filters: [
    {
      key: "dateRange",
      type: "dateRange",
      label: "Created Date",
      minWidth: "260px",
    },
    {
      key: "status",
      type: "select",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    {
      key: "name",
      type: "text",
      label: "Client Name",
      placeholder: "Search by name...",
    },
  ],
  layout: "row",
  showClearButton: true,
};

/**
 * Configuración para filtros de Usuarios
 */
export const usersFiltersConfig: FilterPanelConfig = {
  filters: [
    {
      key: "role",
      type: "select",
      label: "Role",
      options: [
        { value: "superadmin", label: "Superadmin" },
        { value: "teamadmin", label: "Team Admin" },
        { value: "visualizer", label: "Visualizer" },
      ],
    },
    {
      key: "email",
      type: "text",
      label: "Email",
      placeholder: "Search by email...",
    },
  ],
  layout: "row",
  showClearButton: true,
};
```

---

## 📊 Parte 2: Componente de Tabla Reutilizable

### 2.1 Definición de Tipos e Interfaces

#### Archivo: `packages/design-system/components/table/DataTable.types.ts`

```typescript
/**
 * Tipos de datos para celdas
 */
export type CellDataType =
  | "text" // Texto simple
  | "number" // Número
  | "percentage" // Porcentaje (con colorización)
  | "badge" // Badge/Etiqueta
  | "date" // Fecha
  | "datetime" // Fecha y hora
  | "time" // Hora
  | "boolean" // Checkbox o sí/no
  | "currency" // Moneda
  | "link" // Enlace
  | "action" // Botón de acción
  | "custom"; // Renderizado personalizado

/**
 * Configuración de una columna
 */
export interface ColumnConfig<T = any> {
  /**
   * Key único de la columna
   */
  key: string;

  /**
   * Título de la columna (o translation key)
   */
  title: string;

  /**
   * Clave de traducción (opcional)
   */
  translationKey?: string;

  /**
   * Path para acceder al dato en el objeto (ej: 'user.name', 'client.id')
   * Puede ser función para acceso complejo
   */
  dataPath: string | ((row: T) => any);

  /**
   * Tipo de dato (afecta el renderizado)
   */
  type: CellDataType;

  /**
   * Ancho de la columna (px, %, etc.)
   */
  width?: string;

  /**
   * Ancho mínimo
   */
  minWidth?: string;

  /**
   * Si la columna es ordenable
   */
  sortable?: boolean;

  /**
   * Si la columna es filtrable
   */
  filterable?: boolean;

  /**
   * Alineación del contenido: 'left' | 'center' | 'right'
   */
  align?: "left" | "center" | "right";

  /**
   * Si se puede ocultar la columna
   */
  hideable?: boolean;

  /**
   * Si está oculta por defecto
   */
  hidden?: boolean;

  /**
   * Renderizado personalizado (sobrescribe type)
   */
  render?: (value: any, row: T, index: number) => React.ReactNode;

  /**
   * Configuración específica por tipo
   */
  config?: {
    // Para percentage
    percentage?: {
      thresholds?: Array<{ value: number; color: string }>;
      defaultColor?: string;
    };

    // Para badge
    badge?: {
      variants?: Record<string, { color: string; bgColor: string }>;
    };

    // Para date/datetime
    dateFormat?: string;

    // Para currency
    currency?: {
      symbol?: string;
      locale?: string;
    };

    // Para action
    action?: {
      label: string;
      onClick: (row: T) => void;
      icon?: React.ReactNode;
      variant?: "primary" | "secondary" | "danger" | "link";
    };
  };
}

/**
 * Configuración de la tabla móvil (cards)
 */
export interface MobileCardConfig<T = any> {
  /**
   * Campos a mostrar en la vista colapsada
   */
  primaryFields: Array<{
    key: string;
    label: string;
    dataPath: string | ((row: T) => any);
    render?: (value: any, row: T) => React.ReactNode;
  }>;

  /**
   * Campos a mostrar cuando se expande
   */
  expandedFields?: Array<{
    key: string;
    label: string;
    dataPath: string | ((row: T) => any);
    render?: (value: any, row: T) => React.ReactNode;
  }>;

  /**
   * Si se puede expandir
   */
  expandable?: boolean;

  /**
   * Renderizado personalizado de la card
   */
  customCard?: (row: T, isExpanded: boolean, onToggle: () => void) => React.ReactNode;
}

/**
 * Configuración completa de la tabla
 */
export interface DataTableConfig<T = any> {
  /**
   * Configuración de columnas
   */
  columns: ColumnConfig<T>[];

  /**
   * Configuración de vista móvil
   */
  mobileConfig?: MobileCardConfig<T>;

  /**
   * Key único para identificar filas
   */
  rowKey?: string | ((row: T) => string);

  /**
   * Si mostrar números de fila
   */
  showRowNumbers?: boolean;

  /**
   * Estilos de filas alternadas
   */
  striped?: boolean;
  evenRowColor?: string;
  oddRowColor?: string;

  /**
   * Si la tabla es ordenable
   */
  sortable?: boolean;

  /**
   * Callback cuando se ordena
   */
  onSort?: (column: string, direction: "asc" | "desc") => void;

  /**
   * Paginación
   */
  pagination?: {
    enabled: boolean;
    pageSize?: number;
    pageSizeOptions?: number[];
    showPageSizeSelector?: boolean;
  };

  /**
   * Estado vacío
   */
  emptyState?: {
    message: string;
    icon?: React.ReactNode;
  };

  /**
   * Loading state
   */
  loading?: boolean;
  loadingComponent?: React.ReactNode;

  /**
   * Estilos personalizados
   */
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
export interface DataTableProps<T = any> {
  /**
   * Configuración de la tabla
   */
  config: DataTableConfig<T>;

  /**
   * Datos a mostrar
   */
  data: T[];

  /**
   * Título de la sección (opcional)
   */
  title?: string;

  /**
   * Clase CSS adicional
   */
  className?: string;

  /**
   * Callback cuando se hace click en una fila
   */
  onRowClick?: (row: T) => void;
}
```

### 2.2 Componente DataTable

#### Archivo: `packages/design-system/components/table/DataTable.tsx`

**Estructura básica:**

```typescript
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { DataTableProps, ColumnConfig, MobileCardConfig } from "./DataTable.types";

export function DataTable<T = any>({
  config,
  data,
  title,
  className = "",
  onRowClick,
}: DataTableProps<T>) {
  const t = useTranslations();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Obtener valor de una fila usando dataPath
  const getValue = (row: T, dataPath: string | ((row: T) => any)): any => {
    if (typeof dataPath === 'function') {
      return dataPath(row);
    }
    // Implementar acceso anidado: 'user.name' -> row.user.name
  };

  // Renderizar celda según tipo
  const renderCell = (column: ColumnConfig<T>, row: T, index: number) => {
    const value = getValue(row, column.dataPath);

    if (column.render) {
      return column.render(value, row, index);
    }

    switch (column.type) {
      case 'text':
        return value;
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'percentage':
        return renderPercentage(value, column);
      case 'date':
        return formatDate(value, column.config?.dateFormat);
      // ... otros tipos
      default:
        return String(value ?? '');
    }
  };

  // Renderizar porcentaje con colorización
  const renderPercentage = (value: number, column: ColumnConfig<T>) => {
    const thresholds = column.config?.percentage?.thresholds || [
      { value: 50, color: '#2EC36D' },
    ];
    const color = getPercentageColor(value, thresholds);
    return <span style={{ color, fontWeight: 700 }}>{value}%</span>;
  };

  // Renderizar vista desktop (tabla)
  const renderDesktopView = () => {
    return (
      <div className="hidden md:block rounded-lg shadow-md overflow-hidden" style={config.styles?.table}>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr style={config.styles?.header}>
                {config.columns
                  .filter(col => !col.hidden)
                  .map(column => (
                    <th
                      key={column.key}
                      className="px-6 py-3 text-center text-base font-semibold"
                      style={{
                        color: '#000000',
                        width: column.width,
                        minWidth: column.minWidth,
                        textAlign: column.align || 'center',
                      }}
                    >
                      {column.translationKey ? t(column.translationKey) : column.title}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => {
                const rowKey = typeof config.rowKey === 'function'
                  ? config.rowKey(row)
                  : row[config.rowKey || 'id'];

                const isEvenRow = config.striped && index % 2 === 1;

                return (
                  <tr
                    key={rowKey}
                    style={{
                      background: isEvenRow
                        ? (config.evenRowColor || '#E2E2E2')
                        : (config.oddRowColor || '#FFFFFF'),
                      ...config.styles?.row,
                    }}
                    onClick={() => onRowClick?.(row)}
                  >
                    {config.columns
                      .filter(col => !col.hidden)
                      .map(column => (
                        <td
                          key={column.key}
                          className="px-6 py-4 whitespace-nowrap text-base text-center"
                          style={{
                            color: '#000000',
                            width: column.width,
                            textAlign: column.align || 'center',
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

  // Renderizar vista móvil (cards)
  const renderMobileView = () => {
    if (!config.mobileConfig) {
      return null;
    }

    return (
      <div className="md:hidden rounded-[10px] overflow-hidden" style={config.styles?.mobileCard}>
        {data.map((row, index) => {
          const rowKey = typeof config.rowKey === 'function'
            ? config.rowKey(row)
            : row[config.rowKey || 'id'];

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

          if (config.mobileConfig?.customCard) {
            return config.mobileConfig.customCard(row, isExpanded, toggleExpand);
          }

          return (
            <div
              key={rowKey}
              style={{
                background: isEvenRow
                  ? (config.evenRowColor || '#E2E2E2')
                  : (config.oddRowColor || '#FFFFFF'),
              }}
              className="p-3"
            >
              {/* Renderizado de campos primarios */}
              {/* Renderizado de campos expandidos */}
              {/* Botón expandir/colapsar */}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={className}>
      {title && (
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: '#000000' }}>
          {title}
        </h2>
      )}

      {config.loading ? (
        config.loadingComponent || (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )
      ) : data.length === 0 ? (
        <div className="rounded-lg shadow-md p-12 text-center" style={{ background: '#FFFFFF' }}>
          <p style={{ color: '#000000' }}>
            {config.emptyState?.message || 'No data available'}
          </p>
        </div>
      ) : (
        <>
          {renderDesktopView()}
          {renderMobileView()}
        </>
      )}
    </div>
  );
}
```

### 2.3 Configuraciones Predefinidas

#### Archivo: `packages/design-system/components/table/DataTable.config.ts`

```typescript
import type { DataTableConfig, MobileCardConfig } from "./DataTable.types";
import type { UserActivity } from "@/packages/api/reports/reports.types";

/**
 * Configuración de tabla para Reportes de Actividad
 */
export const activityReportsTableConfig: DataTableConfig<UserActivity> = {
  columns: [
    {
      key: 'user',
      title: 'User',
      translationKey: 'reports.table.user',
      dataPath: (row) => row.user.name,
      type: 'text',
      width: '200px',
      align: 'center',
    },
    {
      key: 'jobPosition',
      title: 'Job Position',
      translationKey: 'reports.table.jobPosition',
      dataPath: 'jobPosition',
      type: 'text',
      width: '200px',
      align: 'center',
    },
    {
      key: 'client',
      title: 'Client',
      translationKey: 'reports.table.client',
      dataPath: (row) => row.client.name,
      type: 'text',
      width: '160px',
      align: 'center',
    },
    {
      key: 'team',
      title: 'Team',
      translationKey: 'reports.table.team',
      dataPath: (row) => row.team.name,
      type: 'text',
      width: '120px',
      align: 'center',
    },
    {
      key: 'country',
      title: 'Country',
      translationKey: 'reports.table.country',
      dataPath: 'country',
      type: 'text',
      width: '150px',
      align: 'center',
    },
    {
      key: 'timeWorked',
      title: 'Time',
      translationKey: 'reports.table.time',
      dataPath: 'timeWorked',
      type: 'time',
      width: '100px',
      align: 'center',
    },
    {
      key: 'activityPercentage',
      title: 'Activity',
      translationKey: 'reports.table.activity',
      dataPath: 'activityPercentage',
      type: 'percentage',
      width: '100px',
      align: 'center',
      config: {
        percentage: {
          thresholds: [
            { value: 50, color: '#2EC36D' },
          ],
          defaultColor: '#FF0004',
        },
      },
    },
    {
      key: 'activityDetail',
      title: 'Activity Detail',
      translationKey: 'reports.table.activityDetail',
      dataPath: 'id',
      type: 'action',
      width: '100px',
      align: 'center',
      config: {
        action: {
          label: 'View Detail',
          onClick: (row) => {
            // Navegar a detalle
            console.log('View detail for', row.id);
          },
        },
      },
    },
  ],
  mobileConfig: {
    primaryFields: [
      {
        key: 'user',
        label: 'User',
        dataPath: (row) => row.user.name,
      },
      {
        key: 'jobPosition',
        label: 'Job Position',
        dataPath: 'jobPosition',
      },
    ],
    expandedFields: [
      {
        key: 'team',
        label: 'Team',
        dataPath: (row) => row.team.name,
      },
      {
        key: 'country',
        label: 'Country',
        dataPath: 'country',
      },
      {
        key: 'timeWorked',
        label: 'Time',
        dataPath: 'timeWorked',
      },
      {
        key: 'activityPercentage',
        label: 'Activity',
        dataPath: 'activityPercentage',
        render: (value) => (
          <span style={{ color: value >= 50 ? '#2EC36D' : '#FF0004', fontWeight: 700 }}>
            {value}%
          </span>
        ),
      },
    ],
    expandable: true,
  },
  rowKey: 'id',
  striped: true,
  evenRowColor: '#E2E2E2',
  oddRowColor: '#FFFFFF',
  emptyState: {
    message: 'No activities found',
  },
};

/**
 * Configuración de tabla para Clientes
 */
export const clientsTableConfig: DataTableConfig<any> = {
  columns: [
    {
      key: 'name',
      title: 'Client Name',
      dataPath: 'name',
      type: 'text',
      width: '200px',
    },
    {
      key: 'email',
      title: 'Email',
      dataPath: 'email',
      type: 'text',
      width: '250px',
    },
    {
      key: 'status',
      title: 'Status',
      dataPath: 'status',
      type: 'badge',
      width: '120px',
      config: {
        badge: {
          variants: {
            active: { color: '#2EC36D', bgColor: '#E6F7ED' },
            inactive: { color: '#FF0004', bgColor: '#FFE6E6' },
          },
        },
      },
    },
    {
      key: 'createdAt',
      title: 'Created At',
      dataPath: 'createdAt',
      type: 'date',
      width: '150px',
    },
    {
      key: 'actions',
      title: 'Actions',
      dataPath: 'id',
      type: 'action',
      width: '100px',
      config: {
        action: {
          label: 'Edit',
          onClick: (row) => console.log('Edit', row.id),
        },
      },
    },
  ],
  rowKey: 'id',
  striped: true,
};

/**
 * Configuración de tabla para Usuarios
 */
export const usersTableConfig: DataTableConfig<any> = {
  columns: [
    {
      key: 'name',
      title: 'Name',
      dataPath: 'name',
      type: 'text',
      width: '200px',
    },
    {
      key: 'email',
      title: 'Email',
      dataPath: 'email',
      type: 'text',
      width: '250px',
    },
    {
      key: 'role',
      title: 'Role',
      dataPath: 'role',
      type: 'badge',
      width: '150px',
    },
    {
      key: 'isActive',
      title: 'Active',
      dataPath: 'isActive',
      type: 'boolean',
      width: '100px',
    },
  ],
  rowKey: 'id',
  striped: true,
};
```

---

## 🔧 Parte 3: Pasos de Implementación

### Paso 1: Crear Estructura de Directorios

```bash
cd SOFTWARE_DEVELOPMEN_CLIENT/packages/design-system

# Crear directorios
mkdir -p components/filters
mkdir -p components/table

# Crear archivos base
touch components/filters/FilterPanel.tsx
touch components/filters/FilterPanel.types.ts
touch components/filters/FilterPanel.config.ts
touch components/filters/index.ts

touch components/table/DataTable.tsx
touch components/table/DataTable.types.ts
touch components/table/DataTable.config.ts
touch components/table/index.ts
```

### Paso 2: Implementar Tipos e Interfaces

1. **Copiar y completar** `FilterPanel.types.ts` con todas las interfaces definidas
2. **Copiar y completar** `DataTable.types.ts` con todas las interfaces definidas
3. **Validar tipos** con TypeScript: `pnpm type-check`

### Paso 3: Implementar Componente FilterPanel

1. **Implementar estado interno** (valores de filtros, opciones dinámicas)
2. **Implementar función `renderFilter`** con switch según tipo
3. **Implementar función `groupFiltersIntoRows`** para layout
4. **Implementar handlers** (onChange, onClear)
5. **Implementar carga de opciones dinámicas** (useEffect con getOptions)
6. **Agregar estilos** según diseño actual
7. **Probar con configuración de ejemplo**

### Paso 4: Implementar Componente DataTable

1. **Implementar función `getValue`** para acceso anidado a datos
2. **Implementar función `renderCell`** con switch según tipo
3. **Implementar renderizado desktop** (tabla HTML)
4. **Implementar renderizado móvil** (cards expandibles)
5. **Implementar ordenamiento** (si está habilitado)
6. **Implementar paginación** (si está habilitada)
7. **Agregar estilos** según diseño actual
8. **Probar con configuración de ejemplo**

### Paso 5: Crear Configuraciones

1. **Crear `activityReportsFiltersConfig`** basado en filtros actuales
2. **Crear `activityReportsTableConfig`** basado en tabla actual
3. **Crear configuraciones para otras entidades** (clients, users, teams)
4. **Validar que las configuraciones sean compatibles** con los componentes

### Paso 6: Refactorizar Vista de Reportes

1. **Importar componentes** en `page.tsx`
2. **Importar configuraciones**
3. **Reemplazar JSX de filtros** con `<FilterPanel />`
4. **Reemplazar JSX de tabla** con `<DataTable />`
5. **Actualizar handlers** para trabajar con los nuevos componentes
6. **Probar funcionalidad completa**

### Paso 7: Exportar Componentes

#### `components/filters/index.ts`

```typescript
export { FilterPanel } from "./FilterPanel";
export type {
  FilterPanelProps,
  FilterPanelConfig,
  FilterConfig,
  FilterValues,
} from "./FilterPanel.types";
export {
  activityReportsFiltersConfig,
  clientsFiltersConfig,
  usersFiltersConfig,
} from "./FilterPanel.config";
```

#### `components/table/index.ts`

```typescript
export { DataTable } from "./DataTable";
export type {
  DataTableProps,
  DataTableConfig,
  ColumnConfig,
  MobileCardConfig,
} from "./DataTable.types";
export {
  activityReportsTableConfig,
  clientsTableConfig,
  usersTableConfig,
} from "./DataTable.config";
```

#### Actualizar `packages/design-system/index.ts` (o el archivo principal de exports)

```typescript
// ... otros exports
export * from "./components/filters";
export * from "./components/table";
```

### Paso 8: Testing y Validación

1. **Probar vista de reportes** con los nuevos componentes
2. **Probar con diferentes configuraciones** (clients, users)
3. **Validar responsive** (mobile vs desktop)
4. **Validar traducciones** (i18n)
5. **Validar estilos** (deben coincidir con diseño actual)
6. **Validar performance** (con grandes cantidades de datos)

### Paso 9: Documentación

1. **Crear Storybook stories** (opcional, si se usa Storybook)
2. **Documentar props** con JSDoc
3. **Crear ejemplos de uso** en documentación
4. **Documentar cómo crear nuevas configuraciones**

---

## 📝 Parte 4: Ejemplo de Uso Refactorizado

### Vista de Reportes Refactorizada

```typescript
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button, Header } from "@/packages/design-system";
import { FilterPanel, activityReportsFiltersConfig } from "@/packages/design-system/components/filters";
import { DataTable, activityReportsTableConfig } from "@/packages/design-system/components/table";
import { Download } from "lucide-react";
import {
  reportsService,
  type UserActivity,
  type FilterValues,
} from "@/packages/api/reports/reports.service";

export default function ReportsPage() {
  const t = useTranslations("reports");
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({
    dateRange: {
      start: new Date().toISOString().split("T")[0],
      end: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const mockActivities = reportsService.getMockActivityData();
      setActivities(mockActivities);
    } catch (error) {
      console.error("Error loading reports data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (values: FilterValues) => {
    setFilters(values);
    // Opcional: recargar datos cuando cambian los filtros
    // loadData();
  };

  const handleClearFilters = () => {
    setFilters({
      dateRange: {
        start: new Date().toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0],
      },
    });
  };

  return (
    <>
      <Header userName="User" />
      <div
        className="p-4 md:p-8 min-h-screen"
        style={{ background: "#FFFFFF", paddingTop: "75px" }}
      >
        <div className="max-w-full">
          {/* Page Title and Export Button */}
          <div className="mb-6 md:mb-8 flex items-center justify-between">
            <h1 className="text-xl md:text-3xl font-bold" style={{ color: "#000000" }}>
              {t("title")}
            </h1>
            <Button
              variant="primary"
              style={{
                background: "#0097B2",
                color: "#FFFFFF",
                fontSize: "14px",
                padding: "7px 21px",
                height: "35px",
              }}
            >
              <Download className="w-3.5 h-3.5 md:w-5 md:h-5 mr-2" />
              <span className="hidden md:inline">{t("exportPdf")}</span>
              <span className="md:hidden">Export PDF</span>
            </Button>
          </div>

          {/* Filters Panel */}
          <FilterPanel
            config={activityReportsFiltersConfig}
            initialValues={filters}
            onChange={handleFiltersChange}
            onClear={handleClearFilters}
            loading={loading}
          />

          {/* Data Table */}
          <DataTable
            config={activityReportsTableConfig}
            data={activities}
            title={t("activityToday")}
            loading={loading}
          />
        </div>
      </div>
    </>
  );
}
```

### Ejemplo: Vista de Clientes

```typescript
"use client";

import { useState, useEffect } from "react";
import { FilterPanel, clientsFiltersConfig } from "@/packages/design-system/components/filters";
import { DataTable, clientsTableConfig } from "@/packages/design-system/components/table";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [filters, setFilters] = useState({});

  return (
    <div>
      <FilterPanel
        config={clientsFiltersConfig}
        initialValues={filters}
        onChange={setFilters}
      />

      <DataTable
        config={clientsTableConfig}
        data={clients}
        title="Clients"
      />
    </div>
  );
}
```

---

## 🎯 Parte 5: Consideraciones Adicionales

### 5.1 Manejo de Opciones Dinámicas

Para filtros con `getOptions`:

```typescript
// En FilterPanel.tsx
useEffect(() => {
  const loadDynamicOptions = async () => {
    const promises = config.filters
      .filter((f) => f.getOptions)
      .map(async (filter) => {
        const options = await filter.getOptions!();
        return { key: filter.key, options };
      });

    const results = await Promise.all(promises);
    const optionsMap: Record<string, Array<{ value: string; label: string }>> = {};

    results.forEach(({ key, options }) => {
      optionsMap[key] = options;
    });

    setDynamicOptions(optionsMap);
  };

  loadDynamicOptions();
}, [config.filters]);
```

### 5.2 Acceso a Datos Anidados

Función helper para `dataPath`:

```typescript
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}
```

### 5.3 Integración con APIs

Los componentes deben ser agnósticos de la fuente de datos. La lógica de carga de datos debe estar en la vista padre o en un hook personalizado:

```typescript
// hooks/useActivityReports.ts
export function useActivityReports(filters: FilterValues) {
  const [data, setData] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const result = await reportsService.getActivityToday(filters);
      setData(result);
      setLoading(false);
    };

    loadData();
  }, [filters]);

  return { data, loading };
}
```

### 5.4 Validación y Errores

- Agregar validación de tipos en runtime (opcional)
- Manejar errores al cargar opciones dinámicas
- Mostrar mensajes de error amigables

### 5.5 Performance

- Memoizar componentes pesados con `React.memo`
- Virtualización para tablas grandes (opcional)
- Debounce en filtros de texto (opcional)

---

## ✅ Checklist de Implementación

### Fase 1: Preparación

- [ ] Crear estructura de directorios
- [ ] Definir tipos e interfaces completos
- [ ] Validar tipos con TypeScript

### Fase 2: Componente FilterPanel

- [ ] Implementar estado interno
- [ ] Implementar renderizado por tipo
- [ ] Implementar layout (row/grid)
- [ ] Implementar carga de opciones dinámicas
- [ ] Implementar handlers
- [ ] Agregar estilos
- [ ] Testing básico

### Fase 3: Componente DataTable

- [ ] Implementar acceso a datos anidados
- [ ] Implementar renderizado por tipo
- [ ] Implementar vista desktop
- [ ] Implementar vista móvil
- [ ] Implementar ordenamiento (opcional)
- [ ] Agregar estilos
- [ ] Testing básico

### Fase 4: Configuraciones

- [ ] Crear configuración de reportes de actividad
- [ ] Crear configuraciones de otras entidades
- [ ] Validar configuraciones

### Fase 5: Integración

- [ ] Refactorizar vista de reportes
- [ ] Exportar componentes
- [ ] Actualizar imports
- [ ] Testing completo

### Fase 6: Documentación

- [ ] Documentar props
- [ ] Crear ejemplos de uso
- [ ] Documentar cómo crear configuraciones

---

## 📚 Recursos y Referencias

- **Diseño actual**: `SOFTWARE_DEVELOPMEN_CLIENT/app/[locale]/(authorized)/app/admin/reports/page.tsx`
- **Tipos actuales**: `SOFTWARE_DEVELOPMEN_CLIENT/packages/api/reports/reports.types.ts`
- **Servicio**: `SOFTWARE_DEVELOPMEN_CLIENT/packages/api/reports/reports.service.ts`
- **Componentes de diseño**: `SOFTWARE_DEVELOPMEN_CLIENT/packages/design-system`

---

**Última actualización**: 2025-01-XX
