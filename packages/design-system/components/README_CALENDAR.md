# Calendar Component

## Descripción

El componente `Calendar` es un calendario interactivo y reutilizable con soporte para eventos, navegación de meses y personalización completa.

## Características

- ✅ Navegación entre meses
- ✅ Selección de fechas
- ✅ Visualización de eventos
- ✅ Indicadores visuales de eventos
- ✅ Soporte para múltiples idiomas
- ✅ Restricciones de fecha (min/max)
- ✅ Diseño responsive
- ✅ Personalización completa de estilos
- ✅ Accesibilidad

## Uso Básico

```tsx
import { Calendar, type CalendarEvent } from "@/packages/design-system";

const events: CalendarEvent[] = [
  {
    id: "1",
    date: new Date(2026, 0, 5),
    title: "Meeting",
    description: "Team sync",
    color: "#0097B2",
    type: "meeting",
  },
];

function MyComponent() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <Calendar
      events={events}
      selectedDate={selectedDate}
      onDateSelect={setSelectedDate}
      onEventClick={(event) => console.log(event)}
    />
  );
}
```

## Props

### CalendarProps

| Prop                  | Tipo                             | Default   | Descripción                       |
| --------------------- | -------------------------------- | --------- | --------------------------------- |
| `events`              | `CalendarEvent[]`                | `[]`      | Array de eventos a mostrar        |
| `selectedDate`        | `Date`                           | -         | Fecha seleccionada actual         |
| `onDateSelect`        | `(date: Date) => void`           | -         | Callback al seleccionar fecha     |
| `onEventClick`        | `(event: CalendarEvent) => void` | -         | Callback al hacer click en evento |
| `minDate`             | `Date`                           | -         | Fecha mínima seleccionable        |
| `maxDate`             | `Date`                           | -         | Fecha máxima seleccionable        |
| `locale`              | `string`                         | `"en-US"` | Locale para formateo              |
| `className`           | `string`                         | `""`      | Clases CSS personalizadas         |
| `style`               | `React.CSSProperties`            | -         | Estilos inline                    |
| `showNavigation`      | `boolean`                        | `true`    | Mostrar botones de navegación     |
| `showEventIndicators` | `boolean`                        | `true`    | Mostrar indicadores de eventos    |
| `allowDateSelection`  | `boolean`                        | `true`    | Permitir selección de fecha       |

### CalendarEvent

```typescript
interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  description?: string;
  color?: string; // Color hex, default: "#0097B2"
  type?: "work" | "meeting" | "holiday" | "other";
}
```

## Ejemplos de Uso

### Calendar con Modal

```tsx
import { CalendarModal } from "@/packages/design-system";

function MyModalComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CalendarModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="My Calendar"
      calendarProps={{
        events: events,
        selectedDate: selectedDate,
        onDateSelect: handleDateSelect,
      }}
    />
  );
}
```

### Calendar con Restricciones de Fecha

```tsx
<Calendar
  events={events}
  selectedDate={selectedDate}
  onDateSelect={setSelectedDate}
  minDate={new Date(2026, 0, 1)}
  maxDate={new Date(2026, 11, 31)}
/>
```

### Calendar con Locale Personalizado

```tsx
<Calendar
  events={events}
  selectedDate={selectedDate}
  onDateSelect={setSelectedDate}
  locale="es-ES"
/>
```

### Calendar sin Navegación

```tsx
<Calendar
  events={events}
  selectedDate={selectedDate}
  onDateSelect={setSelectedDate}
  showNavigation={false}
/>
```

## Styling

El componente usa clases de Tailwind CSS y puede personalizarse mediante:

1. **className prop**: Agregar clases adicionales al contenedor
2. **style prop**: Estilos inline para el contenedor
3. **Clases internas**: Sobrescribir las clases predeterminadas

### Clases CSS Disponibles

- `.calendar-container`: Contenedor principal
- `.calendar-header`: Header con navegación
- `.calendar-weekdays`: Fila de días de la semana
- `.calendar-days`: Grid de días del mes
- `.calendar-day`: Botón de día individual
- `.calendar-day-empty`: Celda vacía
- `.calendar-events`: Lista de eventos

## Integración con Next.js Parallel Routes

El componente se puede usar con intercepting routes de Next.js:

```
app/
  contractors/
    @modal/
      (.)calendar/
        [id]/
          page.tsx
    calendar/
      [id]/
        page.tsx
```

## Accesibilidad

- ✅ Navegación por teclado (Tab, Enter, Escape)
- ✅ Aria labels
- ✅ Roles semánticos
- ✅ Estados visuales claros

## Notas de Implementación

- El calendario usa `Date` nativo de JavaScript
- Los eventos se filtran por fecha exacta (día/mes/año)
- El primer día de la semana es domingo (0) por defecto
- La navegación persiste el día seleccionado cuando es posible

## TODO

- [ ] Conectar con API para cargar eventos reales
- [ ] Agregar vista semanal
- [ ] Agregar vista de agenda
- [ ] Soporte para eventos de múltiples días
- [ ] Drag & drop de eventos
- [ ] Crear/editar eventos inline
