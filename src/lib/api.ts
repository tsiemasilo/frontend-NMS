import { apiRequest } from "./queryClient";

export interface Agent {
  id: number;
  hostname: string;
  status: string;
  platform?: string;
  lastSeen: string;
  ip?: string;
  username?: string;
  workingHoursDisconnections?: number;
  connectionType?: string;
  adapterName?: string;
  adapterStatus?: string;
  healthScore?: number;
  uptimePercentage?: number;
  avgResponseTime?: number;
}

export interface AgentEvent {
  id: number;
  hostname: string;
  status: string;
  timestamp: string;
  duration?: number;
}

export interface Configuration {
  id: number;
  dashboardIP: string;
  pingIP: string;
  intervalMs: number;
}

export interface DashboardStats {
  totalAgents: number;
  connectedAgents: number;
  disconnectedAgents: number;
  uptimePercentage: number;
}

export const api = {
  // Agent endpoints
  async getAgents(): Promise<Agent[]> {
    const response = await apiRequest('GET', '/api/agents');
    return response.json();
  },

  async getAgent(hostname: string): Promise<{ agent: Agent; events: AgentEvent[]; workingHoursDisconnections: number }> {
    const response = await apiRequest('GET', `/api/agents/${encodeURIComponent(hostname)}`);
    return response.json();
  },

  async getWorkingHoursDisconnections(hostname: string, date?: string): Promise<{ disconnections: number }> {
    const dateParam = date ? `?date=${date}` : '';
    const response = await apiRequest('GET', `/api/agents/${encodeURIComponent(hostname)}/working-hours-disconnections${dateParam}`);
    return response.json();
  },

  async getAgentEvents(hostname: string, date: string): Promise<AgentEvent[]> {
    const response = await apiRequest('GET', `/api/agents/${encodeURIComponent(hostname)}/events?date=${date}`);
    return response.json();
  },

  async exportAgentHistory(hostname: string): Promise<Blob> {
    const response = await apiRequest('GET', `/api/agents/${encodeURIComponent(hostname)}/export`);
    return response.blob();
  },

  // Configuration endpoints
  async getConfiguration(): Promise<Configuration> {
    const response = await apiRequest('GET', '/api/config');
    return response.json();
  },

  async updateConfiguration(config: Partial<Configuration>): Promise<Configuration> {
    const response = await apiRequest('POST', '/api/config', config);
    return response.json();
  },

  // Statistics endpoint
  async getStats(): Promise<DashboardStats> {
    const response = await apiRequest('GET', '/api/stats');
    return response.json();
  },
};
