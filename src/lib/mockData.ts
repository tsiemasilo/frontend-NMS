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