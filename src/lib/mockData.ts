// Mock data for standalone frontend deployment
export const mockAgents = [
  {
    id: 1,
    hostname: "OFFICE-PC-001",
    status: "connected",
    lastSeen: new Date(),
    platform: "Windows_NT 10.0.19045",
    ip: "192.168.1.101",
    userInfo: "John Smith",
    connectionType: "lan",
    adapterName: "Realtek PCIe GbE Family Controller",
    adapterStatus: "connected",
    allAdapters: [
      {
        name: "Realtek PCIe GbE Family Controller",
        connectionId: "Ethernet",
        type: "lan",
        status: "connected"
      }
    ],
    connectivityDetails: {
      router: true,
      target: true,
      internet: true
    }
  },
  {
    id: 2,
    hostname: "OFFICE-PC-002",
    status: "disconnected",
    lastSeen: new Date(Date.now() - 5 * 60 * 1000),
    platform: "Windows_NT 10.0.19045",
    ip: "192.168.1.102",
    userInfo: "Jane Doe",
    connectionType: "unknown",
    adapterName: "No LAN Adapter",
    adapterStatus: "disconnected",
    allAdapters: [],
    connectivityDetails: {
      router: false,
      target: false,
      internet: true
    }
  },
  {
    id: 3,
    hostname: "OFFICE-PC-003",
    status: "connected",
    lastSeen: new Date(),
    platform: "Windows_NT 10.0.19045",
    ip: "192.168.1.103",
    userInfo: "Mike Johnson",
    connectionType: "lan",
    adapterName: "Intel Ethernet Connection",
    adapterStatus: "connected",
    allAdapters: [
      {
        name: "Intel Ethernet Connection",
        connectionId: "Local Area Connection",
        type: "lan",
        status: "connected"
      }
    ],
    connectivityDetails: {
      router: true,
      target: true,
      internet: true
    }
  }
];

export const mockStats = {
  totalAgents: 3,
  connectedAgents: 2,
  disconnectedAgents: 1,
  uptimePercentage: 66.67
};

export const mockDatabaseStats = {
  totalAgents: 3,
  totalEvents: 156,
  tables: ['agents', 'agent_events'],
  status: 'connected'
};

export const mockAgentEvents = [
  {
    id: 1,
    hostname: "OFFICE-PC-001",
    status: "connected",
    timestamp: new Date().toISOString(),
    platform: "Windows_NT 10.0.19045",
    ip: "192.168.1.101",
    connectionType: "lan",
    adapterName: "Realtek PCIe GbE Family Controller"
  },
  {
    id: 2,
    hostname: "OFFICE-PC-002",
    status: "disconnected",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    platform: "Windows_NT 10.0.19045",
    ip: "192.168.1.102",
    connectionType: "unknown",
    adapterName: "No LAN Adapter"
  }
];

export const mockWorkingHoursDisconnections = {
  disconnections: 3
};
export const mockAgentDetails = {
  agent: {
    id: 1,
    hostname: "OFFICE-PC-001",
    status: "connected",
    lastSeen: new Date(),
    platform: "Windows_NT 10.0.19045",
    ip: "192.168.1.101",
    userInfo: "John Smith",
    connectionType: "lan",
    adapterName: "Realtek PCIe GbE Family Controller",
    adapterStatus: "connected"
  },
  events: [
    {
      id: 1,
      hostname: "OFFICE-PC-001",
      status: "connected",
      timestamp: new Date().toISOString(),
      platform: "Windows_NT 10.0.19045",
      ip: "192.168.1.101",
      userInfo: "John Smith",
      connectionType: "lan",
      adapterName: "Realtek PCIe GbE Family Controller",
      adapterStatus: "connected",
      allAdapters: [
        {
          name: "Realtek PCIe GbE Family Controller",
          connectionId: "Ethernet",
          type: "lan",
          status: "connected"
        }
      ],
      connectivityDetails: {
        router: true,
        target: true,
        internet: true
      }
    },
    {
      id: 2,
      hostname: "OFFICE-PC-001",
      status: "disconnected",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      platform: "Windows_NT 10.0.19045",
      ip: "192.168.1.101",
      userInfo: "John Smith",
      connectionType: "unknown",
      adapterName: "No LAN Adapter",
      adapterStatus: "disconnected",
      allAdapters: [],
      connectivityDetails: {
        router: false,
        target: false,
        internet: true
      }
    }
  ]
};

export const mockTimelineEvents = [
  {
    id: 1,
    hostname: "OFFICE-PC-001",
    status: "connected",
    timestamp: new Date().toISOString(),
    duration: 1800,
    connectionType: "lan",
    adapterName: "Realtek PCIe GbE Family Controller",
    timeAgo: "Just now",
    isStatusChange: true
  },
  {
    id: 2,
    hostname: "OFFICE-PC-002",
    status: "disconnected",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    duration: 300,
    connectionType: "unknown",
    adapterName: "No LAN Adapter",
    timeAgo: "5m ago",
    isStatusChange: true
  },
  {
    id: 3,
    hostname: "OFFICE-PC-003",
    status: "connected",
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    duration: 600,
    connectionType: "lan",
    adapterName: "Intel Ethernet Controller",
    timeAgo: "10m ago",
    isStatusChange: false
  }
];

export const mockTrendData = [
  { date: "2025-01-04", uptime: 98.5, disconnects: 2, avgResponseTime: 45, stability: 95 },
  { date: "2025-01-05", uptime: 95.2, disconnects: 5, avgResponseTime: 52, stability: 88 },
  { date: "2025-01-06", uptime: 99.1, disconnects: 1, avgResponseTime: 38, stability: 98 },
  { date: "2025-01-07", uptime: 97.8, disconnects: 3, avgResponseTime: 41, stability: 92 },
  { date: "2025-01-08", uptime: 96.5, disconnects: 4, avgResponseTime: 48, stability: 89 },
  { date: "2025-01-09", uptime: 98.9, disconnects: 2, avgResponseTime: 35, stability: 96 },
  { date: "2025-01-10", uptime: 99.5, disconnects: 1, avgResponseTime: 32, stability: 99 }
];

export const mockUptimeSegments = [
  {
    start: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: "connected" as const,
    duration: 3600,
    agent: "PC-001"
  },
  {
    start: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: "disconnected" as const,
    duration: 1800,
    agent: "PC-002"
  },
  {
    start: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
    status: "connected" as const,
    duration: 1800,
    agent: "PC-003"
  }
];

export const mockAdvancedReports = {
  date: new Date().toISOString().split('T')[0],
  totalDisconnects: 15,
  peakHour: "14:00",
  peakCount: 5,
  hourlyData: Array.from({ length: 24 }, (_, i) => ({
    hour: i.toString().padStart(2, '0'),
    formattedHour: `${i.toString().padStart(2, '0')}:00`,
    disconnections: Math.floor(Math.random() * 6)
  })),
  agentData: [
    { agent: 'OFFICE-PC-001', disconnections: 8, percentage: 53.3 },
    { agent: 'OFFICE-PC-002', disconnections: 4, percentage: 26.7 },
    { agent: 'OFFICE-PC-003', disconnections: 3, percentage: 20.0 }
  ]
};
