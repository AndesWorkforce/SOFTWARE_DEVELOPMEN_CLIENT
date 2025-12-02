# Reports Feature - Implementation Guide

## 📋 Overview

This document describes the Reports feature implementation for the SOFTWARE_DEVELOPMENT_CLIENT application. The Reports page allows Admins and Super Admins to view and filter user activity data.

## 🏗️ Architecture

### Created Files

```
SOFTWARE_DEVELOPMEN_CLIENT/
├── packages/
│   ├── api/
│   │   └── reports/
│   │       ├── reports.types.ts      ✅ Type definitions
│   │       └── reports.service.ts    ✅ Service with mock data
│   │
│   └── design-system/
│       └── components/
│           ├── DateRangePicker.tsx   ✅ Date range selector
│           ├── Accordion.tsx         ✅ Accordion component
│           └── ActivityCard.tsx      ✅ User activity card
│
└── app/[locale]/(authorized)/app/
    ├── admin/
    │   └── reports/
    │       └── page.tsx              ✅ Admin reports page
    └── super-admin/
        └── reports/
            └── page.tsx              ✅ Super Admin reports page
```

## 🎨 Components

### 1. DateRangePicker

A date range selector with calendar icon.

**Props:**

```typescript
interface DateRangePickerProps {
  label?: string;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  error?: string;
  className?: string;
}
```

### 2. Accordion & AccordionItem

Generic accordion component for expandable/collapsible content.

**Props:**

```typescript
interface AccordionItemProps {
  title: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  className?: string;
}
```

### 3. ActivityCard

User activity card with expandable details.

**Props:**

```typescript
interface ActivityCardProps {
  activity: UserActivity;
  defaultExpanded?: boolean;
}
```

**Features:**

- Collapsible card showing user name and job position
- When expanded, shows:
  - User name
  - Job position
  - Team
  - Country
  - Time worked
  - Activity percentage (color-coded)
  - Link to activity details

## 📊 Data Types

### ReportFilters

```typescript
interface ReportFilters {
  dateRange?: { start: string; end: string };
  userId?: string;
  country?: string;
  clientId?: string;
  teamId?: string;
  jobPosition?: string;
}
```

### UserActivity

```typescript
interface UserActivity {
  id: string;
  user: { id: string; name: string; email: string };
  jobPosition: string;
  team: { id: string; name: string };
  country: string;
  timeWorked: string; // "HH:MM:SS"
  activityPercentage: number; // 0-100
  date: string; // ISO date
  details: ActivityDetail[];
}
```

## 🔧 Reports Service

### Methods

1. **getActivityToday(filters?: ReportFilters): Promise<UserActivity[]>**
   - Fetches activity data with optional filters
   - Currently uses mock data

2. **getSummary(filters?: ReportFilters): Promise<ReportSummary>**
   - Get summary statistics (not yet implemented in UI)

3. **getFilterOptions(): Promise<FilterOptions>**
   - Get available filter options (users, countries, clients, teams, positions)

4. **getMockActivityData(): UserActivity[]**
   - Returns mock data for development

5. **getMockFilterOptions(): FilterOptions**
   - Returns mock filter options

## 🎯 Features

### ✅ Implemented

- ✅ Collapsible filter panel
- ✅ Date range picker
- ✅ User, Country, Client, Team, Job Position filters
- ✅ Clear filters button
- ✅ Apply filters button (loads data)
- ✅ Activity cards with expand/collapse
- ✅ Activity percentage color coding:
  - Green (>= 70%)
  - Yellow (40-69%)
  - Red (< 40%)
- ✅ Loading states
- ✅ Empty state when no data
- ✅ First card expanded by default
- ✅ Mock data for development
- ✅ Responsive design
- ✅ Dark mode support

### 🚧 Pending

- 🚧 Export PDF functionality (button present but not functional)
- 🚧 Real API integration (currently using mock data)
- 🚧 Activity detail view (link present but not functional)
- 🚧 Real-time updates
- 🚧 Pagination for large datasets
- 🚧 Internationalization (translations not yet added)

## 🔗 Backend Integration

### Required Endpoints

When integrating with real backend, these endpoints are expected:

```typescript
GET /reports/activity-today
  Query: startDate, endDate, userId, country, clientId, teamId, jobPosition
  Response: UserActivity[]

GET /reports/summary
  Query: startDate, endDate, userId, country, clientId, teamId, jobPosition
  Response: ReportSummary

GET /reports/filters/options
  Response: FilterOptions

GET /reports/activity-detail/:userId
  Query: date
  Response: UserActivity (with detailed ActivityDetail[])
```

### How to Switch to Real API

In both pages (`admin/reports/page.tsx` and `super-admin/reports/page.tsx`), replace the mock data loading:

```typescript
// Current (mock data)
const mockActivities = reportsService.getMockActivityData();
const mockOptions = reportsService.getMockFilterOptions();
setActivities(mockActivities);
setFilterOptions(mockOptions);

// Replace with real API calls
const [activitiesData, optionsData] = await Promise.all([
  reportsService.getActivityToday(filters),
  reportsService.getFilterOptions(),
]);
setActivities(activitiesData);
setFilterOptions(optionsData);
```

## 🚀 Usage

### Access the Reports Page

**Admin:**

```
http://localhost:3000/en/app/admin/reports
http://localhost:3000/es/app/admin/reports
```

**Super Admin:**

```
http://localhost:3000/en/app/super-admin/reports
http://localhost:3000/es/app/super-admin/reports
```

### Filter Activities

1. Click "Apply filters" to expand the filter panel
2. Select desired filters:
   - Date range
   - User
   - Country
   - Client
   - Team
   - Job Position
3. Click "Apply" to load filtered data
4. Click "Clean filters" to reset all filters

### View Activity Details

1. Click on any activity card to expand it
2. View detailed information:
   - User, Job Position, Team, Country
   - Time worked today
   - Activity percentage
3. Click "Activity Detail: View" to see more details (not yet functional)

## 🎨 Design

The design follows the provided mockup with:

- Clean, modern interface
- Collapsible filter panel with hamburger icon
- Date range picker with calendar icon
- Cyan "Export PDF" button (functional later)
- Red "Clean filters" button
- Activity cards with expand/collapse functionality
- Color-coded activity percentages
- Responsive layout

## 📝 Notes

- The page currently uses **mock data** for development
- All TypeScript types are properly defined
- Components are reusable and exported from design-system
- Dark mode is fully supported
- The Export PDF button is present but not functional yet
- Backend integration is prepared but not yet connected

## 🔜 Next Steps

1. Implement Export PDF functionality
2. Connect to real backend API
3. Add internationalization (i18n) support
4. Implement activity detail view
5. Add pagination for large datasets
6. Add real-time updates
7. Add unit tests
8. Add loading skeletons instead of spinner
