# Endpoints API para Calendar View

## Resumen de Endpoints Disponibles

### 1. **Contractors Service**

#### Obtener contratistas por cliente

```typescript
contractorsService.getByClientId(clientId: string): Promise<Contractor[]>
```

- **Endpoint**: `GET /contractors/client/:clientId`
- **Uso**: Obtener todos los contratistas de un cliente específico

#### Obtener contratista con días libres

```typescript
contractorsService.getWithDayOffs(id: string): Promise<ContractorWithDayOffs>
```

- **Endpoint**: `GET /contractors/:id/with-day-offs`
- **Uso**: Obtener un contratista específico con todos sus días libres
- **Retorna**: Contratista con array `contractor_day_offs`

#### Obtener días libres de un contratista

```typescript
contractorsService.getDayOffs(contractorId: string): Promise<ContractorDayOff[]>
```

- **Endpoint**: `GET /contractors/:contractorId/day-offs`
- **Uso**: Obtener solo los días libres de un contratista

#### Obtener contratistas por equipo

```typescript
contractorsService.getByTeamId(teamId: string): Promise<Contractor[]>
```

- **Endpoint**: `GET /contractors/team/:teamId`
- **Uso**: Filtrar contratistas por equipo

#### Obtener todos los contratistas con filtros

```typescript
contractorsService.getAll(filters?: ContractorFilters): Promise<Contractor[]>
```

- **Endpoint**: `GET /contractors`
- **Query params**: name, country, client_id, team_id, job_position, isActive
- **Uso**: Obtener contratistas con filtros opcionales

---

### 2. **Teams Service**

#### Obtener todos los equipos

```typescript
teamsService.getAll(): Promise<Team[]>
```

- **Endpoint**: `GET /teams`
- **Uso**: Obtener lista de todos los equipos

#### Obtener equipo por ID

```typescript
teamsService.getById(id: string): Promise<Team>
```

- **Endpoint**: `GET /teams/:id`
- **Uso**: Obtener información de un equipo específico

---

### 3. **Clients Service**

#### Obtener cliente por ID

```typescript
clientsService.getById(id: string): Promise<Client>
```

- **Endpoint**: `GET /clients/:id`
- **Uso**: Obtener información del cliente

---

## Tipos de Datos

### ContractorDayOff

```typescript
interface ContractorDayOff {
  id: string;
  contractor_id: string;
  date: string; // ISO string
  reason: string; // Tipo de ausencia: "license" | "vacation" | "health"
  created_at: string;
}
```

### Contractor

```typescript
interface Contractor {
  id: string;
  name: string;
  email: string | null;
  job_position: string;
  country: string | null;
  client_id: string;
  team_id: string | null;
  activation_key: string | null;
  work_schedule_start: string | null;
  work_schedule_end: string | null;
  lunch_start: string | null;
  lunch_end: string | null;
  created_at: string;
  updated_at: string;
  isActive?: boolean;
  client_name?: string;
  team_name?: string;
}
```

### Team

```typescript
interface Team {
  id: string;
  name: string;
  client_id: string;
  created_at?: string;
  updated_at?: string;
}
```

---

## Estrategia de Implementación para Calendar

### Opción 1: Por Cliente (Recomendado para Calendar View)

```typescript
async function loadCalendarData(clientId: string, year: number, month: number) {
  // 1. Obtener contratistas del cliente
  const contractors = await contractorsService.getByClientId(clientId);

  // 2. Para cada contratista, obtener sus días libres
  const contractorsWithDayOffs = await Promise.all(
    contractors.map((contractor) => contractorsService.getWithDayOffs(contractor.id)),
  );

  // 3. Filtrar días libres del mes actual
  const absences = contractorsWithDayOffs.flatMap((contractor) =>
    contractor.contractor_day_offs
      .filter((dayOff) => {
        const dayOffDate = new Date(dayOff.date);
        return dayOffDate.getFullYear() === year && dayOffDate.getMonth() === month;
      })
      .map((dayOff) => ({
        id: dayOff.id,
        date: new Date(dayOff.date),
        contractorName: contractor.name,
        contractorRole: contractor.job_position,
        type: dayOff.reason as "license" | "vacation" | "health",
      })),
  );

  return { contractors, absences };
}
```

### Opción 2: Endpoint Agregado (Requiere Backend)

**RECOMENDACIÓN**: Crear un nuevo endpoint en el backend para optimizar:

```
GET /clients/:clientId/calendar?year=2026&month=2
```

**Respuesta esperada**:

```typescript
{
  contractors: Contractor[],
  absences: {
    date: string,
    contractor_id: string,
    contractor_name: string,
    contractor_role: string,
    reason: "license" | "vacation" | "health"
  }[],
  stats: {
    totalContractors: number,
    activeContractors: number,
    todayAbsences: number,
    todayCapacity: number, // Porcentaje
  }
}
```

**Ventajas**:

- ✅ Una sola llamada al API
- ✅ Backend puede optimizar queries
- ✅ Stats calculados en backend
- ✅ Reduce tráfico de red
- ✅ Filtrado por mes/año en backend

---

## Endpoints Necesarios (No Disponibles)

### 1. Estadísticas del Cliente

❌ **No existe**: `GET /clients/:clientId/stats`

**Necesario para**:

- Capacidad del día
- Ausencias del día
- Contratistas activos/total

**Workaround actual**: Calcular en frontend

---

### 2. Ausencias por Cliente y Rango de Fechas

❌ **No existe**: `GET /clients/:clientId/absences?startDate=...&endDate=...`

**Necesario para**:

- Cargar solo ausencias del mes visible
- Evitar traer todos los day-offs de todos los contratistas

**Workaround actual**: Usar `getByClientId` + múltiples `getWithDayOffs`

---

### 3. Equipos por Cliente

❌ **No existe**: `GET /clients/:clientId/teams`

**Workaround actual**:

```typescript
const allTeams = await teamsService.getAll();
const clientTeams = allTeams.filter((team) => team.client_id === clientId);
```

---

## Recomendaciones

### Corto Plazo (Usar Endpoints Actuales)

1. Usar `contractorsService.getByClientId()` para obtener contratistas
2. Usar `contractorsService.getWithDayOffs()` para cada contratista
3. Filtrar y mapear en frontend
4. Calcular stats en frontend

### Mediano Plazo (Optimización Backend)

1. Crear endpoint `/clients/:clientId/calendar`
2. Crear endpoint `/clients/:clientId/teams`
3. Agregar parámetros de fecha a day-offs queries

### Largo Plazo (Mejoras)

1. Agregar paginación a calendarios
2. Cache de datos de calendario
3. WebSockets para actualizaciones en tiempo real
4. Exportar calendario a PDF/Excel

---

## Ejemplo de Implementación

```typescript
// packages/api/clients/clients.service.ts

/**
 * Obtiene datos del calendario para un cliente
 * @param clientId ID del cliente
 * @param year Año
 * @param month Mes (0-11)
 */
async getCalendarData(
  clientId: string,
  year: number,
  month: number
): Promise<{
  contractors: Contractor[];
  absences: AbsenceEvent[];
  stats: {
    totalContractors: number;
    activeContractors: number;
    todayAbsences: number;
    todayCapacity: number;
  };
}> {
  // Implementación usando endpoints actuales
  const contractors = await contractorsService.getByClientId(clientId);

  const contractorsWithDayOffs = await Promise.all(
    contractors.map(c => contractorsService.getWithDayOffs(c.id))
  );

  // Filtrar por mes
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const absences = contractorsWithDayOffs.flatMap(contractor =>
    contractor.contractor_day_offs
      .filter(dayOff => {
        const date = new Date(dayOff.date);
        return date >= startDate && date <= endDate;
      })
      .map(dayOff => ({
        id: dayOff.id,
        date: new Date(dayOff.date),
        contractorName: contractor.name,
        contractorRole: contractor.job_position,
        type: dayOff.reason as AbsenceType,
      }))
  );

  // Calcular stats
  const today = new Date();
  const todayAbsences = absences.filter(
    a => a.date.toDateString() === today.toDateString()
  ).length;

  const activeContractors = contractors.filter(c => c.isActive).length;
  const todayCapacity = contractors.length > 0
    ? Math.round(((activeContractors - todayAbsences) / contractors.length) * 100)
    : 0;

  return {
    contractors,
    absences,
    stats: {
      totalContractors: contractors.length,
      activeContractors,
      todayAbsences,
      todayCapacity,
    },
  };
}
```

---

## Próximos Pasos

1. ✅ Documentar endpoints existentes
2. ⏳ Implementar método `getCalendarData` en `ClientsService`
3. ⏳ Integrar método en página de calendario
4. ⏳ Proponer mejoras de backend al equipo
5. ⏳ Crear PR con nueva funcionalidad
