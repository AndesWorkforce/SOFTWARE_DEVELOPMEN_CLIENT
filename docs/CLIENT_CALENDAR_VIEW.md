# Client Calendar View Components

This document describes the new reusable components created for the client calendar view feature.

## Overview

The client calendar view allows visualizers to see contractor absences (licenses, vacations, health issues) for a specific client. The implementation follows a mobile-first approach and uses componentized, reusable components.

## Components

### 1. ClientCalendarStats

Displays statistics cards (capacity, absences, active contractors).

**File**: `packages/design-system/components/ClientCalendarStats.tsx`

**Props**:

```typescript
interface CalendarStat {
  label: string;
  value: string | number;
  color?: string; // Optional custom color
}

interface ClientCalendarStatsProps {
  stats: CalendarStat[];
  className?: string;
}
```

**Usage**:

```tsx
const stats: CalendarStat[] = [
  { label: "Today Capacity", value: "70%" },
  { label: "Today Absences", value: "3" },
  { label: "Active Contractors", value: "7/10" },
];

<ClientCalendarStats stats={stats} />;
```

---

### 2. TeamFilters

Horizontal scrollable team filter buttons with arrows.

**File**: `packages/design-system/components/TeamFilters.tsx`

**Props**:

```typescript
interface TeamFilterOption {
  id: string;
  label: string;
}

interface TeamFiltersProps {
  teams: TeamFilterOption[];
  selectedTeamId: string | null;
  onTeamChange: (teamId: string | null) => void;
  allTeamsLabel?: string;
  className?: string;
}
```

**Features**:

- Auto-detects overflow and shows scroll arrows
- Smooth scroll behavior
- Responsive design (mobile-first)
- Hidden scrollbar with `.no-scrollbar` CSS class

**Usage**:

```tsx
const teams = [
  { id: "1", label: "Team DevOps" },
  { id: "2", label: "Team Development" },
];

<TeamFilters
  teams={teams}
  selectedTeamId={selectedTeamId}
  onTeamChange={setSelectedTeamId}
  allTeamsLabel="All Teams"
/>;
```

---

### 3. AbsenceLegend

Shows legend for absence types with icons and colors.

**File**: `packages/design-system/components/AbsenceLegend.tsx`

**Props**:

```typescript
export type AbsenceType = "license" | "vacation" | "health";

interface AbsenceLegendItem {
  type: AbsenceType;
  label: string;
  color: string;
}

interface AbsenceLegendProps {
  items?: AbsenceLegendItem[]; // Optional, uses defaults if not provided
  className?: string;
}
```

**Default Items**:

- License: Blue (#1e40af)
- Vacation: Green (#166534)
- Health: Red (#991b1b)

**Usage**:

```tsx
<AbsenceLegend />
```

---

### 4. ClientCalendarGrid

Calendar grid showing contractor absences per day.

**File**: `packages/design-system/components/ClientCalendarGrid.tsx`

**Props**:

```typescript
interface AbsenceEvent {
  id: string;
  date: Date;
  contractorName: string;
  contractorRole: string;
  type: "license" | "vacation" | "health";
}

interface ClientCalendarGridProps {
  currentDate: Date;
  absences: AbsenceEvent[];
  locale?: string;
  onDateClick?: (date: Date) => void;
  onMoreAbsencesClick?: (date: Date, absences: AbsenceEvent[]) => void;
  className?: string;
}
```

**Features**:

- Shows up to 2 absences per day
- "+ X more absences" button when there are more than 2
- Past dates have gray background
- Today has blue background
- Responsive design (mobile and desktop)

**Usage**:

```tsx
<ClientCalendarGrid
  currentDate={new Date()}
  absences={absences}
  locale="en-US"
  onMoreAbsencesClick={(date, absences) => {
    setModalDate(date);
    setModalAbsences(absences);
    setShowModal(true);
  }}
/>
```

---

### 5. AbsenceDetailModal

Modal to show all absences for a specific date.

**File**: `packages/design-system/components/AbsenceDetailModal.tsx`

**Props**:

```typescript
interface AbsenceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  absences: AbsenceEvent[];
  locale?: string;
}
```

**Usage**:

```tsx
<AbsenceDetailModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  date={modalDate}
  absences={modalAbsences}
  locale="en-US"
/>
```

---

## Page Implementation

**File**: `app/[locale]/(authorized)/app/visualizer/clients/[id]/calendar/page.tsx`

The calendar page combines all the components above:

```tsx
import {
  ClientCalendarStats,
  TeamFilters,
  AbsenceLegend,
  ClientCalendarGrid,
  AbsenceDetailModal,
} from "@/packages/design-system";
```

### Features:

- Loads client data from API
- Month navigation with chevron buttons
- Team filtering
- Absence legend
- Modal for viewing all absences on a day
- Mobile-first responsive design
- Back button to clients list

---

## Styling

All components use:

- Tailwind CSS for styling
- Mobile-first approach
- Responsive breakpoints (md:)
- Custom colors matching Figma design:
  - Primary: `#0097b2`
  - License: `#1e40af` (blue)
  - Vacation: `#166534` (green)
  - Health: `#991b1b` (red)

### Custom CSS

Added to `app/globals.css`:

```css
/* Ocultar scrollbar pero mantener funcionalidad */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

---

## Translations

Translations are in `packages/internationalization/dictionaries/`:

**en.json**:

```json
{
  "calendar": {
    "stats": {
      "todayCapacity": "Today Capacity",
      "todayAbsences": "Today Absences",
      "activeContractors": "Active Contractors"
    },
    "filters": {
      "allTeams": "All Teams"
    }
  }
}
```

**es.json**:

```json
{
  "calendar": {
    "stats": {
      "todayCapacity": "Capacidad Hoy",
      "todayAbsences": "Ausencias Hoy",
      "activeContractors": "Contratistas Activos"
    },
    "filters": {
      "allTeams": "Todos los Equipos"
    }
  }
}
```

---

## Navigation

Updated in `clients/page.tsx`:

```tsx
const handleViewCalendar = useCallback(
  (client: Client) => {
    const path = `/${locale}/app/visualizer/clients/${client.id}/calendar`;
    router.push(path);
  },
  [locale, router],
);
```

---

## TODO / Future Improvements

- [ ] Connect to real API for absence data
- [ ] Implement actual capacity and stats calculation
- [ ] Add filters by absence type
- [ ] Add date range selection
- [ ] Export calendar to PDF
- [ ] Add notifications for upcoming absences
- [ ] Implement team filtering logic with real data

---

## Design Reference

Figma designs:

- Desktop: https://www.figma.com/design/PE5dZumyXbPLhjZVqj11Ix/Transformacion-Digital?node-id=1848-996
- Mobile: https://www.figma.com/design/PE5dZumyXbPLhjZVqj11Ix/Transformacion-Digital?node-id=1881-6283
