# Metrics Calculation Documentation

## Overview

This document explains how the frontend calculates metrics from raw events obtained from the `/events` endpoint.

## API Endpoints

### Get All Events

```
GET /events
```

Returns all events from all contractors.

### Get Events by Contractor

```
GET /events/contractor/:contractorId
```

Returns events for a specific contractor.

### Other Endpoints

- `GET /events/session/:sessionId` - Events by session
- `GET /events/agent/:agentId` - Events by agent
- `GET /events/agent-session/:agentSessionId` - Events by agent session

## Event Structure

```typescript
{
  id: string;
  contractor_id: string;
  agent_id?: string;
  session_id?: string;
  agent_session_id?: string;
  payload: {
    Keyboard?: { InactiveTime: number };
    Mouse?: { InactiveTime: number };
    IdleTime?: number;
    ActiveApplications?: Array<{
      name: string;
      duration: number;
      window_title?: string;
    }>;
  };
  timestamp: string;
  created_at: string;
}
```

## Metrics Calculation

### 1. Total Sessions

- Counts unique `session_id` and `agent_session_id` values
- Each unique ID represents one session

### 2. Active Sessions

- Sessions with events in the last 24 hours
- Filters events where `timestamp > (now - 24 hours)`

### 3. Total Events

- Simple count of all events in the array
- `events.length`

### 4. Average Productivity

**Formula**: `(activeTime / totalTime) * 100`

**Logic**:

- `idleTime` = sum of all `payload.IdleTime` values
- `activeTime` = count of events where:
  - `IdleTime === 0` AND
  - (`Keyboard.InactiveTime === 0` OR `Mouse.InactiveTime === 0`)
- Each event represents 1 time unit

### 5. Top Applications

**Source**: `payload.ActiveApplications`

**Process**:

1. Aggregate duration by application name
2. Calculate percentage: `(appDuration / totalAppTime) * 100`
3. Sort by duration (descending)
4. Return top 5 applications

### 6. Productivity Trend (Last 7 Days)

**Grouping**: By date (YYYY-MM-DD format)

**For each day**:

- `active` = count of events with `IdleTime === 0`
- `idle` = sum of `IdleTime` values
- `productivity` = `(active / (active + idle)) * 100`

**Output**: Array of 7 days with date, productivity, activeTime, idleTime

### 7. Session History

**Grouping**: By `session_id`

**For each session**:

- `startTime` = timestamp of first event
- `endTime` = timestamp of last event
- `duration` = `(endTime - startTime)` in minutes
- `eventsCount` = number of events in session
- `productivity` = calculated same as average productivity
- `status` = "active" if last event within 30 minutes, otherwise "completed"

**Output**: Top 10 most recent sessions

## Example Calculation

### Input: 3 Events

```json
[
  {
    "id": "1",
    "session_id": "session-1",
    "payload": {
      "IdleTime": 0,
      "Keyboard": { "InactiveTime": 0 },
      "Mouse": { "InactiveTime": 0 },
      "ActiveApplications": [
        { "name": "VS Code", "duration": 60 },
        { "name": "Chrome", "duration": 30 }
      ]
    },
    "timestamp": "2025-11-05T10:00:00Z"
  },
  {
    "id": "2",
    "session_id": "session-1",
    "payload": {
      "IdleTime": 5,
      "Keyboard": { "InactiveTime": 5 },
      "Mouse": { "InactiveTime": 5 }
    },
    "timestamp": "2025-11-05T10:05:00Z"
  },
  {
    "id": "3",
    "session_id": "session-1",
    "payload": {
      "IdleTime": 0,
      "Keyboard": { "InactiveTime": 0 },
      "ActiveApplications": [{ "name": "VS Code", "duration": 45 }]
    },
    "timestamp": "2025-11-05T10:10:00Z"
  }
]
```

### Output Metrics

```typescript
{
  totalSessions: 1,           // 1 unique session_id
  activeSessions: 1,          // Events within last 24h
  totalEvents: 3,             // 3 events
  averageProductivity: 67,    // 2 active / 3 total = 67%
  topApplications: [
    { name: "VS Code", duration: 105, percentage: 78 },
    { name: "Chrome", duration: 30, percentage: 22 }
  ],
  productivityTrend: [...],   // 7 days of data
  sessionHistory: [
    {
      id: "session-1",
      startTime: "2025-11-05T10:00:00Z",
      endTime: "2025-11-05T10:10:00Z",
      duration: 10,             // minutes
      eventsCount: 3,
      productivity: 67,
      status: "active"          // last event < 30 min ago
    }
  ]
}
```

## Frontend Implementation

### Location

`packages/api/metrics/metrics.service.ts`

### Key Method

```typescript
async getMetrics(contractorId?: string): Promise<HeartbeatMetrics> {
  const endpoint = contractorId
    ? `/events/contractor/${contractorId}`
    : "/events";

  const response = await http.get<EventData[]>(endpoint);
  return this.calculateMetricsFromEvents(response.data);
}
```

### Usage in Dashboard

```typescript
// app/[locale]/(authorized)/app/client/page.tsx
const loadMetrics = async () => {
  const data = await metricsService.getMetrics();
  setMetrics(data);
};
```

## Performance Considerations

### Current Implementation

- All calculations happen in the browser
- Processes all events on each request
- Suitable for datasets up to ~10,000 events

### Future Optimizations

1. **Server-side calculation**: Move calculations to backend
2. **Caching**: Store calculated metrics with TTL
3. **Pagination**: Load only recent events
4. **Incremental updates**: Calculate only new data
5. **WebWorkers**: Move heavy calculations to background thread

## Testing

### With No Data

- Dashboard shows empty state
- All metrics = 0
- No errors thrown

### With Sample Data

1. Create test events in database
2. Verify calculations match expected values
3. Check edge cases (single event, all idle, etc.)

## Error Handling

### Network Errors

```typescript
if (err.code === "ERR_NETWORK") {
  // Show: "Cannot connect to server"
  setMetrics({
    /* empty structure */
  });
}
```

### No Data (404)

```typescript
if (err.response?.status === 404) {
  // Show: "No data available yet"
  setMetrics({
    /* empty structure */
  });
}
```

### Other Errors

```typescript
else {
  // Show: "Error loading metrics"
  setError(err.message);
}
```
