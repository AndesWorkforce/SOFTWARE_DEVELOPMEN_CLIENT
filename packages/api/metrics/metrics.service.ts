import { http } from "../../setup/axios.config";

export interface HeartbeatMetrics {
  totalSessions: number;
  activeSessions: number;
  totalEvents: number;
  averageProductivity: number;
  topApplications: ApplicationUsage[];
  productivityTrend: ProductivityData[];
  sessionHistory: SessionData[];
}

export interface ApplicationUsage {
  name: string;
  duration: number;
  percentage: number;
}

export interface ProductivityData {
  date: string;
  productivity: number;
  activeTime: number;
  idleTime: number;
}

export interface SessionData {
  id: string;
  agentId: string;
  startTime: string;
  endTime?: string;
  duration: number;
  eventsCount: number;
  productivity: number;
  status: "active" | "completed";
}

export interface EventData {
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
    [key: string]: unknown;
  };
  timestamp: string;
  created_at: string;
}

export class MetricsService {
  /**
   * Calculate metrics from raw events
   */
  private calculateMetricsFromEvents(events: EventData[]): HeartbeatMetrics {
    if (!events || events.length === 0) {
      return {
        totalSessions: 0,
        activeSessions: 0,
        totalEvents: 0,
        averageProductivity: 0,
        topApplications: [],
        productivityTrend: [],
        sessionHistory: [],
      };
    }

    // Group events by session_id
    const sessionMap = new Map<string, EventData[]>();
    const agentSessionMap = new Map<string, EventData[]>();

    events.forEach((event) => {
      if (event.session_id) {
        if (!sessionMap.has(event.session_id)) {
          sessionMap.set(event.session_id, []);
        }
        sessionMap.get(event.session_id)!.push(event);
      }
      if (event.agent_session_id) {
        if (!agentSessionMap.has(event.agent_session_id)) {
          agentSessionMap.set(event.agent_session_id, []);
        }
        agentSessionMap.get(event.agent_session_id)!.push(event);
      }
    });

    // Calculate total sessions
    const totalSessions = sessionMap.size + agentSessionMap.size;

    // Calculate active sessions (sessions from last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeSessions =
      events.filter((e) => new Date(e.timestamp) > oneDayAgo).length > 0 ? 1 : 0;

    // Calculate total events
    const totalEvents = events.length;

    // Calculate productivity (based on idle time vs active time)
    let totalIdleTime = 0;
    let totalActiveTime = 0;

    events.forEach((event) => {
      const idleTime = event.payload.IdleTime || 0;
      const keyboardInactive = event.payload.Keyboard?.InactiveTime || 0;
      const mouseInactive = event.payload.Mouse?.InactiveTime || 0;

      // If there's idle time, count it
      totalIdleTime += idleTime;

      // Active time is when there's no idle time
      if (idleTime === 0 && (keyboardInactive === 0 || mouseInactive === 0)) {
        totalActiveTime += 1; // Each event represents a time unit
      }
    });

    const totalTime = totalActiveTime + totalIdleTime;
    const averageProductivity = totalTime > 0 ? Math.round((totalActiveTime / totalTime) * 100) : 0;

    // Calculate top applications
    const appUsageMap = new Map<string, number>();

    events.forEach((event) => {
      if (event.payload.ActiveApplications) {
        event.payload.ActiveApplications.forEach((app) => {
          const currentDuration = appUsageMap.get(app.name) || 0;
          appUsageMap.set(app.name, currentDuration + (app.duration || 1));
        });
      }
    });

    const totalAppTime = Array.from(appUsageMap.values()).reduce((a, b) => a + b, 0);
    const topApplications: ApplicationUsage[] = Array.from(appUsageMap.entries())
      .map(([name, duration]) => ({
        name,
        duration,
        percentage: totalAppTime > 0 ? Math.round((duration / totalAppTime) * 100) : 0,
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    // Calculate productivity trend (last 7 days)
    const productivityByDay = new Map<string, { active: number; idle: number }>();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    events.forEach((event) => {
      const date = new Date(event.timestamp).toISOString().split("T")[0];
      if (last7Days.includes(date)) {
        const current = productivityByDay.get(date) || { active: 0, idle: 0 };
        const idleTime = event.payload.IdleTime || 0;

        if (idleTime > 0) {
          current.idle += idleTime;
        } else {
          current.active += 1;
        }

        productivityByDay.set(date, current);
      }
    });

    const productivityTrend: ProductivityData[] = last7Days.map((date) => {
      const data = productivityByDay.get(date) || { active: 0, idle: 0 };
      const total = data.active + data.idle;
      const productivity = total > 0 ? Math.round((data.active / total) * 100) : 0;

      return {
        date,
        productivity,
        activeTime: data.active,
        idleTime: data.idle,
      };
    });

    // Calculate session history
    const sessionHistory: SessionData[] = [];

    sessionMap.forEach((sessionEvents, sessionId) => {
      if (sessionEvents.length === 0) return;

      const sortedEvents = sessionEvents.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

      const startTime = sortedEvents[0].timestamp;
      const endTime = sortedEvents[sortedEvents.length - 1].timestamp;
      const duration = Math.round(
        (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60),
      );

      let sessionActiveTime = 0;
      let sessionIdleTime = 0;

      sessionEvents.forEach((event) => {
        const idleTime = event.payload.IdleTime || 0;
        if (idleTime > 0) {
          sessionIdleTime += idleTime;
        } else {
          sessionActiveTime += 1;
        }
      });

      const sessionTotal = sessionActiveTime + sessionIdleTime;
      const productivity =
        sessionTotal > 0 ? Math.round((sessionActiveTime / sessionTotal) * 100) : 0;

      // Determine if session is active (last event within 30 minutes)
      const lastEventTime = new Date(endTime);
      const now = new Date();
      const minutesSinceLastEvent = (now.getTime() - lastEventTime.getTime()) / (1000 * 60);
      const status: "active" | "completed" = minutesSinceLastEvent < 30 ? "active" : "completed";

      sessionHistory.push({
        id: sessionId,
        agentId: sortedEvents[0].agent_id || "unknown",
        startTime,
        endTime: status === "completed" ? endTime : undefined,
        duration,
        eventsCount: sessionEvents.length,
        productivity,
        status,
      });
    });

    // Sort session history by start time (most recent first)
    sessionHistory.sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    );

    return {
      totalSessions,
      activeSessions,
      totalEvents,
      averageProductivity,
      topApplications,
      productivityTrend,
      sessionHistory: sessionHistory.slice(0, 10), // Return only last 10 sessions
    };
  }

  /**
   * Get all events and calculate metrics
   */
  async getMetrics(contractorId?: string): Promise<HeartbeatMetrics> {
    try {
      const endpoint = contractorId ? `/events/contractor/${contractorId}` : "/events";
      const response = await http.get<EventData[]>(endpoint);
      return this.calculateMetricsFromEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  }

  /**
   * Get events from API
   */
  async getEvents(contractorId?: string): Promise<EventData[]> {
    const endpoint = contractorId ? `/events/contractor/${contractorId}` : "/events";
    const response = await http.get<EventData[]>(endpoint);
    return response.data;
  }

  /**
   * Get events by session
   */
  async getEventsBySession(sessionId: string): Promise<EventData[]> {
    const response = await http.get<EventData[]>(`/events/session/${sessionId}`);
    return response.data;
  }

  /**
   * Get events by agent
   */
  async getEventsByAgent(agentId: string): Promise<EventData[]> {
    const response = await http.get<EventData[]>(`/events/agent/${agentId}`);
    return response.data;
  }

  /**
   * Get events by agent session
   */
  async getEventsByAgentSession(agentSessionId: string): Promise<EventData[]> {
    const response = await http.get<EventData[]>(`/events/agent-session/${agentSessionId}`);
    return response.data;
  }
}

export const metricsService = new MetricsService();
