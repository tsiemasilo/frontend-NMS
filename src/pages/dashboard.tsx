import { useState } from 'react';
import { Sidebar } from "@/components/sidebar";
import { StatsOverview } from "@/components/stats-overview";
import { AgentGrid } from "@/components/agent-grid";
import { AgentDetailsModal } from "@/components/agent-details-modal";
import { ConfigModal } from "@/components/config-modal";
import { NetworkTopology } from "@/components/network-topology";
import { AdvancedReports } from "@/components/advanced-reports";
import { HistoryTimeline } from "@/components/history-timeline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Settings, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { mockAgents, mockStats, mockDatabaseStats } from "@/lib/mockData";

interface Agent {
  id: number;
  hostname: string;
  status: string;
  lastSeen: Date;
  platform: string;
  ip: string;
  userInfo: string;
  connectionType: string;
  adapterName: string;
  adapterStatus: string;
  allAdapters: Array<{
    name: string;
    connectionId: string;
    type: string;
    status: string;
  }>;
  connectivityDetails: {
    router: boolean;
    target: boolean;
    internet: boolean;
  };
}

// Fast animation settings for responsive feel
const fastTransition = { duration: 0.15, ease: "easeOut" };
const staggerDelay = 0.02;

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAgentDetails, setShowAgentDetails] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [isTabLoading, setIsTabLoading] = useState(false);
  
  // Use mock data instead of API calls
  const agents = mockAgents;
  const stats = mockStats;
  const dbStats = mockDatabaseStats;
  const isConnected = true; // Mock connection status

  // Generate working hours peak hour data for disconnections using mock data
  const generateWorkingHoursData = () => {
    // Generate hourly breakdown for working hours (7 AM to 5 PM)
    const hourlyData = [];
    for (let hour = 7; hour <= 17; hour++) {
      const hourString = `${hour.toString().padStart(2, '0')}:00`;
      let disconnections = 0;
      
      // Mock disconnection patterns
      if (hour === 8) disconnections = 1; // 8:15 AM
      if (hour === 10) disconnections = 1; // 10:45 AM  
      if (hour === 13) disconnections = 1; // 1:30 PM
      if (hour === 15) disconnections = 1; // 3:15 PM
      
      hourlyData.push({
        hour: hourString,
        disconnections: disconnections,
        isPeakHour: disconnections > 0
      });
    }
    
    return hourlyData;
  };

  // Generate agent-based working hours data
  const generateAgentWorkingHoursData = () => {
    return agents.map((agent: Agent) => ({
      name: agent.hostname,
      disconnections: Math.floor(Math.random() * 5), // Mock disconnections
      status: agent.status,
      isPeakAgent: Math.random() > 0.7
    }));
  };

  // Mock handlers for demo purposes
  const handleExportData = () => {
    const dataToExport = {
      agents,
      stats,
      dbStats,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `network-monitoring-demo-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBackupDatabase = () => {
    // Mock backup functionality
    console.log('Demo: Database backup would be created');
    alert('Demo: Database backup functionality (not connected to real database)');
  };

  const handleClearEvents = () => {
    if (confirm('Are you sure you want to clear all event data? (Demo mode - no real data will be affected)')) {
      console.log('Demo: Events would be cleared');
      alert('Demo: Events cleared (no real data affected)');
    }
  };

  const handleRefresh = () => {
    console.log('Demo: Data refreshed');
    // In demo mode, just simulate refresh
  };

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowAgentDetails(true);
  };

  const handleExportAll = () => {
    handleExportData();
  };

  const handleTabChange = (tab: string) => {
    setIsTabLoading(true);
    
    // Simulate loading delay for smooth transition
    setTimeout(() => {
      setActiveTab(tab);
      setIsTabLoading(false);
    }, 150);
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Network Monitoring Dashboard (Demo)</h2>
              <p className="text-slate-600 mt-1">Demo version with sample data - deploy agents to see real connectivity status</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </Badge>
              
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              
              <Button onClick={() => setShowConfig(true)} variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
          {/* Tab Header */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            <h2 className="text-2xl font-bold text-slate-900 capitalize">{activeTab}</h2>
          </motion.div>

          {/* Loading Animation */}
          {isTabLoading && (
            <motion.div 
              className="flex items-center justify-center h-64"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <motion.div
                    className="w-16 h-16 border-4 border-blue-200 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 0.4, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                <motion.p 
                  className="text-slate-600 font-medium"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Loading {activeTab}...
                </motion.p>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {!isTabLoading && activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                className="space-y-8"
                initial={{ opacity: 0, x: 30, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <motion.div 
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.02, duration: 0.15 }}
                >
                  <h3 className="font-semibold text-blue-900">Dashboard View</h3>
                  <p className="text-blue-700 text-sm">Network overview with stats and all agents</p>
                </motion.div>
                
                {/* Stats Overview */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04, duration: 0.15 }}
                >
                  {stats && <StatsOverview stats={stats} />}
                </motion.div>

                {/* Agent Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06, duration: 0.15 }}
                >
                  <AgentGrid 
                    agents={agents}
                    onAgentClick={handleAgentClick}
                    onExport={handleExportAll}
                  />
                </motion.div>
              </motion.div>
            )}

            {!isTabLoading && activeTab === 'agents' && (
              <motion.div 
                key="agents"
                className="space-y-8"
                initial={{ opacity: 0, x: 30, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.98 }}
                transition={fastTransition}
              >
                <motion.div 
                  className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: staggerDelay, ...fastTransition }}
                >
                  <h3 className="font-semibold text-green-900">Agents Management</h3>
                  <p className="text-green-700 text-sm">Dedicated view for agent monitoring and management</p>
                </motion.div>
                <motion.div 
                  className="bg-white rounded-lg p-6 shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: staggerDelay * 2, ...fastTransition }}
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">All Agents</h3>
                  <AgentGrid 
                    agents={agents}
                    onAgentClick={handleAgentClick}
                    onExport={handleExportAll}
                  />
                </motion.div>
              </motion.div>
            )}

            {!isTabLoading && activeTab === 'topology' && (
              <motion.div 
                key="topology"
                className="space-y-8"
                initial={{ opacity: 0, x: 30, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.98 }}
                transition={fastTransition}
              >
                <motion.div 
                  className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: staggerDelay, ...fastTransition }}
                >
                  <h3 className="font-semibold text-cyan-900">Network Topology</h3>
                  <p className="text-cyan-700 text-sm">Interactive visualization of your network infrastructure and agent connections</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: staggerDelay * 2, ...fastTransition }}
                >
                  <NetworkTopology />
                </motion.div>
              </motion.div>
            )}

            {!isTabLoading && activeTab === 'history' && (
              <motion.div 
                key="history"
                className="space-y-8"
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <motion.div 
                  className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <h3 className="font-semibold text-purple-900">Historical Timeline Analysis</h3>
                  <p className="text-purple-700 text-sm">Interactive timeline view with event tracking, trend analysis, and uptime visualization</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <HistoryTimeline />
                </motion.div>
              </motion.div>
            )}

            {!isTabLoading && activeTab === 'reports' && (
              <motion.div 
                key="reports"
                className="space-y-8"
                initial={{ opacity: 0, x: 30, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.98 }}
                transition={fastTransition}
              >
                <motion.div 
                  className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: staggerDelay, ...fastTransition }}
                >
                  <h3 className="font-semibold text-orange-900">Advanced Reports & Analytics</h3>
                  <p className="text-orange-700 text-sm">Comprehensive LAN disconnection reports with AI-powered insights and visual analytics</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: staggerDelay * 2, ...fastTransition }}
                >
                  <AdvancedReports />
                </motion.div>
              </motion.div>
            )}

            {!isTabLoading && activeTab === 'database' && (
              <motion.div 
                key="database"
                className="space-y-8"
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <motion.div 
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <h3 className="font-semibold text-blue-900">Database Management</h3>
                  <p className="text-blue-700 text-sm">Configure and monitor PostgreSQL database settings and data</p>
                </motion.div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Database Status */}
                  <motion.div 
                    className="bg-white rounded-lg p-6 shadow-sm border"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Database Status</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="font-medium text-green-800">Connection Status</span>
                        </div>
                        <span className="text-green-600 font-medium">Connected</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-700">Database Type</div>
                          <div className="text-gray-600">PostgreSQL</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-700">Tables</div>
                          <div className="text-gray-600">3 (agents, events, config)</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Database Statistics */}
                  <motion.div 
                    className="bg-white rounded-lg p-6 shadow-sm border"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Data Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium text-blue-800">Total Agents</span>
                        <span className="text-blue-600 font-bold">{agents.length}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="font-medium text-purple-800">Total Events</span>
                        <span className="text-purple-600 font-bold">{dbStats?.totalEvents ?? 'Loading...'}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="font-medium text-orange-800">Data Retention</span>
                        <span className="text-orange-600 font-bold">Unlimited</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Database Operations */}
                <motion.div 
                  className="bg-white rounded-lg p-6 shadow-sm border"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Database Operations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 border border-slate-200 rounded-lg">
                      <h4 className="font-medium text-slate-900 mb-2">Export Data</h4>
                      <p className="text-sm text-slate-600 mb-3">Export all agent data and events to Excel format</p>
                      <Button variant="outline" size="sm" className="w-full" onClick={handleExportData}>
                        Export to Excel
                      </Button>
                    </div>
                    
                    <div className="p-4 border border-slate-200 rounded-lg">
                      <h4 className="font-medium text-slate-900 mb-2">Backup Database</h4>
                      <p className="text-sm text-slate-600 mb-3">Create a full backup of the database</p>
                      <Button variant="outline" size="sm" className="w-full" onClick={handleBackupDatabase}>
                        Create Backup
                      </Button>
                    </div>
                    
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <h4 className="font-medium text-red-900 mb-2">Clear Data</h4>
                      <p className="text-sm text-red-600 mb-3">Remove all historical data (keep agents)</p>
                      <Button variant="destructive" size="sm" className="w-full" onClick={handleClearEvents}>
                        Clear Events
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {/* Database Schema */}
                <motion.div 
                  className="bg-white rounded-lg p-6 shadow-sm border"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Database Schema</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">agents</h4>
                      <p className="text-sm text-gray-600 mb-2">Stores agent information and connection details</p>
                      <div className="text-xs text-gray-500 font-mono">
                        id, hostname, status, platform, last_seen, ip, username, connection_type, adapter_name, health_score
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">agent_events</h4>
                      <p className="text-sm text-gray-600 mb-2">Stores connection/disconnection events and timestamps</p>
                      <div className="text-xs text-gray-500 font-mono">
                        id, hostname, status, timestamp, duration, connection_type, adapter_name
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">configuration</h4>
                      <p className="text-sm text-gray-600 mb-2">Stores system configuration and monitoring settings</p>
                      <div className="text-xs text-gray-500 font-mono">
                        id, dashboard_ip, ping_ip, interval_ms
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {!isTabLoading && activeTab === 'settings' && (
              <motion.div 
                key="settings"
                className="space-y-8"
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <motion.div 
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <h3 className="font-semibold text-gray-900">System Settings</h3>
                  <p className="text-gray-700 text-sm">Configure dashboard and monitoring parameters</p>
                </motion.div>
                <motion.div 
                  className="bg-white rounded-lg p-6 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">System Settings</h3>
                  <div className="space-y-6">
                    {[
                      { 
                        title: "Dashboard Configuration", 
                        desc: "Configure dashboard server settings and monitoring parameters", 
                        buttons: [{ text: "Open Configuration", action: () => setShowConfig(true), disabled: false }] 
                      },
                      { 
                        title: "Agent Setup", 
                        desc: "Download agent files for deployment on monitored computers", 
                        buttons: [
                          { text: "Download Agent Script", disabled: false }, 
                          { text: "View Setup Guide", disabled: false }
                        ] 
                      },
                      { 
                        title: "Working Hours", 
                        desc: "Currently monitoring disconnections from 07:00 to 17:00", 
                        buttons: [{ text: "Customize Hours (Coming Soon)", disabled: true }] 
                      }
                    ].map((item, index) => (
                      <motion.div 
                        key={item.title}
                        className="border border-slate-200 rounded-lg p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                      >
                        <h4 className="font-medium text-slate-900 mb-2">{item.title}</h4>
                        <p className="text-sm text-slate-600 mb-3">{item.desc}</p>
                        <div className="flex space-x-2">
                          {item.buttons.map((button, btnIndex) => (
                            <Button 
                              key={btnIndex}
                              variant="outline" 
                              size="sm" 
                              onClick={(button as any).action}
                              disabled={button.disabled}
                            >
                              {button.text}
                            </Button>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <AgentDetailsModal
        agent={selectedAgent}
        isOpen={showAgentDetails}
        onClose={() => {
          setShowAgentDetails(false);
          setSelectedAgent(null);
        }}
      />

      <ConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
      />
    </div>
  );
}
